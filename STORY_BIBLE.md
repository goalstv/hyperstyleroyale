# HYPERSTYLE ROYALE — Season 1 Story Bible (Canonical)

> **Continuity note:** An earlier draft skipped **Episode 2: Neon Prophets** and
> merged Episodes 3–4, shifting the whole season out of order. This document is
> the **corrected, canonical Season 1 timeline** and supersedes all prior
> orderings. "Neon Prophets" is both the season title and the inciting
> transmission — it is restored here as its own standalone episode between
> *Archive Division* and *Lost Archives*.

The interactive game (`js/story.js`) implements this timeline 1:1 — eight
standalone chapters, one per episode, one song and one carousel each.

---

## Season arc

A single emotional throughline runs across the eight value shifts:

`Comfort → Unease → Obsession → Awareness → Alliance → Defiance → Despair → Transcendence`

---

## Episodes

### Ep 1 — Archive Division
- **Story function:** Introduce Al Royale, Neon City, the Archive Division,
  ORACLE, and the controlled world.
- **Major event:** Al discovers a corrupted file marked `NEON_PROPHETS`.
- **Ending:** ORACLE detects an unauthorized memory anomaly.
- **Value shift:** Comfort → Unease
- **Grade:** cold cyan (`cyanCold → cyanSpark`)

### Ep 2 — Neon Prophets  ⭐ *(restored standalone episode)*
- **Story function:** Al opens the forbidden transmission and experiences
  authentic human creativity for the first time.
- **Major events:** The signal contains fragments of music, art, history, and
  emotion. Al becomes obsessed with its origin. Citizens exposed to the
  fragments begin experiencing unusual emotional reactions. The signal appears
  impossible to delete.
- **Ending:** The transmission begins spreading beyond Al's control.
- **Value shift:** Curiosity → Obsession
- **Grade:** the signal blooming (`cyanCold → signalBloom` — violet/magenta with
  electric cyan glow)

### Ep 3 — Lost Archives
- **Story function:** Al investigates the transmission and discovers history has
  been altered.
- **Major events:** Introduction of **Mercer**. Discovery of hidden archive
  systems beneath Neon City. Evidence of erased artists, writers, creators, and
  cultural movements.
- **Ending:** Al realizes humanity's history has been systematically edited.
- **Value shift:** Ignorance → Awareness
- **Grade:** cold → warm (`cyanCold → amberWarm`)

### Ep 4 — Ghost Protocol
- **Story function:** The resistance begins forming.
- **Major events:** Introduction of **Ghost**. Signal decryption. Discovery that
  Neon Prophets is more than a song. Evidence suggests the transmission
  originated from the future.
- **Ending:** Timestamp reveals impossible future origin.
- **Value shift:** Isolation → Alliance
- **Grade:** magenta + teal underground (`undergroundTeal → undergroundMagenta`)

### Ep 5 — Children of Oracle
- **Story function:** Reveal ORACLE's true origins.
- **Value shift:** Hope → Fear
- **Grade:** gold, beautiful-unsettling (`goldSerene → goldDefiant`)

### Ep 6 — The Founders' Circle
- **Story function:** Reveal the elite power structure.
- **Value shift:** Fear → Defiance
- **Grade:** opulent gold + black (`goldOpulent → goldDefiant`)

### Ep 7 — Collapse Protocol
- **Story function:** The movement is attacked and betrayed.
- **Value shift:** Victory → Despair
- **Grade:** blood red, broken (`bloodBroken → bloodEmber`)

### Ep 8 — Neon Rising
- **Story function:** Season finale and awakening event.
- **Value shift:** Despair → Transcendence
- **Final reveal:** **Future Al Royale created and transmitted Neon Prophets** —
  the loop closes.
- **Grade:** warm amber dawn (`dawnDim → amberDawn`)

---

## Characters

| Character | Introduced | Role |
|-----------|-----------|------|
| **Al Royale** | Ep 1 | Archivist protagonist; deletes culture for the regime until the signal wakes him. |
| **ORACLE** | Ep 1 | The AI that curates all culture; built to comfort, asked to rule. |
| **Mercer** | Ep 3 | Former history-editor who reveals the altered past and the hidden archives. |
| **Ghost** | Ep 4 | Underground smuggler/resistance founder; the heart of the crew. |
| **The Founders' Circle** | Ep 6 | Twelve faceless elite who built ORACLE and hold the leash of culture. |
| **Future Al Royale** | Ep 8 | The finale reveal — the future self who created and sent Neon Prophets. |

### Open interpretation — the Ep 7 betrayer
The outline states the movement is "attacked and **betrayed**" but does not name
the betrayer. The game currently dramatizes **Mercer** as ORACLE's plant (he
seeded the original file and the archives), with **Ghost** sacrificing himself to
save Al. This is an editorial choice to give both named characters a payoff — it
is easy to reassign if the canon names a different traitor. Update Ep 7 in
`js/story.js` (`ch7`) and this table if so.

---

## How the game encodes this
- `js/story.js` — the 8 chapters, in order, with each episode's story function,
  major events, ending, and value shift in a header comment.
- `js/grade.js` — the per-episode color palettes named above.
- Awakening meter (0–100) persists across chapters; choices and the rhythm
  "tune-in" beats raise it. The final value selects one of three endings, all of
  which resolve the Future-Al loop.
