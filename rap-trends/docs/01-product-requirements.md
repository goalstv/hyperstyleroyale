# RAP TRENDS — Product Requirements Document

**Working name:** RAP TRENDS
**Tagline:** Hip-Hop Is Happening Now.
**Positioning line:** The Real-Time Network for Hip-Hop Culture.
**Status:** Demonstration build. No carriage, distribution, licensing, or partnership agreement exists.

---

## 1. The problem

Hip-hop is the most commercially significant genre in American music and it has no dedicated,
editorially credible television network. The channels that built the format — MTV, BET, Rap City,
106 & Park, The Box, and terrestrial urban radio — worked because people with taste programmed them
and audiences trusted what they saw. Two things eroded that: those channels never had a way to see
what was happening in real time, and the countdowns stopped meaning anything once placement became
purchasable.

Meanwhile the economics inverted. Independent artists now build careers without a label, and the
information they need — what is moving, who is breaking, how ownership and distribution actually
work — is scattered across social posts, paywalled trade press, and platform dashboards that only
show them their own numbers.

## 2. What we are building

A hip-hop television, radio, and digital media network with a real-time intelligence layer
underneath it. Seven products, one operation:

1. A 24/7 linear television channel
2. A FAST and connected-TV channel
3. An over-the-air network distributed through partnerships with FCC-licensed local stations
4. A digital radio station and syndicated terrestrial-radio property
5. A website, mobile experience, and connected-TV application
6. A real-time intelligence platform — the RAP TRENDS Index
7. A promotional and distribution platform for independent and established artists

All seven are programmed from one newsroom and one origination system: **RAP TRENDS OS**.

## 3. What we are explicitly not building

Stated here because these boundaries shape the architecture, not because they are disclaimers.

- **Not a distribution guarantee.** Software does not secure cable carriage, a FAST slot, spectrum,
  or an FCC licence. Every distribution surface in the product states its real status.
- **Not a music service.** No downloads, no hosting of unlicensed recordings, no rebroadcasting of
  another party's feed.
- **Not a scraper.** No collection that violates a platform's terms of service. A signal we are not
  licensed to read contributes nothing and lowers the published confidence figure instead.
- **Not pay-to-play.** Chart position and editorial coverage cannot be purchased under any plan,
  sponsorship, or advertising relationship.

## 4. Audience

**Primary.** Hip-hop fans 18–44. Music discovery audiences. Independent artists. DJs, producers,
managers, labels, and promoters. Culture-conscious consumers. Advertisers seeking culturally
influential audiences.

**Secondary.** Cable and FAST distribution executives. Local television broadcasters. Radio station
groups. Brand partners. Record labels. Music publishers. Concert and festival operators.

The secondary audience matters more than it usually would: this product has to be credible to a
station group's engineering department and to a platform's content acquisition team, not only to a
fan. That requirement drives the technical specification pages, the honest distribution status
reporting, and the published methodology.

## 5. The questions the product must answer immediately

The homepage is designed around these, in this order:

| Question | Where it is answered |
|---|---|
| What is happening in hip-hop right now? | Ticker, Live Now, Breaking |
| Who is breaking next? | NEXT UP |
| What should I watch? | Live TV, Shows, Video library |
| What should I listen to? | Live Radio, The Drop |
| What is happening in my city? | City Reports |
| How can I submit my music? | Submission portal |
| How can my station carry RAP TRENDS? | Distribution partners |
| How can my brand advertise? | Advertise |

## 6. Content franchises

Twelve franchises. Eight are in the launch slate; four follow in later phases.

| # | Franchise | Format | Phase |
|---|---|---|---|
| 1 | RAP TRENDS LIVE | Daily flagship, 60 min, live | 1 |
| 2 | TRENDING 10 | Daily countdown, 30 min | 1 |
| 3 | NEXT UP | Weekly emerging artists, 30 min | 1 |
| 4 | BARS | Freestyles, cyphers, writing conversations | 1 |
| 5 | THE BUSINESS | Ownership, publishing, touring, wealth | 1 |
| 6 | CITY REPORT | Thirteen bureaus in rotation | 1 |
| 7 | RAP TRENDS RADIO | Continuous audio service | 1 |
| 8 | THE DROP | New releases and listening sessions | 1 |
| 9 | ARCHIVE | Classic interviews, documentaries, histories | 3 — blocked on chain-of-title clearance |
| 10 | CULTURE MARKET | Fashion, sneakers, nightlife, sport, gaming | 3 |
| 11 | RAP TRENDS SESSIONS | Original live performance production | 1 |
| 12 | RAP TRENDS AWARDS | Annual, data-informed | 4 |

