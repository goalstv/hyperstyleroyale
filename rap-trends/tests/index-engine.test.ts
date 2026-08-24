import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROFILE, computeConfidence, detectFlags, isPublishable, movement,
  rankEntries, recencyMultiplier, scoreEntry, MIN_SIGNALS_FOR_PUBLICATION,
} from "@/lib/index-engine";
import type { ChartEntry, FraudFlag, IndexSource, SignalBundle } from "@/lib/types";

const NOW = "2026-06-01T12:00:00.000Z";

function source(key: IndexSource["key"], overrides: Partial<IndexSource> = {}): IndexSource {
  return {
    id: `src_${key}`, key, label: key, provider: "test",
    authorization: "licensed_api", status: "connected", weight: 0.1,
    refreshMinutes: 60, lastSyncIso: NOW, notes: "", ...overrides,
  };
}

const ALL_KEYS = Object.keys(DEFAULT_PROFILE.weights) as IndexSource["key"][];
const ALL_SOURCES = ALL_KEYS.map((k) => source(k));

function entry(signals: SignalBundle, overrides: Partial<ChartEntry> = {}): ChartEntry {
  return {
    id: "e1", rank: 1, previousRank: 1, weeksOn: 1, peak: 1, title: "T",
    artistId: "a1", artistName: "A", releaseIso: NOW, cityId: "atl",
    explicit: false, provenance: "demo", signals, ...overrides,
  };
}

describe("recency decay", () => {
  it("is at full strength on release day", () => {
    expect(recencyMultiplier(NOW, NOW, 21)).toBeCloseTo(1, 5);
  });

  it("halves the decaying portion at one half-life", () => {
    const oneHalfLife = new Date(Date.parse(NOW) - 21 * 86_400_000).toISOString();
    expect(recencyMultiplier(oneHalfLife, NOW, 21)).toBeCloseTo(0.55 + 0.45 * 0.5, 5);
  });

  it("floors at 0.55 so resurging catalogue is not erased by age", () => {
    const ancient = new Date(Date.parse(NOW) - 4000 * 86_400_000).toISOString();
    expect(recencyMultiplier(ancient, NOW, 21)).toBeGreaterThanOrEqual(0.55);
    expect(recencyMultiplier(ancient, NOW, 21)).toBeLessThan(0.56);
  });

  it("never goes below the floor for a future-dated release", () => {
    const future = new Date(Date.parse(NOW) + 10 * 86_400_000).toISOString();
    expect(recencyMultiplier(future, NOW, 21)).toBeCloseTo(1, 5);
  });
});

describe("signal contribution", () => {
  it("counts only signals whose source is connected", () => {
    const signals: SignalBundle = { streaming_velocity: 100, radio_airplay: 0 };
    const sources = [source("streaming_velocity"), source("radio_airplay", { status: "disabled" })];
    const score = scoreEntry(entry(signals), { sources, nowIso: NOW });

    expect(score.contributions.map((c) => c.key)).toEqual(["streaming_velocity"]);
    // Re-normalized across used weight: a single 100 reading yields 100 before multipliers.
    expect(score.score).toBeCloseTo(100, 1);
  });

  it("excludes a signal whose source has no executed agreement", () => {
    const signals: SignalBundle = { streaming_velocity: 50, shazam: 100 };
    const sources = [source("streaming_velocity"), source("shazam", { status: "pending_agreement" })];
    const score = scoreEntry(entry(signals), { sources, nowIso: NOW });

    expect(score.contributions.find((c) => c.key === "shazam")).toBeUndefined();
    expect(score.score).toBeCloseTo(50, 1);
  });

  it("never invents a value for a signal that was not reported", () => {
    const score = scoreEntry(entry({ streaming_velocity: 80 }), { sources: ALL_SOURCES, nowIso: NOW });
    expect(score.contributions).toHaveLength(1);
    expect(score.score).toBeCloseTo(80, 1);
  });

  it("clamps out-of-range readings", () => {
    const score = scoreEntry(entry({ streaming_velocity: 400 }), {
      sources: [source("streaming_velocity")], nowIso: NOW,
    });
    expect(score.score).toBeLessThanOrEqual(100);
  });
});

