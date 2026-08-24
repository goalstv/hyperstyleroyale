/**
 * RAP TRENDS — core domain types.
 *
 * These mirror the SQL schema in docs/05-database-schema.sql. Every record that
 * can reach a screen carries a `provenance` field so the UI can never present
 * demonstration data as verified live data.
 */

/** Where a record came from. The UI is required to label anything that is not `verified`. */
export type Provenance = "verified" | "demo" | "estimated" | "unverified";

export interface Provenanced {
  provenance: Provenance;
  /** Human-readable note shown in the data-integrity tooltip. */
  provenanceNote?: string;
}

/* ------------------------------------------------------------------ people */

export type Role =
  | "founder_admin"
  | "editor_in_chief"
  | "journalist"
  | "video_producer"
  | "programming_director"
  | "master_control"
  | "social_producer"
  | "ad_sponsorship_manager"
  | "rights_compliance"
  | "affiliate_manager"
  | "analytics_viewer"
  | "external_contributor"
  | "artist"
  | "affiliate"
  | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  title?: string;
  city?: string;
  avatarInitials: string;
  active: boolean;
}

/* ----------------------------------------------------------------- artists */

export type ArtistTier = "established" | "rising" | "independent";

export interface Artist extends Provenanced {
  id: string;
  slug: string;
  name: string;
  city: string;
  cityId: string;
  region: string;
  tier: ArtistTier;
  verified: boolean;
  bio: string;
  labelType: "independent" | "indie_label" | "major";
  formedYear: number;
  tags: string[];
  /** Demo-only aggregate signals. Never presented as licensed platform data. */
  signals: SignalBundle;
  monthlyListenersBand: string;
  socials: { platform: string; handle: string }[];
  nextUp: boolean;
}

/* ------------------------------------------------------------------- index */

export type SignalKey =
  | "streaming_velocity"
  | "video_views"
  | "video_view_velocity"
  | "radio_airplay"
  | "shazam"
  | "search_interest"
  | "social_conversation"
  | "short_form_usage"
  | "playlist_adds"
  | "concert_demand"
  | "ticket_sales"
  | "audience_vote"
  | "editorial_assessment"
  | "geographic_momentum"
  | "engagement_quality";

/** Normalized 0–100 signal readings for one entity in one window. */
export type SignalBundle = Partial<Record<SignalKey, number>>;

export interface IndexSource {
  id: string;
  key: SignalKey;
  label: string;
  /** The licensed product or agreement that authorizes this feed. */
  provider: string;
  /** Legal basis for use — required before a source can be enabled. */
  authorization:
    | "licensed_api"
    | "approved_feed"
    | "public_source"
    | "direct_submission"
    | "internal_editorial";
  status: "connected" | "pending_agreement" | "disabled";
  weight: number;
  /** Minutes between refreshes when connected. */
  refreshMinutes: number;
  lastSyncIso?: string;
  notes: string;
}

export interface IndexWeightProfile {
  id: string;
  label: string;
  weights: Record<SignalKey, number>;
  /** Half-life in days used for recency decay. */
  halfLifeDays: number;
  /** Multiplier applied to artists in the `rising`/`independent` tiers. */
  emergingBoost: number;
  /** Regional multipliers keyed by city id, applied for regional editions. */
  regionalWeights?: Record<string, number>;
}

export interface EditorialOverride {
  id: string;
  entryId: string;
  deltaPoints: number;
  reason: string;
  authorId: string;
  createdIso: string;
}

export interface FraudFlag {
  code: "velocity_spike" | "flat_engagement" | "single_source_dominance" | "geo_concentration";
  severity: "low" | "medium" | "high";
  detail: string;
}

export interface ChartEntry extends Provenanced {
  id: string;
  rank: number;
  previousRank: number | null;
  weeksOn: number;
  peak: number;
  title: string;
  artistId: string;
  artistName: string;
  releaseIso: string;
  cityId: string;
  explicit: boolean;
  signals: SignalBundle;
  /** Populated by the scoring engine at request time. */
  score?: IndexScore;
}

export interface IndexScore {
  /** 0–100 composite. */
  score: number;
  /** Per-signal contribution in points. */
  contributions: { key: SignalKey; weighted: number; raw: number; weight: number }[];
  recencyMultiplier: number;
  emergingMultiplier: number;
  regionalMultiplier: number;
  editorialDelta: number;
  /** 0–1. Falls when sources are missing, stale, or flagged. */
  confidence: number;
  flags: FraudFlag[];
  computedIso: string;
  profileId: string;
}

/* -------------------------------------------------------------------- shows */

export type Pillar =
  | "RAP TRENDS LIVE"
  | "TRENDING 10"
  | "NEXT UP"
  | "BARS"
  | "THE BUSINESS"
  | "CITY REPORT"
  | "RAP TRENDS RADIO"
  | "THE DROP"
  | "ARCHIVE"
  | "CULTURE MARKET"
  | "RAP TRENDS SESSIONS"
  | "RAP TRENDS AWARDS";

