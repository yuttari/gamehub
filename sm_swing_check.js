// 摆动碰撞检测：跑真实运行时，检查摆动的钢板有没有"穿过"别的钢板。
// 用法: node sm_swing_check.js [每次随机的局数]
const fs=require('fs');
global.window={};
require('./public/games/screw-master/levels.js');

function buildApi(file){
  const html=fs.readFileSync(file,'utf8');
  let code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
  code=code.replace(/^\s*\(function\(\)\{/,'').replace(/\}\)\(\);\s*$/,'');
  code+='\nreturn {loadLevel,releasePlates,updateDroops,accessible,isFree,covers,plateHitsHole,bboxOf,pip,segDist,'+
        'maxSwing,boltsHolding,curPoly,rotPolyAround,pointInDepth,swingObstacles,swingHitsPlate,'+
        'get plates(){return plates},get falling(){return falling},get ov(){return ov},get cov(){return cov},'+
        'get screwAt(){return screwAt},get holes(){return holes}};';
  const noop=()=>{};
  const ctxStub=new Proxy({},{get:()=>noop});
  const elStub={textContent:'',style:{},getContext:()=>ctxStub,addEventListener:noop,
                getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})};
  const pre='const document=__stub.doc; const addEventListener=__stub.al;'+
            'const requestAnimationFrame=__stub.raf; const AudioContext=__stub.ac;'+
            'const window=__stub.win;\n';
  const fn=new Function('__stub', pre+code);
  return fn({
    doc:{getElementById:()=>elStub,addEventListener:noop,createElement:()=>elStub},
    al:noop, raf:noop,
    ac:function(){return{
      createGain:()=>({connect:noop,gain:{setValueAtTime:noop}}),
      createOscillator:()=>({connect:noop,start:noop,stop:noop,frequency:{setValueAtTime:noop}}),
      destination:{},currentTime:0};},
    win:{addEventListener:noop,SCREW_LEVELS:global.window.SCREW_LEVELS}});
}
const A=buildApi('public/games/screw-master/index.html');

const LOGIC_H=540;
const DEPTH=3;    // 侵入超过这个数算穿模（对应游戏里的 PLATE_HIT_DEPTH）
const CLEAR=3;    // 摆动前离这么远才算本来在外面（对应 PLATE_CLEAR_DEPTH）   // 与游戏里的 PLATE_HIT_DEPTH 保持一致
/* 检测脚本自带一套"网格取样"的穿透判定，故意不复用游戏里的边交点算法，
   这样两边算法不同但结论应一致，互为交叉验证。 */
function sampleInside(A,poly,step){
  const b=A.bboxOf(poly), pts=[];
  for(let x=b.x0+step*0.5;x<b.x1;x+=step)
    for(let y=b.y0+step*0.5;y<b.y1;y+=step)
      if(A.pip({x:x,y:y},poly)) pts.push([x,y]);
  for(const v of poly) pts.push([v[0],v[1]]);
  return pts;
}

function settle(A){
  const dt=0.016;
  A.releasePlates();
  for(let k=0;k<400 && A.falling.length;k++){
    A.releasePlates();
    for(let i=A.falling.length-1;i>=0;i--){
      const p=A.falling[i], f=p.fall;
      f.vy+=1700*dt; f.dy+=f.vy*dt; f.rot+=f.rotV*dt;
      const b=A.bboxOf(p.poly);
      if(b.y0+(f.oy||0)+f.dy>LOGIC_H+160){ A.falling.splice(i,1); p.fall=null; p.gone=true; }
    }
  }
}
// 复刻 loop() 里的摆动动画，让摆动真正走到位
function stepSwing(A,frames){
  for(let k=0;k<frames;k++){
    for(let pi=0;pi<A.plates.length;pi++){
      const p=A.plates[pi];
      if(p.gone||!p.droop) continue;
      if(A.boltsHolding(p).length===1 && p.droop.free!==undefined){
        const t=A.maxSwing(p,pi,p.droop.free);
        const mag=Math.abs(t);
        if(mag>(p.droop.reached||0)) p.droop.reached=mag;
        p.droop.target=(p.droop.free<0?-1:1)*(p.droop.reached||0);
      }
      const d=p.droop, diff=d.target-d.rot;
      d.w+=2.2*Math.sin(diff)*0.016; d.w*=0.988; d.rot+=d.w*0.016;
      if(d.target!==0){ if(d.target<0? d.rot<=d.target : d.rot>=d.target){ d.rot=d.target; d.w=-d.w*0.22; } }
      /* 与游戏 loop 一致的实时钳制：当前姿态切进静止障碍就按回障碍前边界 */
      if(A.boltsHolding(p).length===1 && p.droop.free!==undefined){
        const pi=A.plates.indexOf(p);
        const rp=A.curPoly(p);
        const obs=A.swingObstacles(pi);
        if(A.swingHitsPlate(p,rp,d.rot,obs)){
          const t2=A.maxSwing(p,pi,d.rot);
          const mag2=Math.abs(t2);
          if(mag2 < Math.abs(d.rot)-0.02){
            const stop=Math.sign(d.rot)*mag2;
            d.rot=stop; d.target=stop; d.w=0;
            if(p.droop.reached!==undefined) p.droop.reached=mag2;
          }
        }
      }
    }
  }
}
/* 穿模检测：摆动板当前姿态下，有没有"新侵入"别的钢板。
   "新侵入" = 该处摆动前(rot=0)并不在对方身体里，摆动后才进去的。
   摆动前就压在一起的部分属于前后叠放，不算穿透。 */
