import type { Episode, Show } from "@/lib/types";
import { daysAgoIso } from "@/lib/clock";

const demo = { provenance: "demo", provenanceNote: "Demonstration programming." } as const;

/** Eight original franchises. Runtimes are the on-air durations used by playout. */
export const SHOWS: Show[] = [
  {
    ...demo, id: "sh_live", slug: "rap-trends-live", title: "RAP TRENDS LIVE", pillar: "RAP TRENDS LIVE",
    format: "live", runtimeMinutes: 60, cadence: "Weeknights, 7:00 PM ET",
    hosts: ["Anchor — position open", "Analyst — position open"], rating: "TV-14", hasCleanVersion: true,
    artColor: "#D42026",
    synopsis:
      "The network's flagship hour. Breaking music news, chart movement, releases, interviews, and an argument or two — reported, not aggregated.",
  },
  {
    ...demo, id: "sh_trending", slug: "trending-10", title: "TRENDING 10", pillar: "TRENDING 10",
    format: "strip", runtimeMinutes: 30, cadence: "Daily, 6:00 PM ET",
    hosts: ["Host — position open"], rating: "TV-14", hasCleanVersion: true, artColor: "#1B57F5",
    synopsis:
      "The daily countdown, ranked by the RAP TRENDS Index. Every position is shown with its confidence score and the signals behind it.",
  },
  {
    ...demo, id: "sh_nextup", slug: "next-up", title: "NEXT UP", pillar: "NEXT UP",
    format: "weekly", runtimeMinutes: 30, cadence: "Thursdays, 8:00 PM ET",
    hosts: ["Host — position open"], rating: "TV-14", hasCleanVersion: true, artColor: "#00C2A8",
    synopsis:
      "Emerging and independent artists, selected by editorial review against verified performance data. Placement is never for sale.",
  },
  {
    ...demo, id: "sh_bars", slug: "bars", title: "BARS", pillar: "BARS",
    format: "taped", runtimeMinutes: 30, cadence: "Wednesdays and Fridays, 9:00 PM ET",
    hosts: ["Host — position open"], rating: "TV-MA", hasCleanVersion: true, artColor: "#E8E3D9",
    synopsis:
      "Freestyles, cyphers, and long-form conversations about writing. The segment where the craft gets taken seriously.",
  },
  {
    ...demo, id: "sh_business", slug: "the-business", title: "THE BUSINESS", pillar: "THE BUSINESS",
    format: "weekly", runtimeMinutes: 30, cadence: "Tuesdays, 8:00 PM ET",
    hosts: ["Host — position open"], rating: "PG-13", hasCleanVersion: true, artColor: "#C9A227",
    synopsis:
      "Ownership, publishing, distribution, touring economics, and the deals behind the records. Built for artists and the people who work for them.",
  },
  {
    ...demo, id: "sh_city", slug: "city-report", title: "CITY REPORT", pillar: "CITY REPORT",
    format: "strip", runtimeMinutes: 30, cadence: "Weeknights, 6:30 PM ET",
    hosts: ["Rotating bureau correspondents"], rating: "TV-14", hasCleanVersion: true, artColor: "#7B3FE4",
    synopsis:
      "Thirteen bureaus, one rotation. What is actually happening in Atlanta, Detroit, Lagos, and everywhere else the format lives.",
  },
  {
    ...demo, id: "sh_drop", slug: "the-drop", title: "THE DROP", pillar: "THE DROP",
    format: "strip", runtimeMinutes: 30, cadence: "Fridays, 12:00 PM ET",
    hosts: ["Host — position open"], rating: "TV-14", hasCleanVersion: true, artColor: "#F5651B",
    synopsis:
      "New releases, first reactions, and curated listening. Friday's release slate, worked through record by record.",
  },
  {
    ...demo, id: "sh_sessions", slug: "rap-trends-sessions", title: "RAP TRENDS SESSIONS", pillar: "RAP TRENDS SESSIONS",
    format: "taped", runtimeMinutes: 60, cadence: "Saturdays, 10:00 PM ET",
    hosts: ["Produced by RAP TRENDS Studios"], rating: "TV-14", hasCleanVersion: true, artColor: "#0FA3D6",
    synopsis:
      "Original live performances shot for television, cut for radio, and clipped for social. One room, one band, no playback.",
  },
];

export const SHOW_BY_ID = new Map(SHOWS.map((s) => [s.id, s]));
export const SHOW_BY_SLUG = new Map(SHOWS.map((s) => [s.slug, s]));

/** Two catalogued episodes per franchise, used by the VOD library and the EPG. */
export const EPISODES: Episode[] = SHOWS.flatMap((show, si) =>
  [0, 1].map((i) => ({
    ...demo,
    id: `ep_${show.id}_${i + 1}`,
    showId: show.id,
    season: 1,
    number: i + 1,
    title:
      i === 0
        ? `${show.title} — Episode ${101 + si}`
        : `${show.title} — Episode ${102 + si}`,
    synopsis: `${show.synopsis.split(".")[0]}. Demonstration episode record.`,
    durationSeconds: show.runtimeMinutes * 60,
    assetId: `asset_${show.id}_${i + 1}`,
    publishedIso: daysAgoIso(i === 0 ? 8 : 1),
    captions: true,
  })),
);

export const EPISODES_BY_SHOW = EPISODES.reduce<Record<string, Episode[]>>((acc, ep) => {
  (acc[ep.showId] ??= []).push(ep);
  return acc;
}, {});
