import { describe, expect, it } from "vitest";
import { checkEligibility, expiringSoon, PLATFORM_REQUIREMENTS } from "@/lib/rights";
import type { MediaAsset, RightsWindow } from "@/lib/types";

const NOW = "2026-06-01T12:00:00.000Z";

function asset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: "a1", title: "Test asset", description: "", type: "long_form_video",
    durationSeconds: 1800, resolution: "1920x1080", aspectRatio: "16:9",
    audioFormat: "stereo", rating: "TV-14", explicit: false,
    captionStatus: "human_reviewed", transcriptStatus: "human_reviewed",
    qcStatus: "passed", publishStatus: "published", createdIso: NOW,
    provenance: "demo", ...overrides,
  };
}

function window(overrides: Partial<RightsWindow> = {}): RightsWindow {
  return {
    id: "w1", assetId: "a1", rightsOwner: "Test",
    cleared: ["master_recording", "publishing", "music_video_exhibition", "public_performance", "digital_performance", "synchronization", "mechanical"],
    platforms: ["web", "fast", "ota", "youtube", "radio_affiliate", "cable"],
    territories: ["US"], startIso: "2026-01-01T00:00:00.000Z", endIso: null,
    adRestrictions: [], talentReleaseOnFile: true, notes: "", ...overrides,
  };
}

