import type { Article, ArticleState, Role } from "./types";

/**
 * Editorial workflow.
 *
 * Idea → Assigned → Drafting → Editing → Fact Check → Approved → Scheduled →
 * Published → Updated | Archived
 *
 * Transitions are permissioned. A journalist can move a story up to Editing and
 * no further; only the editor-in-chief (or the founder) can approve or publish.
 */

export const WORKFLOW_ORDER: ArticleState[] = [
  "idea",
  "assigned",
  "drafting",
  "editing",
  "fact_check",
  "approved",
  "scheduled",
  "published",
];

export const STATE_LABELS: Record<ArticleState, string> = {
  idea: "Idea",
  assigned: "Assigned",
  drafting: "Drafting",
  editing: "Editing",
  fact_check: "Fact check",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  updated: "Updated",
  archived: "Archived",
};

const TRANSITIONS: Record<ArticleState, ArticleState[]> = {
  idea: ["assigned", "archived"],
  assigned: ["drafting", "idea", "archived"],
  drafting: ["editing", "assigned", "archived"],
  editing: ["fact_check", "drafting", "archived"],
  fact_check: ["approved", "editing", "archived"],
  approved: ["scheduled", "published", "editing", "archived"],
  scheduled: ["published", "approved", "archived"],
  published: ["updated", "archived"],
  updated: ["updated", "archived"],
  archived: ["idea"],
};

/** States a given role is allowed to move a story *into*. */
const ROLE_TRANSITION_RIGHTS: Partial<Record<Role, ArticleState[]>> = {
  founder_admin: [...WORKFLOW_ORDER, "updated", "archived"],
  editor_in_chief: [...WORKFLOW_ORDER, "updated", "archived"],
  journalist: ["idea", "drafting", "editing"],
  external_contributor: ["drafting", "editing"],
  video_producer: ["idea"],
  social_producer: ["idea"],
};

export interface TransitionResult {
  ok: boolean;
  reason?: string;
}

export function canTransition(
  article: Article,
  to: ArticleState,
  roles: Role[],
): TransitionResult {
  if (!TRANSITIONS[article.state].includes(to)) {
    return {
      ok: false,
      reason: `"${STATE_LABELS[article.state]}" cannot move directly to "${STATE_LABELS[to]}".`,
    };
  }

  const allowed = new Set<ArticleState>();
  for (const role of roles) for (const s of ROLE_TRANSITION_RIGHTS[role] ?? []) allowed.add(s);
  if (!allowed.has(to)) {
    return { ok: false, reason: `Your role cannot move a story to "${STATE_LABELS[to]}".` };
  }

  // Gates that protect what goes out under the network's name.
  if (to === "approved") {
    if (article.factCheck.status !== "cleared") {
      return { ok: false, reason: "Fact check must be cleared before approval." };
    }
    if (article.sources.length === 0) {
      return { ok: false, reason: "At least one source citation is required before approval." };
    }
  }
  if (to === "scheduled" && !article.scheduledIso) {
    return { ok: false, reason: "Set a publish time before scheduling." };
  }
  if (to === "published") {
    if (article.factCheck.status !== "cleared") {
      return { ok: false, reason: "Fact check must be cleared before publication." };
    }
    if (article.embargoIso && Date.parse(article.embargoIso) > Date.now()) {
      return { ok: false, reason: `Under embargo until ${article.embargoIso.slice(0, 16).replace("T", " ")}.` };
    }
    if (!article.seo.title || !article.seo.description) {
      return { ok: false, reason: "SEO title and description are required before publication." };
    }
  }
  return { ok: true };
}

export function nextStates(article: Article, roles: Role[]): ArticleState[] {
  return TRANSITIONS[article.state].filter((s) => canTransition(article, s, roles).ok);
}

export function progressPercent(state: ArticleState): number {
  if (state === "archived") return 0;
  if (state === "updated") return 100;
  const i = WORKFLOW_ORDER.indexOf(state);
  return i < 0 ? 0 : Math.round(((i + 1) / WORKFLOW_ORDER.length) * 100);
}
