import type {
  Affiliate, AffiliatePackage, Channel, DistributionEndpoint, SyndicatedFormat,
} from "@/lib/types";
import { daysAgoIso, minutesAgoIso } from "@/lib/clock";

export const CHANNELS: Channel[] = [
  { id: "rt_tv", name: "RAP TRENDS TV", kind: "linear_tv", feedVariants: ["clean", "explicit"], platforms: ["fast", "ctv_app", "web", "cable", "vmvpd", "ota"], status: "on_air", description: "The 24/7 flagship linear channel. Clean feed originates for broadcast carriage; the explicit variant runs on owned digital only." },
  { id: "rt_radio", name: "RAP TRENDS RADIO", kind: "radio", feedVariants: ["clean", "explicit"], platforms: ["internet_radio", "radio_affiliate", "web", "ios", "android"], status: "on_air", description: "Continuous audio. Clean affiliate feed carries legal-ID and local commercial windows." },
  { id: "rt_live", name: "RAP TRENDS LIVE", kind: "live", feedVariants: ["clean"], platforms: ["web", "ctv_app", "youtube", "social"], status: "standby", description: "Live event and flagship-programme origination, switched to air at 7:00 PM ET weeknights." },
  { id: "rt_next_up", name: "NEXT UP", kind: "fast_popup", feedVariants: ["clean"], platforms: ["fast", "ctv_app"], status: "standby", description: "Emerging-artist FAST channel. Launches in Phase 3." },
  { id: "rt_classics", name: "RAP TRENDS CLASSICS", kind: "fast_popup", feedVariants: ["clean"], platforms: ["fast", "ctv_app"], status: "off_air", description: "Archive channel. Blocked from launch until chain-of-title clearance completes on the catalogue." },
  { id: "rt_popup", name: "City & event pop-ups", kind: "fast_popup", feedVariants: ["clean"], platforms: ["fast", "ctv_app", "web"], status: "off_air", description: "Short-run channels for festivals, awards, and city takeovers." },
];

export const CHANNEL_BY_ID = new Map(CHANNELS.map((c) => [c.id, c]));

/**
 * DEMONSTRATION DISTRIBUTION STATE.
 *
 * `prospect` and `provisioning` mean exactly what they say. Nothing in this list
 * represents an executed carriage agreement.
 */
