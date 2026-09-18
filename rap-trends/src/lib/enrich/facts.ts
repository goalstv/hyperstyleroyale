/**
 * RAP TRENDS — sourced facts about real artists.
 *
 * The artist directory currently asserts only a name and a city, because those
 * were the two things that could be stated without inventing anything. That was
 * the right call while there was no source; it is the wrong shape once there is
 * one.
 *
 * The constraint this module enforces is structural rather than procedural: a
 * fact cannot be constructed without a citation. There is no code path that
 * produces a `SourcedFact` with no URL, so "we'll add the source later" is not
 * something a future edit can quietly do.
 */

export interface SourcedFact<T> {
  value: T;
  /** Which adapter produced it. */
  sourceId: string;
  /** A URL a reader can open. Required. */
  sourceUrl: string;
  retrievedIso: string;
}

/** The only constructor. Returns null rather than an uncited fact. */
export function fact<T>(input: {
  value: T | null | undefined;
  sourceId: string;
  sourceUrl: string;
  retrievedIso: string;
}): SourcedFact<T> | null {
  const { value, sourceId, sourceUrl, retrievedIso } = input;
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim().length === 0) return null;
  if (!sourceId || !sourceUrl || !retrievedIso) return null;
  return { value, sourceId, sourceUrl, retrievedIso };
}

/**
 * What we can say about an artist and stand behind.
 *
 * Every field is optional and every present field carries its own citation.
 * A sheet with three facts is a perfectly good sheet; padding it out is what
 * we are trying to prevent.
 */
export interface ArtistFactSheet {
  artistId: string;
  musicBrainzId?: SourcedFact<string>;
  /** MusicBrainz disambiguation, e.g. "American rapper". */
  descriptor?: SourcedFact<string>;
  country?: SourcedFact<string>;
  area?: SourcedFact<string>;
  formedYear?: SourcedFact<number>;
  genre?: SourcedFact<string>;
  /** Free-text biography from an upstream. Shown quoted and attributed. */
  biography?: SourcedFact<string>;
}

export function factCount(sheet: ArtistFactSheet): number {
  return Object.entries(sheet).filter(
    ([key, value]) => key !== "artistId" && value !== undefined,
  ).length;
}

/** Every distinct source backing a sheet, for the "sources" line under a profile. */
export function citationsFor(sheet: ArtistFactSheet): { sourceId: string; sourceUrl: string }[] {
  const seen = new Map<string, string>();
  for (const [key, value] of Object.entries(sheet)) {
    if (key === "artistId" || !value) continue;
    const f = value as SourcedFact<unknown>;
    if (f.sourceUrl) seen.set(f.sourceUrl, f.sourceId);
  }
  return [...seen.entries()]
    .map(([sourceUrl, sourceId]) => ({ sourceId, sourceUrl }))
    .sort((a, b) => (a.sourceUrl < b.sourceUrl ? -1 : 1));
}

/**
 * Merge sheets from several upstreams.
 *
 * First writer wins per field. Callers pass sheets in order of trust, which for
 * this build means MusicBrainz before TheAudioDB — MusicBrainz is editorially
 * curated and its identifiers are what everything else joins on.
 */
export function mergeSheets(artistId: string, sheets: ArtistFactSheet[]): ArtistFactSheet {
  const merged: Record<string, unknown> = { artistId };
  for (const sheet of sheets) {
    for (const [key, value] of Object.entries(sheet)) {
      if (key === "artistId" || value === undefined) continue;
      if (merged[key] === undefined) merged[key] = value;
    }
  }
  return merged as unknown as ArtistFactSheet;
}
