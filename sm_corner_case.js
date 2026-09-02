// 直接复现"搭角"释放用例：手动把板绕第一颗钉转一个角度，使它的重心移出与下层板的真实
// 接触区，拔光它的螺丝后调 releasePlates，验证：
//   重心在接触区外 -> 必须释放(p.fall 建立，滑落)
//   重心在接触区内 -> 必须保持被托住(不释放)
global.window = {};
require('./public/games/screw-master/levels.js');
const fs = require('fs');
const html = fs.readFileSync('public/games/screw-master/index.html','utf8');
let code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
code = code.replace(/^\s*\(function\(\)\{/, '').replace(/\}\)\(\);\s*$/, '');
code += '\nglobal.__api={loadLevel,releasePlates,updateDroops,bboxOf,curPoly,polysOverlap,boltsHolding,'+
  'get plates(){return plates},get falling(){return falling},get screwAt(){return screwAt},get holes(){return holes}};';
const noop=()=>{};
const magic=new Proxy(function(){}, {get:()=>magic, apply:()=>magic});
const ctxStub=new Proxy({},{get:(t,k)=>()=>magic});
const elStub={textContent:'',style:{},getContext:()=>ctxStub,addEventListener:noop,
              classList:{add:noop,remove:noop},
              getBoundingClientRect:()=>({width:960,height:540,left:0,top:0})};
global.document={getElementById:()=>elStub,addEventListener:noop,createElement:()=>elStub};
global.addEventListener=noop;
global.window={addEventListener:noop,SCREW_LEVELS:global.window.SCREW_LEVELS};
global.requestAnimationFrame=noop;
global.AudioContext=function(){return{createGain:()=>({connect:noop,gain:{setValueAtTime:noop}}),createOscillator:()=>({connect:noop,start:noop,stop:noop,frequency:{setValueAtTime:noop}}),destination:{},currentTime:0};};
eval(code);
const A=global.__api;

let tested=0, releasedOut=0, keptIn=0, failures=[];
for(let li=0; li<window.SCREW_LEVELS.length; li++){
  A.loadLevel(li);
  // 找静态重叠对 (i 上, s 下)
  for(let i=0;i<A.plates.length;i++){
    for(let s=0;s<A.plates.length;s++){
      if(s===i||A.plates[s].layer>=A.plates[i].layer) continue;
      if(!A.polysOverlap(A.plates[i].poly,A.plates[s].poly)) continue;
      // 对若干旋转角逐一测试
      for(const deg of [-50,-35,-20,20,35,50]){
        A.loadLevel(li);
        const p=A.plates[i];
        const rot=deg*Math.PI/180;
        // 拔光 i 的螺丝，摆出旋转姿态
        for(const h of p.pins) A.screwAt[h]=false;
        p.droop={pivot:p.pins[0], rot:rot, w:0, target:rot, free:rot, reached:Math.abs(rot)};
        A.updateDroops();
        // 计算实时接触区与重心
        const live=A.curPoly(p), lb=A.bboxOf(live), cx=(lb.x0+lb.x1)/2;
        const sl=A.curPoly(A.plates[s]), sb=A.bboxOf(sl);
        if(!A.polysOverlap(live,sl)) continue;          // 转完不再接触，跳过
        const ox0=Math.max(lb.x0,sb.x0)-8, ox1=Math.min(lb.x1,sb.x1)+8;
        const outside = cx<ox0 || cx>ox1;
        A.releasePlates();
        tested++;
        if(outside){
          if(p.fall){ releasedOut++; }
          else failures.push('L'+(li+1)+' 板'+i+'°'+deg+' 重心'+Math.round(cx)+' 接触区'+Math.round(ox0)+'-'+Math.round(ox1)+' 应落未落');
        }else{
          if(!p.fall && !p.gone){ keptIn++; }
          else failures.push('L'+(li+1)+' 板'+i+'°'+deg+' 重心在接触区内却被释放(误杀)');
        }
      }
    }
  }
}
console.log('用例总数:'+tested+'  搭角应落已落:'+releasedOut+'  重心在内保持托住:'+keptIn);
if(failures.length){ console.log('失败:'); failures.slice(0,10).forEach(f=>console.log(' '+f)); process.exit(1); }
console.log('全部通过 ✅');
