import type { EditorialOverride, IndexSource } from "@/lib/types";
import { minutesAgoIso } from "@/lib/clock";

/**
 * Index sources.
 *
 * A source only contributes once an agreement exists and the connector is
 * enabled. Sources in `pending_agreement` are shown to operators precisely so
 * that the gap between "what we want to measure" and "what we are licensed to
 * measure" is always visible. Nothing here scrapes a platform.
 */
export const INDEX_SOURCES: IndexSource[] = [
  { id: "src_01", key: "streaming_velocity", label: "Streaming velocity", provider: "Licensed DSP analytics agreement (placeholder vendor)", authorization: "licensed_api", status: "connected", weight: 0.18, refreshMinutes: 60, lastSyncIso: minutesAgoIso(24), notes: "Day-over-day play growth, normalized within release cohort." },
  { id: "src_02", key: "video_views", label: "Video views", provider: "Video platform partner API (placeholder vendor)", authorization: "licensed_api", status: "connected", weight: 0.07, refreshMinutes: 120, lastSyncIso: minutesAgoIso(51), notes: "Official channel views only. UGC uploads excluded." },
  { id: "src_03", key: "video_view_velocity", label: "Video view velocity", provider: "Video platform partner API (placeholder vendor)", authorization: "licensed_api", status: "connected", weight: 0.09, refreshMinutes: 120, lastSyncIso: minutesAgoIso(51), notes: "72-hour acceleration curve." },
  { id: "src_04", key: "radio_airplay", label: "Radio airplay", provider: "Airplay monitoring service (placeholder vendor)", authorization: "licensed_api", status: "connected", weight: 0.09, refreshMinutes: 240, lastSyncIso: minutesAgoIso(96), notes: "Monitored spins across reporting panel." },
  { id: "src_05", key: "shazam", label: "Song identification activity", provider: "Identification partner (placeholder vendor)", authorization: "licensed_api", status: "pending_agreement", weight: 0.06, refreshMinutes: 180, notes: "Contract not executed. Signal is excluded from every published score until it is." },
  { id: "src_06", key: "search_interest", label: "Search interest", provider: "Public search-trends index", authorization: "public_source", status: "connected", weight: 0.06, refreshMinutes: 360, lastSyncIso: minutesAgoIso(140), notes: "Relative interest only; no absolute volumes." },
  { id: "src_07", key: "social_conversation", label: "Social conversation", provider: "Social listening partner (placeholder vendor)", authorization: "approved_feed", status: "connected", weight: 0.07, refreshMinutes: 60, lastSyncIso: minutesAgoIso(18), notes: "Mention volume and sentiment on authorized firehose access." },
  { id: "src_08", key: "short_form_usage", label: "Short-form video usage", provider: "Short-form platform commercial API (placeholder vendor)", authorization: "licensed_api", status: "connected", weight: 0.1, refreshMinutes: 60, lastSyncIso: minutesAgoIso(31), notes: "Sound-usage creation counts, not view counts." },
  { id: "src_09", key: "playlist_adds", label: "Playlist additions", provider: "Licensed DSP analytics agreement (placeholder vendor)", authorization: "licensed_api", status: "connected", weight: 0.07, refreshMinutes: 240, lastSyncIso: minutesAgoIso(120), notes: "Editorial and algorithmic adds weighted separately." },
  { id: "src_10", key: "concert_demand", label: "Concert demand", provider: "Ticketing partner (placeholder vendor)", authorization: "approved_feed", status: "connected", weight: 0.04, refreshMinutes: 720, lastSyncIso: minutesAgoIso(300), notes: "On-sale registration and waitlist depth." },
  { id: "src_11", key: "ticket_sales", label: "Ticket sales", provider: "Ticketing partner (placeholder vendor)", authorization: "approved_feed", status: "connected", weight: 0.03, refreshMinutes: 720, lastSyncIso: minutesAgoIso(300), notes: "Reported sell-through by market." },
  { id: "src_12", key: "audience_vote", label: "Audience voting", provider: "RAP TRENDS first-party voting", authorization: "internal_editorial", status: "connected", weight: 0.04, refreshMinutes: 15, lastSyncIso: minutesAgoIso(6), notes: "One vote per verified account per record per day. Rate-limited and de-duplicated." },
  { id: "src_13", key: "editorial_assessment", label: "Editorial assessment", provider: "RAP TRENDS editorial board", authorization: "internal_editorial", status: "connected", weight: 0.05, refreshMinutes: 1440, lastSyncIso: minutesAgoIso(480), notes: "Scored by at least three editors; individual scores are logged." },
  { id: "src_14", key: "geographic_momentum", label: "Geographic momentum", provider: "Derived from licensed streaming and airplay geography", authorization: "licensed_api", status: "connected", weight: 0.03, refreshMinutes: 360, lastSyncIso: minutesAgoIso(200), notes: "Spread across markets, not raw volume in one." },
  { id: "src_15", key: "engagement_quality", label: "Engagement quality", provider: "Licensed DSP analytics agreement (placeholder vendor)", authorization: "licensed_api", status: "connected", weight: 0.02, refreshMinutes: 240, lastSyncIso: minutesAgoIso(115), notes: "Save rate, completion rate, and repeat listens." },
];

/**
 * Editorial overrides are rare, always attributed, and always visible on the
 * public methodology page in aggregate.
 */
export const EDITORIAL_OVERRIDES: EditorialOverride[] = [
  {
    id: "ovr_01",
    entryId: "chart_07",
    deltaPoints: -6,
    reason:
      "Short-form usage is inflated by an unrelated meme using a four-second portion of the intro. Editorial board reduced the composite pending a usage-context review.",
    authorId: "usr_02",
    createdIso: minutesAgoIso(600),
  },
];
