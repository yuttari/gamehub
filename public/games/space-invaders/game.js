/**
 * Space Invaders — Arcade Collection
 */

const W = 480, H = 560, PW = 30, PH = 16, PS = 5;
const BSPD = 8, EBSPD = 4;
const ECOLS = 8, EROWS = 5, ESIZE = 24, EGAP = 12;

const C = {
    player: '#00ff00', bullet: '#ffff00', ebullet: '#ff0044',
    e1: '#ff0055', e2: '#00ffff', e3: '#ff6600',
    shield: '#00ff00', ufo: '#ff00ff',
};

const SP = {
    e1a:[[0,0,1,0,0,0,1,0,0],[0,0,0,1,0,1,0,0,0],[0,0,1,1,1,1,1,0,0],[0,1,1,0,1,0,1,1,0],[1,1,1,1,1,1,1,1,1],[1,0,1,1,1,1,1,0,1],[1,0,1,0,0,0,1,0,1],[0,0,0,1,0,1,0,0,0]],
    e1b:[[0,0,1,0,0,0,1,0,0],[1,0,0,1,0,1,0,0,1],[1,0,1,1,1,1,1,0,1],[1,1,1,0,1,0,1,1,1],[1,1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,1,0],[0,0,1,0,0,0,1,0,0],[0,1,0,0,0,0,0,1,0]],
    e2a:[[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1],[0,0,1,0,0,1,0,0],[0,1,0,1,1,0,1,0],[1,0,1,0,0,1,0,1]],
    e2b:[[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1],[0,1,0,1,1,0,1,0],[1,0,0,0,0,0,0,1],[0,1,0,0,0,0,1,0]],
    e3a:[[0,0,0,0,1,0,0,0,0],[0,0,0,1,1,1,0,0,0],[0,0,1,1,1,1,1,0,0],[0,1,1,0,1,0,1,1,0],[0,1,1,1,1,1,1,1,0],[0,0,0,1,0,1,0,0,0],[0,0,1,0,0,0,1,0,0],[0,0,0,1,0,1,0,0,0]],
    e3b:[[0,0,0,0,1,0,0,0,0],[0,0,0,1,1,1,0,0,0],[0,0,1,1,1,1,1,0,0],[0,1,1,0,1,0,1,1,0],[0,1,1,1,1,1,1,1,0],[0,0,1,0,0,0,1,0,0],[0,1,0,0,0,0,0,1,0],[1,0,0,0,0,0,0,0,1]],
    player:[[0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,1,1,1,0,0,0,0],[0,0,0,0,1,1,1,0,0,0,0],[0,1,1,1,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1]],
    ufo:[[0,0,0,0,1,1,1,1,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,0],[1,0,1,0,1,0,1,0,1,0,1,0],[1,1,1,1,1,1,1,1,1,1,1,1],[0,0,1,0,0,1,1,0,0,1,0,0]],
};

let audioCtx = null;
function initAudio() { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} }
function snd(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    if (type === 'shoot') { o.type='square'; o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(110,t+0.1); g.gain.setValueAtTime(0.15,t); g.gain.exponentialRampToValueAtTime(0.01,t+0.1); o.start(t); o.stop(t+0.1); }
    else if (type === 'hit') { o.type='square'; o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(220,t+0.05); g.gain.setValueAtTime(0.15,t); g.gain.exponentialRampToValueAtTime(0.01,t+0.1); o.start(t); o.stop(t+0.1); }
    else if (type === 'explode') { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(30,t+0.3); g.gain.setValueAtTime(0.2,t); g.gain.exponentialRampToValueAtTime(0.01,t+0.3); o.start(t); o.stop(t+0.3); }
    else if (type === 'gameover') { o.type='sawtooth'; o.frequency.setValueAtTime(440,t); o.frequency.exponentialRampToValueAtTime(55,t+1.5); g.gain.setValueAtTime(0.25,t); g.gain.exponentialRampToValueAtTime(0.01,t+1.5); o.start(t); o.stop(t+1.5); }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextWave');
const nextCtx = nextCanvas.getContext('2d');

function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const maxW = Math.min(W, window.innerWidth - 30);
    const sc = maxW / W;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = Math.floor(W * sc) + 'px';
    canvas.style.height = Math.floor(H * sc) + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    nextCtx.imageSmoothingEnabled = false;
}

