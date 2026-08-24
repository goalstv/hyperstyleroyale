# RAP TRENDS — Distribution Architecture

One master programming operation producing many feeds.

```
                     ┌────────────────────────────────┐
                     │   RAP TRENDS OS                │
                     │   schedule · rights · graphics │
                     └───────────────┬────────────────┘
                                     │ validated playlist
                     ┌───────────────▼────────────────┐
                     │   Cloud playout (vendor)       │
                     │   primary + hot standby        │
                     └───────────────┬────────────────┘
                                     │
        ┌──────────────┬─────────────┼─────────────┬──────────────┐
        ▼              ▼             ▼             ▼              ▼
   Clean feed     Explicit feed   Contribution   Radio clean   Social /
   (broadcast,    (owned digital  (cable, OTA)   (affiliates)  VOD packages
    FAST, CTV)     only, late)
```

## 1. Feed variants

| Variant | Where it goes | Rule |
|---|---|---|
| Clean | FAST, CTV, cable, vMVPD, OTA, radio affiliates | The default. Always available |
| Explicit | Owned web and applications only, late and overnight only | The scheduler rejects explicit content in any other daypart |
| Radio clean | Radio affiliates | Legal-ID window, cue tones, local commercial windows |
| Contribution | Cable, OTA | Broadcast-grade, redundant paths, 608/708 captions |

## 2. FAST and connected TV

**Ready today:** 24/7 linear HLS (CMAF, H.264/AAC, six renditions to 1080p), SCTE-35 markers on
every break, XMLTV and JSON EPG seven days forward, VAST 4.2 and VMAP compatibility, per-programme
ratings, WebVTT captions, VOD library, and start-over and catch-up where rights permit.

**Break structure**, so ad load is predictable and breaks land where a platform expects them:

- Half-hour: programme 25:30 · break 2:30 · promo 1:00 · break 1:00
- Hour: programme 52:00 · break 4:00 · promo 1:00 · break 3:00

**Platform targets:** Roku, Fire TV, Apple TV, Android TV, Samsung, LG, web. Each has its own
schedule and ad policy requirements; the EPG endpoint takes a channel parameter and the ad policy is
per endpoint.

**Not resolved:** no agreement with any platform or aggregator; no playout vendor contracted; ad
representation on platform-sold inventory undecided.

## 3. Cable and virtual MVPD

**Specification:** redundant IP contribution with diverse routing, 1080i/59.94 or 1080p/59.94,
broadcast-legal levels, stereo at −24 LKFS with CALM compliance, CEA-608/708 captions carried without
re-encode, V-chip ratings in ancillary data, SCTE-35/104 cue insertion, seven-day EPG metadata, and
8–12 minutes per hour of insertable local avails.

**Not resolved:** no carriage agreement with any operator; subscriber or licence fees are unproven
at this stage and are not assumed in the business model; measurement obtained only where carriage
justifies it.

## 4. Over-the-air

**The honest version.** RAP TRENDS holds no spectrum and no FCC licence. A software platform cannot
transmit over the air. OTA distribution happens only through a partnership with an existing licensed
station — a subchannel, a daypart block, or syndicated programming inside the station's schedule.
The partner brings the licence, the transmitter, and the market. We bring programming, a national
sales operation, and a compliant feed.

**Pilot shape.** One influential market — Atlanta, New York, Los Angeles, Miami, or Houston. Twelve
months, market exclusivity, barter terms, and a local sales arrangement giving the station insertable
inventory every hour. Test local advertising, live events, interactive voting, and market-specific
content.

**Technical:** ATSC 1.0 compatible, clean feed only, secure IP or satellite delivery, CEA-608/708
captions, V-chip ratings, top-of-hour clock accommodating station and legal ID, full station
override retained.

**ATSC 3.0 roadmap:** broadband-connected interactive components — artist voting feeding the Index,
sponsor offers, and commerce alongside the broadcast. Datacasting and mobile reception are tracked as
later-stage opportunities, not launch claims. Delivery depends on the partner station's NEXTGEN TV
deployment.

**Station-side obligations** — political file, EEO, children's programming, EAS — remain the
licensee's, and the programming agreement must say so explicitly.

## 5. Radio

**Digital:** 24/7 internet stream (AAC 128k, HLS and Icecast), now-playing metadata, album art and
programme information, mobile and automotive-compatible listening, and podcast and on-demand
versions with transcripts.

**Affiliate:** clean 24/7 feed, secure IP delivery (satellite by agreement), automation-compatible
metadata, standard cue tones at every local window, a reserved top-of-hour legal-ID window, 12
minutes per hour of local availability, and full station override and EAS capability retained.

**Syndicated formats:**

| Format | Length | Cadence | Delivery |
|---|---|---|---|
| RAP TRENDS Update | 60s | Hourly, 24/7 | :50 past each hour |
| RAP TRENDS Report | 5:00 | Hourly in dayparts | :45 past each hour |
| TRENDING 10 Countdown | 58:00 | Daily | 04:00 ET for same-day use |
| Weekend Countdown | 2 hours | Weekly | Thursdays 12:00 ET |
| NEXT UP Spotlight | 10:00 | Weekly | Wednesdays 12:00 ET |
| Music Business Minute | 90s | Weekdays | 05:00 ET |
| Station-branded custom | Variable | By agreement | By agreement |

**Roadmap:** RadioDNS-compatible hybrid-radio metadata for receivers and automotive dashboards.

**Not resolved:** no affiliate agreement in any market; no delivery vendor selected; no satellite
transponder arrangement; music licensing for a syndicated service requires executed master,
publishing, and public-performance agreements.

## 6. VOD and social

Individual video publishing, series and episode packages, platform-specific metadata and artwork
variants, captions, trailers, social clips, scheduled releases, territory restrictions, content
replacement, takedowns, delivery confirmations, and error reporting — all in the distribution
control centre, all gated on rights eligibility per destination.

The demonstration data includes a live failure: the social clip endpoint is red because a source
asset has no rights record. That is the correct behaviour and the reason the gate exists.

## 7. Affiliate packages

| Package | Type | Hours/week | Local avails/hr | Terms |
|---|---|---|---|---|
| Full-Time Carriage | TV & radio | 168 | 8 | Barter, market exclusivity |
| Daypart Block | TV | 21–42 | 10 | Barter, daypart exclusivity |
| Program Syndication | Radio | 2–10 | 12 | Barter, programme exclusivity |

All barter in year one: inventory split, no cash licence fee. A new network asking for cash from
stations it has not yet delivered an audience to is asking to be turned down.

## 8. Build versus integrate

**RAP TRENDS OS builds:** editorial CMS, Drive workflow, media catalogue, rights metadata and gate,
programming calendar and validation, distribution dashboard, user management, analytics aggregation,
approval workflows.

**Integrated behind adapters:** cloud playout, broadcast encoding, server-side ad insertion,
broadcast contribution, FAST delivery, cable headend delivery, OTA transmission, audience
measurement, music-rights reporting.

The system is the command centre even when a vendor performs the delivery. That separation is why a
vendor change is a configuration exercise rather than a rebuild.

## 9. Monitoring

Every endpoint reports destination, feed or package, current status, scheduled delivery, last
successful delivery, errors, territory, rights eligibility, technical format, performance, revenue,
and the responsible team member. Failures raise alerts. `/api/health` returns 503 while any check
fails.
