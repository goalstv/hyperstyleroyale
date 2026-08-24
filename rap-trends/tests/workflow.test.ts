import { describe, expect, it } from "vitest";
import { canTransition, nextStates, progressPercent, WORKFLOW_ORDER } from "@/lib/workflow";
import type { Article, Role } from "@/lib/types";

function article(overrides: Partial<Article> = {}): Article {
  return {
    id: "a1", slug: "a", headline: "H", dek: "D", body: "B", state: "fact_check",
    authorId: "usr_03", authorName: "Rahman", editorId: "usr_02", pillar: "CITY REPORT",
    cityIds: [], artistIds: [], tags: [], seo: { title: "T", description: "D" },
    socialCopy: "", pushCopy: "", sources: [{ label: "Interview" }],
    factCheck: { status: "cleared" }, corrections: [], relatedAssetIds: [],
    breaking: false, readMinutes: 5, provenance: "demo", ...overrides,
  };
}

const EIC: Role[] = ["editor_in_chief"];
const JOURNALIST: Role[] = ["journalist"];
const SALES: Role[] = ["ad_sponsorship_manager"];

describe("state machine shape", () => {
  it("rejects a transition that skips the pipeline", () => {
    const result = canTransition(article({ state: "drafting" }), "published", EIC);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/cannot move directly/i);
  });

  it("allows each adjacent step for the editor-in-chief", () => {
    for (let i = 0; i < WORKFLOW_ORDER.length - 1; i++) {
      const from = WORKFLOW_ORDER[i];
      const to = WORKFLOW_ORDER[i + 1];
      const draft = article({
        state: from,
        scheduledIso: "2030-01-01T00:00:00.000Z",
      });
      expect(canTransition(draft, to, EIC).ok, `${from} → ${to}`).toBe(true);
    }
  });

  it("computes progress along the pipeline", () => {
    expect(progressPercent("idea")).toBeLessThan(progressPercent("editing"));
    expect(progressPercent("published")).toBe(100);
    expect(progressPercent("archived")).toBe(0);
  });
});

describe("role boundaries", () => {
  it("lets a journalist move a story to editing", () => {
    expect(canTransition(article({ state: "drafting" }), "editing", JOURNALIST).ok).toBe(true);
  });

  it("stops a journalist at fact check", () => {
    const result = canTransition(article({ state: "editing" }), "fact_check", JOURNALIST);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/your role/i);
  });

  it("stops a journalist from approving or publishing", () => {
    expect(canTransition(article({ state: "fact_check" }), "approved", JOURNALIST).ok).toBe(false);
    expect(canTransition(article({ state: "approved" }), "published", JOURNALIST).ok).toBe(false);
  });

  it("gives a sales role no editorial transitions at all", () => {
    expect(nextStates(article({ state: "drafting" }), SALES)).toEqual([]);
  });
});

describe("publication gates", () => {
  it("blocks approval until the fact check is cleared", () => {
    const result = canTransition(
      article({ state: "fact_check", factCheck: { status: "in_progress" } }), "approved", EIC,
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/fact check/i);
  });

  it("blocks approval with no source citation", () => {
    const result = canTransition(article({ state: "fact_check", sources: [] }), "approved", EIC);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/source citation/i);
  });

  it("blocks scheduling without a publish time", () => {
    const result = canTransition(article({ state: "approved", scheduledIso: undefined }), "scheduled", EIC);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/publish time/i);
  });

  it("blocks publication while an embargo is running", () => {
    const result = canTransition(
      article({ state: "approved", embargoIso: "2099-01-01T00:00:00.000Z" }), "published", EIC,
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/embargo/i);
  });

  it("permits publication once the embargo has passed", () => {
    const result = canTransition(
      article({ state: "approved", embargoIso: "2020-01-01T00:00:00.000Z" }), "published", EIC,
    );
    expect(result.ok).toBe(true);
  });

  it("blocks publication without SEO metadata", () => {
    const result = canTransition(
      article({ state: "approved", seo: { title: "", description: "" } }), "published", EIC,
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/SEO/i);
  });
});

describe("post-publication", () => {
  it("allows a published story to be updated or archived only", () => {
    const states = nextStates(article({ state: "published" }), EIC);
    expect(states.sort()).toEqual(["archived", "updated"]);
  });

  it("never returns a published story to drafting", () => {
    expect(canTransition(article({ state: "published" }), "drafting", EIC).ok).toBe(false);
  });
});
