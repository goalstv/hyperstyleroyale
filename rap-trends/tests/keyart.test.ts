import { describe, expect, it } from "vitest";

import {
  SURFACES,
  SURFACE_IDS,
  layout,
  planKeyArt,
  wrapWidth,
  type SurfaceId,
} from "@/lib/keyart";

const REAL_HEADLINE = "Cam'ron pulls up to the Keffe D trial";
const LONG_HEADLINE =
  "Prosecution rests in the Keffe D murder trial after nine days of testimony from the state's witnesses";

describe("wrapWidth", () => {
  it("counts the lines greedy wrapping actually produces", () => {
    expect(wrapWidth("one two three", 9)).toEqual({ lines: 2, longest: 7 });
  });

  it("never splits a word, even one wider than the line", () => {
    const { lines, longest } = wrapWidth("supercalifragilistic", 6);
    expect(lines).toBe(1);
    expect(longest).toBe(20);
  });

  it("is empty for empty input", () => {
    expect(wrapWidth("   ", 20)).toEqual({ lines: 0, longest: 0 });
    expect(wrapWidth("anything", 0)).toEqual({ lines: 0, longest: 0 });
  });
});

describe("layout", () => {
  it("sets a real headline on every surface we publish", () => {
    for (const id of SURFACE_IDS) {
      expect(layout(id, REAL_HEADLINE), `${id} should fit`).not.toBeNull();
    }
  });

  it("keeps the type block inside the headline box", () => {
    for (const id of SURFACE_IDS) {
      const l = layout(id, REAL_HEADLINE)!;
      expect(l.headlineLines).toBeGreaterThan(0);
      expect(l.headlineLines).toBeLessThanOrEqual(3);
      expect(l.headline.y + l.headline.height).toBeLessThanOrEqual(l.surface.height);
    }
  });

  it("respects the margin on every side of the lockup", () => {
    for (const id of SURFACE_IDS) {
      const surface = SURFACES[id];
      const margin = Math.round(Math.min(surface.width, surface.height) * surface.marginRatio);
      const l = layout(id, REAL_HEADLINE, { eyebrow: true })!;
      for (const box of [l.headline, l.logo, l.eyebrow]) {
        expect(box.x).toBeGreaterThanOrEqual(margin);
        expect(box.x + box.width).toBeLessThanOrEqual(surface.width - margin + 1);
      }
      expect(l.headline.y + l.headline.height).toBeLessThanOrEqual(surface.height - margin + 1);
    }
  });

  it("stacks the mark above the eyebrow above the headline, without overlap", () => {
    const l = layout("social_4x5", REAL_HEADLINE, { eyebrow: true })!;
    expect(l.logo.y + l.logo.height).toBeLessThanOrEqual(l.eyebrow.y);
    expect(l.eyebrow.y + l.eyebrow.height).toBeLessThanOrEqual(l.headline.y);
  });

  it("draws the photograph full bleed and the scrim above the type band", () => {
    const l = layout("hero_16x9", REAL_HEADLINE)!;
    expect(l.image).toEqual({ x: 0, y: 0, width: l.surface.width, height: l.surface.height });
    expect(l.scrim.y).toBeLessThan(l.logo.y);
    expect(l.scrim.y + l.scrim.height).toBe(l.surface.height);
  });

  it("refuses a headline past the surface's character limit rather than shrinking it", () => {
    for (const id of SURFACE_IDS) {
      expect(LONG_HEADLINE.length).toBeGreaterThan(SURFACES[id].maxHeadlineChars);
      expect(layout(id, LONG_HEADLINE)).toBeNull();
    }
  });

  it("refuses empty and whitespace headlines", () => {
    expect(layout("hero_16x9", "")).toBeNull();
    expect(layout("hero_16x9", "    ")).toBeNull();
  });

  it("sets smaller type as the headline gets longer", () => {
    const short = layout("hero_16x9", "Chart day")!;
    const long = layout("hero_16x9", REAL_HEADLINE)!;
    expect(short.headlineSizePx).toBeGreaterThanOrEqual(long.headlineSizePx);
  });
});

describe("planKeyArt", () => {
  const ok = {
    contentId: "camron-keffe-d-trial",
    headline: REAL_HEADLINE,
    eyebrow: "Courts",
    sourceImage: "src/assets/editorial/article-camron-trial.webp",
    publiclyEligible: true,
  };

  it("plans every surface for a cleared story", () => {
    const plan = planKeyArt(ok);
    expect(plan.surfaces.map((s) => s.id).sort()).toEqual([...SURFACE_IDS].sort());
    expect(plan.rejected).toHaveLength(0);
    expect(plan.blocked).toBeUndefined();
  });

  it("produces nothing for an asset that is not cleared for public display", () => {
    const plan = planKeyArt({ ...ok, publiclyEligible: false });
    expect(plan.surfaces).toHaveLength(0);
    expect(plan.blocked).toMatch(/not cleared/i);
  });

  it("produces nothing without a source image", () => {
    expect(planKeyArt({ ...ok, sourceImage: "" }).blocked).toMatch(/no source image/i);
  });

  it("produces nothing without a headline, and says a filename is not one", () => {
    const plan = planKeyArt({ ...ok, headline: "  " });
    expect(plan.surfaces).toHaveLength(0);
    expect(plan.blocked).toMatch(/filename is not a headline/i);
  });

  it("reports the surfaces a long headline will not fit, with the count", () => {
    const plan = planKeyArt({ ...ok, headline: LONG_HEADLINE });
    expect(plan.surfaces).toHaveLength(0);
    expect(plan.rejected).toHaveLength(SURFACE_IDS.length);
    for (const r of plan.rejected) {
      expect(r.reason).toMatch(/\d+ characters/);
    }
  });

  it("always demands human review before anything goes out", () => {
    for (const eligible of [true, false]) {
      expect(planKeyArt({ ...ok, publiclyEligible: eligible }).requiresHumanReview).toBe(true);
    }
  });

  it("can plan a subset of surfaces", () => {
    const only: SurfaceId[] = ["social_1x1", "story_9x16"];
    expect(planKeyArt(ok, only).surfaces.map((s) => s.id)).toEqual(only);
  });
});
