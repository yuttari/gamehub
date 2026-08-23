# 🎮 Game Collection

A collection of fun, interactive, and **accessible** browser-based games built with HTML5, CSS3, and JavaScript. All games work on desktop and mobile devices with full touch, keyboard, and screen reader support. Designed to be enjoyable by everyone, including children with visual or motor disabilities.

## 🎯 Play Online

**Play the games now at: [https://bryanherger.github.io/gamecollection/](https://bryanherger.github.io/gamecollection/)**

---

## 🎪 Games Included

### 🧠 Memory Match *(New!)*
The classic memory card game — find all matching pairs! Features adjustable difficulty and high-contrast card designs.

**Features:**
- **6 grid sizes**: 3×2 (Easy), 3×3, **4×3 (Default)**, 4×4 (Medium), 5×4 (Hard), 6×4 (Expert)
- High-contrast card backs (dark gradient with gold `?`) and white card fronts
- Kid-friendly emoji symbols (animals, shapes, objects, vehicles)
- Animated 3D card flip with CSS transforms
- Match confirmation with green glow + "ta-da" audio
- Victory fanfare with stats popup (moves, pairs) and **Play Again** button
- Auto-reset and shuffle on new game

### 🫧 Bubble Pop
Pop colorful bubbles as they float across the screen! Highly customizable difficulty settings.

**Features:**
- Configurable bubble count (**2-12** bubbles per spawn)
- Adjustable bubble speed (8 levels from slowest to fastest)
- Customizable bubble size (10 levels from tiny to huge)
- Colorful gradient bubbles with realistic shine effects
- Satisfying pop sound effects + screen reader score announcements
- Score tracking with milestone alerts every 10 points
- Touch, mouse, and **full keyboard controls** (Tab/Arrows + Enter to pop)

### 🎆 Fireworks Show
Launch spectacular fireworks displays! Click or tap anywhere to create your own show.

**Features:**
- Automatic fireworks that launch and burst periodically
- User-triggered fireworks — click/tap anywhere to launch
- **Keyboard mode**: Tab to enable, arrow keys to aim, Enter/Space to launch
- 8 vibrant color schemes
- Realistic particle physics with gravity
- Launch and explosion sound effects
- Beautiful trail effects

### 🎵 Music Shapes
Tap colorful shapes to make music! Each shape plays a unique musical note.

**Features:**
- 6 shapes per round in a clean 3×2 grid (no overlap)
- 4 shape types (circle, square, triangle, star) in 8 high-contrast colors
- C-major scale notes for pleasant harmony
- Particle burst + pulse animation on activation
- **Keyboard mode**: Tab to navigate shapes, Enter/Space to play
- Screen reader announces color, shape, and note for each

### 🧩 Picture Puzzle
Drag and snap six puzzle pieces to complete a picture! A fun visual matching challenge.

**Features:**
- 3 hand-drawn images (dog, house, train) randomly selected each round
- Preview phase to memorize the picture, then scatter to solve
- **Keyboard mode**: Tab to select pieces, arrows to move, Enter to snap
- Snap indicators show when a piece is close to its correct spot
- Victory flash animation with "Great job!" message

---

## ♿ Accessibility Features

Every game includes a **♿ Accessibility Settings Panel** (bottom-right corner) with:

| Setting | Benefit |
|---------|---------|
| **Sound** | Enable/disable sound effects |
| **Motor Friendly** | Larger targets (48px+) + slower movement |
| **Large Targets** | Extra-large tap targets for easier selection |
| **Keyboard Navigation** | Full keyboard controls in every game |
| **High Contrast** | Bold colors + thick borders for visual clarity |
| **Reduced Motion** | Disables animations (respects `prefers-reduced-motion`) |
| **Screen Reader** | Announces game events via ARIA live regions |

### Keyboard Shortcuts (All Games)
- **Tab** → Enable keyboard mode / navigate elements
- **Arrows** → Move/aim/navigate
- **Enter / Space** → Activate/flip/select
- **Escape** → Close menus
- **S** → Open settings
- **R** → Reset game

All settings persist in `localStorage` across sessions.

---

## 🚀 Quick Start

### Play in Browser
Simply open `index.html` in any modern web browser. No installation required!

### Deploy to GitHub Pages
1. Fork or clone this repository
2. Go to repository **Settings**
3. Navigate to **Pages** section
4. Set Source to **"Deploy from a branch"**
5. Select **"main"** branch and **"/ (root)"** folder
6. Your games will be live at `https://yourusername.github.io/gamecollection/`

---

## 📱 Cordova Mobile Apps (Optional)

While these games work perfectly in browsers, you can also build them as native mobile apps using Apache Cordova.

### Prerequisites
```bash
npm install -g cordova
```

### Create Cordova Project
```bash
cordova create GameCollection com.gamecollection.app GameCollection
cd GameCollection
```

### Copy Files
Copy all HTML, CSS, and JS files to the `www` folder:
- `index.html`
- `*.html` (all game files)
- `js/` (shared engine + panel)
- `css/` (common styles)

### Add Platforms
```bash
# For Android
cordova platform add android

# For iOS
cordova platform add ios

# For browser testing
cordova platform add browser
```

### Run
```bash
# Browser
cordova run browser

# Android
cordova run android

# iOS
cordova run ios
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5 Canvas** | Graphics rendering for Bubble Pop, Fireworks, Music Shapes |
| **CSS3** | Styling, animations, responsive grid layouts |
| **Vanilla JavaScript** | Game logic (no external frameworks) |
| **Shared Game Engine** | Reusable Audio, Canvas, Input, Particles, Animation, GameLoop |
| **Web Audio API** | Sound effects and music |
| **ARIA + ARIA-Live** | Screen reader announcements |
| **Apache Cordova** | Optional mobile app framework |

---

## 📁 File Structure

```
gamecollection/
├── index.html                 # Main game selection page (with accessibility info)
├── bubble_pop_game.html       # Bubble popping game
├── fireworks_game.html        # Fireworks display game
├── music_shapes_game.html     # Musical shapes game
├── puzzle_game.html           # Drag-and-drop puzzle game
├── memory_game.html           # Memory match card game (NEW)
├── css/
│   └── common.css             # Shared styles (high contrast, motor-friendly, focus rings)
├── js/
│   ├── game-engine.js         # Shared game engine (Audio, Canvas, Input, Particles, etc.)
│   └── accessibility-panel.js # ♿ Settings panel (motor/visual/screen reader options)
├── config.xml                 # Cordova configuration (for mobile apps)
└── README.md                  # This file
```

---

## 🎨 Customization

All games are built with easily customizable parameters. Check the JavaScript configuration objects in each game file to adjust:

- Spawn rates, timing, and difficulty
- Physics parameters (gravity, speed, friction)
- Visual effects (colors, sizes, animations)
- Sound characteristics (pitch, duration, wave type)
- Grid layouts and card counts
- And more!

---

## 🌐 Browser Compatibility

Works on all modern browsers:

| Browser | Support |
|---------|---------|
| Chrome / Edge | ✅ Recommended |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| iOS Safari | ✅ Touch + keyboard |
| Chrome Mobile | ✅ Touch + keyboard |

**Requirements:** JavaScript, HTML5 Canvas, Web Audio API

---

## 📄 License

Copyright (c) 2025

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new games or features
- Improve accessibility
- Submit pull requests
- Improve documentation

---

## 🔗 Links

- **Play Online:** [https://bryanherger.github.io/gamecollection/](https://bryanherger.github.io/gamecollection/)
- **GitHub Repository:** [https://github.com/bryanherger/gamecollection](https://github.com/bryanherger/gamecollection)

---

## 👨‍💻 Author

Created with ❤️ for players of all ages and abilities

**Enjoy the games! 🎮🎉**
