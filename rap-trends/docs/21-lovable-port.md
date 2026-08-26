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
| 3 | `3750d94d` | `schedule`, `ad-safety`, `workflow`, `roles`, `data/schedule`, `users`, `distribution`, `monetization`, `ops`; `/schedule` and the `/os` console |
| 4 | `dab76e87` | `rate-limit`, `validation`, server routes (`/api/epg`, `/api/health`, `/api/index`), submit and portal flows, hydration fixes |
| — | `da9727dc` | `README.md` rewritten to describe the actual app |
| — | `116898bf` | Drive videos labelled FPO while their metadata was unconfirmed |
| — | `8bd3bb16` | FPO chrome removed globally at the operator's request |

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

**Passes 3 and 4 were verified the same way.** `/os/programming` calls
`requirePermission("schedule.read")` in its loader and runs the real `validateSchedule` against
asset and rights maps. `/api/epg` emits genuine XMLTV — DOCTYPE, `channel id`, `YYYYMMDDHHMMSS
+0000` timestamps, XML escaping, a `VCHIP` rating element and an `application/xml` content type
— and filters to episode and live-window entries only. Neither pass modified `index-engine.ts`
or `rights.ts`.

## Two things to know

**The published URL lags the preview.** Lovable deploys a commit; later commits land on the
preview URL but not the published one until you publish again. Passes 3 and 4 will not appear on
`rap-trends.lovable.app` until someone republishes.

**The stored project description is stale.** It still describes the original landing-page brief
("Story Title Pending", placeholder titles). Lovable feeds that description to its agent as
context, so leaving it pulls future prompts back toward the mockup. There is no MCP tool to
change it — edit it in the Lovable project settings. The **project knowledge** is current and is
what actually governs agent behaviour.

## Archive: the pass 4 prompt

Pass 4 has been applied (`dab76e87`). The prompt is kept verbatim below because it inlines the
canonical `rate-limit.ts` and `validation.ts` sources — if the Lovable copies ever drift, this is
the text that produced them. Everything below was pasted into the Lovable chat as a single
message. Attach nothing;
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
dependency. The same schemas drive the client forms and the server routes, so both produce
identical messages. Create it verbatim:

```ts
import { z } from "zod";

/**
 * Request validation.
 *
 * Every write endpoint validates here before touching anything. Schemas are
 * shared with the client forms so the same rules produce the same messages on
 * both sides.
 */

export const submissionSchema = z.object({
  artistName: z.string().trim().min(1, "Artist name is required").max(120),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  trackTitle: z.string().trim().min(1, "Track title is required").max(160),
  city: z.string().trim().min(1, "City is required").max(80),
  planId: z.enum(["plan_free", "plan_pro", "plan_enterprise"]),
  explicitVersion: z.boolean(),
  cleanVersion: z.boolean(),
  isrc: z.string().trim().regex(/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/, "ISRC must look like CCXXXYYNNNNN").optional().or(z.literal("")),
  iswc: z.string().trim().regex(/^T-?\d{9}-?\d$/, "ISWC must look like T-123456789-0").optional().or(z.literal("")),
  upc: z.string().trim().regex(/^\d{12,14}$/, "UPC must be 12–14 digits").optional().or(z.literal("")),
  label: z.string().trim().max(120).optional(),
  publisher: z.string().trim().max(120).optional(),
  pro: z.string().trim().max(80).optional(),
  territories: z.array(z.string().trim().min(2)).min(1, "Select at least one territory"),
  licenseStartIso: z.string().trim().optional(),
  licenseEndIso: z.string().trim().optional(),
  rightsDocsProvided: z.boolean(),
  nextUpApplication: z.boolean(),
  /** The submitter must affirm they control the rights they are granting. */
  rightsAttestation: z.literal(true, {
    errorMap: () => ({ message: "You must confirm you control the rights you are granting" }),
  }),
  notes: z.string().trim().max(2000).optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  // Explicit, unbundled consent — never pre-checked, never implied.
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required before we can email you" }),
  }),
  interests: z.array(z.enum(["chart", "news", "next_up", "business", "events"])).default([]),
});

export const carriageSchema = z.object({
  station: z.string().trim().min(1, "Station or group name is required").max(160),
  market: z.string().trim().min(1, "Market is required").max(120),
  kind: z.enum(["tv", "radio"]),
  packageId: z.enum(["pkg_full", "pkg_daypart", "pkg_syndication"]),
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  facilityId: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const advertisingSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(160),
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  budgetBand: z.enum(["under_50k", "50k_150k", "150k_500k", "over_500k"]),
  interest: z.array(z.string()).min(1, "Select at least one opportunity"),
  restrictedCategory: z.enum(["none", "alcohol", "cannabis", "gambling", "political", "pharma"]),
  notes: z.string().trim().max(2000).optional(),
});

/** Flatten a ZodError into a field → message map the forms can render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
```

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

## Editorial content and the POLARIS byline

**The two implementations diverge here on purpose.** This repo keeps its ten demonstration
articles: it is the reference build, and those pieces exist to exercise the workflow state
machine, the corrections surface and the provenance badge. The Lovable app is the live product
surface and carries real reporting only.

