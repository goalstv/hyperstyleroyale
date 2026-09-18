import { describe, expect, it } from "vitest";
import {
  isAttachable,
  normalizeName,
  requiresCorroboration,
  resolveArtist,
  type ResolvableArtist,
} from "@/lib/ingest/resolve";

const ROSTER: ResolvableArtist[] = [
  { id: "art_r01", name: "André 3000", aliases: ["Andre 3000"] },
  { id: "art_r02", name: "Future", externalIds: { musicbrainz: "mb-future" } },
  { id: "art_r09", name: "Nas" },
  { id: "art_r11", name: "Kendrick Lamar" },
  { id: "art_r13", name: "E-40" },
  { id: "art_r14", name: "Too $hort" },
  { id: "art_r15", name: "Common" },
];

describe("normalizeName", () => {
  it("strips diacritics so André 3000 matches Andre 3000", () => {
    expect(normalizeName("André 3000")).toBe(normalizeName("Andre 3000"));
  });

  it("keeps the characters that actually distinguish an artist", () => {
    expect(normalizeName("Too $hort")).toBe("too $hort");
    expect(normalizeName("E-40")).toBe("e-40");
  });
});

describe("resolveArtist", () => {
  it("resolves an unambiguous name", () => {
    const r = resolveArtist("Kendrick Lamar", ROSTER);
    expect(r.status).toBe("resolved");
    expect(r.artistId).toBe("art_r11");
    expect(isAttachable(r)).toBe(true);
  });

  it("resolves an alias", () => {
    const r = resolveArtist("Andre 3000", ROSTER);
    expect(r.artistId).toBe("art_r01");
  });

  it("drops a name nobody on the roster has", () => {
    const r = resolveArtist("Some Unknown Act", ROSTER);
    expect(r.status).toBe("unmatched");
    expect(isAttachable(r)).toBe(false);
  });

  // The trap: several real hip-hop names are ordinary English words.
  it("refuses 'Future' with no music cue in context", () => {
    const r = resolveArtist("Future", ROSTER, {
      context: "executives discussed the future of the label at length",
    });
    expect(r.status).toBe("needs_corroboration");
    expect(isAttachable(r)).toBe(false);
  });

  it("accepts 'Future' when the context is clearly about music", () => {
    const r = resolveArtist("Future", ROSTER, {
      context: "Future announced a new album and a national tour",
    });
    expect(r.status).toBe("resolved");
    expect(r.artistId).toBe("art_r02");
    expect(isAttachable(r)).toBe(true);
  });

  it("refuses 'Common' in a sentence about common sense", () => {
    const r = resolveArtist("Common", ROSTER, {
      context: "it is common sense that the deal would not close",
    });
    expect(isAttachable(r)).toBe(false);
  });

  it("an external id beats the common-word guard outright", () => {
    const r = resolveArtist("Future", ROSTER, {
      context: "no music words here at all",
      externalId: { musicbrainz: "mb-future" },
    });
    expect(r.status).toBe("resolved");
    expect(r.confidence).toBe(1);
  });

  it("flags the ordinary-word names we hold", () => {
    expect(requiresCorroboration("Future")).toBe(true);
    expect(requiresCorroboration("Common")).toBe(true);
    expect(requiresCorroboration("Nas")).toBe(true);
    expect(requiresCorroboration("Kendrick Lamar")).toBe(false);
  });

  it("drops a name that two roster artists both claim", () => {
    const dupes: ResolvableArtist[] = [
      { id: "a", name: "Same Name" },
      { id: "b", name: "Same Name" },
    ];
    const r = resolveArtist("Same Name", dupes);
    expect(r.status).toBe("ambiguous");
    expect(isAttachable(r)).toBe(false);
  });

  it("drops an empty name rather than matching anything", () => {
    expect(resolveArtist("   ", ROSTER).status).toBe("unmatched");
  });
});
