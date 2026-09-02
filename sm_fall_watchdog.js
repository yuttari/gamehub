// 看门狗：真实 loop() 跑局，抓"原地蹦跳 / 悬空冻结"类卡死 bug。
//
// 判定（关键——不能只看"处于 fall 状态很久"）：
//   板真的落在别的螺丝头或别的板顶面上，是合法静止，不算卡死。
//   只有【没有任何支撑】+【位置几乎不动】同时成立，才是卡死：
//     · 无螺丝接触   restContacts(i).length === 0
//     · 无板托       ledgeTopHolding(i) === 1e9（重心不在任何下层板接触区内）
//     · 位置冻结     最近 WINDOW 帧内 live 顶边 y0 的波动 < 3px（含原地蹦跳）
//
// 用法: node sm_fall_watchdog.js [index.html路径] [random|targeted|all] [每关随机局数]
const fs=require('fs');
const FILE=process.argv[2]||'public/games/screw-master/index.html';
const MODE=process.argv[3]||'targeted';        // random | targeted | all
const GAMES_PER_LEVEL=Number(process.argv[4]||2);

const WINDOW=240;        // 4 秒 @60fps 的观察窗
const MOVE_EPS=3;        // 窗内位移阈值(px)：小于它视为"没在动"
const SUPPORT_1E9=1e9;

global.window={};
require('./public/games/screw-master/levels.js');
const html=fs.readFileSync(FILE,'utf8');
let code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
code=code.replace(/^\s*\(function\(\)\{/,'').replace(/\}\)\(\);\s*$/,'');
code+='\nglobal.__api={loadLevel,loop,updateDroops,accessible,restContacts,bboxOf,curPoly,'+
      'ledgeTopHolding:(typeof ledgeTopHolding!=="undefined")?ledgeTopHolding:null,'+
      'belowSupportY,belowSupportX:(typeof belowSupportX!=="undefined")?belowSupportX:null,parkDyRaw:(typeof parkDyRaw!=="undefined")?parkDyRaw:null,'+
      'get plates(){return plates},get falling(){return falling},get screwAt(){return screwAt}};';
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

/* ---- 单调时钟：loop() 里 dt=(ts-last)/1000，时钟倒流会算出负 dt（每帧 -2495px 的假掉飞）。
       所有场景共用一条永不回退的时间线。 ---- */
let CLOCK=1000;
function step(){
  CLOCK+=16; G.loop(CLOCK);
}

/* ---- 卡死探测 ---- */
function makeWatch(){
  const hist=new Map();          // plate -> 最近 WINDOW 帧的 y0
  let bad=null;
  return {
    frame(){
      for(const p of G.plates){
        if(!p.fall){ hist.delete(p); continue; }
        const bi=G.plates.indexOf(p);
        const y0=G.bboxOf(G.curPoly(p)).y0;
        let h=hist.get(p); if(!h){ h=[]; hist.set(p,h); }
        h.push(y0); if(h.length>WINDOW) h.shift();
        if(h.length<WINDOW) continue;
        const span=Math.max(...h)-Math.min(...h);
        if(span>=MOVE_EPS){ continue; }                    // 还在动 -> 正常
        // 位置冻结了，看有没有真实支撑；有支撑就是合法静止
        let cs=[], ledge=SUPPORT_1E9;
        try{ cs=G.restContacts(bi)||[]; }catch(e){ cs=[]; }
        if(G.ledgeTopHolding){
          try{ ledge=G.ledgeTopHolding(bi); }catch(e){ ledge=SUPPORT_1E9; }
        }else{
          /* 旧版没有 ledgeTopHolding，它的规则是"和下层板有重叠就算被托住"。
             按旧语义兜底，否则会把旧版合法搭在下层板上的板误判成卡死。 */
          const pp=G.curPoly(p);
          let held=false;
          for(let s=0;s<G.plates.length;s++){
            const q=G.plates[s];
            if(s===bi||q.gone||q.fall||q.layer>=p.layer) continue;
            const a=G.bboxOf(pp), b=G.bboxOf(G.curPoly(q));
            if(a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0){ held=true; break; }
          }
          if(held) continue;
        }
        if(cs.length>0) continue;                          // 压在螺丝头上 -> 合法
        if(ledge!==SUPPORT_1E9) continue;                  // 坐在下层板顶面上 -> 合法
        if(!bad){
          const snap={plate:bi,span:+span.toFixed(2),y0:+y0.toFixed(1),
                      landed:p.fall.landed, tip:p.fall.tip,
                      dy:+p.fall.dy.toFixed(1), rot:+p.fall.rot.toFixed(2),
                      vy:+p.fall.vy.toFixed(1), inFalling:G.falling.indexOf(p)>=0};
          try{
            snap.lt=G.belowSupportY(bi,0);
            snap.sx=G.belowSupportX?G.belowSupportX(bi):'n/a';
            snap.ledge=G.ledgeTopHolding?G.ledgeTopHolding(bi):'n/a';
            snap.parkRaw=(snap.lt===1e9)?'n/a':+G.parkDyRaw(bi,snap.lt,snap.sx).toFixed(2);
          }catch(e){ snap.probe='ERR:'+e.message; }
          bad=snap;
        }
      }
    },
    /* 拔掉一颗螺丝后世界变了：板可能刚好失去支撑。此时"过去 WINDOW 帧没动"不再是卡死的证据
       （它之前可能是合法地停在刚被拔掉的那颗螺丝上），必须清空历史重新计时，
       否则会在"拔掉支撑螺丝"的那一帧误报。 */
    reset(){ hist.clear(); },
    get bad(){ return bad; }
  };
}
function runFrames(maxFrames){
  const w=makeWatch();
  for(let f=0; f<maxFrames; f++){
    step();
    w.frame();
    if(w.bad) return {bad:w.bad, frame:f};
  }
  return {bad:null, frame:maxFrames};
}
let violations=0, games=0, worstSpan=0;
function report(li,label,r){
  if(r.bad){
    violations++;
    console.log('❌ L'+(li+1)+' '+label+' 板'+r.bad.plate+' 冻结（窗内位移 '+r.bad.span+
      'px, y0='+r.bad.y0+' landed='+r.bad.landed+' tip='+r.bad.tip+
      ' dy='+r.bad.dy+' vy='+r.bad.vy+' rot='+r.bad.rot+
      ' inFalling='+r.bad.inFalling+' belowSupportY='+r.bad.lt+' 支撑列x='+r.bad.sx+
      ' 板托='+r.bad.ledge+' 停靠raw='+r.bad.parkRaw+
      (r.bad.probe?' '+r.bad.probe:'')+'）@帧'+r.frame);
  }
}

