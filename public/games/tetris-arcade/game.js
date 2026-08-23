/**
 * Arcade Games - Tetris
 * Built with vanilla JavaScript for GitHub Pages
 */

// ===== Constants =====
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#FF0D72', // I - Red
    '#0DC2FF', // J - Blue
    '#0DFF72', // L - Green
    '#F538FF', // O - Purple
    '#FF8E0D', // S - Orange
    '#FFE138', // T - Yellow
    '#3877FF', // Z - Deep Blue
];

// 7 Standard Tetris piece shapes (using SRS - Super Rotation System)
const SHAPES = [
    [], // Empty (index 0)
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
    [[2,0,0], [2,2,2], [0,0,0]], // J
    [[0,0,3], [3,3,3], [0,0,0]], // L
    [[4,4], [4,4]], // O
    [[0,5,5], [5,5,0], [0,0,0]], // S
    [[0,6,0], [6,6,6], [0,0,0]], // T
    [[7,7,0], [0,7,7], [0,0,0]], // Z
];

// ===== Game State Management =====
class GameState {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.started = false; // Game hasn't started yet
        this.dropCounter = 0;
        this.dropInterval = 1000; // Initial drop speed (milliseconds)
        this.lastTime = 0;
        this.shakeIntensity = 0; // Screen shake effect
        this.clearingLines = []; // Lines being cleared with animation
    }

    addScore(linesCleared) {
        // Scoring system: 1 line=100, 2 lines=300, 3 lines=500, 4 lines=800
        const points = [0, 100, 300, 500, 800];
        this.score += points[linesCleared] * this.level;
        this.lines += linesCleared;
        
        // Level up every 10 lines, increase speed
        this.level = Math.floor(this.lines / 10) + 1;
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 50);
        
        this.updateUI();
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.started = false; // Reset to waiting for start
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.updateUI();
    }

    start() {
        this.started = true;
        this.lastTime = performance.now();
    }
}

// ===== Game Board =====
class Board {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createMatrix(cols, rows);
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    // Collision Detection
    collide(piece) {
        const shape = piece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const newX = piece.x + x;
                    const newY = piece.y + y;
                    
                    // Check boundaries
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }
                    
                    // Check collision with locked pieces
                    if (newY >= 0 && this.grid[newY][newX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Merge piece into board
    merge(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardY = piece.y + y;
                    const boardX = piece.x + x;
                    if (boardY >= 0) {
                        this.grid[boardY][boardX] = value;
                    }
                }
            });
        });
    }

    // Clear completed lines
    clearLines() {
        let linesToClear = [];
        
        // Find all complete lines
        for (let y = this.rows - 1; y >= 0; y--) {
            let isFull = true;
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 0) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                linesToClear.push(y);
            }
        }
        
        return linesToClear;
    }
    
    // Actually remove the lines after animation
    removeLines(lines) {
        lines.sort((a, b) => b - a); // Sort descending
        lines.forEach(y => {
            const row = this.grid.splice(y, 1)[0].fill(0);
            this.grid.unshift(row);
        });
    }

    // Reset board
    reset() {
        this.grid = this.createMatrix(this.cols, this.rows);
    }
}

// ===== Tetris Piece =====
class Piece {
    constructor(typeId) {
        this.typeId = typeId;
        this.shape = SHAPES[typeId];
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }

    // Rotate piece (clockwise 90 degrees)
    rotate() {
        const newShape = this.shape[0].map((_, i) =>
            this.shape.map(row => row[i]).reverse()
        );
        return newShape;
    }

    // Move piece
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

// ===== Renderer =====
class Renderer {
    constructor(canvas, nextCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas.getContext('2d');
        this.blockSize = BLOCK_SIZE;
    }

