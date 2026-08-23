// 将 _src 下的开源游戏拷贝进 public/games/<slug>/，并生成入口 index.html（若源不是 index.html 则复制重命名）
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "_src");
const DEST = path.join(__dirname, "..", "public", "games");

// 映射：slug -> { dir, entry, rename }
const map = [
  { slug: "asteroids", dir: "asteroids-canvas", entry: "index.html" },
  { slug: "bouncy-ball", dir: "javascript-canvas-bouncy-game", entry: "index.html" },
  { slug: "space-invaders", dir: "arcade-games/space-invaders", entry: "index.html" },
  { slug: "bubble-shooter-arcade", dir: "arcade-games/bubble-shooter", entry: "index.html" },
  { slug: "tetris-arcade", dir: "arcade-games/tetris", entry: "index.html" },
  { slug: "memory-match", dir: "gamecollection/memory_game.html", entry: "memory_game.html", rename: "index.html" },
  { slug: "bubble-pop", dir: "gamecollection/bubble_pop_game.html", entry: "bubble_pop_game.html", rename: "index.html" },
  { slug: "fireworks-show", dir: "gamecollection/fireworks_game.html", entry: "fireworks_game.html", rename: "index.html" },
  { slug: "music-shapes", dir: "gamecollection/music_shapes_game.html", entry: "music_shapes_game.html", rename: "index.html" },
  { slug: "picture-puzzle", dir: "gamecollection/puzzle_game.html", entry: "puzzle_game.html", rename: "index.html" },
  { slug: "color-splash", dir: "gamecollection/color_splash_game.html", entry: "color_splash_game.html", rename: "index.html" },
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      copyRecursive(path.join(src, f), path.join(dest, f));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

let ok = 0;
for (const m of map) {
  const srcPath = path.join(SRC, m.dir);
  if (!fs.existsSync(srcPath)) {
    console.log("SKIP (missing):", m.slug, "->", m.dir);
    continue;
  }
  const destDir = path.join(DEST, m.slug);
  fs.mkdirSync(destDir, { recursive: true });

  if (m.rename) {
    // 单文件游戏，连同同目录其他资源一起拷贝，再把入口重命名为 index.html
    const parent = path.dirname(srcPath);
    // 拷贝整个父目录内容（css/js 等共享资源）到目标目录
    copyRecursive(parent, destDir);
    // 重命名入口
    const from = path.join(destDir, m.entry);
    const to = path.join(destDir, m.rename);
    if (fs.existsSync(from) && from !== to) {
      fs.renameSync(from, to);
    }
  } else {
    copyRecursive(srcPath, destDir);
  }
  console.log("OK:", m.slug);
  ok++;
}
console.log(`\nImported ${ok} games.`);
