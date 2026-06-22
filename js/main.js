/* ============================================================================
 * main.js — boot + navigation chrome (title, chapter-select, endings, audio UI)
 * ----------------------------------------------------------------------------
 * Wires the DOM to the engine and the persistent state. This is the only file
 * that knows about screens and buttons; the engine just plays chapters.
 * ========================================================================= */

import { meta, chapters } from "./story.js";
import {
  state, load, save, reset, hasProgress, isUnlocked
} from "./state.js";
import { applyGrade } from "./grade.js";
import { unlock, toggleMute, changeVolume, isMuted, pause } from "./audio.js";
import * as engine from "./engine.js";

const $ = (id) => document.getElementById(id);

// ---- collect DOM refs -----------------------------------------------------
const screens = {
  title:  $("screen-title"),
  select: $("screen-select"),
  game:   $("screen-game"),
  ending: $("screen-ending")
};

const ui = {
  screen:        screens.game,
  bg:            $("bg"),
  portrait:      $("portrait"),
  stage:         $("stage"),
  dialogue:      $("dialogue"),
  speaker:       $("speaker"),
  text:          $("text"),
  hint:          $("advance-hint"),
  choices:       $("choices"),
  choicesList:   $("choices-list"),
  choicePrompt:  $("choice-prompt"),
  rhythmWrap:    $("rhythm-wrap"),
  rhythmPrompt:  $("rhythm-prompt"),
  rhythmArea:    $("rhythm-area"),
  rhythmProgress:$("rhythm-progress"),
  meter:         $("meter"),
  meterFill:     $("meter-fill"),
  meterLabel:    $("meter-label")
};

// ---- screen management ----------------------------------------------------
function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle("screen--active", key === name);
  }
  if (name !== "game") pause();
}

// ---- title screen ---------------------------------------------------------
function initTitle() {
  $("title-name").textContent = meta.title;
  $("title-sub").textContent = meta.subtitle;
  refreshTitleButtons();

  // "TAP TO BEGIN" is the user gesture that unlocks audio (autoplay policy).
  $("btn-begin").addEventListener("click", () => {
    unlock();
    enterChapter(0);
  });
  $("btn-continue").addEventListener("click", () => {
    unlock();
    openSelect();
  });
  $("btn-select").addEventListener("click", () => {
    unlock();
    openSelect();
  });
  $("btn-restart").addEventListener("click", () => {
    reset();
    applyGrade(0);
    refreshTitleButtons();
  });
}

function refreshTitleButtons() {
  const resuming = hasProgress();
  $("btn-continue").style.display = resuming ? "block" : "none";
  $("btn-restart").style.display = resuming ? "block" : "none";
  $("btn-begin").textContent = resuming ? "TAP TO RESTART STORY" : "TAP TO BEGIN";
}

// ---- chapter select -------------------------------------------------------
function buildSelect() {
  const grid = $("chapter-grid");
  grid.innerHTML = "";
  chapters.forEach((ch, i) => {
    const locked = !isUnlocked(i);
    const done = state.completed.includes(i);
    const card = document.createElement("button");
    card.className = "chapter-card" + (locked ? " chapter-card--locked" : "");
    card.type = "button";
    card.disabled = locked;
    card.innerHTML = `
      <span class="chapter-card__no">EP ${String(ch.episode).padStart(2, "0")}</span>
      <span class="chapter-card__title">${locked ? "// LOCKED" : ch.title}</span>
      <span class="chapter-card__status">${done ? "✦ played" : locked ? "" : "▶ play"}</span>
    `;
    if (!locked) card.addEventListener("click", () => enterChapter(i));
    grid.appendChild(card);
  });
}

function openSelect() {
  buildSelect();
  showScreen("select");
}

// ---- gameplay -------------------------------------------------------------
function enterChapter(index) {
  showScreen("game");
  engine.updateMeter(false);
  engine.startChapter(index);
}

// ---- endings --------------------------------------------------------------
function resolveEnding(awakening) {
  // Highest threshold the player meets wins.
  let chosen = meta.endings[0];
  for (const e of meta.endings) if (awakening >= e.min) chosen = e;
  return chosen;
}

function showEnding(awakening) {
  const ending = resolveEnding(awakening);
  $("ending-title").textContent = ending.title;
  $("ending-text").textContent = ending.text;
  $("ending-meter").textContent = `FINAL AWAKENING — ${Math.round(awakening)} / 100`;
  applyGrade(awakening);
  showScreen("ending");
}

$("btn-ending-home").addEventListener("click", () => {
  refreshTitleButtons();
  showScreen("title");
});

// ---- audio controls -------------------------------------------------------
function initAudioControls() {
  const muteBtn = $("btn-mute");
  const vol = $("vol");
  const sync = () => { muteBtn.textContent = isMuted() ? "♪̶ muted" : "♪ sound"; };
  vol.value = String(state.volume);
  sync();
  muteBtn.addEventListener("click", () => { toggleMute(); sync(); });
  vol.addEventListener("input", () => { changeVolume(parseFloat(vol.value)); sync(); });
}

$("btn-menu").addEventListener("click", openSelect);
$("btn-select-home").addEventListener("click", () => {
  refreshTitleButtons();
  showScreen("title");
});

// ---- boot -----------------------------------------------------------------
function boot() {
  load();
  applyGrade(state.awakening);

  engine.init(ui, {
    onChapterComplete: () => openSelect(),   // back to map after each chapter
    onFinale: (awakening) => showEnding(awakening)
  });

  initTitle();
  initAudioControls();
  showScreen("title");
}

boot();
