# RAP TRENDS — Lovable port status and handoff

The Lovable project **"Rap Trends Live"** (`18ea8671-bdab-4028-80de-71cc479a90d7`) is a
TanStack Start app that shares this repository's domain model. This document records what has
been transferred, what has been verified, and what remains — including a ready-to-paste prompt
for the final pass.

- Editor: https://lovable.dev/projects/18ea8671-bdab-4028-80de-71cc479a90d7
- Preview: https://id-preview--18ea8671-bdab-4028-80de-71cc479a90d7.lovable.app
- Published: https://rap-trends.lovable.app

## Why two implementations

This repo is the **reference implementation** (Next.js). Lovable is the **product surface** the
team edits visually. The five domain modules are pure TypeScript with no React and no I/O, so
they are byte-identical in both. That is deliberate: the rules that keep the network out of
legal trouble should not have two dialects.

Port anything new by moving the domain module first and wiring the UI second.

## Transferred and verified

| Pass | Commit | Contents |
|---|---|---|
| 1 | `4e659420` | `types`, `clock`, `format`, `index-engine`, `artists`, `chart`, `index-sources`, plus `repo.ts` and a rebuilt `/charts` + `/charts/methodology` + `/artists` |
| 2 | `2cc2feea` | `rights`, `cities`, `shows`, `articles`, `media`; `/read`, `/cities`, `/watch` and the delivery check on `/video/$id` |
| — | `5aab867b` | `robots.txt` set to `Disallow: /` |
| 3 | *unverified* | `schedule`, `ad-safety`, `workflow`, `roles`, `data/schedule`, `users`, `distribution`, `monetization`, `ops`; `/schedule` and the `/os` console |

**Verification performed on passes 1 and 2** by reading the code back, not by trusting the
summary:

- `index-engine.ts` arrived verbatim — every threshold intact (`70/30` flat-engagement trigger,
  `0.55` decay floor, `0.22/0.12/0.05` confidence penalties, `0.50` publication floor,
  `MIN_SIGNALS_FOR_PUBLICATION = 6`). The only difference is `options.emerging ?? false` in
  `rankEntries`, which is semantically identical.
- `/charts` computes through `rankEntries` at request time. The hardcoded `indexEntries` array
  is gone.
- `/video/$id` runs `checkEligibility` for real and renders the missing-rights-record asset as
  **blocked**, which is correct behaviour.

**Pass 3 is unverified.** It was accepted by the agent but the MCP connector dropped before the
commit could be confirmed. Check `/os` and `/schedule` render, and confirm
`src/lib/index-engine.ts` and `src/lib/rights.ts` were not modified by that pass.

## Two things to know

**The published URL lags the preview.** Lovable deploys a commit; later commits land on the
preview URL but not the published one until you publish again. Passes 3 and 4 will not appear on
`rap-trends.lovable.app` until someone republishes.

**The stored project description is stale.** It still describes the original landing-page brief
("Story Title Pending", placeholder titles). Lovable feeds that description to its agent as
context, so leaving it pulls future prompts back toward the mockup. There is no MCP tool to
change it — edit it in the Lovable project settings. The **project knowledge** is current and is
what actually governs agent behaviour.

## Remaining: pass 4

Everything below is ready to paste into the Lovable chat as a single message. Attach nothing;
the two required modules are inlined.

---

### PASTE FROM HERE

Final pass: the functional flows and the machine-readable API.

**First, two new modules.** Create these two files verbatim.

`src/lib/rate-limit.ts` — an in-memory limiter for public write endpoints. Production swaps the
store for Redis or the platform's edge limiter; the call signature does not change.

