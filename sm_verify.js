// Independent verifier: drives the real runtime physics through a playout solver.
// Exits 0 only when all 8 levels are cleared. Used by the generate->verify loop.
global.window = {};
require('./public/games/screw-master/levels.js');
const fs = require('fs');
const html = fs.readFileSync('public/games/screw-master/index.html','utf8');
let code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
code = code.replace(/^\s*\(function\(\)\{/, '').replace(/\}\)\(\);\s*$/, '');
code += '\nglobal.__api={loadLevel,releasePlates,updateDroops,accessible,isFree,covers,plateHitsHole,bboxOf,get plates(){return plates},get falling(){return falling},get ov(){return ov},get cov(){return cov},get screwAt(){return screwAt},get holes(){return holes}};';
const noop=()=>{};
const ctxStub=new Proxy({},{get:()=>noop});
const elStub={textContent:'',style:{},getContext:()=>ctxStub,addEventListener:noop,getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})};
global.document={getElementById:()=>elStub,addEventListener:noop,createElement:()=>elStub};
global.addEventListener=noop;
global.window={addEventListener:noop,SCREW_LEVELS:global.window.SCREW_LEVELS};
global.requestAnimationFrame=noop;
global.AudioContext=function(){return{createGain:()=>({connect:noop,gain:{setValueAtTime:noop}}),createOscillator:()=>({connect:noop,start:noop,stop:noop,frequency:{setValueAtTime:noop}}),destination:{},currentTime:0};};
eval(code);
const A=global.__api;
const LOGIC_H=540;
function settle(){
  const dt=0.016;
  A.releasePlates();
  for(let k=0;k<400 && A.falling.length;k++){
    A.releasePlates();
    for(let i=A.falling.length-1;i>=0;i--){
      const p=A.falling[i]; const f=p.fall;
      f.vy+=1700*dt; f.dy+=f.vy*dt; f.rot+=f.rotV*dt;
      const b=A.bboxOf(p.poly);
      if(b.y0+(f.oy||0)+f.dy>LOGIC_H+160){ A.falling.splice(i,1); p.fall=null; p.gone=true; }
    }
  }
}
const left=()=>A.plates.filter(p=>!p.gone).length;
function clean(g){
  // Delegate to the real runtime's isFree so insertion legality (incl. a drooped plate's live
  // outline) is identical between the solver and actual play.
  return A.isFree(g);
}
function modelFalls(s){
  const o=A.plates.map(p=>p.gone); let ch=true;
  while(ch){ ch=false;
    for(let i=0;i<A.plates.length;i++){
      if(o[i]) continue;
      if(!A.plates[i].pins.every(h=>!s[h])) continue;
      if(A.cov[i].some(h=>s[h])) continue;
      if(A.ov[i].some(si=>!o[si])) continue;
      o[i]=true; ch=true; } }
  return o;
}
function playout(li, random){
  A.loadLevel(li);
  const NH=A.holes.length, NP=A.plates.length;
  const yBot=A.plates.map(p=>Math.max(...p.poly.map(q=>q[1])));
  const depth=A.holes.map((_,h)=>{ let d=0;
    A.plates.forEach((p,i)=>{ if(p.pins.indexOf(h)>=0) d=Math.max(d,yBot[i]); }); return d; });
  for(let s=0;s<600;s++){
    if(left()===0 && A.falling.length===0) return true;
    const base=modelFalls(A.screwAt);
    const cands=[];
    for(let h=0;h<NH;h++){
      if(!A.accessible(h)) continue;
      const s2=A.screwAt.slice(); s2[h]=false;
      const o2=modelFalls(s2);
      let gain=0; for(let i=0;i<NP;i++) if(o2[i]&&!base[i]) gain++;
      let loose=0;
      A.plates.forEach(p=>{ if(!p.gone && p.pins.indexOf(h)>=0 && p.pins.every(x=>!s2[x])) loose++; });
      const free=[]; for(let g=0;g<NH;g++) if(!s2[g] && clean(g)) free.push(g);
      if(!free.length) continue;
      for(const g of free) cands.push({h,g,gain,loose,d:depth[h]});
    }
    if(!cands.length) return false;
    let pick;
    const best=cands.filter(c=>c.gain>0);
    if(best.length && (!random || Math.random()<0.9)) pick=best[Math.floor(Math.random()*best.length)];
    else if(random && Math.random()<0.3) pick=cands[Math.floor(Math.random()*cands.length)];
    else {
      let pool=cands.filter(c=>c.loose>0);
      if(!pool.length) pool=cands;
      let mx=-Infinity; for(const c of pool) mx=Math.max(mx,c.d);
      const low=pool.filter(c=>c.d>=mx-0.5);
      pick=low[Math.floor(Math.random()*low.length)];
    }
    A.screwAt[pick.h]=false; A.updateDroops(); settle();
    A.screwAt[pick.g]=true;  A.updateDroops(); settle();
  }
  return left()===0 && A.falling.length===0;
}
let allOk=true, report=[];
for(let li=0; li<window.SCREW_LEVELS.length; li++){
  let solved=false, tries=0;
  if(playout(li,false)) solved=true;
  else for(let t=0;t<250 && !solved;t++){ tries=t+1; if(playout(li,true)) solved=true; }
  if(!solved) allOk=false;
  report.push('L'+(li+1)+':'+(solved?'OK('+tries+')':'FAIL'));
}
console.log(report.join(' '));
process.exit(allOk?0:1);
