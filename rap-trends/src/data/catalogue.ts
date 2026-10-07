/**
 * POLARIS programming catalogue — the real content inventory.
 *
 * Source of record:
 *   Dropbox /rahman dukes/Spacemob/Programming Schedule/
 *     POLARIS_Distributor_Programming_Book_ContentOverview_Big.xlsx
 *   server_modified 2026-07-07T19:38:08Z, retrieved 2026-10-07.
 *
 * Everything in this file is transcribed from that workbook. Nothing is
 * inferred, rounded up, or filled in. Where the workbook is blank, empty, or
 * self-contradictory, the field here is null or absent and the discrepancy is
 * recorded in docs/25-polaris-catalogue.md. In particular:
 *
 *   - Duration is empty for all 293 rows, so no runtime is published.
 *   - Genre reads "Pop, Urban, R&B, Alternative" on every row and Rating reads
 *     "MPAA;TV-MA" on every row. Both are template defaults applied in bulk,
 *     not per-title metadata, so neither is carried into the product.
 *   - The dashboard tab and the detail tab disagree on totals. The detail tab
 *     is used here because it is the one that can be counted.
 *
 * Titles are transcribed exactly as the workbook spells them, including
 * typographical errors, so that a row here can be matched back to its row
 * there. `displayTitle` carries the corrected spelling for on-screen use.
 */

import type { Provenanced } from "@/lib/types";

export const CATALOGUE_SOURCE = {
  file: "POLARIS_Distributor_Programming_Book_ContentOverview_Big.xlsx",
  path: "/rahman dukes/Spacemob/Programming Schedule/",
  store: "dropbox",
  fileModifiedIso: "2026-07-07T19:38:08Z",
  retrievedIso: "2026-10-07T00:00:00Z",
} as const;

/* --------------------------------------------------------------- inventory */

/** A content-type bucket as the workbook's detail tab reports it. */
export interface CatalogueType {
  /** Normalised type name used in the product. */
  type: string;
  /** How the workbook spells it. Several are mis-keyed. */
  asKeyed: string[];
  franchises: number;
  assets: number;
}

/**
 * The detail tab's own sixteen type rows, with the five mis-keyed buckets
 * folded into the type they clearly belong to. Folding changes no totals:
 * the sixteen rows sum to 293 franchises and 1,019 assets either way, which
 * matches the totals the same tab states. See the doc for the audit.
 */
export const CATALOGUE_BY_TYPE: CatalogueType[] = [
  { type: "Series", asKeyed: ["Series"], franchises: 80, assets: 448 },
  { type: "Long Form", asKeyed: ["Long Form", "Log Form"], franchises: 93, assets: 164 },
  { type: "Short Form", asKeyed: ["Short Form", "Shirt Form", "Shortss"], franchises: 37, assets: 39 },
  { type: "Movies", asKeyed: ["Movies", "Moviies"], franchises: 30, assets: 38 },
  { type: "News", asKeyed: ["News"], franchises: 19, assets: 22 },
  { type: "Documentary", asKeyed: ["Documentary", "Documetary"], franchises: 13, assets: 18 },
  { type: "Sports", asKeyed: ["Sports"], franchises: 10, assets: 13 },
  { type: "Livestream", asKeyed: ["Livestream"], franchises: 6, assets: 205 },
  { type: "Performance", asKeyed: ["Performance"], franchises: 3, assets: 4 },
  { type: "Fashion", asKeyed: ["Fashion"], franchises: 1, assets: 1 },
  { type: "Podcast", asKeyed: ["Podcast"], franchises: 1, assets: 67 },
];

/** Totals as the detail tab states them. Verified against the type rows. */
export const CATALOGUE_SUMMARY = {
  ...({ provenance: "verified", provenanceNote: "Counted from the POLARIS programming book, 7 Jul 2026." } as Provenanced),
  franchises: 293,
  assets: 1019,
  largestFranchise: "SMACK URL",
  largestFranchiseAssets: 200,
  programmingModel: "24/7 FAST channel",
  /** Empty in the workbook. Not derivable from it. Do not fill in. */
  libraryHours: null,
} as const;

/* -------------------------------------------------------------- franchises */

