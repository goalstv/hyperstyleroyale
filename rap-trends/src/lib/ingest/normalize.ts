/**
 * RAP TRENDS — observations into the engine's SignalBundle.
 *
 * `SignalBundle` is `Partial<Record<SignalKey, number>>`, and that partiality is
 * load-bearing: a signal we did not observe must be absent, never zero and never
 * guessed. `MIN_SIGNALS_FOR_PUBLICATION` in the engine already refuses to
 * publish a score built on too few signals, so an honest gap is handled
 * correctly downstream. A fabricated one is not.
 */

import type { SignalBundle, SignalKey } from "@/lib/types";
import type { RawObservation } from "./types";

export interface SignalCoverage {
  key: SignalKey;
  /** How many observations backed this signal. */
  observations: number;
  /** Which sources contributed. */
  sourceIds: string[];
  /** Oldest contributing observation, for staleness reporting. */
  oldestObservedIso: string;
}

export interface NormalizedEntry {
  artistId: string;
  signals: SignalBundle;
  coverage: SignalCoverage[];
  /** Signals with no observation at all. Reported, not filled in. */
  missing: SignalKey[];
  observationIds: string[];
}

const ALL_SIGNALS: SignalKey[] = [
  "streaming_velocity",
  "video_views",
  "video_view_velocity",
  "radio_airplay",
  "shazam",
  "search_interest",
  "social_conversation",
  "short_form_usage",
  "playlist_adds",
  "concert_demand",
  "ticket_sales",
  "audience_vote",
  "editorial_assessment",
  "geographic_momentum",
  "engagement_quality",
];

/**
 * Collapse many observations of the same metric into one reading.
 *
 * The mean is used rather than the max: taking the max would let a single
 * outlying source set an artist's position, which is exactly the
 * single-source dominance the engine's own fraud detector exists to flag.
 */
function combine(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function normalizeObservations(
  artistId: string,
  observations: RawObservation[],
): NormalizedEntry {
  const mine = observations.filter((o) => o.artistId === artistId);
  const byMetric = new Map<SignalKey, RawObservation[]>();

  for (const obs of mine) {
    const bucket = byMetric.get(obs.metric) ?? [];
    bucket.push(obs);
    byMetric.set(obs.metric, bucket);
  }

  const signals: SignalBundle = {};
  const coverage: SignalCoverage[] = [];

  for (const [metric, group] of byMetric) {
    signals[metric] = combine(group.map((o) => o.value));
    coverage.push({
      key: metric,
      observations: group.length,
      sourceIds: [...new Set(group.map((o) => o.sourceId))].sort(),
      oldestObservedIso: group
        .map((o) => o.observedIso)
        .sort()
        .at(0)!,
    });
  }

  coverage.sort((a, b) => a.key.localeCompare(b.key));

  return {
    artistId,
    signals,
    coverage,
    missing: ALL_SIGNALS.filter((k) => !(k in signals)),
    observationIds: mine.map((o) => o.id).sort(),
  };
}

/** Normalize every artist that appears in the observation set. */
export function normalizeAll(observations: RawObservation[]): NormalizedEntry[] {
  const artistIds = [...new Set(observations.map((o) => o.artistId))].sort();
  return artistIds.map((id) => normalizeObservations(id, observations));
}
