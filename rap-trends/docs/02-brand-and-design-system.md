# RAP TRENDS — Brand and Design System

## 1. Position

Authoritative, premium, energetic, culturally credible, forward-looking.

The reference points are Bloomberg's data density, ESPN's on-air hierarchy, Billboard's chart
typography, Complex's cultural voice, and the restraint of luxury fashion editorial. What we are
deliberately avoiding: generic "urban" design language, graffiti textures, chrome gradients, and
every visual cliché that dates a music channel to 2004.

The test for any screen: would a station group's programming director, a FAST platform's
acquisition lead, and a nineteen-year-old in Atlanta all take it seriously? If any of the three
would not, it is wrong.

## 2. Palette

Defined as CSS custom properties in `src/app/globals.css` under `@theme`, available as Tailwind
utilities (`bg-ink`, `text-bone`, `border-ink-4`, `text-blood`, …).

| Token | Value | Role |
|---|---|---|
| `ink` | `#050506` | The network black. Page ground. |
| `ink-2` | `#0C0D10` | Raised surface — headers, footers, side rails. |
| `ink-3` | `#15171C` | Cards and panels. |
| `ink-4` | `#1F222A` | Hairlines and borders. |
| `bone` | `#EFEAE0` | Primary text on dark. Warmer than white; less clinical. |
| `bone-dim` | `#A8A399` | Secondary text and body copy. |
| `silver` | `#6E7480` | Metadata, labels, tertiary text. |
| `blood` | `#D42026` | Deep red. **Reserved** for live, breaking, and alert. |
| `volt` | `#1B57F5` | Electric blue. Data, links, Index, interactive. |
| `neon` | `#00E5A0` | Restrained neon. Upward movement, verified, healthy. |
| `amber` | `#F5A623` | Warning, demonstration-data labels. |
| `gold` | `#C9A227` | Awards, premium, revenue. |

**Red discipline.** `blood` means something is happening right now or something is wrong. It is not
a general accent. Using it decoratively destroys its signal value on a live channel.

**Contrast.** `bone` on `ink` is 16.8:1. `bone-dim` on `ink` is 8.1:1. `silver` on `ink` is 4.6:1
and is therefore used only for metadata at normal weight, never for body copy. Every interactive
state clears 4.5:1.

## 3. Typography

| Role | Stack | Usage |
|---|---|---|
| Display | Archivo Narrow → Oswald → Arial Narrow → system | Headlines, on-air furniture, franchise titles. Uppercase, condensed, tight leading. |
| Sans | Inter → system | Body copy, interface, forms. |
| Mono | ui-monospace → SF Mono → JetBrains Mono | Every number that matters: ranks, scores, timecodes, durations, currency. Tabular figures. |

Utility classes: `.display`, `.display-tight`, `.eyebrow`, `.num`.

**Numbers are always mono with tabular figures.** A chart whose ranks shift horizontally as digits
change looks amateur on a television screen, and a timecode that jitters is unusable in a control
room.

**Eyebrows** — the small uppercase labels above headings — carry 0.14em tracking at 11px. They are
the connective tissue of the whole system: they name the section, the franchise, or the data source,
and they are what makes a dense operator screen legible.

## 4. Layout

- Max content width `110rem` for network pages; `80rem` for pitch documents; `48rem`–`64rem` for
  long-form reading.
- Consistent gutters: `1rem` mobile, `1.5rem` from `sm`.
- Cards are `1px` hairline on `ink-3`, radius `0.5rem`. No drop shadows — depth comes from value,
  not blur.
- Dense operator tables use `overflow-x: auto` inside their own container. The page body never
  scrolls horizontally.

## 5. Motion

- Ticker: 60s linear loop, paused on hover and on keyboard focus.
- Live dot: 2s pulse, red, on live indicators only.
- Transitions: 120–200ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
- `prefers-reduced-motion: reduce` disables every animation including the ticker, which then renders
  as a static list.

## 6. Video surfaces

`ArtSurface` generates a deterministic gradient from a seed string, so a given artist or franchise
always renders the same way. Two textures sit on top:

- `.scan` — a 3px repeating scanline at 2.2% opacity. Broadcast texture, never over text.
- `.grain` — a 4px radial dot grid at 16% opacity via `::after`.

No unlicensed imagery is used anywhere in the product. Every visual is generated, and every one
carries an `aria-label` describing it as a placeholder.

## 7. On-air furniture

| Element | Spec |
|---|---|
| Channel bug | Top right, `RT` in display face on 70% ink, alongside the content rating |
| Lower third | Bone on ink, display face name over sans-serif descriptor |
| Ticker | Full width, `ink-2` ground, category eyebrow in signal colour |
| Now / Next | Time in mono, title in display face |
| Emergency slate | Full-bleed ink with the wordmark and a single line of copy |

## 8. Accessibility

- WCAG 2.2 AA throughout.
- Skip link on every page, visible on focus.
- `:focus-visible` is a 2px `volt-soft` outline at 2px offset — never removed.
- Every meter carries `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- Every table has a `<caption>`, even when visually hidden.
- The ticker duplicates its content for a seamless loop; the duplicate is `aria-hidden`, so a screen
  reader hears each item exactly once.
- `prefers-contrast: more` strengthens every hairline and forces pure white body text.
- Colour is never the sole carrier of meaning: chart movement pairs an arrow glyph with the colour
  and an `aria-label`; status badges pair colour with a word.

## 9. The wordmark

Two words, uppercase, condensed display face. `RAP` in bone, `TRENDS` in blood, with a volt dot at
the upper right of the final S. Never abbreviated to "RT" in body copy. Never split across lines.
Never recoloured, effected, or placed on a low-contrast ground.

The `LogoMark` (`src/components/logo.tsx`) is a 32×32 SVG for favicons, application icons, and the
console header.

## 10. Voice

Declarative. Specific. Never hyped.

Write "no carriage agreement exists in any market", not "carriage discussions are progressing". Write
"confidence 0.62" and explain what that means, rather than hiding a weak signal behind a confident
number. On a network whose entire value is that its chart can be trusted, the writing has to hold
the same standard as the data.