// State
const g = {
    state: 'start', score: 0, hi: parseInt(localStorage.getItem('spaceInvadersHigh')) || 0,
    wave: 1, lives: 3, frame: 0, shake: 0,
    px: 0, py: 0, palive: true, respawn: 0,
    bullets: [], ebullets: [], enemies: [], shields: [], particles: [],
    ufo: null, ufoTimer: 0,
    edir: 1, espeed: 0.5, emoveT: 0, emoveI: 40, eanim: 0, eshootT: 0,
    keys: {},
};

function sprite(sp, x, y, color, ps, context) {
    context = context || ctx;
    ps = ps || 2; context.fillStyle = color;
    for (let r = 0; r < sp.length; r++)
        for (let c = 0; c < sp[r].length; c++)
            if (sp[r][c]) context.fillRect(x + c * ps, y + r * ps, ps, ps);
}

function initPlayer() { g.px = W/2 - PW/2; g.py = H - 40; g.palive = true; g.respawn = 0; }

function initEnemies() {
    g.enemies = [];
    const tw = ECOLS * (ESIZE + EGAP) - EGAP, sx = (W - tw) / 2, sy = 60;
    for (let r = 0; r < EROWS; r++)
        for (let c = 0; c < ECOLS; c++) {
            const type = r === 0 ? 1 : r < 3 ? 2 : 3;
            const color = type === 1 ? C.e1 : type === 2 ? C.e2 : C.e3;
            const pts = type === 1 ? 30 : type === 2 ? 20 : 10;
            g.enemies.push({ x: sx + c*(ESIZE+EGAP), y: sy + r*(ESIZE+EGAP), type, color, pts, alive: true });
        }
    g.espeed = 0.5 + (g.wave-1)*0.15;
    g.emoveI = Math.max(15, 40 - (g.wave-1)*3);
    g.edir = 1; g.emoveT = 0; g.eanim = 0;
}

function initShields() {
    g.shields = [];
    const n = 4, sw = 36, gap = (W - n*sw)/(n+1);
    for (let i = 0; i < n; i++) {
        const sx = gap + i*(sw+gap), sy = H - 100, px = [];
        for (let r = 0; r < 18; r++)
            for (let c = 0; c < 18; c++) {
                if (r > 12 && c > 4 && c < 13) continue;
                if (r < 3 && c < 3-r) continue;
                if (r < 3 && c > 14+r) continue;
                px.push({ x: sx+c*2, y: sy+r*2, alive: true });
            }
        g.shields.push(px);
    }
}

function startGame() {
    g.state = 'playing'; g.score = 0; g.wave = 1; g.lives = 3;
    g.bullets = []; g.ebullets = []; g.particles = []; g.ufo = null; g.ufoTimer = 0; g.eshootT = 0;
    initPlayer(); initShields(); initEnemies(); updateUI(); drawNextWave();
}

function nextWave() {
    g.wave++; g.bullets = []; g.ebullets = []; g.particles = [];
    g.ufo = null; g.ufoTimer = 0; g.eshootT = 0;
    initEnemies(); updateUI(); drawNextWave();
}

function explode(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const a = Math.PI*2*i/12, s = 1+Math.random()*3;
        g.particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, color, size: 2+Math.random()*2, life: 20+Math.random()*20 });
    }
}

function playerHit() {
    g.lives--; g.palive = false; g.respawn = 90; g.shake = 8;
    explode(g.px+PW/2, g.py+PH/2, C.player); snd('explode');
    if (g.lives <= 0) { g.state = 'gameover'; saveHi(); snd('gameover'); }
    updateUI();
}

function saveHi() { if (g.score > g.hi) { g.hi = g.score; localStorage.setItem('spaceInvadersHigh', g.hi); } }

