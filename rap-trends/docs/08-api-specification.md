# RAP TRENDS — API Specification

Base URL: `${NEXT_PUBLIC_SITE_URL}/api`
Format: JSON unless stated. UTF-8. All timestamps ISO 8601 UTC.

Every response carries `dataMode` (`"demo"` or `"live"`). A consumer must never present `demo` data
as verified measurement, and the field exists so that requirement is machine-checkable rather than a
matter of trust.

---

## Conventions

**Errors**

```json
{ "ok": false, "error": "Human-readable message" }
{ "ok": false, "errors": { "fieldName": "What is wrong with this field" } }
```

| Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 202 | Accepted, pending confirmation |
| 400 | Malformed body |
| 422 | Validation failed — inspect `errors` |
| 429 | Rate limited — honour `Retry-After` |
| 503 | Health check failing |

**Rate limits.** Public write endpoints: 5 requests per minute per client key. Read endpoints are
cached rather than limited.

---

## GET /api/index/chart

The TRENDING 10, scored at request time.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `profile` | string | `profile_national_v3` | Weight profile id |
| `region` | string | — | City id for a regional edition |
| `limit` | integer | 10 | 1–50 |

```json
{
  "dataMode": "demo",
  "generatedIso": "2026-08-24T21:00:00.000Z",
  "profileId": "profile_national_v3",
  "methodology": "/trending/methodology",
  "entries": [
    {
      "rank": 1,
      "previousRank": 2,
      "peak": 1,
      "weeksOn": 5,
      "title": "Bone China",
      "artist": "Sable Mercer",
      "artistId": "art_01",
      "explicit": true,
      "releaseIso": "2026-07-22T00:00:00.000Z",
      "score": 78.4,
      "confidence": 0.93,
      "flags": [],
      "editorialDelta": 0,
      "publishable": { "ok": true },
      "provenance": "demo"
    }
  ]
}
```

`confidence` is a statement about the evidence, not the record. `flags` are open anomaly flags,
shown rather than hidden. `publishable.ok === false` means the entry is held from air, and `reason`
says why.

Cache: `s-maxage=60, stale-while-revalidate=300`.

---

## GET /api/index/sources

The public source register: what we measure, who provides it, and on what legal basis.

```json
{
  "dataMode": "demo",
  "sources": [
    {
      "key": "streaming_velocity",
      "label": "Streaming velocity",
      "provider": "Licensed DSP analytics agreement (placeholder vendor)",
      "authorization": "licensed_api",
      "status": "connected",
      "weight": 0.18,
      "refreshMinutes": 60,
      "lastSyncIso": "2026-08-24T20:36:00.000Z",
      "notes": "Day-over-day play growth, normalized within release cohort."
    }
  ]
}
```

A source with `status !== "connected"` contributes nothing to any score. It is published anyway so
the gap between what we want to measure and what we are licensed to measure is visible.

---

## GET /api/epg

Electronic programme guide for FAST platforms, connected-TV applications, and affiliates.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `channel` | string | `rt_tv` | Channel id |
| `format` | string | — | `xmltv` returns XMLTV |

JSON:

```json
{
  "dataMode": "demo",
  "channelId": "rt_tv",
  "generatedIso": "2026-08-24T21:00:00.000Z",
  "programmes": [
    {
      "id": "sched_00001",
      "startIso": "2026-08-24T23:00:00.000Z",
      "endIso": "2026-08-24T23:52:00.000Z",
      "durationSeconds": 3120,
      "title": "RAP TRENDS LIVE (LIVE)",
      "description": "The network's flagship hour…",
      "category": "RAP TRENDS LIVE",
      "rating": "TV-14",
      "live": true,
      "explicitFeed": false,
      "captions": true,
      "daypart": "primetime"
    }
  ]
}
```

XMLTV (`?format=xmltv`) returns `application/xml` with `<channel>`, `<programme>`, `<title>`,
`<desc>`, `<category>`, `<rating system="VCHIP">`, and `<subtitles>`. Seven days forward.

Cache: `s-maxage=300`.

---

## GET /api/schedule

One day of playout with its validation report — the same validator the programming console runs.

| Parameter | Type | Default |
|---|---|---|
| `day` | integer | 0 (0–6) |
| `channel` | string | `rt_tv` |

```json
{
  "dataMode": "demo",
  "channelId": "rt_tv",
  "dayOffset": 0,
  "totalSeconds": 86400,
  "items": [ /* every event, in order */ ],
  "issues": [
    {
      "severity": "error",
      "code": "missing_captions",
      "channelId": "rt_tv",
      "itemId": "sched_00042",
      "startIso": "2026-08-25T01:00:00.000Z",
      "message": "\"BARS — Episode 104\": Captions are AI-drafted and have not been reviewed by a human."
    }
  ]
}
```

Issue codes: `gap`, `overlap`, `rights_window`, `explicit_restriction`, `missing_captions`,
`unapproved`, `missing_asset`. Severity `error` would stop or compromise the feed; `warning` needs
attention but does not.

---

## GET /api/ticker

```json
{
  "dataMode": "demo",
  "generatedIso": "2026-08-24T21:00:00.000Z",
  "items": [
    { "id": "tk_02", "kind": "chart", "text": "KP Verse climbs to No. 2", "href": "/trending", "iso": "…" }
  ]
}
```