describe("multipliers and overrides", () => {
  const base = entry({ streaming_velocity: 50 });
  const sources = [source("streaming_velocity")];

  it("applies the emerging-artist adjustment only when requested", () => {
    const plain = scoreEntry(base, { sources, nowIso: NOW });
    const boosted = scoreEntry(base, { sources, nowIso: NOW, emerging: true });
    expect(boosted.score).toBeGreaterThan(plain.score);
    expect(boosted.emergingMultiplier).toBe(DEFAULT_PROFILE.emergingBoost);
  });

  it("applies a regional multiplier from the profile", () => {
    const profile = { ...DEFAULT_PROFILE, regionalWeights: { det: 1.5 } };
    const score = scoreEntry(base, { sources, nowIso: NOW, profile, regionId: "det" });
    expect(score.regionalMultiplier).toBe(1.5);
    expect(score.score).toBeCloseTo(75, 1);
  });

  it("records an editorial override as a visible delta rather than hiding it", () => {
    const score = scoreEntry(base, {
      sources, nowIso: NOW,
      overrides: [{ id: "o1", entryId: "e1", deltaPoints: -6, reason: "context", authorId: "u", createdIso: NOW }],
    });
    expect(score.editorialDelta).toBe(-6);
    expect(score.score).toBeCloseTo(44, 1);
  });

  it("ignores an override addressed to a different entry", () => {
    const score = scoreEntry(base, {
      sources, nowIso: NOW,
      overrides: [{ id: "o1", entryId: "other", deltaPoints: 20, reason: "x", authorId: "u", createdIso: NOW }],
    });
    expect(score.editorialDelta).toBe(0);
  });

  it("keeps the composite inside 0–100 after an extreme override", () => {
    const score = scoreEntry(base, {
      sources, nowIso: NOW,
      overrides: [{ id: "o1", entryId: "e1", deltaPoints: 500, reason: "x", authorId: "u", createdIso: NOW }],
    });
    expect(score.score).toBeLessThanOrEqual(100);
  });
});

describe("manipulation flags", () => {
  it("flags consumption running ahead of engagement", () => {
    const flags = detectFlags({ streaming_velocity: 90, engagement_quality: 20 });
    expect(flags.map((f) => f.code)).toContain("flat_engagement");
    expect(flags.find((f) => f.code === "flat_engagement")?.severity).toBe("high");
  });

  it("flags volume with no conversation or search footprint", () => {
    const flags = detectFlags({ streaming_velocity: 80, social_conversation: 10, search_interest: 12 });
    expect(flags.map((f) => f.code)).toContain("velocity_spike");
  });

  it("flags a single signal dominating reported activity", () => {
    const flags = detectFlags({
      streaming_velocity: 100, radio_airplay: 5, shazam: 5,
      search_interest: 5, playlist_adds: 5, social_conversation: 5,
    });
    expect(flags.map((f) => f.code)).toContain("single_source_dominance");
  });

  it("flags narrow geography with no supporting airplay", () => {
    const flags = detectFlags({ geographic_momentum: 90, radio_airplay: 10, streaming_velocity: 70 });
    expect(flags.map((f) => f.code)).toContain("geo_concentration");
  });

  it("raises nothing on a healthy, broadly distributed profile", () => {
    const flags = detectFlags({
      streaming_velocity: 60, engagement_quality: 70, social_conversation: 55,
      search_interest: 58, radio_airplay: 52, playlist_adds: 50, geographic_momentum: 45,
    });
    expect(flags).toHaveLength(0);
  });

  it("returns nothing for an empty bundle rather than throwing", () => {
    expect(detectFlags({})).toEqual([]);
  });
});

describe("confidence", () => {
  it("is 1 when every connected source reported and nothing is stale or flagged", () => {
    const signals = Object.fromEntries(ALL_KEYS.map((k) => [k, 50])) as SignalBundle;
    expect(computeConfidence(signals, [], ALL_SOURCES, NOW)).toBe(1);
  });

  it("falls when authorized sources did not report", () => {
    const signals: SignalBundle = { streaming_velocity: 50, radio_airplay: 50 };
    const value = computeConfidence(signals, [], ALL_SOURCES, NOW);
    expect(value).toBeLessThan(0.5);
  });

  it("penalises stale feeds", () => {
    const signals = Object.fromEntries(ALL_KEYS.map((k) => [k, 50])) as SignalBundle;
    const stale = ALL_SOURCES.map((s) =>
      s.key === "streaming_velocity"
        ? { ...s, lastSyncIso: new Date(Date.parse(NOW) - 10 * 3_600_000).toISOString() }
        : s,
    );
    expect(computeConfidence(signals, [], stale, NOW)).toBeLessThan(1);
  });

  it("penalises open flags by severity", () => {
    const signals = Object.fromEntries(ALL_KEYS.map((k) => [k, 50])) as SignalBundle;
    const high = computeConfidence(signals, [{ code: "flat_engagement", severity: "high", detail: "" }], ALL_SOURCES, NOW);
    const low = computeConfidence(signals, [{ code: "single_source_dominance", severity: "low", detail: "" }], ALL_SOURCES, NOW);
    expect(high).toBeLessThan(low);
  });

  it("never goes negative", () => {
    const flags: FraudFlag[] = [
      { code: "flat_engagement", severity: "high", detail: "" },
      { code: "velocity_spike", severity: "high", detail: "" },
      { code: "geo_concentration", severity: "high", detail: "" },
      { code: "single_source_dominance", severity: "high", detail: "" },
    ];
    expect(computeConfidence({}, flags, ALL_SOURCES, NOW)).toBe(0);
  });
});

