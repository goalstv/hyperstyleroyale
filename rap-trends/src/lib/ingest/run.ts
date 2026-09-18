/**
 * RAP TRENDS — one ingest run.
 *
 * Ties the pieces together: fetch from each connected source, resolve names to
 * roster artists, drop anything that cannot carry provenance, normalize into
 * the engine's `SignalBundle`, and report honestly on what was missed.
 *
 * Deliberately returns a report rather than writing anywhere. Persistence is
 * the caller's problem; this stays pure enough to test end to end on fixtures.
 */

import type { Artist } from "@/lib/types";
import { fetchConcertDemand, type BandsintownEvent } from "./sources/bandsintown";
import { lookupArtist } from "./sources/musicbrainz";
import { normalizeAll, type NormalizedEntry } from "./normalize";
import { sheetFromMusicBrainz } from "@/lib/enrich/from-sources";
import type { ArtistFactSheet } from "@/lib/enrich/facts";
import type { Fetcher, RawObservation } from "./types";

export interface IngestConfig {
  nowIso: string;
  /** Bandsintown's self-declared client identifier. */
  bandsintownAppId?: string;
  /** Resolve identities against MusicBrainz. Rate-limited; daily is plenty. */
  resolveIdentities?: boolean;
  windowDays?: number;
}

export interface IngestReport {
  startedIso: string;
  observations: RawObservation[];
  entries: NormalizedEntry[];
  factSheets: ArtistFactSheet[];
  eventsByArtist: Record<string, BandsintownEvent[]>;
  /** Everything that did not work, named. A thin chart must be able to say why. */
  failures: { sourceId: string; url: string; reason: string }[];
  skipped: { artistId: string; sourceId: string; reason: string }[];
}

/**
 * Only sources the operator has marked `connected` are polled.
 *
 * This mirrors the engine, which already refuses to count a signal whose source
 * is not connected. Fetching from an unauthorised source and discarding the
 * result later would still be fetching from an unauthorised source.
 */
export async function runIngest(
  fetcher: Fetcher,
  artists: Artist[],
  enabledSourceIds: string[],
  config: IngestConfig,
): Promise<IngestReport> {
  const report: IngestReport = {
    startedIso: config.nowIso,
    observations: [],
    entries: [],
    factSheets: [],
    eventsByArtist: {},
    failures: [],
    skipped: [],
  };

  const roster = artists.map((a) => ({ id: a.id, name: a.name }));

  if (enabledSourceIds.includes("bandsintown") && config.bandsintownAppId) {
    const result = await fetchConcertDemand(fetcher, roster, {
      appId: config.bandsintownAppId,
      nowIso: config.nowIso,
      ...(config.windowDays !== undefined ? { windowDays: config.windowDays } : {}),
    });

    report.observations.push(...result.observations);
    report.eventsByArtist = result.eventsByArtist;
    report.failures.push(
      ...result.failures.map((f) => ({ sourceId: "bandsintown", ...f })),
    );
  }

  if (enabledSourceIds.includes("musicbrainz") && config.resolveIdentities) {
    for (const artist of artists) {
      const { match, reason, url } = await lookupArtist(fetcher, artist.name);
      if (!match) {
        report.skipped.push({ artistId: artist.id, sourceId: "musicbrainz", reason });
        report.failures.push({ sourceId: "musicbrainz", url, reason });
        continue;
      }
      report.factSheets.push(sheetFromMusicBrainz(artist.id, match, config.nowIso));
    }
  }

  report.entries = normalizeAll(report.observations);
  return report;
}

/**
 * How many signals an entry has, against the engine's publication floor.
 *
 * Exposed so the OS can show which artists would publish today and which are
 * still too thinly sourced, rather than discovering it at render time.
 */
export function coverageSummary(
  entries: NormalizedEntry[],
  minSignals: number,
): { artistId: string; signals: number; publishable: boolean }[] {
  return entries.map((e) => {
    const signals = Object.keys(e.signals).length;
    return { artistId: e.artistId, signals, publishable: signals >= minSignals };
  });
}
