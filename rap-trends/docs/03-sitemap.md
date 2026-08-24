# RAP TRENDS — Sitemap

Route group `(site)` carries the public network chrome — header, footer, and the persistent live
controls. `/os` has its own console chrome. `/api` is headless.

## Public network — `(site)`

```
/                              Homepage
│                              Live Now · Trending 10 · Breaking · Watch · Listen ·
│                              Next Up · City Reports · New Releases · Index · Submit · Partner
│
├── /live                      Live TV — player, up next, where to watch
├── /radio                     Live radio — now playing, hour clock, syndicated formats
├── /schedule                  Seven-day EPG, day selector, dayparts        [?day=0–6]
│
├── /trending                  TRENDING 10 with per-position signal breakdowns
│   └── /methodology           Public Index methodology
├── /next-up                   Emerging edition + the NEXT UP artist pool
│
├── /shows                     Franchise slate + roadmap
│   └── /[slug]                Franchise page: episodes, airings, details, sponsorship
├── /artists                   Artist directory by tier
│   └── /[slug]                Profile: chart positions, video, coverage, signals
├── /cities                    Thirteen bureaus by region
│   └── /[slug]                Bureau: regional chart, artists, reporting, distribution targets
├── /news                      Newsroom output, lead + by franchise
│   └── /[slug]                Story: sources, corrections, tagging
├── /videos                    Video library by type
│   └── /[id]                  Asset: player, technical, rights, live delivery check
│
├── /submit                    Independent artist submission portal (3 steps)
├── /artist-portal             Artist workspace
│
├── /partners                  Distribution hub: tracks, packages, honest status, request form
│   ├── /fast                  FAST & connected-TV pitch
│   ├── /cable                 Cable & vMVPD pitch
│   ├── /ota                   Over-the-air partnership pitch
│   └── /radio                 Radio syndication pitch
├── /affiliate-portal          Affiliate workspace
│
├── /advertise                 Rate card, capabilities, restricted-category rules, enquiry
├── /account                   Sign-in, membership tiers, newsletter, notification preferences
├── /press                     Fact sheet, brand guidance, contacts
├── /about                     What this is, what it is not, the five phases
│
└── /legal
    ├── /editorial-standards   Firewall, verification, AI limits, corrections, conflicts
    ├── /rights                Rights cleared per destination, compliance surface, hard limits
    └── /privacy               Collection, consent, sharing, COPPA, rights, retention
```

## RAP TRENDS OS — `/os`

Navigation is filtered per operator by permission. Every route re-checks server-side.

```
/os                            Control room — on air, queues, pacing, distribution
│
├── Editorial
│   ├── /os/newsroom           Workflow board + editorial calendar     [newsroom.read]
│   │   └── /[id]              Story: body, fact check, transitions, distribution copy
│   └── /os/drive              Google Drive ingestion + sync log       [media.read]
│
├── Media
│   ├── /os/media              Asset catalogue + preparation pipeline  [media.read]
│   └── /os/rights             Eligibility matrix + rights records     [rights.read]
│
├── Air
│   ├── /os/programming        Calendar + validation report            [schedule.read]
│   ├── /os/channels           Origination + master control            [channel.monitor]
│   └── /os/distribution       Endpoints, affiliates, integrations     [distribution.read]
│
├── Revenue
│   ├── /os/monetization       Campaigns, pacing, placement checks     [ads.read]
│   └── /os/analytics          Audience, schedule, recommendations     [analytics.read]
│
└── Operations
    ├── /os/health             Health checks by area                   [os.view]
    └── /os/users              Directory + permission matrix           [os.view]
```

## API — `/api`

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/index/chart` | Scored chart. `?profile=` `?region=` `?limit=` |
| GET | `/api/index/sources` | Public source register with authorization basis |
| GET | `/api/epg` | EPG. `?channel=` `?format=xmltv` |
| GET | `/api/schedule` | One day of playout with its validation report |
| GET | `/api/ticker` | Real-time strip |
| GET | `/api/health` | Health rollup. 503 while any check fails |
| POST | `/api/submissions` | Artist submission. Rate limited |
| POST | `/api/newsletter` | Double opt-in subscription. Rate limited |
| POST | `/api/carriage` | Carriage enquiry. Rate limited |
| POST | `/api/advertising` | Advertising enquiry with category rules. Rate limited |

## Not yet built

`/os/newsroom/new`, `/os/media/[id]`, `/os/programming` drag-and-drop editing, live clipping,
`/awards`, `/events`, and the connected-TV application shells. Each is scoped in the roadmap.
