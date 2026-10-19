# RESTOVOLT: Build Spec for OpenAI Codex

This document tells a coding agent (ChatGPT Codex, or any similar agent) how to build RESTOVOLT. There are two ways to use it:

- **Path A: continue the existing build (recommended).** Connect Codex to this GitHub repo and branch. Codex reads `restovolt/AGENTS.md` automatically. Run the phase prompts in section 2, skipping the phases already marked done.
- **Path B: rebuild from scratch.** Create a new empty repo, add this file as `SPEC.md` at its root, and copy `AGENTS.md` beside it. Then run every phase prompt in section 2, in order, as a separate Codex task.

Run one phase per task. Small, reviewable tasks keep the build from getting diluted, and each phase has acceptance checks Codex must pass before it finishes.

---

## 1. Product summary

**Name:** RESTOVOLT (a working name; check trademark and domain availability before committing to it).
**Tagline:** "Classic soul. Electric heart. Engineered to fit."
**One-liner:** A fitment-intelligence platform for electric restomods: verified 3D scan data, engineered mount and bracket designs, and curated drivetrain parts for converting classic cars to electric.

**Audiences, in priority order:**
1. Independent restoration shops (1 to 20 staff) adding EV conversion. These are the paying B2B customers.
2. Experienced DIY builders.
3. Classic-car owners researching cost. This is SEO traffic that gets routed to shops as leads.

**Launch platforms:**
- 1967–1972 Chevrolet C10
- 1966–1977 Ford Bronco
- 1958–1979 Volkswagen Beetle (air-cooled)
- 1974–1989 Porsche 911
- 1990–1997 Mazda MX-5 Miata (NA)

**Non-negotiables:**
- Every public page is pre-rendered HTML, readable without JavaScript.
- Adding a vehicle means adding data only. No new templates or hardcoded pages.
- Safety notices are visible on every pack page and configurator result.
- All sample or placeholder data is labeled "Sample" in the UI.
- Original brand only. Never use automaker logos, typography or trade dress.

---

## 2. Phase prompts (paste one per Codex task)

> Every prompt assumes Codex has read `SPEC.md` (or this file) and `AGENTS.md`.

### Phase 0: Scaffold *(done in the existing repo)*
```
Read SPEC.md sections 3 to 5. Scaffold the project exactly as described in "Stack and
structure": a zero-dependency Node static pre-renderer (build.mjs), src/data, src/lib,
src/pages, src/assets and a public/ output folder. Implement layout() with full head
tags (title, description, canonical, robots, OG and Twitter tags, theme-color, fonts),
a header with nav and theme toggle, a footer with full sitemap links, and breadcrumbs.
Add the design tokens from section 6 to styles.css with light and dark modes. The build
must fail if any title is over 60 characters, any description is over 155, a page does
not have exactly one H1, or a URL is not lowercase and hyphenated. Done when
`npm run build` produces public/index.html and exits 0.
```

### Phase 1: Data and public MVP pages *(done)*
```
Implement the data files in SPEC.md section 4 for all five vehicles, then generate:
the home page (section 7), /vehicles, the five vehicle hubs, the five fitment-pack pages,
the five cost pages, /shops plus state, city and profile pages, /guides plus three
articles, /pricing, /for-shops, /safety, /about and /contact, and coming-soon pages for
/parts, /builds and /scan-upload. Each hub needs at least 600 words of ORIGINAL prose
(intro, platform history, conversion considerations, weight and packaging, choosing a
donor, range and cost bands, FAQs). Add the JSON-LD from section 8. Write sitemap.xml
(indexable pages only) and robots.txt. Done when the build passes and a script counting
hub prose words reports at least 600 for every vehicle.
```

### Phase 2: Configurator and compatibility engine *(done)*
```
Implement src/assets/engine.js exactly per SPEC.md section 5: checkCompat, estimate,
packsNeeded and recommend, as pure functions shared by the browser and the tests. Build
/configurator: vehicle picker, goal sliders (range, performance, budget), a reversibility
choice, component selects, a live checks list, and a summary that is sticky on desktop and
a bottom sheet on mobile. Add save (localStorage), a share link (URL params), and quote
export via print-to-PDF with an optional uploaded shop logo. Derive each vehicle's
range, parts and labor bands from the engine at build time and inject them into the hub
copy through tokens, so the copy can never disagree with the configurator. Write
node:test tests covering every rule in section 5. Done when `npm test` passes and
recommend() returns different drivetrains for range-first and budget goals on the C10.
```

