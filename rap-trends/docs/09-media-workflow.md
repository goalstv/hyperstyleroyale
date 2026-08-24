# RAP TRENDS — Media Workflow

From a file landing in Google Drive to a frame leaving an encoder.

## 1. Ingest

| Path | How it arrives |
|---|---|
| Google Drive | Watched `ARTICLES` and `VIDEOS` folders, swept every 5 minutes |
| Direct upload | Authenticated upload from the console or the artist portal |
| Watch folder | S3 prefix for high-volume production delivery |
| Feed | Live contribution from the field or a venue |

### Ingest specification

| Item | Requirement |
|---|---|
| Mezzanine | ProRes 422 HQ or DNxHR HQX, 1080p or 2160p |
| Container | MOV or MXF (OP1a) |
| Frame rate | 23.976, 29.97, or 59.94 — **constant**, not variable |
| Audio | 48 kHz, 24-bit, stereo or 5.1 with fold-down |
| Loudness target | −24 LKFS ±2, true peak ≤ −2 dBTP |
| Captions | SCC, SRT, or embedded 608/708 |
| Naming | `show/season/episode` or `artist/title/version` |

Variable frame rate is the most common ingest rejection and the reason the demonstration data
carries a failed transcode: phone-shot footage is VFR by default and must be re-wrapped before it
enters the ladder.

## 2. Google Drive connector

```
sweep (every 5 min)
  ├─ Drive Changes API since the stored page token
  ├─ for each changed file:
  │    ├─ hash content
  │    ├─ hash already in media_assets or drive_sync_records?
  │    │     └─ yes → status = duplicate, stop
  │    ├─ import metadata, preserve the original Drive link
  │    ├─ VIDEOS → create asset, queue preparation
  │    ├─ ARTICLES → create or match a draft
  │    ├─ transcribe; draft a transcript
  │    ├─ match articles ↔ videos on entity and title similarity
  │    ├─ suggest headline, summary, tags, SEO, captions, related artists
  │    └─ notify the appropriate editor
  └─ store the new page token
```

**Rules that are not negotiable.**

- Nothing publishes automatically. `drive_connections.auto_publish` is `false` by default; enabling
  it is an explicit act by an authorized user, recorded in the audit log.
- The original Drive link is preserved on every record. The connector is an importer, not a
  replacement for where people already work.
- AI output is stored in `ai_suggestions` as *suggestions*. Nothing is written to an article or an
  asset until an editor accepts it.
- Duplicate detection is by content hash, not by filename — `FINAL (1).docx` is the normal case, not
  the exception.
- Administrators can disconnect and reconnect a folder. Disconnecting stops detection and never
  deletes anything already imported.

**Setup required in production:** a Google Cloud project, a service account with domain-wide
delegation (or a per-user OAuth grant), the Drive API enabled, and the folder ids in
`GOOGLE_DRIVE_ARTICLES_FOLDER_ID` and `GOOGLE_DRIVE_VIDEOS_FOLDER_ID`.

## 3. Preparation pipeline

Twelve steps, run as queued jobs. Each is idempotent and keyed on the asset and step, so a retry is
free and a partial failure resumes rather than restarting.

| # | Step | Output |
|---|---|---|
| 1 | File validation | Container, codec, frame rate, and audio checked against the ingest profile |
| 2 | Transcoding | Delivery ladder, six renditions to 1080p; HEVC on request |
| 3 | Proxy creation | Low-bitrate proxy first, so producers are not waiting on the full ladder |
| 4 | Thumbnails | Scene-change candidates; a human picks the one that ships |
| 5 | Captions | AI draft → **human review**. An unreviewed draft is blocked from every captioned platform |
| 6 | Transcripts | Full transcript with speaker separation; feeds search, chapters, and clip suggestions |
| 7 | Loudness normalization | −24 LKFS, CALM Act compliant |
| 8 | Derivatives | 9:16 vertical, 1:1 square, 16:9 horizontal |
| 9 | Clip recommendations | AI proposes; a producer approves, trims, and captions before publication |
| 10 | Branding | Intro, outro, bug, watermark per channel and destination |
| 11 | Quality control | Black frames, silence, loudness, caption timing, aspect errors |
| 12 | Version management | Clean and explicit variants linked so the rights gate can find the right one |

Step 12 matters more than its position suggests. The gate reads `clean_version_asset_id` as evidence
that a clean version exists; if that link points at nothing, OTA and radio-affiliate delivery would
be cleared against a file that was never made. The test suite asserts every link resolves.

## 4. AI, and where it stops

**Used for:** transcription, caption drafting, chapter creation, metadata tagging, clip
recommendation, moderation triage, programming recommendations, schedule optimisation, trend
summaries, search, sponsor matching, translation, and duplicate detection.

**Never used for:** writing quotes, statistics, artist information, chart performance, or breaking
news. Nothing generated is presented as reported.

**Always:** human review before broadcast or publication. For captions this is enforced
mechanically — `caption_status = 'auto_draft'` is a hard blocker in `checkEligibility()`, not a
warning an operator can click past.

## 5. Storage

| Tier | Contents | Lifecycle |
|---|---|---|
| Hot | Proxies, thumbnails, captions, transcripts, derivatives | Indefinite |
| Warm | Delivery ladder for published assets | Until expiry or takedown |
| Cold | Mezzanine masters | Moved at 90 days; restored on demand |

Storage keys, not URLs, are stored. The CDN and signing layer resolve them, so a bucket or provider
change is a configuration change.

## 6. Delivery

| Format | Use |
|---|---|
| HLS (CMAF) | Web, iOS, connected TV |
| DASH | Android, some CTV platforms |
| Broadcast contribution | Cable, OTA, vMVPD |
| Progressive MP4 | Social, YouTube, downloads to affiliates |
| MP3 + RSS | Podcast |
| AAC + Icecast/HLS | Internet radio |

Geographic restrictions are enforced at the CDN edge from the rights record. DRM (FairPlay,
Widevine, PlayReady) is applied where a licence requires it and is not applied where it does not —
DRM on content that does not need it costs money and breaks players for no benefit.

## 7. Live production and clipping

- Live feeds monitored in the channel origination console with health and error alerting.
- Rundowns and producer notes attached to the live window.
- Live graphics driven from the same templates as playout.
- Operators mark moments during transmission; marks become clip candidates immediately.
- Clips are cut from the live buffer, rapid-captioned, reviewed, and published to app and social.
- A clip can be attached to a developing article, and journalists are alerted when a marked moment
  relates to a story they are working on.

## 8. Failover

| Failure | Response |
|---|---|
| Primary encoder | Automatic switch to hot standby |
| Both encoders | Cut to slate; alert master control and distribution partners |
| Missing asset at play time | Roll the cleared filler block |
| Schedule gap detected in advance | Validator raises an error before the day airs |
| Delivery endpoint failure | Retry with backoff; alert after three failures |
| Rights lapse detected | Block the affected airings; alert compliance |

The filler block (`asset_filler_01`) is cleared for every platform and territory by design. Failover
content that could itself create a rights problem is not failover content.

## 9. Vendors required

| Capability | Status |
|---|---|
| Cloud playout | Amagi or comparable. Adapter defined, vendor not contracted |
| Transcoding | Self-hosted FFmpeg workers or a managed service. Not running |
| Captioning | AI service plus human review tooling. Not contracted |
| CDN | Not contracted |
| DRM | Required only where a licence demands it |
| Object storage | S3-compatible. Not provisioned |
