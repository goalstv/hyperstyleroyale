import type {
  ChartEntry,
  EditorialOverride,
  FraudFlag,
  IndexScore,
  IndexSource,
  IndexWeightProfile,
  SignalBundle,
  SignalKey,
} from "./types";

/**
 * The RAP TRENDS Index.
 *
 * Deterministic, auditable scoring. Every number a viewer sees on air can be
 * traced back to (a) the signal readings, (b) the weight profile in force, and
 * (c) any editorial override, which is always recorded with an author and a
 * reason. Nothing here invents data: a signal that was not delivered by an
 * authorized source is absent, and absence lowers confidence rather than being
 * silently filled with a guess.
 *
 * Public methodology: /trending/methodology
 */

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  streaming_velocity: "Streaming velocity",
  video_views: "Video views",
  video_view_velocity: "Video view velocity",
  radio_airplay: "Radio airplay",
  shazam: "Shazam activity",
  search_interest: "Search interest",
  social_conversation: "Social conversation",
  short_form_usage: "Short-form video usage",
  playlist_adds: "Playlist additions",
  concert_demand: "Concert demand",
  ticket_sales: "Ticket sales",
  audience_vote: "Audience voting",
  editorial_assessment: "Editorial assessment",
  geographic_momentum: "Geographic momentum",
  engagement_quality: "Engagement quality",
};

export const DEFAULT_PROFILE: IndexWeightProfile = {
  id: "profile_national_v3",
  label: "National — v3",
  halfLifeDays: 21,
  emergingBoost: 1.06,
  weights: {
    streaming_velocity: 0.18,
    video_views: 0.07,
    video_view_velocity: 0.09,
    radio_airplay: 0.09,
    shazam: 0.06,
    search_interest: 0.06,
    social_conversation: 0.07,
    short_form_usage: 0.1,
    playlist_adds: 0.07,
    concert_demand: 0.04,
    ticket_sales: 0.03,
    audience_vote: 0.04,
    editorial_assessment: 0.05,
    geographic_momentum: 0.03,
    engagement_quality: 0.02,
  },
};

/** Weight profiles are versioned; a regional edition only changes the multipliers. */
export const PROFILES: IndexWeightProfile[] = [
  DEFAULT_PROFILE,
  {
    ...DEFAULT_PROFILE,
    id: "profile_emerging_v2",
    label: "NEXT UP — emerging edition v2",
    halfLifeDays: 14,
    emergingBoost: 1.22,
    weights: {
      ...DEFAULT_PROFILE.weights,
      streaming_velocity: 0.14,
      short_form_usage: 0.14,
      editorial_assessment: 0.09,
      radio_airplay: 0.04,
      geographic_momentum: 0.06,
    },
  },
];

export const MIN_SIGNALS_FOR_PUBLICATION = 6;

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Recency decay. A record released today scores at full strength; one released
 * `halfLifeDays` ago retains half of its recency contribution. Floors at 0.55 so
 * catalogue records that are genuinely resurging are not erased by age alone.
 */
export function recencyMultiplier(releaseIso: string, nowIso: string, halfLifeDays: number): number {
  const ageDays = Math.max(
    0,
    (Date.parse(nowIso) - Date.parse(releaseIso)) / (1000 * 60 * 60 * 24),
  );
  const decayed = Math.pow(0.5, ageDays / halfLifeDays);
  return 0.55 + 0.45 * decayed;
}

/**
 * Anomaly detection. These are *flags for a human*, not automatic removals — a
 * genuine viral moment and a manipulated one look similar for the first 48 hours.
 */
