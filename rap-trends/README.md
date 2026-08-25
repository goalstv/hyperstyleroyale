# RAP TRENDS

**Hip-Hop Is Happening Now.**
The real-time network for hip-hop culture — television, radio, streaming, and editorial, programmed
from one newsroom.

> **Demonstration build.** Every artist, recording, chart position, story, campaign, affiliate, and
> distribution figure in this repository is fictional sample data created to exercise the platform.
> No carriage, distribution, endorsement, licensing, or partnership relationship exists or is
> implied. No licensed music or copyrighted media is stored or served. Qualified broadcast counsel
> and music-licensing professionals must review and approve the operating model before any
> transmission, carriage, syndication, or public performance.

---

## What this is

Four products from one domain model:

| Surface | Route | What it is |
|---|---|---|
| **Public network** | `/` | Live TV, live radio, the TRENDING 10 chart, shows, artists, thirteen city bureaus, news, video library, submissions, and partner material |
| **RAP TRENDS OS** | `/os` | The media operations backend: newsroom, Drive ingestion, media library, rights engine, programming calendar, channel origination, distribution control, advertising, analytics, health |
| **Artist portal** | `/artist-portal` | Profile, submissions, rights documentation, verified airtime, promotional products |
| **Affiliate portal** | `/affiliate-portal` | Schedules, feeds, specifications, assets, local-insertion reporting |

Plus a public API: scored chart, source register, EPG (JSON and XMLTV), schedule with validation
report, ticker, health, and rate-limited write endpoints.

## Quick start

```bash
cd rap-trends
npm install
npm run dev        # http://localhost:3000
```

No database, no credentials, no external service. The application runs entirely on the seeded
demonstration dataset.

Open `/os` and use the operator selector in the header to switch between the twelve staff roles —
the console re-renders for each one, because the permission checks it exercises are the production
checks.

```bash
npm run typecheck   # tsc --noEmit
npm test            # 155 tests
npm run build       # production build
```

## The parts that matter

### The RAP TRENDS Index — `src/lib/index-engine.ts`

A published, auditable ranking model. Fifteen weighted signal types, time decay with a floor,
regional and emerging-artist multipliers, four anomaly detectors, confidence scoring, editorial
override with attribution, and a publication gate.

Two properties are load-bearing:

- **A signal from a source we are not licensed to read contributes nothing.** It lowers the published
  confidence figure rather than being estimated. Estimated data is never presented as measurement.
- **A position without enough evidence is held off air.** Confidence below 0.50, an open
  high-severity flag, or fewer than six reporting signals blocks publication.

The scoring is pure and deterministic, so any published chart can be recomputed from stored readings
and must produce identical output. Public methodology: `/trending/methodology`.

### The rights gate — `src/lib/rights.ts`

Fails closed. A missing rights record is *not cleared*, never *probably fine*. Checks the specific
rights each destination requires, territory, licence window at the airing's own timestamp, caption
status (AI drafts are a hard blocker), clean-version availability, QC state, talent releases, and
takedowns.

### The schedule validator — `src/lib/schedule.ts`

Gaps, overlaps, rights windows, explicit-daypart restrictions, captions, missing assets, and
approvals. Explicit audio rides the feed only late and overnight, only on owned digital origination —
enforced, not documented.

### The ad-safety gate — `src/lib/ad-safety.ts`

Alcohol, cannabis, gambling, political, and pharmaceutical rules by platform, daypart, territory, and
age gate. Cannabis cannot run on any broadcast or MVPD feed regardless of state legality. A
licensor's own restrictions on a specific programme are a second, independent gate.

### The editorial firewall

Chart position and editorial coverage are not for sale, and that is a structural fact rather than a
policy statement:

- The submission review queue reads a database view that omits the plan, so an editor scoring a
  record cannot see whether the artist paid.
- No commercial role holds any editorial permission. The test suite asserts it.
- Every editorial override on the Index carries a named author and a written reason, published on
  the public chart page.

## Layout

```
rap-trends/
├── src/
│   ├── app/
│   │   ├── (site)/         Public network — its own chrome, live controls, ticker
│   │   ├── os/             RAP TRENDS OS — permissioned console
│   │   └── api/            REST API
│   ├── components/         Shared UI kit, cards, chart widgets, console components
│   ├── data/               Seeded demonstration dataset
│   └── lib/                Domain layer — the five pure modules above, plus repo/session
├── tests/                  155 Vitest cases
└── docs/                   The 20 documents below
```

## Documentation

| # | Document |
|---|---|
| 01 | [Product requirements](docs/01-product-requirements.md) |
| 02 | [Brand and design system](docs/02-brand-and-design-system.md) |
| 03 | [Sitemap](docs/03-sitemap.md) |
| 04 | [User roles and permissions](docs/04-user-roles.md) |
| 05 | [Database schema (SQL)](docs/05-database-schema.sql) |
| 06 | [Technical architecture](docs/06-technical-architecture.md) |
| 07 | [Content rights data model](docs/07-content-rights-data-model.md) |
| 08 | [API specification](docs/08-api-specification.md) |
| 09 | [Media workflow](docs/09-media-workflow.md) |
| 10 | [Distribution architecture](docs/10-distribution-architecture.md) |
| 11 | [Security and privacy plan](docs/11-security-and-privacy.md) |
| 12 | [Monetization plan](docs/12-monetization-plan.md) |
| 13 | [MVP roadmap](docs/13-mvp-roadmap.md) |
| 14 | [Estimated operating budget](docs/14-operating-budget.md) |
| 15 | [Affiliate acquisition strategy](docs/15-affiliate-acquisition-strategy.md) |
| 16 | [Investor summary](docs/16-investor-summary.md) |
| 17 | [Sample programming schedule](docs/17-sample-programming-schedule.md) |
| 18 | [Setup and deployment](docs/18-setup-and-deployment.md) |
| 19 | [Partner pitch material](docs/19-partner-pitch-material.md) |
| 20 | [Third-party dependencies](docs/20-third-party-dependencies.md) |
| 21 | [Lovable port status and handoff](docs/21-lovable-port.md) |

Environment variables are documented in [`.env.example`](.env.example). None is required to run the
demonstration build.

## Demonstration dataset

20 artists · 10 chart entries · 5 NEXT UP entries · 8 shows with 16 episodes · 13 city bureaus ·
10 editorial stories across the workflow · 30+ media assets with rights windows · a full generated
week of programming · 13 distribution endpoints · 4 affiliates · 3 affiliate packages ·
7 syndicated radio formats · 5 sponsorship opportunities · 6 campaigns · 3 artist plans ·
6 Drive sync records · 13 health checks.

Every record carries a `provenance` field. Everything seeded is marked `demo`, the site-wide banner
says so, and every API response carries `dataMode` so a consumer can check by machine rather than by
trust.

## What is not built

Persistence, an identity provider, the media pipeline, playout, and streaming. Each is an
integration behind an interface that already exists — see
[docs/20](docs/20-third-party-dependencies.md) for the full list, including the licences and
agreements no amount of engineering substitutes for.

Player surfaces throughout are real interfaces — transport, captions, quality selection, live clock —
attached to slates rather than to a feed, and they say so on screen.
