import { describe, expect, it } from "vitest";
import {
  digestOf,
  freezeSnapshot,
  replaySnapshot,
  stableStringify,
  type IndexSnapshot,
} from "@/lib/ingest/snapshot";
import { DEFAULT_PROFILE, rankEntries } from "@/lib/index-engine";
import { INDEX_SOURCES } from "@/data/index-sources";
import { CHART_ENTRIES } from "@/data/chart";
import type { EditorialOverride } from "@/lib/types";

const NOW = "2026-09-18T00:00:00.000Z";

const OVERRIDES: EditorialOverride[] = [
  {
    id: "ovr_test",
    entryId: CHART_ENTRIES[0]!.id,
    deltaPoints: -6,
    reason: "Manipulation review pending.",
    authorId: "usr_01",
    createdIso: NOW,
  },
];

function buildSnapshot(): IndexSnapshot {
  const published = rankEntries(CHART_ENTRIES, {
    profile: DEFAULT_PROFILE,
    sources: INDEX_SOURCES,
    overrides: OVERRIDES,
    nowIso: NOW,
  });

  return freezeSnapshot({
    weekId: "2026-W38",
    createdIso: NOW,
    computedAtIso: NOW,
    profile: DEFAULT_PROFILE,
    sources: INDEX_SOURCES,
    overrides: OVERRIDES,
    observations: [],
    published,
  });
}

describe("stableStringify", () => {
  it("serialises the same object identically regardless of key order", () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
  });

  it("recurses into nested objects and arrays", () => {
    expect(stableStringify({ x: [{ q: 1, p: 2 }] })).toBe('{"x":[{"p":2,"q":1}]}');
  });

  it("drops undefined so an absent field and a missing key digest the same", () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });
});

describe("freezeSnapshot + replaySnapshot", () => {
  it("replays a published chart to identical scores, ranks and confidence", () => {
    const snapshot = buildSnapshot();
    const result = replaySnapshot(snapshot, CHART_ENTRIES);

    expect(result.digestIntact).toBe(true);
    expect(result.diffs).toEqual([]);
    expect(result.matches).toBe(true);
    expect(result.checkedEntries).toBe(CHART_ENTRIES.length);
  });

  it("detects a tampered snapshot through the digest", () => {
    const snapshot = buildSnapshot();
    const tampered: IndexSnapshot = {
      ...snapshot,
      entries: snapshot.entries.map((e, i) =>
        i === 0 ? { ...e, publishedScore: e.publishedScore + 10 } : e,
      ),
    };

    const result = replaySnapshot(tampered, CHART_ENTRIES);
    expect(result.digestIntact).toBe(false);
    expect(result.matches).toBe(false);
  });

  it("reports the specific entry and field when a score no longer reproduces", () => {
    const snapshot = buildSnapshot();
    const target = snapshot.entries[0]!;
    const tampered: IndexSnapshot = {
      ...snapshot,
      entries: snapshot.entries.map((e) =>
        e.entryId === target.entryId ? { ...e, publishedScore: e.publishedScore + 10 } : e,
      ),
    };

    const result = replaySnapshot(tampered, CHART_ENTRIES);
    const diff = result.diffs.find((d) => d.entryId === target.entryId && d.field === "score");
    expect(diff).toBeDefined();
    expect(diff!.published).toBeCloseTo(target.publishedScore + 10, 5);
  });

  // Dropping the override changes the score, which is the point: an editorial
  // intervention is part of the published arithmetic and cannot be hidden.
  it("fails to reproduce when an editorial override is removed from the record", () => {
    const snapshot = buildSnapshot();
    const withoutOverride: IndexSnapshot = { ...snapshot, overrides: [] };

    const result = replaySnapshot(withoutOverride, CHART_ENTRIES);
    expect(result.matches).toBe(false);
    expect(result.diffs.length).toBeGreaterThan(0);
  });

  it("changes the digest when any frozen input changes", () => {
    const snapshot = buildSnapshot();
    const { digest, ...body } = snapshot;
    const moved = { ...body, computedAtIso: "2026-09-19T00:00:00.000Z" };
    expect(digestOf(moved)).not.toBe(digest);
  });

  it("sorts observations and entries so two equal snapshots digest the same", () => {
    const a = buildSnapshot();
    const b = buildSnapshot();
    expect(a.digest).toBe(b.digest);
  });
});