/** Who holds the rights, as far as this workbook establishes it. */
export type RightsPosture =
  /** The workbook's own inventory tab marks the strand Owned. */
  | "stated_owned"
  /** No rights record either way. Default for a detail-tab row. */
  | "unrecorded"
  /** Carries another company's brand, so clearance has to be produced. */
  | "third_party_review";

export interface CatalogueFranchise extends Provenanced {
  /** Title exactly as the workbook spells it. */
  sourceTitle: string;
  /** Corrected spelling for on-screen use. */
  displayTitle: string;
  type: string;
  /** Episode / file count from the workbook's Episode Count column. */
  assets: number;
  rights: RightsPosture;
  /** Why clearance is in question. Present only for third_party_review. */
  rightsNote?: string;
}

const counted = {
  provenance: "verified",
  provenanceNote: "Episode count transcribed from the POLARIS programming book.",
} as const;

/**
 * Every franchise in the workbook carrying three or more assets, excluding
 * rows whose title is a working file ID rather than a title (news_final,
 * pnc_v, ep_bike_life, promo_young_thug_polaris, billy_blue). Those five are
 * real content; they have no editorial title yet, and inventing one from the
 * filename is exactly what we do not do. They are listed in the doc as
 * needing titles from POLARIS.
 *
 * Single-asset rows — the bulk of the 293 — are clips, junket pieces and
 * one-off reports rather than strands, so they are inventory, not schedule.
 */
export const CATALOGUE_FRANCHISES: CatalogueFranchise[] = [
  {
    ...counted, sourceTitle: "SMACK URL", displayTitle: "SMACK / URL",
    type: "Livestream", assets: 200, rights: "third_party_review",
    rightsNote:
      "SMACK / Ultimate Rap League is a separate rights holder. 200 livestream assets cannot be scheduled on the strength of this spreadsheet alone.",
  },
  {
    ...counted, sourceTitle: "Whoo Kid / Whoo's House", displayTitle: "Whoo's House",
    type: "Series", assets: 150, rights: "unrecorded",
  },
  {
    ...counted, sourceTitle: "Behind the Rhyme", displayTitle: "Behind the Rhyme",
    type: "Series", assets: 107, rights: "unrecorded",
  },
  {
    ...counted, sourceTitle: 'The "Rap On Wrestling" Show', displayTitle: "Rap on Wrestling",
    type: "Podcast", assets: 67, rights: "stated_owned",
  },
  {
    ...counted, sourceTitle: "Havoc from Mobb Deep Sirius Sattelite Radio Show",
    displayTitle: "Havoc — Mobb Deep", type: "Series", assets: 21, rights: "third_party_review",
    rightsNote:
      "Titled as a SiriusXM satellite radio show. Carriage of a radio licensee's programme needs that licensee's consent.",
  },
  {
    ...counted, sourceTitle: "Mixape Monday", displayTitle: "Mixtape Monday",
    type: "Series", assets: 20, rights: "unrecorded",
  },
  {
    ...counted, sourceTitle: "The Shaheem Reid Show", displayTitle: "The Shaheem Reid Show",
    type: "Series", assets: 18, rights: "unrecorded",
  },
  {
    ...counted, sourceTitle: "Steve Manning, The Man Behind Michael Jackson",
    displayTitle: "Steve Manning — The Man Behind Michael Jackson",
    type: "Series", assets: 17, rights: "third_party_review",
    rightsNote:
      "Michael Jackson name, likeness and music sit with the estate. First-person interview footage with Manning is a different clearance from any archive cut into it.",
  },
  {
    ...counted, sourceTitle: "Timeline", displayTitle: "Timeline",
    type: "Series", assets: 10, rights: "unrecorded",
  },
  {
    ...counted, sourceTitle: "Wine & Hip-Hop", displayTitle: "Wine & Hip-Hop",
    type: "Series", assets: 6, rights: "stated_owned",
  },
  {
    ...counted, sourceTitle: "F.D.R. Boulevard (Food & Drinks)", displayTitle: "F.D.R. Boulevard",
    type: "Series", assets: 5, rights: "unrecorded",
  },
  {
    ...counted, sourceTitle: '"The MTV Effect: The First Hip-Hop Podcast"',
    displayTitle: "The MTV Effect", type: "Series", assets: 4, rights: "third_party_review",
    rightsNote:
      "MTV is a Paramount trademark and the asset already held on the site under this name carries MTV on-screen branding. Held pending written clearance.",
  },
  {
    ...counted, sourceTitle: '"Remembering Chinx"', displayTitle: "Remembering Chinx",
    type: "Documentary", assets: 3, rights: "unrecorded",
  },
  {
    ...counted, sourceTitle: '"Chase\'N Miami"', displayTitle: "Chase'n Miami",
    type: "Long Form", assets: 3, rights: "unrecorded",
  },
];

