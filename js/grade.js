/* ============================================================================
 * grade.js — the per-episode color grade + meter-driven shift
 * ----------------------------------------------------------------------------
 * Two things drive the on-screen palette:
 *
 *   1. Each chapter declares its art-directed identity in story.js:
 *         grade: { base: "<paletteName>", peak: "<paletteName>" }
 *      e.g. Ep1 is cyan, Ep3-4 is magenta+teal, Ep7 is blood red, Ep8 amber.
 *
 *   2. The awakening meter (0–100) interpolates WITHIN that chapter's range,
 *      from `base` (asleep / colder) toward `peak` (awake / warmer-brighter).
 *      Since the meter naturally climbs across the game, early chapters sit
 *      near their base and the finale glows near its peak — and any single
 *      choice still visibly nudges the grade.
 *
 * To re-tune the whole look, edit the PALETTES table below. To re-assign which
 * palette an episode uses, edit its `grade` in story.js. Engine/UI code never
 * hard-codes colors.
 * ========================================================================= */

// Named palettes. Each is a full set of the CSS variables grade drives.
// Values are [r, g, b]. Add your own and reference them from story.js.
export const PALETTES = {
  // Ep1 — Archive Division: cold, cyan, sterile
  cyanCold:   { "--accent":[34,211,238], "--accent-soft":[14,116,144], "--bg-0":[3,7,12],   "--bg-1":[8,18,28],  "--text":[200,224,232], "--glow":[34,211,238] },
  // Ep1 peak — the first crack of feeling: cyan with a faint living warmth
  cyanSpark:  { "--accent":[120,224,214],"--accent-soft":[40,150,150],  "--bg-0":[5,10,13],  "--bg-1":[14,24,30], "--text":[218,232,228], "--glow":[150,235,210] },

  // Ep2 peak / general warm — amber, alive
  amberWarm:  { "--accent":[245,158,11], "--accent-soft":[180,83,9],    "--bg-0":[12,7,3],   "--bg-1":[28,18,8],  "--text":[245,234,214], "--glow":[251,191,36] },

  // Ep3-4 — Ghost Protocol underground: teal base, magenta peak
  undergroundTeal:    { "--accent":[45,212,191], "--accent-soft":[15,118,110], "--bg-0":[4,10,12], "--bg-1":[10,26,28], "--text":[200,235,230], "--glow":[45,212,191] },
  undergroundMagenta: { "--accent":[236,72,180], "--accent-soft":[120,20,90],  "--bg-0":[12,4,12], "--bg-1":[26,8,26],  "--text":[240,215,235], "--glow":[236,72,180] },

  // Ep5 — Children of Oracle: serene unsettling gold → defiant gold
  goldSerene:  { "--accent":[214,184,120], "--accent-soft":[150,120,70], "--bg-0":[10,9,7],  "--bg-1":[24,21,14], "--text":[235,228,210], "--glow":[220,200,150] },
  goldDefiant: { "--accent":[250,200,80],  "--accent-soft":[190,140,40], "--bg-0":[12,9,5],  "--bg-1":[30,22,10], "--text":[250,240,220], "--glow":[255,215,120] },

  // Ep6 — Founders' Circle: opulent gold on black
  goldOpulent: { "--accent":[212,175,55], "--accent-soft":[120,95,20], "--bg-0":[6,5,3], "--bg-1":[18,14,6], "--text":[235,225,195], "--glow":[220,180,80] },

  // Ep7 — Collapse Protocol: blood red, broken → a stubborn ember
  bloodBroken: { "--accent":[220,38,38], "--accent-soft":[120,20,20], "--bg-0":[10,3,3], "--bg-1":[26,6,6],  "--text":[235,205,205], "--glow":[239,68,68] },
  bloodEmber:  { "--accent":[240,90,50], "--accent-soft":[150,50,20], "--bg-0":[12,4,3], "--bg-1":[30,10,6], "--text":[245,215,200], "--glow":[251,146,60] },

  // Ep8 — Neon Rising: pre-dawn ash → full warm amber dawn
  dawnDim:   { "--accent":[180,120,70], "--accent-soft":[110,75,40], "--bg-0":[10,7,5],  "--bg-1":[22,16,10], "--text":[225,210,190], "--glow":[200,150,90] },
  amberDawn: { "--accent":[251,191,36], "--accent-soft":[217,119,6], "--bg-0":[16,10,5], "--bg-1":[40,26,12], "--text":[252,242,224], "--glow":[253,224,150] }
};

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

function mix(c, w, t) {
  return `rgb(${lerp(c[0], w[0], t)}, ${lerp(c[1], w[1], t)}, ${lerp(c[2], w[2], t)})`;
}

/**
 * Apply the grade for a given awakening value, interpolating between two named
 * palettes. Defaults (cyanCold → amberWarm) are used for the title/menu.
 *
 * @param {number} awakening  0–100 meter value.
 * @param {string} fromName   palette name at meter 0   (the chapter's `base`).
 * @param {string} toName     palette name at meter 100 (the chapter's `peak`).
 */
export function applyGrade(awakening, fromName = "cyanCold", toName = "amberWarm") {
  const from = PALETTES[fromName] || PALETTES.cyanCold;
  const to   = PALETTES[toName]   || PALETTES.amberWarm;
  const t = Math.max(0, Math.min(1, awakening / 100));
  const root = document.documentElement;
  for (const key of Object.keys(from)) {
    root.style.setProperty(key, mix(from[key], to[key], t));
  }
  // Raw 0–1 progress for effects that read it (grain, bg tint).
  root.style.setProperty("--awaken", t.toFixed(3));
}
