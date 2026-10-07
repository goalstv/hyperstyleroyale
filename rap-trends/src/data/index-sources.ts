import type { EditorialOverride, IndexSource } from "@/lib/types";

/**
 * Index sources — what we are actually connected to.
 *
 * `status: "connected"` is not a label. `index-engine.ts` counts a signal only
 * if its source is connected, so the field is load-bearing arithmetic: marking
 * a source connected is a claim that a live connector has synced real data.
 *
 * Right now **no signal source is connected.** Every provider below is a
 * placeholder for a vendor we have not contracted, and no connector has ever
 * run. This register says so, and `lastSyncIso` is absent everywhere because
 * nothing has ever synced.
 *
 * That has a deliberate consequence downstream: with no connected sources,
 * coverage is zero, confidence is zero, and `canPublish` refuses every entry.
 * The Index does not publish a chart. That is the engine working — an index
 * whose whole claim is transparency cannot show positions it cannot source.
 *
 * The two not-connected reasons are kept apart because they have different
 * fixes. `pending_agreement` is blocked on a counterparty's signature.
 * `not_implemented` has no external blocker and is waiting on our own build.
 *
 * Nothing here scrapes a platform.
 */
export const INDEX_SOURCES: IndexSource[] = [
  { id: "src_01", key: "streaming_velocity", label: "Streaming velocity", provider: "Licensed DSP analytics agreement (placeholder vendor — not contracted)", authorization: "licensed_api", status: "pending_agreement", weight: 0.18, refreshMinutes: 60, notes: "Day-over-day play growth, normalized within release cohort. No agreement on file; no connector has run." },
  { id: "src_02", key: "video_views", label: "Video views", provider: "Video platform partner API (placeholder vendor — not contracted)", authorization: "licensed_api", status: "pending_agreement", weight: 0.07, refreshMinutes: 120, notes: "Official channel views only, UGC excluded. No agreement on file." },
  { id: "src_03", key: "video_view_velocity", label: "Video view velocity", provider: "Video platform partner API (placeholder vendor — not contracted)", authorization: "licensed_api", status: "pending_agreement", weight: 0.09, refreshMinutes: 120, notes: "72-hour acceleration curve. No agreement on file." },
  { id: "src_04", key: "radio_airplay", label: "Radio airplay", provider: "Airplay monitoring service (placeholder vendor — not contracted)", authorization: "licensed_api", status: "pending_agreement", weight: 0.09, refreshMinutes: 240, notes: "Monitored spins across a reporting panel. No agreement on file." },
  { id: "src_05", key: "shazam", label: "Song identification activity", provider: "Identification partner (placeholder vendor — not contracted)", authorization: "licensed_api", status: "pending_agreement", weight: 0.06, refreshMinutes: 180, notes: "No agreement on file. Excluded from every score until one exists." },
  { id: "src_06", key: "search_interest", label: "Search interest", provider: "Public search-trends index", authorization: "public_source", status: "not_implemented", weight: 0.06, refreshMinutes: 360, notes: "Relative interest only, no absolute volumes. No licence needed; the connector is not built." },
  { id: "src_07", key: "social_conversation", label: "Social conversation", provider: "Social listening partner (placeholder vendor — not contracted)", authorization: "approved_feed", status: "pending_agreement", weight: 0.07, refreshMinutes: 60, notes: "Mention volume and sentiment on authorized firehose access. No agreement on file." },
  { id: "src_08", key: "short_form_usage", label: "Short-form video usage", provider: "Short-form platform commercial API (placeholder vendor — not contracted)", authorization: "licensed_api", status: "pending_agreement", weight: 0.1, refreshMinutes: 60, notes: "Sound-usage creation counts, not views. No agreement on file." },
  { id: "src_09", key: "playlist_adds", label: "Playlist additions", provider: "Licensed DSP analytics agreement (placeholder vendor — not contracted)", authorization: "licensed_api", status: "pending_agreement", weight: 0.07, refreshMinutes: 240, notes: "Editorial and algorithmic adds weighted separately. No agreement on file." },
  { id: "src_10", key: "concert_demand", label: "Concert demand", provider: "Ticketing partner (placeholder vendor — not contracted)", authorization: "approved_feed", status: "pending_agreement", weight: 0.04, refreshMinutes: 720, notes: "On-sale registration and waitlist depth. No agreement on file. The one real upstream we tried, Bandsintown, returned HTTP 403 on every request and needs a registered partner app_id." },
  { id: "src_11", key: "ticket_sales", label: "Ticket sales", provider: "Ticketing partner (placeholder vendor — not contracted)", authorization: "approved_feed", status: "pending_agreement", weight: 0.03, refreshMinutes: 720, notes: "Reported sell-through by market. No agreement on file." },
  { id: "src_12", key: "audience_vote", label: "Audience voting", provider: "RAP TRENDS first-party voting", authorization: "internal_editorial", status: "not_implemented", weight: 0.04, refreshMinutes: 15, notes: "One vote per verified account per record per day, rate-limited and de-duplicated. Nothing external blocks this; the voting surface is not built and no votes have been cast." },
  { id: "src_13", key: "editorial_assessment", label: "Editorial assessment", provider: "RAP TRENDS editorial board", authorization: "internal_editorial", status: "not_implemented", weight: 0.05, refreshMinutes: 1440, notes: "Scored by at least three editors, individual scores logged. Nothing external blocks this; no board has been convened and no record has been scored." },
  { id: "src_14", key: "geographic_momentum", label: "Geographic momentum", provider: "Derived from licensed streaming and airplay geography", authorization: "licensed_api", status: "pending_agreement", weight: 0.03, refreshMinutes: 360, notes: "Spread across markets, not raw volume in one. Derived, so it cannot exist before the streaming and airplay agreements do." },
  { id: "src_15", key: "engagement_quality", label: "Engagement quality", provider: "Licensed DSP analytics agreement (placeholder vendor — not contracted)", authorization: "licensed_api", status: "pending_agreement", weight: 0.02, refreshMinutes: 240, notes: "Save rate, completion rate, repeat listens. No agreement on file." },
];

