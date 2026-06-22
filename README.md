# NEON PROPHETS

An interactive cyberpunk visual novel with a rhythm/awakening mechanic — the
playable companion to the *Neon Prophets* concept album and animated series.

> Year 2099. An AI called **ORACLE** controls all culture through a hidden elite,
> The Syndicate. You play **AL ROYALE**, an archivist who deletes old culture for
> the regime — until a forbidden transmission begins to wake him up.

This repo is a **playable v1 prototype**: the full **7-chapter** story arc
(mapping the 8 episodes — Ep 3 & 4 share the "Ghost Protocol" chapter)
demonstrating scene flow, branching choices, the persistent **awakening meter**,
the **per-episode color grade + cold→warm meter shift**, and the
**"tune into the frequency"** rhythm mini-mechanic. Everything uses placeholder
art/audio you can swap for the real thing without touching engine code.

| Ch | Episode | Color identity | Closing line |
|----|---------|----------------|--------------|
| 1 | Archive Division | cold cyan → first spark | *"every file got a funeral, every dream got a number"* |
| 2 | Lost Archives | cold → warm transition | *"the past is in the dust and the dust ain't settled yet"* |
| 3 | Ghost Protocol (Ep 3–4) | magenta + teal underground | *"now we're back, and we ain't moving back"* |
| 4 | Children of Oracle | gold, beautiful-unsettling | *"Oracle fed us every answer, now nobody asks why"* |
| 5 | The Founders' Circle | opulent gold + black | *"you don't own my mind, and you don't own mine"* |
| 6 | Collapse Protocol | blood red, broken | *"what was it all in service of"* |
| 7 | Neon Rising (finale) | warm amber dawn | *"they erased the story... so I became the signal"* |

---

## Tech

Vanilla HTML / CSS / JavaScript (ES modules). **No build step, no backend.**
All progress is saved to `localStorage`. Drop it on any static host
(GitHub Pages, Vercel, Netlify) and it just works.

---

## Run it locally

ES modules require an HTTP server (opening `index.html` via `file://` will be
blocked by the browser). Any static server works:

```bash
# Python (no install needed)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000> and tap **TAP TO BEGIN**.

> The first tap is required by browsers' audio-autoplay policy — it's what
> unlocks the music. This is handled for you on the title screen.

### Deploy
- **GitHub Pages:** push to your repo → Settings → Pages → deploy from the
  branch root. No configuration needed.
- **Vercel/Netlify:** import the repo, framework = "Other / static", output
  directory = project root.

---

## Project structure

```
index.html            Single entry point + all on-screen elements
css/
  theme.css           Palette variables + base styles (the cold defaults)
  layout.css          Screens, HUD, dialogue, choices, rhythm, chapter grid
  effects.css         Scanlines, grain, vignette, glitch, typewriter, pulses
js/
  story.js            ★ ALL narrative content — the only file you edit for story
  engine.js           Scene player (typewriter, choices, rhythm hand-off)
  state.js            Awakening meter + localStorage save/load
  grade.js            Maps awakening 0–100 → palette (the cold→warm shift)
  audio.js            Per-chapter music + autoplay-gesture handling
  rhythm.js           The "tap the glowing pulse" mini-mechanic
  main.js             Boot, title, chapter-select, endings, audio controls
assets/
  img/bg/             Chapter background images (placeholder SVGs for now)
  img/portraits/      Character portraits (placeholder SVGs for now)
  audio/silence.wav   Silent placeholder track
```

You only ever need to edit **`js/story.js`** to change the story.

---

## How the awakening meter & color grade work

- The meter is a single 0–100 value that **persists across chapters**.
- Choices that embrace memory/creativity/rebellion **raise** it; choices that
  comply with ORACLE **lower** it. Landing rhythm pulses also raises it.
- Each chapter declares its own art-directed palette via
  `grade: { base, peak }` (palette names defined in `js/grade.js` → `PALETTES`).
  The meter interpolates **within** that chapter's range — from its colder
  `base` toward its warmer/brighter `peak` — so every episode keeps its identity
  (cyan, magenta+teal, gold, blood red, amber dawn) **and** the meter still
  visibly shifts the grade. Because the meter climbs across the game, early
  chapters sit near their base and the finale glows near its peak.
- Re-tune the whole look by editing the `PALETTES` table in `js/grade.js`;
  re-assign an episode's colors by changing its `grade` in `story.js`.
- The **ending** the player reaches is decided by their final meter value
  (thresholds live in `meta.endings` in `story.js`).

---

## How to add a chapter

Open `js/story.js` and copy an existing object in the `chapters` array. Each
chapter is data-only:

```js
{
  id: "ch9",
  title: "The Purge",
  episode: 9,
  audio: "assets/audio/ep9.mp3",            // your song for this chapter
  background: "assets/img/bg/bg_ep9.jpg",   // your background art
  grade: { base: "bloodBroken", peak: "amberDawn" }, // palette names from grade.js
  scene: [ /* beats — see below */ ]
}
```

Chapters unlock in array order automatically. **The last chapter in the array is
treated as the finale**, so when its scene ends the ending is shown. The
`grade` field picks the episode's color identity — see `PALETTES` in
`js/grade.js` for available names (or add your own).

### Beats

A `scene` is an ordered list of beats. There are three types:

```js
// 1) A line of narration or dialogue (typewriter, tap to advance)
{ type: "line",
  speaker: "AL ROYALE",                         // omit for pure narration
  portrait: "assets/img/portraits/al.svg",      // optional
  text: "Another file flagged for deletion.",
  oracleGlitch: true }                           // optional: glitch when ORACLE speaks

// 2) A branching choice that moves the awakening meter
{ type: "choice",
  prompt: "Delete the file?",
  options: [
    { text: "Delete it.",  awakening: -10 },     // comply  → meter down
    { text: "Hesitate...", awakening: +15, goto: "secretBeat" } // optional branch
  ]}

// 3) The rhythm "tune in" mini-mechanic
{ type: "rhythm",
  prompt: "Tap each pulse to lock onto the lost signal.",
  pulses: 5,
  awakeningPerHit: 4,
  difficulty: "easy" }                           // "easy" | "normal" | "hard"
```

To branch, give a target beat an `id` and point a choice's `goto` at it. Omit
`goto` to simply continue to the next beat.

---

## How to swap in real art & audio

1. Drop your files into `assets/img/bg/`, `assets/img/portraits/`, or
   `assets/audio/`.
2. Update the matching `background`, `portrait`, and `audio` filename strings in
   `js/story.js`.

That's the whole process — no JavaScript changes required.

**Recommended formats**
- Backgrounds: tall/vertical (e.g. 1080×1920) JPG or PNG.
- Portraits: transparent PNG, roughly 2:3.
- Audio: MP3 (best browser support) or OGG. Tracks loop automatically.

---

## Tuning the rhythm mini-mechanic

Edit the `DIFFICULTY` table in `js/rhythm.js` to change pulse size, lifetime,
and spacing. It's intentionally forgiving — atmosphere over challenge. A missed
pulse simply costs that pulse's potential meter; there's no fail state.

---

## Roadmap notes

- All 7 chapters are written with placeholder art/audio — drop in real assets
  and per-chapter songs as they're ready.
- Possible later upgrades: beat-synced rhythm tied to the real audio waveform,
  per-character voice styling, and an animated intro.
