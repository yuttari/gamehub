/**
 * Arcade Games - Bubble Shooter
 * 8-bit retro bubble shooter with arcade cabinet styling
 */

// Game Constants
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;
const BUBBLE_RADIUS = 20;
const GRID_COLS = 12;
const GRID_ROWS = 16;
const BUBBLE_SPEED = 12;
const AIM_LENGTH = 100;

// 8-Bit Color Palette (NES-inspired)
const COLORS = [
    '#ff0055', // Hot Pink
    '#00ffff', // Cyan
    '#00ff00', // Lime Green
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#ff6600', // Orange
];

// Audio Context for 8-bit sound effects
let audioContext = null;
let soundEnabled = true;

// Game State
const gameState = {
    score: 0,
    highScore: parseInt(localStorage.getItem('bubbleShooterHighScore')) || 0,
    level: 1,
    shots: 0,
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    bubbles: [],
    particles: [],
    floatingTexts: [],
    currentBubble: null,
    nextBubble: null,
    projectile: null,
    aimAngle: -Math.PI / 2,
    gridOffset: 0,
    bubblesDropped: 0,
    ceilingDropCounter: 0,
    shotsUntilDrop: 6,
    frameCount: 0,
    screenShake: 0,
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextBubble');
const nextCtx = nextCanvas.getContext('2d');

// Disable image smoothing for pixelated look
ctx.imageSmoothingEnabled = false;
nextCtx.imageSmoothingEnabled = false;

// Pixel art bubble sprites
const bubbleSprites = {};

// Generate pixelated bubble sprites
function generateBubbleSprites() {
    const size = BUBBLE_RADIUS * 2;
    
    COLORS.forEach((color, index) => {
        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = size;
        spriteCanvas.height = size;
        const sCtx = spriteCanvas.getContext('2d');
        sCtx.imageSmoothingEnabled = false;
        
        // Draw pixelated circle
        const pixels = size;
        const center = size / 2;
        const radius = BUBBLE_RADIUS - 2;
        
        // Fill with color
        sCtx.fillStyle = color;
        for (let y = 0; y < size; y += 2) {
            for (let x = 0; x < size; x += 2) {
                const dx = x + 1 - center;
                const dy = y + 1 - center;
                if (dx * dx + dy * dy <= radius * radius) {
                    sCtx.fillRect(x, y, 2, 2);
                }
            }
        }
        
        // Add highlight (pixelated)
        sCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        sCtx.fillRect(center - 6, center - 8, 4, 4);
        sCtx.fillRect(center - 8, center - 6, 2, 2);
        
        // Add shadow
        sCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        sCtx.fillRect(center + 4, center + 6, 4, 4);
        sCtx.fillRect(center + 6, center + 4, 2, 2);
        
        bubbleSprites[color] = spriteCanvas;
    });
}

// Set canvas size with device pixel ratio
function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    
    ctx.scale(dpr, dpr);
    
    canvas.style.width = CANVAS_WIDTH + 'px';
    canvas.style.height = CANVAS_HEIGHT + 'px';
}

// 8-Bit Bubble Class
class Bubble {
    constructor(row, col, color) {
        this.row = row;
        this.col = col;
        this.color = color;
        this.x = 0;
        this.y = 0;
        this.radius = BUBBLE_RADIUS;
        this.popping = false;
        this.popProgress = 0;
        this.popFrame = 0;
        this.updatePosition();
    }

    updatePosition() {
        const rowHeight = BUBBLE_RADIUS * Math.sqrt(3);
        const isOddRow = (this.row + gameState.gridOffset) % 2 === 1;
        this.x = this.col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + (isOddRow ? BUBBLE_RADIUS : 0);
        this.y = this.row * rowHeight + BUBBLE_RADIUS + 10;
    }

