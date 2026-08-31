# 六款街机游戏重设计方案（Snake / Fruit Catcher / Plane War / Sky Fighter / Tank Battle / Whack-a-Mole）

> 统一目标：横屏铺满 + 强音画反馈 + 关卡制（类似消消乐逐级过关）。
> 关键约束（来自 Breakout 教训）：**Canvas 必须按容器缩放并占满整个游戏区**，否则只会显示在左上角。
> 统一技术基线：单文件 HTML5 + Canvas，内部逻辑分辨率 960×540（16:9），`resize()` 中 `scale = cv.width/960`，`draw()` 开头 `ctx.setTransform(scale,0,0,scale,0,0)`。音效用 Web Audio API，必须在用户点击「Start」后初始化 AudioContext。

---

## 0. 通用引擎规范（每款游戏必须遵守）

### 0.1 铺满画布（防“左上角”Bug）
```js
const LOGIC_W=960, LOGIC_H=540;
let scale=1, W=LOGIC_W, H=LOGIC_H;
function resize(){
  const rect=stage.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.max(1,Math.floor(rect.width*dpr));
  cv.height=Math.max(1,Math.floor(rect.height*dpr));
  scale=cv.width/LOGIC_W;
}
function draw(){
  ctx.save();
  ctx.setTransform(scale,0,0,scale,0,0); // 关键：把 960×540 逻辑坐标铺到整块画布
  ... // 全部用 0..960 / 0..540 坐标绘制
  ctx.restore();
}
window.addEventListener('resize',()=>{resize(); if(!running)draw();});
```
CSS：`.stage{flex:1 1 auto;position:relative;width:100%;overflow:hidden} canvas{display:block;width:100%;height:100%}`。

### 0.2 音效系统（Web Audio）
- `initAudio()` 在 Start 按钮点击时执行，创建 `AudioContext`。
- `tone(freq,dur,type,vol,slide)` 程序化合成；`noise(dur,vol)` 白噪声（爆炸/失败）。
- 击打/消除：音高随连击阶梯上升（参考消消乐：C5→E5→G5→C6→E6→G6…）。
- 关卡通过：上行琶音；失败：下行音。

### 0.3 视觉反馈
- 粒子爆炸：`spawnParticles(x,y,color,count,power)`，数量/速度随连击增强。
- 屏幕震动：`shake` 值随机 `translate`，逐帧衰减。
- 飘字：`addFloat(text,x,y,color,size)` 显示连击/得分。
- 球/子弹拖尾、发光（`shadowBlur`）、霓虹配色。

### 0.4 关卡制（类似消消乐）
- 顶部 HUD：Score / Level / 生命或进度。
- `levelConfig(lv)` 返回该关参数（速度、生成频率、目标、敌人量）。
- 过关条件因游戏而异（吃够豆 / 接够果 / 清完波次 / 达目标分 / 限时清场）。
- 过关后 `level++`，保留分数与生命，速度/密度提升，播放升级音+横幅。
- 失败（命耗尽/超时）显示 Game Over，可重开。

---

## 1. Snake（贪吃蛇吃豆豆）
- **玩法**：方向键/WASD/滑动控制蛇移动，吃豆豆变长；撞墙或自身死亡；3 命。
- **关卡**：每关需吃 `8 + lv*2` 颗豆过关；速度随关卡提升（帧间隔缩短）；第 3 关起随机出现障碍方块。
- **音效**：吃豆“叮”（音高随连吃阶梯升）；死亡“嗡”+噪声；过关琶音。
- **视觉**：蛇身渐变发光、豆豆脉冲缩放、吃豆粒子迸发、死亡震屏、网格背景。

## 2. Fruit Catcher（接水果）
- **玩法**：底部篮子左右移动接住下落水果；漏接 5 次或接到炸弹扣命；3 命。
- **关卡**：每关接够 `10 + lv*3` 个水果过关；下落速度 `base*(1+lv*0.12)`、生成间隔缩短；出现金色加分果与黑色炸弹。
- **音效**：接果“啵”（连击升调）；炸弹“轰”；过关琶音。
- **视觉**：水果旋转下落、接住粒子、连击飘字、篮子拖尾、漏接震屏。

## 3. Plane War（飞机 / 纵向射击）
- **玩法**：战机固定在下方，自动开火，左右/滑动移动躲避下压敌机与子弹；3 命。
- **关卡**：每关为若干波敌机，清空过关；敌机数量/速度/开火率随关卡升；每 5 关一个 Boss（厚血+弹幕）。
- **音效**：开火“噼”；爆炸“轰”+噪声；中弹“咚”；过关琶音。
- **视觉**：子弹拖尾、爆炸粒子、Boss 血条、受击震屏、星空卷动背景。

## 4. Sky Fighter（横版卷轴射击，新建 slug=sky-fighter）
- **玩法**：战机从左侧向右飞，背景横向卷动，敌机从右侧来袭，自动开火；3 命。区别于 Plane War 的纵向，本作为**横向卷轴**并加入道具（散弹/护盾）。
- **关卡**：每关敌机密度/速度递增；每 4 关 Boss；拾取道具强化火力。
- **音效/视觉**：同 Plane War 风格，强调横向弹道与爆炸。
- **注意**：games.json 现有两条 `slug:"plane"` 冲突，本作改为 `slug:"sky-fighter"`、`path:"/games/sky-fighter/index.html"`，删除重复的 plane 条目。

## 5. Tank Battle（坦克大战）
- **玩法**：坦克四向移动并射击，消灭场内所有敌方坦克过关；3 命；可被敌弹/碰撞击败。
- **关卡**：敌坦克数量 `2+lv`、移动/射击更快；砖墙掩体随机生成；每 3 关出现精英（厚血）敌坦。
- **音效**：开炮“砰”；爆炸“轰”；过关军号式琶音。
- **视觉**：炮口火光、爆炸粒子、履带痕迹、受击震屏、掩体碎裂粒子。

## 6. Whack-a-Mole（打地鼠）
- **玩法**：N×M 地洞网格，地鼠/炸弹随机冒出，点击或敲击对应洞；打中地鼠得分，打中炸弹扣命；每关限时。
- **关卡**：目标分 `200*lv`；冒出更快、炸弹比例升高、地鼠停留更短；网格随关卡大到 4×3→5×4。
- **音效**：敲中“咚”（连击升调）；炸弹“轰”；过关琶音。
- **视觉**：地鼠弹出动画、敲击粒子、连击飘字、计时条、震屏。

---

## 7. 验证清单（每款）
- [ ] 预览中游戏占满整个 16:9 区域（非左上角）。
- [ ] 点击 Start 后有音效；连击音高递增。
- [ ] 击打/消除有粒子、震屏或飘字。
- [ ] 顶部显示 Level，过关后难度提升且可继续。
- [ ] `node --check` 通过；`npm run build` 通过；8091 预览可玩。