## 7. Functional requirements

### 7.1 Public website

Homepage, Live TV, Live Radio, Trending chart, Index methodology, artist profiles, video library,
shows and schedule, city pages, news and editorial, independent artist submission portal, advertise,
distribution partners (with FAST, cable, OTA, and radio pitch pages), press, newsletter
registration, membership and account system, editorial standards, rights and compliance, privacy.

Persistent WATCH LIVE and LISTEN LIVE controls on every page. A real-time ticker carrying new
releases, breaking stories, chart movement, live show status, upcoming premieres, and concert
announcements.

### 7.2 RAP TRENDS OS

Content ingestion, rights and licensing records, programme scheduling, EPG management, playlist
creation, live-event switching, graphics templates, lower thirds, bugs, tickers and alerts,
closed-caption management, ad inventory, sponsor campaigns, affiliate management, distribution
endpoints, regional blackouts, content expiration, music cue sheets, royalty reports, performance
analytics, Index source management, editorial approvals, emergency broadcast override, and system
health monitoring — all under role-based permissions.

### 7.3 Artist portal

Verified profiles; submission of songs, videos, interviews, and EPKs; explicit and clean version
identification; ownership and rights documentation; territories and licence windows; publishing,
label, ISRC, ISWC, UPC, PRO, and contact information; editorial status tracking; verified airtime
and performance reporting; clearly labelled promotional products; NEXT UP applications; and
responses to interview and performance invitations.

### 7.4 Affiliate portal

Network review, pitch materials, carriage requests, package selection, schedules and metadata,
distribution feeds, promotional assets, local advertising insertion reporting, technical
specifications, contract and market exclusivity management, approved local segment insertion, and
access to clean and explicit feeds where appropriate.

### 7.5 Sales and advertising

National advertising, local affiliate avails, programme sponsorships, branded content, artist
promotion, concert promotion, shoppable television, QR codes, interactive overlays, dynamic ad
insertion, contextual and geographic targeting, frequency controls, campaign reporting, and
advertiser-safe content classifications — with restricted-category safeguards enforced in software.

## 8. Non-functional requirements

| Area | Requirement |
|---|---|
| Accessibility | WCAG 2.2 AA. Captions on every programme, human-reviewed. Keyboard operable throughout. Reduced-motion honoured. |
| Performance | LCP under 2.5s on 4G. Interaction latency under 200ms. Television-screen readable at 10 feet. |
| Responsiveness | Mobile-first, scaling to television. No horizontal page scroll at any width. |
| Availability | 99.9% for the linear feed, with redundant encoders and automatic slate failover. |
| Data honesty | Demonstration data is never presented as verified live data. Every API response carries `dataMode`. |
| Security | Role-based access on every route, action, and API call. Rate-limited public write endpoints. |
| Observability | Structured logging, health rollup at `/api/health` returning 503 while any check fails. |

## 9. Success criteria

**Phase 1.** A working digital network: site, radio, six to eight hours of daily video repeating as
a 24/7 channel, the chart, submissions, the editorial console, and social distribution.

**Phase 2.** A FAST channel a platform would actually accept: standards-compliant markers, accurate
EPG, clean feed, and an ad policy.

**Phase 3.** A radio affiliate feed a programme director would put on air.

**Phase 4.** One OTA pilot in an influential market, with a licensed station partner.

**Phase 5.** A national affiliate sales operation and negotiated carriage.

## 10. Open dependencies

Nothing below can be solved by writing more software.

- Master recording, publishing, public-performance, and digital-performance licences
- Music-video exhibition rights for anything not network-produced
- A cloud playout vendor
- FAST platform and aggregator agreements
- A licensed station partner for the OTA pilot
- Radio affiliate agreements and a delivery vendor
- Nielsen or comparable measurement, where carriage justifies it
- Qualified broadcast counsel and music-licensing professionals to review and approve the operating
  model before any transmission, carriage, or public performance