    draw() {
        if (this.popping) {
            this.drawPopping();
            return;
        }

        // Draw pixelated bubble sprite
        const sprite = bubbleSprites[this.color];
        if (sprite) {
            ctx.drawImage(sprite, this.x - BUBBLE_RADIUS, this.y - BUBBLE_RADIUS);
        }
        
        // Subtle glow effect (circular, not square)
        if (gameState.frameCount % 4 < 2) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, BUBBLE_RADIUS + 3, 0, Math.PI * 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    drawPopping() {
        const frames = 8;
        const frame = Math.floor(this.popProgress * frames);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 8-bit explosion frames
        const colors = [this.color, '#ffffff', '#ffff00', '#ff8800'];
        const color = colors[Math.min(frame, colors.length - 1)];
        
        ctx.fillStyle = color;
        const size = BUBBLE_RADIUS * 2 * (1 + frame * 0.2);
        
        // Draw pixelated explosion
        const pixelSize = 4;
        for (let py = -size/2; py < size/2; py += pixelSize) {
            for (let px = -size/2; px < size/2; px += pixelSize) {
                const dist = Math.sqrt(px * px + py * py);
                if (dist < size / 2 && Math.random() > 0.3) {
                    ctx.fillRect(px, py, pixelSize, pixelSize);
                }
            }
        }
        
        ctx.restore();
    }
}

// Projectile Class
class Projectile {
    constructor(x, y, angle, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * BUBBLE_SPEED;
        this.vy = Math.sin(angle) * BUBBLE_SPEED;
        this.color = color;
        this.radius = BUBBLE_RADIUS;
        this.trail = [];
        this.rotation = 0;
    }

    update() {
        // Store trail positions
        if (gameState.frameCount % 2 === 0) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 6) this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;
        this.rotation += 0.2;

        // Wall bouncing
        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx);
            playSound('bounce');
            gameState.screenShake = 2;
        } else if (this.x + this.radius >= CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.radius;
            this.vx = -Math.abs(this.vx);
            playSound('bounce');
            gameState.screenShake = 2;
        }

        return this.y - this.radius <= 0;
    }

    draw() {
        // Draw pixelated trail
        this.trail.forEach((pos, i) => {
            const alpha = (i + 1) / this.trail.length;
            const size = 4 + i * 2;
            
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha * 0.5;
            ctx.fillRect(pos.x - size/2, pos.y - size/2, size, size);
        });
        ctx.globalAlpha = 1;

        // Draw rotating pixelated bubble
        const sprite = bubbleSprites[this.color];
        if (sprite) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.drawImage(sprite, -BUBBLE_RADIUS, -BUBBLE_RADIUS);
            ctx.restore();
        }
    }
}

// 8-Bit Particle Class
class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.vx = (Math.random() - 0.5) * (type === 'explosion' ? 12 : 6);
        this.vy = (Math.random() - 0.5) * (type === 'explosion' ? 12 : 6);
        this.life = 1;
        this.decay = 0.015 + Math.random() * 0.02;
        this.size = type === 'explosion' ? 6 : 4;
        this.frameOffset = Math.floor(Math.random() * 4);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // Gravity
        this.life -= this.decay;
        
        // Bounce off walls
        if (this.x < 0 || this.x > CANVAS_WIDTH) {
            this.vx *= -0.8;
            this.x = Math.max(0, Math.min(CANVAS_WIDTH, this.x));
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        
        // 8-bit pixel particles with animation
        const pixelSize = this.size;
        const flicker = (Math.floor(gameState.frameCount / 4) + this.frameOffset) % 2 === 0;
        
        if (this.type === 'explosion') {
            // Cross pattern for explosion
            ctx.fillRect(this.x - pixelSize, this.y - pixelSize/2, pixelSize * 2, pixelSize);
            ctx.fillRect(this.x - pixelSize/2, this.y - pixelSize, pixelSize, pixelSize * 2);
            if (flicker) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.x - pixelSize/2, this.y - pixelSize/2, pixelSize, pixelSize);
            }
        } else if (this.type === 'sparkle') {
            // Diamond pattern
            ctx.fillRect(this.x - pixelSize/2, this.y - pixelSize, pixelSize, pixelSize);
            ctx.fillRect(this.x - pixelSize, this.y - pixelSize/2, pixelSize, pixelSize);
            ctx.fillRect(this.x, this.y - pixelSize/2, pixelSize, pixelSize);
            ctx.fillRect(this.x - pixelSize/2, this.y, pixelSize, pixelSize);
        } else {
            // Square pixel
            ctx.fillRect(
                Math.floor(this.x / pixelSize) * pixelSize,
                Math.floor(this.y / pixelSize) * pixelSize,
                pixelSize,
                pixelSize
            );
        }
        
        ctx.restore();
    }
}

