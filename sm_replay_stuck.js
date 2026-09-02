// 回放指定随机局，逐帧打印冻住那块板的现场
// 用法: node sm_replay_stuck.js <li> <seed> [frames]
const fs=require('fs');
const LI=Number(process.argv[2]);
const SEED=Number(process.argv[3]);
const MAXF=Number(process.argv[4]||700);
global.window={};
require('./public/games/screw-master/levels.js');
const html=fs.readFileSync('public/games/screw-master/index.html','utf8');
let code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
code=code.replace(/^\s*\(function\(\)\{/,'').replace(/\}\)\(\);\s*$/,'');
code+='\nglobal.__api={loadLevel,loop,updateDroops,accessible,restContacts,bboxOf,curPoly,'+
      'belowSupportY,belowSupportX,parkDyRaw,surfaceYAt,'+
      'ledgeTopHolding:(typeof ledgeTopHolding!=="undefined")?ledgeTopHolding:null,'+
      'get plates(){return plates},get falling(){return falling},get screwAt(){return screwAt},'+
      'get holes(){return holes}};';
const noop=()=>{};
const magic=new Proxy(function(){},{get:()=>magic,apply:()=>magic});
const ctxStub=new Proxy({},{get:()=>magic});
const elStub={textContent:'',style:{},getContext:()=>ctxStub,addEventListener:noop,
              classList:{add:noop,remove:noop},
              getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})};
global.document={getElementById:()=>elStub,addEventListener:noop,createElement:()=>elStub};
global.addEventListener=noop;
global.window={addEventListener:noop,SCREW_LEVELS:global.window.SCREW_LEVELS};
global.requestAnimationFrame=noop;
global.AudioContext=function(){return{createGain:()=>({connect:noop,gain:{setValueAtTime:noop}}),createOscillator:()=>({connect:noop,start:noop,stop:noop,frequency:{setValueAtTime:noop}}),destination:{},currentTime:0};};
eval(code);
const G=global.__api;

let CLOCK=1000;
const step=()=>{CLOCK+=16;G.loop(CLOCK);};
let s=SEED;
const rnd=()=>{ s=(s*1103515245+12345)%2147483648; return s/2147483648; };
G.loadLevel(LI);
const NH=G.screwAt.length;

// 先跑，找出所有"长时间不动"的板（边跑边判定，和看门狗一致）
const hist=new Map();
const trace=new Map();
const reported=new Set();
for(let f=0; f<MAXF; f++){
  if(f%20===0){
    const cands=[];
    for(let h=0;h<NH;h++) if(G.accessible(h)) cands.push(h);
    if(cands.length) G.screwAt[cands[Math.floor(rnd()*cands.length)]]=false;
    G.updateDroops && G.updateDroops();
  }
  step();
  for(const p of G.plates){
    if(!p.fall){ hist.delete(p); trace.delete(p); continue; }
    const y0=G.bboxOf(G.curPoly(p)).y0;
    let h=hist.get(p); if(!h){h=[];hist.set(p,h);}
    h.push(y0); if(h.length>240) h.shift();
    let t=trace.get(p); if(!t){t=[];trace.set(p,t);}
    const bi=G.plates.indexOf(p);
    let lt=1e9,sx=NaN,raw='n/a',cs=[],ledge=1e9;
    try{ lt=G.belowSupportY(bi,0); sx=G.belowSupportX(bi);
         raw=(lt===1e9)?'n/a':+G.parkDyRaw(bi,lt,sx).toFixed(2);
         cs=G.restContacts(bi); ledge=G.ledgeTopHolding(bi);}catch(e){}
    t.push({f,dy:+p.fall.dy.toFixed(3),vy:+p.fall.vy.toFixed(1),landed:p.fall.landed,
            tip:p.fall.tip,lt:(lt===1e9?'—':Math.round(lt)),sx:(isNaN(sx)?'NaN':Math.round(sx)),
            raw,cs:cs.map(c=>c.h).join('/'),ledge:(ledge===1e9?'—':Math.round(ledge)),
            y0:+y0.toFixed(2)});
    if(t.length>40) t.shift();
    // 与看门狗同判定：连续 240 帧位移 < 3px 且无任何支撑
    if(h.length>=240 && !reported.has(p)){
      const span=Math.max(...h)-Math.min(...h);
      if(span<3 && cs.length===0 && ledge===1e9){
        reported.add(p);
        const bi=G.plates.indexOf(p);
        console.log('=== L'+(LI+1)+' seed'+SEED+' 板'+bi+' 冻结 @帧'+f+
                    '，窗内位移 '+span.toFixed(2)+'px ===');
        console.log('pins='+JSON.stringify(p.pins)+' layer='+p.layer+' type='+p.type+
                    ' 在falling='+(G.falling.indexOf(p)>=0)+' gone='+!!p.gone);
        for(const r of t)
          console.log('  帧'+r.f+' dy='+r.dy+' vy='+r.vy+' landed='+r.landed+' tip='+r.tip+
                      ' y0='+r.y0+' belowSupportY='+r.lt+' 支撑列x='+r.sx+' 停靠raw='+r.raw+
                      ' 接触=['+r.cs+'] 板托='+r.ledge);
      }
    }
  }
}
if(!reported.size) console.log('L'+(LI+1)+' seed'+SEED+': 未发现冻结板（跑 '+MAXF+' 帧）');
