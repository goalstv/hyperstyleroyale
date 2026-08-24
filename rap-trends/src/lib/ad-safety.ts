import type { Campaign, MediaAsset, Platform, RestrictedCategory, RightsWindow } from "./types";
import type { Daypart } from "./types";

/**
 * Advertising safety gate.
 *
 * Age-restricted categories carry statutory and contractual limits that differ
 * by category, platform, and daypart. This module refuses the placement rather
 * than trusting a trafficker to remember the rules.
 */

export const RESTRICTED_LABELS: Record<RestrictedCategory, string> = {
  alcohol: "Alcohol",
  cannabis: "Cannabis",
  gambling: "Gambling / sports betting",
  political: "Political / issue advocacy",
  pharma: "Pharmaceutical",
  age_restricted: "Other age-restricted",
};

export interface CategoryRule {
  /** Minimum audience age the placement must be able to demonstrate. */
  minAudienceAge: number;
  /** Dayparts the category may run in on linear feeds. */
  allowedDayparts: Daypart[];
  /** Platform classes the category may never run on. */
  blockedPlatforms: Platform[];
  /** Territories where the category is refused outright pending counsel. */
  blockedTerritories: string[];
  note: string;
}

export const CATEGORY_RULES: Record<RestrictedCategory, CategoryRule> = {
  alcohol: {
    minAudienceAge: 21,
    allowedDayparts: ["afternoon", "primetime", "late", "overnight"],
    blockedPlatforms: [],
    blockedTerritories: [],
    note: "Requires a 71.6% legal-age composition attestation and approved creative copy.",
  },
  cannabis: {
    minAudienceAge: 21,
    allowedDayparts: ["late", "overnight"],
    // Federal law makes cannabis advertising unavailable on broadcast and most
    // MVPD carriage regardless of state legality.
    blockedPlatforms: ["ota", "cable", "vmvpd", "radio_affiliate", "fast"],
    blockedTerritories: [],
    note: "State-legal markets only, digital owned-and-operated inventory only, counsel sign-off required per market.",
  },
  gambling: {
    minAudienceAge: 21,
    allowedDayparts: ["afternoon", "primetime", "late", "overnight"],
    blockedPlatforms: [],
    blockedTerritories: [],
    note: "Geo-fenced to states with a live licence; responsible-gaming disclosure required in every creative.",
  },
  political: {
    minAudienceAge: 18,
    allowedDayparts: ["overnight", "morning", "midday", "afternoon", "primetime", "late"],
    blockedPlatforms: [],
    blockedTerritories: [],
    note: "Political file, disclosure, and lowest-unit-charge obligations apply on any broadcast carriage.",
  },
  pharma: {
    minAudienceAge: 18,
    allowedDayparts: ["morning", "midday", "afternoon", "primetime", "late", "overnight"],
    blockedPlatforms: ["social"],
    blockedTerritories: [],
    note: "Fair-balance and major-statement requirements apply.",
  },
  age_restricted: {
    minAudienceAge: 18,
    allowedDayparts: ["late", "overnight"],
    blockedPlatforms: ["ota"],
    blockedTerritories: [],
    note: "Reviewed case by case by the rights and compliance manager.",
  },
};

export interface PlacementInput {
  campaign: Campaign;
  platform: Platform;
  daypart: Daypart;
  territory: string;
  /** The programme the spot would sit inside. */
  asset?: MediaAsset;
  assetRights?: RightsWindow;
  /** Whether the placement can demonstrate an age-gated audience. */
  ageVerifiedAudience?: boolean;
}

export interface PlacementDecision {
  allowed: boolean;
  blockers: string[];
  warnings: string[];
}

export function evaluatePlacement(input: PlacementInput): PlacementDecision {
  const { campaign, platform, daypart, territory, asset, assetRights } = input;
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (campaign.status === "draft" || campaign.status === "pending_compliance") {
    blockers.push("Campaign has not cleared compliance review.");
  }

  if (!campaign.platforms.includes(platform)) {
    blockers.push(`Campaign is not trafficked for ${platform.toUpperCase()}.`);
  }

  if (campaign.geoTargets.length > 0 && !campaign.geoTargets.includes("US") && !campaign.geoTargets.includes(territory)) {
    blockers.push(`Territory ${territory} is outside the campaign's geographic targeting.`);
  }

  if (campaign.dayparts.length > 0 && !campaign.dayparts.includes(daypart)) {
    warnings.push(`Placement falls outside the campaign's purchased dayparts (${campaign.dayparts.join(", ")}).`);
  }

  const category = campaign.restrictedCategory;
  if (category) {
    const rule = CATEGORY_RULES[category];

    if (rule.blockedPlatforms.includes(platform)) {
      blockers.push(
        `${RESTRICTED_LABELS[category]} advertising is not permitted on ${platform.toUpperCase()}. ${rule.note}`,
      );
    }
    if (!rule.allowedDayparts.includes(daypart)) {
      blockers.push(
        `${RESTRICTED_LABELS[category]} advertising is restricted to ${rule.allowedDayparts.join(", ")} — this placement is ${daypart}.`,
      );
    }
    if (rule.blockedTerritories.includes(territory)) {
      blockers.push(`${RESTRICTED_LABELS[category]} advertising is blocked in ${territory}.`);
    }
    if ((campaign.ageGate ?? 0) < rule.minAudienceAge) {
      blockers.push(
        `Campaign age gate (${campaign.ageGate ?? "none"}) is below the ${rule.minAudienceAge}+ requirement for ${RESTRICTED_LABELS[category]}.`,
      );
    }
    if (input.ageVerifiedAudience === false) {
      blockers.push("This inventory cannot demonstrate an age-verified audience.");
    }

    // The programme's own licence can forbid categories the campaign is cleared for.
    const assetRestrictions = assetRights?.adRestrictions ?? [];
    if (assetRestrictions.includes(category)) {
      blockers.push(
        `The rights record for "${asset?.title ?? "this programme"}" forbids ${RESTRICTED_LABELS[category]} advertising.`,
      );
    }
  }

  if (asset && campaign.contentExclusions.length > 0) {
    const haystack = `${asset.title} ${asset.description}`.toLowerCase();
    const hit = campaign.contentExclusions.find((x) => haystack.includes(x.toLowerCase()));
    if (hit) blockers.push(`Content exclusion "${hit}" matches this programme.`);
  }

  if (asset?.rating === "TV-MA" && (campaign.ageGate ?? 0) < 17 && category) {
    warnings.push("Restricted-category creative adjacent to TV-MA content — review adjacency policy.");
  }

  return { allowed: blockers.length === 0, blockers, warnings };
}

/** Pacing: >1 means over-delivering against an even flight. */
export function pacing(campaign: Campaign, nowIso: string): number {
  const start = Date.parse(campaign.startIso);
  const end = Date.parse(campaign.endIso);
  const now = Math.min(Math.max(Date.parse(nowIso), start), end);
  const elapsed = (now - start) / (end - start || 1);
  if (elapsed <= 0 || campaign.budgetUsd === 0) return 0;
  const expected = campaign.budgetUsd * elapsed;
  return Math.round((campaign.deliveredUsd / expected) * 100) / 100;
}

export function completionRate(campaign: Campaign): number {
  if (campaign.impressions === 0) return 0;
  return Math.round((campaign.completions / campaign.impressions) * 1000) / 10;
}