// 8-Bit Floating Text Class
class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1;
        this.vy = -1.5;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.vy;
        this.life -= 0.015;
        this.x += Math.sin(gameState.frameCount * 0.1 + this.bobOffset) * 0.5;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        // Draw pixelated text with outline
        const pixelSize = 3;
        ctx.font = 'bold 20px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Black outline
        ctx.fillStyle = '#000000';
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                if (ox !== 0 || oy !== 0) {
                    ctx.fillText(this.text, this.x + ox * pixelSize, this.y + oy * pixelSize);
                }
            }
        }
        
        // Main text with color cycling
        const colors = [this.color, '#ffffff'];
        const colorIndex = Math.floor(gameState.frameCount / 8) % 2;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillText(this.text, this.x, this.y);
        
        ctx.restore();
    }
}

// 8-Bit Sound Effects
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playSound(type) {
    if (!soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'shoot':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case 'pop':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case 'bounce':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.08);
            break;
            
        case 'drop':
            oscillator.type = 'sawtooth';
            const now = audioContext.currentTime;
            oscillator.frequency.setValueAtTime(440, now);
            oscillator.frequency.setValueAtTime(330, now + 0.1);
            oscillator.frequency.setValueAtTime(220, now + 0.2);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
            
        case 'gameover':
            oscillator.type = 'sawtooth';
            const goNow = audioContext.currentTime;
            oscillator.frequency.setValueAtTime(440, goNow);
            oscillator.frequency.exponentialRampToValueAtTime(55, goNow + 1.5);
            gainNode.gain.setValueAtTime(0.3, goNow);
            gainNode.gain.exponentialRampToValueAtTime(0.01, goNow + 1.5);
            oscillator.start(goNow);
            oscillator.stop(goNow + 1.5);
            break;
            
        case 'levelup':
            oscillator.type = 'square';
            const luNow = audioContext.currentTime;
            [440, 554, 659, 880].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, luNow + i * 0.1);
                gain.gain.setValueAtTime(0.15, luNow + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, luNow + i * 0.1 + 0.15);
                osc.start(luNow + i * 0.1);
                osc.stop(luNow + i * 0.1 + 0.15);
            });
            break;
            
        case 'combo':
            oscillator.type = 'square';
            const cNow = audioContext.currentTime;
            oscillator.frequency.setValueAtTime(523, cNow);
            oscillator.frequency.setValueAtTime(659, cNow + 0.05);
            oscillator.frequency.setValueAtTime(783, cNow + 0.1);
            gainNode.gain.setValueAtTime(0.2, cNow);
            gainNode.gain.exponentialRampToValueAtTime(0.01, cNow + 0.2);
            oscillator.start(cNow);
            oscillator.stop(cNow + 0.2);
            break;
    }
}

// Draw next bubble preview
function drawNextBubble() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (!gameState.nextBubble) return;
    
    const sprite = bubbleSprites[gameState.nextBubble];
    if (sprite) {
        const x = nextCanvas.width / 2;
        const y = nextCanvas.height / 2;
        
        nextCtx.save();
        nextCtx.translate(x, y);
        
        // Add bobbing animation
        const bob = Math.sin(gameState.frameCount * 0.1) * 3;
        nextCtx.translate(0, bob);
        
        // Draw sprite
        nextCtx.drawImage(sprite, -BUBBLE_RADIUS, -BUBBLE_RADIUS);
        
        // Add glow
        nextCtx.beginPath();
        nextCtx.arc(0, 0, BUBBLE_RADIUS + 5, 0, Math.PI * 2);
        nextCtx.strokeStyle = gameState.nextBubble;
        nextCtx.lineWidth = 3;
        nextCtx.globalAlpha = 0.3 + Math.sin(gameState.frameCount * 0.05) * 0.2;
        nextCtx.stroke();
        nextCtx.globalAlpha = 1;
        
        nextCtx.restore();
    }
}

// Grid Management
function createBubble(row, col, color) {
    return new Bubble(row, col, color);
}

