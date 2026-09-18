import { describe, expect, it } from "vitest";
import { collectBureauEvents, matchCity, type CityMatcher } from "@/lib/city-events";
import type { BandsintownEvent } from "@/lib/ingest/sources/bandsintown";

const NOW = "2026-09-18T00:00:00.000Z";

const MATCHERS: CityMatcher[] = [
  { cityId: "nyc", names: ["New York", "New York City", "Brooklyn"] },
  { cityId: "la", names: ["Los Angeles"] },
  { cityId: "atl", names: ["Atlanta"] },
];

function ev(over: Partial<BandsintownEvent> = {}): BandsintownEvent {
  return {
    id: "e1",
    datetimeIso: "2026-10-01T20:00:00.000Z",
    venueName: "Terminal 5",
    city: "New York",
    region: "NY",
    country: "United States",
    url: "https://bandsintown.test/e1",
    ...over,
  };
}

describe("matchCity", () => {
  it("matches a bureau by name", () => {
    expect(matchCity("New York", MATCHERS)).toBe("nyc");
  });

  it("matches an alternate spelling the upstream uses", () => {
    expect(matchCity("Brooklyn", MATCHERS)).toBe("nyc");
  });

  it("ignores case and punctuation", () => {
    expect(matchCity("  los angeles ", MATCHERS)).toBe("la");
  });

  it("returns null for a market we do not cover", () => {
    expect(matchCity("Reykjavík", MATCHERS)).toBeNull();
  });

  it("returns null when two bureaus both claim a name, rather than guessing", () => {
    const clashing: CityMatcher[] = [
      { cityId: "a", names: ["Springfield"] },
      { cityId: "b", names: ["Springfield"] },
    ];
    expect(matchCity("Springfield", clashing)).toBeNull();
  });
});

describe("collectBureauEvents", () => {
  const names = { art_1: "Kendrick Lamar", art_2: "GloRilla" };

  it("groups events under the right bureau", () => {
    const byCity = collectBureauEvents(
      { art_1: [ev(), ev({ id: "e2", city: "Los Angeles", venueName: "The Novo" })] },
      names,
      { matchers: MATCHERS, nowIso: NOW },
    );
    expect(byCity.nyc).toHaveLength(1);
    expect(byCity.la).toHaveLength(1);
    expect(byCity.nyc![0]!.artistName).toBe("Kendrick Lamar");
  });

  it("drops events in markets with no bureau rather than assigning the nearest", () => {
    const byCity = collectBureauEvents(
      { art_1: [ev({ city: "Reykjavík" })] },
      names,
      { matchers: MATCHERS, nowIso: NOW },
    );
    expect(Object.keys(byCity)).toHaveLength(0);
  });

  it("drops events already in the past", () => {
    const byCity = collectBureauEvents(
      { art_1: [ev({ datetimeIso: "2026-01-01T20:00:00.000Z" })] },
      names,
      { matchers: MATCHERS, nowIso: NOW },
    );
    expect(Object.keys(byCity)).toHaveLength(0);
  });

  it("dedupes a date announced twice", () => {
    const byCity = collectBureauEvents(
      { art_1: [ev({ id: "e1" }), ev({ id: "e1-dup" })] },
      names,
      { matchers: MATCHERS, nowIso: NOW },
    );
    expect(byCity.nyc).toHaveLength(1);
  });

  it("keeps the same date for two different artists", () => {
    const byCity = collectBureauEvents(
      { art_1: [ev()], art_2: [ev({ id: "e9" })] },
      names,
      { matchers: MATCHERS, nowIso: NOW },
    );
    expect(byCity.nyc).toHaveLength(2);
  });

  it("sorts soonest first and caps each bureau", () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      ev({ id: `e${i}`, venueName: `Venue ${i}`, datetimeIso: `2026-1${i < 2 ? 0 : 1}-0${(i % 9) + 1}T20:00:00.000Z` }),
    );
    const byCity = collectBureauEvents({ art_1: many }, names, {
      matchers: MATCHERS,
      nowIso: NOW,
      limitPerCity: 5,
    });
    expect(byCity.nyc).toHaveLength(5);
    const dates = byCity.nyc!.map((e) => e.datetimeIso);
    expect([...dates].sort()).toEqual(dates);
  });

  it("carries the source URL through to every listed event", () => {
    const byCity = collectBureauEvents({ art_1: [ev()] }, names, {
      matchers: MATCHERS,
      nowIso: NOW,
    });
    expect(byCity.nyc![0]!.sourceUrl).toBe("https://bandsintown.test/e1");
    expect(byCity.nyc![0]!.sourceId).toBe("bandsintown");
  });
});
