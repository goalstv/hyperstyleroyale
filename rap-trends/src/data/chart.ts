import type { ChartEntry } from "@/lib/types";
import { ARTIST_BY_ID } from "./artists";
import { daysAgoIso } from "@/lib/clock";

/**
 * TRENDING 10 — DEMONSTRATION CHART.
 *
 * Fictional records by fictional artists. Signals are synthetic inputs used to
 * exercise the scoring engine; ranks are produced by the engine at request time,
 * not stored. The `rank`/`previousRank` values below are the previously
 * published positions used for movement arrows.
 */
const demo = {
  provenance: "demo",
  provenanceNote: "Synthetic signals. Not a measurement of any real recording.",
} as const;

function signalsFor(artistId: string, tweak: Partial<Record<string, number>> = {}) {
  const base = { ...(ARTIST_BY_ID.get(artistId)?.signals ?? {}) };
  return { ...base, ...tweak } as ChartEntry["signals"];
}

export const CHART_ENTRIES: ChartEntry[] = [
  {
    ...demo, id: "chart_01", rank: 1, previousRank: 2, weeksOn: 5, peak: 1,
    title: "Bone China", artistId: "art_01", artistName: "Sable Mercer",
    releaseIso: daysAgoIso(33), cityId: "atl", explicit: true,
    signals: signalsFor("art_01"),
  },
  {
    ...demo, id: "chart_02", rank: 2, previousRank: 6, weeksOn: 3, peak: 2,
    title: "Rust Belt Gospel", artistId: "art_02", artistName: "KP Verse",
    releaseIso: daysAgoIso(19), cityId: "det", explicit: true,
    signals: signalsFor("art_02"),
  },
  {
    ...demo, id: "chart_03", rank: 3, previousRank: 3, weeksOn: 7, peak: 1,
    title: "Third Mainland", artistId: "art_03", artistName: "Nia Oduya",
    releaseIso: daysAgoIso(47), cityId: "lag", explicit: false,
    signals: signalsFor("art_03"),
  },
  {
    ...demo, id: "chart_04", rank: 4, previousRank: 1, weeksOn: 9, peak: 1,
    title: "Ivory Hours", artistId: "art_08", artistName: "Ivory Lane",
    releaseIso: daysAgoIso(62), cityId: "la", explicit: false,
    signals: signalsFor("art_08"),
  },
  {
    ...demo, id: "chart_05", rank: 5, previousRank: 4, weeksOn: 6, peak: 3,
    title: "Delancey Nights", artistId: "art_05", artistName: "Lux Armand",
    releaseIso: daysAgoIso(41), cityId: "nyc", explicit: true,
    signals: signalsFor("art_05"),
  },
  {
    ...demo, id: "chart_06", rank: 6, previousRank: 11, weeksOn: 2, peak: 6,
    title: "Tape Deck Sermon", artistId: "art_06", artistName: "Trilla May",
    releaseIso: daysAgoIso(11), cityId: "mem", explicit: true,
    signals: signalsFor("art_06"),
  },
  {
    // Carries an open manipulation flag on purpose — the operator console and the
    // public methodology page both use this entry to show what a flag looks like.
    ...demo, id: "chart_07", rank: 7, previousRank: 5, weeksOn: 4, peak: 5,
    title: "Biscayne Reverb", artistId: "art_15", artistName: "Zeta Royale",
    releaseIso: daysAgoIso(26), cityId: "mia", explicit: true,
    signals: signalsFor("art_15"),
  },
  {
    ...demo, id: "chart_08", rank: 8, previousRank: 8, weeksOn: 12, peak: 4,
    title: "Own Masters", artistId: "art_04", artistName: "Cash Tyrell",
    releaseIso: daysAgoIso(84), cityId: "hou", explicit: false,
    signals: signalsFor("art_04"),
  },
  {
    ...demo, id: "chart_09", rank: 9, previousRank: null, weeksOn: 1, peak: 9,
    title: "Scarborough Blue", artistId: "art_11", artistName: "Amara Veil",
    releaseIso: daysAgoIso(5), cityId: "tor", explicit: false,
    signals: signalsFor("art_11"),
  },
  {
    ...demo, id: "chart_10", rank: 10, previousRank: 7, weeksOn: 8, peak: 7,
    title: "Peachtree Confession", artistId: "art_13", artistName: "Solae Brooks",
    releaseIso: daysAgoIso(55), cityId: "atl", explicit: true,
    signals: signalsFor("art_13"),
  },
];

/** NEXT UP candidates scored on the emerging profile. */
export const NEXT_UP_ENTRIES: ChartEntry[] = [
  {
    ...demo, id: "next_01", rank: 1, previousRank: 2, weeksOn: 3, peak: 1,
    title: "Wicker Park Winter", artistId: "art_17", artistName: "Vega Monroe",
    releaseIso: daysAgoIso(9), cityId: "chi", explicit: false, signals: signalsFor("art_17"),
  },
  {
    ...demo, id: "next_02", rank: 2, previousRank: 1, weeksOn: 4, peak: 1,
    title: "Grand River Hymn", artistId: "art_18", artistName: "North Pierre",
    releaseIso: daysAgoIso(14), cityId: "det", explicit: false, signals: signalsFor("art_18"),
  },
  {
    ...demo, id: "next_03", rank: 3, previousRank: null, weeksOn: 1, peak: 3,
    title: "Braam Nights", artistId: "art_16", artistName: "Obi Strand",
    releaseIso: daysAgoIso(4), cityId: "jnb", explicit: false, signals: signalsFor("art_16"),
  },
  {
    ...demo, id: "next_04", rank: 4, previousRank: 5, weeksOn: 2, peak: 4,
    title: "Claiborne Second Line", artistId: "art_07", artistName: "Dane Castille",
    releaseIso: daysAgoIso(7), cityId: "nola", explicit: true, signals: signalsFor("art_07"),
  },
  {
    ...demo, id: "next_05", rank: 5, previousRank: 3, weeksOn: 5, peak: 2,
    title: "Beale Static", artistId: "art_06", artistName: "Trilla May",
    releaseIso: daysAgoIso(21), cityId: "mem", explicit: true, signals: signalsFor("art_06"),
  },
];
