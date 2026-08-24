import type { DriveSyncRecord, HealthCheck, RadioSegment, TickerItem } from "@/lib/types";
import { minutesAgoIso, daysAgoIso } from "@/lib/clock";

/**
 * Google Drive ingestion log. DEMONSTRATION RECORDS.
 *
 * The connector watches two folders — ARTICLES and VIDEOS — records the original
 * Drive link, and never publishes on its own. AI suggestions are stored as
 * suggestions and are surfaced to an editor for acceptance.
 */
export const DRIVE_SYNC: DriveSyncRecord[] = [
  {
    id: "drv_01", folder: "VIDEOS", fileName: "detroit_pkg_raw.mov",
    driveLink: "https://drive.google.com/drive/folders/DEMO_VIDEOS", mimeType: "video/quicktime",
    detectedIso: minutesAgoIso(22), status: "imported", matchedAssetId: "asset_ingest_01",
    notifiedUserId: "usr_04",
    aiSuggestions: {
      headline: "Detroit's tempo shift, from inside the room",
      summary: "Nine-minute package with three producers walking through the pocket that has spread out of Detroit. Transcript drafted; not yet reviewed.",
      tags: ["detroit", "production", "city report"],
      artists: ["KP Verse", "North Pierre"],
    },
    message: "Transcript drafted by AI. Captions, QC, and a rights record are still required before this asset can be scheduled.",
  },
  {
    id: "drv_02", folder: "ARTICLES", fileName: "detroit-tempo-shift-FINAL.docx",
    driveLink: "https://drive.google.com/drive/folders/DEMO_ARTICLES",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    detectedIso: minutesAgoIso(140), status: "matched", matchedArticleId: "art_a01",
    matchedAssetId: "asset_int_01", notifiedUserId: "usr_02",
    aiSuggestions: { headline: "Detroit is exporting its tempo again", tags: ["detroit", "regional"], artists: ["KP Verse"] },
    message: "Matched to an existing draft by Rahman and to the related BARS interview.",
  },
  {
    id: "drv_03", folder: "ARTICLES", fileName: "detroit-tempo-shift-FINAL (1).docx",
    driveLink: "https://drive.google.com/drive/folders/DEMO_ARTICLES",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    detectedIso: minutesAgoIso(138), status: "duplicate", matchedArticleId: "art_a01",
    message: "Content hash matches drv_02. Skipped — no second copy created.",
  },
  {
    id: "drv_04", folder: "VIDEOS", fileName: "sessions_hollowpark_master.mxf",
    driveLink: "https://drive.google.com/drive/folders/DEMO_VIDEOS", mimeType: "application/mxf",
    detectedIso: daysAgoIso(13), status: "imported", matchedAssetId: "asset_perf_01",
    notifiedUserId: "usr_04", message: "Mezzanine master ingested. Proxies, captions, and derivatives complete.",
  },
  {
    id: "drv_05", folder: "ARTICLES", fileName: "miami_club_draft.gdoc",
    driveLink: "https://drive.google.com/drive/folders/DEMO_ARTICLES", mimeType: "application/vnd.google-apps.document",
    detectedIso: minutesAgoIso(400), status: "matched", matchedArticleId: "art_a09", notifiedUserId: "usr_02",
    message: "Matched to the Miami draft currently in editing.",
  },
  {
    id: "drv_06", folder: "VIDEOS", fileName: "lagos_broll_04.mp4",
    driveLink: "https://drive.google.com/drive/folders/DEMO_VIDEOS", mimeType: "video/mp4",
    detectedIso: minutesAgoIso(90), status: "error",
    message: "Import failed: file is still uploading to Drive (partial content length). The connector will retry on the next sweep.",
  },
];

