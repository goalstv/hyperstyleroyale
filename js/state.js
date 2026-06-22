/* ============================================================================
 * state.js — game state + localStorage persistence
 * ----------------------------------------------------------------------------
 * Holds the single source of truth: the awakening meter, which chapters are
 * unlocked/completed, and audio prefs. Auto-saves so the title screen can offer
 * "Continue" and the chapter-select can show progress.
 * Engine code reads/writes through these helpers; story.js never touches this.
 * ========================================================================= */

const SAVE_KEY = "neon-prophets-save-v1";

const DEFAULTS = {
  awakening: 0,          // 0–100, the core meter
  unlocked: [0],         // indices of chapters the player may enter
  completed: [],         // indices of chapters fully played through
  muted: false,
  volume: 0.7
};

export const state = { ...DEFAULTS };

/** Load persisted state from localStorage into `state` (silently if absent). */
export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    Object.assign(state, DEFAULTS, JSON.parse(raw));
    return true;
  } catch {
    return false;
  }
}

/** Persist the current state. Called after any meaningful change. */
export function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode); game still works in-memory */
  }
}

/** Wipe all progress back to defaults (used by the title screen "Restart"). */
export function reset() {
  Object.assign(state, structuredClone(DEFAULTS));
  save();
}

/** True if the player has any saved progress worth resuming. */
export function hasProgress() {
  return state.awakening > 0 || state.completed.length > 0 || state.unlocked.length > 1;
}

/** Move the meter by `delta`, clamped to 0–100. Returns the new value. */
export function adjustAwakening(delta) {
  state.awakening = Math.max(0, Math.min(100, state.awakening + delta));
  save();
  return state.awakening;
}

/** Mark a chapter index as completed and unlock the next one. */
export function completeChapter(index, totalChapters) {
  if (!state.completed.includes(index)) state.completed.push(index);
  const next = index + 1;
  if (next < totalChapters && !state.unlocked.includes(next)) {
    state.unlocked.push(next);
  }
  save();
}

export function isUnlocked(index) {
  return state.unlocked.includes(index);
}

export function setMuted(muted) {
  state.muted = muted;
  save();
}

export function setVolume(v) {
  state.volume = Math.max(0, Math.min(1, v));
  save();
}
