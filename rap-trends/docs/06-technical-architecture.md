# RAP TRENDS — Technical Architecture

## 1. Shape

Modular, cloud-native, API-first. One application serves four audiences — the public network, RAP
TRENDS OS, the artist portal, and the affiliate portal — from one domain model and one data layer.

```
                    ┌──────────────────────────────────────────────┐
   Viewers ────────▶│  Public network        (site) route group    │
   Artists ────────▶│  Artist portal         /artist-portal        │
   Affiliates ─────▶│  Affiliate portal      /affiliate-portal     │
   Operators ──────▶│  RAP TRENDS OS         /os  (permissioned)   │
   Machines ───────▶│  REST API              /api                  │
                    └──────────────────┬───────────────────────────┘
                                       │
                    ┌──────────────────▼───────────────────────────┐
                    │  Domain layer                                │
                    │  index-engine · rights · schedule            │
                    │  ad-safety · workflow · roles                │
                    │  Pure, deterministic, fully tested           │
                    └──────────────────┬───────────────────────────┘
                                       │
                    ┌──────────────────▼───────────────────────────┐
                    │  Repository boundary   src/lib/repo.ts       │
                    │  demo adapter │ Postgres adapter             │
                    └──────────────────┬───────────────────────────┘
                                       │
        ┌──────────────┬───────────────┼──────────────┬───────────────────┐
        ▼              ▼               ▼              ▼                   ▼
   PostgreSQL     Object store    Queue/workers   Vendor adapters     Observability
   (Supabase)     (S3-compatible) (FFmpeg, AI)    playout · SSAI ·    logs · metrics ·
                                                  delivery · PRO      alerts
```

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router | Server components keep the domain layer on the server; one codebase serves HTML and JSON |
| Language | TypeScript, `strict` | The domain is rules-heavy; the compiler is the cheapest place to catch a rights or scheduling mistake |
| Styling | Tailwind CSS v4 | Design tokens in `@theme` are the single source of truth for the brand |
| Database | PostgreSQL 15+ (Supabase) | Range types for schedule overlap exclusion, arrays for rights and platform sets, RLS for tenancy |
| Auth | Supabase Auth or equivalent SSO | Swapped in behind `src/lib/session.ts` with no other change |
| Object storage | S3-compatible | Mezzanine, proxy, thumbnail, caption, and transcript tiers with lifecycle policies |
| Media processing | FFmpeg in containerised workers | Transcode, proxy, loudness, derivatives, thumbnails |
| Background work | Serverless functions and a durable queue | Drive sweeps, transcodes, deliveries, Index recomputes |
| Validation | Zod | One schema shared by the client form and the server route |
| Tests | Vitest | Fast, no DOM needed for the domain layer |
| Containerisation | Docker | Parity between local, CI, and production |

## 3. The repository boundary

`src/lib/repo.ts` is the only module that knows where data comes from. Every page and route reads
through it, every function is `async` even where the demo adapter is synchronous, and no call site
knows which adapter is behind it.

```ts
// Today — demo adapter
export async function getTrending(options = {}) {
  return rankEntries(CHART_ENTRIES, { profile, sources: INDEX_SOURCES, nowIso: nowIso(), ... });
}

// Production — Postgres adapter. Same signature, same return type.
export async function getTrending(options = {}) {
  const [entries, sources, overrides] = await Promise.all([
    db.chartEntriesWithLatestSignals(),
    db.indexSources(),
    db.activeOverrides(),
  ]);
  return rankEntries(entries, { profile, sources, nowIso: nowIso(), overrides, ... });
}
```

The scoring itself does not move. `rankEntries` is pure: it takes entries, sources, a profile, and a
clock, and returns a ranking. That is why the engine can be exhaustively tested without a database
and why a chart can be recomputed from `signal_readings` at any past moment and produce byte-identical
output.

`DATA_MODE` is exported from the same module and set from `RAPTRENDS_DATA_MODE`. It drives the
site-wide demonstration banner and the `dataMode` field on every API response.

## 4. The domain layer

Five pure modules, no I/O, 155 tests.

| Module | Responsibility |
|---|---|
| `index-engine.ts` | Weighted scoring, recency decay, regional and emerging multipliers, anomaly flags, confidence, editorial overrides, publication gate, ranking |
| `rights.ts` | Per-platform right requirements, territory, licence window, captions, clean-version enforcement, talent releases. Fails closed |
| `schedule.ts` | Gap, overlap, rights, explicit-daypart, caption, and approval validation; duration and coverage arithmetic |
| `ad-safety.ts` | Restricted-category rules by platform, daypart, territory, and age gate; pacing and completion |
| `workflow.ts` | Editorial state machine with role-permissioned transitions and publication gates |