function update() {
    if (g.state !== 'playing') return;
    g.frame++;
    if (g.shake > 0) { g.shake *= 0.9; if (g.shake < 0.3) g.shake = 0; }

    if (!g.palive) {
        g.respawn--;
        if (g.respawn <= 0) { g.palive = true; g.px = W/2 - PW/2; }
        updParticles(); return;
    }

    if (g.keys['ArrowLeft'] || g.keys['left']) g.px -= PS;
    if (g.keys['ArrowRight'] || g.keys['right']) g.px += PS;
    g.px = Math.max(5, Math.min(W-PW-5, g.px));

    g.bullets.forEach(b => b.y -= BSPD);
    g.bullets = g.bullets.filter(b => b.y > -10);
    g.ebullets.forEach(b => b.y += EBSPD);
    g.ebullets = g.ebullets.filter(b => b.y < H+10);

    // Enemy movement
    g.emoveT++;
    if (g.emoveT >= g.emoveI) {
        g.emoveT = 0; g.eanim = 1 - g.eanim;
        const live = g.enemies.filter(e => e.alive);
        let hit = false;
        live.forEach(e => { const nx = e.x + g.edir*g.espeed*10; if (nx+ESIZE > W-10 || nx < 10) hit = true; });
        if (hit) { g.edir *= -1; live.forEach(e => e.y += 12); g.emoveI = Math.max(5, g.emoveI-1); }
        else live.forEach(e => e.x += g.edir*g.espeed*10);
    }

    // Enemy shooting
    g.eshootT++;
    const si = Math.max(20, 60 - g.wave*5);
    if (g.eshootT >= si) {
        g.eshootT = 0;
        const live = g.enemies.filter(e => e.alive);
        if (live.length) {
            const cols = {};
            live.forEach(e => { const c = Math.round(e.x/(ESIZE+EGAP)); if (!cols[c] || e.y > cols[c].y) cols[c] = e; });
            const sh = Object.values(cols);
            const s = sh[Math.floor(Math.random()*sh.length)];
            g.ebullets.push({ x: s.x+ESIZE/2, y: s.y+ESIZE });
        }
    }

    // UFO
    g.ufoTimer++;
    if (!g.ufo && g.ufoTimer > 600+Math.random()*400) {
        g.ufoTimer = 0;
        const d = Math.random() > 0.5 ? 1 : -1;
        g.ufo = { x: d>0 ? -30 : W+30, y: 30, dir: d, spd: 2 };
    }
    if (g.ufo) { g.ufo.x += g.ufo.dir*g.ufo.spd; if (g.ufo.x < -40 || g.ufo.x > W+40) g.ufo = null; }

    // Collisions
    g.bullets.forEach(b => {
        g.enemies.forEach(e => {
            if (!e.alive) return;
            if (b.x > e.x && b.x < e.x+ESIZE && b.y > e.y && b.y < e.y+ESIZE) {
                e.alive = false; b.y = -100; g.score += e.pts;
                explode(e.x+ESIZE/2, e.y+ESIZE/2, e.color); snd('hit');
                const cnt = g.enemies.filter(en => en.alive).length;
                if (cnt > 0 && cnt < 10) g.emoveI = Math.max(3, g.emoveI-1);
            }
        });
        if (g.ufo && b.x > g.ufo.x && b.x < g.ufo.x+24 && b.y > g.ufo.y && b.y < g.ufo.y+12) {
            const pts = [50,100,150,300][Math.floor(Math.random()*4)];
            g.score += pts;
            explode(g.ufo.x+12, g.ufo.y+6, C.ufo);
            g.particles.push({ x: g.ufo.x, y: g.ufo.y-10, text: '+'+pts, life: 60, color: C.ufo });
            g.ufo = null; b.y = -100; snd('explode');
        }
    });

    // Bullets vs shields
    g.bullets.forEach(b => { g.shields.forEach(sh => { for (let i = sh.length-1; i >= 0; i--) { const p = sh[i]; if (p.alive && b.x >= p.x && b.x <= p.x+2 && b.y >= p.y && b.y <= p.y+2) { p.alive = false; b.y = -100; break; } } }); });
    g.ebullets.forEach(b => { g.shields.forEach(sh => { for (let i = 0; i < sh.length; i++) { const p = sh[i]; if (p.alive && b.x >= p.x && b.x <= p.x+2 && b.y >= p.y && b.y <= p.y+2) { p.alive = false; b.y = H+100; sh.forEach(np => { if (np.alive && Math.abs(np.x-p.x)<6 && Math.abs(np.y-p.y)<6 && Math.random()>0.5) np.alive = false; }); break; } } }); });

    // Enemy bullets vs player
    g.ebullets.forEach(b => {
        if (g.palive && b.x > g.px && b.x < g.px+PW && b.y > g.py && b.y < g.py+PH) { playerHit(); b.y = H+100; }
    });

    // Enemies reaching bottom
    g.enemies.forEach(e => {
        if (e.alive && e.y+ESIZE >= g.py) { g.state = 'gameover'; saveHi(); snd('gameover'); }
    });

    updParticles();
    if (g.enemies.filter(e => e.alive).length === 0) nextWave();
    g.bullets = g.bullets.filter(b => b.y > -10);
    updateUI();
}