/* ------------------------------------------------------------- readiness */

export interface SignalReadiness {
  /** Distinct signal keys with a connected source. */
  live: number;
  /** Distinct signal keys the methodology defines. */
  total: number;
  /** Signals waiting on a counterparty's signature. */
  blockedOnAgreement: number;
  /** Signals with no external blocker, waiting on our build. */
  blockedOnBuild: number;
  /** Whether enough signals are live to publish a score at all. */
  canPublishAnything: boolean;
}

/**
 * How close the Index is to being able to publish.
 *
 * This is the number the public surface leads with, because it is the only
 * honest headline available while `live` is 0: a transparent index that admits
 * it has no inputs yet is worth more than one showing positions it invented.
 */
export function signalReadiness(
  sources: IndexSource[] = INDEX_SOURCES,
  minimum = 6,
): SignalReadiness {
  const keys = (status: IndexSource["status"]) =>
    new Set(sources.filter((s) => s.status === status).map((s) => s.key));

  const live = keys("connected");
  return {
    live: live.size,
    total: new Set(sources.map((s) => s.key)).size,
    blockedOnAgreement: keys("pending_agreement").size,
    blockedOnBuild: keys("not_implemented").size,
    canPublishAnything: live.size >= minimum,
  };
}

/**
 * Editorial overrides are rare, always attributed, and always visible on the
 * public methodology page in aggregate.
 *
 * This one is retained as a worked example against the demonstration chart. An
 * override on an entry that cannot publish changes no published position — it
 * exists so the audit trail and the override UI have something real to render.
 */
export const EDITORIAL_OVERRIDES: EditorialOverride[] = [
  {
    id: "ovr_01",
    entryId: "chart_07",
    deltaPoints: -6,
    reason:
      "Short-form usage is inflated by an unrelated meme using a four-second portion of the intro. Editorial board reduced the composite pending a usage-context review.",
    authorId: "usr_02",
    createdIso: "2026-01-01T00:00:00.000Z",
  },
];
