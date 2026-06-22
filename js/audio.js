/* ============================================================================
 * audio.js — per-chapter background music + autoplay-policy handling
 * ----------------------------------------------------------------------------
 * Browsers block audio until the user interacts with the page. The title
 * screen's "TAP TO BEGIN" button is that gesture: call `unlock()` from its
 * click handler, after which `play()` will work.
 *
 * Swap a chapter's music by changing its `audio` path in story.js.
 * ========================================================================= */

import { state, setMuted, setVolume } from "./state.js";

let el = null;          // the single <audio> element we reuse across chapters
let unlocked = false;   // becomes true after the first user gesture
let currentSrc = null;

function ensureEl() {
  if (el) return el;
  el = new Audio();
  el.loop = true;
  el.preload = "auto";
  el.volume = state.muted ? 0 : state.volume;
  return el;
}

/** Call once from the "tap to begin" gesture to satisfy autoplay policy. */
export function unlock() {
  unlocked = true;
  const a = ensureEl();
  // Prime the element with a play/pause so later play() calls are trusted.
  a.play().then(() => a.pause()).catch(() => { /* fine before src set */ });
}

/** Load and play a chapter's track. Safe to call repeatedly. */
export function playTrack(src) {
  const a = ensureEl();
  if (src !== currentSrc) {
    currentSrc = src;
    a.src = src;
  }
  applyVolume();
  if (unlocked && !state.muted) {
    a.play().catch(() => { /* ignored: user can toggle audio manually */ });
  }
}

export function pause() {
  if (el) el.pause();
}

function applyVolume() {
  if (el) el.volume = state.muted ? 0 : state.volume;
}

/** Toggle mute; returns the new muted boolean. */
export function toggleMute() {
  setMuted(!state.muted);
  applyVolume();
  if (el) {
    if (state.muted) el.pause();
    else if (unlocked && currentSrc) el.play().catch(() => {});
  }
  return state.muted;
}

export function changeVolume(v) {
  setVolume(v);
  if (state.muted && v > 0) setMuted(false);
  applyVolume();
  if (el && !state.muted && unlocked && currentSrc && el.paused) {
    el.play().catch(() => {});
  }
}

export function isMuted() {
  return state.muted;
}