function updParticles() {
    g.particles = g.particles.filter(p => {
        p.life--;
        if (p.vx !== undefined) { p.x += p.vx; p.y += p.vy; p.vy += 0.1; }
        return p.life > 0;
    });
}

function shoot() {
    if (g.state === 'start' || g.state === 'gameover') { if (!audioCtx) initAudio(); startGame(); return; }
    if (g.state === 'paused') { g.state = 'playing'; return; }
    if (!g.palive || g.bullets.length >= 2) return;
    if (!audioCtx) initAudio();
    g.bullets.push({ x: g.px + PW/2, y: g.py - 4 });
    snd('shoot');
}

function draw() {
    ctx.save();
    if (g.shake > 0) ctx.translate((Math.random()-0.5)*g.shake*2, (Math.random()-0.5)*g.shake*2);

    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 30; i++) {
        ctx.fillRect((i*137+g.frame*0.02)%W|0, (i*251)%H|0, 1, 1);
    }

    if (g.state === 'start') { drawStart(); ctx.restore(); return; }

    // Shields
    ctx.fillStyle = C.shield;
    g.shields.forEach(sh => sh.forEach(p => { if (p.alive) ctx.fillRect(p.x, p.y, 2, 2); }));

    // Enemies
    g.enemies.filter(e => e.alive).forEach(e => {
        let sp;
        if (e.type === 1) sp = g.eanim ? SP.e1b : SP.e1a;
        else if (e.type === 2) sp = g.eanim ? SP.e2b : SP.e2a;
        else sp = g.eanim ? SP.e3b : SP.e3a;
        const pw = 2, sw = sp[0].length*pw;
        sprite(sp, e.x+(ESIZE-sw)/2, e.y+(ESIZE-sp.length*pw)/2, e.color, pw);
    });

    // UFO
    if (g.ufo) { const p = Math.sin(g.frame*0.2) > 0; sprite(SP.ufo, g.ufo.x, g.ufo.y, p ? C.ufo : '#ff66ff', 2); }

    // Player
    if (g.palive) {
        sprite(SP.player, g.px, g.py, C.player, PW/SP.player[0].length);
    } else if (g.respawn > 0 && g.respawn % 10 < 5) {
        sprite(SP.player, W/2-PW/2, g.py, 'rgba(0,255,0,0.3)', PW/SP.player[0].length);
    }

    // Bullets
    g.bullets.forEach(b => {
        ctx.fillStyle = 'rgba(255,255,0,0.3)'; ctx.fillRect(b.x-2, b.y-2, 4, 10);
        ctx.fillStyle = C.bullet; ctx.fillRect(b.x-1, b.y, 2, 6);
    });
    g.ebullets.forEach(b => {
        ctx.fillStyle = C.ebullet;
        ctx.fillRect(b.x-1+Math.sin(b.y*0.3)*2, b.y, 2, 6);
    });

    // Particles
    g.particles.forEach(p => {
        if (p.text) {
            ctx.font = 'bold 14px "Press Start 2P",monospace';
            ctx.fillStyle = p.color; ctx.globalAlpha = p.life/60; ctx.textAlign = 'center';
            ctx.fillText(p.text, p.x, p.y-(60-p.life)*0.5); ctx.globalAlpha = 1;
        } else {
            ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, p.life/10);
            ctx.fillRect(p.x-p.size/2, p.y-p.size/2, p.size, p.size); ctx.globalAlpha = 1;
        }
    });

    // Lives
    for (let i = 0; i < g.lives; i++) sprite(SP.player, 10+i*28, H-16, C.player, 1.5);

    // Game over
    if (g.state === 'gameover') {
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H);
        ctx.font = 'bold 24px "Press Start 2P",monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ff0044'; ctx.shadowColor = '#ff0044'; ctx.shadowBlur = 15;
        ctx.fillText('GAME OVER', W/2, H/2-30); ctx.shadowBlur = 0;
        ctx.font = '16px "Press Start 2P",monospace'; ctx.fillStyle = '#fff';
        ctx.fillText('SCORE: '+g.score, W/2, H/2+10);
        if (Math.floor(Date.now()/500)%2===0) {
            ctx.fillStyle='#ffff00'; ctx.font='12px "Press Start 2P",monospace';
            const m = window.innerWidth<=768||'ontouchstart' in window;
            ctx.fillText(m?'TAP TO RESTART':'PRESS S TO RESTART', W/2, H/2+50);
        }
    }

    // Paused
    if (g.state === 'paused') {
        ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);
        ctx.font='bold 24px "Press Start 2P",monospace'; ctx.textAlign='center';
        ctx.fillStyle='#fff'; ctx.fillText('PAUSED', W/2, H/2);
    }

    ctx.restore();
}

