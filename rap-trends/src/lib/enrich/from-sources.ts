/**
 * RAP TRENDS — building fact sheets from adapter output.
 *
 * Kept separate from `facts.ts` so the citation rule stays readable on its own
 * and does not accumulate per-source parsing.
 */

import type { MusicBrainzMatch } from "@/lib/ingest/sources/musicbrainz";
import { fact, type ArtistFactSheet } from "./facts";

export function sheetFromMusicBrainz(
  artistId: string,
  match: MusicBrainzMatch,
  retrievedIso: string,
): ArtistFactSheet {
  const cite = { sourceId: "musicbrainz", sourceUrl: match.sourceUrl, retrievedIso };

  const sheet: ArtistFactSheet = { artistId };
  const mbid = fact({ ...cite, value: match.mbid });
  const descriptor = fact({ ...cite, value: match.disambiguation });
  const country = fact({ ...cite, value: match.country });
  const area = fact({ ...cite, value: match.area });

  if (mbid) sheet.musicBrainzId = mbid;
  if (descriptor) sheet.descriptor = descriptor;
  if (country) sheet.country = country;
  if (area) sheet.area = area;

  return sheet;
}

export interface AudioDbArtist {
  idArtist?: string;
  strArtist?: string;
  strCountry?: string;
  intFormedYear?: string;
  strGenre?: string;
  strBiographyEN?: string;
}

/**
 * TheAudioDB carries a free-text biography. It is used only where MusicBrainz
 * has nothing, it is always attributed, and it is never merged into our own
 * prose — a sourced quote we can point at is fine, a paraphrase with no source
 * is the thing this whole layer exists to prevent.
 */
export function sheetFromAudioDb(
  artistId: string,
  row: AudioDbArtist,
  retrievedIso: string,
): ArtistFactSheet {
  const id = row.idArtist;
  const sourceUrl = id
    ? `https://www.theaudiodb.com/artist/${id}`
    : "https://www.theaudiodb.com/";
  const cite = { sourceId: "theaudiodb", sourceUrl, retrievedIso };

  const sheet: ArtistFactSheet = { artistId };

  const year = Number.parseInt(row.intFormedYear ?? "", 10);
  const formedYear = Number.isFinite(year) && year > 1900 && year <= new Date().getFullYear()
    ? fact({ ...cite, value: year })
    : null;

  const country = fact({ ...cite, value: row.strCountry });
  const genre = fact({ ...cite, value: row.strGenre });
  const biography = fact({ ...cite, value: row.strBiographyEN });

  if (formedYear) sheet.formedYear = formedYear;
  if (country) sheet.country = country;
  if (genre) sheet.genre = genre;
  if (biography) sheet.biography = biography;

  return sheet;
}
