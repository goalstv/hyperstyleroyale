/**
 * RAP TRENDS — index snapshots and replay.
 *
 * This is the module the word "transparent" actually rests on.
 *
 * An automated pipeline with no record of its inputs is just a faster black
 * box. What makes the Index checkable is that `scoreEntry` is pure: the same
 * signals, profile and timestamp always produce the same score. So if we freeze
 * the observations behind a published chart, anyone can recompute it and get
 * the identical number — or find that they cannot, which is equally useful.
 *
 * `replaySnapshot` is that check, and it is meant to be run by outsiders.
 */

import { rankEntries } from "@/lib/index-engine";
import type {
  ChartEntry,
  EditorialOverride,
  IndexSource,
  IndexWeightProfile,
} from "@/lib/types";
import type { RawObservation } from "./types";

export interface SnapshotEntry {
  entryId: string;
  artistId: string;
  /** The score published at the time. What replay must reproduce. */
  publishedScore: number;
  publishedRank: number;
  publishedConfidence: number;
}

export interface IndexSnapshot {
  weekId: string;
  createdIso: string;
  /** The exact instant `scoreEntry` was evaluated at. Decay depends on it. */
  computedAtIso: string;
  profile: IndexWeightProfile;
  /**
   * The source registry as it stood at publication. The engine only counts
   * signals from a `connected` source, so which sources were live is part of
   * the arithmetic and has to be frozen alongside the numbers.
   */
  sources: IndexSource[];
  overrides: EditorialOverride[];
  /** Every observation that fed this chart, with its source URL. */
  observations: RawObservation[];
  entries: SnapshotEntry[];
  /** Change-detection digest over the frozen inputs. */
  digest: string;
}

/**
 * Deterministic JSON: keys sorted at every depth.
 *
 * Needed because object key order is insertion-ordered in JS, so two identical
 * snapshots could otherwise serialise differently and produce different digests.
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
}

/**
 * FNV-1a, 64-bit, as hex.
 *
 * This is a CHANGE-DETECTION digest, not a tamper-evident one: it is fast and
 * dependency-free, and it will tell you that a snapshot was altered by accident.
 * It will not stop someone altering one deliberately. Before publishing
 * snapshots as an audit record, swap this for SHA-256 — the digest is computed
 * over `stableStringify` output, so the hash function is the only thing that
 * changes.
 */
export function fnv1a64(input: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, "0");
}

export type HashFn = (input: string) => string;

/** Digest over everything except the digest field itself. */
export function digestOf(snapshot: Omit<IndexSnapshot, "digest">, hash: HashFn = fnv1a64): string {
  return hash(stableStringify(snapshot));
}

export interface FreezeInput {
  weekId: string;
  createdIso: string;
  computedAtIso: string;
  profile: IndexWeightProfile;
  sources: IndexSource[];
  overrides: EditorialOverride[];
  observations: RawObservation[];
  /** The entries as published, already scored. */
  published: ChartEntry[];
}

export function freezeSnapshot(input: FreezeInput, hash: HashFn = fnv1a64): IndexSnapshot {
  const entries: SnapshotEntry[] = input.published.map((e) => ({
    entryId: e.id,
    artistId: e.artistId,
    publishedScore: e.score?.score ?? 0,
    publishedRank: e.rank,
    publishedConfidence: e.score?.confidence ?? 0,
  }));

  const body: Omit<IndexSnapshot, "digest"> = {
    weekId: input.weekId,
    createdIso: input.createdIso,
    computedAtIso: input.computedAtIso,
    profile: input.profile,
    sources: input.sources,
    overrides: input.overrides,
    observations: [...input.observations].sort((a, b) => (a.id < b.id ? -1 : 1)),
    entries: [...entries].sort((a, b) => (a.entryId < b.entryId ? -1 : 1)),
  };

  return { ...body, digest: digestOf(body, hash) };
}

export interface ReplayDiff {
  entryId: string;
  field: "score" | "rank" | "confidence";
  published: number;
  recomputed: number;
}

export interface ReplayResult {
  matches: boolean;
  /** True when the frozen inputs still hash to the recorded digest. */
  digestIntact: boolean;
  diffs: ReplayDiff[];
  checkedEntries: number;
}

/**
 * Recompute a published chart from its frozen inputs.
 *
 * `entriesForReplay` supplies the non-signal fields the engine needs (title,
 * release date, city) which are editorial rather than observed; the signals
 * themselves come from the snapshot so they cannot be quietly substituted.
 */
export function replaySnapshot(
  snapshot: IndexSnapshot,
  entriesForReplay: ChartEntry[],
  hash: HashFn = fnv1a64,
): ReplayResult {
  const { digest, ...body } = snapshot;
  const digestIntact = digestOf(body, hash) === digest;

  const recomputed = rankEntries(entriesForReplay, {
    profile: snapshot.profile,
    sources: snapshot.sources,
    overrides: snapshot.overrides,
    nowIso: snapshot.computedAtIso,
  });

  const byId = new Map(recomputed.map((e) => [e.id, e]));
  const diffs: ReplayDiff[] = [];

  for (const entry of snapshot.entries) {
    const got = byId.get(entry.entryId);
    if (!got) continue;

    if (round2(got.score?.score ?? 0) !== round2(entry.publishedScore)) {
      diffs.push({
        entryId: entry.entryId,
        field: "score",
        published: entry.publishedScore,
        recomputed: got.score?.score ?? 0,
      });
    }
    if (got.rank !== entry.publishedRank) {
      diffs.push({
        entryId: entry.entryId,
        field: "rank",
        published: entry.publishedRank,
        recomputed: got.rank,
      });
    }
    if (round2(got.score?.confidence ?? 0) !== round2(entry.publishedConfidence)) {
      diffs.push({
        entryId: entry.entryId,
        field: "confidence",
        published: entry.publishedConfidence,
        recomputed: got.score?.confidence ?? 0,
      });
    }
  }

  return {
    matches: digestIntact && diffs.length === 0,
    digestIntact,
    diffs,
    checkedEntries: snapshot.entries.length,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
