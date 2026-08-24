# RAP TRENDS — Security and Privacy Plan

## 1. Threat model

What an attacker would actually want from this system, in priority order:

1. **Chart manipulation.** Move a record up the Index. The highest-value target, because the chart
   is the network's credibility.
2. **Unauthorized publication.** Push content to air or to a distribution partner without clearance.
3. **Rights bypass.** Deliver content outside its licensed window, territory, or platform.
4. **Ad fraud.** Traffic a restricted-category campaign into inventory that cannot carry it.
5. **Data theft.** Artist contact information, unpublished rights documentation, embargoed stories.
6. **Emergency override abuse.** Take channels off air.

## 2. Chart integrity

The Index is defended in layers because a single control would be tuned around.

| Layer | Control |
|---|---|
| Source | Only sources with an executed agreement contribute. `connected_requires_agreement` enforces it in the database |
| Ingestion | `signal_readings` is append-only with a unique key on entry, source, and window. A double-submitted window is rejected |
| Voting | One vote per verified account per entry per day, enforced by a unique constraint rather than application logic |
| Scoring | Deterministic and pure. Any published chart can be recomputed from stored readings and must produce identical output |
| Anomaly | Four detectors flag unusual evidence patterns. Patterns are published; thresholds are not |
| Publication | Confidence below 0.50, an open high-severity flag, or fewer than six reporting signals holds a position from air |
| Override | Requires a named author and a written reason of at least 20 characters, and is published on the chart |
| Audit | Every recompute, source change, profile change, and override writes an append-only record |

We publish the anomaly *patterns* on the methodology page and not the thresholds. Someone building a
click farm should know we are looking at engagement quality against streaming velocity; they should
not know the exact ratio that trips the flag.

## 3. Access control

- Role-based permissions resolved server-side on every route, action, and API call. Filtered
  navigation is convenience, never control.
- Row-level security in Postgres so a compromised application session cannot read across tenancy.
- History tables (`audit_log`, `article_revisions`, `index_snapshots`) have insert and select
  policies only. No update policy, no delete policy.
- The emergency override requires `channel.emergency`, held by exactly two roles, and is a two-step
  armed action that states its blast radius before firing.
- Restricted-category campaigns cannot reach `live` without a named approver — enforced by the
  `restricted_requires_approval` check constraint, not only by the application.
- The submission review queue reads a view that omits the plan, so an editor scoring a record cannot
  see whether the artist paid. The firewall is a schema decision.

## 4. Authentication

| Surface | Method |
|---|---|
| Public accounts | Passwordless email link; passkeys and SSO on the roadmap |
| Artist portal | Email link plus profile-claim verification |
| Affiliate portal | Invitation-only, tied to an executed agreement |
| RAP TRENDS OS | SSO with mandatory MFA for any role holding a write permission |
| API | Bearer tokens scoped to the same permission set; enterprise artist keys limited to their own catalogue |

Sessions are short and refreshed. The demonstration cookie in `src/lib/session.ts` is replaced
wholesale; nothing downstream changes.

## 5. Application security

- Every public write endpoint is schema-validated before anything else runs, then rate limited by
  client key (5/minute).
- Uploads are validated by content type and hashed before storage. Media is served from a separate
  origin so a malicious file cannot execute in the application's context.
- Storage keys, not URLs, are stored; signed URLs are issued per request with a short expiry.
- Security headers set in `next.config.ts`: `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- Parameterised queries throughout. No string-built SQL.
- Secrets live in the platform's secret manager. `.env.example` documents every variable with no
  values.
- Dependencies are pinned, audited in CI, and updated on a schedule rather than reactively.

## 6. Personal data

| Category | Purpose | Retention |
|---|---|---|
| Account | Identify and personalise | Life of the account, then 30 days |
| Artist and rights | Evaluate, clear, and schedule submissions | Life of the relationship plus the statutory period |
| Usage | Programming decisions and aggregate reporting | 25 months identifiable, aggregated after |
| Voting | Index audience signal | 13 months |
| Diagnostics | Reliability | 90 days, IP truncated |
| Playout and cue sheets | Performance-rights and contractual reporting | The statutory and contractual period |

Deleting an account removes personal data. Airtime logs, cue sheets, and rights records survive
because licensing and reporting obligations require them, and that distinction is stated plainly in
the privacy page rather than buried.

## 7. Consent

Explicit and unbundled. Nothing pre-checked. No "by continuing you agree". Email uses double
opt-in, and consent is recorded with a timestamp and a source. Non-essential analytics and
advertising cookies are off until enabled, and declining does not degrade the service.

## 8. Children

Not directed to children under 13. No knowing collection of their personal information. No
behavioural profile built on a minor. Where a platform requires a child-directed designation, the
surface is served without personalised advertising.

## 9. Advertising privacy

Contextual and geographic by default — by franchise, city bureau, daypart, or content
classification. No targeting on sensitive personal categories. Restricted categories carry an age
gate that the placement must be able to demonstrate, not merely assert.

## 10. Incident response

| Severity | Definition | Response |
|---|---|---|
| P1 | Air down, data breach, unauthorized publication | Immediate page, 15-minute acknowledgement, incident commander |
| P2 | Degraded feed, delivery failure, rights lapse in force | 1-hour acknowledgement |
| P3 | Non-blocking failure | Next business day |

Every P1 and P2 gets a written post-incident review within five business days, published internally,
covering what happened, what the impact was, and what changes. Breach notification follows the
statutory timeline in each affected jurisdiction.

## 11. Compliance dependencies

Requiring professional review before launch: privacy policy and processor register (privacy
counsel); broadcast obligations including captions, ratings, political file, and EAS (broadcast
counsel); music licensing (music-licensing professionals); advertising standards for restricted
categories (advertising counsel); accessibility conformance (an independent audit against WCAG 2.2
AA).

## 12. What this build does not have

No identity provider, no database, no RLS enforcement, no MFA, no secret manager, no security audit,
and no penetration test. The controls above are the design and, where they are expressed as code —
permission checks, rate limiting, validation, the rights gate, the schema constraints — they are
real. Everything else is specification, and none of it should be described as implemented.
