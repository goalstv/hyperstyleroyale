/**
 * RAP TRENDS — upcoming events per city bureau.
 *
 * The thirteen bureau pages are currently hand-written and static, which gives
 * nobody a reason to come back to one. Announced dates change weekly and are a
 * matter of public record, so they are the cheapest honest way to make a bureau
 * page live.
 *
 * Matching an event to a bureau is done on the venue's own city string. It is
 * deliberately conservative: an event we cannot place confidently is left out
 * rather than assigned to the nearest-looking market.
 */

import type { BandsintownEvent } from "@/lib/ingest/sources/bandsintown";

export interface BureauEvent {
  eventId: string;
  cityId: string;
  artistId: string;
  artistName: string;
  venueName: string;
  datetimeIso: string;
  sourceUrl: string;
  sourceId: string;
}

export interface CityMatcher {
  cityId: string;
  /** City name plus any spellings the upstream uses. Matched case-insensitively. */
  names: string[];
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[.,'’]/g, "").replace(/\s+/g, " ").trim();
}

export function matchCity(venueCity: string, matchers: CityMatcher[]): string | null {
  const needle = norm(venueCity);
  if (!needle) return null;

  const hits = matchers.filter((m) => m.names.some((n) => norm(n) === needle));
  // Exactly one bureau must claim it. Zero means we do not cover that market;
  // more than one means our matcher table is wrong and should be fixed rather
  // than guessed around.
  return hits.length === 1 ? hits[0]!.cityId : null;
}

export interface CollectOptions {
  matchers: CityMatcher[];
  nowIso: string;
  /** Most events to keep per bureau. */
  limitPerCity?: number;
}

/**
 * Turn per-artist event lists into per-bureau lists.
 *
 * Deduplicates on venue + start time + artist, because the same date is
 * routinely announced more than once and a bureau page listing it twice reads
 * as carelessness.
 */
export function collectBureauEvents(
  eventsByArtist: Record<string, BandsintownEvent[]>,
  artistNames: Record<string, string>,
  options: CollectOptions,
): Record<string, BureauEvent[]> {
  const now = Date.parse(options.nowIso);
  const limit = options.limitPerCity ?? 8;
  const seen = new Set<string>();
  const byCity: Record<string, BureauEvent[]> = {};

  for (const [artistId, events] of Object.entries(eventsByArtist)) {
    for (const event of events) {
      if (Date.parse(event.datetimeIso) < now) continue;

      const cityId = matchCity(event.city, options.matchers);
      if (!cityId) continue;

      const dedupeKey = `${artistId}|${norm(event.venueName)}|${event.datetimeIso}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const bucket = byCity[cityId] ?? [];
      bucket.push({
        eventId: event.id,
        cityId,
        artistId,
        artistName: artistNames[artistId] ?? artistId,
        venueName: event.venueName,
        datetimeIso: event.datetimeIso,
        sourceUrl: event.url,
        sourceId: "bandsintown",
      });
      byCity[cityId] = bucket;
    }
  }

  for (const cityId of Object.keys(byCity)) {
    byCity[cityId] = byCity[cityId]!
      .sort((a, b) => (a.datetimeIso < b.datetimeIso ? -1 : 1))
      .slice(0, limit);
  }

  return byCity;
}