```ts
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded ?? request.headers.get("x-real-ip") ?? "local"}`;
}
```

`src/lib/validation.ts` — request validation with zod. Add `zod` if it is not already a
dependency. The same schemas drive the client forms and the server routes so both produce the
same messages.

Schemas needed:

- `submissionSchema` — `artistName`, `contactEmail` (email), `trackTitle`, `city` all required;
  `planId` one of `plan_free`/`plan_pro`/`plan_enterprise`; `explicitVersion` and `cleanVersion`
  booleans; optional `isrc` matching `/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/`, `iswc` matching
  `/^T-?\d{9}-?\d$/`, `upc` matching `/^\d{12,14}$/` (each also allowing empty string); optional
  `label`, `publisher`, `pro`; `territories` array with at least one entry; optional licence
  dates; `rightsDocsProvided`, `nextUpApplication` booleans; and
  `rightsAttestation: z.literal(true)` with the message "You must confirm you control the rights
  you are granting".
- `newsletterSchema` — `email`, `consent: z.literal(true)` ("Consent is required before we can
  email you"), `interests` array.
- `carriageSchema` — `station`, `market`, `kind` (tv/radio), `packageId`
  (pkg_full/pkg_daypart/pkg_syndication), `contactName`, `contactEmail`, optional `facilityId`
  and `notes`.
- `advertisingSchema` — `company`, `contactName`, `contactEmail`, `budgetBand`, `interest`
  (at least one), `restrictedCategory` (none/alcohol/cannabis/gambling/political/pharma).
- `fieldErrors(error)` flattening a ZodError to a `field -> message` map.

**Server routes.** TanStack Start server routes, every response carrying `dataMode` from
`repo.ts` so no consumer can mistake demonstration data for verified measurement.

- `GET /api/index/chart` — scored chart. `?profile=` `?region=` `?limit=`. Each entry returns
  rank, previousRank, title, artist, score, confidence, flags, editorialDelta, and the
  `isPublishable` verdict.
- `GET /api/index/sources` — the public source register with each source's licensing basis.
- `GET /api/epg` — programme guide. **`?format=xmltv` must return real XMLTV as
  `application/xml`** with `<channel>`, `<programme>`, `<title>`, `<desc>`, `<category>`,
  `<rating system="VCHIP">`. This is what FAST platforms actually ingest, so it matters more
  than it looks.
- `GET /api/schedule` — one day of playout plus its `validateSchedule` report.
- `GET /api/ticker`, `GET /api/health` — health returns **503** while any check is failing so an
  external monitor can page on status code alone.
- `POST /api/submissions`, `/api/newsletter`, `/api/carriage`, `/api/advertising` — each
  rate-limited via `rateLimit(clientKey(request, scope))`, validated, returning `422` with a
  `errors` map on failure.

`POST /api/submissions` must reject a submission where neither `explicitVersion` nor
`cleanVersion` is set — a record with no identified version cannot be routed to a feed. Its
success response includes: "Your plan affects review speed and reporting detail only. It has no
effect on editorial selection or chart position, and editors scoring your record cannot see
which plan you are on."

`POST /api/carriage` must return this disclaimer verbatim: "This is an enquiry, not an
agreement. No carriage, market exclusivity, or programme placement is committed. Over-the-air
carriage requires a partnership with an FCC-licensed station; RAP TRENDS does not hold spectrum
or a broadcast licence."

`POST /api/advertising` must, when a restricted category is declared, return the rules that will
apply — minimum audience age, permitted dayparts, blocked platforms — from `CATEGORY_RULES` in
`ad-safety.ts`, *before* anyone writes a proposal.

**Public routes.**

`/submit` — a three-step submission portal. Step 1 plan selection showing all three plans with
their `editorialGuarantee` text. Step 2 the record: artist, contact, title, city, and which
versions exist. Step 3 rights: ISRC, ISWC, UPC, label, publisher, PRO, territories, licence
window, and a required attestation that the submitter controls the rights they are granting.
Validate client-side and again server-side; on a validation failure jump back to the step holding
the first failing field. Show the reference number and review window on success.

`/partners` — the distribution hub: the four tracks (FAST, cable, OTA, radio), the three
affiliate packages with their terms, an honest endpoint status table, and a carriage request
form. State plainly that RAP TRENDS holds no FCC licence and no spectrum, and that no carriage
agreement exists in any market.

`/partners/fast`, `/partners/cable`, `/partners/ota`, `/partners/radio` — one pitch page each,
with a technical specification table and an **"Open items"** panel listing what is genuinely
unresolved. A station group that finds an overstatement during due diligence does not come back,
so the open items are as prominent as the capabilities.

`/advertise` — the sponsorship rate card, the capability list, and a **restricted category
rules table** rendered from `CATEGORY_RULES`: minimum age, permitted dayparts, blocked platforms
and conditions for alcohol, cannabis, gambling, political, pharma. Plus the enquiry form.

`/artist-portal` — signed in as a demonstration artist: their submissions with editorial status,
verified airtime drawn from the schedule, their strongest signals as labelled meters, rights
documentation state, invitations, and clearly labelled promotional products with the note that
promotion buys none of chart position, editorial coverage, or NEXT UP selection.

`/affiliate-portal` — schedule and EPG feed links, the syndicated radio programmes with delivery
windows, a local-insertion reporting form, and the television and radio technical specifications.

**Still applies:** design tokens untouched, `provenance: "demo"` labelled, tables get captions,
meters get `role="meter"`, numbers stay tabular, real empty and error states. Do not weaken any
domain logic to make a screen easier.

### PASTE TO HERE

---

## After pass 4

1. Confirm `/api/epg?format=xmltv` returns `application/xml` — open it directly.
2. Confirm `/api/health` returns 503 (a demonstration check fails by design).
3. Republish so the public URL catches up.
4. Update the project description in Lovable settings.
5. Leave `robots.txt` on `Disallow: /` until the Index runs on licensed data.

## Reconciling changes back

If the Lovable app diverges on a domain module, treat this repo as canonical and port the fix
back, then re-run `npm test` here. The 155 tests are the contract; a domain change that breaks
them is a change to the network's rules and needs a decision, not a patch.