describe("the gate fails closed", () => {
  it("blocks delivery when no rights record exists", () => {
    const result = checkEligibility({ asset: asset(), window: undefined, platform: "fast", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.blockers[0]).toMatch(/No rights record/i);
    expect(result.missingRights).toEqual(PLATFORM_REQUIREMENTS.fast);
  });

  it("clears a fully licensed asset on an authorized platform", () => {
    const result = checkEligibility({ asset: asset(), window: window(), platform: "fast", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(true);
    expect(result.blockers).toEqual([]);
  });
});

describe("per-right and per-platform checks", () => {
  it("blocks a platform whose required rights are not all cleared", () => {
    const w = window({ cleared: ["master_recording", "publishing"] });
    const result = checkEligibility({ asset: asset(), window: w, platform: "fast", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.missingRights).toContain("music_video_exhibition");
    expect(result.missingRights).toContain("public_performance");
  });

  it("blocks a platform the licence does not name, even when the rights exist", () => {
    const w = window({ platforms: ["web"] });
    const result = checkEligibility({ asset: asset(), window: w, platform: "fast", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.blockers.some((b) => /does not grant FAST/i.test(b))).toBe(true);
  });

  it("blocks social and YouTube without a synchronization right", () => {
    const w = window({
      cleared: ["master_recording", "publishing", "music_video_exhibition", "public_performance", "digital_performance"],
      platforms: ["youtube"],
    });
    const result = checkEligibility({ asset: asset(), window: w, platform: "youtube", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.missingRights).toContain("synchronization");
  });
});

describe("territory", () => {
  it("blocks a territory outside the licence", () => {
    const result = checkEligibility({ asset: asset(), window: window({ territories: ["US"] }), platform: "web", territory: "GB", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.blockers.some((b) => b.includes("GB"))).toBe(true);
  });

  it("accepts any territory under a worldwide licence", () => {
    const result = checkEligibility({ asset: asset(), window: window({ territories: ["WORLDWIDE"] }), platform: "web", territory: "NG", atIso: NOW });
    expect(result.eligible).toBe(true);
  });
});

describe("licence windows", () => {
  it("blocks before the window opens", () => {
    const w = window({ startIso: "2026-09-01T00:00:00.000Z" });
    const result = checkEligibility({ asset: asset(), window: w, platform: "web", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.blockers.some((b) => /has not opened/i.test(b))).toBe(true);
  });

  it("blocks after the window closes", () => {
    const w = window({ endIso: "2026-05-01T00:00:00.000Z" });
    const result = checkEligibility({ asset: asset(), window: w, platform: "web", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.blockers.some((b) => /expired/i.test(b))).toBe(true);
  });

  it("warns, without blocking, inside the 30-day expiry window", () => {
    const w = window({ endIso: new Date(Date.parse(NOW) + 12 * 86_400_000).toISOString() });
    const result = checkEligibility({ asset: asset(), window: w, platform: "web", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(true);
    expect(result.warnings.some((x) => /expires in 12 days/i.test(x))).toBe(true);
    expect(result.daysRemaining).toBe(12);
  });
});

describe("captions", () => {
  it("blocks a captioned platform when no captions exist", () => {
    const result = checkEligibility({ asset: asset({ captionStatus: "none" }), window: window(), platform: "fast", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.blockers.some((b) => /captions are required/i.test(b))).toBe(true);
  });

  it("blocks AI-drafted captions that no human has reviewed", () => {
    const result = checkEligibility({ asset: asset({ captionStatus: "auto_draft" }), window: window(), platform: "fast", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
    expect(result.blockers.some((b) => /AI-drafted/i.test(b))).toBe(true);
  });

  it("does not require captions on a platform that does not need them", () => {
    const w = window({ platforms: ["podcast"], cleared: ["master_recording", "publishing", "mechanical"] });
    const result = checkEligibility({ asset: asset({ captionStatus: "none" }), window: w, platform: "podcast", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(true);
  });
});

describe("clean-version enforcement", () => {
  it("blocks explicit audio on over-the-air with no clean version linked", () => {
    const result = checkEligibility({
      asset: asset({ explicit: true, cleanVersionAssetId: undefined }),
      window: window(), platform: "ota", territory: "US", atIso: NOW,
    });
    expect(result.eligible).toBe(false);
    expect(result.blockers.some((b) => /requires a clean version/i.test(b))).toBe(true);
  });

  it("clears explicit audio on OTA once a clean version is linked", () => {
    const result = checkEligibility({
      asset: asset({ explicit: true, cleanVersionAssetId: "a1_clean" }),
      window: window(), platform: "ota", territory: "US", atIso: NOW,
    });
    expect(result.eligible).toBe(true);
  });

  it("blocks explicit audio on the radio affiliate feed without a clean version", () => {
    const w = window({ cleared: ["master_recording", "publishing", "public_performance"], platforms: ["radio_affiliate"] });
    const result = checkEligibility({
      asset: asset({ explicit: true, captionStatus: "none" }), window: w,
      platform: "radio_affiliate", territory: "US", atIso: NOW,
    });
    expect(result.eligible).toBe(false);
  });
});

describe("production state", () => {
  it("blocks an asset that failed QC", () => {
    const result = checkEligibility({ asset: asset({ qcStatus: "failed" }), window: window(), platform: "web", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
  });

  it("warns on incomplete QC without blocking", () => {
    const result = checkEligibility({ asset: asset({ qcStatus: "pending" }), window: window(), platform: "web", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(true);
    expect(result.warnings.some((w) => /quality control/i.test(w))).toBe(true);
  });

  it("blocks an interview with no talent release on file", () => {
    const result = checkEligibility({
      asset: asset({ type: "interview" }), window: window({ talentReleaseOnFile: false }),
      platform: "web", territory: "US", atIso: NOW,
    });
    expect(result.eligible).toBe(false);
    expect(result.blockers.some((b) => /talent release/i.test(b))).toBe(true);
  });

  it("blocks an asset under an active takedown", () => {
    const result = checkEligibility({ asset: asset({ publishStatus: "taken_down" }), window: window(), platform: "web", territory: "US", atIso: NOW });
    expect(result.eligible).toBe(false);
  });
});

describe("expiry reporting", () => {
  it("returns windows lapsing inside the horizon, soonest first", () => {
    const windows = [
      window({ id: "far", endIso: new Date(Date.parse(NOW) + 200 * 86_400_000).toISOString() }),
      window({ id: "soon", endIso: new Date(Date.parse(NOW) + 10 * 86_400_000).toISOString() }),
      window({ id: "mid", endIso: new Date(Date.parse(NOW) + 30 * 86_400_000).toISOString() }),
      window({ id: "open", endIso: null }),
      window({ id: "past", endIso: new Date(Date.parse(NOW) - 5 * 86_400_000).toISOString() }),
    ];
    const result = expiringSoon(windows, NOW, 45);
    expect(result.map((w) => w.id)).toEqual(["soon", "mid"]);
  });
});