Keeping these pure is a deliberate architectural choice, not a stylistic one. These are the rules
that keep the network out of legal trouble; they need to be testable exhaustively, reviewable by
someone who is not an engineer, and identical whether they run in a page, an API route, a background
worker, or a migration.

## 5. Vendor adapters

Broadcast infrastructure is bought, not built. Each capability sits behind an interface so the
vendor can be replaced without touching the control layer.

```ts
export interface PlayoutAdapter {
  pushSchedule(channelId: ChannelId, items: ScheduleItem[]): Promise<PushResult>;
  currentState(channelId: ChannelId): Promise<{ onAir: string; healthy: boolean }>;
  switchToLive(channelId: ChannelId, sourceId: string): Promise<void>;
  cutToSlate(channelId: ChannelId, reason: string): Promise<void>;
  setGraphics(channelId: ChannelId, graphics: GraphicsState): Promise<void>;
}

export interface DeliveryAdapter {
  deliver(endpoint: DistributionEndpoint, pkg: DeliveryPackage): Promise<DeliveryReceipt>;
  status(endpointId: string): Promise<EndpointStatus>;
}

export interface AdServerAdapter {
  traffic(campaign: Campaign, creatives: Creative[]): Promise<TrafficResult>;
  report(campaignId: string, range: DateRange): Promise<DeliveryReport>;
}
```

Amagi or a comparable provider implements `PlayoutAdapter`. RAP TRENDS OS still decides what plays,
validates that it may play, and monitors the result — the vendor executes.

## 6. Rendering strategy

| Content | Strategy | Reason |
|---|---|---|
| Homepage, live, radio, trending, schedule | `force-dynamic` | The network clock moves; a cached "now playing" is wrong |
| Show, artist, city, article, video pages | SSG with `generateStaticParams` | Content-addressed and stable between publishes |
| RAP TRENDS OS | `force-dynamic` | Permission-dependent and never cached |
| API reads | Short `s-maxage` with `stale-while-revalidate` | 60s on the chart, 30s on the ticker, 300s on the EPG |
| API writes | `no-store` | Rate-limited and never cached |

## 7. Background work

| Job | Cadence | Does |
|---|---|---|
| Index recompute | Every 15 min | Pull authorized signals, score, write a snapshot, hold anything below the floor |
| Drive sweep | Every 5 min | Changes API since the last page token, hash, dedupe, import, notify |
| Media prep | On ingest | Validate, transcode, proxy, thumbnails, captions, transcript, loudness, derivatives, QC |
| Delivery | On schedule | Push packages to endpoints, record receipts, alert on failure |
| Rights sweep | Daily | Flag licences lapsing inside 60 days; block anything already lapsed |
| Schedule validation | On every edit and hourly | Run the validator; alert on any error-severity issue |
| Cue sheets | On playout | Generate music reporting from `music_cues` and `playout_log` |

Jobs are idempotent and keyed, so a retry cannot double-import a file or double-count an airing.

## 8. Security posture

- Every route, action, and API call resolves permissions server-side through `src/lib/session.ts`.
  Filtered navigation is a convenience, never the control.
- Public write endpoints are rate limited by client key and schema-validated before anything else.
- Row-level security in Postgres so a compromised application session cannot read across tenancy.
- History tables have insert and select policies only. No update, no delete.
- Security headers set in `next.config.ts`: `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`.
- Secrets live in the platform's secret manager, never in the repository. `.env.example` documents
  every variable without values.

## 9. Observability

Structured JSON logs with a correlation id per request. Metrics on feed health, transcode queue
depth, caption coverage, delivery success, schedule continuity, ad decisioning, storage, and API
latency. `/api/health` returns 503 while any check fails so an external monitor can page without
scraping a page. Critical failures raise email, SMS, and in-app alerts with escalation after ten
minutes unacknowledged.

## 10. What this build does not yet do

Stated so nobody mistakes the prototype for the product.

- No database. The demo adapter serves seeded data; writes validate and acknowledge without
  persisting.
- No identity provider. `getSessionUser()` reads a cookie.
- No media pipeline. FFmpeg workers are specified, not running.
- No playout vendor. Adapter interfaces are defined, not implemented.
- No streaming. Player surfaces are real interfaces attached to slates, and they say so.

Every one of these is an integration behind an interface that already exists, which is the point of
the boundary.
