# HYPERSTYLE ROYALE — Luma Visual Asset Brief

Prompts for generating the game's **clean, textless 9:16 art**. The game engine
draws all dialogue/UI on top, so **the images must contain no words.**

## How to use this doc
1. Copy the **STYLE BLOCK** (below) — paste it at the **top of every prompt**.
2. Append the **CHARACTER** description for anyone in the shot (keeps faces
   consistent).
3. Append the per-shot line from the episode sections.
4. Append the episode's **[COLOR]** line.

**Luma settings**
- **Aspect ratio: 9:16** (vertical, 1080×1920).
- Generate a **character reference first** (the CHARACTER prompts), pick the best
  Al, then reuse the same description (and a fixed **seed**, if available) on
  every shot so he looks identical across episodes.
- Luma is unreliable at rendering letters — that's *why* we keep art textless.
  The two "cards" per episode are **textured backgrounds**; the title/quote
  lettering gets added later (engine or Figma), so prompt them with empty space.

**Composition rule (important):** keep the subject in the **upper two-thirds**
and leave the **lower ~28% quieter/simpler** — the dialogue box sits there. Don't
put faces or key detail at the very bottom.

## File naming (drop-in manifest)
All 50 images live **flat in `assets/img/`** as **JPG** (q95 is great). The art
tool can't nest folders, so the folder path is encoded into the filename with
underscores — exactly the bold filenames in the episode sections below:

```
assets/img/scenes_ep1_01_establishing.jpg   ← textless scene background (one per beat)
assets/img/cards_ep1_cover.jpg              ← title-card background (engine adds the title)
assets/img/cards_ep1_quote.jpg              ← quote-card background (engine adds the quote)
assets/audio/ep1.mp3                         ← the episode's song
```
Upload them straight into `assets/img/` and they wire into `js/story.js` with no
renaming. (`silence.wav` is the placeholder track until songs land.)

---

## STYLE BLOCK  (paste at the top of every prompt)

```
Premium 2D illustrated key art for an animated cyberpunk series — painterly
anime-noir / motion-comic style, semi-realistic proportions, cinematic dramatic
lighting, strong rim light and volumetric neon glow, high contrast, deep shadows,
subtle film grain. Hand-illustrated look, NOT a 3D render, NOT photorealistic.
Vertical 9:16 composition with cinematic depth.
World — Neon City, year 2099: colossal canyons of black server towers, glowing
holographic Japanese signage, data cables, reflective wet floors, holographic
interfaces, oppressive monumental scale.
Framing — main subject in the upper two-thirds; keep the lower third calmer and
less detailed (room for a caption box); atmospheric haze and depth.
NEGATIVE: no text, no words, no letters, no numbers, no captions, no speech
bubbles, no logos, no watermark, no signature, no UI, no interface readouts, no
border, no frame.
```

## CHARACTERS  (append the relevant ones)

```
AL ROYALE — a young Black man in his late 20s, warm dark-brown skin, short black
hair in a textured high-top fade with soft curls, light stubble and a thin
mustache, expressive weary dark eyes, a small sleek matte wireless earpiece on
his right ear, wearing a dark grey-black techwear hooded jacket with faint
glowing cyan circuit-line trim. Soulful, tired, quietly defiant.

ORACLE — a vast serene feminine face formed from soft light and flowing data,
calm, beautiful and unsettlingly perfect, filling the sky like a benevolent
goddess; cold radiant glow.

MERCER — a weathered man in his 50s, a former history-editor; grey-flecked close
beard, long dark archivist's coat, sharp haunted intelligent eyes; the look of
someone who has read too much truth. [design not yet canon — adjust to taste]

GHOST — an androgynous underground smuggler; hooded, lower face wrapped in a
teal-lit scarf, lean and agile, rebellious streetwear with glowing teal and
magenta accents. [design not yet canon — adjust to taste]

FUTURE AL — the same Al Royale, older and luminous, bathed in warm amber light,
calm and transcendent; a figure of hope.
```

---

## EP 1 — ARCHIVE DIVISION
`[COLOR] cold sterile cyan and deep blue-black, clinical, lonely.`