export const ENDPOINTS: DistributionEndpoint[] = [
  { id: "ep_web", name: "raptrends.tv — web player", platform: "web", package: "RT TV clean + explicit HLS", status: "live", territory: "WORLDWIDE", technicalFormat: "HLS CMAF, H.264/AAC, 6 renditions to 1080p", scheduledDelivery: "Continuous", lastSuccessIso: minutesAgoIso(1), ownerUserId: "usr_05", monthlyRevenueUsd: 18400, monthlyImpressions: 2_140_000, rightsEligible: true, vendor: "Owned origin + CDN" },
  { id: "ep_ios", name: "RAP TRENDS — iOS", platform: "ios", package: "RT TV + RADIO + VOD", status: "provisioning", territory: "US, CA", technicalFormat: "HLS, FairPlay where required", scheduledDelivery: "Continuous", ownerUserId: "usr_05", monthlyRevenueUsd: 0, monthlyImpressions: 0, rightsEligible: true, vendor: "In-house app" },
  { id: "ep_android", name: "RAP TRENDS — Android", platform: "android", package: "RT TV + RADIO + VOD", status: "provisioning", territory: "US, CA", technicalFormat: "DASH + HLS, Widevine where required", scheduledDelivery: "Continuous", ownerUserId: "usr_05", monthlyRevenueUsd: 0, monthlyImpressions: 0, rightsEligible: true, vendor: "In-house app" },
  { id: "ep_roku", name: "Roku channel", platform: "ctv_app", package: "RT TV linear + VOD", status: "provisioning", territory: "US", technicalFormat: "HLS + SCTE-35, VAST 4.2 / VMAP", scheduledDelivery: "Continuous", ownerUserId: "usr_05", monthlyRevenueUsd: 0, monthlyImpressions: 0, rightsEligible: true, vendor: "Platform certification in progress" },
  { id: "ep_fast_a", name: "FAST aggregator A", platform: "fast", package: "RT TV clean linear + EPG", status: "prospect", territory: "US", technicalFormat: "HLS contribution, SCTE-35, XMLTV EPG", scheduledDelivery: "Pending agreement", ownerUserId: "usr_10", monthlyRevenueUsd: 0, monthlyImpressions: 0, rightsEligible: true, vendor: "Not contracted" },
  { id: "ep_fast_b", name: "FAST platform B", platform: "fast", package: "RT TV clean linear + EPG", status: "prospect", territory: "US", technicalFormat: "HLS contribution, SCTE-35, XMLTV EPG", scheduledDelivery: "Pending agreement", ownerUserId: "usr_10", monthlyRevenueUsd: 0, monthlyImpressions: 0, rightsEligible: true, vendor: "Not contracted" },
  { id: "ep_radio_stream", name: "RAP TRENDS RADIO — internet stream", platform: "internet_radio", package: "Explicit digital feed", status: "live", territory: "WORLDWIDE", technicalFormat: "HLS + Icecast, AAC 128k, now-playing metadata", scheduledDelivery: "Continuous", lastSuccessIso: minutesAgoIso(1), ownerUserId: "usr_05", monthlyRevenueUsd: 4200, monthlyImpressions: 310_000, rightsEligible: true, vendor: "Owned origin" },
  { id: "ep_radio_affil", name: "Radio affiliate clean feed", platform: "radio_affiliate", package: "Clean 24/7 + hourly reports", status: "provisioning", territory: "US", technicalFormat: "Secure IP delivery, automation-compatible metadata, cue tones", scheduledDelivery: "Continuous + hourly drops", ownerUserId: "usr_10", monthlyRevenueUsd: 0, monthlyImpressions: 0, rightsEligible: true, vendor: "Delivery vendor not selected" },
  { id: "ep_youtube", name: "YouTube — RAP TRENDS", platform: "youtube", package: "Clips, SESSIONS, full episodes", status: "live", territory: "WORLDWIDE", technicalFormat: "1080p/4K MP4 + SRT", scheduledDelivery: "Daily 10:00 ET", lastSuccessIso: minutesAgoIso(220), ownerUserId: "usr_07", monthlyRevenueUsd: 6100, monthlyImpressions: 1_480_000, rightsEligible: true },
  { id: "ep_social", name: "Social — vertical clip package", platform: "social", package: "9:16 daily clips", status: "error", territory: "WORLDWIDE", technicalFormat: "1080x1920 MP4, burned-in captions", scheduledDelivery: "Daily 08:00 and 17:00 ET", lastSuccessIso: minutesAgoIso(1500), lastError: "Two clips rejected: source asset asset_ingest_01 has no rights record.", ownerUserId: "usr_07", monthlyRevenueUsd: 2300, monthlyImpressions: 3_900_000, rightsEligible: false },
  { id: "ep_podcast", name: "Podcast — THE BUSINESS", platform: "podcast", package: "Weekly audio + transcript", status: "live", territory: "WORLDWIDE", technicalFormat: "MP3 128k mono, RSS 2.0, chapters", scheduledDelivery: "Tuesdays 06:00 ET", lastSuccessIso: daysAgoIso(2), ownerUserId: "usr_07", monthlyRevenueUsd: 1900, monthlyImpressions: 96_000, rightsEligible: true },
  { id: "ep_cable", name: "Cable / vMVPD carriage", platform: "cable", package: "Broadcast-grade linear, clean feed", status: "prospect", territory: "US", technicalFormat: "Redundant contribution, 608/708 captions, SCTE-35, ratings", scheduledDelivery: "Not scheduled", ownerUserId: "usr_10", monthlyRevenueUsd: 0, monthlyImpressions: 0, rightsEligible: true, vendor: "No agreement. Requires negotiated carriage." },
  { id: "ep_ota", name: "OTA subchannel pilot", platform: "ota", package: "Daypart or full-time subchannel", status: "prospect", territory: "Single pilot market", technicalFormat: "ATSC 1.0 compatible; ATSC 3.0 roadmap", scheduledDelivery: "Not scheduled", ownerUserId: "usr_10", monthlyRevenueUsd: 0, monthlyImpressions: 0, rightsEligible: true, vendor: "Requires a partnership with an FCC-licensed station." },
];

/* --------------------------------------------------------------- affiliates */

