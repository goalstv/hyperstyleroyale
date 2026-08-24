import type { MediaAsset, RightsWindow } from "@/lib/types";
import { EPISODES, SHOW_BY_ID } from "./shows";
import { daysAgoIso, daysAheadIso } from "@/lib/clock";

const demo = { provenance: "demo", provenanceNote: "Demonstration media record. No copyrighted media is stored." } as const;

/** One asset per catalogued episode, plus promos, music videos, and clips. */
const episodeAssets: MediaAsset[] = EPISODES.map((ep, i) => {
  const show = SHOW_BY_ID.get(ep.showId);
  const explicit = show?.rating === "TV-MA";
  return {
    ...demo,
    id: ep.assetId,
    title: ep.title,
    description: ep.synopsis,
    type: "long_form_video" as const,
    durationSeconds: ep.durationSeconds,
    resolution: "1920x1080",
    aspectRatio: "16:9" as const,
    audioFormat: "Stereo 48kHz / -24 LKFS",
    rating: show?.rating ?? "TV-14",
    explicit,
    cleanVersionAssetId: explicit ? `${ep.assetId}_clean` : undefined,
    showId: ep.showId,
    episodeId: ep.id,
    // One asset deliberately left with unreviewed AI captions so the rights gate
    // has something real to block.
    captionStatus: i === 5 ? ("auto_draft" as const) : ("human_reviewed" as const),
    transcriptStatus: "human_reviewed" as const,
    qcStatus: i === 9 ? ("pending" as const) : ("passed" as const),
    publishStatus: "published" as const,
    loudnessLufs: -24,
    createdIso: daysAgoIso(10 - (i % 9)),
    sourceRef: { kind: "google_drive" as const, ref: `VIDEOS/${ep.title}.mp4`, link: "https://drive.google.com/drive/folders/DEMO_VIDEOS" },
  };
});

