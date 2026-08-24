# RAP TRENDS — Content Rights Data Model

The rights model is the load-bearing wall of a music network. Everything else can be rebuilt; a
rights failure ends the company. This document describes what is stored, what is checked, and where
the gate refuses.

Implementation: `src/lib/rights.ts`. Schema: `docs/05-database-schema.sql`. Tests:
`tests/rights.test.ts` (21 cases).

## 1. Principle: fail closed

A missing rights record is **not cleared**. Not "probably fine", not "check later". An asset with no
row in `rights_windows` cannot be scheduled, delivered, or published on any platform, and the
scheduler, the distribution control centre, and the public video page all refuse it independently.

This is expensive. It means good programming sits unaired while paperwork is chased. That cost is
the point: the alternative is discovering the problem through a takedown notice, a PRO audit, or a
carriage partner's compliance team.

## 2. Rights types

| Right | What it covers | When it is needed |
|---|---|---|
| `master_recording` | The specific recording | Any use of a recording we did not make |
| `publishing` | The underlying composition | Every musical use, always |
| `music_video_exhibition` | Public exhibition of a video | Linear TV, FAST, cable, OTA, CTV |
| `synchronization` | Music timed to picture | YouTube, social, and any new picture-and-music combination |
| `public_performance` | Performance to the public | Broadcast, cable, radio carriage |
| `digital_performance` | Digital audio transmission | Internet radio, streaming |
| `mechanical` | Reproduction | Podcast distribution, downloads where applicable |
| `archival_footage` | Third-party archival material | ARCHIVE programming |
| `ugc_license` | Creator-granted licence | Any user-generated content used on air |

## 3. Requirements by destination

Encoded in `PLATFORM_REQUIREMENTS`. The gate checks the destination's list against `cleared`.

| Destination | Rights required |
|---|---|
| Web / iOS / Android | master, publishing, digital performance |
| Connected-TV app | master, publishing, digital performance, video exhibition |
| FAST | master, publishing, video exhibition, public performance |
| Cable / vMVPD / OTA | master, publishing, video exhibition, public performance |
| YouTube / social | master, publishing, **synchronization** |
| Podcast | master, publishing, mechanical |
| Radio affiliate | master, publishing, public performance |
| Internet radio | master, publishing, digital performance |

The synchronization requirement on YouTube and social is the one most often missed. A music video
licensed for linear exhibition is routinely *not* licensed for social posting, and posting it anyway
is how a network collects strikes. The demonstration data models this deliberately: `asset_mv_01`
clears FAST and cable but is refused on YouTube and social.

## 4. The rights window record

```
rights_windows
  asset_id                 which asset
  rights_owner             who granted it
  cleared[]                which rights actually exist — not which were requested
  platforms[]              authorized destinations
  territories[]            'WORLDWIDE' or ISO 3166-1 alpha-2
  starts_at / ends_at      the licence window; null end means open
  ad_restrictions[]        categories the licensor forbids adjacent to this asset
  talent_release_on_file   required for interviews and performances
  location_release_on_file required for location shoots
  union_terms              collective-agreement terms governing reuse
  contract_ref             the paper this row represents
```

`cleared` records what exists, never what was asked for. A row saying a right was requested is worse
than no row: it looks like clearance to anyone scanning the table.

## 5. What the gate checks, in order

1. **Record exists.** No record → blocked, and every required right is reported missing.
2. **Rights cleared.** Every right the destination requires is in `cleared`.
3. **Platform authorized.** The destination appears in `platforms`. Holding the rights is not the
   same as being licensed for that platform.
4. **Territory licensed.** `WORLDWIDE`, or the specific territory is listed.
5. **Window open.** The airing's own timestamp is inside `starts_at`–`ends_at`. A licence lapsing
   mid-schedule blocks the airings that fall outside it, not the whole day.
6. **Captions.** On a captioned platform: no captions blocks; AI-drafted captions that no human has
   reviewed also block.
7. **Clean version.** On OTA, cable, and radio affiliate: an explicit asset must link to a real
   clean variant.
8. **Quality control.** Failed QC blocks. Pending QC warns.
9. **Releases.** An interview or performance without a talent release blocks.
10. **Takedown.** An asset under an active takedown blocks everywhere.

Warnings — approaching expiry, incomplete QC — surface without blocking. Blockers block.

## 6. Advertising restrictions carried by the licence

A licensor can forbid categories adjacent to their content, independent of the network's own rules.
The demonstration `asset_perf_01` carries `ad_restrictions: ['cannabis']` because the artist
agreement excludes it. `evaluatePlacement()` refuses a cannabis campaign inside that programme even
where the campaign is otherwise fully compliant.

Two independent gates, both of which must pass: the network's category rules, and the specific
licence's restrictions.

## 7. Music cue sheets

`music_cues` records every musical use in an asset: sequence, title, performer, writers, publishers,
ISRC, ISWC, PRO, usage type, in-point, and duration. Joined against `playout_log`, this produces the
performance reporting a PRO requires — generated from what actually aired, not from what was
scheduled.

## 8. Expiry management

`expiring_rights` surfaces licences lapsing inside 60 days, ordered by urgency. The compliance
console shows them; the rights sweep flags them daily; the scheduler blocks anything already lapsed.
Renewal is a commercial conversation the system can prompt but cannot conduct.

## 9. Beyond music

| Area | Handling |
|---|---|
| Talent and location releases | Boolean on the rights row; enforced for interview and performance assets |
| Union obligations | `union_terms` records the collective agreement governing production and reuse |
| Archival footage | Not exhibited without documented chain of title — this is why RAP TRENDS CLASSICS is blocked from launch |
| User-generated content | Licensed explicitly from the creator. Public posting is never treated as a licence |
| DMCA | `takedowns` records claimant, notice, action, counter-notice, and resolution; a designated agent and repeat-infringer policy sit alongside |
| FTC disclosure | `campaign_creatives.disclosure_text`; branded content is disclosed in the content itself |
| Content ratings | Per asset, with V-chip signalling on broadcast |
| Explicit content | Confined to late and overnight dayparts on owned digital origination; never on a broadcast or radio-affiliate feed |

## 10. What must be true before launch

No amount of software substitutes for these:

- Executed master recording licences for every non-original recording
- Executed publishing agreements
- Public-performance licences appropriate to each carriage type
- Digital-performance licences for the streaming and internet-radio services
- Music-video exhibition rights for every video aired
- Synchronization licences for anything posted to YouTube or social
- A designated DMCA agent, registered
- Chain-of-title clearance on any archival material before ARCHIVE launches
- Review and approval of the whole model by qualified broadcast counsel and music-licensing
  professionals
