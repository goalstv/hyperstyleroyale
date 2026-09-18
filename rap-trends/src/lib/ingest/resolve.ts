/**
 * RAP TRENDS — artist identity resolution.
 *
 * Turning a name found in text or an upstream payload into one of our artists
 * is the step where an automated Index most easily starts lying. Several real
 * hip-hop names are also ordinary English words — Future, Common, Nas, Drake,
 * Ice Spice — so a naive match promotes "the future of the label" and "common
 * sense" into chart movement for identifiable people.
 *
 * So this module fails toward dropping the observation, the same way the rights
 * gate fails toward not clearing. An ambiguous mention is worth nothing; a
 * wrong one is worth less than nothing.
 */

/** Below this, we do not attach the observation to anybody. */
export const MIN_RESOLUTION_CONFIDENCE = 0.6;

/** Two candidates closer together than this are treated as ambiguous. */
export const AMBIGUITY_MARGIN = 0.15;

export type ResolutionStatus =
  | "resolved"
  | "ambiguous"
  | "unmatched"
  | "needs_corroboration";

export interface ResolvableArtist {
  id: string;
  name: string;
  /** Alternate spellings and known aliases. */
  aliases?: string[];
  /** External ids, when we hold them. An id match is decisive. */
  externalIds?: { musicbrainz?: string; theaudiodb?: string };
}

export interface Resolution {
  status: ResolutionStatus;
  artistId?: string;
  confidence: number;
  candidates: { artistId: string; name: string; confidence: number }[];
  reason: string;
}

/**
 * Names that are also ordinary words or common proper nouns. A mention of one
 * of these is only accepted when the surrounding text carries an independent
 * music cue, or an external id resolves it outright.
 *
 * This list is deliberately over-inclusive. A missed mention costs one data
 * point; a false one puts words in a real person's mouth.
 */
export const NEEDS_CORROBORATION = new Set([
  "future",
  "common",
  "nas",
  "drake",
  "ice spice",
  "the game",
  "action bronson",
  "black thought",
  "method man",
  "ghostface killah",
  "scarface",
  "guru",
  "prodigy",
  "shyne",
  "cassidy",
  "styles p",
  "juice",
  "lil baby",
  "young thug",
  "bun b",
]);

/**
 * Independent evidence that a passage is about music.
 *
 * These are deliberately strict. An earlier draft included "label", "track",
 * "beat" and "record" — and a test caught that "the future of the label"
 * therefore corroborated itself, which is precisely the false positive this
 * guard exists to stop. Weak cues are worse than no cues, because they launder
 * a guess into an attribution.
 *
 * Matched on word boundaries, not substrings: `includes("rap")` also matches
 * "wrapped", "rapport" and "therapy".
 */
const MUSIC_CUES = [
  "album",
  "mixtape",
  "rapper",
  "rap",
  "hip-hop",
  "hip hop",
  "discography",
  "freestyle",
  "record label",
  "billboard",
  "tracklist",
  "verse",
  "bars",
  "feat\\.",
  "featuring",
  "producer",
  "streaming",
  "concert",
  "headlining",
  "tour dates",
  "new single",
  "chart",
];

const CUE_PATTERNS = MUSIC_CUES.map((cue) => new RegExp(`\\b${cue}\\b`, "i"));

export function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    // Strip diacritics so "André 3000" matches "Andre 3000".
    .replace(/[̀-ͯ]/g, "")
    // Collapse punctuation that varies between sources, but keep $ and digits:
    // "Too $hort" and "E-40" are distinguishing, not noise.
    .replace(/[.,'"`’‘“”!?()\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function requiresCorroboration(name: string): boolean {
  return NEEDS_CORROBORATION.has(normalizeName(name));
}

export function hasMusicCue(context: string): boolean {
  return CUE_PATTERNS.some((pattern) => pattern.test(context));
}

function candidateNames(artist: ResolvableArtist): string[] {
  return [artist.name, ...(artist.aliases ?? [])].map(normalizeName);
}

export interface ResolveOptions {
  /** Surrounding text, used only to corroborate an ambiguous name. */
  context?: string;
  /** An upstream identifier, when the source supplies one. Decisive if matched. */
  externalId?: { musicbrainz?: string; theaudiodb?: string };
}

/**
 * Resolve a name against the roster.
 *
 * An external id match short-circuits everything: it is evidence, not a guess.
 * Otherwise an exact name or alias match scores 0.9, and a name on the
 * corroboration list must earn the rest from a music cue in its context.
 */
export function resolveArtist(
  rawName: string,
  roster: ResolvableArtist[],
  options: ResolveOptions = {},
): Resolution {
  const name = normalizeName(rawName);

  if (!name) {
    return { status: "unmatched", confidence: 0, candidates: [], reason: "Empty name." };
  }

  // 1. External id — decisive.
  const mb = options.externalId?.musicbrainz;
  const adb = options.externalId?.theaudiodb;
  if (mb || adb) {
    const byId = roster.find(
      (a) =>
        (mb && a.externalIds?.musicbrainz === mb) || (adb && a.externalIds?.theaudiodb === adb),
    );
    if (byId) {
      return {
        status: "resolved",
        artistId: byId.id,
        confidence: 1,
        candidates: [{ artistId: byId.id, name: byId.name, confidence: 1 }],
        reason: "Matched on an external identifier.",
      };
    }
  }

  // 2. Exact name or alias.
  const exact = roster.filter((a) => candidateNames(a).includes(name));

  if (exact.length === 0) {
    return {
      status: "unmatched",
      confidence: 0,
      candidates: [],
      reason: `No roster artist matches "${rawName}". Observation dropped.`,
    };
  }

  if (exact.length > 1) {
    return {
      status: "ambiguous",
      confidence: 0,
      candidates: exact.map((a) => ({ artistId: a.id, name: a.name, confidence: 0.9 })),
      reason: `"${rawName}" matches ${exact.length} roster artists. Observation dropped.`,
    };
  }

  const hit = exact[0]!;
  const base = 0.9;

  // 3. The common-word guard.
  if (requiresCorroboration(hit.name)) {
    const context = options.context ?? "";
    if (!hasMusicCue(context)) {
      return {
        status: "needs_corroboration",
        confidence: 0.35,
        candidates: [{ artistId: hit.id, name: hit.name, confidence: 0.35 }],
        reason:
          `"${hit.name}" is also an ordinary word. No music cue in the surrounding text, ` +
          `so the mention is not attributed. Supply an external id or more context.`,
      };
    }
    return {
      status: "resolved",
      artistId: hit.id,
      confidence: 0.8,
      candidates: [{ artistId: hit.id, name: hit.name, confidence: 0.8 }],
      reason: `"${hit.name}" is an ordinary word, corroborated by a music cue in context.`,
    };
  }

  return {
    status: "resolved",
    artistId: hit.id,
    confidence: base,
    candidates: [{ artistId: hit.id, name: hit.name, confidence: base }],
    reason: "Exact name or alias match.",
  };
}

/** True when a resolution is strong enough to attach an observation to an artist. */
export function isAttachable(resolution: Resolution): boolean {
  return resolution.status === "resolved" && resolution.confidence >= MIN_RESOLUTION_CONFIDENCE;
}
