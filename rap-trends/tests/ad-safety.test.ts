import { describe, expect, it } from "vitest";
import { CATEGORY_RULES, completionRate, evaluatePlacement, pacing } from "@/lib/ad-safety";
import type { Campaign, MediaAsset, RightsWindow } from "@/lib/types";

const NOW = "2026-06-15T12:00:00.000Z";

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "c1", advertiserId: "adv1", name: "Test campaign",
    startIso: "2026-06-01T00:00:00.000Z", endIso: "2026-06-30T00:00:00.000Z",
    budgetUsd: 100_000, deliveredUsd: 50_000,
    platforms: ["fast", "web", "ctv_app", "ota"], geoTargets: ["US"],
    dayparts: ["primetime", "late", "overnight", "afternoon"], frequencyCapPerDay: 3,
    contentExclusions: [], impressions: 1_000_000, completions: 900_000,
    clicks: 5_000, status: "approved", makeGoodImpressions: 0, ...overrides,
  };
}

function asset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: "a1", title: "SESSIONS — live performance", description: "A live set",
    type: "performance", durationSeconds: 2400, resolution: "1920x1080",
    aspectRatio: "16:9", audioFormat: "stereo", rating: "TV-14", explicit: false,
    captionStatus: "human_reviewed", transcriptStatus: "human_reviewed",
    qcStatus: "passed", publishStatus: "published", createdIso: NOW,
    provenance: "demo", ...overrides,
  };
}

function rights(adRestrictions: RightsWindow["adRestrictions"] = []): RightsWindow {
  return {
    id: "w1", assetId: "a1", rightsOwner: "RAP TRENDS", cleared: ["master_recording", "publishing"],
    platforms: ["fast"], territories: ["WORLDWIDE"], startIso: "2026-01-01T00:00:00.000Z",
    endIso: null, adRestrictions, talentReleaseOnFile: true, notes: "",
  };
}

describe("standard campaigns", () => {
  it("allows an approved campaign on a purchased platform and daypart", () => {
    const decision = evaluatePlacement({
      campaign: campaign(), platform: "fast", daypart: "primetime", territory: "US",
    });
    expect(decision.allowed).toBe(true);
  });

  it("refuses a campaign that has not cleared compliance", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ status: "pending_compliance" }), platform: "fast", daypart: "primetime", territory: "US",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockers.some((b) => /compliance review/i.test(b))).toBe(true);
  });

  it("refuses a platform the campaign was not trafficked for", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ platforms: ["web"] }), platform: "fast", daypart: "primetime", territory: "US",
    });
    expect(decision.allowed).toBe(false);
  });

  it("warns, without refusing, outside the purchased dayparts", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ dayparts: ["primetime"] }), platform: "fast", daypart: "morning", territory: "US",
    });
    expect(decision.allowed).toBe(true);
    expect(decision.warnings.some((w) => /purchased dayparts/i.test(w))).toBe(true);
  });

  it("refuses a programme matching a content exclusion", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ contentExclusions: ["live performance"] }),
      platform: "fast", daypart: "primetime", territory: "US", asset: asset(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockers.some((b) => /content exclusion/i.test(b))).toBe(true);
  });
});

describe("alcohol", () => {
  const alcohol = campaign({ restrictedCategory: "alcohol", ageGate: 21 });

  it("runs in permitted dayparts", () => {
    expect(evaluatePlacement({ campaign: alcohol, platform: "fast", daypart: "late", territory: "US" }).allowed).toBe(true);
  });

  it("is refused in the morning", () => {
    const decision = evaluatePlacement({ campaign: alcohol, platform: "fast", daypart: "morning", territory: "US" });
    expect(decision.allowed).toBe(false);
    expect(decision.blockers.some((b) => /restricted to/i.test(b))).toBe(true);
  });

  it("is refused below the 21+ age gate", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ restrictedCategory: "alcohol", ageGate: 18 }),
      platform: "fast", daypart: "late", territory: "US",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockers.some((b) => /age gate/i.test(b))).toBe(true);
  });

  it("is refused where the programme's own licence forbids the category", () => {
    const decision = evaluatePlacement({
      campaign: alcohol, platform: "fast", daypart: "late", territory: "US",
      asset: asset(), assetRights: rights(["alcohol"]),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.blockers.some((b) => /forbids/i.test(b))).toBe(true);
  });
});

describe("cannabis", () => {
  const cannabis = campaign({
    restrictedCategory: "cannabis", ageGate: 21,
    platforms: ["web", "ios", "android", "fast", "ota", "cable"],
    dayparts: ["late", "overnight"],
  });

  it("is refused on every broadcast and MVPD surface regardless of daypart", () => {
    for (const platform of ["ota", "cable", "vmvpd", "radio_affiliate", "fast"] as const) {
      const decision = evaluatePlacement({ campaign: cannabis, platform, daypart: "late", territory: "US" });
      expect(decision.allowed, `${platform} should be refused`).toBe(false);
    }
  });

  it("is permitted late on owned digital inventory", () => {
    expect(evaluatePlacement({ campaign: cannabis, platform: "web", daypart: "late", territory: "US" }).allowed).toBe(true);
  });

  it("is refused in primetime even on digital", () => {
    expect(evaluatePlacement({ campaign: cannabis, platform: "web", daypart: "primetime", territory: "US" }).allowed).toBe(false);
  });
});

describe("gambling and other categories", () => {
  it("refuses gambling below the age gate", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ restrictedCategory: "gambling", ageGate: 18 }),
      platform: "fast", daypart: "primetime", territory: "US",
    });
    expect(decision.allowed).toBe(false);
  });

  it("allows gambling at 21+ in a permitted daypart", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ restrictedCategory: "gambling", ageGate: 21 }),
      platform: "fast", daypart: "primetime", territory: "US",
    });
    expect(decision.allowed).toBe(true);
  });

  it("refuses a restricted category on inventory that cannot demonstrate an age-verified audience", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ restrictedCategory: "alcohol", ageGate: 21 }),
      platform: "fast", daypart: "late", territory: "US", ageVerifiedAudience: false,
    });
    expect(decision.allowed).toBe(false);
  });

  it("refuses pharma on social", () => {
    const decision = evaluatePlacement({
      campaign: campaign({ restrictedCategory: "pharma", ageGate: 18, platforms: ["social"] }),
      platform: "social", daypart: "primetime", territory: "US",
    });
    expect(decision.allowed).toBe(false);
  });

  it("keeps every category rule at or above 18", () => {
    for (const rule of Object.values(CATEGORY_RULES)) {
      expect(rule.minAudienceAge).toBeGreaterThanOrEqual(18);
    }
  });
});

describe("delivery arithmetic", () => {
  it("computes pacing against an even flight", () => {
    // Half the flight elapsed, half the budget delivered — exactly on plan.
    expect(pacing(campaign(), NOW)).toBeCloseTo(1, 1);
  });

  it("reports over-delivery above 1", () => {
    expect(pacing(campaign({ deliveredUsd: 90_000 }), NOW)).toBeGreaterThan(1.5);
  });

  it("reports under-delivery below 1", () => {
    expect(pacing(campaign({ deliveredUsd: 10_000 }), NOW)).toBeLessThan(0.5);
  });

  it("does not divide by zero on a zero budget", () => {
    expect(pacing(campaign({ budgetUsd: 0 }), NOW)).toBe(0);
  });

  it("computes completion rate as a percentage", () => {
    expect(completionRate(campaign())).toBe(90);
    expect(completionRate(campaign({ impressions: 0 }))).toBe(0);
  });
});
