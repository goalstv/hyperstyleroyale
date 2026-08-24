import { describe, expect, it } from "vitest";
import { dayCoverage, daypartForHour, endIso, formatDuration, totalDuration, validateSchedule } from "@/lib/schedule";
import { buildDay, buildWeek, nowAndNext } from "@/data/schedule";
import { ASSET_BY_ID, RIGHTS_BY_ASSET } from "@/data/media";
import type { MediaAsset, RightsWindow, ScheduleItem } from "@/lib/types";

const DAY = "2026-06-01T04:00:00.000Z";

function item(overrides: Partial<ScheduleItem> = {}): ScheduleItem {
  return {
    id: "s1", channelId: "rt_tv", startIso: DAY, durationSeconds: 1800,
    kind: "episode", title: "Programme", assetId: "a1", daypart: "primetime",
    explicitAllowed: false, approved: true, ...overrides,
  };
}

function asset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: "a1", title: "Asset", description: "", type: "long_form_video",
    durationSeconds: 1800, resolution: "1920x1080", aspectRatio: "16:9",
    audioFormat: "stereo", rating: "TV-14", explicit: false,
    captionStatus: "human_reviewed", transcriptStatus: "human_reviewed",
    qcStatus: "passed", publishStatus: "published", createdIso: DAY,
    provenance: "demo", ...overrides,
  };
}

function window(overrides: Partial<RightsWindow> = {}): RightsWindow {
  return {
    id: "w1", assetId: "a1", rightsOwner: "RAP TRENDS",
    cleared: ["master_recording", "publishing", "music_video_exhibition", "public_performance", "digital_performance", "synchronization", "mechanical"],
    platforms: ["fast", "web", "ota", "cable"], territories: ["WORLDWIDE"],
    startIso: "2026-01-01T00:00:00.000Z", endIso: null,
    adRestrictions: [], talentReleaseOnFile: true, notes: "", ...overrides,
  };
}

describe("time helpers", () => {
  it("computes an end time from start plus duration", () => {
    expect(endIso({ startIso: DAY, durationSeconds: 3600 })).toBe("2026-06-01T05:00:00.000Z");
  });

  it("formats durations for the grid", () => {
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(0)).toBe("0:00");
  });

  it("maps hours to dayparts", () => {
    expect(daypartForHour(2)).toBe("overnight");
    expect(daypartForHour(8)).toBe("morning");
    expect(daypartForHour(12)).toBe("midday");
    expect(daypartForHour(17)).toBe("afternoon");
    expect(daypartForHour(20)).toBe("primetime");
    expect(daypartForHour(23)).toBe("late");
  });
});

describe("continuity", () => {
  it("accepts a back-to-back schedule", () => {
    const items = [
      item({ id: "a", startIso: DAY, durationSeconds: 1800 }),
      item({ id: "b", startIso: "2026-06-01T04:30:00.000Z", durationSeconds: 1800 }),
    ];
    const issues = validateSchedule({ channelId: "rt_tv", items });
    expect(issues.filter((i) => i.code === "gap" || i.code === "overlap")).toEqual([]);
  });

  it("reports dead air as an error", () => {
    const items = [
      item({ id: "a", startIso: DAY, durationSeconds: 1800 }),
      item({ id: "b", startIso: "2026-06-01T04:35:00.000Z", durationSeconds: 1800 }),
    ];
    const issues = validateSchedule({ channelId: "rt_tv", items });
    const gap = issues.find((i) => i.code === "gap");
    expect(gap?.severity).toBe("error");
    expect(gap?.message).toMatch(/300s of dead air/);
  });

  it("reports double-booked playout as an error", () => {
    const items = [
      item({ id: "a", startIso: DAY, durationSeconds: 1800 }),
      item({ id: "b", startIso: "2026-06-01T04:25:00.000Z", durationSeconds: 1800 }),
    ];
    const issues = validateSchedule({ channelId: "rt_tv", items });
    expect(issues.find((i) => i.code === "overlap")?.severity).toBe("error");
  });

  it("sorts unordered input before validating", () => {
    const items = [
      item({ id: "b", startIso: "2026-06-01T04:30:00.000Z" }),
      item({ id: "a", startIso: DAY }),
    ];
    const issues = validateSchedule({ channelId: "rt_tv", items });
    expect(issues.filter((i) => i.code === "gap" || i.code === "overlap")).toEqual([]);
  });
});

