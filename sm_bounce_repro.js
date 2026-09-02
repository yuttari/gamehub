// 复现视频里的"椭圆板搭在竖板角上原地蹦跳"bug：
//   斜板 A（两颗螺丝全拔）的重心悬在竖板 B 顶角接触区外侧，
//   A 的下缘压着 B 的左上角。物理上应该绕角翻落，实际上一蹦一蹦卡死。
// 同时验证对照组：A 重心在接触区内、坐在 B 顶面中部时必须保持托住。
global.window = {};
require('./public/games/screw-master/levels.js');
// 用旋转 40° 的斜板模拟椭圆板姿态
function rotRect(cx,cy,w,h,deg){
  const t=deg*Math.PI/180, c=Math.cos(t), s=Math.sin(t);
  const pts=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
  return pts.map(([x,y])=>[cx+x*c-y*s, cy+x*s+y*c]);
}
// 斜板 A：中心(540,178) 宽208 高46 转40°；两个钉孔沿长轴 ±78
const ax=78*Math.cos(40*Math.PI/180), ay=78*Math.sin(40*Math.PI/180);
window.SCREW_LEVELS.push({
  holes:[
    {x:540-ax,y:178-ay,idx:0},{x:540+ax,y:178+ay,idx:1},  // A 的钉孔
    {x:636,y:256,idx:2},                                   // B 顶孔
  ],
  screws:[0,1,2],
  plates:[
    {type:'bar',poly:rotRect(540,178,208,46,40),pins:[0,1],layer:1},
    {type:'bar',poly:[[606,246],[666,246],[666,400],[606,400]],pins:[2,2],layer:0},
  ]
});
const fs = require('fs');
const html = fs.readFileSync(process.argv[2]||'public/games/screw-master/index.html','utf8');
let code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
code = code.replace(/^\s*\(function\(\)\{/, '').replace(/\}\)\(\);\s*$/, '');
code += '\nglobal.__api={loadLevel,releasePlates,updateDroops,loop,bboxOf,curPoly,polysOverlap,restContacts,platesLeft,belowSupportY,tippingDir,supportScrewsAt,'+
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

// ---- case B(ounce)：搭角 + 重心悬空 -> 必须滑落出屏，不允许原地蹦 ----
A.loadLevel(8);
const gA=A.plates[0];
for(const h of gA.pins) A.screwAt[h]=false;
A.updateDroops();
let clock=1000, switchCnt=0, lastLanded=null, lastTip=null, maxDy=-1e9, minDy=1e9, k=0;
for(k=0;k<1800;k++){
  clock+=16; A.loop(clock);
  const f=gA.fall;
  if(f){
    if(f.landed!==lastLanded || (f.tip||0)!==lastTip){ switchCnt++; lastLanded=f.landed; lastTip=f.tip||0; }
    if(f.dy>maxDy)maxDy=f.dy; if(f.dy<minDy)minDy=f.dy;
  }
  if(k%300===0 || (k<400 && k%25===0)){
    const lb=A.bboxOf(A.curPoly(gA));
    const cs=A.restContacts(0);
    const bi=A.plates.indexOf(gA);
    console.log('帧'+k+' landed='+(f&&f.landed)+' tip='+(f&&f.tip||0)+' dy='+(f&&f.dy.toFixed(1))+
      ' rot='+(f&&f.rot.toFixed(2))+' cx='+Math.round((lb.x0+lb.x1)/2)+
      ' 螺丝接触='+cs.map(c=>c.h+'@'+Math.round(c.x)+','+Math.round(c.y)).join('|')+
      ' 支撑面y='+(A.belowSupportY(bi,0)===1e9?'无':Math.round(A.belowSupportY(bi,0)))+
      ' 翻向='+A.tippingDir(bi,0));
  }
  if(gA.gone) break;
}
console.log('状态切换次数(landed/tip翻转)='+switchCnt+' dy波动范围='+minDy.toFixed(1)+'~'+maxDy.toFixed(1));
if(!gA.gone){
  console.log('❌ caseB 搭角板 1800 帧后仍卡在屏上'+(switchCnt>20?'（原地蹦跳 '+switchCnt+' 次）':''));
  fail++;
}else console.log('✅ caseB 搭角板滑落出屏（'+k+' 帧内）');

// ---- case R(egression)：重心在接触区内坐在宽板顶面 -> 保持托住 ----
window.SCREW_LEVELS.push({
  holes:[{x:480,y:180,idx:0},{x:700,y:180,idx:1},{x:600,y:290,idx:2}],
  screws:[0,1,2],
  plates:[
    {type:'bar',poly:[[420,150],[760,150],[760,216],[420,216]],pins:[0,1],layer:1},
    {type:'bar',poly:[[520,200],[660,200],[660,400],[520,400]],pins:[2,2],layer:0},
  ]
});
A.loadLevel(9);
for(const h of A.plates[0].pins) A.screwAt[h]=false;
A.updateDroops();
for(let k=0;k<600;k++){ clock+=16; A.loop(clock); }
const r0=A.plates[0];
if(r0.gone || r0.fall){ console.log('❌ caseR 重心在接触区内却被放落/掉走'); fail++; }
else console.log('✅ caseR 重心在接触区内保持托住');

console.log(fail? '存在失败 ❌' : '全部通过 ✅');
process.exit(fail?1:0);