export const HEALTH_CHECKS: HealthCheck[] = [
  { id: "hc_01", area: "feeds", label: "RAP TRENDS TV — primary encoder", status: "ok", detail: "Bitrate stable, 6 renditions, no dropped segments in 24h.", value: "8.4 Mb/s", updatedIso: minutesAgoIso(1) },
  { id: "hc_02", area: "feeds", label: "RAP TRENDS TV — backup encoder", status: "ok", detail: "Hot standby, receiving contribution feed.", value: "Standby", updatedIso: minutesAgoIso(1) },
  { id: "hc_03", area: "feeds", label: "RAP TRENDS RADIO — stream", status: "ok", detail: "Now-playing metadata publishing on schedule.", value: "128 kb/s AAC", updatedIso: minutesAgoIso(1) },
  { id: "hc_04", area: "transcode", label: "Transcode queue", status: "warn", detail: "One job failed: source asset_ingest_01 has a variable frame rate the profile does not accept. Re-wrap required.", value: "1 failed / 34 complete", updatedIso: minutesAgoIso(20) },
  { id: "hc_05", area: "captions", label: "Caption coverage", status: "warn", detail: "One scheduled asset carries AI-drafted captions that have not been human-reviewed. Delivery to captioned platforms is blocked until it is.", value: "1 blocking", updatedIso: minutesAgoIso(12) },
  { id: "hc_06", area: "rights", label: "Expiring licences", status: "warn", detail: "One exhibition window expires within 30 days; renewal conversation is open.", value: "1 within 30d", updatedIso: minutesAgoIso(45) },
  { id: "hc_07", area: "delivery", label: "Social clip delivery", status: "fail", detail: "Two clips rejected — source asset has no rights record on file.", value: "2 failed", updatedIso: minutesAgoIso(1500) },
  { id: "hc_08", area: "schedule", label: "Schedule continuity", status: "ok", detail: "Seven days built, no gaps or overlaps on RAP TRENDS TV.", value: "168h built", updatedIso: minutesAgoIso(30) },
  { id: "hc_09", area: "advertising", label: "Ad decisioning", status: "ok", detail: "No failed ad calls in the last hour. Two campaigns held in compliance review.", value: "0 errors", updatedIso: minutesAgoIso(4) },
  { id: "hc_10", area: "storage", label: "Object storage", status: "ok", detail: "Mezzanine and proxy tiers within budget. Lifecycle policy moving masters to cold storage at 90 days.", value: "38.2 TB", updatedIso: minutesAgoIso(60) },
  { id: "hc_11", area: "api", label: "Public API", status: "ok", detail: "p95 latency within target across all endpoints.", value: "p95 148ms", updatedIso: minutesAgoIso(2) },
  { id: "hc_12", area: "drive_sync", label: "Google Drive sync", status: "warn", detail: "One file failed to import (partial upload). Retry scheduled.", value: "1 error / 6 files", updatedIso: minutesAgoIso(90) },
  { id: "hc_13", area: "editorial", label: "Open editorial approvals", status: "ok", detail: "One story in fact check, one in editing, one assigned.", value: "3 open", updatedIso: minutesAgoIso(15) },
];

export const TICKER: TickerItem[] = [
  { id: "tk_01", kind: "live", text: "RAP TRENDS LIVE — tonight 7:00 PM ET", href: "/live", iso: minutesAgoIso(2) },
  { id: "tk_02", kind: "chart", text: "KP Verse “Rust Belt Gospel” climbs to No. 2 on the RAP TRENDS Index", href: "/trending", iso: minutesAgoIso(38) },
  { id: "tk_03", kind: "breaking", text: "Transparency note: an open manipulation flag on this week's chart", href: "/news/zeta-royale-flag", iso: minutesAgoIso(300) },
  { id: "tk_04", kind: "release", text: "New release — Amara Veil, “Scarborough Blue”", href: "/artists/amara-veil", iso: minutesAgoIso(420) },
  { id: "tk_05", kind: "premiere", text: "Premiere — RAP TRENDS SESSIONS: Hollow Park, Saturday 10:00 PM ET", href: "/shows/rap-trends-sessions", iso: minutesAgoIso(600) },
  { id: "tk_06", kind: "concert", text: "NEXT UP showcase announced — demonstration event listing", href: "/shows/next-up", iso: minutesAgoIso(900) },
  { id: "tk_07", kind: "chart", text: "Amara Veil debuts at No. 9 — first chart entry", href: "/trending", iso: minutesAgoIso(1100) },
  { id: "tk_08", kind: "breaking", text: "CITY REPORT: Detroit is exporting its tempo again", href: "/news/detroit-tempo-shift", iso: minutesAgoIso(1400) },
];

/** RAP TRENDS RADIO — the current hour's clock. DEMONSTRATION LOG. */
export function radioClock(nowIso: string): RadioSegment[] {
  const top = new Date(nowIso);
  top.setUTCMinutes(0, 0, 0);
  const rows: [string, RadioSegment["kind"], number, string | undefined, boolean][] = [
    ["Legal identification", "id", 10, undefined, false],
    ["RAP TRENDS Report — top of hour", "news", 300, undefined, false],
    ["Sable Mercer — “Bone China”", "music", 214, "Sable Mercer", true],
    ["Nia Oduya — “Third Mainland”", "music", 198, "Nia Oduya", false],
    ["Commercial window — local avail", "spot_window", 120, undefined, false],
    ["KP Verse — “Rust Belt Gospel”", "music", 187, "KP Verse", true],
    ["NEXT UP Spotlight — Vega Monroe", "discovery", 600, "Vega Monroe", false],
    ["Lux Armand — “Delancey Nights”", "music", 232, "Lux Armand", true],
    ["RAP TRENDS Update — :50 past", "news", 60, undefined, false],
    ["Ivory Lane — “Ivory Hours”", "music", 205, "Ivory Lane", false],
    ["Amara Veil — “Scarborough Blue”", "music", 219, "Amara Veil", false],
    ["Commercial window — national", "spot_window", 120, undefined, false],
  ];
  let cursor = top.getTime();
  return rows.map(([title, kind, durationSeconds, artist, explicit], i) => {
    const startIso = new Date(cursor).toISOString();
    cursor += durationSeconds * 1000;
    return {
      id: `rad_${i}`, title, kind, durationSeconds, artist, explicit,
      cleanAvailable: true, startIso,
    };
  });
}

export function nowPlaying(nowIso: string): RadioSegment {
  const clock = radioClock(nowIso);
  const at = Date.parse(nowIso);
  return (
    clock.find((s) => Date.parse(s.startIso) <= at && at < Date.parse(s.startIso) + s.durationSeconds * 1000) ??
    clock[0]
  );
}
