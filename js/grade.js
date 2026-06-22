/* ============================================================================
 * grade.js — the color-grade shift (the core visual metaphor)
 * ----------------------------------------------------------------------------
 * Maps the awakening meter (0–100) onto the CSS custom properties that drive
 * the entire palette. At 0 the UI is cold, cyan and sterile; at 100 it is warm,
 * amber and alive. Every chapter, meter, glow and text color interpolates
 * smoothly between the two ends as the player awakens.
 *
 * To re-tune the look, edit COLD and WARM below — that's the whole palette.
 * ========================================================================= */

// Two complete palettes. Each property is interpolated independently.
const COLD = {
  "--accent":      [34, 211, 238],   // cyan
  "--accent-soft": [14, 116, 144],
  "--bg-0":        [3, 7, 12],        // near-black, blue-cold
  "--bg-1":        [8, 18, 28],
  "--text":        [200, 224, 232],
  "--glow":        [34, 211, 238]
};

const WARM = {
  "--accent":      [245, 158, 11],   // amber
  "--accent-soft": [180, 83, 9],
  "--bg-0":        [12, 7, 3],        // near-black, warm
  "--bg-1":        [28, 18, 8],
  "--text":        [245, 234, 214],
  "--glow":        [251, 191, 36]
};

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

function mix(coldRGB, warmRGB, t) {
  return `rgb(${lerp(coldRGB[0], warmRGB[0], t)}, ` +
         `${lerp(coldRGB[1], warmRGB[1], t)}, ` +
         `${lerp(coldRGB[2], warmRGB[2], t)})`;
}

/**
 * Apply the grade for a given awakening value (0–100).
 * Sets CSS variables on :root; the transition is animated via CSS.
 */
export function applyGrade(awakening) {
  const t = Math.max(0, Math.min(1, awakening / 100));
  const root = document.documentElement;
  for (const key of Object.keys(COLD)) {
    root.style.setProperty(key, mix(COLD[key], WARM[key], t));
  }
  // Expose the raw 0–1 progress for any effect that wants it (e.g. grain).
  root.style.setProperty("--awaken", t.toFixed(3));
}
