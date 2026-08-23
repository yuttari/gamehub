# 小游戏聚合门户 — MVP 开发计划

> 目标：做一个海外英文市场、聚合开源 HTML5 小游戏、靠 Google AdSense 展示广告变现的门户站。
> 开发者：个人（用大模型辅助开发）。预算：仅大模型费用 + 域名（约 ¥60-100/年）。
> 部署：先 Vercel 免费额度 + Cloudflare，跑通后再考虑付费云。

---

## 0. 决策摘要（已确认）

| 项 | 决策 |
|----|------|
| 市场 | 海外英文（Poki 模式），避开国内备案/版号 |
| 游戏来源 | 聚合 MIT/CC 开源 HTML5 游戏为主，后续自研 1-2 款招牌 |
| 开发者 | 个人 + 大模型辅助 |
| 广告 | MVP 用 Google AdSense 展示广告（先占位，审核通过后填 ID） |
| 预算 | 仅大模型费 + 域名；免费云部署 |
| 范围 | MVP：20-30 款游戏 + 基础门户 + 广告位 |

---

## 1. 技术栈

- **框架**：Next.js 14（App Router）+ TypeScript + React 18
  - 选它因为：SSR 利于 SEO（AdSense 和搜索流量都吃 SEO）、路由清晰、部署 Vercel 一键。
- **样式**：Tailwind CSS（开发快、响应式开箱即用）
- **内容/CMS**：本地 JSON / Markdown 存游戏元数据（MVP 阶段不接数据库，文件即数据库，后续可换 Strapi）
- **游戏引擎（仅当你自研时用到）**：Phaser 3（2D）、Three.js（3D）；多数搬运游戏自带
- **广告**：`@next/third-parties` 接入 Google AdSense；预留广告位组件 `<AdSlot>`
- **托管**：Vercel（免费层）+ Cloudflare（DNS + 缓存 + 图片优化）
- **域名**：Namecheap / Cloudflare Registrar 买一个 `.com`（约 $10/年）

---

## 2. 站点信息架构

```
/                       首页（热门 + 分类入口 + 广告位）
/category/[slug]        分类页（按类型列出游戏）
/search?q=...           搜索页
/game/[slug]            游戏详情页（iframe 嵌入 + 简介 + 广告位 + 相关推荐）
/about                  关于/隐私政策/版权声明（AdSense 必填）
```

**游戏详情页是关键**：一个 `<iframe>` 加载游戏 HTML 包（放在 `/public/games/[slug]/index.html`），上方/下方各一个 AdSense 广告位。

---

## 3. 文件结构（草案）

```
game-portal/
├─ app/
│  ├─ layout.tsx             全局布局（Header/Footer + AdSense 脚本）
│  ├─ page.tsx               首页
│  ├─ category/[slug]/page.tsx
│  ├─ search/page.tsx
│  ├─ game/[slug]/page.tsx
│  └─ about/page.tsx
├─ components/
│  ├─ GameCard.tsx
│  ├─ CategoryNav.tsx
│  ├─ AdSlot.tsx             广告位占位组件
│  └─ GameFrame.tsx          iframe 封装（含 loading 态）
├─ data/
│  └─ games.json            游戏元数据（标题/描述/标签/封面/路径/协议/作者）
├─ public/
│  ├─ games/[slug]/...      各游戏 HTML 包
│  └─ covers/...            封面图
└─ lib/
   └─ games.ts              读取/筛选游戏数据的工具函数
```

---

## 4. 任务拆解（开发顺序）

**Phase 1 — 搭骨架（约 1-2 天）**
1. 初始化 Next.js + TS + Tailwind 项目
2. 写 `games.json` 数据结构 + `lib/games.ts` 读取逻辑
3. 做全局布局（Header 含分类导航、Footer 含 About 链接）
4. 做首页（热门游戏网格 + 分类入口 + 顶部/底部广告位）

**Phase 2 — 内容页（约 1-2 天）**
5. 游戏详情页 `/game/[slug]`：iframe 嵌入 + 简介 + 广告位 + 相关推荐
6. 分类页 `/category/[slug]`
7. 搜索页 `/search`
8. 响应式适配（移动端竖排，桌面端网格 + 侧栏广告）

**Phase 3 — 铺游戏（持续）**
9. 按"开源游戏清单"逐个下载、放入 `public/games/`，填 `games.json`
10. 用 Cloudflare 或本地生成封面图（也可用游戏自带截图）

**Phase 4 — 广告 & 部署（约 1 天）**
11. 接入 AdSense 占位组件（先放示例，申请后填 `data-ad-client`）
12. 写 About / 隐私政策 / 版权声明页（AdSense 审核必填）
13. 部署到 Vercel，绑定域名，Cloudflare 接 DNS
14. 提交 AdSense 申请（需一定流量/内容，先上线养站）

---

## 5. 广告位规划（AdSense）

| 位置 | 类型 | 说明 |
|------|------|------|
| 首页顶部 | 自适应横幅 (display) | 首屏下方，不挡内容 |
| 首页信息流 | 信息流广告 (in-feed) | 游戏网格中间插 1 个 |
| 游戏详情页画布上方 | 自适应横幅 | 曝光最高，重点位 |
| 游戏详情页画布下方 | 自适应横幅 | 退出/重玩时可见 |
| 桌面端侧栏 | 矩形 (300x250) | 仅 ≥1024px 显示 |

**注意**：MVP 阶段先放占位 div，不要硬编码假广告；AdSense 审核通过后再填真实 `data-ad-client` 和 `data-ad-slot`。

---

## 6. 合规 & 风险清单

- [ ] 每款搬运游戏保留原 LICENSE / 作者署名（MIT 要求）
- [ ] 仅在 About 页声明"games are open-source under their respective licenses"
- [ ] 不搬运 Poki/知名平台独占游戏（侵权高风险）
- [ ] AdSense 要求：隐私政策页 + 足够原创内容 + 无无效流量
- [ ] 收款准备：Payoneer / 香港银行卡 / 双币卡（收美元）

---

## 7. 后续升级路线（MVP 之后）

1. 自研 1-2 款招牌小游戏（大模型辅助写 Phaser）
2. 游戏内激励视频/插屏（日 PV 过万后接 AdMob Web 或聚合平台）
3. 用户系统（收藏/成就），提升留存
4. 换 Headless CMS 批量管理游戏
5. 国内镜像站（如需，另做合规）

---

## 8. 成功指标（MVP 验收）

- [ ] 站能上线、能被 Google 收录
- [ ] 至少 20 款可玩开源游戏
- [ ] 广告位全部就位（AdSense 审核通过或待填 ID）
- [ ] 移动端 + 桌面端均可用
- [ ] 部署成本 ≤ 域名费
