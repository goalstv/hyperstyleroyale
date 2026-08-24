import type { Advertiser, Campaign, SponsorOpportunity, SubmissionPlan, Submission } from "@/lib/types";
import { daysAgoIso, daysAheadIso } from "@/lib/clock";

/** Five sponsorship opportunities, priced off a rate card. DEMONSTRATION RATES. */
export const SPONSOR_OPPORTUNITIES: SponsorOpportunity[] = [
  {
    id: "spo_01", name: "TRENDING 10 presenting sponsorship", franchise: "TRENDING 10",
    platforms: ["fast", "ctv_app", "web", "youtube", "social"], rateCardUsd: 85_000, unit: "per month",
    inventoryPerMonth: 1,
    description: "Opening and closing billboards on every countdown, a persistent chart-graphic lockup, and the daily chart post on social.",
    deliverables: ["Open and close billboards, :05 each", "Chart lower-third lockup", "Daily social chart card", "Monthly proof-of-performance report"],
  },
  {
    id: "spo_02", name: "NEXT UP presenting sponsorship", franchise: "NEXT UP",
    platforms: ["fast", "ctv_app", "web", "youtube"], rateCardUsd: 60_000, unit: "per month",
    inventoryPerMonth: 1,
    description: "The emerging-artist franchise, presented. Sponsorship buys the surround — never the selection.",
    deliverables: ["Presenting billboards", "One branded segment per episode", "Artist-showcase event integration", "Monthly report"],
  },
  {
    id: "spo_03", name: "RAP TRENDS SESSIONS branded production", franchise: "RAP TRENDS SESSIONS",
    platforms: ["fast", "ctv_app", "web", "youtube", "social"], rateCardUsd: 140_000, unit: "per four-episode arc",
    inventoryPerMonth: 1,
    description: "Co-produced live performance episodes with on-set brand presence, cut for television, radio, and social.",
    deliverables: ["Four episodes", "Set integration", "12 social cuts", "Radio edit", "Usage rights for 12 months"],
  },
  {
    id: "spo_04", name: "CITY REPORT market sponsorship", franchise: "CITY REPORT",
    platforms: ["fast", "ctv_app", "web", "social"], rateCardUsd: 22_000, unit: "per market, per month",
    inventoryPerMonth: 13,
    description: "Sponsor one bureau. Local relevance at network production quality, sold market by market.",
    deliverables: ["Market billboards", "Local avail priority", "One branded city guide per month", "Monthly report"],
  },
  {
    id: "spo_05", name: "RAP TRENDS RADIO hourly report sponsorship", franchise: "RAP TRENDS RADIO",
    platforms: ["internet_radio", "radio_affiliate", "podcast"], rateCardUsd: 35_000, unit: "per month",
    inventoryPerMonth: 2,
    description: "Presenting position on every hourly report across the network and the affiliate feed.",
    deliverables: ["Hourly billboard, :07", "Podcast pre-roll", "Affiliate-market co-branding", "Monthly affidavit"],
  },
];

export const ADVERTISERS: Advertiser[] = [
  { id: "adv_01", name: "Demo Athletic Brand", category: "Apparel & footwear", contact: "placeholder@example.com" },
  { id: "adv_02", name: "Demo Streaming Service", category: "Media & entertainment", contact: "placeholder@example.com" },
  { id: "adv_03", name: "Demo Spirits Co.", category: "Beverage alcohol", restrictedCategory: "alcohol", contact: "placeholder@example.com" },
  { id: "adv_04", name: "Demo Sportsbook", category: "Gaming", restrictedCategory: "gambling", contact: "placeholder@example.com" },
  { id: "adv_05", name: "Demo Wellness Co.", category: "Cannabis retail", restrictedCategory: "cannabis", contact: "placeholder@example.com" },
  { id: "adv_06", name: "Demo Financial App", category: "Financial services", contact: "placeholder@example.com" },
];

export const ADVERTISER_BY_ID = new Map(ADVERTISERS.map((a) => [a.id, a]));

