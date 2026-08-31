/* Level generator for Screw Master v5 — SHAPED plates on a full-size wooden backboard.
 *
 * Core rule (same as v4, proven solvable):
 *   - A grid of holes. Each steel plate is bolted with EXACTLY 2 screws (pins).
 *   - A plate falls only when BOTH its pins are empty. Exactly  ̃2 holes start empty (spare).
 *   - Click screw -> click free hole = move it.
 *
 * v5 additions:
 *   - Plates come in SHAPES (bar / L / triangle / ellipse / square / T) defined by a polygon.
 *   - LAYERING: a plate rests on every lower-layer plate it overlaps, so it cannot fall until
 *     those lower plates are gone. Bottom plate blocks the ones above it.
 *   - Some plates share a pin (one screw fixes two plates) -> order matters.
 *
 * Solvability = randomised greedy playouts (state graph too big for exhaustive search).
 * Any path found is a real solution, so broken levels can never pass.
 * Usage: node gen_screw_levels.js
 */

const fs = require('fs');
const path = require('path');

const COLS = 8, GX = 74, SX = 116, SY = 84, PLATE_H = 60, PAD = 28, CENTRE_Y = 266;
/* A square must stay SHORTER than the row spacing (SY), otherwise it swallows the holes of the
   row above/below -> phantom holes. span = SX + 2*SQ_PAD, so half-height = SX/2 + SQ_PAD must
   stay well under SY. 58 + 10 = 68 < 84, leaving a 16px safety margin. */
const SQ_PAD = 10;

function buildHoles(rows) {
  const y0 = CENTRE_Y - (rows - 1) * SY / 2;
  const holes = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < COLS; c++) holes.push({ x: GX + c * SX, y: Math.round(y0 + r * SY) });
  return holes;
}

const SHAPE_TYPES = ['bar', 'L', 'tri', 'ell', 'square', 'T'];

/* Build the shape in a LOCAL frame: u runs along the line between the two pins (the pins sit at
   u = -D/2 and u = +D/2, v = 0), v is across it. Working this way means the exact same shape
   works for a horizontal pair and a vertical pair — we just rotate the result — so plates are no
   longer forced to lie horizontally. */
function shapePoly(type, D) {
  const h = PLATE_H / 2;
  let poly;
  if (type === 'bar') {
    const u0 = -D / 2 - PAD, u1 = D / 2 + PAD;
    poly = [[u0, -h], [u1, -h], [u1, h], [u0, h]];
  } else if (type === 'L') {
    const u0 = -D / 2 - PAD, u1 = D / 2 + PAD;
    const notch = -6;                 // the long arm starts a few px above the centre line
    const divider = -D / 2 + PAD;     // short arm holds pin a, long arm holds pin b
    poly = [[u0, -h], [divider, -h], [divider, notch], [u1, notch], [u1, h], [u0, h]];
  } else if (type === 'tri') {
    poly = [[-D / 2 - PAD, 8], [D / 2 + PAD, 8], [0, -h - 14]];
  } else if (type === 'ell') {
    const rx = D / 2 + PAD + 6, ry = h + 10, p = [];
    for (let i = 0; i < 24; i++) { const t = i / 24 * 2 * Math.PI; p.push([Math.cos(t) * rx, Math.sin(t) * ry]); }
    poly = p;
  } else if (type === 'square') {
    const side = D + 2 * SQ_PAD;      // must stay under the spacing of the OTHER axis
    poly = [[-side / 2, -side / 2], [side / 2, -side / 2], [side / 2, side / 2], [-side / 2, side / 2]];
  } else { // 'T' — cross bar carries both pins, stem sticks out to one side
    const u0 = -D / 2 - PAD, u1 = D / 2 + PAD, stem = -h - 20, sw = PAD / 2;
    /* NOTE: the [u0, h] corner is essential. Without it the closing edge runs diagonally from
       (-sw, h) straight back to (u0, -h) and slices a corner off, which pushes a pin outside the
       polygon and gets the shape rejected every single time. */
    poly = [[u0, -h], [u1, -h], [u1, h], [sw, h], [sw, stem], [-sw, stem], [-sw, h], [u0, h]];
  }
  return poly;
}

/* Build a plate object given hole indices and a shape type. The two pins may be side by side
   (horizontal) or one above the other (vertical) — the shape follows the pair. */
