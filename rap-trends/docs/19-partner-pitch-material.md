# RAP TRENDS — Partner Pitch Material

Source material for the four live pitch pages: `/partners/fast`, `/partners/cable`, `/partners/ota`,
and `/partners/radio`. Each page states its open items as plainly as its capabilities, because a
platform's acquisition team or a station's engineer will find the gaps anyway and finding them in our
own document is worth more than finding them later.

---

## FAST and connected TV

**Phase 2 · Status: in discussion, no agreement in place.**

### The argument

FAST catalogues are deep in film and shallow in music, and the music channels that exist are largely
automated video jukeboxes with no editorial voice. RAP TRENDS is a programmed network — a daily
flagship, a daily countdown, original performance production, thirteen city bureaus — which is what
produces session length rather than a two-minute sample.

Every hour is programme, break, promo, break, so ad load is predictable and breaks land where a
platform expects them.

### Specification

| Item | Value |
|---|---|
| Feed | 24/7 linear HLS (CMAF), H.264/AAC; HEVC on request |
| Renditions | 6, 480p–1080p, 8.4 Mb/s top |
| Ad markers | SCTE-35 in-band |
| Break structure | 150s + 60s promo + 60s per half hour |
| Ad standards | VAST 4.2, VMAP, SSAI ready |
| EPG | XMLTV and JSON, 7 days forward — `GET /api/epg?format=xmltv` |
| Captions | WebVTT on HLS, 608/708 on contribution, human-reviewed |
| Ratings | Per-programme; TV-MA late only |
| Redundancy | Primary + hot standby, automatic slate failover |
| VOD | Episode library, start-over and catch-up where rights permit |
| Territory | US at launch; international via channel licensing |

### Open items

No agreement with any platform or aggregator. No playout vendor contracted. Ad representation on
platform-sold inventory undecided. Music licensing for a public linear feed requires executed
master, publishing, and public-performance agreements.

---

## Cable and virtual MVPD

**Phase 5 · Status: prospect, requires negotiated carriage.**

### The argument

Hip-hop has no dedicated linear channel, and the audience that supports it is the demographic
operators lose fastest. RAP TRENDS is programmed as a news-and-music network rather than a jukebox,
which is what produces appointment viewing and, with it, carriage value.

Compliance is handled as engineering rather than paperwork: captions on every programme
human-reviewed before air, ratings with V-chip signalling, a restricted-advertising policy enforced
in software, and an emergency override path in master control.

### Specification

| Item | Value |
|---|---|
| Contribution | Redundant IP, primary and backup, diverse routing |
| Video | 1080i/59.94 or 1080p/59.94, broadcast-legal |
| Audio | Stereo, −24 LKFS, CALM compliant |
| Captions | CEA-608/708, carried without re-encode |
| Ratings | V-chip, per programme, in ancillary data |
| Ad signalling | SCTE-35 / SCTE-104 at every break |
| EPG | 7 days forward, standard interchange |
| Local avails | 8–12 minutes per hour |
| Feed | Clean only |

### Open items

No carriage agreement with any operator or vMVPD. Subscriber and licence fees are unproven at this
stage and are not assumed in the business model. Measurement obtained only where carriage justifies
it. Music licensing for MVPD carriage requires separately negotiated public-performance and
exhibition rights. Broadcast counsel must review the model before execution.

---

## Over-the-air

**Phase 4 · Status: pilot sought, requires a licensed station partner.**

### The honest version

RAP TRENDS holds no spectrum and no FCC licence. A software platform cannot transmit over the air.
Spectrum is licensed, licences are held by station owners, and the FCC regulates what happens on
them.

What we bring: programming, a national sales operation, and an origination system that produces a
compliant feed. What the partner brings: the licence, the transmitter, and the market. Any claim
beyond that would be misleading and we will not make it.

### Pilot shape

One influential market — Atlanta, New York, Los Angeles, Miami, or Houston. A subchannel or fixed
daypart block. Twelve months, market exclusivity, barter terms, and a local sales arrangement giving
the station insertable inventory every hour. Test local advertising, live events, interactive
voting, and market-specific content, and publish what we learn.

### Specification

| Item | Value |
|---|---|
| Transmission | ATSC 1.0 compatible; ATSC 3.0 experience prepared |
| Feed | Clean only — explicit audio never rides a broadcast feed |
| Delivery | Secure IP or satellite, station's preference |
| Captions | CEA-608/708, human-reviewed |
| Ratings | V-chip on every programme |
| Local insertion | 8–12 min/hour plus local segment windows |
| Identification | Top-of-hour clock accommodates station and legal ID |
| Emergency | Station retains full override |
| Reporting | Monthly affidavits through the affiliate portal |

### Open items

No station partnership in any market. No FCC licence and no spectrum, and we will not represent
otherwise. Station-side obligations — political file, EEO, children's programming, EAS — remain the
licensee's and the agreement must say so. Broadcast counsel must approve the programming agreement
and the advertising policy. ATSC 3.0 interactive components depend on the partner's NEXTGEN TV
timeline.

---

## Radio syndication

**Phase 3 · Status: building the affiliate feed, first markets sought.**

### The argument

Content a station cannot produce and cannot buy elsewhere: a newsroom covering the format daily,
artist interviews, a chart with a published method, and an emerging-artist franchise. Delivered
clean, automation-ready, with cue tones, legal-ID windows, and local commercial availability every
hour. The network retains one national unit per quarter-hour on syndicated programmes; everything
else is the station's to sell.

Timings are built for a real clock: updates at :50, reports at :45, the countdown delivered at 04:00
ET for same-day use, the weekend countdown Thursday at noon so a programme director has time to
place it.

### Specification

| Item | Value |
|---|---|
| Feed | Clean 24/7, secure IP; satellite by agreement |
| Codec | AAC 128 kb/s stereo |
| Loudness | Broadcast-normalized across programme and music |
| Metadata | Now-playing, artist, title, programme, artwork; automation-compatible |
| Cue tones | Standard, at every local window |
| Legal ID | Top-of-hour window reserved |
| Emergency | Station retains full override and EAS |
| Local avails | 12 minutes/hour on syndicated programmes |
| On-demand | Podcast versions with transcripts and chapters |
| Reporting | Weekly affidavits; cue sheets for performance-rights reporting |

### Programmes

| Format | Length | Cadence | Delivery |
|---|---|---|---|
| RAP TRENDS Update | 60s | Hourly, 24/7 | :50 past |
| RAP TRENDS Report | 5:00 | Hourly in dayparts | :45 past |
| TRENDING 10 Countdown | 58:00 | Daily | 04:00 ET |
| Weekend Countdown | 2 hours | Weekly | Thursdays 12:00 ET |
| NEXT UP Spotlight | 10:00 | Weekly | Wednesdays 12:00 ET |
| Music Business Minute | 90s | Weekdays | 05:00 ET |
| Station-branded custom | Variable | By agreement | By agreement |

### Open items

No affiliate agreement in any market. No delivery vendor selected. Music licensing for a syndicated
service requires executed master, publishing, and public-performance agreements. Satellite delivery
requires an uncontracted transponder arrangement.

---

## The line we hold in every pitch

No conversation implies that carriage is secured, that a platform has agreed, that spectrum is
available, or that a licence exists. An enquiry is an enquiry; the `/api/carriage` response says so
in writing, and the pitch pages say so above the fold.

A station group that discovers an overstatement during due diligence does not come back. Stating the
gaps first is not modesty — it is the only version of this pitch that survives contact with a
compliance department.