### Phase 3: Dashboard and demo auth *(done, demo only)*
```
Build /login and /dashboard (both noindex) with a localStorage demo session, clearly
labeled "Demo mode". The dashboard shows KPIs, active projects with a six-stage tracker
(Teardown, Fabrication, Install, HV Commissioning, Road Test, Delivered), saved builds
from the configurator, a leads inbox fed by quote forms, purchased packs fed by the pack
download gate, and team seats with an invite form (5-seat Pro limit).
```

### Phase 4: Real backend *(next)*
```
Replace the localStorage demo with a real backend without changing public URLs or the
static pre-rendering of public pages. Use Supabase (Postgres + Auth) or an equivalent
the owner chooses. Create tables matching SPEC.md section 4 (vehicles, fitment_packs,
parts, drivetrain_components, builds, shops, leads, users and shop_members). Add Row
Level Security so each shop only sees its own builds, leads and team. Wire quote forms
to insert leads and route each lead to the nearest certified shop that lists the
vehicle's platform. Wire the waitlist and contact forms to a table plus an email
notification. Keep secrets in environment variables; never commit keys. Done when an
end-to-end test can sign up, save a build, submit a quote and see the lead in the
dashboard.
```

### Phase 5: Commerce and downloads *(next)*
```
Add Stripe Checkout for per-pack purchases and Starter, Pro and Fleet subscriptions,
monthly and annual, with annual at 20% off. Gate structural-file downloads behind
(a) the terms checkbox, (b) a logged-in account, and (c) an active entitlement, and
serve files through short-lived signed URLs. Record each terms acceptance with a
timestamp, user id and pack version. Leave "Send to fabrication partner" as a stub
interface with a clear TODO for the partner API.
```

### Phase 6: Phase-2 features *(later)*
```
Build scan upload (status flow: Submitted, In review, Design in progress, Published;
contributor credit and revenue-share fields), public build journals using the HowTo
schema, and the parts marketplace with filters for vehicle compatibility, voltage, kWh,
condition and price.
```

---

## 3. Stack and structure

- **Runtime:** Node 20 or newer, ES modules, and **no framework**. A ~100-line `build.mjs` renders every route to `public/<route>/index.html`. A framework with SSG (such as Next.js or Astro) is acceptable only if every public route is still statically pre-rendered.
- **Client JavaScript** is progressive enhancement only. Pages must work without it.

```
build.mjs            pre-renderer and SEO validation (exits non-zero on problems)
og.mjs               renders a 1200×630 JPG share image per page with Playwright
src/data/            site, vehicles, components, shops, guides, pricing (all content)
src/lib/html.mjs     layout, escaping, JSON-LD helpers, breadcrumbs, FAQ, HV notice
src/lib/svg.mjs      original vehicle side-profile art with 3 layers + exploded view
src/lib/parts.mjs    shared fragments (cards, badges, forms, cost table)
src/pages/*.mjs      each exports a function returning page objects
src/assets/          styles.css, app.js, engine.js, configurator.js, dashboard.js, store.js
test/                node:test suites
```

**Page object:** `{ path, title, description, body, crumbs?, jsonld?, noindex?, og:{title,sub}, scripts?, bodyClass? }`

**Environment variables:**
- `SITE_URL` sets canonical, OG and sitemap URLs.
- `BASE_PATH` is a sub-path prefix for hosting under a folder.

**npm scripts:** `build`, `og`, `test`, `serve`.

---

## 4. Data model

### Vehicle
Fields:
- `id`, `make`, `makeSlug`, `model`, `modelSlug`, `yearStart`, `yearEnd`, `shortName`
- `body`, `bodyStyles[]`, `art` (one of `truck`, `suv`, `bug`, `coupe`, `roadster`)
- `layout`, `wheelbaseMm`, `curbWeight`, `difficulty` (1 to 5), `difficultyNote`
- `seo{title,description}`, `intro`, `sections[{h,p[]}]`, `faqs[{q,a}]`
- `config{maxKwh, motorSizes[], driveModes[], baseLaborHours, whPerMile, originalDrivetrainLb, maxAddedLb, ratedKw, addons[]}`
- `electric{motorAt, boxes[[x,y,w,h]]}` (positions for the illustration)
- `pack{...}` (a FitmentPack) and `builds[]`

