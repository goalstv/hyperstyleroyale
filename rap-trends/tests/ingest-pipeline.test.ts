import { describe, expect, it } from "vitest";
import { applyScale, makeObservation } from "@/lib/ingest/observation";
import { normalizeAll, normalizeObservations } from "@/lib/ingest/normalize";
import { fixtureFetcher } from "@/lib/ingest/http";
import {
  eventsUrl,
  fetchConcertDemand,
  parseEvents,
  EVENT_COUNT_REF_MAX,
} from "@/lib/ingest/sources/bandsintown";
import { lookupArtist, parseArtistSearch } from "@/lib/ingest/sources/musicbrainz";
import type { RawObservation } from "@/lib/ingest/types";

const NOW = "2026-09-18T00:00:00.000Z";

function obs(over: Partial<RawObservation> = {}): RawObservation {
  return {
    id: "x",
    sourceId: "bandsintown",
    artistId: "art_1",
    metric: "concert_demand",
    value: 50,
    rawValue: 10,
    scale: { kind: "passthrough" },
    observedIso: NOW,
    fetchedIso: NOW,
    sourceUrl: "https://example.test/a",
    ...over,
  };
}

describe("applyScale", () => {
  it("clamps a passthrough reading to 0–100", () => {
    expect(applyScale(140, { kind: "passthrough" })).toBe(100);
    expect(applyScale(-5, { kind: "passthrough" })).toBe(0);
  });

  it("maps a linear range onto 0–100", () => {
    expect(applyScale(50, { kind: "linear", min: 0, max: 100 })).toBe(50);
    expect(applyScale(5, { kind: "linear", min: 0, max: 10 })).toBe(50);
  });

  it("returns 0 for a degenerate linear range rather than dividing by zero", () => {
    expect(applyScale(5, { kind: "linear", min: 10, max: 10 })).toBe(0);
  });

  it("log-scales long-tailed counts so the top act does not flatten everyone", () => {
    const top = applyScale(40, { kind: "log10", refMax: 40 });
    const mid = applyScale(6, { kind: "log10", refMax: 40 });
    expect(top).toBe(100);
    // Under a linear map 6/40 would be 15. The log map keeps mid-tier acts visible.
    expect(mid).toBeGreaterThan(40);
    expect(mid).toBeLessThan(60);
  });

  it("treats a non-finite reading as zero rather than NaN", () => {
    expect(applyScale(Number.NaN, { kind: "passthrough" })).toBe(0);
  });
});

describe("makeObservation", () => {
  it("rejects an observation with no source URL", () => {
    const made = makeObservation({
      sourceId: "bandsintown",
      artistId: "art_1",
      metric: "concert_demand",
      rawValue: 3,
      scale: { kind: "passthrough" },
      observedIso: NOW,
      fetchedIso: NOW,
      sourceUrl: "",
    });
    expect(made).toBeNull();
  });

  it("rejects an observation with no artist", () => {
    const made = makeObservation({
      sourceId: "bandsintown",
      artistId: "",
      metric: "concert_demand",
      rawValue: 3,
      scale: { kind: "passthrough" },
      observedIso: NOW,
      fetchedIso: NOW,
      sourceUrl: "https://example.test/a",
    });
    expect(made).toBeNull();
  });

  it("keeps the raw value alongside the scaled one", () => {
    const made = makeObservation({
      sourceId: "bandsintown",
      artistId: "art_1",
      metric: "concert_demand",
      rawValue: 40,
      scale: { kind: "log10", refMax: 40 },
      observedIso: NOW,
      fetchedIso: NOW,
      sourceUrl: "https://example.test/a",
    });
    expect(made?.rawValue).toBe(40);
    expect(made?.value).toBe(100);
  });
});

describe("normalizeObservations", () => {
  it("leaves an unobserved signal absent rather than zero", () => {
    const entry = normalizeObservations("art_1", [obs()]);
    expect(entry.signals.concert_demand).toBe(50);
    expect("streaming_velocity" in entry.signals).toBe(false);
    expect(entry.missing).toContain("streaming_velocity");
  });

  it("averages rather than taking the max, so one source cannot set a position", () => {
    const entry = normalizeObservations("art_1", [
      obs({ id: "a", value: 20 }),
      obs({ id: "b", value: 80, sourceId: "musicbrainz" }),
    ]);
    expect(entry.signals.concert_demand).toBe(50);
    expect(entry.coverage[0]!.observations).toBe(2);
    expect(entry.coverage[0]!.sourceIds).toEqual(["bandsintown", "musicbrainz"]);
  });

  it("ignores observations belonging to another artist", () => {
    const entry = normalizeObservations("art_1", [obs(), obs({ id: "z", artistId: "art_2" })]);
    expect(entry.observationIds).toHaveLength(1);
  });

  it("normalizes every artist present in the set", () => {
    const all = normalizeAll([obs(), obs({ id: "z", artistId: "art_2" })]);
    expect(all.map((e) => e.artistId)).toEqual(["art_1", "art_2"]);
  });
});