The product surface no longer carries fictional editorial. The ten demonstration articles written for the
build have been removed from every public surface and replaced with **seven real articles**
filed by the newsroom.

**POLARIS is the standing byline.** It is the newsroom identity that reports and files for
RapTrends.com, and it is what appears on every article. Copy inside the trial-primer piece that
reads "Streamline POLARIS launches continuing coverage" and "follow POLARIS on YouTube" is
correct as written and must not be rewritten to say RAP TRENDS.

These articles carry `provenance: "verified"`. They must never render the `DEMO DATA` badge or
the demonstration-data disclaimer — those exist to stop simulated numbers being mistaken for
live ones, and applying them to real reporting would be the same failure in reverse.

They concern **an active criminal prosecution and named living people**. The no-fabrication rule
in the brief is at its strictest here: no invented publish dates, read times, view counts,
related-story links, or tags that assert a fact about anyone named. If a field has no value, the
field is omitted.

### Video attachment: evidence, not resemblance

The Drive folder supplies ten `.mp4` files and nothing else — no titles, no descriptions, no
durations, no transcripts. Filenames are internal content IDs. A filename that resembles a topic
is not evidence that the file is about that topic, and the brief forbids inventing content from
one.

| Asset | Article | Basis |
|---|---|---|
| `mob.mp4` | Tupac Murder Trial Day 2: Mob James | Strong — filename and article subject align, and the piece is the only Mob James story |
| `50ss50.mp4` | 50 Cent & Rick Ross | Strong — but held by the rights gate, see below |
| the other eight | none | No basis. Left in the video library, unattached |

A later frame inspection found a **POLARIS star bug** on `mob.mp4`. That is provenance, not a
rights problem: POLARIS is the content partner that filed the story the video leads, and a
partner's own bug on its own footage is exactly what you would expect. A *third-party*
broadcaster's bug would mean the opposite, and any asset carrying one belongs behind the gate
alongside `50ss50`.

`50ss50.mp4` appears to contain third-party programming — the article cites Nadeska Alexis, and
the clip's opening frame carries broadcast branding. It is attached to the article but its
rights record is **not cleared for web distribution**, reason `Third-party rights unverified —
clip may contain licensed programming`. `checkEligibility` therefore blocks it and the page
renders the reason instead of a player. That is the gate working, not a defect; do not add a
bypass.

**Resolved.** The durations shown on the video cards (`12:04`, `04:18`, `07:52` and the rest),
the per-franchise content ratings, and the air dates were all invented during the first Lovable
build. Drive exposes none of that metadata and the brief supplied none. They have been removed
from `VideoItem`, from `MediaAsset` (where the fields are now optional), and from every surface
that rendered them. `MediaAsset.durationSeconds`, `resolution`, `aspectRatio`, `audioFormat` and
`rating` are unset when nothing measured them, and the operator screens show "not supplied"
rather than a zero.

### Editorial illustration

Article and video cards carry photorealistic artwork that is **strictly non-depictive**. Not one
image shows a person, and none claims to show the events in the story or the footage in a video.

That is not squeamishness. Six of the seven articles concern named living people and an active
prosecution; a synthetic photorealistic image of a real person attached to one of them would
function as fabricated evidence whatever the caption said. Empty rooms, unattended microphones
and studio interiors are what a newsroom without photo rights actually runs. Every use carries
the line "Illustration. Not a photograph of the events described.", and alt text describes the
artwork rather than asserting a scene.

Seventeen images were generated; **four were rejected on review** and two of those replaced. The
failure mode is worth knowing: no image produced a face, but the model invented pseudo-lettering
on any surface that could plausibly hold text — fake broadcaster names on press-microphone
flags, a legible-looking legal document, an illuminated building sign, a record label. A fifth
candidate was rejected for a human arm at the frame edge. Anything generated for this site must
be looked at and zoomed into before it ships; the review is not a formality. Licensed press
photography is the better answer once there is budget for it.

Where a real extracted frame from the Drive file exists, it beats an illustration — it is the
honest poster for that asset. Resolution order is editorial illustration, then extracted frame,
then the deterministic abstract poster.

**Still needed from the newsroom:** a one-line manifest per video — what it is, who appears in
it, whether we shot it, and whether it is cleared. Until that exists the eight unattached files
cannot be published, and `50ss50.mp4` cannot be released from the gate.

## Standing checklist after any pass

1. Confirm `/api/epg?format=xmltv` returns `application/xml` — open it directly.
2. Confirm `/api/health` returns 503 (a demonstration check fails by design).
3. Republish so the public URL catches up.
4. Update the project description in Lovable settings.
5. Leave `robots.txt` on `Disallow: /` until the Index runs on licensed data.
6. Confirm no fictional article is reachable — the seven POLARIS pieces are the whole newsroom.
7. Confirm `50ss50.mp4` still renders as blocked rather than playing.

## Reconciling changes back

If the Lovable app diverges on a domain module, treat this repo as canonical and port the fix
back, then re-run `npm test` here. The 155 tests are the contract; a domain change that breaks
them is a change to the network's rules and needs a decision, not a patch.