Derived fields:
- `name`
- `path`, which is `/vehicles/{makeSlug}/{modelSlug}/{yearStart}-{yearEnd}`
- `packPath`, which is `path + /fitment-pack`
- `costPath`, which is `/cost/{makeSlug}-{modelSlug}-ev-conversion-cost`
- `rangeBand`, `partsBand` and `laborBand`, computed from the engine (section 5)

Prose may contain the tokens `{rangeLo}`, `{rangeHi}`, `{partsLo}`, `{partsHi}`, `{laborLo}` and `{laborHi}`. They are filled at build time.

**Per-vehicle configuration:**

| id | maxKwh | motor sizes | drive modes | base hours | Wh/mi | orig. drivetrain lb | max added lb | rated kW |
|---|---|---|---|---|---|---|---|---|
| c10 | 85 | compact, mid, large | transmission, driveunit | 260 | 400 | 850 | 900 | 190 |
| bronco | 58 | compact, mid | transmission | 280 | 380 | 780 | 500 | 150 |
| beetle | 40 | compact, mid | transmission | 170 | 230 | 300 | 450 | 40 |
| 911 | 58 | compact, mid | transmission | 300 | 230 | 600 | 400 | 150 |
| miata | 40 | compact, mid | transmission | 220 | 210 | 450 | 350 | 100 |

**Add-on packs:**
- C10 drive-unit cradle: $590, required when a drive unit is used.
- C10 extended under-bed box: $340, required when the pack exceeds 60 kWh.
- Bronco skid armor: $290, required when the pack exceeds 30 kWh.
- 911 front cooling duct: $260, required when the pack exceeds 30 kWh.

### FitmentPack
Fields: `name`, `version`, `priceUsd`, `engineerReviewed` (ISO date), `fieldProven` (build count), `parts[{name, type: structural|non_structural, material, qty}]`, `torque[[joint, fastener, spec]]`, `checklist[]`.

- Structural parts are labeled "Machine or metal print" and ship as STEP only.
- Non-structural parts are labeled "Print in-house" and ship as STEP and STL.

Core pack prices: C10 $690, Bronco $740, Beetle $490, 911 $890, Miata $590.

### DrivetrainComponent (sample catalog)

| id | category | key specs | price |
|---|---|---|---|
| mot-ac90 | motor | 96–175 V, 90 kW, 115 lb, compact, transmission, controller inv-lv650 | 5,800 |
| mot-pm150 | motor | 250–420 V, 150 kW, 130 lb, mid, transmission, controller inv-hv400 | 9,400 |
| mot-du-small | motor | 280–410 V, 200 kW, 200 lb, mid, driveunit, controller ctl-oem | 4,200 |
| mot-du-large | motor | 300–410 V, 300 kW, 290 lb, large, driveunit, controller ctl-oem | 5,600 |
| inv-lv650 | inverter | 96–175 V | 4,900 |
| inv-hv400 | inverter | 250–450 V | 6,200 |
| ctl-oem | inverter | 250–420 V | 1,850 |
| bat-lv32 | battery | 32 kWh, 137 V nom / 151 V max, 36S, 420 lb | 7,600 |
| bat-hv24 | battery | 24 kWh, 355 / 403 V, 96S, 420 lb | 7,900 |
| bat-hv40 | battery | 40 kWh, 355 / 403 V, 96S, 640 lb | 9,800 |
| bat-hv58 | battery | 58 kWh, 355 / 403 V, 96S, 840 lb | 13,500 |
| bat-hv85 | battery | 85 kWh, 350 / 403 V, 96S, 1,180 lb | 17,900 |
| bms-lv | bms | max 48S / 200 V | 1,150 |
| bms-hv | bms | max 112S / 470 V | 2,400 |
| chg-lv66 | charger | 100–200 V output | 1,600 |
| chg-hv66 | charger | 250–450 V output | 2,100 |

### Shop, Lead, Build, User

- **Shop:** `slug`, `name`, `sample`, `city`, `citySlug`, `state`, `stateSlug`, `stateCode`, `address`, `zip`, `geo`, `phone`, `founded`, `team`, `certification`, `platforms[]`, `summary`, `about`, `builds`, `reviews[]`, `tier`.
  - **Rule:** any shop with `sample: true` is noindex and excluded from the sitemap. A city or state page whose shops are all samples is also noindex.