function drawStart() {
    const blink = Math.floor(Date.now()/500)%2===0;
    ctx.strokeStyle='#ff6600'; ctx.lineWidth=3; ctx.shadowColor='#ff6600'; ctx.shadowBlur=20;
    ctx.strokeRect(15,15,W-30,H-30); ctx.shadowBlur=0;

    ctx.fillStyle='#ff6600'; ctx.font='bold 22px "Press Start 2P",monospace'; ctx.textAlign='center';
    ctx.shadowColor='#ff6600'; ctx.shadowBlur=15;
    ctx.fillText('SPACE INVADERS', W/2, H/2-80); ctx.shadowBlur=0;

    ctx.fillStyle='#00ffff'; ctx.font='14px "Press Start 2P",monospace';
    ctx.fillText('SPACE INVADERS', W/2, H/2-50);

    sprite(SP.e1a, W/2-60, H/2-20, C.e1, 3);
    sprite(SP.e2a, W/2-12, H/2-20, C.e2, 3);
    sprite(SP.e3a, W/2+30, H/2-20, C.e3, 3);

    if (blink) {
        ctx.fillStyle='#ffff00'; ctx.font='bold 14px "Press Start 2P",monospace';
        ctx.shadowColor='#ffff00'; ctx.shadowBlur=10;
        const m = window.innerWidth<=768||'ontouchstart' in window;
        ctx.fillText(m?'TAP TO START':'PRESS S TO START', W/2, H/2+60); ctx.shadowBlur=0;
    }

    ctx.font='10px "Press Start 2P",monospace'; ctx.fillStyle='#888';
    ctx.fillText('= 30pts   = 20pts   = 10pts', W/2, H/2+100);
    if (g.hi > 0) { ctx.fillStyle='#ff00ff'; ctx.fillText('HIGH SCORE: '+g.hi, W/2, H/2+130); }
    ctx.fillStyle='#444'; ctx.font='8px "Press Start 2P",monospace'; ctx.fillText('VER 1.0', W/2, H-30);
}

