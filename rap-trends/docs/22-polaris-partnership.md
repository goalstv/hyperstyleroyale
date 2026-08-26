# RAP TRENDS × POLARIS — partnership model and platform requirements

This document reconciles the POLARIS deck (*From the Group Chat to the Airwaves*, 16 slides,
ATSC 3.0 hybrid network, NYC Tri-State) with the RAP TRENDS platform build.

## The structure

**RAP TRENDS is the platform. POLARIS is the content.** They are separately owned and the
software must reflect that, not blur it.

| | RAP TRENDS | POLARIS |
|---|---|---|
| Owns | The network, the platform, RAP TRENDS OS, the Index, the distribution stack, raptrends.com | The newsroom, the on-air talent brand, the shows, the reporting |
| Supplies | Origination, playout, scheduling, rights enforcement, ad decisioning, measurement, publishing | Editorial, hosts, franchises, live programming, the daily grid |
| Byline | The network masthead | Every filed article and every programming block POLARIS produces |

Everything POLARIS produces runs **on** RAP TRENDS. Nothing in the product should imply RAP
TRENDS produces POLARIS's journalism, or that POLARIS owns the distribution.

Practically, that means the platform needs a first-class notion of a **content partner**: a
producing entity with its own brand, its own byline, its own programming blocks and its own
rights posture, whose output is scheduled and delivered by the network. POLARIS is the first
one. It should not be hardcoded as the only one.

## What the deck asks the platform to support

The deck is a distribution thesis. Stripped to capabilities, it asks for eight things.

### 1. One signal, several outputs

A single origination chain feeding, simultaneously:

- **Linear TV** — FAST channel plus an over-the-air simulcast
- **Radio** — a 24/7 audio-first service carried as an audio subchannel rather than on FM
- **Live** — an event-driven pop-up channel that lights up for a festival or a broadcast night
- **Data** — an interactive/datacasting layer riding the same broadcast signal

RAP TRENDS already models channels, schedules, playout and an EPG. What it does not yet model
is **subchannels off one spectrum allocation** and a **channel whose lifecycle is event-scoped**
rather than continuous. Both belong in the distribution model.

### 2. ATSC 3.0 (NextGen TV) as the broadcast path

Ingest to encode to multiplex, then split into video, audio and data streams and emit to OTA,
FAST and IP. The platform needs to represent the multiplex, the bandwidth allocated to each
subchannel, and the fact that video, audio and data compete for one pipe. Bandwidth allocation
is the scarce resource in this architecture and the OS should show it.

### 3. A 24-hour grid, produced by the partner

The deck's dayparts, which are POLARIS-produced blocks:

| Daypart | Block |
|---|---|
| 6AM–10AM | Top Of Da AM — the culture report: trending news, social, sports |
| 10AM–2PM | Midday Mix — music and culture commentary, interviews |
| 2PM–6PM | The Ride Out — commute energy: DJ sets, throwbacks, new drops |
| 6PM–10PM | Prime Culture — long-form shows, weekly specials, live conversations |
| 10PM–2AM | The Function — live DJ sets, event feeds |
| 2AM–6AM | After Hours — deep cuts, underground |

These sit alongside the network's own franchises. The schedule validator already enforces
coverage, gaps, overlaps, rights windows and explicit-content dayparts; a partner-produced block
is validated the same way as an owned one. `The Function` and `After Hours` are the dayparts
where explicit-content rules actually bite, and the validator should be exercised against them.

### 4. Addressable advertising over broadcast

ATSC 3.0's IP return path allows household-level targeting and dynamic ad insertion. This is the
deck's strongest revenue claim and the platform's largest privacy obligation. If the network
knows device ID, postcode and viewing behaviour, that is regulated personal data. The ad
decisioning path must carry consent state, an opt-out, a retention limit and a record of what
segment a household was placed in — and the existing ad-safety rules (alcohol, cannabis,
gambling, political, pharma, by daypart and territory) must run **after** targeting, not before.
Precision targeting makes category rules more important, not less.

### 5. Six revenue streams

OTA advertising; FAST and programmatic; audio monetisation; spectrum and datacasting; live event
integration; brand sponsorship. The monetisation model already separates paid promotion from
editorial and charts. That separation has to survive all six: a sponsored programming block is
still labelled, and a datacasting customer buys bandwidth, not chart position.

### 6. A phased launch

Quiet launch (0–90 days), cultural activation (90–180 days), scale (6–12 months). This maps onto
the existing MVP roadmap rather than replacing it.

