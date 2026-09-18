/**
 * RAP TRENDS — Bandsintown adapter.
 *
 * Feeds two things: the `concert_demand` signal, and the upcoming-events list
 * on each city bureau page.
 *
 * Chosen as the first live source deliberately. Announced dates are a matter of
 * public record, they are hard to inflate the way a play count can be, and the
 * data is counting events rather than inferring sentiment — so it is the kind
 * of countable fact the Index should run on.
 *
 * `app_id` is a self-declared identifier rather than a secret key, but treat it
 * as configuration. Response shape follows the published API; the parser
 * tolerates missing fields.
 */

import type { SignalKey } from "@/lib/types";
import { makeObservation } from "../observation";
import type { Fetcher, RawObservation, SourceResult } from "../types";
import { emptyResult } from "../types";

const BASE = "https://rest.bandsintown.com";

/**
 * Upper reference for the log scale on event counts. An artist with this many
 * announced dates in the window maps to 100. Set from observed data, not
 * invented: revisit it once a full week of real ingest exists, and record the
 * change, because it moves every score.
 */
export const EVENT_COUNT_REF_MAX = 40;

export interface BandsintownEvent {
  id: string;
  datetimeIso: string;
  venueName: string;
  city: string;
  region: string;
  country: string;
  url: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function eventsUrl(artistName: string, appId: string): string {
  return `${BASE}/artists/${encodeURIComponent(artistName)}/events?app_id=${encodeURIComponent(appId)}`;
}

export function parseEvents(body: unknown): BandsintownEvent[] {
  if (!Array.isArray(body)) return [];

  const out: BandsintownEvent[] = [];
  for (const raw of body) {
    const e = asRecord(raw);
    const id = str(e?.["id"]);
    const datetime = str(e?.["datetime"]);
    if (!e || !id || !datetime) continue;

    const parsed = Date.parse(datetime);
    if (Number.isNaN(parsed)) continue;

    const venue = asRecord(e["venue"]);

    out.push({
      id,
      datetimeIso: new Date(parsed).toISOString(),
      venueName: str(venue?.["name"]) ?? "Venue not supplied",
      city: str(venue?.["city"]) ?? "",
      region: str(venue?.["region"]) ?? "",
      country: str(venue?.["country"]) ?? "",
      url: str(e["url"]) ?? "",
    });
  }

  return out.sort((a, b) => (a.datetimeIso < b.datetimeIso ? -1 : 1));
}

export interface ConcertDemandOptions {
  appId: string;
  /** Only events within this many days ahead count toward demand. */
  windowDays?: number;
  nowIso: string;
}

/**
 * Turn announced dates into a `concert_demand` observation.
 *
 * Counts events inside the forward window. Events already past are excluded:
 * demand is a forward-looking signal, and including history would make the
 * reading drift upward forever.
 */
export async function fetchConcertDemand(
  fetcher: Fetcher,
  artists: { id: string; name: string }[],
  options: ConcertDemandOptions,
): Promise<SourceResult & { eventsByArtist: Record<string, BandsintownEvent[]> }> {
  const result = emptyResult("bandsintown");
  const eventsByArtist: Record<string, BandsintownEvent[]> = {};
  const windowDays = options.windowDays ?? 120;
  const now = Date.parse(options.nowIso);
  const horizon = now + windowDays * 86_400_000;

  for (const artist of artists) {
    const url = eventsUrl(artist.name, options.appId);
    const res = await fetcher(url);

    if (!res.ok) {
      result.failures.push({ url, reason: res.error ?? `HTTP ${res.status}` });
      continue;
    }

    const all = parseEvents(res.body);
    const upcoming = all.filter((e) => {
      const t = Date.parse(e.datetimeIso);
      return t >= now && t <= horizon;
    });

    eventsByArtist[artist.id] = upcoming;

    const observation = makeObservation({
      sourceId: "bandsintown",
      artistId: artist.id,
      metric: "concert_demand" satisfies SignalKey,
      rawValue: upcoming.length,
      scale: { kind: "log10", refMax: EVENT_COUNT_REF_MAX },
      observedIso: options.nowIso,
      fetchedIso: res.fetchedIso,
      sourceUrl: url,
      note: `${upcoming.length} announced dates within ${windowDays} days.`,
    });

    if (observation) result.observations.push(observation);
  }

  return { ...result, eventsByArtist };
}

/** Exposed for tests and for the audit page's worked example. */
export function demandObservations(result: SourceResult): RawObservation[] {
  return result.observations.filter((o) => o.metric === "concert_demand");
}
