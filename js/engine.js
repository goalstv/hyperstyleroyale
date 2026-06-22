/* ============================================================================
 * engine.js — the visual-novel scene player
 * ----------------------------------------------------------------------------
 * Reads a chapter's `scene` array (from story.js) and plays it beat by beat:
 *   - "line"   → typewriter text reveal, tap to advance
 *   - "choice" → buttons that move the awakening meter (+ optional branch)
 *   - "rhythm" → hands off to rhythm.js, then applies the gained awakening
 *
 * It owns no story content and no navigation chrome. The host (main.js) wires
 * DOM refs and lifecycle hooks; the engine just runs whatever chapter it's given.
 * ========================================================================= */

import { chapters } from "./story.js";
import { state, adjustAwakening, completeChapter } from "./state.js";
import { applyGrade } from "./grade.js";
import { playTrack } from "./audio.js";
import { runRhythm } from "./rhythm.js";

const TYPE_SPEED_MS = 22;   // per character; lower = faster typewriter

let ui = {};                // DOM refs, set in init()
let hooks = {};             // { onChapterComplete(i), onFinale(awakening) }

let chapterIndex = 0;
let scene = [];
let beatIndex = 0;
let grade = { base: "cyanCold", peak: "amberWarm" };  // current chapter's palette
let typing = null;          // active typewriter interval, or null
let fullText = "";          // text currently being typed (for skip-to-end)

export function init(refs, lifecycleHooks) {
  ui = refs;
  hooks = lifecycleHooks || {};
  // Tapping anywhere over the scene advances dialogue — except on the HUD,
  // choice buttons, or rhythm pulses, which handle their own input.
  ui.screen.addEventListener("pointerdown", onStageTap);
}

export function startChapter(index) {
  chapterIndex = index;
  const chapter = chapters[index];
  scene = chapter.scene;
  beatIndex = 0;
  grade = chapter.grade || { base: "cyanCold", peak: "amberWarm" };

  // Set the chapter's stage dressing.
  ui.bg.style.backgroundImage = `url("${chapter.background}")`;
  playTrack(chapter.audio);
  applyGrade(state.awakening, grade.base, grade.peak);

  // Fade the background in fresh each chapter.
  ui.bg.classList.remove("bg--in");
  void ui.bg.offsetWidth;            // reflow to restart the transition
  ui.bg.classList.add("bg--in");

  renderBeat();
}

function onStageTap(e) {
  // Ignore taps on interactive chrome so controls/choices/pulses still work.
  if (e.target.closest(".hud, .choices, .rhythm, button, input")) return;
  const beat = scene[beatIndex];
  if (!beat || beat.type !== "line") return;   // choices/rhythm handle own taps
  if (typing) { finishTyping(); return; }       // first tap completes the reveal
  nextBeat();                                    // second tap advances
}

function nextBeat() {
  beatIndex++;
  if (beatIndex >= scene.length) return endChapter();
  renderBeat();
}

function gotoBeat(id) {
  const idx = scene.findIndex((b) => b.id === id);
  if (idx === -1) { nextBeat(); return; }
  beatIndex = idx;
  renderBeat();
}

function renderBeat() {
  const beat = scene[beatIndex];
  resetStage();

  if (beat.type === "line")        return renderLine(beat);
  if (beat.type === "choice")      return renderChoice(beat);
  if (beat.type === "rhythm")      return renderRhythm(beat);
  // Unknown beat type: skip gracefully.
  nextBeat();
}

/* --- line ---------------------------------------------------------------- */
function renderLine(beat) {
  if (beat.oracleGlitch) triggerGlitch();

  // Portrait + speaker.
  if (beat.portrait) {
    ui.portrait.style.backgroundImage = `url("${beat.portrait}")`;
    ui.portrait.classList.add("portrait--in");
  } else {
    ui.portrait.classList.remove("portrait--in");
  }
  ui.speaker.textContent = beat.speaker || "";
  ui.speaker.style.display = beat.speaker ? "block" : "none";

  ui.dialogue.classList.add("dialogue--visible");
  typeText(beat.text);
}

function typeText(text) {
  fullText = text;
  ui.text.textContent = "";
  ui.hint.classList.remove("hint--visible");
  let i = 0;
  typing = setInterval(() => {
    ui.text.textContent += text[i++];
    if (i >= text.length) finishTyping();
  }, TYPE_SPEED_MS);
}

function finishTyping() {
  clearInterval(typing);
  typing = null;
  ui.text.textContent = fullText;
  ui.hint.classList.add("hint--visible");   // "tap to continue"
}

/* --- choice -------------------------------------------------------------- */
function renderChoice(beat) {
  ui.dialogue.classList.remove("dialogue--visible");
  ui.choicesList.innerHTML = "";
  ui.choicePrompt.textContent = beat.prompt;
  ui.choices.classList.add("choices--visible");

  beat.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.type = "button";
    btn.textContent = opt.text;
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      adjustAwakening(opt.awakening || 0);
      updateMeter(true);
      ui.choices.classList.remove("choices--visible");
      if (opt.goto) gotoBeat(opt.goto);
      else nextBeat();
    });
    ui.choicesList.appendChild(btn);
  });
}

/* --- rhythm -------------------------------------------------------------- */
function renderRhythm(beat) {
  ui.dialogue.classList.remove("dialogue--visible");
  ui.portrait.classList.remove("portrait--in");
  ui.rhythmPrompt.textContent = beat.prompt;
  ui.rhythmArea.innerHTML = "";
  ui.rhythmWrap.classList.add("rhythm--visible");

  const setProgress = ({ hits, total }) => {
    ui.rhythmProgress.textContent = `SIGNAL LOCK  ${hits}/${total}`;
  };
  setProgress({ hits: 0, total: beat.pulses });

  runRhythm(
    beat,
    ui.rhythmArea,
    (p) => {
      setProgress(p);
      // Live meter feedback as the player lands hits.
      applyGrade(Math.min(100, state.awakening + p.gained), grade.base, grade.peak);
    }
  ).then((gained) => {
    adjustAwakening(gained);
    updateMeter(true);
    ui.rhythmWrap.classList.remove("rhythm--visible");
    nextBeat();
  });
}

/* --- chapter lifecycle --------------------------------------------------- */
function endChapter() {
  completeChapter(chapterIndex, chapters.length);
  const isFinale = chapterIndex === chapters.length - 1;
  if (isFinale && hooks.onFinale) hooks.onFinale(state.awakening);
  else if (hooks.onChapterComplete) hooks.onChapterComplete(chapterIndex);
}

/* --- helpers ------------------------------------------------------------- */
function resetStage() {
  if (typing) { clearInterval(typing); typing = null; }
  ui.dialogue.classList.remove("dialogue--visible");
  ui.choices.classList.remove("choices--visible");
  ui.rhythmWrap.classList.remove("rhythm--visible");
  ui.hint.classList.remove("hint--visible");
}

export function updateMeter(animate) {
  const v = state.awakening;
  ui.meterFill.style.width = v + "%";
  ui.meterLabel.textContent = `AWAKENING ${Math.round(v)}`;
  applyGrade(v, grade.base, grade.peak);
  if (animate) {
    ui.meter.classList.remove("meter--pulse");
    void ui.meter.offsetWidth;
    ui.meter.classList.add("meter--pulse");
  }
}

function triggerGlitch() {
  ui.screen.classList.add("glitching");
  setTimeout(() => ui.screen.classList.remove("glitching"), 650);
}
