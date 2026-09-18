/**
 * RAP TRENDS — observation construction and scaling.
 *
 * Upstreams report in wildly different units: an event count of 0–40, a play
 * count in the millions, a percentage. The engine wants 0–100. This module
 * performs that mapping and, critically, records which mapping it used on the
 * observation itself — so the audit page can show the arithmetic instead of
 * asking a reader to take the number on faith.
 */

import type { SignalKey } from "@/lib/types";
import type { RawObservation, ScaleMethod, SourceId } from "./types";

export function clamp0to100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

/** Apply a declared scale to an upstream figure. Pure and reversible on paper. */
export function applyScale(rawValue: number, scale: ScaleMethod): number {
  if (!Number.isFinite(rawValue)) return 0;

  switch (scale.kind) {
    case "passthrough":
      return clamp0to100(rawValue);

    case "linear": {
      const { min, max } = scale;
      if (max <= min) return 0;
      return clamp0to100(((rawValue - min) / (max - min)) * 100);
    }

    case "log10": {
      // Compresses long-tailed counts. A value at refMax lands on 100; zero
      // lands on 0. Chosen because streaming and view counts are power-law
      // distributed and a linear map would flatten everyone below the top act.
      const { refMax } = scale;
      if (refMax <= 1 || rawValue <= 0) return 0;
      const scaled = (Math.log10(rawValue + 1) / Math.log10(refMax + 1)) * 100;
      return clamp0to100(scaled);
    }
  }
}

export interface ObservationInput {
  sourceId: SourceId;
  artistId: string;
  metric: SignalKey;
  rawValue: number;
  scale: ScaleMethod;
  observedIso: string;
  fetchedIso: string;
  sourceUrl: string;
  note?: string;
}

/**
 * Build an observation, or return null if it cannot carry its own provenance.
 *
 * A missing source URL is not a warning here, it is a rejection. An observation
 * nobody can check is indistinguishable from an invented one.
 */
export function makeObservation(input: ObservationInput): RawObservation | null {
  if (!input.artistId || !input.sourceUrl || !input.observedIso || !input.fetchedIso) {
    return null;
  }
  if (!Number.isFinite(input.rawValue)) return null;

  return {
    id: `${input.sourceId}:${input.metric}:${input.artistId}:${input.observedIso}`,
    sourceId: input.sourceId,
    artistId: input.artistId,
    metric: input.metric,
    value: applyScale(input.rawValue, input.scale),
    rawValue: input.rawValue,
    scale: input.scale,
    observedIso: input.observedIso,
    fetchedIso: input.fetchedIso,
    sourceUrl: input.sourceUrl,
    ...(input.note ? { note: input.note } : {}),
  };
}
