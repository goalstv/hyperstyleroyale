# HYPERSTYLE ROYALE

An interactive cyberpunk visual novel with a rhythm/awakening mechanic — the
playable companion to the concept album and animated series.

> Year 2099. An AI called **ORACLE** controls all culture through a hidden elite,
> The Syndicate. You play **AL ROYALE**, an archivist who deletes old culture for
> the regime — until a forbidden transmission begins to wake him up.

This repo is a **playable v1 prototype**: the full **8-chapter** Season 1 arc
(one chapter per episode) demonstrating scene flow, branching choices, the
persistent **awakening meter**, the **per-episode color grade + cold→warm meter
shift**, and the **"tune into the frequency"** rhythm mini-mechanic. Everything
uses placeholder art/audio you can swap for the real thing without touching
engine code. The canonical timeline lives in [`STORY_BIBLE.md`](STORY_BIBLE.md).

| Ch | Episode | Color identity | Value shift |
|----|---------|----------------|-------------|
| 1 | Archive Division | cold cyan | Comfort → Unease |
| 2 | **Neon Prophets** | the signal blooming (violet + cyan) | Curiosity → Obsession |
| 3 | Lost Archives | cold → warm | Ignorance → Awareness |
| 4 | Ghost Protocol | magenta + teal underground | Isolation → Alliance |
| 5 | Children of Oracle | gold, beautiful-unsettling | Hope → Fear |
| 6 | The Founders' Circle | opulent gold + black | Fear → Defiance |
| 7 | Collapse Protocol | blood red, broken | Victory → Despair |
| 8 | Neon Rising (finale) | warm amber dawn | Despair → Transcendence |

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

A `scene` is an ordered list of beats. There are four types:

```js
// 0) A carousel PANEL — a full slide with its text baked into the artwork.
//    Use this for your designed Instagram panels. The engine draws NO text of
//    its own; it shows the slide and advances on one tap. (See "Carousel
//    panels" below.)
{ type: "panel",
  image: "assets/img/panels/ep1/03_terminal.svg",
  oracleGlitch: true }                            // optional: glitch on this slide

// 1) A line of engine-rendered narration/dialogue (typewriter, tap to advance).
//    Use only when you want the ENGINE to draw the words; for baked-text art
//    use "panel" instead.
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
`goto` to simply continue to the next beat. A `choice` or `rhythm` beat may also
take an optional `image:` to show its own dedicated slide; otherwise it overlays
whatever panel came before it.

---

## Carousel panels (your designed art)

This is the main authoring path. Your Instagram-style slides already contain
their own lettering (speech bubbles, narration boxes, quote cards), so each one
is a `panel` beat and the engine adds no text over it. Ep 1 in `story.js` is
built this way as a working example.

**Folder convention** — one folder per episode, numbered slides in order:

```
assets/img/panels/
  ep1/  01_cover.jpg  02_establishing.jpg  03_terminal.jpg  ...
  ep2/  01_cover.jpg  ...
```

To build a chapter, list the slides as `panel` beats and drop your `choice` /
`rhythm` beats in at the awakening moments:

```js
scene: [
  { type: "panel", image: "assets/img/panels/ep1/01_cover.jpg" },
  { type: "panel", image: "assets/img/panels/ep1/02_establishing.jpg" },
  { type: "choice", prompt: "Purge the forbidden file?", options: [ /* ... */ ] },
  { type: "panel", image: "assets/img/panels/ep1/05_transmission.jpg" },
  { type: "rhythm", prompt: "Tune into the lost frequency.", pulses: 5,
    awakeningPerHit: 4, difficulty: "easy" },
  { type: "panel", image: "assets/img/panels/ep1/06_quote.jpg" }
]
```

Images are shown whole (no cropping) by default — see `meta.imageFit`.

---

## How to swap in real art & audio

1. Drop your files into `assets/img/panels/epN/` (carousel slides) or
   `assets/img/bg/` / `assets/img/portraits/`, and songs into `assets/audio/`.
2. Update the matching `image` / `background` / `audio` filename strings in
   `js/story.js`.

That's the whole process — no JavaScript changes required.

**Recommended formats**
- Carousel panels: portrait JPG/PNG (your 1080×1350 Instagram export is perfect).
- Backgrounds (for `line`-mode chapters): tall/vertical JPG or PNG.
- Portraits (optional, for `line` mode): transparent PNG, roughly 2:3.
- Audio: MP3 (best browser support) or OGG. Tracks loop automatically.

### Image fit (no cropping)
`meta.imageFit` in `story.js` controls how images fill the vertical frame:
`"contain"` (default) shows the **whole** image with cinematic letterbox bars so
nothing is cut off; `"cover"` fills edge-to-edge and crops top/bottom. Any
chapter can override with its own `fit:` field.

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

### Sister concept — Junior: Founder Simulator
The flagship interactive experience for the **Junior** franchise — a decade-long
*Founder Simulator* where you start with $40 and a notebook and build a life. The
progression the player feels is **opportunity** (access, relationships, knowledge,
reputation, skills), not money; the world grows around you as you rise. Full
creative direction bible: **[`docs/FOUNDER_SIMULATOR.md`](docs/FOUNDER_SIMULATOR.md)**
(the earlier loop sketch lives in [`docs/PROGRESSION_LOOP.md`](docs/PROGRESSION_LOOP.md)).