/* ---- 定向场景：对每块板枚举视频里的两类操作序列 ---- */
function runTargeted(li){
  const nPlates=(G.loadLevel(li), G.plates.length);
  for(let pi=0; pi<nPlates; pi++){
    for(const mode of ['both','swing']){
      G.loadLevel(li);
      const pins=G.plates[pi].pins.slice();
      if(!pins.length) continue;
      games++;
      if(mode==='both'){
        for(const h of pins) G.screwAt[h]=false;
        G.updateDroops && G.updateDroops();
        report(li,'板'+pi+'一次拔光', runFrames(2400));
      }else{
        // 先拔第一颗，让它荡 400 帧搭到邻板上稳住，再拔掉剩余的（视频里的操作序列）
        G.screwAt[pins[0]]=false; G.updateDroops && G.updateDroops();
        for(let k=0;k<400;k++) step();
        for(const h of pins) G.screwAt[h]=false;
        G.updateDroops && G.updateDroops();
        report(li,'板'+pi+'先荡再拔', runFrames(2400));
      }
    }
  }
}
/* ---- 随机局 ---- */
function runRandom(li,seed0){
  for(let r=1;r<=GAMES_PER_LEVEL;r++){
    const seed=seed0+r*7919+li*131+3;
    let s=seed;
    const rnd=()=>{ s=(s*1103515245+12345)%2147483648; return s/2147483648; };
    G.loadLevel(li); games++;
    const NH=G.screwAt.length;
    const w=makeWatch(); let bad=null, badFrame=-1;
    for(let f=0; f<6000; f++){
      if(f%20===0){
        const cands=[];
        for(let h=0;h<NH;h++) if(G.accessible(h)) cands.push(h);
        if(cands.length){
          G.screwAt[cands[Math.floor(rnd()*cands.length)]]=false;
          w.reset();                       // 世界变了，旧历史作废
        }
        G.updateDroops && G.updateDroops();
      }
      step(); w.frame();
      if(w.bad && !bad){ bad=w.bad; badFrame=f; break; }
      if(G.plates.every(p=>p.gone)) break;
    }
    report(li,'seed'+seed, {bad, frame:badFrame});
  }
}

if(MODE==='random'||MODE==='all'){
  for(let li=0; li<global.window.SCREW_LEVELS.length; li++) runRandom(li,3);
}
if(MODE==='targeted'||MODE==='all'){
  for(let li=0; li<global.window.SCREW_LEVELS.length; li++) runTargeted(li);
}
console.log('----');
console.log('模式:'+MODE+'  场景数:'+games+'  卡死:'+violations);
process.exit(violations?1:0);