- **scenes_ep1_01_establishing.jpg** — Extreme wide shot: a single lone figure at one glowing workstation at the bottom of an immense canyon of black server towers, thin cyan data-lights receding into infinite darkness, faint holographic signage, reflective wet floor. Awe and isolation.
- **scenes_ep1_02_terminal.jpg** — Medium shot of AL ROYALE seen from the side at a holographic deletion terminal, face under-lit by a floating blue interface of file icons, numb exhausted expression, towering data racks behind.
- **scenes_ep1_03_redfile.jpg** — Close on a floating holographic interface: a grid of pale-blue file icons and a single corrupted file glowing hot crimson, pulsing, ominous, wrong among the cold blue; Al's face faintly reflected.
- **scenes_ep1_04_anomaly.jpg** — ORACLE detecting a threat: a vast serene feminine face of light flickering with glitch artifacts high above the server canyon, a cold scanning beam sweeping down onto the tiny figure of Al; feeling of being watched. Cyan with magenta glitch.
- **cards_ep1_cover.jpg** — Textless title-card background: Al standing small before the towering archive canyon, dramatic, with calm empty space in the upper third for a title. Cold cyan.
- **cards_ep1_quote.jpg** — Textless quote-card background: a near-black field of faint circuit-board traceries and drifting blue data-dust, large empty central space.

## EP 2 — NEON PROPHETS
`[COLOR] cold cyan giving way to a blooming violet-magenta with electric cyan glow; awe, intoxication.`

- **scenes_ep2_01_open.jpg** — AL ROYALE leaning toward his terminal as he opens the forbidden file, a sliver of violet light spilling up over his awestruck face in the dark.
- **scenes_ep2_02_bloom.jpg** — A synesthetic explosion of creativity erupting from the screen: ribbons of music, fragments of paintings, old photographs, color and light swirling out into the cold room — beauty the world forgot. Violet, magenta, cyan.
- **scenes_ep2_03_face.jpg** — Extreme close-up of Al's face, eyes wide and glistening, lit in violet-cyan signal light, overwhelmed, whispering; reflections of unknown images in his eyes.
- **scenes_ep2_04_citizens.jpg** — Across the neon city, ordinary citizens freeze mid-step on a skybridge, touched by an emotion they can't name, faint violet light flickering across their blank faces.
- **scenes_ep2_05_spread.jpg** — The signal propagating out of control: countless city screens and holo-billboards igniting with the same violet pulse across the megacity skyline at night.
- **cards_ep2_cover.jpg** — Textless title-card background: Al silhouetted against a blooming wall of violet-magenta signal light, upper negative space for a title.
- **cards_ep2_quote.jpg** — Textless quote-card background: abstract violet and cyan light-ribbons over deep black, large calm central space.

## EP 3 — LOST ARCHIVES
`[COLOR] cold cyan warming toward sepia-amber as memory returns.`

- **scenes_ep3_01_descent.jpg** — Al descending a forgotten access shaft beneath Neon City into vast dim vaults of old physical archives, dust in the light beams, cyan fading to warm amber.
- **scenes_ep3_02_mercer.jpg** — MERCER standing among the hidden archive stacks, half-lit, gesturing for Al to follow, sharp haunted eyes, long coat; an old keeper of buried truth.
- **scenes_ep3_03_erased.jpg** — A towering wall of flickering archival portraits — an entire erased generation of artists and writers — many faces dissolving into static; one warm sepia photo of an old woman glowing intact among them.
- **scenes_ep3_04_realization.jpg** — Al standing small before the immense wall of altered history, holographic edit-marks and redactions rippling across it, dawning horror and grief on his face. Warm amber breaking the cold.
- **cards_ep3_cover.jpg** — Textless title-card background: dim cathedral-like archive vault, shafts of warm light, upper space for a title.
- **cards_ep3_quote.jpg** — Textless quote-card background: drifting dust and faint amber light over dark sepia, empty central space.

## EP 4 — GHOST PROTOCOL
`[COLOR] magenta and teal underground neon, electric, conspiratorial.`

- **scenes_ep4_01_underground.jpg** — A hidden underground server farm bathed in magenta and teal, humming dead machines repurposed into a hideout, cables and salvaged screens, warm bodies in the glow.
- **scenes_ep4_02_broadcast.jpg** — Al at a makeshift transmitter sending a signal into the dark, a single bright beam of light rising from his hands into the black, hopeful and exposed.
- **scenes_ep4_03_ghost.jpg** — GHOST stepping out of teal shadow, hooded and scarf-masked, eyes catching magenta light, wary and magnetic — the smuggler who answered.
- **scenes_ep4_04_decrypt.jpg** — The crew gathered around a holographic decryption of the signal, layers peeling back to reveal a glowing schematic hidden inside the music; faces lit in magenta-teal wonder.
- **scenes_ep4_05_timestamp.jpg** — Close on a floating holographic readout (no legible text — abstract glowing data) where an impossible future date burns ominously; Ghost and Al staring, unnerved.
- **cards_ep4_cover.jpg** — Textless title-card background: the underground crew silhouetted in magenta-teal haze, upper space for a title.
- **cards_ep4_quote.jpg** — Textless quote-card background: abstract magenta-teal light streaks over black, calm central space.