    // Draw a single block
    drawBlock(x, y, colorId) {
        if (colorId === 0) return;
        
        const color = COLORS[colorId];
        const size = this.blockSize;
        const bX = x * size;
        const bY = y * size;
        
        // Main block color
        this.ctx.fillStyle = color;
        this.ctx.fillRect(bX, bY, size, size);
        
        // Highlight (top-left) - lighter shade for 3D effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillRect(bX, bY, size, 3); // Top edge
        this.ctx.fillRect(bX, bY, 3, size); // Left edge
        
        // Shadow (bottom-right) - darker shade for depth
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(bX, bY + size - 3, size, 3); // Bottom edge
        this.ctx.fillRect(bX + size - 3, bY, 3, size); // Right edge
        
        // Inner border for retro pixel look
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(bX + 2, bY + 2, size - 4, size - 4);
    }

    // Draw the entire board
    drawBoard(board, state) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        board.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    // Check if this line is being cleared
                    const clearing = state.clearingLines.find(line => line.y === y);
                    
                    if (clearing) {
                        // Flash effect during line clear
                        if (Math.floor(clearing.flash) % 2 === 0) {
                            // Flash white
                            this.ctx.fillStyle = '#FFFFFF';
                            const bX = x * this.blockSize;
                            const bY = y * this.blockSize;
                            this.ctx.fillRect(bX, bY, this.blockSize, this.blockSize);
                        } else {
                            this.drawBlock(x, y, value);
                        }
                        clearing.flash += 0.5; // Increment flash counter
                    } else {
                        this.drawBlock(x, y, value);
                    }
                }
            });
        });
    }

    // Draw current piece
    drawPiece(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBlock(piece.x + x, piece.y + y, value);
                }
            });
        });
    }

    // Draw next piece preview with 3D effect
    drawNextPiece(piece) {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!piece) return;
        
        const scale = 25; // Preview block size
        const offsetX = (this.nextCanvas.width - piece.shape[0].length * scale) / 2;
        const offsetY = (this.nextCanvas.height - piece.shape.length * scale) / 2;
        
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const bX = offsetX + x * scale;
                    const bY = offsetY + y * scale;
                    
                    // Main color
                    this.nextCtx.fillStyle = COLORS[value];
                    this.nextCtx.fillRect(bX, bY, scale, scale);
                    
                    // Highlight (3D effect)
                    this.nextCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    this.nextCtx.fillRect(bX, bY, scale, 2);
                    this.nextCtx.fillRect(bX, bY, 2, scale);
                    
                    // Shadow
                    this.nextCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    this.nextCtx.fillRect(bX, bY + scale - 2, scale, 2);
                    this.nextCtx.fillRect(bX + scale - 2, bY, 2, scale);
                    
                    // Border
                    this.nextCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(bX + 1, bY + 1, scale - 2, scale - 2);
                }
            });
        });
    }

    // Draw game over screen
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.font = '20px Arial';
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        if (isMobile) {
            this.ctx.fillText('TAP TO RESTART', this.canvas.width / 2, this.canvas.height / 2 + 30);
        } else {
            this.ctx.fillText('PRESS R TO RESTART', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }

    // Draw paused screen
    drawPaused() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSE', this.canvas.width / 2, this.canvas.height / 2);
    }

    // Draw start screen
    drawStartScreen() {
        const time = Date.now();
        const blink = Math.floor(time / 500) % 2 === 0; // Blink every 500ms
        
        // Black background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // CRT scanline effect
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.03)';
        for (let y = 0; y < this.canvas.height; y += 4) {
            this.ctx.fillRect(0, y, this.canvas.width, 2);
        }
        
        // Draw arcade border
        this.ctx.strokeStyle = '#0ff';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#0ff';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeRect(15, 15, this.canvas.width - 30, this.canvas.height - 30);
        this.ctx.shadowBlur = 0;
        
        // Title with glow
        this.ctx.fillStyle = '#0ff';
        this.ctx.font = 'bold 28px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#0ff';
        this.ctx.shadowBlur = 15;
        this.ctx.fillText('ARCADE', this.canvas.width / 2, this.canvas.height / 2 - 80);
        this.ctx.fillText('GAMES', this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.shadowBlur = 0;
        
        // Tetris subtitle
        this.ctx.fillStyle = '#f0f';
        this.ctx.font = '20px "Press Start 2P", monospace';
        this.ctx.shadowColor = '#f0f';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('TETRIS', this.canvas.width / 2, this.canvas.height / 2 - 10);
        this.ctx.shadowBlur = 0;
        
        // Blinking PRESS S TO START / TAP TO START
        if (blink) {
            const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
            this.ctx.fillStyle = '#ff0';
            this.ctx.font = 'bold 16px "Press Start 2P", monospace';
            this.ctx.shadowColor = '#ff0';
            this.ctx.shadowBlur = 15;
            if (isMobile) {
                this.ctx.fillText('TAP TO START', this.canvas.width / 2, this.canvas.height / 2 + 60);
            } else {
                this.ctx.fillText('PRESS S', this.canvas.width / 2, this.canvas.height / 2 + 50);
                this.ctx.fillText('TO START', this.canvas.width / 2, this.canvas.height / 2 + 75);
            }
            this.ctx.shadowBlur = 0;
        }
        
        // Decorative lines
        this.ctx.strokeStyle = '#0f0';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(50, this.canvas.height / 2 + 100);
        this.ctx.lineTo(this.canvas.width - 50, this.canvas.height / 2 + 100);
        this.ctx.stroke();
        
        // Version info
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px "Press Start 2P", monospace';
        this.ctx.fillText('VER 1.0', this.canvas.width / 2, this.canvas.height - 30);
    }
}