const otherAssets: MediaAsset[] = [
  {
    ...demo, id: "asset_mv_01", title: "Sable Mercer — “Bone China” (music video)",
    description: "Demonstration music-video record used to exercise exhibition-rights checks.",
    type: "music_video", durationSeconds: 214, resolution: "3840x2160", aspectRatio: "16:9",
    audioFormat: "Stereo 48kHz / -24 LKFS", rating: "TV-14", explicit: true,
    cleanVersionAssetId: "asset_mv_01_clean", artistId: "art_01",
    captionStatus: "human_reviewed", transcriptStatus: "human_reviewed", qcStatus: "passed",
    publishStatus: "published", loudnessLufs: -23.8, createdIso: daysAgoIso(30),
  },
  {
    ...demo, id: "asset_mv_01_clean", title: "Sable Mercer — “Bone China” (clean)",
    description: "Clean edit for OTA, cable, and radio-affiliate delivery.",
    type: "music_video", durationSeconds: 214, resolution: "3840x2160", aspectRatio: "16:9",
    audioFormat: "Stereo 48kHz / -24 LKFS", rating: "PG-13", explicit: false, artistId: "art_01",
    captionStatus: "human_reviewed", transcriptStatus: "human_reviewed", qcStatus: "passed",
    publishStatus: "published", loudnessLufs: -23.9, createdIso: daysAgoIso(29),
  },
  {
    ...demo, id: "asset_int_01", title: "KP Verse — the writing interview",
    description: "Long-form BARS interview. Demonstration record; talent release tracked on the rights row.",
    type: "interview", durationSeconds: 1780, resolution: "1920x1080", aspectRatio: "16:9",
    audioFormat: "Stereo 48kHz / -24 LKFS", rating: "TV-14", explicit: false, artistId: "art_02",
    showId: "sh_bars", captionStatus: "human_reviewed", transcriptStatus: "human_reviewed",
    qcStatus: "passed", publishStatus: "published", loudnessLufs: -24, createdIso: daysAgoIso(6),
  },
  {
    ...demo, id: "asset_perf_01", title: "RAP TRENDS SESSIONS — Hollow Park, full set",
    description: "Original live performance produced by RAP TRENDS Studios. Demonstration record.",
    type: "performance", durationSeconds: 2410, resolution: "3840x2160", aspectRatio: "16:9",
    audioFormat: "5.1 + stereo fold-down / -24 LKFS", rating: "TV-14", explicit: false,
    artistId: "art_20", showId: "sh_sessions", captionStatus: "human_reviewed",
    transcriptStatus: "human_reviewed", qcStatus: "passed", publishStatus: "published",
    loudnessLufs: -24, createdIso: daysAgoIso(13),
  },
  {
    ...demo, id: "asset_short_01", title: "Nia Oduya on the Lagos-to-Atlanta pipeline (vertical clip)",
    description: "Vertical derivative cut from the CITY REPORT Lagos package.",
    type: "short_form_video", durationSeconds: 58, resolution: "1080x1920", aspectRatio: "9:16",
    audioFormat: "Stereo 48kHz / -16 LKFS", rating: "PG-13", explicit: false, artistId: "art_03",
    captionStatus: "human_reviewed", transcriptStatus: "human_reviewed", qcStatus: "passed",
    publishStatus: "published", loudnessLufs: -16, createdIso: daysAgoIso(2),
  },
  {
    ...demo, id: "asset_promo_01", title: "NEXT UP — Thursday promo, :30",
    description: "Network promo. Cleared for every platform and territory.",
    type: "promo", durationSeconds: 30, resolution: "1920x1080", aspectRatio: "16:9",
    audioFormat: "Stereo 48kHz / -24 LKFS", rating: "G", explicit: false, showId: "sh_nextup",
    captionStatus: "human_reviewed", transcriptStatus: "none", qcStatus: "passed",
    publishStatus: "published", loudnessLufs: -24, createdIso: daysAgoIso(20),
  },
  {
    ...demo, id: "asset_filler_01", title: "RAP TRENDS Music Hour — filler block",
    description: "Cleared music-video block used as failover and gap filler.",
    type: "long_form_video", durationSeconds: 3600, resolution: "1920x1080", aspectRatio: "16:9",
    audioFormat: "Stereo 48kHz / -24 LKFS", rating: "PG-13", explicit: false,
    captionStatus: "human_reviewed", transcriptStatus: "none", qcStatus: "passed",
    publishStatus: "published", loudnessLufs: -24, createdIso: daysAgoIso(40),
  },
  {
    ...demo, id: "asset_ingest_01", title: "Untitled Detroit package (ingested, unprepared)",
    description: "Detected in the VIDEOS Drive folder. Awaiting QC, captions, and a rights record.",
    type: "long_form_video", durationSeconds: 940, resolution: "1920x1080", aspectRatio: "16:9",
    audioFormat: "Stereo 48kHz", rating: "TV-14", explicit: true,
    captionStatus: "none", transcriptStatus: "auto_draft", qcStatus: "pending",
    publishStatus: "ingested", createdIso: daysAgoIso(0),
    sourceRef: { kind: "google_drive", ref: "VIDEOS/detroit_pkg_raw.mov", link: "https://drive.google.com/drive/folders/DEMO_VIDEOS" },
  },
];

export const MEDIA_ASSETS: MediaAsset[] = [...episodeAssets, ...otherAssets];
export const ASSET_BY_ID = new Map(MEDIA_ASSETS.map((a) => [a.id, a]));

/* ------------------------------------------------------------------ rights */

const ALL_PLATFORMS = [
  "web", "ios", "android", "ctv_app", "fast", "cable", "ota", "vmvpd",
  "youtube", "social", "podcast", "radio_affiliate", "internet_radio",
] as const;

const ALL_RIGHTS = [
  "master_recording", "publishing", "music_video_exhibition", "synchronization",
  "public_performance", "digital_performance", "mechanical",
] as const;

/** Network-owned originals clear broadly; licensed third-party media does not. */
const originalWindows: RightsWindow[] = episodeAssets.map((asset, i) => ({
  id: `rw_${asset.id}`,
  assetId: asset.id,
  rightsOwner: "RAP TRENDS Studios (network-owned original)",
  cleared: [...ALL_RIGHTS],
  platforms: [...ALL_PLATFORMS],
  territories: ["WORLDWIDE"],
  startIso: daysAgoIso(30),
  // One window expires inside the warning threshold on purpose.
  endIso: i === 3 ? daysAheadIso(22) : null,
  adRestrictions: [],
  talentReleaseOnFile: true,
  notes:
    i === 3
      ? "Guest performance segment carries a fixed 12-month exhibition window; renewal conversation open."
      : "Network-owned. No third-party master or publishing dependency beyond cleared cues.",
}));

