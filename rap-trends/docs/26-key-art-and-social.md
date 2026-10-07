# 26 — Key art and social cards

Raised on the 7 October call: *"the actual cover images aren't necessarily
designed and optimised with the headlines… we didn't have a designed hero
graphic with the headline and a logo."*

That is accurate, and the catalogue shows how wide the gap is.

## The gap, counted

The Spacemob library holds **1,019 assets**. A search across the whole shared
namespace returns **about fifteen promo images**, and several of those are
screen grabs — `Screenshot 2026-08-04 at 4.55.42 AM (2).png`. Most show folders
have a `Promo Images` directory that is empty. Two `Dek` one-sheets exist
(Flau'Jae, Remembering Chinx) against 293 franchises.

So there is close to no key art for a 24/7 channel and a consumer site. Every
tile on the site is currently either a photograph with no headline on it, or
nothing. Off the page — in a feed, a carousel, an EPG grid, a pitch deck — the
headline does not travel with the picture.

## Why the answer is composition, not new source files

`docs/23-image-delivery-spec.md` tells the desk: **nothing burned into the
image.** No headline, no lower third, no date stamp. That rule is right and it
stays. A headline baked into an archival asset is wrong the moment an editor
changes the headline, invisible to screen readers, untranslatable, and
duplicated against the live text the page already renders.

Both things are true at once because they describe different layers:

| Layer | What it is | Carries text? |
|---|---|---|
| **Source** | What POLARIS files. Clean photograph, full provenance record. Archived. | **No** |
| **Derived** | Key art and social cards, composited at export time from live text. Regenerated on demand. | **Yes** |

The headline is never stored in a pixel. It is composited from the same field
the page renders, so editing the headline and re-exporting produces a corrected
card. Nothing has to be re-shot or re-filed.

There is a second reason to composite rather than generate. Image models invent
letterforms on any surface that could hold text — four of the seventeen
editorial illustrations were rejected for exactly that. Type that must be
correct is set by a typesetter, not drawn by a model.

## The surfaces

Implemented in `src/lib/keyart.ts`, tested in `tests/keyart.test.ts`.

| Surface | Size | Use |
|---|---|---|
| `hero_16x9` | 2400 × 1350 | Site hero, EPG tile |
| `thumb_16x9` | 1600 × 900 | Video card, with play affordance |
| `social_1x1` | 1440 × 1440 | Square feed post |
| `social_4x5` | 1440 × 1800 | Portrait feed post — highest reach on most networks |
| `story_9x16` | 1080 × 1920 | Story, short-form vertical |

A carousel is a sequence of `social_4x5` or `social_1x1` cards sharing one
eyebrow: card one is the headline over the hero image, the rest carry the
story's own sub-points. The slide bodies are editorial copy. They are written,
not generated from the headline.

## The lockup

`layout()` returns boxes and a type size rather than an image. It computes:

- **Full-bleed photograph.** The picture is never letterboxed or padded.
- **Gradient scrim** starting 12% of the height above the type band, so
  contrast does not depend on what happens to be in the lower third of the
  photograph.
- **Network mark** bottom-left at 5.5% of the short edge.
- **Optional eyebrow** — the strand or section — above the headline.
- **Headline** on a five-step ramp from 8.5% to 5.1% of surface height, in
  Oswald 600. The largest step that sets in three lines or fewer wins.

Margins are a fraction of the *short* edge, so a vertical and a wide card feel
like the same brand rather than one looking cramped. Verticals reserve more,
because feed UI overlays the bottom of a portrait post.

**It fails rather than fudges.** Past a surface's character limit — 60 on
`story_9x16`, 90 on `hero_16x9` — `layout()` returns null instead of shrinking
type until it technically fits but cannot be read on a phone. `planKeyArt()`
reports which surfaces rejected the headline and by how many characters, so the
fix is an editorial one: write a shorter headline for the vertical.

## Two things it refuses outright

**A gated asset produces no card.** Key art is a public, shareable artefact.
Generating one for footage the rights gate is holding would route around the
gate rather than respect it — the card would be out in a feed while the video
stayed held. `planKeyArt` returns `blocked` and produces nothing.

**A filename is never a headline.** `planKeyArt` refuses an empty headline and
says so in those words. Around seventy catalogue rows carry working file IDs
(`meth_kids`, `whh_rothschild`, `zebfinal`). Those get titles from POLARIS, not
from the renderer.

## Running it as a daily job

The call described this as an agent that goes into the folder every day and
produces cards. The shape that works:

1. **Read** new assets from the Drive/Dropbox folder.
2. **Match** each to a story with a headline and a cleared source image.
3. **Plan** with `planKeyArt`. Skip anything blocked; log why.
4. **Render** each lockup — the module hands over boxes and a type size, so any
   rasteriser can execute it.
5. **Queue for review.**

Step 5 is not optional. `KeyArtPlan.requiresHumanReview` is typed as the literal
`true`, so it cannot be set to anything else. A composited card carries the
network mark and a headline, which makes it published output, and nothing
AI-assembled goes to air or to a feed without a person approving it. The daily
job fills the queue; it does not post.

Derived cards inherit the source image's rights record. If the source is pulled,
every card made from it is pulled with it.

## What is still needed

- **The network mark as vector art.** The module reserves the box; there is no
  logo file to place in it yet. An SVG lockup, light and dark.
- **Oswald licensed for rasterisation.** Webfont serving and server-side image
  rendering are different grants.
- **A rasteriser wired up.** `sharp` with an SVG text overlay is the least
  moving parts; Canva or Photoshop scripting if the design team wants to own the
  templates.
- **Headline length fields on the editorial record.** A long headline for the
  page and a short one for verticals, both written by the desk, rather than one
  headline that fails on three of five surfaces.
