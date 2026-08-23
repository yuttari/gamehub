const fs = require("fs");
const path = require("path");

const games = [
  { f: "2048", emoji: "🔢", c1: "#edc22e", c2: "#f59563", bg: "#faf8ef" },
  { f: "snake", emoji: "🐍", c1: "#ff4d12", c2: "#ff703d", bg: "#2b2440" },
  { f: "breakout", emoji: "🧱", c1: "#ffd23f", c2: "#ff4d12", bg: "#1b2a4a" },
  { f: "memory", emoji: "🃏", c1: "#ff703d", c2: "#ed3703", bg: "#ffe0d6" },
  { f: "tetris", emoji: "🟦", c1: "#38bdf8", c2: "#a78bfa", bg: "#1a1b2e" },
  { f: "minesweeper", emoji: "💣", c1: "#ff4d12", c2: "#b45309", bg: "#dbeafe" },
  { f: "racer", emoji: "🏎️", c1: "#ff4d12", c2: "#7c6cff", bg: "#0b1020" },
  { f: "plane", emoji: "✈️", c1: "#38bdf8", c2: "#a78bfa", bg: "#04060f" },
  { f: "tank", emoji: "🚜", c1: "#84cc16", c2: "#3f6212", bg: "#1a2410" },
  // ---- 新增开源游戏 ----
  { f: "asteroids", emoji: "☄️", c1: "#0f172a", c2: "#334155", bg: "#05070b" },
  { f: "bouncy-ball", emoji: "🟠", c1: "#fb923c", c2: "#f59e0b", bg: "#fff7ed" },
  { f: "space-invaders", emoji: "👾", c1: "#22d3ee", c2: "#a855f7", bg: "#0b1020" },
  { f: "bubble-shooter-arcade", emoji: "🫧", c1: "#38bdf8", c2: "#818cf8", bg: "#0c1a2e" },
  { f: "tetris-arcade", emoji: "🟪", c1: "#a855f7", c2: "#6366f1", bg: "#1a1b2e" },
  { f: "memory-match", emoji: "🃏", c1: "#f472b6", c2: "#fb7185", bg: "#fff1f5" },
  { f: "bubble-pop", emoji: "🫧", c1: "#60a5fa", c2: "#34d399", bg: "#eff6ff" },
  { f: "fireworks-show", emoji: "🎆", c1: "#f59e0b", c2: "#ef4444", bg: "#0a0a0a" },
  { f: "music-shapes", emoji: "🎵", c1: "#8b5cf6", c2: "#ec4899", bg: "#0a0a0a" },
  { f: "picture-puzzle", emoji: "🧩", c1: "#f59e0b", c2: "#10b981", bg: "#fffbeb" },
  { f: "color-splash", emoji: "🎨", c1: "#ec4899", c2: "#8b5cf6", bg: "#0a0a0a" },
  // ---- 自研 Poki 同款热门玩法 ----
  { f: "fruit-slice", emoji: "🍉", c1: "#e03131", c2: "#ff922b", bg: "#fff4e6" },
  { f: "makeup", emoji: "💄", c1: "#ff6b9d", c2: "#c2255c", bg: "#ffe9f2" },
  { f: "dressup", emoji: "👗", c1: "#4263eb", c2: "#7048e8", bg: "#e8f0ff" },
  { f: "cake", emoji: "🍰", c1: "#ffd43b", c2: "#e8590c", bg: "#fff4e6" },
  { f: "runner", emoji: "🏃", c1: "#52b788", c2: "#ffd166", bg: "#cdeefc" },
  { f: "suika", emoji: "🍉", c1: "#51cf66", c2: "#fcc419", bg: "#fff9db" },
];

const out = path.join(__dirname, "..", "public", "covers");
fs.mkdirSync(out, { recursive: true });

for (const g of games) {
  const label = g.f.toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${g.c1}"/><stop offset="1" stop-color="${g.c2}"/>
  </linearGradient></defs>
  <rect width="400" height="300" fill="${g.bg}"/>
  <circle cx="330" cy="60" r="120" fill="${g.c1}" opacity="0.25"/>
  <circle cx="60" cy="260" r="90" fill="${g.c2}" opacity="0.2"/>
  <text x="200" y="175" font-size="110" text-anchor="middle">${g.emoji}</text>
  <text x="200" y="248" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle" opacity="0.92">${label}</text>
</svg>`;
  fs.writeFileSync(path.join(out, g.f + ".svg"), svg);
}
console.log("covers generated:", games.map((g) => g.f).join(", "));