// ===== Input Controller =====
class InputController {
    constructor(game) {
        this.game = game;
        this.keyMap = {};
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('keydown', (e) => {
            // Prevent default browser behavior for arrow keys and space
            if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
                e.preventDefault();
            }

            this.handleInput(e.key);
        });

        // Setup touch controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        const touchButtons = {
            'btn-left': 'LEFT',
            'btn-right': 'RIGHT', 
            'btn-down': 'DOWN',
            'btn-rotate': 'ROTATE'
        };

        // Track intervals for repeat actions
        this.repeatIntervals = {};

        for (const [id, action] of Object.entries(touchButtons)) {
            const btn = document.getElementById(id);
            if (btn) {
                // Prevent default touch behavior (zoom, scroll)
                const startAction = (e) => {
                    e.preventDefault();
                    btn.classList.add('active');
                    
                    // Execute immediately
                    this.handleTouchAction(action);
                    
                    // Set up repeat for LEFT/RIGHT/DOWN (not ROTATE)
                    if (action !== 'ROTATE' && !this.repeatIntervals[action]) {
                        this.repeatIntervals[action] = setInterval(() => {
                            if (this.game.state.started && !this.game.state.gameOver && !this.game.state.paused) {
                                this.handleTouchAction(action);
                            }
                        }, 100); // Repeat every 100ms
                    }
                };

                const endAction = (e) => {
                    if (e) e.preventDefault();
                    btn.classList.remove('active');
                    
                    // Clear repeat interval
                    if (this.repeatIntervals[action]) {
                        clearInterval(this.repeatIntervals[action]);
                        this.repeatIntervals[action] = null;
                    }
                };

                btn.addEventListener('touchstart', startAction, { passive: false });
                btn.addEventListener('touchend', endAction, { passive: false });
                btn.addEventListener('touchcancel', endAction, { passive: false });

                // Also support mouse clicks for testing on desktop
                btn.addEventListener('mousedown', startAction);
                btn.addEventListener('mouseup', endAction);
                btn.addEventListener('mouseleave', endAction);
            }
        }

        // Add tap-to-start on canvas for mobile
        const canvas = document.getElementById('tetris');
        if (canvas) {
            const tapToStart = (e) => {
                // Only handle if game not started, game over, or paused
                if (!this.game.state.started || this.game.state.gameOver || this.game.state.paused) {
                    e.preventDefault();
                    if (!this.game.state.started) {
                        this.game.state.start();
                        this.game.initGame();
                    } else if (this.game.state.gameOver) {
                        this.game.restart();
                    } else if (this.game.state.paused) {
                        this.game.togglePause();
                    }
                }
            };

            canvas.addEventListener('touchstart', tapToStart, { passive: false });
            canvas.addEventListener('click', tapToStart);
        }
    }

    handleTouchAction(action) {
        // Handle start screen - any button starts
        if (!this.game.state.started) {
            this.game.state.start();
            this.game.initGame();
            return;
        }

        if (this.game.state.gameOver) {
            this.game.restart();
            return;
        }

        if (this.game.state.paused) {
            this.game.togglePause();
            return;
        }

        // Game actions
        switch(action) {
            case 'LEFT':
                this.game.movePiece(-1, 0);
                break;
            case 'RIGHT':
                this.game.movePiece(1, 0);
                break;
            case 'DOWN':
                this.game.movePiece(0, 1);
                break;
            case 'ROTATE':
                this.game.rotatePiece();
                break;
        }
    }

    handleInput(key) {
        // Handle start screen
        if (!this.game.state.started) {
            if (key === 's' || key === 'S') {
                this.game.state.start();
                this.game.initGame();
            }
            return;
        }

        if (this.game.state.gameOver) {
            if (key === 'r' || key === 'R') {
                this.game.restart();
            }
            return;
        }

        if (key === 'p' || key === 'P') {
            this.game.togglePause();
            return;
        }

        if (this.game.state.paused) return;

        switch(key) {
            case 'ArrowLeft':
                this.game.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.game.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.game.movePiece(0, 1);
                break;
            case 'ArrowUp':
            case ' ':
                this.game.rotatePiece();
                break;
        }
    }

    // Interface for CV integration
    triggerAction(action) {
        if (this.game.state.gameOver || this.game.state.paused) return;

        switch(action) {
            case 'LEFT':
                this.game.movePiece(-1, 0);
                break;
            case 'RIGHT':
                this.game.movePiece(1, 0);
                break;
            case 'DOWN':
                this.game.movePiece(0, 1);
                break;
            case 'ROTATE':
                this.game.rotatePiece();
                break;
        }
    }
}