### 7. An audience and market thesis

Gen Z and Millennial culture-first consumers, a Tri-State addressable base, and a segment mix
weighted to music, sports and lifestyle, Latino and Caribbean diaspora, and event-goers.

### 8. A decision register

The deck's final ask is four unresolved questions — bandwidth allocation, ATSC 3.0 versus 1.0,
receiver strategy, and a unified sales story. These are the right things to track in the product
as open decisions with owners, not to answer on a slide.

## What must be corrected before any of this is published

The deck is an internal pitch and reads like one. Three things in it cannot ship to a public
site as written.

**1. The station partnership is named as though it exists.** The deck's footer reads "Powered by
Channel 10 / WWOR-TV Spectrum Partner". WWOR is a real, licensed station owned by a real
company. Naming it as a spectrum partner asserts a carriage relationship. Unless that agreement
is signed, it is exactly the fabricated partnership the operating brief rules out, and it is the
kind of claim that draws a letter rather than a correction.

Until an agreement exists, the platform names no station. It models an **affiliate slot** — a
licensed partner station, unnamed, with the terms that would need to be agreed. The affiliate
acquisition strategy already works this way and the deck's content should be folded into it.

**2. "Radio without a license" is not accurate as stated.** An audio subchannel carried on a
television station's ATSC 3.0 multiplex does not require a *separate FM broadcast licence* —
that part is true, and it is a genuine strategic insight. But the signal rides a station that
holds an FCC television licence, subject to that licensee's obligations and control. The honest
framing is: no separate radio licence is required because the audio is carried on a licensed
partner's television spectrum. The platform should say that, and should carry the standing
disclosure that qualified broadcast counsel must approve the operating model before launch.
Music licensing is a separate obligation that this architecture does not avoid at all —
performance rights are owed on the audio service regardless of how it is transmitted.

**3. Every figure in the deck is unsourced.** Market size, household counts, audience splits,
CPM ranges, revenue multiples, the competitor comparison table. Some are plausible; none carry a
citation. On a public site they would be fabricated statistics, and the comparison table makes
factual assertions about named competitors.

They can be published only as a clearly marked **planning model with stated assumptions** —
every figure labelled as an assumption, with the source named where one exists and marked
`unsourced` where it does not. The competitor table becomes a statement of what RAP TRENDS
intends to offer, not a set of claims about what Pluto, Tubi or iHeart do or do not do.

## Standing disclosures this material inherits

Nothing here changes the constraints the platform already operates under:

- No FCC licence is held and no carriage agreement exists in any market.
- Distribution is never implied to be guaranteed.
- Software does not secure spectrum, carriage, or a licence.
- Qualified broadcast counsel and music-licensing professionals must approve the final operating
  model.

## What has been built on the product surface

Recorded here so the plan and the implementation do not drift apart.

| Capability | Where it lives | Commit |
|---|---|---|
| Content-partner model, POLARIS as the first record | `src/data/partners.ts`, `/partners/polaris` | `434be391` |
| Four-service ATSC 3.0 multiplex | `src/data/distribution.ts`, `/distribution`, `/os/distribution` | `434be391` |
| Bandwidth allocation arithmetic | `src/lib/multiplex.ts` + `src/lib/multiplex.test.ts` | `434be391` |
| Event-scoped LIVE channel | `SubchannelLifecycle`, `canLight`, `setLifecycle` | `434be391` |
| The six POLARIS dayparts | `src/data/programming-blocks.ts`, `/schedule` | `434be391` |
| Corrected radio-licensing language, unnamed affiliate slot | `/partners/ota`, `/partners/radio` | `434be391` |

`allocateMultiplex` is the piece worth knowing about. It sums only the subchannels in a
consuming lifecycle, compares in whole kbps so a 0.1 Mbps overrun reports as an overrun rather
than a rounding artefact, and returns the bandwidth held by dark services separately as
`reclaimableMbps`. `canLight` answers whether the event channel fits before anyone lights it.
Seven tests cover under, exactly at, and over capacity, a dark service releasing its bitrate, an
ended service doing the same, an invalid bitrate, and the fit check.

The daypart grid runs through the existing `validateSchedule` rather than a parallel path, and
`/schedule` publishes the validation report — failures included. Tuning the data until the
validator goes quiet would defeat the point of having one.

**Note on the test runner.** `vitest` was not in the Lovable project's `package.json` until
`434be391`. Any earlier pass that reported a passing suite there was not running one. The tests
in this repo were always real; the product surface only acquired a runner at that commit.
