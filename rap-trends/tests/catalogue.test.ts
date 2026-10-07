import { describe, expect, it } from "vitest";

import {
  CATALOGUE_BY_TYPE,
  CATALOGUE_FRANCHISES,
  CATALOGUE_SUMMARY,
  DAYPARTS,
  PROGRAMMING_WEEK,
  WEEKDAYS,
  programmingGrid,
} from "@/data/catalogue";

/**
 * These are reconciliation tests, not behaviour tests. The catalogue is
 * transcribed from a spreadsheet, and the thing most likely to go wrong is a
 * number drifting away from the file it came from. The workbook states its own
 * totals, so the transcription can be checked against them.
 */
describe("POLARIS catalogue reconciliation", () => {
  it("the type rows sum to the totals the workbook states", () => {
    const franchises = CATALOGUE_BY_TYPE.reduce((n, t) => n + t.franchises, 0);
    const assets = CATALOGUE_BY_TYPE.reduce((n, t) => n + t.assets, 0);
    expect(franchises).toBe(CATALOGUE_SUMMARY.franchises);
    expect(assets).toBe(CATALOGUE_SUMMARY.assets);
  });

  it("folding the mis-keyed buckets preserved all sixteen source rows", () => {
    const keyed = CATALOGUE_BY_TYPE.flatMap((t) => t.asKeyed);
    expect(keyed).toHaveLength(16);
    expect(new Set(keyed).size).toBe(16);
  });

  it("no franchise claims more assets than the catalogue holds", () => {
    for (const f of CATALOGUE_FRANCHISES) {
      expect(f.assets).toBeLessThanOrEqual(CATALOGUE_SUMMARY.assets);
    }
  });

  it("names the largest franchise consistently with its asset count", () => {
    const largest = CATALOGUE_FRANCHISES.reduce((a, b) => (b.assets > a.assets ? b : a));
    expect(largest.sourceTitle).toBe(CATALOGUE_SUMMARY.largestFranchise);
    expect(largest.assets).toBe(CATALOGUE_SUMMARY.largestFranchiseAssets);
  });

  it("publishes no library-hours figure, because the file has no durations", () => {
    expect(CATALOGUE_SUMMARY.libraryHours).toBeNull();
  });

  it("gives every third-party franchise a reason it is under review", () => {
    for (const f of CATALOGUE_FRANCHISES) {
      if (f.rights === "third_party_review") {
        expect(f.rightsNote, `${f.sourceTitle} needs a rights note`).toBeTruthy();
      } else {
        expect(f.rightsNote).toBeUndefined();
      }
    }
  });

  it("strips the workbook's wrapping quotes from display titles", () => {
    for (const f of CATALOGUE_FRANCHISES) {
      expect(f.displayTitle.trim()).toBe(f.displayTitle);
      // An apostrophe inside a title is fine. A quote at either end is the
      // spreadsheet's own wrapping leaking onto the screen.
      expect(f.displayTitle).not.toMatch(/^["']|["']$/);
    }
  });

  it("does not present a working file ID as a title", () => {
    for (const f of CATALOGUE_FRANCHISES) {
      expect(f.displayTitle, `${f.displayTitle} looks like a filename`).not.toMatch(/_/);
    }
  });
});

describe("programming grid", () => {
  it("produces 196 cells across four identical weeks", () => {
    const grid = programmingGrid();
    expect(grid).toHaveLength(4 * WEEKDAYS.length * DAYPARTS.length);
    expect(grid).toHaveLength(196);
  });

  it("repeats week one in every later week", () => {
    const grid = programmingGrid();
    const weekOne = grid.filter((c) => c.week === 1);
    for (const week of [2, 3, 4] as const) {
      const later = grid.filter((c) => c.week === week);
      expect(later.map((c) => c.block)).toEqual(weekOne.map((c) => c.block));
    }
  });

  it("fills every daypart on every day", () => {
    for (const day of WEEKDAYS) {
      for (const daypart of DAYPARTS) {
        expect(PROGRAMMING_WEEK[day][daypart]).toBeTruthy();
      }
    }
  });

  it("runs the news strand across the midday block every weekday", () => {
    for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"] as const) {
      expect(PROGRAMMING_WEEK[day]["12-3p"]).toBe("Crown Source");
    }
  });
});