describe("content restrictions", () => {
  it("rejects explicit audio outside its permitted dayparts", () => {
    const issues = validateSchedule({
      channelId: "rt_tv", items: [item({ explicitAllowed: true, daypart: "primetime" })],
    });
    const issue = issues.find((i) => i.code === "explicit_restriction");
    expect(issue?.severity).toBe("error");
  });

  it("permits explicit audio late and overnight", () => {
    for (const daypart of ["late", "overnight"] as const) {
      const issues = validateSchedule({
        channelId: "rt_tv", items: [item({ explicitAllowed: true, daypart })],
      });
      expect(issues.find((i) => i.code === "explicit_restriction")).toBeUndefined();
    }
  });

  it("warns on an item the programming director has not approved", () => {
    const issues = validateSchedule({ channelId: "rt_tv", items: [item({ approved: false })] });
    expect(issues.find((i) => i.code === "unapproved")?.severity).toBe("warning");
  });
});

describe("asset and rights validation", () => {
  it("errors on a programme with no asset attached", () => {
    const issues = validateSchedule({ channelId: "rt_tv", items: [item({ assetId: undefined })] });
    expect(issues.find((i) => i.code === "missing_asset")?.severity).toBe("error");
  });

  it("errors when the referenced asset is not in the library", () => {
    const issues = validateSchedule({
      channelId: "rt_tv", items: [item({ assetId: "ghost" })], assets: new Map(),
    });
    expect(issues.find((i) => i.code === "missing_asset")?.severity).toBe("error");
  });

  it("surfaces a rights blocker from the gate", () => {
    const issues = validateSchedule({
      channelId: "rt_tv",
      items: [item()],
      assets: new Map([["a1", asset()]]),
      rights: new Map([["a1", window({ territories: ["GB"] })]]),
      platform: "fast",
      territory: "US",
    });
    expect(issues.find((i) => i.code === "rights_window")?.severity).toBe("error");
  });

  it("surfaces an unreviewed-caption blocker distinctly", () => {
    const issues = validateSchedule({
      channelId: "rt_tv",
      items: [item()],
      assets: new Map([["a1", asset({ captionStatus: "auto_draft" })]]),
      rights: new Map([["a1", window()]]),
      platform: "fast",
      territory: "US",
    });
    expect(issues.find((i) => i.code === "missing_captions")).toBeDefined();
  });

  it("passes a fully cleared item", () => {
    const issues = validateSchedule({
      channelId: "rt_tv",
      items: [item()],
      assets: new Map([["a1", asset()]]),
      rights: new Map([["a1", window()]]),
      platform: "fast",
      territory: "US",
    });
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });
});

describe("the generated network schedule", () => {
  const day = buildDay(0);

  it("covers a full 24 hours with no gap or overlap", () => {
    expect(totalDuration(day)).toBe(86_400);
    expect(dayCoverage(day)).toBe(1);
    const issues = validateSchedule({ channelId: "rt_tv", items: day });
    expect(issues.filter((i) => i.code === "gap" || i.code === "overlap")).toEqual([]);
  });

  it("keeps explicit programming out of protected dayparts", () => {
    const issues = validateSchedule({ channelId: "rt_tv", items: day });
    expect(issues.filter((i) => i.code === "explicit_restriction")).toEqual([]);
  });

  it("builds every day of the week to full coverage", () => {
    for (let i = 0; i < 7; i++) {
      expect(totalDuration(buildDay(i))).toBe(86_400);
    }
  });

  it("produces unique event ids across a full week", () => {
    const week = buildWeek();
    expect(new Set(week.map((i) => i.id)).size).toBe(week.length);
  });

  it("attaches an asset to every scheduled programme", () => {
    const programmes = day.filter((i) => i.kind === "episode");
    expect(programmes.length).toBeGreaterThan(0);
    expect(programmes.every((p) => p.assetId && ASSET_BY_ID.has(p.assetId))).toBe(true);
  });

  it("reserves commercial inventory in every hour", () => {
    const breaks = day.filter((i) => i.kind === "commercial_break");
    expect(breaks.length).toBeGreaterThanOrEqual(24);
  });

  it("finds what is on now and what follows", () => {
    const at = new Date(Date.parse(day[10].startIso) + 30_000).toISOString();
    const { current, next } = nowAndNext(day, at);
    expect(current).toBeDefined();
    expect(next.length).toBeGreaterThan(0);
    expect(Date.parse(next[0].startIso)).toBeGreaterThan(Date.parse(at));
  });
});

describe("the seeded library still satisfies the gate", () => {
  it("blocks the one asset deliberately left without a rights record", () => {
    const orphan = [...ASSET_BY_ID.values()].find((a) => !RIGHTS_BY_ASSET.has(a.id));
    expect(orphan).toBeDefined();
    const issues = validateSchedule({
      channelId: "rt_tv",
      items: [item({ assetId: orphan!.id })],
      assets: ASSET_BY_ID,
      rights: RIGHTS_BY_ASSET,
      platform: "fast",
      territory: "US",
    });
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });
});