function mkPlate(H, i1, i2, layer, type) {
  const a = H[i1], b = H[i2];
  const dx = b.x - a.x, dy = b.y - a.y;
  const vertical = Math.abs(dy) > Math.abs(dx);
  const D = Math.hypot(dx, dy);
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
  const local = shapePoly(type, D);
  // rotate the local frame onto the pin axis: for a vertical pair u maps to +y and v to +x
  const poly = local.map(([u, v]) => vertical ? [cx + v, cy + u] : [cx + u, cy + v]);
  // keep every plate strictly inside the 960x540 canvas (with a small margin)
  return { type, poly: poly.map(([x, y]) => [Math.max(14, Math.min(946, x)), Math.max(14, Math.min(526, y))]),
           pins: [i1, i2], layer };
}

function bboxOf(poly) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}

/* After plates are placed, look at their REAL geometric overlap and assign layers so that a
   plate resting on top of another has the higher layer. This is exactly the case in the user's
   reference image: two triangles stacked vertically -> the upper one cannot fall until the lower
   one is gone. Side-by-side plates (same vertical band, just touching) stay at the same layer. */
function assignLayers(plates) {
  const N = plates.length;
  const cy = i => { const b = bboxOf(plates[i].poly); return (b.y0 + b.y1) / 2; };
  const above = plates.map(() => []);              // i -> j : i is physically above j
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (!polysOverlap(plates[i].poly, plates[j].poly)) continue;
      const di = cy(i), dj = cy(j);
      if (Math.abs(di - dj) < 8) continue;         // same vertical band -> no stacking order
      if (di < dj) above[i].push(j);               // i has smaller y -> i is higher up
      else above[j].push(i);
    }
  }
  const layer = new Array(N).fill(0);
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < N; i++) {
      for (const j of above[i]) {
        if (layer[i] <= layer[j]) { layer[i] = layer[j] + 1; changed = true; }
      }
    }
  }
  plates.forEach((p, i) => p.layer = layer[i]);
}

function build(rows, chain, gap, stack, vert) {
  const H = buildHoles(rows), NH = H.length;
  const covered = new Array(NH).fill(false);
  // reserve a couple of holes to stay empty — that is where the spare screws live
  const skip = new Array(NH).fill(false);
  const wantSkip = Math.max(2, Math.round(NH * (gap || 0.12)));
  for (let k = 0; k < wantSkip; k++) skip[(Math.random() * NH) | 0] = true;
  const plates = [];
  for (let i = 0; i < NH; i++) {
    if (covered[i] || skip[i]) continue;
    const c = i % COLS, r = (i / COLS) | 0;
    /* Partner may be the hole to the RIGHT (side by side) or the hole BELOW (stacked), so plates
       are no longer locked into horizontal rows — groups of them can form squares, triangles and
       other irregular silhouettes. */
    const opts = [];
    if (c + 1 < COLS && !skip[i + 1]) opts.push(i + 1);
    if (r + 1 < rows && !skip[i + COLS] && Math.random() < vert) opts.push(i + COLS);
    if (!opts.length) continue;
    const j = opts[(Math.random() * opts.length) | 0];
    const ci = covered[i], cj = covered[j];
    if (ci && cj) continue;
    // re-using a hole is only allowed when stacking on top of the plate that already owns it
    if (ci !== cj && !(stack > 0 && Math.random() < stack)) continue;
    const type = SHAPE_TYPES[(Math.random() * SHAPE_TYPES.length) | 0];
    plates.push(mkPlate(H, i, j, 0, type));        // layer fixed later by assignLayers
    covered[i] = covered[j] = true;
  }
  assignLayers(plates);
  const gaps = covered.reduce((n, v) => n + (v ? 0 : 1), 0);
  return { gaps, plates, NH };
}