- **Lead:** owner name, email, zip, vehicle, goals, routed_shop_id, status (New, Contacted, Quoted, Won, Lost), created_at.
- **Build:** user_id, shop_id, vehicle_id, components{}, goals{}, stage (0 to 5), public flag, media[].
- **User / ShopMember:** email, shop_id, role (Owner, Technician).

---

## 5. Configurator engine rules (must match exactly)

### `checkCompat(vehicle, sel, components, goals)`
Returns `[{id, label, status: pass|warn|fail, detail}]`.

1. **pair:** fail unless `motor.controllers` includes the selected inverter.
2. **voltage:** pass if `pack.nominalV ≥ motor.voltageMin`, `pack.maxV ≤ motor.voltageMax + 10`, `pack.nominalV ≥ ctl.voltageMin` and `pack.maxV ≤ ctl.voltageMax`. Otherwise fail.
3. **bms:** pass if `pack.cellsSeries ≤ bms.maxSeries` and `pack.maxV ≤ bms.maxV`. Otherwise fail.
4. **charger:** pass if `pack.maxV ≤ chg.voltageMax` and `pack.nominalV ≥ chg.voltageMin`. Otherwise fail.
5. **packaging:** compute `kwh / maxKwh`. Above 1 is fail, above 0.85 is warn, otherwise pass.
6. **motor-fit:** fail unless the vehicle allows both the motor's size and its drive mode.
7. **reversible** (only when `goals.reversibility === 'reversible'`): fail if the motor is a drive unit.
8. **weight:** compute `delta = pack.weightLb + motor.weightLb + 120 − originalDrivetrainLb`. Above `maxAddedLb` is fail, above 0.75 × `maxAddedLb` is warn.
9. **power:** warn if `motor.peakKw / ratedKw > 2.5`.

If any category is unselected, return a single "complete" fail.

### `estimate()`
- **Parts:** the sum of the five component prices plus $3,500 for miscellaneous items. The low end is ×0.88 and the high end ×1.15, both rounded to $100.
- **Labor:** start from `baseLaborHours`. Multiply by ×1.25 for a drive unit, ×0.95 for a reversible build, and ×1.10 when the pack exceeds 85% of `maxKwh`. The band is ×0.88 to ×1.15.
- **Range:** `kwh × 0.88 × 1000 / whPerMile`. The band is ×0.85 to ×1.05.
- **Also returns:** the weight delta, peak kW, and the packs needed (the core pack plus any add-ons whose rules match).

### `recommend(vehicle, goals, components)`
- Enumerate every motor × its controllers × every battery.
- For each combination, pick the cheapest BMS that passes the BMS rule and the cheapest charger that passes the charger rule, judged directly against the pack.
- Skip any combination with a fail.
- Score each remaining combination:
  ```
  range × (kwh / maxKwh)
  + performance × min(peakKw / (ratedKw × 2.5), 1)
  + budget × (1 − min(cost / 50000, 1)) × 1.4
  − 0.35 × warnings
  ```
  where cost is the midpoint of the parts band plus the pack cost.
- Return the highest-scoring combination.

**Goal presets** (used for the hub recommendations and the derived bands):
- Range first: `{3,1,1,either}`
- Performance: `{1,3,1,either}`
- Balanced: `{2,2,2,either}`
- Budget, reversible: `{1,1,3,reversible}`

**Derived bands:** take the min and max across the four presets. Round range to 10 miles, parts to $1,000 and labor to 10 hours.

---

## 6. Design system

- **Mood:** a precision instrument meets a heritage garage. Minimal, editorial, technical.
- **Colors:**
  - Graphite `#0E0F11` is the dark base.
  - Paper `#F4F1EA` is the light base and the background for editorial sections.
  - Signal copper `#C8763A` is the single accent, used only for CTAs and live data.
  - Copper ink `#9A5422` is for link and accent text on light backgrounds (needed for AA contrast).
  - Status colors are OK `#6FCF97` / `#1E7A46`, warn `#F2C94C` / `#8A6100` and fail `#FF7A6B` / `#B3261E` (dark / light).