function getRandomColor() {
    const usedColors = new Set();
    for (let row of gameState.bubbles) {
        for (let bubble of row) {
            if (bubble) usedColors.add(bubble.color);
        }
    }
    
    if (usedColors.size < 3) {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    
    const colorArray = Array.from(usedColors);
    return colorArray[Math.floor(Math.random() * colorArray.length)];
}

function initGrid() {
    gameState.bubbles = [];
    const startRows = 5 + Math.floor(gameState.level / 2);
    
    for (let row = 0; row < GRID_ROWS; row++) {
        gameState.bubbles[row] = [];
        for (let col = 0; col < GRID_COLS; col++) {
            if (row < startRows) {
                if (row % 2 === 1 && col === GRID_COLS - 1) continue;
                
                const colorCount = Math.min(4 + Math.floor(gameState.level / 2), COLORS.length);
                const color = COLORS[Math.floor(Math.random() * colorCount)];
                gameState.bubbles[row][col] = createBubble(row, col, color);
            }
        }
    }
}

function getBubbleAt(row, col) {
    if (row < 0 || row >= GRID_ROWS || col < 0) return null;
    const isOddRow = (row + gameState.gridOffset) % 2 === 1;
    if (isOddRow && col >= GRID_COLS - 1) return null;
    if (!isOddRow && col >= GRID_COLS) return null;
    return gameState.bubbles[row]?.[col] || null;
}

function getGridPosition(row, col) {
    const bubble = getBubbleAt(row, col);
    if (bubble) {
        return { x: bubble.x, y: bubble.y };
    }
    const rowHeight = BUBBLE_RADIUS * Math.sqrt(3);
    const isOddRow = (row + gameState.gridOffset) % 2 === 1;
    const x = col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + (isOddRow ? BUBBLE_RADIUS : 0);
    const y = row * rowHeight + BUBBLE_RADIUS + 10;
    return { x, y };
}

function snapToGrid(projectile) {
    const rowHeight = BUBBLE_RADIUS * Math.sqrt(3);
    const approxRow = Math.round((projectile.y - BUBBLE_RADIUS - 10) / rowHeight);
    const isOddRow = (approxRow + gameState.gridOffset) % 2 === 1;
    const colOffset = isOddRow ? BUBBLE_RADIUS : 0;
    const approxCol = Math.round((projectile.x - BUBBLE_RADIUS - colOffset) / (BUBBLE_RADIUS * 2));

    let bestRow = Math.max(0, approxRow);
    let bestCol = Math.max(0, approxCol);

    if ((bestRow + gameState.gridOffset) % 2 === 1 && bestCol >= GRID_COLS - 1) {
        bestCol = GRID_COLS - 2;
    }
    if ((bestRow + gameState.gridOffset) % 2 === 0 && bestCol >= GRID_COLS) {
        bestCol = GRID_COLS - 1;
    }

    if (getBubbleAt(bestRow, bestCol)) {
        const neighbors = getNeighbors(bestRow, bestCol);
        for (let n of neighbors) {
            if (!getBubbleAt(n.row, n.col)) {
                bestRow = n.row;
                bestCol = n.col;
                break;
            }
        }
    }

    return { row: bestRow, col: bestCol };
}

function getNeighbors(row, col) {
    const isOddRow = (row + gameState.gridOffset) % 2 === 1;
    const offsets = isOddRow ? [
        [-1, -1], [-1, 0],
        [0, -1], [0, 1],
        [1, -1], [1, 0]
    ] : [
        [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, 0], [1, 1]
    ];

    return offsets.map(([dr, dc]) => ({
        row: row + dr,
        col: col + dc
    }));
}

function findMatches(startRow, startCol, color) {
    const matches = [];
    const visited = new Set();
    const queue = [{ row: startRow, col: startCol }];
    
    while (queue.length > 0) {
        const { row, col } = queue.shift();
        const key = `${row},${col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        const bubble = getBubbleAt(row, col);
        if (!bubble || bubble.color !== color) continue;
        
        matches.push({ row, col });
        
        const neighbors = getNeighbors(row, col);
        for (let n of neighbors) {
            if (!visited.has(`${n.row},${n.col}`)) {
                queue.push(n);
            }
        }
    }
    
    return matches;
}

function findFloatingBubbles() {
    const visited = new Set();
    const queue = [];
    
    for (let col = 0; col < GRID_COLS; col++) {
        if (getBubbleAt(0, col)) {
            queue.push({ row: 0, col });
            visited.add(`0,${col}`);
        }
    }
    
    while (queue.length > 0) {
        const { row, col } = queue.shift();
        const neighbors = getNeighbors(row, col);
        
        for (let n of neighbors) {
            const key = `${n.row},${n.col}`;
            if (!visited.has(key) && getBubbleAt(n.row, n.col)) {
                visited.add(key);
                queue.push(n);
            }
        }
    }
    
    const floating = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            if (getBubbleAt(row, col) && !visited.has(`${row},${col}`)) {
                floating.push({ row, col });
            }
        }
    }
    
    return floating;
}

function checkCollision(projectile) {
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const bubble = gameState.bubbles[row]?.[col];
            if (!bubble) continue;

            const dx = projectile.x - bubble.x;
            const dy = projectile.y - bubble.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < BUBBLE_RADIUS * 2 - 4) {
                return true;
            }
        }
    }
    return false;
}

// Game Logic
function shoot() {
    if (gameState.projectile || !gameState.isPlaying || gameState.isPaused) return;

    const startX = CANVAS_WIDTH / 2;
    const startY = CANVAS_HEIGHT - BUBBLE_RADIUS - 20;

    gameState.projectile = new Projectile(
        startX,
        startY,
        gameState.aimAngle,
        gameState.currentBubble
    );

    gameState.currentBubble = gameState.nextBubble;
    gameState.nextBubble = getRandomColor();
    gameState.shots++;
    
    updateUI();
    playSound('shoot');
}

function handleMatches(row, col) {
    const bubble = getBubbleAt(row, col);
    if (!bubble) return;

    const matches = findMatches(row, col, bubble.color);

    if (matches.length >= 3) {
        let points = matches.length * 10;
        
        // Screen shake for matches
        gameState.screenShake = Math.min(matches.length * 2, 10);
        
        // Remove matched bubbles
        matches.forEach(({ row, col }) => {
            const b = gameState.bubbles[row][col];
            if (b) {
                createParticles(b.x, b.y, b.color, matches.length >= 5 ? 'explosion' : 'normal');
                gameState.bubbles[row][col] = null;
            }
        });

        // Big explosion for large matches
        if (matches.length >= 5) {
            const avgX = matches.reduce((sum, m) => {
                const pos = getGridPosition(m.row, m.col);
                return sum + pos.x;
            }, 0) / matches.length;
            const avgY = matches.reduce((sum, m) => {
                const pos = getGridPosition(m.row, m.col);
                return sum + pos.y;
            }, 0) / matches.length;
            createExplosion(avgX, avgY, bubble.color);
            playSound('combo');
        } else {
            playSound('pop');
        }

        // Check for floating bubbles
        const floating = findFloatingBubbles();
        if (floating.length > 0) {
            points += floating.length * 20;
            floating.forEach(({ row, col }) => {
                const b = gameState.bubbles[row][col];
                if (b) {
                    createParticles(b.x, b.y, b.color, 'sparkle');
                    gameState.bubbles[row][col] = null;
                }
            });
            playSound('drop');
            gameState.screenShake = 5;
        }

        // Score with combo multiplier
        const combo = Math.max(1, matches.length - 2);
        const multiplier = 1 + (combo - 1) * 0.5;
        const totalPoints = Math.floor(points * multiplier);
        gameState.score += totalPoints;

        // Floating text
        const textX = matches.length > 0 ? 
            matches.reduce((sum, m) => {
                const pos = getGridPosition(m.row, m.col);
                return sum + pos.x;
            }, 0) / matches.length : CANVAS_WIDTH / 2;
        const textY = matches.length > 0 ?
            matches.reduce((sum, m) => {
                const pos = getGridPosition(m.row, m.col);
                return sum + pos.y;
            }, 0) / matches.length : CANVAS_HEIGHT / 2;
        
        gameState.floatingTexts.push(new FloatingText(
            textX,
            textY,
            `+${totalPoints}`,
            '#00ff00'
        ));

        // Check for level complete
        if (isGridEmpty()) {
            levelComplete();
        }

        updateUI();
    }
}

function createParticles(x, y, color, type = 'normal') {
    const count = type === 'explosion' ? 24 : 12;
    for (let i = 0; i < count; i++) {
        gameState.particles.push(new Particle(x, y, color, type));
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 3 + Math.random() * 8;
        const particle = new Particle(x, y, color, 'explosion');
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.size = 6 + Math.random() * 6;
        particle.decay = 0.012;
        gameState.particles.push(particle);
    }
}

function isGridEmpty() {
    for (let row of gameState.bubbles) {
        for (let bubble of row) {
            if (bubble) return false;
        }
    }
    return true;
}

function checkGameOver() {
    for (let row = GRID_ROWS - 3; row < GRID_ROWS; row++) {
        for (let bubble of gameState.bubbles[row]) {
            if (bubble) {
                gameOver();
                return true;
            }
        }
    }
    return false;
}

function dropCeiling() {
    for (let row = GRID_ROWS - 1; row > 0; row--) {
        gameState.bubbles[row] = [...gameState.bubbles[row - 1]];
        for (let bubble of gameState.bubbles[row]) {
            if (bubble) {
                bubble.row = row;
                bubble.updatePosition();
            }
        }
    }

    gameState.bubbles[0] = [];
    gameState.gridOffset = 1 - gameState.gridOffset;
    
    for (let col = 0; col < GRID_COLS; col++) {
        if (gameState.gridOffset === 1 && col === GRID_COLS - 1) continue;
        const color = getRandomColor();
        gameState.bubbles[0][col] = createBubble(0, col, color);
    }

    playSound('drop');
    gameState.screenShake = 3;
}

// Level Management
function levelComplete() {
    gameState.isPlaying = false;
    const bonus = gameState.shots < 10 ? 1000 : gameState.shots < 20 ? 500 : 100;
    gameState.score += bonus;
    
    showOverlay('levelComplete', `LEVEL ${gameState.level} CLEAR!<br>BONUS: +${bonus}`);
    playSound('levelup');
    updateUI();
}

function nextLevel() {
    gameState.level++;
    gameState.shots = 0;
    gameState.ceilingDropCounter = 0;
    gameState.shotsUntilDrop = Math.max(4, 6 - Math.floor(gameState.level / 3));
    gameState.gridOffset = 0;
    
    hideOverlay('levelComplete');
    
    initGrid();
    gameState.currentBubble = getRandomColor();
    gameState.nextBubble = getRandomColor();
    gameState.isPlaying = true;
    
    updateUI();
}

function gameOver() {
    gameState.isPlaying = false;
    gameState.isGameOver = true;
    
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('bubbleShooterHighScore', gameState.highScore);
    }
    
    showOverlay('gameOver', `GAME OVER<br>FINAL SCORE: ${gameState.score}`);
    playSound('gameover');
}

function restart() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.shots = 0;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.ceilingDropCounter = 0;
    gameState.shotsUntilDrop = 6;
    gameState.gridOffset = 0;
    gameState.particles = [];
    gameState.floatingTexts = [];
    gameState.projectile = null;
    gameState.screenShake = 0;

    hideOverlay('gameOver');
    hideOverlay('pauseMenu');

    initGrid();
    gameState.currentBubble = getRandomColor();
    gameState.nextBubble = getRandomColor();
    gameState.isPlaying = true;

    updateUI();
}

// Overlay Management
function showOverlay(id, message) {
    const overlayDiv = document.createElement('div');
    overlayDiv.id = id;
    overlayDiv.className = 'overlay';
    
    const content = document.createElement('div');
    content.className = 'overlay-content';
    
    const text = document.createElement('h2');
    text.innerHTML = message;
    content.appendChild(text);
    
    const button = document.createElement('button');
    if (id === 'gameOver') {
        button.textContent = 'PLAY AGAIN';
        button.onclick = restart;
    } else if (id === 'levelComplete') {
        button.textContent = 'NEXT LEVEL';
        button.onclick = nextLevel;
    } else if (id === 'pauseMenu') {
        button.textContent = 'RESUME';
        button.onclick = togglePause;
    }
    content.appendChild(button);
    
    overlayDiv.appendChild(content);
    document.querySelector('.screen-bezel').appendChild(overlayDiv);
}

function hideOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.remove();
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        showOverlay('pauseMenu', 'PAUSED');
    } else {
        hideOverlay('pauseMenu');
    }
}

// Input Handling
function handleMouseMove(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const startX = CANVAS_WIDTH / 2;
    const startY = CANVAS_HEIGHT - BUBBLE_RADIUS - 20;

    gameState.aimAngle = Math.atan2(y - startY, x - startX);
    
    const minAngle = -Math.PI * 0.85;
    const maxAngle = -Math.PI * 0.15;
    gameState.aimAngle = Math.max(minAngle, Math.min(maxAngle, gameState.aimAngle));
}

function handleTouch(e) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    const startX = CANVAS_WIDTH / 2;
    const startY = CANVAS_HEIGHT - BUBBLE_RADIUS - 20;

    gameState.aimAngle = Math.atan2(y - startY, x - startX);
    
    const minAngle = -Math.PI * 0.85;
    const maxAngle = -Math.PI * 0.15;
    gameState.aimAngle = Math.max(minAngle, Math.min(maxAngle, gameState.aimAngle));
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!audioContext) initAudio();
    if (audioContext?.state === 'suspended') audioContext.resume();
    shoot();
}

// Drawing Functions
function drawBackground() {
    // Scanline background effect
    const scanlineOffset = (gameState.frameCount * 2) % 4;
    
    // Base gradient
    const shift = Math.sin(gameState.frameCount * 0.02) * 0.1;
    const gradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT
    );
    gradient.addColorStop(0, `hsl(220, 30%, ${15 + shift * 5}%)`);
    gradient.addColorStop(1, '#050508');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 8-bit grid lines
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.03 + Math.sin(gameState.frameCount * 0.05) * 0.02})`;
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    for (let y = scanlineOffset; y < CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
    
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }

    // Danger zone with animated warning
    const dangerZone = (GRID_ROWS - 3) * BUBBLE_RADIUS * Math.sqrt(3);
    const warningPulse = Math.sin(gameState.frameCount * 0.1) * 0.05 + 0.05;
    ctx.fillStyle = `rgba(255, 0, 68, ${warningPulse})`;
    ctx.fillRect(0, dangerZone - 10, CANVAS_WIDTH, CANVAS_HEIGHT - dangerZone + 10);
    
    // Pixelated danger line
    ctx.strokeStyle = `rgba(255, 0, 68, ${0.3 + warningPulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -gameState.frameCount * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, dangerZone);
    ctx.lineTo(CANVAS_WIDTH, dangerZone);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawAimLine() {
    const startX = CANVAS_WIDTH / 2;
    const startY = CANVAS_HEIGHT - BUBBLE_RADIUS - 20;
    const endX = startX + Math.cos(gameState.aimAngle) * AIM_LENGTH;
    const endY = startY + Math.sin(gameState.aimAngle) * AIM_LENGTH;

    // Dotted aim line (8-bit style)
    const dashLength = 8;
    const gapLength = 4;
    const totalLength = AIM_LENGTH;
    const dashes = Math.floor(totalLength / (dashLength + gapLength));
    
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
    for (let i = 0; i < dashes; i++) {
        const t1 = i * (dashLength + gapLength) / totalLength;
        const t2 = (i * (dashLength + gapLength) + dashLength) / totalLength;
        const x1 = startX + Math.cos(gameState.aimAngle) * totalLength * t1;
        const y1 = startY + Math.sin(gameState.aimAngle) * totalLength * t1;
        const x2 = startX + Math.cos(gameState.aimAngle) * totalLength * t2;
        const y2 = startY + Math.sin(gameState.aimAngle) * totalLength * t2;
        
        ctx.fillRect(x1 - 1, y1 - 1, 3, 3);
    }

    // Aim target (pulsing square)
    const pulse = Math.sin(gameState.frameCount * 0.2) * 2;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(endX - 6 - pulse, endY - 6 - pulse, 12 + pulse * 2, 12 + pulse * 2);
}

function drawShooter() {
    const x = CANVAS_WIDTH / 2;
    const y = CANVAS_HEIGHT - BUBBLE_RADIUS - 20;

    // Draw current bubble
    if (gameState.currentBubble) {
        const sprite = bubbleSprites[gameState.currentBubble];
        if (sprite) {
            // Bobbing animation
            const bob = Math.sin(gameState.frameCount * 0.1) * 2;
            ctx.drawImage(sprite, x - BUBBLE_RADIUS, y - BUBBLE_RADIUS + bob);
        }
    }
}

function drawGrid() {
    for (let row of gameState.bubbles) {
        for (let bubble of row) {
            if (bubble) bubble.draw();
        }
    }
}

function draw() {
    ctx.save();
    
    // Apply screen shake
    if (gameState.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * gameState.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * gameState.screenShake * 2;
        ctx.translate(shakeX, shakeY);
        gameState.screenShake *= 0.9;
        if (gameState.screenShake < 0.5) gameState.screenShake = 0;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background
    drawBackground();

    // Draw ceiling drop warning
    if (gameState.isPlaying && !gameState.isPaused) {
        const remaining = gameState.shotsUntilDrop - gameState.ceilingDropCounter;
        if (remaining <= 2) {
            const flash = Math.floor(gameState.frameCount / 10) % 2 === 0;
            ctx.fillStyle = flash ? 'rgba(255, 0, 68, 0.2)' : 'rgba(255, 0, 68, 0.1)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, 50);
            
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = flash ? '#ff0044' : '#ff6688';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ff0044';
            ctx.shadowBlur = flash ? 10 : 5;
            ctx.fillText(`CEILING DROP IN ${remaining}`, CANVAS_WIDTH / 2, 30);
            ctx.shadowBlur = 0;
        }
    }

    // Draw grid
    drawGrid();

    // Draw projectile
    if (gameState.projectile) {
        gameState.projectile.draw();
    }

    // Draw particles
    gameState.particles.forEach(p => p.draw());

    // Draw floating texts
    gameState.floatingTexts.forEach(t => t.draw());

    // Draw aim line and shooter
    if (gameState.isPlaying && !gameState.isPaused) {
        drawAimLine();
        drawShooter();
    }
    
    ctx.restore();
    
    // Draw next bubble preview
    drawNextBubble();
}

// Game Loop
function update() {
    gameState.frameCount++;
    
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Update projectile
    if (gameState.projectile) {
        const hitCeiling = gameState.projectile.update();
        const hitBubble = checkCollision(gameState.projectile);

        if (hitCeiling || hitBubble) {
            const { row, col } = snapToGrid(gameState.projectile);
            
            if (row >= GRID_ROWS - 1) {
                gameOver();
                gameState.projectile = null;
                return;
            }

            gameState.bubbles[row][col] = createBubble(row, col, gameState.projectile.color);
            gameState.projectile = null;

            handleMatches(row, col);

            gameState.ceilingDropCounter++;
            if (gameState.ceilingDropCounter >= gameState.shotsUntilDrop) {
                gameState.ceilingDropCounter = 0;
                dropCeiling();
                checkGameOver();
            }
        }
    }

    // Update particles
    gameState.particles = gameState.particles.filter(p => {
        p.update();
        return p.life > 0;
    });

    // Update floating texts
    gameState.floatingTexts = gameState.floatingTexts.filter(t => {
        t.update();
        return t.life > 0;
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// UI Updates
function updateUI() {
    document.getElementById('score').textContent = gameState.score.toLocaleString();
    document.getElementById('highScore').textContent = gameState.highScore.toLocaleString();
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('shots').textContent = gameState.shots;
}

// Event Listeners
function setupEventListeners() {
    // Mouse controls
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            if (!audioContext) initAudio();
            if (audioContext?.state === 'suspended') audioContext.resume();
            shoot();
        }
    });

    // Touch controls
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Touch button controls
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnShoot = document.getElementById('btn-shoot');
    
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const interval = setInterval(() => {
                gameState.aimAngle -= 0.05;
                const minAngle = -Math.PI * 0.85;
                const maxAngle = -Math.PI * 0.15;
                gameState.aimAngle = Math.max(minAngle, Math.min(maxAngle, gameState.aimAngle));
            }, 50);
            btnLeft.dataset.interval = interval;
        });
        btnLeft.addEventListener('touchend', (e) => {
            e.preventDefault();
            clearInterval(btnLeft.dataset.interval);
        });
    }
    
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const interval = setInterval(() => {
                gameState.aimAngle += 0.05;
                const minAngle = -Math.PI * 0.85;
                const maxAngle = -Math.PI * 0.15;
                gameState.aimAngle = Math.max(minAngle, Math.min(maxAngle, gameState.aimAngle));
            }, 50);
            btnRight.dataset.interval = interval;
        });
        btnRight.addEventListener('touchend', (e) => {
            e.preventDefault();
            clearInterval(btnRight.dataset.interval);
        });
    }
    
    if (btnShoot) {
        btnShoot.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!audioContext) initAudio();
            if (audioContext?.state === 'suspended') audioContext.resume();
            shoot();
        });
    }

    // Prevent context menu on canvas
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!audioContext) initAudio();
            if (audioContext?.state === 'suspended') audioContext.resume();
            shoot();
        } else if (e.code === 'Escape') {
            e.preventDefault();
            if (gameState.isPlaying && !gameState.isGameOver) {
                togglePause();
            }
        } else if (e.code === 'KeyR' && gameState.isGameOver) {
            restart();
        } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            e.preventDefault();
            gameState.aimAngle -= 0.05;
            const minAngle = -Math.PI * 0.85;
            const maxAngle = -Math.PI * 0.15;
            gameState.aimAngle = Math.max(minAngle, Math.min(maxAngle, gameState.aimAngle));
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            e.preventDefault();
            gameState.aimAngle += 0.05;
            const minAngle = -Math.PI * 0.85;
            const maxAngle = -Math.PI * 0.15;
            gameState.aimAngle = Math.max(minAngle, Math.min(maxAngle, gameState.aimAngle));
        }
    });
}

// Initialization
function init() {
    setupCanvas();
    generateBubbleSprites();
    setupEventListeners();
    
    initGrid();
    gameState.currentBubble = getRandomColor();
    gameState.nextBubble = getRandomColor();
    gameState.isPlaying = true;
    
    updateUI();
    gameLoop();
}

// Start the game
init();