Kinds: `release`, `breaking`, `chart`, `live`, `premiere`, `concert`. Cache `s-maxage=30`.

---

## GET /api/health

Returns **503** while any check is failing, so an external monitor can page on status code alone.

```json
{
  "status": "warn",
  "dataMode": "demo",
  "checkedIso": "2026-08-24T21:00:00.000Z",
  "counts": { "ok": 8, "warn": 4, "fail": 1 },
  "checks": [
    { "id": "hc_07", "area": "delivery", "label": "Social clip delivery", "status": "fail",
      "detail": "Two clips rejected — source asset has no rights record on file.",
      "value": "2 failed", "updatedIso": "…" }
  ]
}
```

Areas: `feeds`, `transcode`, `captions`, `rights`, `delivery`, `schedule`, `advertising`, `storage`,
`api`, `drive_sync`, `editorial`. `Cache-Control: no-store`.

---

## POST /api/submissions

Artist submission. Rate limited.

```json
{
  "artistName": "Vega Monroe",
  "contactEmail": "artist@example.com",
  "trackTitle": "Wicker Park Winter",
  "city": "Chicago",
  "planId": "plan_free",
  "explicitVersion": false,
  "cleanVersion": true,
  "isrc": "USRC17607839",
  "iswc": "T-123456789-0",
  "upc": "012345678905",
  "label": "Self-released",
  "publisher": "Self",
  "pro": "BMI",
  "territories": ["US", "CA"],
  "licenseStartIso": "2026-07-01",
  "licenseEndIso": "",
  "rightsDocsProvided": true,
  "nextUpApplication": true,
  "rightsAttestation": true,
  "notes": ""
}
```

Validation: `artistName`, `contactEmail`, `trackTitle`, `city`, `planId`, `territories` (≥1), and
`rightsAttestation` (must be `true`) are required. At least one of `explicitVersion` /
`cleanVersion` must be true — a record with neither identified cannot be routed to a feed. ISRC,
ISWC, and UPC are format-checked when present.

**201:**

```json
{
  "ok": true,
  "reference": "RT-2026-K3XA9F",
  "status": "received",
  "reviewWindowDays": 14,
  "nextSteps": ["…"],
  "editorialNotice": "Your plan affects review speed and reporting detail only. It has no effect on editorial selection or chart position, and editors scoring your record cannot see which plan you are on.",
  "persisted": false
}
```

`reviewWindowDays`: 14 free, 5 professional, 3 enterprise. The plan changes review speed and
reporting detail. It changes nothing else, and the review queue view does not expose it.

---

## POST /api/newsletter

```json
{ "email": "you@example.com", "consent": true, "interests": ["chart", "next_up"] }
```

`consent` must be literal `true` — nothing is pre-checked and there is no implied-consent path.
Returns **202** with `status: "pending_confirmation"`; double opt-in completes the subscription.

---

## POST /api/carriage

```json
{
  "station": "Demo Station Group",
  "market": "Atlanta",
  "kind": "tv",
  "packageId": "pkg_daypart",
  "contactName": "Contact Name",
  "contactEmail": "contact@example.com",
  "facilityId": "12345",
  "notes": ""
}
```

**201** returns a reference, the package terms, next steps, and this disclaimer verbatim:

> This is an enquiry, not an agreement. No carriage, market exclusivity, or programme placement is
> committed. Over-the-air carriage requires a partnership with an FCC-licensed station; RAP TRENDS
> does not hold spectrum or a broadcast licence.

---

## POST /api/advertising

```json
{
  "company": "Demo Brand",
  "contactName": "Contact",
  "contactEmail": "contact@example.com",
  "budgetBand": "150k_500k",
  "interest": ["sponsorship", "branded"],
  "restrictedCategory": "cannabis",
  "notes": ""
}
```

When a restricted category is declared, the response states the rules **before** anyone writes a
proposal:

```json
{
  "ok": true,
  "reference": "RT-ADV-K3XA9F",
  "status": "enquiry_received_pending_compliance",
  "restrictions": {
    "category": "Cannabis",
    "minAudienceAge": 21,
    "allowedDayparts": ["late", "overnight"],
    "blockedPlatforms": ["ota", "cable", "vmvpd", "radio_affiliate", "fast"],
    "note": "State-legal markets only, digital owned-and-operated inventory only, counsel sign-off required per market.",
    "complianceReviewRequired": true
  }
}
```

---

## Planned, not yet built

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/artists/{slug}/airtime` | Verified airtime for a claimed artist. Enterprise plan. Requires auth |
| GET | `/api/affiliates/{id}/schedule` | Affiliate-specific schedule with local windows marked |
| POST | `/api/affiliates/{id}/reports` | File a monthly local-insertion report |
| GET | `/api/cuesheets/{assetId}` | Music cue sheet for performance-rights reporting |
| POST | `/api/os/articles/{id}/transition` | Move a story through the workflow. Permissioned |
| POST | `/api/os/schedule/validate` | Validate a proposed schedule before saving |
| GET | `/api/index/audit/{entryId}` | Full audit history for a chart position |

## Authentication (planned)

Public reads are unauthenticated. Portal and console endpoints will use bearer tokens issued by the
identity provider, with the same permission set that guards the pages. Enterprise artist accounts
receive scoped API keys limited to their own catalogue.
