/**
 * Accessibility Panel - Provides game settings for players with disabilities
 * Can be included in any game to enable customization
 */

class AccessibilityPanel {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.onChange = options.onChange || (() => {});
    this.settings = {
      motorFriendly: false,
      screenReader: false,
      highContrast: false,
      largeTargets: false,
      reducedMotion: false,
      soundEnabled: true,
      keyboardNavigation: false
    };
    this.panel = null;
    this.toggleBtn = null;
    this.init();
  }

  init() {
    this.createToggleButton();
    this.createPanel();
    this.loadSettings();
    
    // Listen for system preferences
    this.setupSystemPreferenceListeners();
  }

  createToggleButton() {
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.id = 'accessibilityToggle';
    this.toggleBtn.innerHTML = '♿';
    this.toggleBtn.setAttribute('aria-label', 'Open accessibility settings');
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.toggleBtn.title = 'Accessibility Settings';
    
    Object.assign(this.toggleBtn.style, {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.5)',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      zIndex: '100',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    });

    this.toggleBtn.addEventListener('mouseenter', () => {
      this.toggleBtn.style.background = 'rgba(255, 255, 255, 0.3)';
      this.toggleBtn.style.transform = 'scale(1.1)';
    });

    this.toggleBtn.addEventListener('mouseleave', () => {
      this.toggleBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      this.toggleBtn.style.transform = 'scale(1)';
    });

    this.toggleBtn.addEventListener('click', () => this.togglePanel());
    this.toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.togglePanel();
      }
    });

    this.container.appendChild(this.toggleBtn);
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.id = 'accessibilityPanel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Accessibility Settings');
    this.panel.setAttribute('aria-hidden', 'true');
    
    Object.assign(this.panel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(0)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      maxWidth: '450px',
      width: '90%',
      color: 'white',
      zIndex: '200',
      opacity: '0',
      transition: 'all 0.3s ease',
      pointerEvents: 'none'
    });

    this.panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <div style="font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
          ♿ Accessibility Settings
        </div>
        <button id="closeAccessibility" aria-label="Close accessibility settings" 
          style="background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 36px; height: 36px; 
          color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>

      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 12px;">
        <p style="margin: 0 0 8px 0; font-size: 16px;">🔊 Sound</p>
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="soundEnabled" checked style="width: 22px; height: 22px; margin-right: 12px; cursor: pointer;">
          <span>Enable sound effects</span>
        </label>
      </div>

      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 12px;">
        <p style="margin: 0 0 8px 0; font-size: 16px;">⌨️ Motor Accessibility</p>
        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
          <input type="checkbox" id="motorFriendly" style="width: 22px; height: 22px; margin-right: 12px; cursor: pointer;">
          <span>Larger targets &amp; slower movement</span>
        </label>
        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
          <input type="checkbox" id="largeTargets" style="width: 22px; height: 22px; margin-right: 12px; cursor: pointer;">
          <span>Extra-large tap targets (44px+)</span>
        </label>
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="keyboardNavigation" style="width: 22px; height: 22px; margin-right: 12px; cursor: pointer;">
          <span>Keyboard controls</span>
        </label>
      </div>

      <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 12px;">
        <p style="margin: 0 0 8px 0; font-size: 16px;">👁️ Visual Accessibility</p>
        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
          <input type="checkbox" id="highContrast" style="width: 22px; height: 22px; margin-right: 12px; cursor: pointer;">
          <span>High contrast colors</span>
        </label>
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="reducedMotion" style="width: 22px; height: 22px; margin-right: 12px; cursor: pointer;">
          <span>Reduce motion/animations</span>
        </label>
      </div>

      <div style="margin-bottom: 20px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 12px;">
        <p style="margin: 0 0 8px 0; font-size: 16px;">🔊 Screen Reader Support</p>
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="screenReader" style="width: 22px; height: 22px; margin-right: 12px; cursor: pointer;">
          <span>Enable screen reader announcements</span>
        </label>
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="resetAccessibility" style="flex: 1; padding: 12px; border: 2px solid rgba(255,255,255,0.5); 
          border-radius: 10px; background: rgba(255,255,255,0.1); color: white; font-size: 16px; cursor: pointer;">
          Reset to Defaults
        </button>
        <button id="applyAccessibility" style="flex: 1; padding: 12px; border: none; border-radius: 10px; 
          background: white; color: #667eea; font-size: 16px; font-weight: bold; cursor: pointer;">
          Apply Settings
        </button>
      </div>

      <div id="accessibilityHelp" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); 
        border-radius: 8px; font-size: 14px; line-height: 1.4;">
        <strong>Keyboard Shortcuts:</strong><br>
        Tab = Navigate elements<br>
        Enter/Space = Activate<br>
        Arrow keys = Move/Adjust<br>
        Escape = Close menus
      </div>
    `;

    this.container.appendChild(this.panel);

    // Add event listeners
    document.getElementById('closeAccessibility').addEventListener('click', () => this.closePanel());
    document.getElementById('applyAccessibility').addEventListener('click', () => this.applySettings());
    document.getElementById('resetAccessibility').addEventListener('click', () => this.resetSettings());

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.closePanel();
      }
    });

    // Close on overlay click
    this.panel.addEventListener('click', (e) => {
      if (e.target === this.panel) {
        this.closePanel();
      }
    });
  }

  togglePanel() {
    if (this.isOpen()) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    this.panel.style.opacity = '1';
    this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
    this.panel.style.pointerEvents = 'auto';
    this.panel.setAttribute('aria-hidden', 'false');
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    
    // Sync checkboxes with current settings
    this.syncCheckboxes();
  }

  closePanel() {
    this.panel.style.opacity = '0';
    this.panel.style.transform = 'translate(-50%, -50%) scale(0)';
    this.panel.style.pointerEvents = 'none';
    this.panel.setAttribute('aria-hidden', 'true');
    this.toggleBtn.setAttribute('aria-expanded', 'false');
  }

  isOpen() {
    return this.panel.getAttribute('aria-hidden') === 'false';
  }

  syncCheckboxes() {
    const checkboxes = [
      'soundEnabled', 'motorFriendly', 'largeTargets', 'keyboardNavigation',
      'highContrast', 'reducedMotion', 'screenReader'
    ];
    
    checkboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = this.settings[id];
      }
    });
  }

  applySettings() {
    const checkboxes = [
      'soundEnabled', 'motorFriendly', 'largeTargets', 'keyboardNavigation',
      'highContrast', 'reducedMotion', 'screenReader'
    ];

    checkboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        this.settings[id] = checkbox.checked;
      }
    });

    this.saveSettings();
    this.applyToPage();
    this.onChange(this.settings);
    this.closePanel();
  }

  resetSettings() {
    this.settings = {
      motorFriendly: false,
      screenReader: false,
      highContrast: false,
      largeTargets: false,
      reducedMotion: false,
      soundEnabled: true,
      keyboardNavigation: false
    };
    
    this.syncCheckboxes();
    this.saveSettings();
    this.applyToPage();
    this.onChange(this.settings);
  }

  applyToPage() {
    // Apply CSS classes based on settings
    document.body.classList.toggle('motor-friendly', this.settings.motorFriendly);
    document.body.classList.toggle('screen-reader-mode', this.settings.screenReader);
    document.body.classList.toggle('high-contrast', this.settings.highContrast);
    document.body.classList.toggle('large-targets', this.settings.largeTargets);
    document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);
    document.body.classList.toggle('keyboard-navigation', this.settings.keyboardNavigation);

    // Add/remove focus styles
    if (this.settings.keyboardNavigation) {
      this.addFocusStyles();
    }
  }

  addFocusStyles() {
    if (document.getElementById('a11y-focus-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'a11y-focus-styles';
    style.textContent = `
      .keyboard-navigation *:focus,
      .keyboard-navigation button:focus,
      .keyboard-navigation a:focus,
      .keyboard-navigation [tabindex]:focus {
        outline: 4px solid #FFD700 !important;
        outline-offset: 3px !important;
      }
      .motor-friendly .game-canvas {
        cursor: pointer !important;
      }
      .large-targets button,
      .large-targets a,
      .large-targets [role="button"] {
        min-height: 48px !important;
        min-width: 48px !important;
      }
      .high-contrast * {
        border-width: 2px !important;
      }
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('gameCollectionAccessibility');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
        this.applyToPage();
      }
    } catch (e) {
      console.warn('Could not load accessibility settings:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('gameCollectionAccessibility', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save accessibility settings:', e);
    }
  }

  setupSystemPreferenceListeners() {
    // Listen for prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.settings.reducedMotion = true;
        this.applyToPage();
      }
    });

    // Listen for prefers-contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    contrastQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.settings.highContrast = true;
        this.applyToPage();
      }
    });
  }

  getSettings() {
    return { ...this.settings };
  }

  destroy() {
    if (this.panel) {
      this.panel.remove();
    }
    if (this.toggleBtn) {
      this.toggleBtn.remove();
    }
  }
}

// ─── GLOBAL ACCESS ─────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.AccessibilityPanel = AccessibilityPanel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AccessibilityPanel };
}