export function detectFlags(signals: SignalBundle): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const entries = Object.entries(signals) as [SignalKey, number][];
  if (entries.length === 0) return flags;

  const streaming = signals.streaming_velocity ?? 0;
  const engagement = signals.engagement_quality ?? 0;
  const social = signals.social_conversation ?? 0;
  const search = signals.search_interest ?? 0;
  const geo = signals.geographic_momentum ?? 0;

  // Consumption far outrunning any evidence of human engagement.
  if (streaming >= 70 && engagement > 0 && engagement <= 30) {
    flags.push({
      code: "flat_engagement",
      severity: streaming - engagement >= 55 ? "high" : "medium",
      detail: `Streaming velocity ${streaming} against engagement quality ${engagement}. Consumption is outrunning save, share, and repeat behaviour.`,
    });
  }
  // Volume with no conversation or search footprint.
  if (streaming >= 65 && social <= 25 && search <= 25) {
    flags.push({
      code: "velocity_spike",
      severity: "medium",
      detail: "High play volume with no matching social conversation or search interest.",
    });
  }
  // One source carrying the entire score.
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const max = entries.reduce((m, [, v]) => Math.max(m, v), 0);
  if (total > 0 && max / total > 0.4 && entries.length >= 5) {
    flags.push({
      code: "single_source_dominance",
      severity: "low",
      detail: "A single signal accounts for more than 40% of all reported activity.",
    });
  }
  // Activity concentrated in an implausibly narrow geography.
  if (geo >= 85 && (signals.radio_airplay ?? 0) <= 15 && streaming >= 60) {
    flags.push({
      code: "geo_concentration",
      severity: "medium",
      detail: "Activity concentrated in a very narrow geography with no supporting airplay.",
    });
  }
  return flags;
}

/**
 * Confidence is a statement about the *evidence*, not the song. It falls when
 * authorized sources are missing, when connected sources are stale, and when
 * anomaly flags are open.
 */
export function computeConfidence(
  signals: SignalBundle,
  flags: FraudFlag[],
  sources: IndexSource[],
  nowIso: string,
): number {
  const expected = sources.filter((s) => s.status === "connected");
  const expectedKeys = new Set(expected.map((s) => s.key));
  const present = Object.keys(signals).filter((k) => expectedKeys.has(k as SignalKey));

  const coverage = expectedKeys.size === 0 ? 0 : present.length / expectedKeys.size;

  let staleness = 0;
  for (const source of expected) {
    if (!source.lastSyncIso) {
      staleness += 1;
      continue;
    }
    const ageMinutes = (Date.parse(nowIso) - Date.parse(source.lastSyncIso)) / 60000;
    if (ageMinutes > source.refreshMinutes * 3) staleness += 1;
    else if (ageMinutes > source.refreshMinutes * 1.5) staleness += 0.5;
  }
  const stalePenalty = expected.length === 0 ? 0 : (staleness / expected.length) * 0.25;

  const flagPenalty = flags.reduce(
    (sum, f) => sum + (f.severity === "high" ? 0.22 : f.severity === "medium" ? 0.12 : 0.05),
    0,
  );

  const thin = present.length < MIN_SIGNALS_FOR_PUBLICATION ? 0.15 : 0;
  return Math.round(Math.max(0, Math.min(1, coverage - stalePenalty - flagPenalty - thin)) * 100) / 100;
}

export interface ScoreOptions {
  profile?: IndexWeightProfile;
  sources: IndexSource[];
  nowIso: string;
  /** City id for a regional edition; applies `profile.regionalWeights`. */
  regionId?: string;
  overrides?: EditorialOverride[];
  /** `rising` and `independent` receive the emerging adjustment. */
  emerging?: boolean;
}