describe("bandsintown adapter", () => {
  const events = [
    { id: "e1", datetime: "2026-10-01T20:00:00", url: "https://bandsintown.test/e1",
      venue: { name: "Terminal 5", city: "New York", region: "NY", country: "United States" } },
    { id: "e2", datetime: "2026-11-14T20:00:00", url: "https://bandsintown.test/e2",
      venue: { name: "The Novo", city: "Los Angeles", region: "CA", country: "United States" } },
    // Already happened — must not count toward forward-looking demand.
    { id: "e3", datetime: "2026-01-04T20:00:00", url: "https://bandsintown.test/e3",
      venue: { name: "Old Show", city: "New York", region: "NY", country: "United States" } },
    // Malformed: no datetime. Must be skipped, not crash the run.
    { id: "e4", venue: { name: "Broken" } },
  ];

  it("parses and sorts events, skipping malformed rows", () => {
    const parsed = parseEvents(events);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]!.id).toBe("e3");
    expect(parsed.find((e) => e.id === "e4")).toBeUndefined();
  });

  it("returns an empty list for a non-array body rather than throwing", () => {
    expect(parseEvents({ error: "nope" })).toEqual([]);
  });

  it("counts only forward-window dates into concert_demand", async () => {
    const url = eventsUrl("Kendrick Lamar", "raptrends");
    const fetcher = fixtureFetcher({ [url]: events }, NOW);

    const result = await fetchConcertDemand(
      fetcher,
      [{ id: "art_r11", name: "Kendrick Lamar" }],
      { appId: "raptrends", nowIso: NOW, windowDays: 120 },
    );

    expect(result.observations).toHaveLength(1);
    const o = result.observations[0]!;
    // e1 and e2 are ahead and inside 120 days; e3 is past; e4 is malformed.
    expect(o.rawValue).toBe(2);
    expect(o.metric).toBe("concert_demand");
    expect(o.sourceUrl).toBe(url);
    expect(o.scale).toEqual({ kind: "log10", refMax: EVENT_COUNT_REF_MAX });
    expect(result.eventsByArtist.art_r11).toHaveLength(2);
  });

  it("records a failure instead of inventing a reading when the upstream is down", async () => {
    const fetcher = fixtureFetcher({}, NOW);
    const result = await fetchConcertDemand(
      fetcher,
      [{ id: "art_r11", name: "Kendrick Lamar" }],
      { appId: "raptrends", nowIso: NOW },
    );
    expect(result.observations).toHaveLength(0);
    expect(result.failures).toHaveLength(1);
  });
});

describe("musicbrainz adapter", () => {
  const strong = {
    artists: [
      { id: "mb-kdot", name: "Kendrick Lamar", score: 100, disambiguation: "American rapper",
        country: "US", area: { name: "Compton" } },
      { id: "mb-other", name: "Kendrick Lamar Tribute", score: 62 },
    ],
  };

  it("parses and orders matches by score", () => {
    const parsed = parseArtistSearch(strong, "u");
    expect(parsed[0]!.mbid).toBe("mb-kdot");
    expect(parsed[0]!.sourceUrl).toBe("https://musicbrainz.org/artist/mb-kdot");
  });

  it("returns the clear winner", async () => {
    const fetcher = fixtureFetcher({ "musicbrainz.org": strong }, NOW);
    const { match } = await lookupArtist(fetcher, "Kendrick Lamar");
    expect(match?.mbid).toBe("mb-kdot");
  });

  it("refuses to pick between two near-equal matches", async () => {
    const tie = { artists: [
      { id: "mb-a", name: "Future", score: 96 },
      { id: "mb-b", name: "Future", score: 94 },
    ] };
    const fetcher = fixtureFetcher({ "musicbrainz.org": tie }, NOW);
    const { match, reason } = await lookupArtist(fetcher, "Future");
    expect(match).toBeNull();
    expect(reason).toContain("ambiguous");
  });

  it("refuses a weak best match", async () => {
    const weak = { artists: [{ id: "mb-c", name: "Something Else", score: 41 }] };
    const fetcher = fixtureFetcher({ "musicbrainz.org": weak }, NOW);
    const { match } = await lookupArtist(fetcher, "Nobody");
    expect(match).toBeNull();
  });
});
