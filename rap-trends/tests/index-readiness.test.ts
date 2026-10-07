import { describe, expect, it } from "vitest";

import { CHART_ENTRIES } from "@/data/chart";
import { INDEX_SOURCES, signalReadiness } from "@/data/index-sources";
import {
  DEFAULT_PROFILE,
  MIN_SIGNALS_FOR_PUBLICATION,
  isPublishable,
  rankEntries,
} from "@/lib/index-engine";

const NOW = "2026-10-07T00:00:00.000Z";

/**
 * These are the guards against the Index presenting simulated data as live
 * measurement — the one thing it must never do, and the thing it was doing.
 *
 * Thirteen sources were marked `connected` with a `lastSyncIso` a few minutes
 * old, for providers named "(placeholder vendor)". No vendor existed, no
 * agreement existed, and no connector had ever run. Because the engine counts a
 * signal only when its source is connected, that made synthetic signals score
 * at full confidence and publish. The label said demo; the arithmetic said
 * verified and live.
 */
describe("source registry honesty", () => {
  it("never marks a source connected without a recorded sync", () => {
    for (const source of INDEX_SOURCES) {
      if (source.status === "connected") {
        expect(source.lastSyncIso, `${source.id} claims connected but never synced`).toBeTruthy();
      }
    }
  });

  it("never marks a placeholder provider connected", () => {
    for (const source of INDEX_SOURCES) {
      if (/placeholder/i.test(source.provider)) {
        expect(source.status, `${source.id} is a placeholder vendor and cannot be connected`).not.toBe(
          "connected",
        );
      }
    }
  });

  it("records no sync timestamp for a source that is not connected", () => {
    for (const source of INDEX_SOURCES) {
      if (source.status !== "connected") {
        expect(source.lastSyncIso, `${source.id} is not connected but reports a sync`).toBeUndefined();
      }
    }
  });

  it("gives every source a note saying what is actually missing", () => {
    for (const source of INDEX_SOURCES) {
      if (source.status !== "connected") {
        expect(source.notes.length, `${source.id} needs a note`).toBeGreaterThan(20);
      }
    }
  });
});

describe("signalReadiness", () => {
  it("reports the truth: no signal source is live", () => {
    const readiness = signalReadiness();
    expect(readiness.live).toBe(0);
    expect(readiness.total).toBe(15);
    expect(readiness.canPublishAnything).toBe(false);
  });

  it("accounts for every signal as either live, awaiting a signature, or awaiting a build", () => {
    const r = signalReadiness();
    expect(r.live + r.blockedOnAgreement + r.blockedOnBuild).toBe(r.total);
  });

  it("separates what a counterparty blocks from what we block", () => {
    const r = signalReadiness();
    // The split is the roadmap: most of this needs somebody else to sign,
    // and a few need nothing but our own engineering.
    expect(r.blockedOnAgreement).toBeGreaterThan(0);
    expect(r.blockedOnBuild).toBeGreaterThan(0);
  });

  it("turns on only once enough sources genuinely connect", () => {
    const live = INDEX_SOURCES.map((s, i) =>
      i < MIN_SIGNALS_FOR_PUBLICATION ? { ...s, status: "connected" as const, lastSyncIso: NOW } : s,
    );
    expect(signalReadiness(live).canPublishAnything).toBe(true);
    expect(signalReadiness(live).live).toBe(MIN_SIGNALS_FOR_PUBLICATION);

    const oneShort = INDEX_SOURCES.map((s, i) =>
      i < MIN_SIGNALS_FOR_PUBLICATION - 1
        ? { ...s, status: "connected" as const, lastSyncIso: NOW }
        : s,
    );
    expect(signalReadiness(oneShort).canPublishAnything).toBe(false);
  });
});

describe("the Index refuses to publish on simulated data", () => {
  const ranked = rankEntries(CHART_ENTRIES, {
    profile: DEFAULT_PROFILE,
    sources: INDEX_SOURCES,
    overrides: [],
    nowIso: NOW,
  });

  it("scores no entry as publishable", () => {
    for (const entry of ranked) {
      const verdict = isPublishable(entry.score);
      expect(verdict.ok, `${entry.id} must not be publishable`).toBe(false);
      expect(verdict.reason).toBeTruthy();
    }
  });

  it("counts no authorized signal contribution for any entry", () => {
    for (const entry of ranked) {
      expect(entry.score.contributions, `${entry.id} must have no contributions`).toHaveLength(0);
    }
  });

  it("reports zero confidence rather than a plausible-looking number", () => {
    for (const entry of ranked) {
      expect(entry.score.confidence).toBe(0);
    }
  });

  it("keeps every chart entry marked as demonstration data", () => {
    for (const entry of CHART_ENTRIES) {
      expect(entry.provenance, `${entry.id} must not claim to be verified`).not.toBe("verified");
    }
  });
});