export const AFFILIATE_PACKAGES: AffiliatePackage[] = [
  {
    id: "pkg_full", name: "Full-Time Carriage", kind: "both",
    summary: "The complete RAP TRENDS schedule, 24 hours a day, with local insertion windows in every hour.",
    hoursPerWeek: "168", localAvailsPerHour: 8,
    feed: "Clean feed. Explicit variant available for digital simulcast only where the station's rights permit.",
    requirements: [
      "Carriage of network identification and the top-of-hour clock",
      "Pass-through of closed captions without re-encoding",
      "Monthly local-insertion reporting through the affiliate portal",
      "Adherence to the network's restricted-advertising categories",
    ],
    exclusivity: "Market exclusivity for the term, subject to a minimum carriage commitment.",
    priceModel: "Barter — inventory split, no cash licence fee in year one.",
  },
  {
    id: "pkg_daypart", name: "Daypart Block", kind: "tv",
    summary: "Three to six hours a day in a fixed daypart, typically afternoon drive or late night.",
    hoursPerWeek: "21–42", localAvailsPerHour: 10,
    feed: "Clean feed only.",
    requirements: [
      "Fixed daypart placement, consistent day to day",
      "Network identification at the top and tail of the block",
      "Monthly local-insertion reporting",
    ],
    exclusivity: "Daypart exclusivity within the market.",
    priceModel: "Barter — inventory split.",
  },
  {
    id: "pkg_syndication", name: "Program Syndication", kind: "radio",
    summary: "Individual RAP TRENDS programmes and short-form reports dropped into an existing station clock.",
    hoursPerWeek: "2–10", localAvailsPerHour: 12,
    feed: "Clean feed, automation-ready, with cue tones and legal-ID windows.",
    requirements: [
      "Air the programme intact, including sponsor billboards",
      "Carry the network's legal-ID and emergency-override capability",
      "Weekly airplay affidavit through the affiliate portal",
    ],
    exclusivity: "Programme-level exclusivity in the market for the term.",
    priceModel: "Barter — one national unit per quarter-hour retained by the network.",
  },
];

/** DEMONSTRATION PIPELINE. No carriage agreement exists. */
export const AFFILIATES: Affiliate[] = [
  { id: "af_01", station: "Demo Station Group — Market A (TV)", market: "Atlanta", kind: "tv", packageId: "pkg_daypart", status: "in_negotiation", contactName: "Placeholder contact", exclusivityWindow: "Daypart, 12 months" },
  { id: "af_02", station: "Demo Station Group — Market B (Radio)", market: "Houston", kind: "radio", packageId: "pkg_syndication", status: "prospect", contactName: "Placeholder contact" },
  { id: "af_03", station: "Demo Station Group — Market C (Radio)", market: "Memphis", kind: "radio", packageId: "pkg_syndication", status: "prospect", contactName: "Placeholder contact" },
  { id: "af_04", station: "Demo Station Group — Market D (TV)", market: "Miami", kind: "tv", packageId: "pkg_full", status: "prospect", contactName: "Placeholder contact" },
];

/* -------------------------------------------------------- radio syndication */

export const SYNDICATED_FORMATS: SyndicatedFormat[] = [
  { id: "syn_01", name: "RAP TRENDS Update", length: "60 seconds", cadence: "Hourly, 24/7", description: "One story, one chart move, one release. Written for a music clock, voiced for drive time.", feed: "clean", deliveryWindow: ":50 past each hour" },
  { id: "syn_02", name: "RAP TRENDS Report", length: "5 minutes", cadence: "Hourly during dayparts", description: "The hour's news, an artist actuality, and the day's chart movement.", feed: "both", deliveryWindow: ":45 past each hour" },
  { id: "syn_03", name: "TRENDING 10 Countdown", length: "58 minutes", cadence: "Daily", description: "The daily countdown, hosted, with the Index confidence figure read on air.", feed: "clean", deliveryWindow: "Delivered 04:00 ET for same-day use" },
  { id: "syn_04", name: "The RAP TRENDS Weekend Countdown", length: "2 hours", cadence: "Weekly", description: "The week in the format, counted down, with two long-form artist segments.", feed: "clean", deliveryWindow: "Delivered Thursdays 12:00 ET for weekend use" },
  { id: "syn_05", name: "NEXT UP Spotlight", length: "10 minutes", cadence: "Weekly", description: "One emerging artist, two records, one conversation. Editorial selection only.", feed: "clean", deliveryWindow: "Delivered Wednesdays 12:00 ET" },
  { id: "syn_06", name: "The Music Business Minute", length: "90 seconds", cadence: "Weekdays", description: "Ownership, touring, publishing, and deals — written for artists who are working.", feed: "clean", deliveryWindow: "Delivered 05:00 ET daily" },
  { id: "syn_07", name: "Station-branded custom edition", length: "Variable", cadence: "By agreement", description: "Any of the above re-voiced with the affiliate's own branding and local sponsor billboards.", feed: "clean", deliveryWindow: "By agreement" },
];