- **Theming:** light and dark follow the system setting, with a toggle saved in localStorage.
- **Type:** Inter Tight for UI and headlines. JetBrains Mono for specs, data, eyebrows and labels. Headlines use `clamp()` sizing with tight negative tracking.
- **Components:** spec grid, difficulty meter, validation badges, structural / non-structural badges, stage tracker, comparison table, FAQ accordion (`<details>`), HV-safety notice, "Sample" tag, sticky configurator summary (a bottom sheet on mobile).
- **Signature moment:** an inline SVG side profile with three layers, toggled by `aria-pressed` buttons:
  - **Classic:** a solid silhouette.
  - **Blueprint:** a grid, a wireframe that draws itself on, highlighted parts, callouts and the wheelbase dimension.
  - **Electric:** a ghost outline, battery boxes, the motor and animated cables.
- **Motion:** blueprint draw-on, spec count-ups, scroll reveals (applied only when JavaScript is on), and an exploded-view assembly. Everything is disabled under `prefers-reduced-motion`.
- **Accessibility (WCAG 2.1 AA):**
  - 4.5:1 text contrast and visible focus rings.
  - Touch targets of at least 44px.
  - Every input is labeled, and the configurator is fully keyboard operable.
  - Checks use an `aria-live` region.
  - A skip link, one H1 per page, and no horizontal scroll at 360px width.

---

## 7. Information architecture and page contents

The home page has ten sections:
1. Hero with the layered vehicle
2. Five platform cards
3. How it works, in three steps
4. Proof metrics, labeled as sample
5. Fitment Pack showcase with the exploded view
6. For Shops (dashboard, lead routing, white-label quotes)
7. Featured builds
8. Safety standards
9. Pricing teaser
10. Footer with full sitemap links

**Routes:**
```
/  /vehicles  /vehicles/{make}/{model}/{years}  …/fitment-pack
/cost/{make}-{model}-ev-conversion-cost
/configurator  /parts  /builds  /scan-upload
/shops  /shops/{state}  /shops/{state}/{city}  /shops/{slug}
/guides  /guides/{slug}
/pricing  /for-shops  /about  /safety  /contact
/login  /dashboard      (noindex, disallowed in robots.txt)
```

**Pricing (sample):**
- Starter $149/mo, Pro $349/mo (featured), Fleet $799/mo.
- An annual toggle applies 20% off.
- An 11-row comparison table.
- Single-pack purchases are $490 to $890.

**Seeded guides:**
- How much it costs to convert a classic car to electric
- Whether converting a classic car to electric is worth it
- How to register and insure a converted electric car (uses HowTo)

---

## 8. SEO acceptance checks

- Each page has a unique title of 60 characters or fewer and a description of 155 or fewer. On programmatic pages both are generated from the data. Text is clipped at a word boundary, never mid-word.
- Each page has a canonical tag, OG and Twitter tags, and a per-page 1200×630 share image.
- **JSON-LD:**
  - Site-wide: Organization, plus WebSite with a SearchAction pointing to `/vehicles?q=`.
  - BreadcrumbList on every deep page.
  - FAQPage on vehicle hubs, cost pages and guides.
  - Product + Offer on pack pages.
  - AutoRepair (a LocalBusiness subtype) on shop profiles.
  - Article on guides, plus HowTo where it applies.
- The sitemap updates automatically from the data and lists only indexable pages.
- **Internal linking:**
  - Each hub links to its pack, its cost page, its guides and its shops.
  - Each guide links to its vehicle hubs.
  - The footer links to every hub and cost page.
- **Performance budgets:** LCP under 2.5s, CLS under 0.1, INP under 200ms. Use inline SVG instead of hero photos, preconnect the fonts, and lazy-load below-the-fold media. Serve AVIF/WebP with `srcset` once real photos exist.

---

## 9. Content and trust rules

- Use **no lorem ipsum** anywhere. Write original copy and avoid duplicated templates.
- Label sample data visibly. Placeholder shops and reviews must never be indexed.
- Guide author bios are placeholders until real credentials are supplied.
- Show the HV-safety notice on every pack page, configurator result and cost page.
- The structural-download gate needs a checkbox acknowledging the terms.
- The safety page includes a titling, insurance and registration section with a "confirm local rules" note.
- State that RESTOVOLT is independent and that model names are used only to identify fitment.

---

## 10. Definition of done (every phase)

1. `npm run build` exits 0, which means no SEO validation problems.
2. `npm test` passes.
3. A headless browser pass at 1440px and 360px shows no console errors and no horizontal overflow on the home page, a hub, a pack page, the configurator, pricing, a shop profile and a guide.
4. The README is updated with anything new: environment variables, scripts and placeholders.