describe("publication gate", () => {
  const good = Object.fromEntries(ALL_KEYS.map((k) => [k, 60])) as SignalBundle;

  it("passes a well-evidenced entry", () => {
    const score = scoreEntry(entry(good), { sources: ALL_SOURCES, nowIso: NOW });
    expect(isPublishable(score).ok).toBe(true);
  });

  it("holds an entry with too few reporting signals", () => {
    const thin: SignalBundle = { streaming_velocity: 90, radio_airplay: 80 };
    const score = scoreEntry(entry(thin), { sources: ALL_SOURCES, nowIso: NOW });
    const verdict = isPublishable(score);
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toMatch(/confidence|authorized signals/i);
    expect(score.contributions.length).toBeLessThan(MIN_SIGNALS_FOR_PUBLICATION);
  });

  it("holds an entry carrying a high-severity flag", () => {
    const manipulated: SignalBundle = { ...good, streaming_velocity: 95, engagement_quality: 15 };
    const score = scoreEntry(entry(manipulated), { sources: ALL_SOURCES, nowIso: NOW });
    expect(score.flags.some((f) => f.severity === "high")).toBe(true);
    expect(isPublishable(score).ok).toBe(false);
  });
});

describe("ranking", () => {
  it("orders by score and renumbers ranks from one", () => {
    const entries = [
      entry({ streaming_velocity: 30 }, { id: "low", rank: 1 }),
      entry({ streaming_velocity: 90 }, { id: "high", rank: 2 }),
      entry({ streaming_velocity: 60 }, { id: "mid", rank: 3 }),
    ];
    const ranked = rankEntries(entries, { sources: [source("streaming_velocity")], nowIso: NOW });
    expect(ranked.map((e) => e.id)).toEqual(["high", "mid", "low"]);
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it("applies the emerging adjustment per entry via isEmerging", () => {
    const entries = [
      entry({ streaming_velocity: 50 }, { id: "established" }),
      entry({ streaming_velocity: 50 }, { id: "emerging" }),
    ];
    const ranked = rankEntries(entries, {
      sources: [source("streaming_velocity")], nowIso: NOW,
      isEmerging: (e) => e.id === "emerging",
    });
    expect(ranked[0].id).toBe("emerging");
  });

  it("breaks a score tie on confidence", () => {
    const rich = Object.fromEntries(ALL_KEYS.map((k) => [k, 50])) as SignalBundle;
    const entries = [
      entry({ streaming_velocity: 50 }, { id: "thin" }),
      entry(rich, { id: "well-evidenced" }),
    ];
    const ranked = rankEntries(entries, { sources: ALL_SOURCES, nowIso: NOW });
    expect(ranked[0].id).toBe("well-evidenced");
  });

  it("handles an empty chart without throwing", () => {
    expect(rankEntries([], { sources: ALL_SOURCES, nowIso: NOW })).toEqual([]);
  });
});

describe("movement", () => {
  it("reports a new entry", () => {
    expect(movement({ rank: 5, previousRank: null })).toEqual({ direction: "new", delta: 0 });
  });
  it("reports an upward move", () => {
    expect(movement({ rank: 2, previousRank: 6 })).toEqual({ direction: "up", delta: 4 });
  });
  it("reports a downward move", () => {
    expect(movement({ rank: 8, previousRank: 3 })).toEqual({ direction: "down", delta: 5 });
  });
  it("reports no change", () => {
    expect(movement({ rank: 4, previousRank: 4 })).toEqual({ direction: "flat", delta: 0 });
  });
});