/** DEMONSTRATION CAMPAIGNS. Delivery figures are synthetic. */
export const CAMPAIGNS: Campaign[] = [
  {
    id: "cmp_01", advertiserId: "adv_01", name: "Athletic Brand — Q3 sneaker launch",
    startIso: daysAgoIso(18), endIso: daysAheadIso(12), budgetUsd: 240_000, deliveredUsd: 148_000,
    platforms: ["fast", "ctv_app", "web", "youtube", "social"], geoTargets: ["US"],
    dayparts: ["afternoon", "primetime", "late"], frequencyCapPerDay: 4, contentExclusions: [],
    impressions: 4_120_000, completions: 3_710_000, clicks: 28_400, status: "live", makeGoodImpressions: 0,
  },
  {
    id: "cmp_02", advertiserId: "adv_02", name: "Streaming Service — series premiere",
    startIso: daysAgoIso(6), endIso: daysAheadIso(9), budgetUsd: 90_000, deliveredUsd: 51_500,
    platforms: ["fast", "ctv_app", "web"], geoTargets: ["US"], dayparts: ["primetime"],
    frequencyCapPerDay: 3, contentExclusions: [], impressions: 1_480_000, completions: 1_366_000,
    clicks: 9_100, status: "live", makeGoodImpressions: 0,
  },
  {
    id: "cmp_03", advertiserId: "adv_03", name: "Spirits — late-night flight",
    startIso: daysAgoIso(2), endIso: daysAheadIso(28), budgetUsd: 120_000, deliveredUsd: 7_400,
    platforms: ["fast", "ctv_app", "web"], geoTargets: ["US"], dayparts: ["late", "overnight"],
    frequencyCapPerDay: 2, contentExclusions: [], restrictedCategory: "alcohol", ageGate: 21,
    impressions: 210_000, completions: 191_000, clicks: 1_200, status: "live", makeGoodImpressions: 0,
  },
  {
    id: "cmp_04", advertiserId: "adv_04", name: "Sportsbook — season kickoff",
    startIso: daysAheadIso(3), endIso: daysAheadIso(40), budgetUsd: 300_000, deliveredUsd: 0,
    platforms: ["fast", "ctv_app", "web"], geoTargets: ["US"], dayparts: ["primetime", "late"],
    frequencyCapPerDay: 3, contentExclusions: [], restrictedCategory: "gambling", ageGate: 21,
    impressions: 0, completions: 0, clicks: 0, status: "pending_compliance", makeGoodImpressions: 0,
  },
  {
    id: "cmp_05", advertiserId: "adv_05", name: "Cannabis retail — state-legal digital only",
    startIso: daysAheadIso(7), endIso: daysAheadIso(37), budgetUsd: 45_000, deliveredUsd: 0,
    platforms: ["web", "ios", "android"], geoTargets: ["US"], dayparts: ["late", "overnight"],
    frequencyCapPerDay: 2, contentExclusions: [], restrictedCategory: "cannabis", ageGate: 21,
    impressions: 0, completions: 0, clicks: 0, status: "pending_compliance", makeGoodImpressions: 0,
  },
  {
    id: "cmp_06", advertiserId: "adv_06", name: "Financial App — always-on",
    startIso: daysAgoIso(40), endIso: daysAheadIso(50), budgetUsd: 180_000, deliveredUsd: 96_000,
    platforms: ["fast", "web", "podcast", "internet_radio"], geoTargets: ["US"],
    dayparts: ["morning", "midday", "afternoon", "primetime"], frequencyCapPerDay: 5,
    contentExclusions: ["ownership dispute"], impressions: 2_960_000, completions: 2_570_000,
    clicks: 19_800, status: "live", makeGoodImpressions: 140_000,
  },
];

/* ------------------------------------------------------- artist submissions */