export function scoreEntry(entry: ChartEntry, options: ScoreOptions): IndexScore {
  const profile = options.profile ?? DEFAULT_PROFILE;
  const { sources, nowIso } = options;

  const enabled = new Set(
    sources.filter((s) => s.status === "connected").map((s) => s.key),
  );

  // Only signals from an enabled, authorized source contribute. A disabled or
  // unsigned source contributes nothing — it does not fall back to a guess.
  const contributions: IndexScore["contributions"] = [];
  let weightedSum = 0;
  let usedWeight = 0;

  for (const [key, weight] of Object.entries(profile.weights) as [SignalKey, number][]) {
    const raw = entry.signals[key];
    if (raw === undefined || !enabled.has(key)) continue;
    const weighted = clamp(raw) * weight;
    weightedSum += weighted;
    usedWeight += weight;
    contributions.push({ key, raw: clamp(raw), weight, weighted: Math.round(weighted * 100) / 100 });
  }

  // Re-normalize across the weight actually used so a missing source does not
  // silently deflate the score — it shows up in confidence instead.
  const base = usedWeight > 0 ? weightedSum / usedWeight : 0;

  const recency = recencyMultiplier(entry.releaseIso, nowIso, profile.halfLifeDays);
  const emergingMultiplier = options.emerging ? profile.emergingBoost : 1;
  const regionalMultiplier =
    (options.regionId && profile.regionalWeights?.[options.regionId]) || 1;

  const flags = detectFlags(entry.signals);
  const editorialDelta = (options.overrides ?? [])
    .filter((o) => o.entryId === entry.id)
    .reduce((sum, o) => sum + o.deltaPoints, 0);

  const composite = clamp(
    base * recency * emergingMultiplier * regionalMultiplier + editorialDelta,
  );

  return {
    score: Math.round(composite * 10) / 10,
    contributions: contributions.sort((a, b) => b.weighted - a.weighted),
    recencyMultiplier: Math.round(recency * 1000) / 1000,
    emergingMultiplier,
    regionalMultiplier,
    editorialDelta,
    confidence: computeConfidence(entry.signals, flags, sources, nowIso),
    flags,
    computedIso: nowIso,
    profileId: profile.id,
  };
}

export interface RankedEntry extends ChartEntry {
  score: IndexScore;
}

/**
 * Score, then rank. Ties break on confidence, then on recency of release.
 * `isEmerging` lets the caller apply the emerging-artist adjustment per entry
 * (normally by looking up the artist's tier) rather than for the whole chart.
 */
export function rankEntries(
  entries: ChartEntry[],
  options: ScoreOptions & { isEmerging?: (entry: ChartEntry) => boolean },
): RankedEntry[] {
  const scored = entries.map((entry) => ({
    ...entry,
    score: scoreEntry(entry, {
      ...options,
      emerging: options.isEmerging ? options.isEmerging(entry) : options.emerging,
    }),
  })) as RankedEntry[];

  scored.sort((a, b) => {
    if (b.score.score !== a.score.score) return b.score.score - a.score.score;
    if (b.score.confidence !== a.score.confidence) return b.score.confidence - a.score.confidence;
    return Date.parse(b.releaseIso) - Date.parse(a.releaseIso);
  });

  return scored.map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export type Movement = { direction: "up" | "down" | "flat" | "new"; delta: number };

export function movement(entry: Pick<ChartEntry, "rank" | "previousRank">): Movement {
  if (entry.previousRank === null) return { direction: "new", delta: 0 };
  const delta = entry.previousRank - entry.rank;
  if (delta === 0) return { direction: "flat", delta: 0 };
  return { direction: delta > 0 ? "up" : "down", delta: Math.abs(delta) };
}

/** An entry may only go to air when the evidence supports it. */
export function isPublishable(score: IndexScore): { ok: boolean; reason?: string } {
  if (score.confidence < 0.5) {
    return { ok: false, reason: `Confidence ${score.confidence.toFixed(2)} is below the 0.50 publication floor.` };
  }
  if (score.flags.some((f) => f.severity === "high")) {
    return { ok: false, reason: "An open high-severity manipulation flag requires review before air." };
  }
  if (score.contributions.length < MIN_SIGNALS_FOR_PUBLICATION) {
    return {
      ok: false,
      reason: `Only ${score.contributions.length} authorized signals reported; ${MIN_SIGNALS_FOR_PUBLICATION} are required.`,
    };
  }
  return { ok: true };
}

/** Append-only audit record written on every recompute and every override. */
export interface AuditRecord {
  id: string;
  iso: string;
  actor: string;
  action: "recompute" | "override_applied" | "source_enabled" | "source_disabled" | "profile_changed";
  entryId?: string;
  detail: string;
  before?: number;
  after?: number;
}