export const RIGHTS_WINDOWS: RightsWindow[] = [
  ...originalWindows,
  {
    id: "rw_mv_01", assetId: "asset_mv_01",
    rightsOwner: "Demo Label Group (placeholder licensor)",
    cleared: ["master_recording", "publishing", "music_video_exhibition", "public_performance", "digital_performance"],
    platforms: ["web", "ios", "android", "ctv_app", "fast", "cable", "vmvpd", "internet_radio"],
    territories: ["US", "CA"],
    startIso: daysAgoIso(28), endIso: daysAheadIso(154),
    adRestrictions: ["alcohol", "gambling"],
    talentReleaseOnFile: true,
    notes: "No synchronization right — this video may not be posted to YouTube or social. OTA excluded pending a broadcast rider.",
  },
  {
    id: "rw_mv_01_clean", assetId: "asset_mv_01_clean",
    rightsOwner: "Demo Label Group (placeholder licensor)",
    cleared: ["master_recording", "publishing", "music_video_exhibition", "public_performance", "digital_performance"],
    platforms: ["web", "ios", "android", "ctv_app", "fast", "cable", "vmvpd", "ota", "radio_affiliate", "internet_radio"],
    territories: ["US", "CA"],
    startIso: daysAgoIso(28), endIso: daysAheadIso(154),
    adRestrictions: ["alcohol", "gambling"],
    talentReleaseOnFile: true,
    notes: "Clean edit approved for broadcast carriage under the same licence.",
  },
  {
    id: "rw_int_01", assetId: "asset_int_01",
    rightsOwner: "RAP TRENDS Studios",
    cleared: [...ALL_RIGHTS], platforms: [...ALL_PLATFORMS], territories: ["WORLDWIDE"],
    startIso: daysAgoIso(6), endIso: null, adRestrictions: [], talentReleaseOnFile: true,
    notes: "Signed appearance release on file.",
  },
  {
    id: "rw_perf_01", assetId: "asset_perf_01",
    rightsOwner: "RAP TRENDS Studios",
    cleared: [...ALL_RIGHTS], platforms: [...ALL_PLATFORMS], territories: ["WORLDWIDE"],
    startIso: daysAgoIso(13), endIso: null, adRestrictions: ["cannabis"], talentReleaseOnFile: true,
    notes: "Artist agreement excludes cannabis adjacency.",
  },
  {
    id: "rw_short_01", assetId: "asset_short_01",
    rightsOwner: "RAP TRENDS Studios",
    cleared: [...ALL_RIGHTS], platforms: [...ALL_PLATFORMS], territories: ["WORLDWIDE"],
    startIso: daysAgoIso(2), endIso: null, adRestrictions: [], talentReleaseOnFile: true,
    notes: "Derivative of network-owned CITY REPORT footage.",
  },
  {
    id: "rw_promo_01", assetId: "asset_promo_01",
    rightsOwner: "RAP TRENDS Studios",
    cleared: [...ALL_RIGHTS], platforms: [...ALL_PLATFORMS], territories: ["WORLDWIDE"],
    startIso: daysAgoIso(20), endIso: null, adRestrictions: [], talentReleaseOnFile: true,
    notes: "Network promo.",
  },
  {
    id: "rw_filler_01", assetId: "asset_filler_01",
    rightsOwner: "RAP TRENDS Studios / cleared cue library",
    cleared: [...ALL_RIGHTS], platforms: [...ALL_PLATFORMS], territories: ["WORLDWIDE"],
    startIso: daysAgoIso(40), endIso: null, adRestrictions: [], talentReleaseOnFile: true,
    notes: "Failover and gap-filler block. Always cleared everywhere by design.",
  },
  // asset_ingest_01 intentionally has NO rights record. The gate must block it.
];

export const RIGHTS_BY_ASSET = new Map(RIGHTS_WINDOWS.map((w) => [w.assetId, w]));
