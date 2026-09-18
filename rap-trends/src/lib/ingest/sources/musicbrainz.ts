/**
 * RAP TRENDS — MusicBrainz adapter. The identity spine.
 *
 * MusicBrainz is not a signal source; it is how every other source is joined.
 * Resolving a name once to a stable MBID and then matching on that id removes
 * the whole class of error where "Future" or "Common" in a sentence becomes
 * chart movement for a real person.
 *
 * No auth, but it requires a descriptive User-Agent and rate-limits to roughly
 * one request per second — see `httpFetcher` and keep the ingest cadence daily.
 *
 * Response shape follows the published `/ws/2/` documentation. Verify against a
 * live response before enabling this source in production; the parser below
 * tolerates missing fields rather than assuming any are present.
 */

import type { Fetcher } from "../types";

const BASE = "https://musicbrainz.org/ws/2";

export interface MusicBrainzMatch {
  mbid: string;
  name: string;
  /** MusicBrainz's own 0–100 match score for the query. */
  matchScore: number;
  /** e.g. "American rapper" — useful to confirm we have the right entity. */
  disambiguation?: string;
  country?: string;
  area?: string;
  sourceUrl: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function searchUrl(name: string): string {
  return `${BASE}/artist?query=${encodeURIComponent(`artist:"${name}"`)}&fmt=json&limit=5`;
}

export function parseArtistSearch(body: unknown, url: string): MusicBrainzMatch[] {
  const root = asRecord(body);
  const artists = root?.["artists"];
  if (!Array.isArray(artists)) return [];

  const out: MusicBrainzMatch[] = [];

  for (const raw of artists) {
    const a = asRecord(raw);
    const mbid = str(a?.["id"]);
    const name = str(a?.["name"]);
    if (!a || !mbid || !name) continue;

    const score = typeof a["score"] === "number" ? a["score"] : 0;
    const area = asRecord(a["area"]);

    out.push({
      mbid,
      name,
      matchScore: score,
      ...(str(a["disambiguation"]) ? { disambiguation: str(a["disambiguation"])! } : {}),
      ...(str(a["country"]) ? { country: str(a["country"])! } : {}),
      ...(str(area?.["name"]) ? { area: str(area!["name"])! } : {}),
      sourceUrl: `https://musicbrainz.org/artist/${mbid}`,
    });
  }

  return out.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Look up one artist's MBID.
 *
 * Returns the best match only when it is clearly better than the runner-up.
 * Two near-equal matches mean the name is ambiguous in MusicBrainz too, and
 * guessing there would poison every downstream join.
 */
export async function lookupArtist(
  fetcher: Fetcher,
  name: string,
): Promise<{ match: MusicBrainzMatch | null; reason: string; url: string }> {
  const url = searchUrl(name);
  const res = await fetcher(url);

  if (!res.ok) {
    return { match: null, reason: res.error ?? `HTTP ${res.status}`, url };
  }

  const matches = parseArtistSearch(res.body, url);
  if (matches.length === 0) {
    return { match: null, reason: `No MusicBrainz artist for "${name}".`, url };
  }

  const [best, second] = matches;
  if (best!.matchScore < 80) {
    return { match: null, reason: `Best match scored ${best!.matchScore}, below the 80 floor.`, url };
  }
  if (second && best!.matchScore - second.matchScore < 5) {
    return {
      match: null,
      reason:
        `"${name}" is ambiguous in MusicBrainz: ${best!.name} (${best!.matchScore}) and ` +
        `${second.name} (${second.matchScore}) are too close to separate.`,
      url,
    };
  }

  return { match: best!, reason: "Unambiguous match.", url };
}
