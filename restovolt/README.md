# RESTOVOLT (working name)

**Classic soul. Electric heart. Engineered to fit.** A fitment-intelligence platform for electric restomods. This is the Phase 1 MVP prototype: every public page is pre-rendered to static HTML, so it's crawlable without JavaScript and deploys to any static host.

> The name is a placeholder. Check trademark and domain availability before committing to it.

## Run it

```bash
npm run build   # pre-render every route into public/ (fails on SEO problems)
npm run og      # render 1200×630 share images per page (needs Playwright)
npm test        # configurator compatibility-engine tests
npm run serve   # http://localhost:8080
```

Set `SITE_URL` for canonical, OG and sitemap URLs (default `https://www.restovolt.example`). Set `BASE_PATH` if the site is served from a sub-path.

## What's built

| Area | Routes |
|---|---|
| Home | `/` with the Classic / Blueprint / Electric layered hero |
| Fitment Library | `/vehicles`, 5 hubs at `/vehicles/[make]/[model]/[year-range]`, 5 packs at `…/fitment-pack` |
| Cost pages | `/cost/[make]-[model]-ev-conversion-cost` |
| Configurator | `/configurator`: goal-based recommendations, live compatibility checks, save, share link, branded quote via print-to-PDF |
| Directory | `/shops`, `/shops/[state]`, `/shops/[state]/[city]`, `/shops/[slug]` with quote forms |
| Guides | `/guides` plus 3 seeded articles (Article, FAQPage, HowTo) |
| Business | `/pricing` (annual toggle + comparison table), `/for-shops`, `/safety`, `/about`, `/contact` |
| Coming soon | `/parts`, `/builds`, `/scan-upload`, each with waitlist capture |
| Shop app | `/login`, `/dashboard`: projects with stage tracker, saved builds, leads, packs, team seats |

## Architecture

- `src/data/*.mjs`: all content. **Add a platform by adding one object to `vehicles.mjs`.** The hub, pack, cost page, sitemap entry, footer links and configurator option are all generated from it.
- `src/assets/engine.js`: compatibility rules, estimates and recommendations, shared by the browser and the tests. Range, parts and labor bands in the hub copy are computed from this engine at build time, so the copy and the configurator can't disagree.
- `build.mjs`: the zero-dependency pre-renderer. It enforces titles of 60 characters or fewer, descriptions of 155 or fewer, exactly one H1 per page, and clean lowercase URLs.
- SEO: canonical tags, OG/Twitter tags with per-page images, `sitemap.xml` (indexable pages only) and `robots.txt`. JSON-LD covers Organization, WebSite+SearchAction, BreadcrumbList, FAQPage, Product+Offer, AutoRepair (LocalBusiness), Article and HowTo.
- Accent color: signal copper `#C8763A`, with darker `#9A5422` for text on light backgrounds to meet AA contrast. Light and dark modes. Motion respects `prefers-reduced-motion`.

## Before launch (prototype placeholders)

- **Sample data is labeled in the UI.** Component prices, torque values, metrics, builds, pricing tiers and validation dates are all placeholders.
- **Shops and reviews are fictional.** Profiles with `sample: true` are `noindex` and left out of the sitemap, and so are city and state pages that contain only sample shops. Replace them with real, verified listings.
- **Guide authors are sample profiles.** Real bylines and credentials are required for E-E-A-T.
- **No backend yet.** Auth, saved builds, leads and form submissions use `localStorage`. Wire them to a real identity provider, a database, a form/email endpoint, checkout, and the fabrication-partner API.
- **Terms.** The design-use terms on `/safety#terms` need counsel review.
- RESTOVOLT is independent. Model names are used only to identify fitment, and no manufacturer artwork is used.
