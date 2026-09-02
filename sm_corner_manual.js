// 手工构造"搭角"关卡，验证新规则的两面：
//   case1: 板A右角搭在板B左上角上，A的重心悬在接触区左侧 -> 拔光螺丝必须滑落
//   case2: 对照组，A整条底边坐在B顶面上，重心在接触区内 -> 保持托住不落
//   case3: case1 接真实 loop()，A 必须完整掉出屏幕（不能楔在 B 上）
global.window = {};
require('./public/games/screw-master/levels.js');
// ---- 注入自定义关卡 (index 8) ----
window.SCREW_LEVELS.push({
  holes:[
    {x:140,y:190,idx:0},{x:600,y:190,idx:1},   // A 的两个钉孔
    {x:650,y:285,idx:2},                        // B 的钉孔
  ],
  screws:[0,1,2],
  plates:[
    // A：横板 x100-640, y150-230，右下角伸进 B 的区域
    {type:'bar',poly:[[100,150],[640,150],[640,230],[100,230]],pins:[0,1],layer:1},
    // B：竖板 x600-700, y220-350（顶面 y=220，与 A 底 y=230 重叠 10px）
    {type:'bar',poly:[[600,220],[700,220],[700,350],[600,350]],pins:[2,2],layer:0},
  ]
});
const fs = require('fs');
const html = fs.readFileSync('public/games/screw-master/index.html','utf8');
let code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
code = code.replace(/^\s*\(function\(\)\{/, '').replace(/\}\)\(\);\s*$/, '');
code += '\nglobal.__api={loadLevel,releasePlates,updateDroops,loop,bboxOf,curPoly,polysOverlap,boltsHolding,'+
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
let fail=0;

function geom(){
  const p=A.plates[0], live=A.curPoly(p), lb=A.bboxOf(live);
  const sb=A.bboxOf(A.curPoly(A.plates[1]));
  const cx=(lb.x0+lb.x1)/2;
  const ox0=Math.max(lb.x0,sb.x0)-8, ox1=Math.min(lb.x1,sb.x1)+8;
  return {cx,ox0,ox1};
}

// ---- case1: 搭角，重心悬空 -> 必须释放 ----
A.loadLevel(8);
let g=geom();
console.log('case1 接触区 '+Math.round(g.ox0)+'-'+Math.round(g.ox1)+' 重心 '+Math.round(g.cx)+' ('+(g.cx<g.ox0?'悬空在外':'在内')+')');
for(const h of A.plates[0].pins) A.screwAt[h]=false;
A.updateDroops(); A.releasePlates();
if(g.cx<g.ox0 && !A.plates[0].fall){ console.log('❌ case1 搭角板未释放'); fail++; }
else console.log(g.cx<g.ox0 ? (A.plates[0].fall?'✅ case1 搭角板已释放，开始滑落':'✅ case1 重心在内，保持托住（构造未达预期但规则自洽）') : '⚠ case1 构造未形成悬空');

// ---- case3: 同一关卡接真实 loop，A 必须掉出屏幕 ----
A.loadLevel(8);
for(const h of A.plates[0].pins) A.screwAt[h]=false;
A.updateDroops();
let clock=1000;
for(let k=0;k<1800;k++){ clock+=16; A.loop(clock); }
// B 板自带螺丝仍钉在背板上，留在屏上是正常的；只要求搭角的 A 板掉出屏幕
const aGone=A.plates[0].gone;
if(g.cx<g.ox0){
  if(!aGone){ console.log('❌ case3 搭角板 1800 帧后仍楔在屏上'); fail++; }
  else console.log('✅ case3 搭角板完整滑落出屏');
}else{
  console.log('(case3: 重心在内所以应保持托住'+(aGone?' ❌ 被误放':' ✅')+')');
  if(aGone) fail++;
}

// ---- case2: 对照组，重心在接触区内 -> 保持托住 ----
// 把 A 右移，使其坐在 B 顶面中部：改用直接构造关卡 idx 9
window.SCREW_LEVELS.push({
  holes:[{x:560,y:190,idx:0},{x:680,y:190,idx:1},{x:650,y:285,idx:2}],
  screws:[0,1,2],
  plates:[
    {type:'bar',poly:[[520,150],[740,150],[740,230],[520,230]],pins:[0,1],layer:1},
    {type:'bar',poly:[[600,220],[700,220],[700,350],[600,350]],pins:[2,2],layer:0},
  ]
});
A.loadLevel(9);
for(const h of A.plates[0].pins) A.screwAt[h]=false;
A.updateDroops(); A.releasePlates();
g=geom();
console.log('case2 接触区 '+Math.round(g.ox0)+'-'+Math.round(g.ox1)+' 重心 '+Math.round(g.cx));
if(A.plates[0].fall){ console.log('❌ case2 重心在接触区内却被释放(误杀)'); fail++; }
else console.log('✅ case2 重心在接触区内，正确保持托住');

console.log(fail? '存在失败 ❌' : '全部通过 ✅');
process.exit(fail?1:0);
