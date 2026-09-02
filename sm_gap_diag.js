// 诊断：哪些钢板一拔螺丝就被邻板卡在原地，以及它们和邻板的初始间隙是多少
const fs=require('fs');
global.window={};
require('./public/games/screw-master/levels.js');
const html=fs.readFileSync('public/games/screw-master/index.html','utf8');
let code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
code=code.replace(/^\s*\(function\(\)\{/,'').replace(/\}\)\(\);\s*$/,'');
code+='\nreturn {loadLevel,updateDroops,accessible,isFree,bboxOf,pip,segDist,maxSwing,boltsHolding,curPoly,'+
      'rotPolyAround,pointInDepth,swingObstacles,swingHitsPlate,'+
      'get plates(){return plates},get falling(){return falling},get screwAt(){return screwAt},'+
      'get holes(){return holes}};';
const noop=()=>{};
const ctxStub=new Proxy({},{get:()=>noop});
const elStub={textContent:'',style:{},getContext:()=>ctxStub,addEventListener:noop,
              getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})};
const pre='const document=__stub.doc; const addEventListener=__stub.al;'+
          'const requestAnimationFrame=__stub.raf; const AudioContext=__stub.ac;'+
          'const window=__stub.win;\n';
const A=(new Function('__stub',pre+code))({
  doc:{getElementById:()=>elStub,addEventListener:noop,createElement:()=>elStub},
  al:noop, raf:noop,
  ac:function(){return{createGain:()=>({connect:noop,gain:{setValueAtTime:noop}}),
    createOscillator:()=>({connect:noop,start:noop,stop:noop,frequency:{setValueAtTime:noop}}),
    destination:{},currentTime:0};},
  win:{addEventListener:noop,SCREW_LEVELS:global.window.SCREW_LEVELS}});

// 两块板初始姿态下的"最贴近距离"：正数=还隔着这么远，负数=已经互相压着这么深
function gap(A,polyI,polyJ){
  let best=1e9;
  for(const v of polyI){ const d=A.pointInDepth(v[0],v[1],polyJ); if(Math.abs(d)<Math.abs(best)) best=d; }
  for(const v of polyJ){ const d=A.pointInDepth(v[0],v[1],polyI); if(Math.abs(d)<Math.abs(best)) best=d; }
  return best;
}
for(let li=0;li<global.window.SCREW_LEVELS.length;li++){
  A.loadLevel(li);
  const rows=[];
  for(let i=0;i<A.plates.length;i++){
    const p=A.plates[i];
    for(const pivot of p.pins){
      // 假装只剩 pivot 这一颗螺丝，看它能摆到哪
      const saved=p.pins.map(h=>A.screwAt[h]);
      for(const h of p.pins) A.screwAt[h]=(h===pivot);
      A.updateDroops();
      const d=p.droop;
      if(!d){ for(let k=0;k<p.pins.length;k++) A.screwAt[p.pins[k]]=saved[k]; continue; }
      const deg=Math.abs(d.target)*180/Math.PI, freeDeg=Math.abs(d.free)*180/Math.PI;
      if(deg<1 && freeDeg>17){
        // 找出是谁挡的，以及初始离它多远
        let who=[];
        for(let j=0;j<A.plates.length;j++){
          if(j===i||A.plates[j].gone) continue;
          const g=gap(A,A.curPoly(p),A.curPoly(A.plates[j]));
          if(Math.abs(g)<40) who.push('板'+j+'(层'+A.plates[j].layer+',间隙'+g.toFixed(1)+')');
        }
        rows.push('  板'+i+'(层'+p.layer+') 绕螺丝'+pivot+' 自由角'+freeDeg.toFixed(0)+
                  '° 却停在'+deg.toFixed(1)+'°  挨着: '+who.join(' '));
      }
      for(let k=0;k<p.pins.length;k++) A.screwAt[p.pins[k]]=saved[k];
      A.updateDroops();
    }
  }
  if(rows.length){ console.log('L'+(li+1)+' 一拔螺丝就贴住不动的情况:'); rows.forEach(r=>console.log(r)); }
}
console.log('---- 诊断结束 ----');