/* ------------------------------------------------------------- the strands */

/**
 * The workbook's inventory tab. Its Episodes and Avg Runtime columns are
 * shifted — each row carries five values against seven headers — so the one
 * number present cannot be attributed to a column with confidence. It is
 * carried here as `unattributedNumber` rather than guessed into a field.
 */
export interface CatalogueStrand {
  franchise: string;
  genre: string;
  unattributedNumber: number;
  rights: "Owned" | "Mixed";
  status: "Active" | "Seasonal";
}

export const CATALOGUE_STRANDS: CatalogueStrand[] = [
  { franchise: "Crown Source", genre: "News", unattributedNumber: 30, rights: "Owned", status: "Active" },
  { franchise: "Rap on Wrestling", genre: "Original", unattributedNumber: 30, rights: "Owned", status: "Active" },
  { franchise: "Steve Manning Collection", genre: "Documentary", unattributedNumber: 30, rights: "Owned", status: "Active" },
  { franchise: "Feature Documentaries", genre: "Docs", unattributedNumber: 90, rights: "Mixed", status: "Active" },
  { franchise: "Music Specials", genre: "Music", unattributedNumber: 60, rights: "Mixed", status: "Active" },
  { franchise: "Podcasts", genre: "Talk", unattributedNumber: 45, rights: "Owned", status: "Active" },
  { franchise: "Sports/HBCU", genre: "Sports", unattributedNumber: 120, rights: "Owned", status: "Seasonal" },
];

/* --------------------------------------------------------- programming grid */

export const DAYPARTS = ["6-9a", "9-12p", "12-3p", "3-6p", "6-8p", "8-10p", "10p-12a"] as const;
export type Daypart = (typeof DAYPARTS)[number];

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/**
 * The 28-day calendar from the workbook. All four weeks are identical in the
 * source, so one week is stored and the 28-day grid is produced from it rather
 * than four copies drifting apart.
 */
export const PROGRAMMING_WEEK: Record<Weekday, Record<Daypart, string>> = {
  Mon: { "6-9a": "Morning Mix", "9-12p": "Lifestyle", "12-3p": "Crown Source", "3-6p": "Interviews", "6-8p": "Culture Update", "8-10p": "Original Series", "10p-12a": "Docs" },
  Tue: { "6-9a": "Morning Mix", "9-12p": "Sports", "12-3p": "Crown Source", "3-6p": "Rap on Wrestling", "6-8p": "Culture Update", "8-10p": "Movie Night", "10p-12a": "Podcasts" },
  Wed: { "6-9a": "Morning Mix", "9-12p": "Music", "12-3p": "Crown Source", "3-6p": "Artist Profiles", "6-8p": "Culture Update", "8-10p": "Concert", "10p-12a": "Docs" },
  Thu: { "6-9a": "Morning Mix", "9-12p": "Business", "12-3p": "Crown Source", "3-6p": "Innovation", "6-8p": "Culture Update", "8-10p": "Investigations", "10p-12a": "Interviews" },
  Fri: { "6-9a": "Morning Mix", "9-12p": "Fashion", "12-3p": "Crown Source", "3-6p": "Best Of", "6-8p": "Culture Update", "8-10p": "Premiere Film", "10p-12a": "Music" },
  Sat: { "6-9a": "Weekend", "9-12p": "Family", "12-3p": "Marathon", "3-6p": "Sports", "6-8p": "Live", "8-10p": "Event", "10p-12a": "Movie" },
  Sun: { "6-9a": "Weekend", "9-12p": "Inspiration", "12-3p": "Weekly Recap", "3-6p": "Marathon", "6-8p": "Wrap", "8-10p": "Documentary", "10p-12a": "Special" },
};

export interface GridCell {
  week: 1 | 2 | 3 | 4;
  day: Weekday;
  daypart: Daypart;
  block: string;
}

