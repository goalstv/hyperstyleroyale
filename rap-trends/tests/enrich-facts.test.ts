import { describe, expect, it } from "vitest";
import { citationsFor, fact, factCount, mergeSheets } from "@/lib/enrich/facts";
import { sheetFromAudioDb, sheetFromMusicBrainz } from "@/lib/enrich/from-sources";

const NOW = "2026-09-18T00:00:00.000Z";
const CITE = { sourceId: "musicbrainz", sourceUrl: "https://musicbrainz.org/artist/x", retrievedIso: NOW };

describe("fact", () => {
  it("builds a fact when a citation is present", () => {
    expect(fact({ ...CITE, value: "American rapper" })?.value).toBe("American rapper");
  });

  it("refuses a fact with no source URL", () => {
    expect(fact({ ...CITE, sourceUrl: "", value: "American rapper" })).toBeNull();
  });

  it("refuses a fact with no retrieval time", () => {
    expect(fact({ ...CITE, retrievedIso: "", value: "American rapper" })).toBeNull();
  });

  it("refuses null, undefined and blank values", () => {
    expect(fact({ ...CITE, value: null })).toBeNull();
    expect(fact({ ...CITE, value: undefined })).toBeNull();
    expect(fact({ ...CITE, value: "   " })).toBeNull();
  });

  it("accepts a numeric zero, which is a value rather than an absence", () => {
    expect(fact({ ...CITE, value: 0 })?.value).toBe(0);
  });
});

describe("sheetFromMusicBrainz", () => {
  it("cites every field it produces", () => {
    const sheet = sheetFromMusicBrainz(
      "art_r11",
      {
        mbid: "mb-kdot",
        name: "Kendrick Lamar",
        matchScore: 100,
        disambiguation: "American rapper",
        country: "US",
        area: "Compton",
        sourceUrl: "https://musicbrainz.org/artist/mb-kdot",
      },
      NOW,
    );

    expect(factCount(sheet)).toBe(4);
    for (const key of ["musicBrainzId", "descriptor", "country", "area"] as const) {
      expect(sheet[key]!.sourceUrl).toBe("https://musicbrainz.org/artist/mb-kdot");
      expect(sheet[key]!.retrievedIso).toBe(NOW);
    }
  });

  it("omits fields the upstream did not supply rather than filling them", () => {
    const sheet = sheetFromMusicBrainz(
      "art_r02",
      { mbid: "mb-f", name: "Future", matchScore: 99, sourceUrl: "https://musicbrainz.org/artist/mb-f" },
      NOW,
    );
    expect(sheet.descriptor).toBeUndefined();
    expect(sheet.country).toBeUndefined();
    expect(factCount(sheet)).toBe(1);
  });
});

describe("sheetFromAudioDb", () => {
  it("rejects an implausible formation year rather than publishing it", () => {
    const sheet = sheetFromAudioDb("art_1", { idArtist: "1", intFormedYear: "0" }, NOW);
    expect(sheet.formedYear).toBeUndefined();
  });

  it("keeps a plausible year with its citation", () => {
    const sheet = sheetFromAudioDb("art_1", { idArtist: "1", intFormedYear: "2003" }, NOW);
    expect(sheet.formedYear?.value).toBe(2003);
    expect(sheet.formedYear?.sourceUrl).toBe("https://www.theaudiodb.com/artist/1");
  });
});

describe("mergeSheets", () => {
  it("prefers the earlier, more trusted source per field", () => {
    const mb = sheetFromMusicBrainz(
      "art_1",
      { mbid: "mb-1", name: "X", matchScore: 99, country: "US", sourceUrl: "https://musicbrainz.org/artist/mb-1" },
      NOW,
    );
    const adb = sheetFromAudioDb("art_1", { idArtist: "9", strCountry: "Canada", strGenre: "Hip-Hop" }, NOW);

    const merged = mergeSheets("art_1", [mb, adb]);
    expect(merged.country?.value).toBe("US");
    expect(merged.country?.sourceId).toBe("musicbrainz");
    // A field only the second source has still comes through.
    expect(merged.genre?.value).toBe("Hip-Hop");
  });

  it("lists every distinct citation behind a sheet", () => {
    const mb = sheetFromMusicBrainz(
      "art_1",
      { mbid: "mb-1", name: "X", matchScore: 99, sourceUrl: "https://musicbrainz.org/artist/mb-1" },
      NOW,
    );
    const adb = sheetFromAudioDb("art_1", { idArtist: "9", strGenre: "Hip-Hop" }, NOW);
    const citations = citationsFor(mergeSheets("art_1", [mb, adb]));
    expect(citations).toHaveLength(2);
    expect(citations.map((c) => c.sourceId).sort()).toEqual(["musicbrainz", "theaudiodb"]);
  });
});