export interface Show extends Provenanced {
  id: string;
  slug: string;
  title: string;
  pillar: Pillar;
  format: "live" | "taped" | "strip" | "weekly" | "special";
  runtimeMinutes: number;
  synopsis: string;
  cadence: string;
  hosts: string[];
  rating: ContentRating;
  hasCleanVersion: boolean;
  artColor: string;
}

export interface Episode extends Provenanced {
  id: string;
  showId: string;
  season: number;
  number: number;
  title: string;
  synopsis: string;
  durationSeconds: number;
  assetId: string;
  publishedIso: string;
  captions: boolean;
}

/* -------------------------------------------------------------- rights/media */

export type ContentRating = "G" | "PG" | "PG-13" | "TV-14" | "TV-MA";

export type Platform =
  | "web"
  | "ios"
  | "android"
  | "ctv_app"
  | "fast"
  | "cable"
  | "ota"
  | "vmvpd"
  | "youtube"
  | "social"
  | "podcast"
  | "radio_affiliate"
  | "internet_radio";

export type AssetType =
  | "long_form_video"
  | "short_form_video"
  | "live_feed"
  | "audio"
  | "music_video"
  | "interview"
  | "performance"
  | "image"
  | "graphic"
  | "promo"
  | "commercial"
  | "caption"
  | "transcript"
  | "article_document";

export interface RightsWindow {
  id: string;
  assetId: string;
  rightsOwner: string;
  /** One row per right type actually cleared. Missing rows block delivery. */
  cleared: RightType[];
  platforms: Platform[];
  territories: string[];
  startIso: string;
  endIso: string | null;
  adRestrictions: RestrictedCategory[];
  talentReleaseOnFile: boolean;
  notes: string;
}

export type RightType =
  | "master_recording"
  | "publishing"
  | "music_video_exhibition"
  | "synchronization"
  | "public_performance"
  | "digital_performance"
  | "mechanical"
  | "archival_footage"
  | "ugc_license";

export type RestrictedCategory =
  | "alcohol"
  | "cannabis"
  | "gambling"
  | "political"
  | "pharma"
  | "age_restricted";

export interface MediaAsset extends Provenanced {
  id: string;
  title: string;
  description: string;
  type: AssetType;
  durationSeconds: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3";
  audioFormat: string;
  rating: ContentRating;
  explicit: boolean;
  cleanVersionAssetId?: string;
  artistId?: string;
  showId?: string;
  episodeId?: string;
  captionStatus: "none" | "auto_draft" | "human_reviewed" | "delivered";
  transcriptStatus: "none" | "auto_draft" | "human_reviewed";
  qcStatus: "pending" | "passed" | "failed" | "waived";
  qcNotes?: string;
  publishStatus: "ingested" | "in_prep" | "ready" | "published" | "expired" | "taken_down";
  loudnessLufs?: number;
  sourceRef?: { kind: "google_drive" | "upload" | "feed"; ref: string; link?: string };
  createdIso: string;
}

/* --------------------------------------------------------------- editorial */

export type ArticleState =
  | "idea"
  | "assigned"
  | "drafting"
  | "editing"
  | "fact_check"
  | "approved"
  | "scheduled"
  | "published"
  | "updated"
  | "archived";

export interface Article extends Provenanced {
  id: string;
  slug: string;
  headline: string;
  dek: string;
  body: string;
  state: ArticleState;
  authorId: string;
  authorName: string;
  editorId?: string;
  pillar: Pillar;
  cityIds: string[];
  artistIds: string[];
  tags: string[];
  seo: { title: string; description: string };
  socialCopy: string;
  pushCopy: string;
  sources: { label: string; url?: string; verifiedBy?: string }[];
  factCheck: { status: "not_started" | "in_progress" | "cleared"; checkedBy?: string; notes?: string };
  embargoIso?: string;
  scheduledIso?: string;
  publishedIso?: string;
  updatedIso?: string;
  corrections: { iso: string; note: string }[];
  relatedAssetIds: string[];
  breaking: boolean;
  readMinutes: number;
}

/* ------------------------------------------------------------------ cities */

export interface City extends Provenanced {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  timezone: string;
  correspondent: string;
  blurb: string;
  scenes: string[];
  venues: { name: string; capacity: number }[];
  radioAffiliateTarget: string;
  otaTarget: string;
}

/* --------------------------------------------------------------- scheduling */

export type ChannelId =
  | "rt_tv"
  | "rt_radio"
  | "rt_live"
  | "rt_next_up"
  | "rt_classics"
  | "rt_popup";

export interface Channel {
  id: ChannelId;
  name: string;
  kind: "linear_tv" | "radio" | "live" | "fast_popup";
  feedVariants: ("clean" | "explicit")[];
  platforms: Platform[];
  status: "on_air" | "standby" | "off_air";
  description: string;
}

export interface ScheduleItem {
  id: string;
  channelId: ChannelId;
  /** ISO start time in network time (America/New_York). */
  startIso: string;
  durationSeconds: number;
  kind: "episode" | "promo" | "commercial_break" | "filler" | "live_window";
  title: string;
  showId?: string;
  episodeId?: string;
  assetId?: string;
  daypart: Daypart;
  explicitAllowed: boolean;
  approved: boolean;
  regionBlackouts?: string[];
}