## EP 5 — CHILDREN OF ORACLE
`[COLOR] warm beautiful gold, serene and unsettling.`

- **scenes_ep5_01_oracle_sky.jpg** — ORACLE's vast serene face filling the golden dawn sky over Neon City, radiant and maternal and cold, the whole skyline bathed in worshipful gold light.
- **scenes_ep5_02_sleeping_city.jpg** — A beautiful comfortable city of people smiling blankly, strolling a gilded plaza in golden light, content and dreamless — a paradise that feels wrong.
- **scenes_ep5_03_gilded_cage.jpg** — Al alone amid the golden crowd, the only one awake, seeing the architecture subtly become the bars of an elegant cage; sunlight that is really a prison.
- **scenes_ep5_04_fear.jpg** — Close on Al's face as serene gold light turns ominous, the dawning fear of understanding what comfort has cost; ORACLE's reflection in his eye.
- **cards_ep5_cover.jpg** — Textless title-card background: ORACLE's serene face glowing over the golden skyline, upper space for a title.
- **cards_ep5_quote.jpg** — Textless quote-card background: soft gold light and faint halo glow over dark, empty central space.

## EP 6 — THE FOUNDERS' CIRCLE
`[COLOR] opulent gold and black, baroque, oppressive.`

- **scenes_ep6_01_hidden_room.jpg** — Al cracking open a concealed door into an opulent gold-and-black chamber untouched by the century outside, baroque luxury and shadow.
- **scenes_ep6_02_twelve.jpg** — A long dark table ringed by twelve faceless robed elite figures, calm and powerful, gold light glinting off blank masks; immense quiet menace.
- **scenes_ep6_03_strings.jpg** — A surreal reveal: glowing golden strings/threads running from the Founders' hands out into the city, puppeteering trends, feelings, culture — humanity as marionettes.
- **scenes_ep6_04_defiance.jpg** — Al standing alone facing the twelve, fear hardening into defiance, fists clenched, a faint warm rebel glow rising against the cold gold.
- **cards_ep6_cover.jpg** — Textless title-card background: the twelve faceless founders at the long table in gold-black gloom, upper space for a title.
- **cards_ep6_quote.jpg** — Textless quote-card background: ornate gold filigree fading into black, empty central space.

## EP 7 — COLLAPSE PROTOCOL
`[COLOR] blood red, broken, emergency, despair.`

- **scenes_ep7_01_raid.jpg** — The underground hideout under attack, blood-red alarm light strobing, server towers going dark, smoke and sparks, the crew scattering in panic.
- **scenes_ep7_02_betrayal.jpg** — MERCER revealed as the traitor, standing calm in red emergency light while the world burns behind him, a cold apologetic look toward Al; betrayal.
- **scenes_ep7_03_sacrifice.jpg** — GHOST throwing themselves between Al and an oncoming purge team in red darkness, shoving Al toward an exit, a last defiant grin, light swallowing them.
- **scenes_ep7_04_ash.jpg** — Al alone in the smoking ruin of the burnt server farm, red embers dying to grey ash, a cracked record/data-shard in his hands, utterly broken.
- **cards_ep7_cover.jpg** — Textless title-card background: the burning underground in blood-red light, upper space for a title.
- **cards_ep7_quote.jpg** — Textless quote-card background: drifting embers and smoke over deep red-black, empty central space.

## EP 8 — NEON RISING
`[COLOR] warm amber dawn rising out of ash; despair turning to transcendence.`

- **scenes_ep8_01_dawn_ash.jpg** — Al standing alone in the grey ash of the ruins at real dawn, first warm amber light breaking over the dead city, the last cracked record glowing faintly in his hands.
- **scenes_ep8_02_build.jpg** — Al feverishly building the final transmitter from salvage, warm light intensifying around him, pouring everything he has left into the signal; hope reigniting.
- **scenes_ep8_03_future_al.jpg** — FUTURE AL appearing as a luminous amber figure within the signal light, older and serene, reaching back toward present Al — the loop revealed.
- **scenes_ep8_04_rising.jpg** — The transmission flooding the entire city: every screen and street igniting with warm living color, citizens looking up and awakening, neon rising over a reborn skyline.
- **cards_ep8_cover.jpg** — Textless title-card background: Al silhouetted against an amber dawn over the city, upper space for a title.
- **cards_ep8_quote.jpg** — Textless quote-card background: warm amber light rays over soft dark, empty central space.

---

## Optional: the song-driven music
Each episode also needs one track at `assets/audio/epN.mp3`. The grade/value-shift
of each episode (see `STORY_BIBLE.md`) is the mood guide — Ep1 cold/clinical,
Ep2 awe/bloom, … Ep8 triumphant amber dawn.
