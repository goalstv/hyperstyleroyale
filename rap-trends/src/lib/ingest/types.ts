/**
 * RAP TRENDS — ingestion types.
 *
 * The Index engine is pure and deterministic: the same signals always produce
 * the same score. That property is what makes the transparency claim provable,
 * and everything in this directory exists to protect it.
 *
 * The rule: a number may only reach `SignalBundle` if we can say where it came
 * from, when it was observed, and what URL a reader could check it against. An
 * observation without that provenance is dropped, never estimated.
 */

import type { SignalKey } from "@/lib/types";

/** A connected upstream. Mirrors `IndexSource.id` once the source is licensed. */
export type SourceId =
  | "musicbrainz"
  | "bandsintown"
  | "theaudiodb"
  | "radio_browser"
  | "editorial";

/**
 * How a raw upstream number was mapped onto the engine's 0–100 scale.
 *
 * Recorded per observation so the audit page can show the arithmetic rather
 * than asking anyone to trust it.
 */
export type ScaleMethod =
  | { kind: "passthrough" }
  | { kind: "linear"; min: number; max: number }
  | { kind: "log10"; refMax: number };

/**
 * One measurement, of one metric, for one artist, from one source.
 *
 * `value` is the normalized 0–100 reading the engine consumes. `rawValue` is
 * what the upstream actually said, kept so the mapping can be re-checked.
 */
export interface RawObservation {
  /** Stable id: `${sourceId}:${metric}:${artistId}:${observedIso}`. */
  id: string;
  sourceId: SourceId;
  artistId: string;
  metric: SignalKey;
  /** Normalized 0–100, clamped. What `normalizeObservations` feeds the engine. */
  value: number;
  /** The upstream figure before scaling. */
  rawValue: number;
  scale: ScaleMethod;
  /** When the upstream says the measurement applies. */
  observedIso: string;
  /** When we retrieved it. */
  fetchedIso: string;
  /** A URL a reader can open to check this. Required — no exceptions. */
  sourceUrl: string;
  note?: string;
}

/** Result of one upstream call, before parsing. */
export interface FetchEnvelope {
  ok: boolean;
  status: number;
  url: string;
  body: unknown;
  fetchedIso: string;
  error?: string;
}

/**
 * The network boundary. Injected everywhere so adapters are testable against
 * fixtures and so no module in this directory performs I/O of its own.
 */
export type Fetcher = (url: string, init?: { headers?: Record<string, string> }) => Promise<FetchEnvelope>;

/** What an adapter returns: observations it could vouch for, and what it could not. */
export interface SourceResult {
  sourceId: SourceId;
  observations: RawObservation[];
  /** Upstream calls that failed, so a thin chart can explain itself. */
  failures: { url: string; reason: string }[];
  /** Names the resolver refused to attach to an artist. */
  unresolved: { name: string; reason: string }[];
}

export function emptyResult(sourceId: SourceId): SourceResult {
  return { sourceId, observations: [], failures: [], unresolved: [] };
}