// ===== Main Game Class =====
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.nextCanvas = document.getElementById('nextPiece');
        this.state = new GameState();
        this.board = new Board(ROWS, COLS);
        this.renderer = new Renderer(this.canvas, this.nextCanvas);
        this.input = new InputController(this);
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.init();
    }

    init() {
        // Don't create pieces yet - wait for game to start
        // Focus canvas to receive keyboard events
        this.canvas.focus();
        this.update();
    }

    initGame() {
        // Called when S is pressed
        this.currentPiece = this.createRandomPiece();
        this.nextPiece = this.createRandomPiece();
        this.renderer.drawNextPiece(this.nextPiece);
    }

    createRandomPiece() {
        const typeId = Math.floor(Math.random() * 7) + 1;
        return new Piece(typeId);
    }

    // Move piece
    movePiece(dx, dy) {
        this.currentPiece.move(dx, dy);
        
        if (this.board.collide(this.currentPiece)) {
            // Undo move
            this.currentPiece.move(-dx, -dy);
            
            // If downward move failed, lock the piece
            if (dy > 0) {
                this.lockPiece();
            }
        }
    }

    // Rotate piece
    rotatePiece() {
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = this.currentPiece.rotate();
        
        // Wall kick: if collision after rotation, try to adjust position
        let adjusted = false;
        const kicks = [0, 1, -1, 2, -2];
        
        for (let kick of kicks) {
            this.currentPiece.x += kick;
            if (!this.board.collide(this.currentPiece)) {
                adjusted = true;
                break;
            }
            this.currentPiece.x -= kick;
        }
        
        // If unable to adjust, undo rotation
        if (!adjusted) {
            this.currentPiece.shape = originalShape;
        }
    }

    // Lock piece and generate new piece
    lockPiece() {
        this.board.merge(this.currentPiece);
        
        // Screen shake effect on landing
        this.state.shakeIntensity = 5;
        
        // Check for completed lines
        const linesToClear = this.board.clearLines();
        
        if (linesToClear.length > 0) {
            // Start line clear animation
            this.state.clearingLines = linesToClear.map(y => ({
                y: y,
                flash: 0,
                maxFlash: 6 // Flash 6 times
            }));
            
            // Lines will be removed after animation completes
            setTimeout(() => {
                this.board.removeLines(linesToClear);
                this.state.addScore(linesToClear.length);
                this.state.clearingLines = [];
            }, 300); // 300ms animation
        }
        
        // Generate new piece
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        this.renderer.drawNextPiece(this.nextPiece);
        
        // Check game over
        if (this.board.collide(this.currentPiece)) {
            this.state.gameOver = true;
        }
    }

    // Toggle pause
    togglePause() {
        this.state.paused = !this.state.paused;
    }

    // Restart game
    restart() {
        this.state.reset();
        this.board.reset();
        this.currentPiece = null;
        this.nextPiece = null;
        // Game goes back to start screen, wait for S key
    }

    // Main update loop
    update(time = 0) {
        // Check if game hasn't started yet
        if (!this.state.started) {
            this.renderer.drawStartScreen();
            requestAnimationFrame((t) => this.update(t));
            return;
        }

        if (!this.state.gameOver && !this.state.paused) {
            const deltaTime = time - this.state.lastTime;
            this.state.lastTime = time;
            this.state.dropCounter += deltaTime;
            
            // Auto drop
            if (this.state.dropCounter > this.state.dropInterval) {
                this.movePiece(0, 1);
                this.state.dropCounter = 0;
            }
        }
        
        // Apply screen shake
        if (this.state.shakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.state.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.state.shakeIntensity;
            this.renderer.canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
            this.state.shakeIntensity *= 0.9; // Decay
            if (this.state.shakeIntensity < 0.1) {
                this.state.shakeIntensity = 0;
                this.renderer.canvas.style.transform = '';
            }
        }
        
        // Render
        this.renderer.drawBoard(this.board, this.state);
        if (this.currentPiece && this.state.started) {
            this.renderer.drawPiece(this.currentPiece);
        }
        
        if (this.state.gameOver) {
            this.renderer.drawGameOver();
        } else if (this.state.paused) {
            this.renderer.drawPaused();
        }
        
        requestAnimationFrame((t) => this.update(t));
    }

    // === CV Integration Interface ===
    // These methods are reserved for future CV control
    
    /**
     * Trigger game action from external sources
     * @param {string} action - Action type: 'LEFT', 'RIGHT', 'DOWN', 'ROTATE'
     */
    triggerCVAction(action) {
        this.input.triggerAction(action);
    }

    /**
     * Get current game state (for CV module to read)
     * @returns {Object} Game state data
     */
    getGameState() {
        return {
            board: this.board.grid,
            currentPiece: {
                shape: this.currentPiece?.shape,
                x: this.currentPiece?.x,
                y: this.currentPiece?.y,
                typeId: this.currentPiece?.typeId
            },
            score: this.state.score,
            level: this.state.level,
            lines: this.state.lines,
            gameOver: this.state.gameOver,
            paused: this.state.paused
        };
    }

    /**
     * Update CV status display (for debugging)
     * @param {string} message - Message to display
     */
    updateCVStatus(message) {
        const cvDebug = document.getElementById('cvDebug');
        if (cvDebug) {
            const timestamp = new Date().toLocaleTimeString();
            cvDebug.textContent = `[${timestamp}] ${message}\n` + cvDebug.textContent;
        }
    }
}

// ===== Initialize Game =====
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new TetrisGame();
    
    // Expose game instance globally for CV module to access
    window.tetrisGame = game;
    
    console.log('Tetris CV Prototype loaded');
    console.log('Access game instance via window.tetrisGame');
});
