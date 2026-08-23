/**
 * Game Engine - Shared utilities for Game Collection
 * Provides common functionality for canvas, audio, input, rendering, and accessibility
 * Designed for games accessible to children with visual or motor disabilities
 */

// ─── AUDIO SYSTEM ──────────────────────────────────────────────────────────
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.volume = 0.5;
    this.muted = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  // Resume audio context (required after user interaction in some browsers)
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  setMuted(m) {
    this.muted = m;
  }

  // Play a tone with configurable parameters
  playTone({ frequency = 440, duration = 0.3, type = 'sine', volume = 0.3, ramp = true }) {
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    
    const actualVolume = volume * this.volume;
    gain.gain.setValueAtTime(actualVolume, now);
    
    if (ramp) {
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    } else {
      gain.gain.setValueAtTime(0.001, now + duration);
    }

    osc.start(now);
    osc.stop(now + duration);
  }

  // announce text to screen readers (delegated to AccessibilityManager)
  announce(text, priority = 'polite') {
    if (typeof window.a11yManager !== 'undefined' && window.a11yManager) {
      window.a11yManager.announce(text, priority);
    }
  }

  // Play a chord (multiple notes simultaneously)
  playChord(frequencies, duration = 0.3) {
    frequencies.forEach((freq, i) => {
      this.playTone({ 
        frequency: freq, 
        duration: duration, 
        volume: 0.2,
        ramp: true 
      });
    });
  }

  // Play a melody (notes in sequence)
  playMelody(notes, noteDuration = 0.2) {
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: noteDuration, volume: 0.3 });
      }, i * noteDuration * 1000);
    });
  }

  // Pre-defined sound effects
  playPop() {
    this.playTone({ 
      frequency: 800, 
      duration: 0.1, 
      type: 'sine',
      volume: 0.3 
    });
    // Frequency ramp down
    if (this.ctx) {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  playSnap() {
    this.playTone({ 
      frequency: 880, 
      duration: 0.2, 
      type: 'sine',
      volume: 0.25 
    });
  }

  playSuccess() {
    // Ta-da sound (C5 E5 G5 C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    this.playMelody(notes, 0.15);
  }

  playError() {
    this.playTone({ 
      frequency: 200, 
      duration: 0.3, 
      type: 'sawtooth',
      volume: 0.2 
    });
  }

  playExplosion() {
    const now = this.ctx?.currentTime || 0;
    if (!this.ctx) return;
    
    // Main explosion
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(200, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gain1.gain.setValueAtTime(0.2 * this.volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Crackle
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    gain2.gain.setValueAtTime(0.1 * this.volume, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc2.start(now);
    osc2.stop(now + 0.2);
  }

  playLaunch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

// ─── CANVAS UTILITIES ──────────────────────────────────────────────────────
class CanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }
    this.ctx = this.canvas.getContext('2d');
    this.resizeCallbacks = [];
    this.setupResize();
  }

  setupResize() {
    // Debounced resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resize();
        this.resizeCallbacks.forEach(cb => cb(this.canvas.width, this.canvas.height));
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  onResize(callback) {
    this.resizeCallbacks.push(callback);
  }

  clear(color = '#000000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Draw with fade effect (for trails)
  fade(alpha = 0.1, color = '#000000') {
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1.0;
  }

  get dimensions() {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  get center() {
    return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
  }
}

// ─── ACCESSIBILITY MANAGER ────────────────────────────────────────────────
class AccessibilityManager {
  constructor() {
    this.screenReaderEnabled = false;
    this.highContrast = false;
    this.largeTargets = false;
    this.keyboardNavigation = false;
    this.motorFriendly = false;
    this.announceElement = null;
    this.initAnnounceElement();
  }

  initAnnounceElement() {
    // Create aria-live region for screen reader announcements
    this.announceElement = document.createElement('div');
    this.announceElement.setAttribute('aria-live', 'polite');
    this.announceElement.setAttribute('aria-atomic', 'true');
    this.announceElement.style.position = 'absolute';
    this.announceElement.style.left = '-10000px';
    this.announceElement.style.width = '1px';
    this.announceElement.style.height = '1px';
    this.announceElement.style.overflow = 'hidden';
    document.body.appendChild(this.announceElement);
  }

  // Announce text to screen readers
  announce(text, priority = 'polite') {
    if (!this.announceElement) return;
    
    // Update aria-live if needed
    this.announceElement.setAttribute('aria-live', priority);
    this.announceElement.textContent = text;
    
    // Clear after a delay to allow re-announcement of same text
    setTimeout(() => {
      if (this.announceElement) {
        this.announceElement.textContent = '';
      }
    }, 1000);
  }

  // Check if user prefers reduced motion
  get prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Check if user prefers high contrast
  get prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  // Enable motor-friendly mode (larger targets, slower movement)
  enableMotorFriendly(enable = true) {
    this.motorFriendly = enable;
    this.largeTargets = enable;
    document.body.classList.toggle('motor-friendly', enable);
  }

  // Enable screen reader mode
  enableScreenReader(enable = true) {
    this.screenReaderEnabled = enable;
    document.body.classList.toggle('screen-reader-mode', enable);
  }

  // Enable keyboard navigation
  enableKeyboardNavigation(enable = true) {
    this.keyboardNavigation = enable;
    document.body.classList.toggle('keyboard-navigation', enable);
  }

  // Get accessible colors
  getAccessibleColors() {
    if (this.highContrast || this.prefersHighContrast) {
      return {
        red: '#FF0000',
        green: '#00FF00',
        blue: '#0000FF',
        yellow: '#FFFF00',
        magenta: '#FF00FF',
        cyan: '#00FFFF',
        orange: '#FF8800',
        white: '#FFFFFF',
        black: '#000000'
      };
    }
    return {
      red: '#ff6b6b',
      green: '#6bff6b',
      blue: '#6b6bff',
      yellow: '#ffff6b',
      magenta: '#ff6bff',
      cyan: '#6bffff',
      orange: '#ffaa6b',
      white: '#ffffff',
      black: '#000000'
    };
  }

  // Get target size (larger for motor-friendly mode)
  getTargetSize(baseSize = 44) {
    if (this.largeTargets || this.motorFriendly) {
      return baseSize * 1.5;
    }
    return baseSize;
  }

  // Focus indicator styles
  addFocusStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus,
      .keyboard-navigation button:focus,
      .keyboard-navigation a:focus,
      .keyboard-navigation [tabindex]:focus {
        outline: 3px solid #FFD700 !important;
        outline-offset: 2px !important;
      }
      .motor-friendly .game-canvas {
        cursor: pointer;
      }
      .screen-reader-mode .sr-only {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }
}

// ─── INPUT HANDLER ─────────────────────────────────────────────────────────
class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.listeners = {};
    this.setupListeners();
  }

  setupListeners() {
    // Mouse/Touch events
    this.canvas.addEventListener('click', (e) => this.handlePointer(e, 'click'));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handlePointer(e, 'touch');
    }, { passive: false });

    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKey(e));
  }

  handlePointer(e, type) {
    const rect = this.canvas.getBoundingClientRect();
    let x, y;

    if (type === 'touch' && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    this.emit('pointer', { x, y, type, originalEvent: e });
  }

  handleKey(e) {
    const keyMap = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Space': 'space',
      'Enter': 'enter',
      'Escape': 'escape',
      'Tab': 'tab'
    };

    const action = keyMap[e.code] || e.key.toLowerCase();
    
    if (action) {
      this.emit('keyboard', { key: e.key, code: e.code, action, originalEvent: e });
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    const idx = this.listeners[event].indexOf(callback);
    if (idx > -1) {
      this.listeners[event].splice(idx, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}

// ─── PARTICLE SYSTEM ───────────────────────────────────────────────────────
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  add(particle) {
    this.particles.push(particle);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  clear() {
    this.particles = [];
  }
}

// Base Particle class
class Particle {
  constructor(x, y, color, options = {}) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.gravity = options.gravity || 0;
    this.friction = options.friction || 1;
    this.alpha = options.alpha || 1;
    this.decay = options.decay || 0.02;
    this.size = options.size || 5;
    this.grow = options.grow || 0;
    this.rotation = options.rotation || 0;
    this.rotationSpeed = options.rotationSpeed || 0;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    this.size += this.grow;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0, this.size), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.alpha <= 0;
  }
}

// ─── ANIMATION UTILITIES ──────────────────────────────────────────────────
class Animator {
  constructor() {
    this.animations = [];
  }

  // Easing functions
  static easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeOut(t) {
    return t * (2 - t);
  }

  static easeIn(t) {
    return t * t;
  }

  static elastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  }

  // Simple tween
  tween(options) {
    const {
      from = 0,
      to = 1,
      duration = 300,
      easing = Animator.easeInOut,
      onUpdate,
      onComplete
    } = options;

    const startTime = performance.now();
    const range = to - from;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easing(progress);
      const value = from + range * eased;

      if (onUpdate) onUpdate(value, progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  // Pulse animation (scale up and down)
  pulse(options) {
    const {
      target,
      scale = 1.2,
      duration = 300,
      onUpdate
    } = options;

    this.tween({
      from: 1,
      to: scale,
      duration: duration / 2,
      easing: Animator.easeOut,
      onUpdate: (value) => {
        if (onUpdate) onUpdate(value);
      },
      onComplete: () => {
        this.tween({
          from: scale,
          to: 1,
          duration: duration / 2,
          easing: Animator.easeIn,
          onUpdate: (value) => {
            if (onUpdate) onUpdate(value);
          }
        });
      }
    });
  }
}

// ─── GAME LOOP ─────────────────────────────────────────────────────────────
class GameLoop {
  constructor(updateFn, drawFn) {
    this.updateFn = updateFn;
    this.drawFn = drawFn;
    this.running = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
  }

  loop(currentTime) {
    if (!this.running) return;

    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update FPS
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }

    if (this.updateFn) this.updateFn(this.deltaTime);
    if (this.drawFn) this.drawFn();

    requestAnimationFrame((time) => this.loop(time));
  }

  getFPS() {
    return this.fps;
  }
}

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────
const Utils = {
  // Random number in range
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Random integer in range
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Random item from array
  randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Clamp value to range
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // Linear interpolation
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  // Distance between two points
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Check if point is inside circle
  pointInCircle(px, py, cx, cy, radius) {
    return this.distance(px, py, cx, cy) <= radius;
  },

  // Check if point is inside rectangle
  pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Format time
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  },

  // Create offscreen canvas
  createOffscreenCanvas(width, height) {
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(width, height);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
};

// ─── MODULE EXPORTS ──────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AudioEngine,
    CanvasEngine,
    AccessibilityManager,
    InputHandler,
    ParticleSystem,
    Particle,
    Animator,
    GameLoop,
    Utils
  };
}

// ─── GLOBAL ACCESS ─────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.GameEngine = {
    AudioEngine,
    CanvasEngine,
    AccessibilityManager,
    InputHandler,
    ParticleSystem,
    Particle,
    Animator,
    GameLoop,
    Utils
  };
}