export const SUBMISSION_PLANS: SubmissionPlan[] = [
  {
    id: "plan_free", name: "Free", priceUsd: 0, cadence: "per artist",
    features: [
      "Submit up to 2 records per calendar month",
      "Verified artist profile",
      "Editorial review by a human within 14 days",
      "Eligible for NEXT UP, TRENDING 10, and every editorial franchise",
      "Basic airtime report when a record airs",
    ],
    editorialGuarantee: "Free submissions are reviewed by the same editors, against the same criteria, as every other submission.",
  },
  {
    id: "plan_pro", name: "Professional", priceUsd: 29, cadence: "per month",
    features: [
      "Unlimited submissions",
      "Editorial review within 5 business days",
      "Full EPK, rights documentation, and territory management",
      "Verified airtime and performance reporting with market-level detail",
      "Priority for interview and performance invitations",
      "Clearly labelled promotional products available at published rates",
    ],
    editorialGuarantee: "Professional buys faster review and better reporting. It does not buy placement, a chart position, or an editorial decision.",
    highlight: true,
  },
  {
    id: "plan_enterprise", name: "Enterprise", priceUsd: 499, cadence: "per month",
    features: [
      "Label, distributor, and management roster accounts",
      "Bulk submission and catalogue ingestion",
      "API access to airtime and performance reporting",
      "Dedicated rights and metadata support",
      "Campaign planning with the sponsorship team",
      "Quarterly cultural-insight report",
    ],
    editorialGuarantee: "Enterprise buys workflow, reporting, and support. Editorial and chart decisions remain entirely separate from every commercial relationship.",
  },
];

export const SUBMISSION_PLAN_BY_ID = new Map(SUBMISSION_PLANS.map((p) => [p.id, p]));

/** DEMONSTRATION SUBMISSION QUEUE. */
export const SUBMISSIONS: Submission[] = [
  { id: "sub_01", artistName: "Vega Monroe", contactEmail: "placeholder@example.com", trackTitle: "Wicker Park Winter", city: "Chicago", planId: "plan_free", explicitVersion: false, cleanVersion: true, isrc: "DEMO12500001", upc: "0000000000001", label: "Self-released", publisher: "Self", pro: "Placeholder PRO", territories: ["US", "CA"], licenseStartIso: daysAgoIso(30), rightsDocsProvided: true, nextUpApplication: true, status: "accepted", submittedIso: daysAgoIso(24), notes: "Cleared editorial review. Aired on NEXT UP." },
  { id: "sub_02", artistName: "North Pierre", contactEmail: "placeholder@example.com", trackTitle: "Grand River Hymn", city: "Detroit", planId: "plan_pro", explicitVersion: true, cleanVersion: true, isrc: "DEMO12500002", territories: ["US"], rightsDocsProvided: true, nextUpApplication: true, status: "in_review", submittedIso: daysAgoIso(4) },
  { id: "sub_03", artistName: "Obi Strand", contactEmail: "placeholder@example.com", trackTitle: "Braam Nights", city: "Johannesburg", planId: "plan_free", explicitVersion: false, cleanVersion: true, territories: ["ZA", "US"], rightsDocsProvided: false, nextUpApplication: true, status: "editorial_hold", submittedIso: daysAgoIso(2), notes: "Rights documentation incomplete — publishing split unconfirmed. Cannot schedule until resolved." },
  { id: "sub_04", artistName: "Demo Artist Four", contactEmail: "placeholder@example.com", trackTitle: "Placeholder Record", city: "Atlanta", planId: "plan_pro", explicitVersion: true, cleanVersion: false, territories: ["US"], rightsDocsProvided: true, nextUpApplication: false, status: "received", submittedIso: daysAgoIso(1) },
  { id: "sub_05", artistName: "Demo Artist Five", contactEmail: "placeholder@example.com", trackTitle: "Second Placeholder", city: "Los Angeles", planId: "plan_enterprise", explicitVersion: true, cleanVersion: true, territories: ["WORLDWIDE"], rightsDocsProvided: true, nextUpApplication: false, status: "declined", submittedIso: daysAgoIso(11), notes: "Not selected this cycle. Feedback sent." },
];
