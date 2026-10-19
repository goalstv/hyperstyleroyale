# AGENTS.md: RESTOVOLT

Instructions for coding agents (Codex and others) working in this folder. The full product and technical spec is in `CODEX_BUILD_SPEC.md`; read it before you change anything.

## Commands
- `npm run build` pre-renders every page into `public/`. It fails if a title is over 60 characters, a description is over 155, a page does not have exactly one H1, or a URL is not clean.
- `npm test` runs the configurator engine tests (`node --test`).
- `npm run og` regenerates the share images. It needs Playwright.
- `npm run serve` serves the site at http://localhost:8080.

Run `npm run build && npm test` before finishing any task. Both must pass.

## Conventions
- **Content lives in `src/data/*.mjs`.** Add a vehicle, shop or guide by adding data, never by adding a hand-written page.
- **`src/assets/engine.js` is the single source of truth** for compatibility and estimates. Keep it pure, with no DOM or Node APIs, because both the browser and the tests import it.
- **Don't hard-code range, parts or labor numbers in vehicle copy.** Use the `{rangeLo}`-style tokens, which are filled in from the engine.
- **Public pages must render fully without JavaScript.** Client scripts are enhancement only.
- **Plain ES modules, no frameworks, no new dependencies** unless the task explicitly asks for them.
- **Match the existing style:** two-space indentation, single quotes, and short comments only where intent isn't obvious.
- **Escape all interpolated text** with `esc()` from `src/lib/html.mjs`.
- **Label sample data in the UI** with `sampleTag()`. A shop with `sample: true` must stay noindex.

## Safety and brand
- Keep the HV-safety notice on pack pages, configurator results and cost pages.
- Never use automaker logos or trade dress. Model names are used for fitment identification only.