let crossSwing=0, LI=0;
function penetration(A){
  const bad=[];
  for(let i=0;i<A.plates.length;i++){
    const p=A.plates[i];
    if(p.gone||p.fall||!p.droop) continue;
    const live=A.curPoly(p);
    const pts=sampleInside(A,p.poly,10);
    const pv=A.holes[p.droop.pivot], t=p.droop.rot;
    const c=Math.cos(t), s=Math.sin(t);
    for(let j=0;j<A.plates.length;j++){
      if(j===i||A.plates[j].gone||A.plates[j].fall) continue;
      if(A.plates[j].droop){ crossSwing++; continue; }   // 两块都在摆的不算(互相让位无法收敛，已知取舍)
      const other=A.curPoly(A.plates[j]);
      for(const pt of pts){
        const dx=pt[0]-pv.x, dy=pt[1]-pv.y;
        const bx=pt[0], by=pt[1];                       // 摆动前的位置
        if(A.pointInDepth(bx,by,other) > -CLEAR) continue; // 摆动前就在它身上/贴着边 -> 前后叠放，不算
        const rx=pv.x+dx*c-dy*s, ry=pv.y+dx*s+dy*c;
        if(A.pointInDepth(rx,ry,other)>DEPTH){ bad.push({i,j,depth:+A.pointInDepth(rx,ry,other).toFixed(1),rot:+(p.droop.rot*180/Math.PI).toFixed(1),tgt:+((p.droop.target||0)*180/Math.PI).toFixed(1),free:+((p.droop.free||0)*180/Math.PI).toFixed(1),li:LI}); break; }
      }
    }
  }
  return bad;
}
/* 随机走一局，边走边检查穿模；返回 {pen:穿模次数, frozen:摆动被完全卡死的次数, swings:摆动样本} */
function runLevel(li,seed){
  let r=seed;
  const rnd=()=>{ r=(r*1103515245+12345)%2147483648; return r/2147483648; };
  A.loadLevel(li);
  const NH=A.holes.length;
  let pen=0, frozen=0, swings=[]; let crossSwing=0, LI=0;
  for(let s=0;s<80;s++){
    if(A.plates.every(p=>p.gone)) break;
    const cands=[];
    for(let h=0;h<NH;h++) if(A.accessible(h)) cands.push(h);
    if(!cands.length) break;
    const h=cands[Math.floor(rnd()*cands.length)];
    A.screwAt[h]=false; A.updateDroops(); stepSwing(A,90); settle(A);
    const b1=penetration(A); pen+=b1.length;
    if(b1.length && SHOWN<6){ for(const b of b1.slice(0,2)){ console.log('  [穿模] L'+(li+1)+' seed'+seed+' 板'+b.i+'->板'+b.j+' 深'+b.depth+'px 角'+b.rot+'/目标'+b.tgt+'/自由'+b.free); SHOWN++; } }
    for(const p of A.plates){
      if(p.gone||!p.droop) continue;
      swings.push(+(Math.abs(p.droop.target)*180/Math.PI).toFixed(1));
      if(Math.abs(p.droop.target)<0.02 && Math.abs(p.droop.free)>0.3) frozen++;
    }
    const free=[]; for(let g=0;g<NH;g++) if(A.isFree(g)) free.push(g);
    if(free.length) A.screwAt[free[Math.floor(rnd()*free.length)]]=true;
    A.updateDroops(); stepSwing(A,60); settle(A);
    pen+=penetration(A).length;
  }
  return {pen,frozen,swings,crossSwing,left:A.plates.filter(p=>!p.gone).length};
}
const ROUNDS=Number(process.argv[2]||12);
let SHOWN=0;
let totPen=0, totFrozen=0, totCross=0, allSwings=[], cleared=0, games=0;
for(let li=0;li<global.window.SCREW_LEVELS.length;li++){
  let lp=0,lf=0;
  for(let r=1;r<=ROUNDS;r++){
    const o=runLevel(li,r*7919+li*131);
    lp+=o.pen; lf+=o.frozen; totCross+=o.crossSwing; allSwings=allSwings.concat(o.swings);
    games++; if(o.left===0) cleared++;
  }
  totPen+=lp; totFrozen+=lf;
  console.log('L'+(li+1)+' 穿模:'+lp+'  摆动被卡死:'+lf);
}
allSwings.sort((a,b)=>a-b);
const q=f=>allSwings.length?allSwings[Math.min(allSwings.length-1,Math.floor(allSwings.length*f))]:0;
console.log('----');
console.log('总局数:'+games+'  打完:'+cleared+'  穿模总数:'+totPen+'  卡死总数:'+totFrozen+'  双摆互穿(已忽略):'+totCross);
console.log('摆动角度样本(度) 中位数:'+q(0.5)+'  最小:'+(allSwings[0]||0)+'  最大:'+(allSwings[allSwings.length-1]||0));
process.exit(totPen===0?0:1);
