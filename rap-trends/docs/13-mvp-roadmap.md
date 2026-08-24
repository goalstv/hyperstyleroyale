# RAP TRENDS — MVP Roadmap

Five phases. Each has an exit criterion that is a fact, not a feeling.

---

## Phase 1 — Digital proof of concept
**Target: months 0–6. Exit: the network exists and people use it daily.**

| Workstream | Deliverable |
|---|---|
| Product | Website, artist portal, submission flow, membership accounts |
| Audio | 24/7 internet radio with hourly reports and the daily countdown |
| Video | 6–8 hours of daily original programming, repeating as a 24/7 channel |
| Data | The Index live with connected sources; TRENDING 10 published daily |
| Editorial | RAP TRENDS OS newsroom, Drive ingestion, approval workflow |
| Distribution | YouTube and social; email and push |

**Blocking dependencies:** master, publishing, and digital-performance licences for the radio
service. Index source agreements. Editorial hires. Studio capacity.

**Exit criteria:** the linear loop runs 30 days without unplanned dead air; the chart publishes daily
with mean confidence above 0.75; 500 artist submissions received; the newsroom ships five days a
week.

---

## Phase 2 — FAST launch
**Target: months 6–12. Exit: the channel is live on at least one FAST platform.**

| Workstream | Deliverable |
|---|---|
| Origination | Cloud playout with redundant encoders and slate failover |
| Metadata | Seven-day EPG in XMLTV and JSON |
| Advertising | SCTE-35 markers, SSAI integration, VAST 4.2 and VMAP, the campaign system |
| Applications | Roku, Fire TV, Apple TV, Android TV, Samsung, LG, web |
| Business | Distribution conversations with aggregators and platforms |

**Blocking dependencies:** a playout vendor. Public-performance and music-video exhibition rights for
a linear feed. Platform certification. An ad-sales operation or a representation agreement.

**Exit criteria:** carriage on one platform; certification passed on three CTV platforms; SSAI
delivering with a fill rate worth reporting; EPG accurate seven days out for 30 consecutive days.

---

## Phase 3 — Radio syndication
**Target: months 12–18. Exit: RAP TRENDS is on air on stations we do not own.**

| Workstream | Deliverable |
|---|---|
| Feed | Clean 24/7 affiliate feed with cue tones and legal-ID windows |
| Programmes | Hourly reports, daily countdown, weekend countdown, NEXT UP spotlight, business minute |
| Portal | Affiliate portal with schedules, assets, specs, and insertion reporting |
| Business | First market partnerships |

**Blocking dependencies:** a delivery vendor. Public-performance licences for syndication. Affiliate
agreements. Cue-sheet reporting to PROs.

**Exit criteria:** three stations carrying at least one programme; the weekend countdown cleared in
five markets; affidavit reporting running for a full quarter.

---

## Phase 4 — OTA pilot
**Target: months 18–30. Exit: RAP TRENDS is on a television in one market, over the air.**

| Workstream | Deliverable |
|---|---|
| Partnership | A subchannel or daypart agreement with an FCC-licensed station |
| Market | Atlanta, New York, Los Angeles, Miami, or Houston |
| Local | Market-specific segments, local advertising, live events |
| Interactive | Voting, sponsor offers, and commerce on the ATSC 3.0 roadmap |

**Blocking dependencies:** a licensed station partner. Broadcast counsel approval of the programming
agreement. Clean-feed compliance. Local sales capacity.

**Exit criteria:** twelve months on air; local advertising covering the incremental cost; a
published account of what the market actually did.

---

## Phase 5 — Cable and national expansion
**Target: months 30–48. Exit: negotiated carriage beyond the pilot.**

| Workstream | Deliverable |
|---|---|
| Measurement | Nielsen-compatible measurement where commercially appropriate |
| Sales | A national affiliate sales operation |
| Carriage | Cable, vMVPD, and station-group negotiation |
| Regional | Market-specific feeds and local advertising |
| International | Channel licensing by territory |

**Blocking dependencies:** demonstrated audience. Carriage negotiation. Capital for a national sales
operation. Measurement contracts.

**Exit criteria:** carriage in ten markets or one meaningful operator agreement; a national sales
team booking against measured audience.

---

## Sequencing logic

Radio before OTA because a radio affiliate agreement is a conversation with a programme director,
while an OTA partnership is a conversation with a general manager who wants to see an audience
first. FAST before both because it is the only distribution a new network can obtain without
someone's permission being contingent on prior success.

Every phase produces evidence for the next. The pattern is deliberate: the pitch to a station group
in Phase 4 is a FAST audience and a radio track record, not a slide deck.

## What is built today

| Area | Status |
|---|---|
| Domain layer — Index, rights, schedule, ad safety, workflow | Built, 155 tests |
| Public website | Built |
| RAP TRENDS OS | Built against the demo adapter |
| Artist and affiliate portals | Built |
| Public API | Built |
| Persistence | Not built — demo adapter only |
| Authentication | Not built — cookie session |
| Media pipeline | Specified, not running |
| Playout | Adapter defined, no vendor |
| Streaming | Player surfaces attached to slates |

The gap between the two lists is integration work behind interfaces that already exist, plus the
commercial agreements no amount of engineering can substitute for.