/* ---------- geometry / solver ---------- */
function pip(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function segInt(a, b, c, d) {
  const d1 = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d2 = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]);
  const d3 = (d[0] - c[0]) * (a[1] - c[1]) - (d[1] - c[1]) * (a[0] - c[0]);
  const d4 = (d[0] - c[0]) * (b[1] - c[1]) - (d[1] - c[1]) * (b[0] - c[0]);
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
}
function polysOverlap(A, B) {
  const ba = bbox(A), bb = bbox(B);
  if (ba.x1 < bb.x0 || ba.x0 > bb.x1 || ba.y1 < bb.y0 || ba.y0 > bb.y1) return false;
  for (const pt of A) if (pip({ x: pt[0], y: pt[1] }, B)) return true;
  for (const pt of B) if (pip({ x: pt[0], y: pt[1] }, A)) return true;
  for (let i = 0; i < A.length; i++) {
    const a1 = A[i], a2 = A[(i + 1) % A.length];
    for (let j = 0; j < B.length; j++) {
      const b1 = B[j], b2 = B[(j + 1) % B.length];
      if (segInt(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}
function bbox(p) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}
const HOLE_R = 18;   // hole opening incl. chamfer ring (matches runtime)
/* A plate blocks hole (hx,hy) when its polygon overlaps the hole opening (a circle of radius
   HOLE_R) — fully, half, or just 1/3. Mirrors the runtime's plateHitsHole() so generated levels
   never depend on a hole the game now refuses to accept a screw into. */
function plateHitsHole(poly, hx, hy) {
  if (pip({ x: hx, y: hy }, poly)) return true;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (segDist(hx, hy, a[0], a[1], b[0], b[1]) <= HOLE_R) return true;
  }
  return false;
}

function solve(level, tries) {
  const NH = level.holes.length, plates = level.plates, NP = plates.length;
  const pinSets = plates.map(p => new Set(p.pins));
  const coverList = [];
  for (let h = 0; h < NH; h++) {
    const l = [];
    for (let pi = 0; pi < NP; pi++) if (pip({ x: level.holes[h].x, y: level.holes[h].y }, plates[pi].poly)) l.push(pi);
    coverList.push(l);
  }
  // overlap / support graph
  const ov = plates.map(() => []);
  for (let i = 0; i < plates.length; i++)
    for (let j = i + 1; j < plates.length; j++)
      if (polysOverlap(plates[i].poly, plates[j].poly)) { ov[i].push(j); ov[j].push(i); }

  /* covH[i] = the holes plate i actually lies on top of.
     IMPORTANT: this must stay "the holes inside the polygon", NOT "every hole in the column
     below it". The screw count is constant, so the board only ever has its 2 spare holes free —
     demanding a completely clear column beneath a plate makes every non-bottom plate impossible
     to drop (measured: 0 solvable levels). "Blocked" therefore means blocked by what the plate
     is directly resting on, which is what the player sees. */
  const covH = plates.map(p => {
    const l = [];
    for (let h = 0; h < NH; h++) if (pip({ x: level.holes[h].x, y: level.holes[h].y }, p.poly)) l.push(h);
    return l;
  });

  // ownerOf[h] = index of the plate whose own pin is hole h (or -1)
  const ownerOf = new Array(NH).fill(-1);
  for (let i = 0; i < NP; i++) for (const h of plates[i].pins) ownerOf[h] = i;

  /* Detach / cascade rule — MUST match the runtime's releasePlates(): a plate lets go when both
   of its own screws are out AND nothing is directly under it (a screw in covH still standing, or
   a lower overlapping plate still on the board). The "board-position below" test (belowSupportY)
   lives ONLY in the runtime and governs where a detached plate LANDS / how a one-screw-loose
   plate DROOPS — it intentionally does NOT gate detachment, so it is not modelled here. */
  function falls(s, f) {
    const o = f.slice();
    let ch = true;
    while (ch) {
      ch = false;
      for (let i = 0; i < NP; i++) {
        if (o[i]) continue;
        // (1) both of its own screws are out
        if (!plates[i].pins.every(h => !s[h])) continue;
        // (2) no screw still sitting anywhere under it — it would rest on that screw head
        if (covH[i].some(h => s[h])) continue;
        // (3) no lower overlapping plate still in the way (bottom blocks top)
        let supported = false;
        for (const j of ov[i]) if (!o[j] && plates[j].layer < plates[i].layer) { supported = true; break; }
        if (supported) continue;
        o[i] = true; ch = true;
      }
    }
    return o;
  }
  // A screw is reachable unless a plate that is still BOLTED lies on top of it. A plate that has
  // already come loose is only resting on the screw head, so the screw can still be pulled.
  const acc = (s, f, h) => {
    if (!s[h]) return false;
    for (const pi of coverList[h]) {
      if (pinSets[pi].has(h)) continue;                          // the screw pins this plate
      if (f[pi]) continue;                                       // that plate has already dropped
      if (plates[pi].pins.every(x => !s[x])) continue;           // plate is loose -> reachable
      return false;
    }
    return true;
  };
  /* SEARCH PRUNING ONLY: the solver parks screws in holes that no OTHER plate is lying over.
     A plate's OWN pin is always available while the plate is still present, because the game
     allows re-inserting a screw into the plate's own hole. */
  const fr = (s, f, h) => {
    if (s[h]) return false;
    const own = ownerOf[h];
    const hh = level.holes[h];
    for (let pi = 0; pi < NP; pi++) {
      if (f[pi]) continue;
      if (pi === own) continue;                        // own pin of a present plate is always free
      if (plateHitsHole(plates[pi].poly, hh.x, hh.y)) return false;
    }
    return true;
  };
  /* How far down the board each screw's plate sits. Nothing can leave while something is
     underneath it, so the only workable order is bottom row first — the playout has to be
     steered that way or it just wanders. */
  const yBottom = plates.map(p => { let m = -Infinity; for (const [, y] of p.poly) m = Math.max(m, y); return m; });
  const depthOf = new Array(NH).fill(0);
  for (let h = 0; h < NH; h++) {
    let d = 0;
    for (let i = 0; i < NP; i++) if (plates[i].pins.indexOf(h) >= 0) d = Math.max(d, yBottom[i]);
    depthOf[h] = d;
  }
  const f0 = falls(level.screws.map(() => true), new Array(NP).fill(false));
  if (f0.every(v => v)) return null;

  function playout(random) {
    let s = level.screws.map(() => true), f = f0.slice();
    for (let step = 0; step < 400; step++) {
      if (f.every(v => v)) return true;
      const cands = [];
      for (let h = 0; h < NH; h++) {
        if (!acc(s, f, h)) continue;
        const s2 = s.slice(); s2[h] = false;
        const f2 = falls(s2, f.slice());
        const free = [];
        for (let g = 0; g < NH; g++) if (fr(s2, f2, g)) free.push(g);
        if (!free.length) continue;
        let gain = 0;
        for (let i = 0; i < NP; i++) if (f2[i] && !f[i]) gain++;
        for (const g of free) cands.push({ h, g, s2, f2, gain, depth: depthOf[h] });
      }
      if (!cands.length) return false;
      let pick;
      const best = cands.filter(c => c.gain > 0);
      if (best.length && (!random || Math.random() < 0.9)) {
        pick = best[Math.floor(Math.random() * best.length)];
      } else if (random && Math.random() < 0.35) {
        pick = cands[Math.floor(Math.random() * cands.length)];      // keep some diversity
      } else {
        // nothing can drop yet — chip away at the LOWEST plate, everything above rests on it
        let mx = -Infinity;
        for (const c of cands) mx = Math.max(mx, c.depth);
        const low = cands.filter(c => c.depth >= mx - 0.5);
        pick = low[Math.floor(Math.random() * low.length)];
      }
      s = pick.s2.slice(); s[pick.g] = true;
      f = falls(s, pick.f2);
    }
    return false;
  }
  if (playout(false)) return true;
  for (let t = 0; t < tries; t++) if (playout(true)) return true;
  return false;
}

/* stack = chance that a plate is laid ON TOP of the previous one (sharing a hole) instead of
   being skipped. 0 on L1 so the intro stays flat, then ramps up so the "bottom blocks top"
   rule becomes the main puzzle from L2 onwards. */
const CONFIGS = [
  { rows: 2, chain: 0.10, gap: 0.12, stack: 0.00, vert: 0.35, minP: 6,  maxP: 9 },
  { rows: 2, chain: 0.30, gap: 0.12, stack: 0.90, vert: 0.45, minP: 6,  maxP: 9 },
  { rows: 3, chain: 0.35, gap: 0.12, stack: 0.90, vert: 0.45, minP: 10, maxP: 14 },
  { rows: 3, chain: 0.40, gap: 0.12, stack: 0.90, vert: 0.50, minP: 10, maxP: 14 },
  { rows: 4, chain: 0.35, gap: 0.12, stack: 0.90, vert: 0.50, minP: 14, maxP: 19 },
  { rows: 4, chain: 0.40, gap: 0.12, stack: 0.90, vert: 0.55, minP: 14, maxP: 19 },
  /* L7/L8: dense 5-row boards. Under the STRICT visibility rule every pulled screw must park in
     a 100% exposed hole, so dense boards need extra buffer holes (minGaps/maxGaps) and slightly
     fewer plates, otherwise no solvable layout exists (solver starves for parking spots). */
  { rows: 5, chain: 0.35, gap: 0.15, stack: 0.90, vert: 0.55, minP: 15, maxP: 21, minGaps: 4, maxGaps: 7 },
  { rows: 5, chain: 0.45, gap: 0.15, stack: 0.90, vert: 0.60, minP: 15, maxP: 21, minGaps: 4, maxGaps: 7 }
];

if (process.env.DIAG) {
  const cfg = CONFIGS[0];
  let total = 0, gapsOk = 0, solved = 0, t0 = Date.now();
  for (let a = 0; a < 3000; a++) {
    total++;
    const cand = build(cfg.rows, cfg.chain, cfg.gap, cfg.stack, cfg.vert);
    if (!cand || cand.gaps !== 2) continue;
    const N = cand.plates.length;
    if (N < cfg.minP || N > cfg.maxP) continue;
    gapsOk++;
    const H = buildHoles(cfg.rows), NH = H.length;
    const covered = new Array(NH).fill(false);
    cand.plates.forEach(p => p.pins.forEach(i => covered[i] = true));
    const holes = H.map((h, i) => ({ x: h.x, y: h.y, idx: i }));
    const screwAt = new Array(NH).fill(false);
    cand.plates.forEach(p => p.pins.forEach(i => screwAt[i] = true));
    const screws = [];
    for (let h = 0; h < NH; h++) if (screwAt[h]) screws.push(h);
    const level = { holes, plates: cand.plates.map(p => ({ type: p.type, poly: p.poly, pins: p.pins, layer: p.layer })), screws };
    const pinsOk = level.plates.every(p => p.pins.every(h => pip({ x: level.holes[h].x, y: level.holes[h].y }, p.poly)));
    if (!pinsOk) continue;
    const noStray = level.plates.every(p => level.holes.every((h, hi) => p.pins.indexOf(hi) >= 0 || !pip(h, p.poly)));
    if (!noStray) continue;
    if (solve(level, 80)) solved++;
  }
  console.log(`DIAG L1: total=${total} gapsOk=${gapsOk} solved=${solved} time=${Date.now() - t0}ms`);
  process.exit(0);
}

const levels = [];
CONFIGS.forEach((cfg, li) => {
  let found = null;
  for (let attempt = 0; attempt < 60000 && !found; attempt++) {
    if (attempt % 5000 === 0) console.error(`  L${li + 1} attempt ${attempt}…`);
    const cand = build(cfg.rows, cfg.chain, cfg.gap, cfg.stack, cfg.vert);
    if (!cand) continue;
    const lo = cfg.minGaps || 2, hi = cfg.maxGaps || 2;
    if (cand.gaps < lo || cand.gaps > hi) continue;
    const N = cand.plates.length;
    if (N < cfg.minP || N > cfg.maxP) continue;

    // build full level object with holes + screws
    const H = buildHoles(cfg.rows), NH = H.length;
    const covered = new Array(NH).fill(false);
    const plates = cand.plates;
    plates.forEach(p => p.pins.forEach(i => covered[i] = true));
    const holes = H.map((h, i) => ({ x: h.x, y: h.y, idx: i }));
    const screwAt = new Array(NH).fill(false);
    plates.forEach(p => p.pins.forEach(i => screwAt[i] = true));
    const screws = [];
    for (let h = 0; h < NH; h++) if (screwAt[h]) screws.push(h);

    const level = { holes, plates: plates.map(p => ({ type: p.type, poly: p.poly, pins: p.pins, layer: p.layer })), screws };
    // safety gate 1: every pin hole must lie inside its own plate polygon
    const pinsOk = level.plates.every(p => p.pins.every(h => pip({ x: level.holes[h].x, y: level.holes[h].y }, p.poly)));
    if (!pinsOk) continue;
    /* safety gate 2: a plate must ONLY cover its own two pin holes.
       If a plate sat on a hole it does not own, the screw in that hole would be unreachable
       (the plate is on top of it) while also holding the plate up -> guaranteed deadlock under
       the new "a screw underneath blocks the plate" rule. It also re-introduces the v4
       "phantom hole" bug, because the hidden hole only appears once the plate drops. */
    const noStray = level.plates.every(p => level.holes.every((h, hi) =>
      p.pins.indexOf(hi) >= 0 || !plateHitsHole(p.poly, h.x, h.y)));
    if (!noStray) continue;
    if (solve(level, 80)) found = level;
  }
  if (!found) { console.error('FAILED level', li + 1); process.exit(1); }
  levels.push(found);
  console.log(`L${li + 1}: rows=${cfg.rows} plates=${found.plates.length} screws=${found.screws.length} holes=${found.holes.length}`);
});

const out = '// AUTO-GENERATED by gen_screw_levels.js (v5: shaped plates, layer blocking, full-size board).\n'
  + 'window.SCREW_LEVELS=' + JSON.stringify(levels) + ';\n';
const dir = path.join(__dirname, 'public', 'games', 'screw-master');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'levels.js'), out, 'utf8');
console.log('\nWrote', path.join(dir, 'levels.js'));
