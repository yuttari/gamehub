"""Generate Poki-style cover SVGs for all games.

Design language:
- Bright vibrant gradient backgrounds (NOT dark)
- Big cartoon character / scene in the center (Poki-look)
- Subtle radial highlight + decorative confetti dots
- Glossy 3D feel via gradients + white highlights + soft shadows
- Dark semi-transparent title pill at the bottom (or accent pill)
"""

import json, os, textwrap

OUT = 'public/covers'

# ---------- Poki-style template ----------
def template(bg1, bg2, hl_color, pill_bg, pill_text, scene, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{bg1}"/>
      <stop offset="1" stop-color="{bg2}"/>
    </linearGradient>
    <radialGradient id="hl" cx="0.25" cy="0.18" r="0.85">
      <stop offset="0" stop-color="{hl_color}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="{hl_color}" stop-opacity="0"/>
    </radialGradient>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>
      <feOffset dx="0" dy="3" result="o"/>
      <feFlood flood-color="black" flood-opacity="0.28"/>
      <feComposite in2="o" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="bigsh" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
      <feOffset dx="0" dy="6" result="o"/>
      <feFlood flood-color="black" flood-opacity="0.35"/>
      <feComposite in2="o" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <rect width="400" height="300" fill="url(#hl)"/>
  {scene}
  <rect x="80" y="246" width="240" height="42" rx="21" fill="{pill_bg}" opacity="0.82"/>
  <text x="200" y="273" font-size="19" font-weight="900" fill="{pill_text}" text-anchor="middle"
        font-family="'Inter','Helvetica Neue',Arial,sans-serif" letter-spacing="2">{title}</text>
</svg>'''

# ---------- Scene fragments per game (centered, ~400x300) ----------
SCENES = {}

# --- 2048 Merge ---
SCENES['2048'] = '''
  <g filter="url(#sh)">
    <!-- four tiles arranged in 2x2 + one big 1024 in front -->
    <g transform="translate(70,80)">
      <rect width="78" height="78" rx="12" fill="#edc22e"/>
      <text x="39" y="55" font-size="34" font-weight="900" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">2</text>
    </g>
    <g transform="translate(156,72)">
      <rect width="92" height="92" rx="14" fill="#f59563"/>
      <text x="46" y="64" font-size="42" font-weight="900" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">64</text>
    </g>
    <g transform="translate(256,82)">
      <rect width="78" height="78" rx="12" fill="#f67c5f"/>
      <text x="39" y="55" font-size="32" font-weight="900" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">8</text>
    </g>
    <g transform="translate(110,168)">
      <rect width="74" height="74" rx="12" fill="#f2b179"/>
      <text x="37" y="52" font-size="30" font-weight="900" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">4</text>
    </g>
    <g transform="translate(195,160)">
      <rect width="118" height="118" rx="18" fill="#5db8ff" filter="url(#bigsh)"/>
      <text x="59" y="80" font-size="58" font-weight="900" fill="#fff" text-anchor="middle" font-family="Inter,sans-serif">1024</text>
      <rect x="6" y="6" width="106" height="32" rx="14" fill="rgba(255,255,255,0.25)"/>
    </g>
  </g>
  <g opacity="0.5" fill="#fff">
    <circle cx="40" cy="40" r="5"/>
    <circle cx="360" cy="220" r="4"/>
    <circle cx="370" cy="40" r="3"/>
  </g>
'''

# --- Snake (cute coiled snake) ---
SCENES['snake'] = '''
  <g filter="url(#sh)" transform="translate(200,130)">
    <path d="M -90 0 Q -70 -60 0 -50 Q 80 -45 90 20 Q 95 70 30 60 Q -10 55 -30 30 Q -50 5 -80 20 Q -110 35 -90 0 Z"
          fill="#3fbf6a" stroke="#2a9d4f" stroke-width="3"/>
    <path d="M -90 0 Q -70 -60 0 -50 Q 80 -45 90 20 Q 95 70 30 60 Q -10 55 -30 30 Q -50 5 -80 20 Q -110 35 -90 0 Z"
          fill="url(#bg)" opacity="0"/>
    <!-- belly stripe -->
    <path d="M -85 -3 Q -65 -55 0 -45 Q 75 -40 85 18 Q 88 55 30 50 Q 0 45 -28 25"
          stroke="#fff7d6" stroke-width="14" fill="none" opacity="0.5" stroke-linecap="round"/>
    <!-- head highlight -->
    <ellipse cx="-70" cy="-30" rx="42" ry="22" fill="#9dffc4" opacity="0.7"/>
    <!-- eye -->
    <circle cx="-72" cy="-35" r="9" fill="#fff"/>
    <circle cx="-70" cy="-33" r="5" fill="#0d0f2"/>
    <circle cx="-68" cy="-35" r="2" fill="#fff"/>
    <!-- smile -->
    <path d="M -95 -10 Q -85 -3 -75 -8" stroke="#0d3a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- tongue -->
    <path d="M -100 -8 L -120 -10 L -110 -6 Z" fill="#ff3b5c"/>
  </g>
  <!-- bean -->
  <g transform="translate(330,60)">
    <circle r="14" fill="#ffd23f" filter="url(#sh)"/>
    <ellipse cx="-4" cy="-4" rx="5" ry="3" fill="#fff" opacity="0.7"/>
  </g>
'''

# --- Snake Pro (neon cyber) ---
SCENES['snake-pro'] = '''
  <g filter="url(#sh)">
    <path d="M 40 160 Q 100 100 160 130 Q 220 160 280 110 Q 340 70 360 130"
          stroke="#7c3aed" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M 40 160 Q 100 100 160 130 Q 220 160 280 110 Q 340 70 360 130"
          stroke="#22d3ee" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.9"/>
    <circle cx="360" cy="130" r="14" fill="#22d3ee"/>
    <circle cx="360" cy="130" r="6" fill="#0a0c18"/>
  </g>
  <g opacity="0.6">
    <circle cx="50" cy="60" r="2" fill="#fff"/>
    <circle cx="120" cy="40" r="3" fill="#fff"/>
    <circle cx="300" cy="220" r="2" fill="#fff"/>
  </g>
'''

# --- Pac-Man ---
SCENES['pacman'] = '''
  <g filter="url(#sh)">
    <!-- maze corners -->
    <rect x="40" y="50" width="320" height="200" rx="14" fill="#0a0c18"/>
    <g fill="#1d2b8a">
      <rect x="60" y="80" width="60" height="14" rx="5"/>
      <rect x="200" y="80" width="80" height="14" rx="5"/>
      <rect x="60" y="140" width="40" height="14" rx="5"/>
      <rect x="180" y="140" width="40" height="14" rx="5"/>
      <rect x="290" y="140" width="50" height="14" rx="5"/>
      <rect x="100" y="180" width="80" height="14" rx="5"/>
      <rect x="240" y="180" width="80" height="14" rx="5"/>
    </g>
    <!-- dots -->
    <g fill="#ffe14d">
      <circle cx="135" cy="110" r="4"/><circle cx="155" cy="110" r="4"/>
      <circle cx="240" cy="110" r="4"/><circle cx="260" cy="110" r="4"/>
      <circle cx="135" cy="200" r="4"/><circle cx="200" cy="200" r="4"/>
      <circle cx="320" cy="200" r="4"/>
    </g>
    <!-- power pellet -->
    <circle cx="80" cy="200" r="8" fill="#ffe14d"/>
    <!-- pacman (chomped) -->
    <g transform="translate(280,110)">
      <path d="M 0 0 L 22 -22 A 31 31 0 1 1 22 22 Z" fill="#ffe14d"/>
      <circle cx="14" cy="-4" r="3" fill="#0a0c18"/>
    </g>
    <!-- ghost -->
    <g transform="translate(120,200)">
      <path d="M -14 0 Q -14 -16 0 -16 Q 14 -16 14 0 L 14 10 L 10 6 L 6 10 L 2 6 L -2 10 L -6 6 L -10 10 L -14 6 Z" fill="#ff5e7a"/>
      <circle cx="-5" cy="-6" r="3" fill="#fff"/>
      <circle cx="5" cy="-6" r="3" fill="#fff"/>
      <circle cx="-5" cy="-6" r="1.5" fill="#0a0c18"/>
      <circle cx="5" cy="-6" r="1.5" fill="#0a0c18"/>
    </g>
  </g>
'''

# --- Breakout Storm ---
SCENES['breakout'] = '''
  <g filter="url(#sh)">
    <!-- bricks -->
    <g>
      <rect x="50" y="50" width="50" height="22" rx="4" fill="#ff4d6d"/>
      <rect x="105" y="50" width="50" height="22" rx="4" fill="#ff9f1c"/>
      <rect x="160" y="50" width="50" height="22" rx="4" fill="#ffd23f"/>
      <rect x="215" y="50" width="50" height="22" rx="4" fill="#52e09a"/>
      <rect x="270" y="50" width="50" height="22" rx="4" fill="#5ec8ff"/>
      <rect x="325" y="50" width="35" height="22" rx="4" fill="#b07dff"/>
      <rect x="50" y="78" width="50" height="22" rx="4" fill="#ff9f1c"/>
      <rect x="105" y="78" width="50" height="22" rx="4" fill="#ffd23f"/>
      <rect x="160" y="78" width="50" height="22" rx="4" fill="#52e09a"/>
      <rect x="215" y="78" width="50" height="22" rx="4" fill="#5ec8ff"/>
      <rect x="270" y="78" width="50" height="22" rx="4" fill="#b07dff"/>
      <rect x="325" y="78" width="35" height="22" rx="4" fill="#ff4d6d"/>
    </g>
    <!-- ball -->
    <g transform="translate(200,160)">
      <circle r="14" fill="#fff" filter="url(#sh)"/>
      <ellipse cx="-4" cy="-4" rx="5" ry="3" fill="#fff" opacity="0.9"/>
      <ellipse cx="2" cy="2" rx="3" ry="2" fill="#9bbcff" opacity="0.6"/>
    </g>
    <!-- paddle -->
    <rect x="140" y="220" width="120" height="16" rx="8" fill="#22d3ee"/>
    <rect x="142" y="222" width="116" height="5" rx="3" fill="#a8f4ff" opacity="0.7"/>
  </g>
  <!-- speed tail -->
  <g opacity="0.7">
    <circle cx="170" cy="160" r="9" fill="rgba(255,255,255,0.4)"/>
    <circle cx="150" cy="170" r="6" fill="rgba(255,255,255,0.3)"/>
  </g>
'''

# --- Match-3 (already good, enhance) ---
SCENES['match3'] = '''
  <g filter="url(#sh)" transform="translate(95,55)">
    <g>
      <!-- 4x4 gem grid -->
      <g><rect x="0" y="0" width="46" height="46" rx="10" fill="#ff4d6d"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(54,0)"><rect width="46" height="46" rx="10" fill="#ffa24d"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(108,0)"><rect width="46" height="46" rx="10" fill="#ffe14d"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(162,0)"><rect width="46" height="46" rx="10" fill="#7CFC8A"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(0,54)"><rect width="46" height="46" rx="10" fill="#5db8ff"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(54,54)"><rect width="46" height="46" rx="10" fill="#b07dff"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(108,54)"><rect width="46" height="46" rx="10" fill="#ff4d6d"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(162,54)"><rect width="46" height="46" rx="10" fill="#ffa24d"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(0,108)"><rect width="46" height="46" rx="10" fill="#ffe14d"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(54,108)"><rect width="46" height="46" rx="10" fill="#5db8ff"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(108,108)"><rect width="46" height="46" rx="10" fill="#b07dff"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
      <g transform="translate(162,108)"><rect width="46" height="46" rx="10" fill="#7CFC8A"/><circle cx="23" cy="20" r="9" fill="#fff" opacity="0.4"/></g>
    </g>
  </g>
  <!-- sparkles -->
  <g fill="#fff" opacity="0.85">
    <path d="M 360 70 l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 z"/>
    <path d="M 40 200 l 3 8 l 8 3 l -8 3 l -3 8 l -3 -8 l -8 -3 l 8 -3 z"/>
  </g>
'''

# --- Tetris (falling tetrominoes) ---
SCENES['tetris'] = '''
  <g filter="url(#sh)">
    <!-- background grid hint -->
    <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
      <line x1="0" y1="200" x2="400" y2="200"/><line x1="0" y1="230" x2="400" y2="230"/>
      <line x1="0" y1="170" x2="400" y2="170"/>
    </g>
    <!-- stacked base -->
    <g>
      <rect x="60" y="200" width="34" height="34" rx="4" fill="#a78bfa"/>
      <rect x="94" y="200" width="34" height="34" rx="4" fill="#a78bfa"/>
      <rect x="128" y="200" width="34" height="34" rx="4" fill="#a78bfa"/>
      <rect x="162" y="200" width="34" height="34" rx="4" fill="#a78bfa"/>
      <rect x="94" y="166" width="34" height="34" rx="4" fill="#22d3ee"/>
      <rect x="128" y="166" width="34" height="34" rx="4" fill="#22d3ee"/>
      <rect x="60" y="166" width="34" height="34" rx="4" fill="#22d3ee"/>
    </g>
    <!-- falling piece (T) -->
    <g transform="translate(230,80)">
      <rect width="34" height="34" rx="4" fill="#ffd23f"/>
      <rect x="34" y="0" width="34" height="34" rx="4" fill="#ffd23f"/>
      <rect x="68" y="0" width="34" height="34" rx="4" fill="#ffd23f"/>
      <rect x="34" y="34" width="34" height="34" rx="4" fill="#ffd23f"/>
    </g>
    <!-- falling piece (L) -->
    <g transform="translate(50,70)" opacity="0.9">
      <rect width="30" height="30" rx="4" fill="#ff4d6d"/>
      <rect y="30" width="30" height="30" rx="4" fill="#ff4d6d"/>
      <rect y="60" width="30" height="30" rx="4" fill="#ff4d6d"/>
      <rect x="30" y="60" width="30" height="30" rx="4" fill="#ff4d6d"/>
    </g>
  </g>
'''

# --- Tank Battle ---
SCENES['tank'] = '''
  <g filter="url(#sh)" transform="translate(200,160)">
    <!-- tank body -->
    <rect x="-70" y="-25" width="140" height="50" rx="10" fill="#84cc16"/>
    <rect x="-66" y="-20" width="132" height="22" rx="6" fill="#a3e635"/>
    <!-- cannon -->
    <rect x="-10" y="-12" width="100" height="14" rx="5" fill="#65a30d"/>
    <rect x="-10" y="-10" width="100" height="6" rx="3" fill="#bef264"/>
    <!-- turret top -->
    <circle cx="-10" cy="0" r="22" fill="#65a30d"/>
    <circle cx="-10" cy="0" r="14" fill="#84cc16"/>
    <!-- tracks -->
    <rect x="-80" y="25" width="160" height="22" rx="10" fill="#3f6212"/>
    <circle cx="-60" cy="36" r="10" fill="#65a30d"/>
    <circle cx="-30" cy="36" r="10" fill="#65a30d"/>
    <circle cx="0" cy="36" r="10" fill="#65a30d"/>
    <circle cx="30" cy="36" r="10" fill="#65a30d"/>
    <circle cx="60" cy="36" r="10" fill="#65a30d"/>
    <!-- muzzle flash -->
    <circle cx="100" cy="-6" r="8" fill="#ffd23f"/>
    <circle cx="100" cy="-6" r="4" fill="#fff"/>
  </g>
  <!-- ground -->
  <rect x="0" y="225" width="400" height="20" fill="rgba(0,0,0,0.15)"/>
'''

# --- Plane War (fighter jet) ---
SCENES['plane'] = '''
  <g filter="url(#sh)" transform="translate(200,140)">
    <!-- body -->
    <path d="M -100 0 L -60 -14 L 60 -10 L 100 -4 L 100 4 L 60 10 L -60 14 Z" fill="#ff4d12"/>
    <path d="M -100 0 L -60 -14 L 60 -10 L 100 -4 L 100 4 L 60 10 L -60 14 Z" fill="rgba(255,255,255,0.2)"/>
    <!-- wings -->
    <path d="M -10 -8 L -30 -55 L 20 -55 L 30 -8 Z" fill="#c42803"/>
    <path d="M -10 8 L -30 55 L 20 55 L 30 8 Z" fill="#c42803"/>
    <!-- cockpit -->
    <ellipse cx="30" cy="0" rx="22" ry="10" fill="#22d3ee"/>
    <ellipse cx="30" cy="-3" rx="14" ry="5" fill="#a8f4ff" opacity="0.9"/>
    <!-- tail fin -->
    <path d="M -80 -8 L -100 -30 L -78 -14 Z" fill="#7e220d"/>
    <!-- flames -->
    <path d="M -100 0 L -130 -6 L -120 0 L -130 6 Z" fill="#ffd23f"/>
    <path d="M -100 0 L -120 -3 L -114 0 L -120 3 Z" fill="#fff"/>
  </g>
  <!-- clouds -->
  <g fill="rgba(255,255,255,0.65)">
    <ellipse cx="60" cy="60" rx="30" ry="10"/>
    <ellipse cx="340" cy="220" rx="36" ry="10"/>
  </g>
'''

# --- Fruit Catcher ---
SCENES['fruit-catcher'] = '''
  <g filter="url(#sh)">
    <!-- basket -->
    <g transform="translate(200,205)">
      <path d="M -65 -10 Q -70 30 -50 40 L 50 40 Q 70 30 65 -10 Z" fill="#a05a2c"/>
      <path d="M -65 -10 Q -70 30 -50 40 L 50 40 Q 70 30 65 -10 Z" fill="rgba(255,255,255,0.18)"/>
      <g stroke="#7c4220" stroke-width="3" fill="none">
        <path d="M -50 -10 Q -52 30 -38 40"/>
        <path d="M -25 -10 Q -27 30 -18 40"/>
        <path d="M 0 -10 Q 0 30 0 40"/>
        <path d="M 25 -10 Q 27 30 18 40"/>
        <path d="M 50 -10 Q 52 30 38 40"/>
      </g>
    </g>
    <!-- falling fruits -->
    <g transform="translate(110,80)">
      <circle r="20" fill="#ff4d12"/>
      <ellipse cx="-5" cy="-6" rx="6" ry="3" fill="#fff" opacity="0.5"/>
      <path d="M 0 -20 Q 5 -26 12 -22" stroke="#3f6212" stroke-width="3" fill="none"/>
    </g>
    <g transform="translate(160,50)">
      <ellipse cx="0" cy="0" rx="18" ry="20" fill="#ffd23f"/>
      <ellipse cx="-5" cy="-6" rx="6" ry="3" fill="#fff" opacity="0.5"/>
    </g>
    <g transform="translate(250,60)">
      <circle r="18" fill="#7CFC8A"/>
      <ellipse cx="-5" cy="-5" rx="6" ry="3" fill="#fff" opacity="0.5"/>
    </g>
    <g transform="translate(310,110)">
      <circle r="16" fill="#b07dff"/>
      <circle cx="-3" cy="-3" r="3" fill="#fff" opacity="0.6"/>
    </g>
  </g>
'''

# --- Whack-a-Mole ---
SCENES['whack-mole'] = '''
  <g filter="url(#sh)">
    <!-- ground -->
    <rect x="0" y="190" width="400" height="60" fill="#84cc16"/>
    <!-- 3 moles in holes -->
    <g transform="translate(90,180)">
      <ellipse cx="0" cy="35" rx="50" ry="12" fill="#3f6212"/>
      <ellipse cx="0" cy="20" rx="38" ry="20" fill="#a05a2c"/>
      <ellipse cx="-12" cy="8" rx="4" ry="5" fill="#fff"/><circle cx="-12" cy="9" r="2" fill="#0d0f1a"/>
      <ellipse cx="12" cy="8" rx="4" ry="5" fill="#fff"/><circle cx="12" cy="9" r="2" fill="#0d0f1a"/>
      <ellipse cx="0" cy="22" rx="6" ry="4" fill="#ff5e7a"/>
    </g>
    <g transform="translate(200,180)">
      <ellipse cx="0" cy="35" rx="50" ry="12" fill="#3f6212"/>
      <ellipse cx="0" cy="20" rx="38" ry="20" fill="#a05a2c"/>
      <ellipse cx="-12" cy="8" rx="4" ry="5" fill="#fff"/><circle cx="-12" cy="9" r="2" fill="#0d0f1a"/>
      <ellipse cx="12" cy="8" rx="4" ry="5" fill="#fff"/><circle cx="12" cy="9" r="2" fill="#0d0f1a"/>
      <ellipse cx="0" cy="22" rx="6" ry="4" fill="#ff5e7a"/>
    </g>
    <g transform="translate(310,180)">
      <ellipse cx="0" cy="35" rx="50" ry="12" fill="#3f6212"/>
      <ellipse cx="0" cy="20" rx="38" ry="20" fill="#a05a2c"/>
      <ellipse cx="-12" cy="8" rx="4" ry="5" fill="#fff"/><circle cx="-12" cy="9" r="2" fill="#0d0f1a"/>
      <ellipse cx="12" cy="8" rx="4" ry="5" fill="#fff"/><circle cx="12" cy="9" r="2" fill="#0d0f1a"/>
      <ellipse cx="0" cy="22" rx="6" ry="4" fill="#ff5e7a"/>
    </g>
    <!-- mallet -->
    <g transform="translate(200,90) rotate(-30)">
      <rect x="-6" y="0" width="12" height="80" rx="4" fill="#a05a2c"/>
      <rect x="-22" y="-22" width="44" height="28" rx="8" fill="#ff4d12"/>
      <rect x="-18" y="-18" width="36" height="8" rx="4" fill="rgba(255,255,255,0.4)"/>
    </g>
  </g>
'''

# --- Memory Match (cards) ---
SCENES['memory'] = '''
  <g filter="url(#sh)" transform="translate(200,130)">
    <!-- card back -->
    <g transform="translate(-90,-50)">
      <rect width="80" height="100" rx="10" fill="#a78bfa"/>
      <rect x="6" y="6" width="68" height="88" rx="6" fill="#c4b5fd"/>
      <text x="40" y="60" font-size="40" text-anchor="middle" fill="#fff" font-weight="900">?</text>
    </g>
    <!-- card back -->
    <g transform="translate(-30,-50)">
      <rect width="80" height="100" rx="10" fill="#a78bfa"/>
      <rect x="6" y="6" width="68" height="88" rx="6" fill="#c4b5fd"/>
      <text x="40" y="60" font-size="40" text-anchor="middle" fill="#fff" font-weight="900">?</text>
    </g>
    <!-- card face-up (apple) -->
    <g transform="translate(40,-50)">
      <rect width="80" height="100" rx="10" fill="#fff"/>
      <g transform="translate(40,55)">
        <circle r="22" fill="#ff4d6d"/>
        <ellipse cx="-6" cy="-8" rx="6" ry="3" fill="#fff" opacity="0.5"/>
        <path d="M 0 -22 Q 8 -30 16 -22" stroke="#3f6212" stroke-width="3" fill="none"/>
      </g>
    </g>
    <!-- card face-up (matching apple) -->
    <g transform="translate(110,-50)">
      <rect width="80" height="100" rx="10" fill="#fff"/>
      <g transform="translate(40,55)">
        <circle r="22" fill="#ff4d6d"/>
        <ellipse cx="-6" cy="-8" rx="6" ry="3" fill="#fff" opacity="0.5"/>
        <path d="M 0 -22 Q 8 -30 16 -22" stroke="#3f6212" stroke-width="3" fill="none"/>
      </g>
    </g>
    <!-- sparkles -->
    <g fill="#ffd23f">
      <path d="M 60 10 l 3 8 l 8 3 l -8 3 l -3 8 l -3 -8 l -8 -3 l 8 -3 z"/>
      <path d="M -80 10 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 z"/>
    </g>
  </g>
'''

# --- Minesweeper ---
SCENES['minesweeper'] = '''
  <g filter="url(#sh)" transform="translate(105,55)">
    <!-- 4x4 grid -->
    <g>
      <rect x="0" y="0" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="46" y="0" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="92" y="0" width="40" height="40" rx="6" fill="#574f63"/>
      <rect x="138" y="0" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="0" y="46" width="40" height="40" rx="6" fill="#574f63"/>
      <rect x="46" y="46" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="92" y="46" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="138" y="46" width="40" height="40" rx="6" fill="#574f63"/>
      <rect x="0" y="92" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="46" y="92" width="40" height="40" rx="6" fill="#574f63"/>
      <rect x="92" y="92" width="40" height="40" rx="6" fill="#ff4d12"/>
      <rect x="138" y="92" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="0" y="138" width="40" height="40" rx="6" fill="#574f63"/>
      <rect x="46" y="138" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="92" y="138" width="40" height="40" rx="6" fill="#7a7287"/>
      <rect x="138" y="138" width="40" height="40" rx="6" fill="#574f63"/>
    </g>
    <!-- numbers -->
    <g font-family="Inter,sans-serif" font-size="22" font-weight="900" text-anchor="middle">
      <text x="20" y="74" fill="#5db8ff">1</text>
      <text x="66" y="74" fill="#7CFC8A">2</text>
      <text x="112" y="74" fill="#ff4d6d">3</text>
      <text x="20" y="166" fill="#5db8ff">1</text>
      <text x="158" y="166" fill="#5db8ff">1</text>
    </g>
    <!-- mine -->
    <g transform="translate(112,112)">
      <circle r="13" fill="#16131a"/>
      <rect x="-12" y="-2" width="24" height="4" rx="1" fill="#16131a"/>
      <rect x="-2" y="-12" width="4" height="24" rx="1" fill="#16131a"/>
      <circle r="3" fill="#ffd23f"/>
    </g>
    <!-- flag -->
    <g transform="translate(66,166)">
      <rect x="-1" y="-14" width="2" height="20" fill="#16131a"/>
      <path d="M 1 -14 L 16 -10 L 1 -6 Z" fill="#ff4d12"/>
    </g>
  </g>
'''

# --- Speed Racer ---
SCENES['racer'] = '''
  <g filter="url(#sh)" transform="translate(200,165)">
    <!-- car body -->
    <path d="M -90 0 Q -85 -28 -50 -32 L 50 -32 Q 90 -28 95 0 L 95 16 L -90 16 Z" fill="#ff4d12"/>
    <path d="M -88 0 Q -82 -25 -48 -28 L 48 -28 Q 88 -25 90 0 Z" fill="rgba(255,255,255,0.25)"/>
    <!-- windshield -->
    <path d="M -55 -28 Q -45 -50 -10 -52 L 30 -52 Q 50 -50 55 -28 Z" fill="#22d3ee"/>
    <path d="M -50 -28 Q -42 -46 -10 -48 L 28 -48 Q 48 -46 50 -28 Z" fill="#a8f4ff" opacity="0.7"/>
    <!-- headlight -->
    <circle cx="80" cy="6" r="6" fill="#fff7d6"/>
    <!-- taillight -->
    <circle cx="-85" cy="6" r="5" fill="#ff5e7a"/>
    <!-- racing stripe -->
    <rect x="-60" y="-6" width="140" height="6" fill="#fff"/>
    <!-- wheels -->
    <circle cx="-55" cy="20" r="20" fill="#16131a"/>
    <circle cx="-55" cy="20" r="10" fill="#574f63"/>
    <circle cx="55" cy="20" r="20" fill="#16131a"/>
    <circle cx="55" cy="20" r="10" fill="#574f63"/>
  </g>
  <!-- speed lines -->
  <g stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7">
    <line x1="40" y1="100" x2="100" y2="100"/>
    <line x1="20" y1="130" x2="80" y2="130"/>
    <line x1="40" y1="200" x2="100" y2="200"/>
  </g>
'''

# --- Sky Fighter ---
SCENES['sky-fighter'] = '''
  <g filter="url(#sh)" transform="translate(200,140)">
    <path d="M -100 0 L -50 -18 L 50 -14 L 100 -6 L 100 6 L 50 14 L -50 18 Z" fill="#5db8ff"/>
    <path d="M -100 0 L -50 -18 L 50 -14 L 100 -6 L 100 6 L 50 14 L -50 18 Z" fill="rgba(255,255,255,0.3)"/>
    <path d="M -10 -10 L -30 -55 L 20 -55 L 30 -10 Z" fill="#1e3a8a"/>
    <path d="M -10 10 L -30 55 L 20 55 L 30 10 Z" fill="#1e3a8a"/>
    <ellipse cx="30" cy="0" rx="22" ry="10" fill="#0a0c18"/>
    <ellipse cx="30" cy="-3" rx="14" ry="5" fill="#22d3ee" opacity="0.9"/>
    <circle cx="100" cy="0" r="6" fill="#ffd23f"/>
  </g>
  <!-- missile -->
  <g transform="translate(330,80) rotate(20)">
    <rect width="32" height="8" rx="2" fill="#ff4d12"/>
    <path d="M 32 0 L 42 4 L 32 8 Z" fill="#ffd23f"/>
  </g>
'''

# --- Asteroids ---
SCENES['asteroids'] = '''
  <g filter="url(#sh)">
    <!-- ship -->
    <g transform="translate(200,150)">
      <path d="M -22 0 L 0 -14 L 28 0 L 0 14 Z" fill="#5db8ff"/>
      <path d="M -22 0 L 0 -14 L 28 0 Z" fill="#a8f4ff"/>
      <circle r="4" fill="#ffd23f"/>
      <!-- flames -->
      <path d="M -22 0 L -36 -6 L -28 0 L -36 6 Z" fill="#ffd23f"/>
      <path d="M -22 0 L -30 -3 L -26 0 L -30 3 Z" fill="#fff"/>
    </g>
    <!-- asteroids -->
    <g transform="translate(80,80)">
      <polygon points="-22,-14 -8,-22 10,-18 22,-4 18,12 4,22 -12,18 -22,4" fill="#7a7287"/>
      <polygon points="-22,-14 -8,-22 10,-18 22,-4 18,12 4,22 -12,18 -22,4" fill="rgba(255,255,255,0.18)"/>
    </g>
    <g transform="translate(320,90)">
      <polygon points="-26,-10 -10,-22 12,-20 24,-6 22,10 8,20 -10,16 -24,4" fill="#a05a2c"/>
      <polygon points="-26,-10 -10,-22 12,-20 24,-6 22,10 8,20 -10,16 -24,4" fill="rgba(255,255,255,0.15)"/>
    </g>
    <g transform="translate(310,210)">
      <polygon points="-18,-12 -4,-20 12,-16 20,-2 16,10 4,16 -10,14 -18,2" fill="#574f63"/>
      <polygon points="-18,-12 -4,-20 12,-16 20,-2 16,10 4,16 -10,14 -18,2" fill="rgba(255,255,255,0.15)"/>
    </g>
  </g>
  <!-- stars -->
  <g fill="#fff">
    <circle cx="40" cy="40" r="1.5"/>
    <circle cx="120" cy="220" r="1.5"/>
    <circle cx="60" cy="160" r="1"/>
    <circle cx="370" cy="180" r="1.5"/>
    <circle cx="370" cy="40" r="1"/>
  </g>
'''

# --- Bouncy Ball ---
SCENES['bouncy-ball'] = '''
  <g filter="url(#sh)" transform="translate(200,140)">
    <circle r="60" fill="#ff4d6d"/>
    <ellipse cx="-18" cy="-22" rx="20" ry="10" fill="rgba(255,255,255,0.45)"/>
    <ellipse cx="20" cy="40" rx="20" ry="8" fill="rgba(0,0,0,0.15)"/>
    <!-- face -->
    <ellipse cx="-18" cy="-5" rx="6" ry="9" fill="#fff"/>
    <circle cx="-16" cy="-3" r="4" fill="#0d0f1a"/>
    <ellipse cx="18" cy="-5" rx="6" ry="9" fill="#fff"/>
    <circle cx="20" cy="-3" r="4" fill="#0d0f1a"/>
    <path d="M -16 22 Q 0 32 16 22" stroke="#0d0f1a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- cheek -->
    <circle cx="-30" cy="14" r="6" fill="#ff9a73" opacity="0.6"/>
    <circle cx="30" cy="14" r="6" fill="#ff9a73" opacity="0.6"/>
  </g>
  <!-- motion -->
  <g stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6">
    <path d="M 60 60 Q 90 50 110 60" fill="none"/>
    <path d="M 290 220 Q 320 210 340 220" fill="none"/>
  </g>
'''

# --- Space Invaders ---
SCENES['space-invaders'] = '''
  <g filter="url(#sh)">
    <!-- invaders -->
    <g transform="translate(110,80)">
      <rect x="-14" y="0" width="28" height="22" rx="3" fill="#7CFC8A"/>
      <rect x="-22" y="8" width="6" height="6" fill="#7CFC8A"/>
      <rect x="16" y="8" width="6" height="6" fill="#7CFC8A"/>
      <rect x="-8" y="22" width="6" height="8" fill="#7CFC8A"/>
      <rect x="2" y="22" width="6" height="8" fill="#7CFC8A"/>
      <rect x="-6" y="6" width="4" height="4" fill="#16131a"/>
      <rect x="2" y="6" width="4" height="4" fill="#16131a"/>
    </g>
    <g transform="translate(200,60)">
      <rect x="-14" y="0" width="28" height="22" rx="3" fill="#5db8ff"/>
      <rect x="-22" y="8" width="6" height="6" fill="#5db8ff"/>
      <rect x="16" y="8" width="6" height="6" fill="#5db8ff"/>
      <rect x="-8" y="22" width="6" height="8" fill="#5db8ff"/>
      <rect x="2" y="22" width="6" height="8" fill="#5db8ff"/>
      <rect x="-6" y="6" width="4" height="4" fill="#16131a"/>
      <rect x="2" y="6" width="4" height="4" fill="#16131a"/>
    </g>
    <g transform="translate(290,80)">
      <rect x="-14" y="0" width="28" height="22" rx="3" fill="#ffd23f"/>
      <rect x="-22" y="8" width="6" height="6" fill="#ffd23f"/>
      <rect x="16" y="8" width="6" height="6" fill="#ffd23f"/>
      <rect x="-8" y="22" width="6" height="8" fill="#ffd23f"/>
      <rect x="2" y="22" width="6" height="8" fill="#ffd23f"/>
      <rect x="-6" y="6" width="4" height="4" fill="#16131a"/>
      <rect x="2" y="6" width="4" height="4" fill="#16131a"/>
    </g>
    <!-- ship -->
    <g transform="translate(200,200)">
      <path d="M -20 0 L -12 -10 L 12 -10 L 20 0 L 12 8 L -12 8 Z" fill="#22d3ee"/>
      <circle cx="0" cy="-2" r="3" fill="#0a0c18"/>
    </g>
    <!-- bullets -->
    <rect x="120" y="160" width="3" height="14" fill="#ffd23f"/>
    <rect x="280" y="140" width="3" height="14" fill="#ffd23f"/>
  </g>
'''

# --- Bubble Shooter ---
SCENES['bubble-shooter-arcade'] = '''
  <g filter="url(#sh)">
    <!-- shooter -->
    <g transform="translate(200,210)">
      <circle r="34" fill="#5db8ff"/>
      <ellipse cx="-10" cy="-10" rx="10" ry="6" fill="rgba(255,255,255,0.5)"/>
      <rect x="-6" y="-50" width="12" height="20" fill="#5db8ff"/>
      <!-- aiming line -->
      <line x1="0" y1="-50" x2="-40" y2="-130" stroke="#fff" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
    </g>
    <!-- row of bubbles -->
    <g>
      <circle cx="60" cy="60" r="22" fill="#ff4d6d"/><ellipse cx="54" cy="54" rx="6" ry="3" fill="#fff" opacity="0.6"/>
      <circle cx="105" cy="60" r="22" fill="#ffd23f"/><ellipse cx="99" cy="54" rx="6" ry="3" fill="#fff" opacity="0.6"/>
      <circle cx="150" cy="60" r="22" fill="#7CFC8A"/><ellipse cx="144" cy="54" rx="6" ry="3" fill="#fff" opacity="0.6"/>
      <circle cx="195" cy="60" r="22" fill="#22d3ee"/><ellipse cx="189" cy="54" rx="6" ry="3" fill="#fff" opacity="0.6"/>
      <circle cx="240" cy="60" r="22" fill="#b07dff"/><ellipse cx="234" cy="54" rx="6" ry="3" fill="#fff" opacity="0.6"/>
      <circle cx="285" cy="60" r="22" fill="#ff9f1c"/><ellipse cx="279" cy="54" rx="6" ry="3" fill="#fff" opacity="0.6"/>
      <circle cx="330" cy="60" r="22" fill="#ff4d6d"/><ellipse cx="324" cy="54" rx="6" ry="3" fill="#fff" opacity="0.6"/>
    </g>
    <g transform="translate(0,32)">
      <circle cx="82" cy="60" r="22" fill="#22d3ee"/>
      <circle cx="127" cy="60" r="22" fill="#ffd23f"/>
      <circle cx="172" cy="60" r="22" fill="#ff9f1c"/>
      <circle cx="217" cy="60" r="22" fill="#7CFC8A"/>
      <circle cx="262" cy="60" r="22" fill="#b07dff"/>
      <circle cx="307" cy="60" r="22" fill="#ff4d6d"/>
    </g>
  </g>
'''

# --- Tetris 2 (different look) ---
SCENES['tetris-arcade'] = '''
  <g filter="url(#sh)">
    <!-- big T piece -->
    <g transform="translate(150,60)">
      <rect width="44" height="44" rx="6" fill="#5db8ff"/>
      <rect x="44" width="44" height="44" rx="6" fill="#5db8ff"/>
      <rect x="88" width="44" height="44" rx="6" fill="#5db8ff"/>
      <rect x="44" y="44" width="44" height="44" rx="6" fill="#5db8ff"/>
      <ellipse cx="20" cy="18" rx="14" ry="6" fill="rgba(255,255,255,0.45)"/>
    </g>
    <!-- big L piece -->
    <g transform="translate(60,170)">
      <rect width="40" height="40" rx="6" fill="#ff4d6d"/>
      <rect y="40" width="40" height="40" rx="6" fill="#ff4d6d"/>
      <rect y="80" width="40" height="40" rx="6" fill="#ff4d6d"/>
      <rect x="40" y="80" width="40" height="40" rx="6" fill="#ff4d6d"/>
      <ellipse cx="20" cy="16" rx="12" ry="5" fill="rgba(255,255,255,0.45)"/>
    </g>
    <!-- big square -->
    <g transform="translate(290,170)">
      <rect width="44" height="44" rx="6" fill="#ffd23f"/>
      <rect x="44" width="44" height="44" rx="6" fill="#ffd23f"/>
      <rect y="44" width="44" height="44" rx="6" fill="#ffd23f"/>
      <rect x="44" y="44" width="44" height="44" rx="6" fill="#ffd23f"/>
      <ellipse cx="20" cy="16" rx="12" ry="5" fill="rgba(255,255,255,0.45)"/>
    </g>
  </g>
'''

# --- Memory Cards (different style) ---
SCENES['memory-match'] = '''
  <g filter="url(#sh)" transform="translate(200,130)">
    <g transform="translate(-90,-50)">
      <rect width="80" height="100" rx="10" fill="#fff"/>
      <g transform="translate(40,55)">
        <path d="M -20 10 Q -20 -15 0 -15 Q 20 -15 20 10 Q 14 18 0 18 Q -14 18 -20 10" fill="#ff5e7a"/>
        <ellipse cx="-5" cy="0" rx="6" ry="3" fill="#fff" opacity="0.5"/>
      </g>
    </g>
    <g transform="translate(-30,-50)">
      <rect width="80" height="100" rx="10" fill="#7CFC8A"/>
      <rect x="6" y="6" width="68" height="88" rx="6" fill="#a3f5b5"/>
      <text x="40" y="60" font-size="40" text-anchor="middle" fill="#fff" font-weight="900">★</text>
    </g>
    <g transform="translate(40,-50)">
      <rect width="80" height="100" rx="10" fill="#fff"/>
      <g transform="translate(40,55)">
        <path d="M -20 10 Q -20 -15 0 -15 Q 20 -15 20 10 Q 14 18 0 18 Q -14 18 -20 10" fill="#ff5e7a"/>
        <ellipse cx="-5" cy="0" rx="6" ry="3" fill="#fff" opacity="0.5"/>
      </g>
    </g>
    <g transform="translate(110,-50)">
      <rect width="80" height="100" rx="10" fill="#fff"/>
      <g transform="translate(40,55)">
        <circle r="18" fill="#5db8ff"/>
        <ellipse cx="-5" cy="-5" rx="6" ry="3" fill="#fff" opacity="0.6"/>
      </g>
    </g>
  </g>
'''

# --- Bubble Pop ---
SCENES['bubble-pop'] = '''
  <g filter="url(#sh)">
    <g transform="translate(80,80)">
      <circle r="36" fill="#ff4d6d"/>
      <ellipse cx="-12" cy="-14" rx="12" ry="6" fill="rgba(255,255,255,0.55)"/>
      <circle cx="-30" cy="20" r="4" fill="rgba(255,255,255,0.3)"/>
    </g>
    <g transform="translate(180,120)">
      <circle r="44" fill="#22d3ee"/>
      <ellipse cx="-15" cy="-18" rx="15" ry="7" fill="rgba(255,255,255,0.55)"/>
      <circle cx="22" cy="22" r="5" fill="rgba(255,255,255,0.3)"/>
    </g>
    <g transform="translate(290,80)">
      <circle r="32" fill="#7CFC8A"/>
      <ellipse cx="-10" cy="-12" rx="11" ry="5" fill="rgba(255,255,255,0.55)"/>
    </g>
    <g transform="translate(330,180)">
      <circle r="26" fill="#ffd23f"/>
      <ellipse cx="-9" cy="-10" rx="9" ry="4" fill="rgba(255,255,255,0.55)"/>
    </g>
    <g transform="translate(70,200)">
      <circle r="22" fill="#b07dff"/>
      <ellipse cx="-7" cy="-9" rx="7" ry="3" fill="rgba(255,255,255,0.55)"/>
    </g>
  </g>
  <!-- pop burst -->
  <g transform="translate(220,50)">
    <path d="M 0 0 l 5 12 l 12 5 l -12 5 l -5 12 l -5 -12 l -12 -5 l 12 -5 z" fill="#ffd23f"/>
  </g>
'''

# --- Fireworks Show ---
SCENES['fireworks-show'] = '''
  <g filter="url(#sh)">
    <!-- burst 1 -->
    <g transform="translate(110,90)">
      <g stroke-linecap="round">
        <line x1="0" y1="-50" x2="0" y2="-80" stroke="#ff4d6d" stroke-width="4"/>
        <line x1="0" y1="50" x2="0" y2="80" stroke="#ff4d6d" stroke-width="4"/>
        <line x1="-50" y1="0" x2="-80" y2="0" stroke="#ff4d6d" stroke-width="4"/>
        <line x1="50" y1="0" x2="80" y2="0" stroke="#ff4d6d" stroke-width="4"/>
        <line x1="-36" y1="-36" x2="-58" y2="-58" stroke="#ffd23f" stroke-width="4"/>
        <line x1="36" y1="-36" x2="58" y2="-58" stroke="#ffd23f" stroke-width="4"/>
        <line x1="-36" y1="36" x2="-58" y2="58" stroke="#ffd23f" stroke-width="4"/>
        <line x1="36" y1="36" x2="58" y2="58" stroke="#ffd23f" stroke-width="4"/>
      </g>
      <circle r="8" fill="#fff7d6"/>
    </g>
    <!-- burst 2 -->
    <g transform="translate(300,140)">
      <g stroke-linecap="round">
        <line x1="0" y1="-44" x2="0" y2="-72" stroke="#22d3ee" stroke-width="4"/>
        <line x1="0" y1="44" x2="0" y2="72" stroke="#22d3ee" stroke-width="4"/>
        <line x1="-44" y1="0" x2="-72" y2="0" stroke="#22d3ee" stroke-width="4"/>
        <line x1="44" y1="0" x2="72" y2="0" stroke="#22d3ee" stroke-width="4"/>
        <line x1="-32" y1="-32" x2="-54" y2="-54" stroke="#7CFC8A" stroke-width="4"/>
        <line x1="32" y1="-32" x2="54" y2="-54" stroke="#7CFC8A" stroke-width="4"/>
        <line x1="-32" y1="32" x2="-54" y2="54" stroke="#7CFC8A" stroke-width="4"/>
        <line x1="32" y1="32" x2="54" y2="54" stroke="#7CFC8A" stroke-width="4"/>
      </g>
      <circle r="8" fill="#fff"/>
    </g>
    <!-- rockets -->
    <path d="M 50 220 Q 80 180 110 160" stroke="#ffd23f" stroke-width="3" fill="none"/>
    <circle cx="110" cy="160" r="3" fill="#ffd23f"/>
    <path d="M 320 230 Q 280 200 240 200" stroke="#ff4d6d" stroke-width="3" fill="none"/>
    <circle cx="240" cy="200" r="3" fill="#ff4d6d"/>
  </g>
'''

# --- Music Shapes ---
SCENES['music-shapes'] = '''
  <g filter="url(#sh)">
    <!-- shapes -->
    <g transform="translate(110,100)">
      <circle r="30" fill="#ff4d6d"/>
      <ellipse cx="-10" cy="-10" rx="10" ry="5" fill="rgba(255,255,255,0.5)"/>
    </g>
    <g transform="translate(200,150)">
      <rect width="60" height="60" rx="10" fill="#22d3ee" transform="rotate(20)"/>
    </g>
    <g transform="translate(300,100)">
      <path d="M 0 -32 L 28 16 L -28 16 Z" fill="#ffd23f"/>
    </g>
    <!-- music note -->
    <g transform="translate(200,90)" fill="#fff">
      <ellipse cx="-15" cy="20" rx="14" ry="10" transform="rotate(-15)"/>
      <rect x="-3" y="-10" width="4" height="34"/>
      <path d="M 1 -10 Q 22 -8 22 12"/>
    </g>
  </g>
'''

# --- Picture Puzzle ---
SCENES['picture-puzzle'] = '''
  <g filter="url(#sh)" transform="translate(200,130)">
    <!-- 4 interlocking puzzle pieces -->
    <g transform="translate(-70,-70)">
      <path d="M 0 0 L 50 0 Q 55 0 55 8 Q 55 18 65 18 Q 75 18 75 28 Q 75 38 65 38 Q 55 38 55 48 Q 55 58 50 58 L 0 58 Z" fill="#ff4d6d"/>
    </g>
    <g transform="translate(0,-70)">
      <path d="M 0 0 L 25 0 Q 25 -10 35 -10 Q 45 -10 45 0 L 75 0 L 75 58 L 25 58 Q 25 68 35 68 Q 45 68 45 58" fill="#22d3ee"/>
    </g>
    <g transform="translate(-70,0)">
      <path d="M 0 0 L 0 -10 Q -10 -10 -10 0 L -10 25 Q -20 25 -20 35 Q -20 45 -10 45 L 0 45 Q 0 35 10 35 Q 20 35 20 25 Q 20 15 10 15 Q 0 15 0 25" fill="#7CFC8A"/>
    </g>
    <g transform="translate(0,0)">
      <path d="M 0 0 L 45 0 Q 55 0 55 10 Q 55 20 65 20 Q 75 20 75 30 L 75 70 L 0 70 Z" fill="#ffd23f"/>
    </g>
  </g>
'''

# --- Color Splash ---
SCENES['color-splash'] = '''
  <g filter="url(#sh)">
    <!-- buckets -->
    <g transform="translate(110,140)">
      <path d="M -22 -30 L 22 -30 L 18 20 L -18 20 Z" fill="#ff4d6d"/>
      <ellipse cx="0" cy="-30" rx="22" ry="6" fill="#ff9a73"/>
      <!-- splash -->
      <circle cx="-12" cy="-50" r="8" fill="#ff4d6d"/>
      <circle cx="6" cy="-58" r="6" fill="#ff4d6d"/>
      <circle cx="18" cy="-44" r="5" fill="#ff4d6d"/>
    </g>
    <g transform="translate(200,150)">
      <path d="M -22 -30 L 22 -30 L 18 20 L -18 20 Z" fill="#ffd23f"/>
      <ellipse cx="0" cy="-30" rx="22" ry="6" fill="#fff7d6"/>
      <circle cx="-8" cy="-52" r="7" fill="#ffd23f"/>
      <circle cx="10" cy="-58" r="5" fill="#ffd23f"/>
    </g>
    <g transform="translate(290,140)">
      <path d="M -22 -30 L 22 -30 L 18 20 L -18 20 Z" fill="#22d3ee"/>
      <ellipse cx="0" cy="-30" rx="22" ry="6" fill="#a8f4ff"/>
      <circle cx="-10" cy="-50" r="7" fill="#22d3ee"/>
      <circle cx="8" cy="-58" r="5" fill="#22d3ee"/>
      <circle cx="18" cy="-46" r="4" fill="#22d3ee"/>
    </g>
  </g>
'''

# --- Fruit Slicer ---
SCENES['fruit-slice'] = '''
  <g filter="url(#sh)">
    <!-- sliced watermelon -->
    <g transform="translate(140,150)">
      <path d="M -60 0 A 60 60 0 0 1 60 0 Z" fill="#ff4d6d"/>
      <path d="M -60 0 A 60 60 0 0 1 60 0 Z" fill="rgba(255,255,255,0.18)"/>
      <path d="M -54 0 A 54 54 0 0 1 54 0 Z" fill="#fff7d6"/>
      <path d="M -50 0 A 50 50 0 0 1 50 0 Z" fill="#ff4d6d"/>
      <g fill="#16131a">
        <ellipse cx="-20" cy="-15" rx="3" ry="6"/>
        <ellipse cx="0" cy="-22" rx="3" ry="6"/>
        <ellipse cx="20" cy="-15" rx="3" ry="6"/>
        <ellipse cx="-10" cy="-8" rx="3" ry="6"/>
        <ellipse cx="10" cy="-8" rx="3" ry="6"/>
      </g>
    </g>
    <!-- citrus half -->
    <g transform="translate(290,160)">
      <circle r="44" fill="#ffa24d"/>
      <circle r="36" fill="#fff7d6"/>
      <g stroke="#ffa24d" stroke-width="3" fill="none">
        <line x1="0" y1="-36" x2="0" y2="36"/>
        <line x1="-36" y1="0" x2="36" y2="0"/>
        <line x1="-26" y1="-26" x2="26" y2="26"/>
        <line x1="26" y1="-26" x2="-26" y2="26"/>
      </g>
    </g>
    <!-- knife -->
    <g transform="translate(330,80) rotate(30)">
      <path d="M 0 0 L 60 6 L 60 14 L 0 8 Z" fill="#cfd8e3"/>
      <rect x="-22" y="-2" width="22" height="14" rx="3" fill="#a05a2c"/>
    </g>
  </g>
'''

# --- Cake Workshop ---
SCENES['cake'] = '''
  <g filter="url(#sh)" transform="translate(200,150)">
    <!-- plate -->
    <ellipse cx="0" cy="60" rx="100" ry="14" fill="#cfd8e3"/>
    <!-- bottom tier -->
    <rect x="-80" y="0" width="160" height="50" rx="6" fill="#ff9a73"/>
    <rect x="-80" y="0" width="160" height="14" fill="#ff4d6d"/>
    <!-- middle tier -->
    <rect x="-58" y="-44" width="116" height="44" rx="6" fill="#ffd23f"/>
    <rect x="-58" y="-44" width="116" height="12" fill="#ff9f1c"/>
    <!-- top tier -->
    <rect x="-36" y="-82" width="72" height="38" rx="6" fill="#fff7d6"/>
    <rect x="-36" y="-82" width="72" height="10" fill="#ff4d6d"/>
    <!-- candles -->
    <rect x="-20" y="-100" width="6" height="20" fill="#22d3ee"/>
    <rect x="-3" y="-105" width="6" height="25" fill="#7CFC8A"/>
    <rect x="14" y="-100" width="6" height="20" fill="#ff4d6d"/>
    <circle cx="-17" cy="-102" r="4" fill="#ffd23f"/>
    <circle cx="0" cy="-107" r="4" fill="#ffd23f"/>
    <circle cx="17" cy="-102" r="4" fill="#ffd23f"/>
    <!-- sprinkles -->
    <g>
      <rect x="-50" y="-2" width="4" height="2" fill="#22d3ee"/>
      <rect x="30" y="10" width="4" height="2" fill="#7CFC8A"/>
      <rect x="40" y="-2" width="4" height="2" fill="#ff4d6d"/>
      <rect x="-30" y="20" width="4" height="2" fill="#ffd23f"/>
    </g>
  </g>
'''

# --- Endless Runner ---
SCENES['runner'] = '''
  <g filter="url(#sh)" transform="translate(200,150)">
    <!-- runner -->
    <g>
      <!-- body -->
      <circle cx="0" cy="-50" r="16" fill="#f4c2a1"/>
      <ellipse cx="-4" cy="-52" rx="10" ry="6" fill="rgba(255,255,255,0.4)"/>
      <rect x="-12" y="-36" width="24" height="34" rx="4" fill="#22d3ee"/>
      <!-- arms -->
      <rect x="-26" y="-30" width="8" height="22" rx="3" fill="#f4c2a1" transform="rotate(-30)"/>
      <rect x="20" y="-32" width="8" height="22" rx="3" fill="#f4c2a1" transform="rotate(35)"/>
      <!-- legs (running) -->
      <rect x="-12" y="-2" width="10" height="22" rx="3" fill="#16131a"/>
      <rect x="2" y="-2" width="10" height="22" rx="3" fill="#16131a" transform="rotate(-20 7 8)"/>
    </g>
  </g>
  <!-- ground -->
  <rect x="0" y="220" width="400" height="14" fill="#84cc16"/>
  <!-- coins -->
  <g>
    <circle cx="80" cy="120" r="10" fill="#ffd23f"/>
    <text x="80" y="124" font-size="12" font-weight="900" fill="#fff" text-anchor="middle">$</text>
    <circle cx="330" cy="100" r="10" fill="#ffd23f"/>
    <text x="330" y="104" font-size="12" font-weight="900" fill="#fff" text-anchor="middle">$</text>
  </g>
  <!-- motion lines -->
  <g stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6">
    <line x1="40" y1="120" x2="80" y2="120"/>
    <line x1="40" y1="160" x2="80" y2="160"/>
  </g>
'''

# --- Watermelon Merge (Suika) ---
SCENES['suika'] = '''
  <g filter="url(#sh)" transform="translate(200,150)">
    <!-- big watermelon with face -->
    <circle r="56" fill="#ff4d6d"/>
    <ellipse cx="-16" cy="-20" rx="20" ry="10" fill="rgba(255,255,255,0.45)"/>
    <ellipse cx="-18" cy="-8" rx="6" ry="9" fill="#fff"/>
    <circle cx="-16" cy="-6" r="4" fill="#16131a"/>
    <ellipse cx="18" cy="-8" rx="6" ry="9" fill="#fff"/>
    <circle cx="20" cy="-6" r="4" fill="#16131a"/>
    <path d="M -14 20 Q 0 28 14 20" stroke="#16131a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="-30" cy="14" r="6" fill="#ff9a73" opacity="0.7"/>
    <circle cx="30" cy="14" r="6" fill="#ff9a73" opacity="0.7"/>
    <!-- leaf -->
    <path d="M -10 -54 Q 0 -68 14 -60" stroke="#3f6212" stroke-width="6" fill="#84cc16" stroke-linecap="round"/>
  </g>
  <!-- small fruits -->
  <g transform="translate(80,80)">
    <circle r="14" fill="#ffa24d"/>
    <ellipse cx="-4" cy="-4" rx="4" ry="2" fill="#fff" opacity="0.6"/>
  </g>
  <g transform="translate(320,80)">
    <circle r="11" fill="#7CFC8A"/>
    <ellipse cx="-3" cy="-3" rx="3" ry="2" fill="#fff" opacity="0.6"/>
  </g>
  <g transform="translate(330,210)">
    <ellipse rx="14" ry="11" fill="#ffd23f"/>
  </g>
'''

# ---------- Colors per game (bg1, bg2, hl_color, pill_bg, pill_text) ----------
COLORS = {
    '2048':                 ('#fff7d6','#ffcf75','#fff','rgba(40,28,12,.78)','#fff'),
    'snake':                ('#a7f3a0','#3fbf6a','#fff','rgba(20,80,40,.78)','#fff'),
    'pacman':                ('#0a0c18','#1d2b8a','#fff','rgba(0,0,30,.82)','#ffd23f'),
    'snake-pro':            ('#3b0a6b','#0ea5e9','#fff','rgba(20,8,60,.82)','#22d3ee'),
    'plane':                ('#ffb088','#ff4d12','#fff','rgba(60,12,8,.82)','#fff'),
    'fruit-catcher':        ('#cdeefc','#7dd3fc','#fff','rgba(20,60,90,.82)','#fff'),
    'whack-mole':           ('#84cc16','#3f6212','#fff','rgba(40,40,12,.82)','#fff'),
    'match3':               ('#b07dff','#7c3aed','#fff','rgba(30,10,60,.82)','#fff'),
    'breakout':             ('#5ec8ff','#1e3a8a','#fff','rgba(20,30,80,.82)','#fff'),
    'memory':               ('#c4b5fd','#7c3aed','#fff','rgba(30,10,60,.82)','#fff'),
    'tetris':               ('#a78bfa','#1e1b4b','#fff','rgba(20,10,60,.82)','#fff'),
    'minesweeper':          ('#9aa3b2','#574f63','#fff','rgba(20,15,30,.85)','#fff'),
    'racer':                ('#ff7a45','#ff2a4d','#fff','rgba(60,8,20,.82)','#fff'),
    'sky-fighter':          ('#5ec8ff','#1e3a8a','#fff','rgba(15,30,80,.82)','#fff'),
    'tank':                 ('#bef264','#65a30d','#fff','rgba(30,50,12,.82)','#fff'),
    'asteroids':            ('#1e1b4b','#0a0c18','#fff','rgba(5,5,20,.85)','#22d3ee'),
    'bouncy-ball':          ('#ff9a73','#ff4d6d','#fff','rgba(80,12,40,.82)','#fff'),
    'space-invaders':       ('#1e1b4b','#0a0c18','#fff','rgba(5,5,20,.85)','#7CFC8A'),
    'bubble-shooter-arcade':('#5ec8ff','#22d3ee','#fff','rgba(10,40,70,.82)','#fff'),
    'tetris-arcade':        ('#22d3ee','#7c3aed','#fff','rgba(20,10,60,.82)','#fff'),
    'memory-match':         ('#7CFC8A','#22c55e','#fff','rgba(10,60,20,.82)','#fff'),
    'bubble-pop':           ('#5ec8ff','#0ea5e9','#fff','rgba(10,50,80,.82)','#fff'),
    'fireworks-show':       ('#1e1b4b','#0a0c18','#fff','rgba(5,5,20,.85)','#ffd23f'),
    'music-shapes':         ('#f472b6','#7c3aed','#fff','rgba(60,10,60,.82)','#fff'),
    'picture-puzzle':       ('#ffb088','#ff703d','#fff','rgba(60,20,5,.82)','#fff'),
    'color-splash':         ('#fff7d6','#ffd23f','#fff','rgba(80,40,5,.82)','#fff'),
    'fruit-slice':          ('#ffe9c4','#ff9a73','#fff','rgba(60,20,5,.82)','#fff'),
    'cake':                 ('#ffc7d9','#ff4d6d','#fff','rgba(60,10,30,.82)','#fff'),
    'runner':               ('#a7f3d0','#22c55e','#fff','rgba(10,60,30,.82)','#fff'),
    'suika':                ('#bef264','#3f6212','#fff','rgba(30,50,12,.82)','#fff'),
}

# ---------- Title text per game (display) ----------
TITLES = {
    '2048':'2048 MERGE',
    'snake':'SNAKE',
    'pacman':'PAC-MAN',
    'snake-pro':'SNAKE PRO',
    'plane':'PLANE WAR',
    'fruit-catcher':'FRUIT CATCH',
    'whack-mole':'WHACK-A-MOLE',
    'match3':'MATCH-3',
    'breakout':'BREAKOUT',
    'memory':'MEMORY',
    'tetris':'TETRIS',
    'minesweeper':'MINESWEEPER',
    'racer':'SPEED RACER',
    'sky-fighter':'SKY FIGHTER',
    'tank':'TANK BATTLE',
    'asteroids':'ASTEROIDS',
    'bouncy-ball':'BOUNCY BALL',
    'space-invaders':'SPACE INVADERS',
    'bubble-shooter-arcade':'BUBBLE SHOOTER',
    'tetris-arcade':'TETRIS 2',
    'memory-match':'MEMORY CARDS',
    'bubble-pop':'BUBBLE POP',
    'fireworks-show':'FIREWORKS',
    'music-shapes':'MUSIC SHAPES',
    'picture-puzzle':'PUZZLE',
    'color-splash':'COLOR SPLASH',
    'fruit-slice':'FRUIT SLICE',
    'cake':'CAKE',
    'runner':'RUNNER',
    'suika':'SUIKA',
}

def render(slug):
    bg1, bg2, hl, pill_bg, pill_text = COLORS[slug]
    scene = SCENES[slug]
    return template(bg1, bg2, hl, pill_bg, pill_text, scene, TITLES[slug])

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for slug in COLORS.keys():
        svg = render(slug)
        path = os.path.join(OUT, f'{slug}.svg')
        open(path, 'w', encoding='utf-8').write(svg)
        print('wrote', path)