// Draw next wave preview
function drawNextWave() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (g.state === 'start') {
        // Show "???" for start screen
        nextCtx.font = 'bold 24px "Press Start 2P",monospace';
        nextCtx.fillStyle = '#ff6600';
        nextCtx.textAlign = 'center';
        nextCtx.textBaseline = 'middle';
        nextCtx.fillText('?', nextCanvas.width/2, nextCanvas.height/2);
        return;
    }
    
    // Calculate next wave formation
    const nextWave = g.wave + 1;
    const scale = 1.2;
    const xOffset = 15;
    const yOffset = 20;
    
    // Draw mini formation preview
    nextCtx.font = 'bold 10px "Press Start 2P",monospace';
    nextCtx.fillStyle = '#00ffff';
    nextCtx.textAlign = 'center';
    nextCtx.fillText('WAVE ' + nextWave, nextCanvas.width/2, 15);
    
    // Draw mini aliens (3 per row to fit)
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const type = r === 0 ? 1 : r < 2 ? 2 : 3;
            const color = type === 1 ? C.e1 : type === 2 ? C.e2 : C.e3;
            let sp;
            if (type === 1) sp = SP.e1a;
            else if (type === 2) sp = SP.e2a;
            else sp = SP.e3a;
            
            const x = xOffset + c * 28;
            const y = yOffset + r * 24;
            sprite(sp, x, y, color, scale, nextCtx);
        }
    }
    
    // Draw stats
    nextCtx.font = '8px "Press Start 2P",monospace';
    nextCtx.fillStyle = '#ffff00';
    nextCtx.textAlign = 'center';
    nextCtx.fillText('ENEMIES: ' + (ECOLS * EROWS), nextCanvas.width/2, 105);
}

function updateUI() {
    document.getElementById('score').textContent = g.score;
    document.getElementById('highScore').textContent = g.hi;
    document.getElementById('wave').textContent = g.wave;
    document.getElementById('lives').textContent = g.lives;
    drawNextWave();
}

// Input
document.addEventListener('keydown', e => {
    if (['ArrowLeft','ArrowRight',' ','ArrowUp'].includes(e.key)) e.preventDefault();
    g.keys[e.key] = true;
    if (e.key === ' ' || e.key === 'ArrowUp') shoot();
    if (e.key === 's' || e.key === 'S') { if (g.state==='start'||g.state==='gameover') { if(!audioCtx)initAudio(); startGame(); } }
    if (e.key === 'p' || e.key === 'P') { if(g.state==='playing') g.state='paused'; else if(g.state==='paused') g.state='playing'; }
});
document.addEventListener('keyup', e => { g.keys[e.key] = false; });

// Touch controls - updated button IDs
(function setupTouch() {
    const bL = document.getElementById('btn-left');
    const bR = document.getElementById('btn-right');
    const bF = document.getElementById('btn-fire');
    let ints = {};
    function hold(k) { g.keys[k]=true; ints[k]=setInterval(()=>{g.keys[k]=true;},50); }
    function release(k) { g.keys[k]=false; clearInterval(ints[k]); }
    if(bL){bL.addEventListener('touchstart',e=>{e.preventDefault();hold('left');},{passive:false});bL.addEventListener('touchend',e=>{e.preventDefault();release('left');},{passive:false});bL.addEventListener('touchcancel',()=>release('left'));}
    if(bR){bR.addEventListener('touchstart',e=>{e.preventDefault();hold('right');},{passive:false});bR.addEventListener('touchend',e=>{e.preventDefault();release('right');},{passive:false});bR.addEventListener('touchcancel',()=>release('right'));}
    if(bF){bF.addEventListener('touchstart',e=>{e.preventDefault();shoot();},{passive:false});}
    canvas.addEventListener('touchstart',e=>{if(g.state==='start'||g.state==='gameover'){e.preventDefault();if(!audioCtx)initAudio();startGame();}},{passive:false});
    canvas.addEventListener('click',()=>{if(g.state==='start'||g.state==='gameover'){if(!audioCtx)initAudio();startGame();}});
})();

// Game loop
function loop() { update(); draw(); requestAnimationFrame(loop); }
setupCanvas();
updateUI();
loop();
window.addEventListener('resize', setupCanvas);