/** The full 28-day grid: 4 weeks x 7 days x 7 dayparts = 196 cells. */
export function programmingGrid(): GridCell[] {
  const cells: GridCell[] = [];
  for (const week of [1, 2, 3, 4] as const) {
    for (const day of WEEKDAYS) {
      for (const daypart of DAYPARTS) {
        cells.push({ week, day, daypart, block: PROGRAMMING_WEEK[day][daypart] });
      }
    }
  }
  return cells;
}

/* ------------------------------------------------------------ rotation plan */

export interface RotationRule {
  category: string;
  premiere: string;
  repeatWindow: string;
  monthlyRefresh: string;
  note: string;
}

export const ROTATION_RULES: RotationRule[] = [
  { category: "Daily News", premiere: "Daily", repeatWindow: "24–48 hrs", monthlyRefresh: "Continuous", note: "Topical" },
  { category: "Original Series", premiere: "Weekly", repeatWindow: "2–3x/week", monthlyRefresh: "Weekly", note: "Prime focus" },
  { category: "Feature Docs", premiere: "Weekly", repeatWindow: "21–30 days", monthlyRefresh: "Monthly", note: "Anchor" },
  { category: "Films", premiere: "Weekly", repeatWindow: "28–35 days", monthlyRefresh: "Monthly", note: "Friday/Saturday" },
  { category: "Podcasts", premiere: "Weekly", repeatWindow: "10–14 days", monthlyRefresh: "Bi-weekly", note: "Late night" },
  { category: "Sports", premiere: "Seasonal", repeatWindow: "Event-based", monthlyRefresh: "Seasonal", note: "Appointment viewing" },
  { category: "Live Events", premiere: "As available", repeatWindow: "Encore next day", monthlyRefresh: "N/A", note: "Special" },
];

export const PROGRAMMING_PHILOSOPHY = [
  "Prime time is reserved for premieres, originals and event programming.",
  "Daytime emphasises evergreen, library and discovery viewing.",
  "Overnight maximises catalogue utilisation with curated rotations.",
  "The weekly schedule incorporates fresh content while minimising viewer fatigue.",
  "Seasonal events and cultural tentpoles replace standard blocks.",
] as const;

/* -------------------------------------------------------------- the caveats */

/**
 * What the workbook does not establish. Shown on the catalogue page so the
 * numbers above are never read as a cleared, schedulable library.
 *
 * `heading` names the field; `claim` quotes the book's own wording verbatim,
 * including the figure. Quoting a claim in order to mark it unverifiable is not
 * publishing it: a distributor who has seen "3,000+ library hours" in the old
 * book needs that exact figure named and corrected, or the page corrects
 * nothing. The figure appears nowhere else in the product.
 */
export const CATALOGUE_CAVEATS = [
  {
    heading: "Library hours",
    claim: "Current Library Hours — 3,000+",
    status: "unverifiable" as const,
    detail:
      "The Duration column is empty on all 293 rows, so total hours cannot be derived from this workbook. The figure is not published anywhere in the product.",
  },
  {
    heading: "Individual assets",
    claim: "Individual Assets — 1,200+",
    status: "contradicted" as const,
    detail:
      "The detail tab counts 1,019 assets and states 1,019 as its own total. The product uses 1,019.",
  },
  {
    heading: "Original franchises",
    claim: "Original Franchises — 20+",
    status: "different_metric" as const,
    detail:
      "The detail tab counts 293 franchises. The two are not in conflict: 20+ plainly means originals, 293 counts every catalogue row. Neither is published as the other.",
  },
  {
    heading: "Programming mix",
    claim: "Programming Mix percentages",
    status: "empty" as const,
    detail: "Every percentage cell on the dashboard tab is blank. No mix is published.",
  },
  {
    heading: "Rating",
    claim: "Rating — MPAA;TV-MA",
    status: "not_per_title" as const,
    detail:
      "The same value appears on all 293 rows, including news and HBCU sports. It is a bulk default, and TV-MA is a TV Parental Guidelines rating rather than an MPAA one. No rating is published per title.",
  },
  {
    heading: "Genre",
    claim: "Genre — Pop, Urban, R&B, Alternative",
    status: "not_per_title" as const,
    detail: "Identical on all 293 rows. A template default, so it is not published as per-title genre.",
  },
] as const;