export type Daypart = "overnight" | "morning" | "midday" | "afternoon" | "primetime" | "late";

export interface ScheduleIssue {
  severity: "error" | "warning";
  code:
    | "gap"
    | "overlap"
    | "rights_window"
    | "explicit_restriction"
    | "missing_captions"
    | "unapproved"
    | "missing_asset";
  message: string;
  itemId?: string;
  channelId: ChannelId;
  startIso?: string;
}

/* ------------------------------------------------------------ distribution */

export interface DistributionEndpoint {
  id: string;
  name: string;
  platform: Platform;
  package: string;
  status: "live" | "provisioning" | "error" | "paused" | "prospect";
  territory: string;
  technicalFormat: string;
  scheduledDelivery: string;
  lastSuccessIso?: string;
  lastError?: string;
  ownerUserId: string;
  monthlyRevenueUsd: number;
  monthlyImpressions: number;
  rightsEligible: boolean;
  vendor?: string;
}

/* -------------------------------------------------------------- monetization */

export interface Advertiser {
  id: string;
  name: string;
  category: string;
  restrictedCategory?: RestrictedCategory;
  contact: string;
}

export interface Campaign {
  id: string;
  advertiserId: string;
  name: string;
  startIso: string;
  endIso: string;
  budgetUsd: number;
  deliveredUsd: number;
  platforms: Platform[];
  geoTargets: string[];
  dayparts: Daypart[];
  frequencyCapPerDay: number;
  contentExclusions: string[];
  restrictedCategory?: RestrictedCategory;
  ageGate?: number;
  impressions: number;
  completions: number;
  clicks: number;
  status: "draft" | "pending_compliance" | "approved" | "live" | "paused" | "completed";
  makeGoodImpressions: number;
}

export interface SponsorOpportunity {
  id: string;
  name: string;
  franchise: Pillar;
  platforms: Platform[];
  rateCardUsd: number;
  unit: string;
  inventoryPerMonth: number;
  description: string;
  deliverables: string[];
}

/* ---------------------------------------------------------------- affiliates */

export interface AffiliatePackage {
  id: string;
  name: string;
  kind: "tv" | "radio" | "both";
  summary: string;
  hoursPerWeek: string;
  localAvailsPerHour: number;
  feed: string;
  requirements: string[];
  exclusivity: string;
  priceModel: string;
}

export interface Affiliate {
  id: string;
  station: string;
  market: string;
  kind: "tv" | "radio";
  packageId: string;
  status: "prospect" | "in_negotiation" | "contracted" | "on_air";
  contactName: string;
  exclusivityWindow?: string;
  lastReportIso?: string;
}

/* ------------------------------------------------------- artist submissions */

export interface SubmissionPlan {
  id: string;
  name: string;
  priceUsd: number;
  cadence: string;
  features: string[];
  /** Explicit, load-bearing statement: no plan buys editorial or chart placement. */
  editorialGuarantee: string;
  highlight?: boolean;
}

export interface Submission {
  id: string;
  artistName: string;
  contactEmail: string;
  trackTitle: string;
  city: string;
  planId: string;
  explicitVersion: boolean;
  cleanVersion: boolean;
  isrc?: string;
  iswc?: string;
  upc?: string;
  label?: string;
  publisher?: string;
  pro?: string;
  territories: string[];
  licenseStartIso?: string;
  licenseEndIso?: string;
  rightsDocsProvided: boolean;
  nextUpApplication: boolean;
  status: "received" | "in_review" | "editorial_hold" | "accepted" | "declined";
  submittedIso: string;
  notes?: string;
}

/* ---------------------------------------------------------------- ops/health */

export interface DriveSyncRecord {
  id: string;
  folder: "ARTICLES" | "VIDEOS";
  fileName: string;
  driveLink: string;
  mimeType: string;
  detectedIso: string;
  status: "detected" | "imported" | "duplicate" | "matched" | "error";
  matchedAssetId?: string;
  matchedArticleId?: string;
  aiSuggestions?: { headline?: string; summary?: string; tags?: string[]; artists?: string[] };
  notifiedUserId?: string;
  message?: string;
}

export interface HealthCheck {
  id: string;
  area:
    | "feeds"
    | "transcode"
    | "captions"
    | "rights"
    | "delivery"
    | "schedule"
    | "advertising"
    | "storage"
    | "api"
    | "drive_sync"
    | "editorial";
  label: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  value?: string;
  updatedIso: string;
}

export interface TickerItem {
  id: string;
  kind: "release" | "breaking" | "chart" | "live" | "premiere" | "concert";
  text: string;
  href?: string;
  iso: string;
}

export interface RadioSegment {
  id: string;
  title: string;
  kind: "music" | "news" | "interview" | "countdown" | "dj_show" | "discovery" | "id" | "spot_window";
  durationSeconds: number;
  artist?: string;
  explicit: boolean;
  cleanAvailable: boolean;
  startIso: string;
}

export interface SyndicatedFormat {
  id: string;
  name: string;
  length: string;
  cadence: string;
  description: string;
  feed: "clean" | "explicit" | "both";
  deliveryWindow: string;
}
