/**
 * Data access layer.
 *
 * Every page and API route reads through this module. The demonstration adapter
 * below serves the seeded dataset in `src/data`; swapping to Postgres/Supabase
 * means replacing the function bodies here and nothing else. The signatures are
 * deliberately async so that swap does not ripple into call sites.
 *
 * See docs/06-technical-architecture.md → "Repository boundary".
 */
import { ARTISTS, ARTIST_BY_ID, ARTIST_BY_SLUG, NEXT_UP_ARTISTS } from "@/data/artists";
import { CHART_ENTRIES, NEXT_UP_ENTRIES } from "@/data/chart";
import { CITIES, CITY_BY_ID, CITY_BY_SLUG } from "@/data/cities";
import { ARTICLES, ARTICLE_BY_SLUG, PUBLISHED_ARTICLES } from "@/data/articles";
import { EPISODES, EPISODES_BY_SHOW, SHOWS, SHOW_BY_SLUG } from "@/data/shows";
import { ASSET_BY_ID, MEDIA_ASSETS, RIGHTS_BY_ASSET, RIGHTS_WINDOWS } from "@/data/media";
import { buildDay, buildWeek, nowAndNext } from "@/data/schedule";
import { AFFILIATES, AFFILIATE_PACKAGES, CHANNELS, ENDPOINTS, SYNDICATED_FORMATS } from "@/data/distribution";
import {
  ADVERTISERS, CAMPAIGNS, SPONSOR_OPPORTUNITIES, SUBMISSIONS, SUBMISSION_PLANS,
} from "@/data/monetization";
import { DRIVE_SYNC, HEALTH_CHECKS, TICKER, nowPlaying, radioClock } from "@/data/ops";
import { EDITORIAL_OVERRIDES, INDEX_SOURCES } from "@/data/index-sources";
import { USERS, USER_BY_ID } from "@/data/users";
import { DEFAULT_PROFILE, PROFILES, rankEntries, type RankedEntry } from "./index-engine";
import { nowIso } from "./clock";
import type { ChannelId, ScheduleItem } from "./types";

export const DATA_MODE: "demo" | "live" =
  process.env.RAPTRENDS_DATA_MODE === "live" ? "live" : "demo";

/* ------------------------------------------------------------------ people */
export async function getUsers() { return USERS; }
export async function getUser(id: string) { return USER_BY_ID.get(id); }

/* ----------------------------------------------------------------- artists */
export async function getArtists() { return ARTISTS; }
export async function getArtist(idOrSlug: string) {
  return ARTIST_BY_SLUG.get(idOrSlug) ?? ARTIST_BY_ID.get(idOrSlug);
}
export async function getNextUpArtists() { return NEXT_UP_ARTISTS; }

/* ------------------------------------------------------------------- index */
export async function getIndexSources() { return INDEX_SOURCES; }
export async function getIndexProfiles() { return PROFILES; }

/** The TRENDING 10, scored and ranked at request time. */
export async function getTrending(options: { profileId?: string; regionId?: string } = {}) {
  const profile = PROFILES.find((p) => p.id === options.profileId) ?? DEFAULT_PROFILE;
  return rankEntries(CHART_ENTRIES, {
    profile,
    sources: INDEX_SOURCES,
    nowIso: nowIso(),
    regionId: options.regionId,
    overrides: EDITORIAL_OVERRIDES,
    isEmerging: (entry) => {
      const tier = ARTIST_BY_ID.get(entry.artistId)?.tier;
      return tier === "rising" || tier === "independent";
    },
  });
}

/** NEXT UP candidates, scored on the emerging profile. */
export async function getNextUpChart(): Promise<RankedEntry[]> {
  const profile = PROFILES.find((p) => p.id === "profile_emerging_v2") ?? DEFAULT_PROFILE;
  return rankEntries(NEXT_UP_ENTRIES, {
    profile, sources: INDEX_SOURCES, nowIso: nowIso(),
    overrides: EDITORIAL_OVERRIDES, isEmerging: () => true,
  });
}

export async function getOverrides() { return EDITORIAL_OVERRIDES; }

/* ------------------------------------------------------------------ cities */
export async function getCities() { return CITIES; }
export async function getCity(idOrSlug: string) {
  return CITY_BY_SLUG.get(idOrSlug) ?? CITY_BY_ID.get(idOrSlug);
}

/* --------------------------------------------------------------- editorial */
export async function getArticles() { return ARTICLES; }
export async function getPublishedArticles() { return PUBLISHED_ARTICLES; }
export async function getArticle(slug: string) { return ARTICLE_BY_SLUG.get(slug); }
export async function getArticleById(id: string) { return ARTICLES.find((a) => a.id === id); }

/* ------------------------------------------------------------------- shows */
export async function getShows() { return SHOWS; }
export async function getShow(slug: string) { return SHOW_BY_SLUG.get(slug); }
export async function getEpisodes() { return EPISODES; }
export async function getEpisodesForShow(showId: string) { return EPISODES_BY_SHOW[showId] ?? []; }

/* ------------------------------------------------------------------- media */
export async function getAssets() { return MEDIA_ASSETS; }
export async function getAsset(id: string) { return ASSET_BY_ID.get(id); }
export async function getRightsWindows() { return RIGHTS_WINDOWS; }
export async function getRightsForAsset(assetId: string) { return RIGHTS_BY_ASSET.get(assetId); }
export function assetMap() { return ASSET_BY_ID; }
export function rightsMap() { return RIGHTS_BY_ASSET; }

/* ---------------------------------------------------------------- schedule */
export async function getSchedule(dayOffset = 0, channelId: ChannelId = "rt_tv") {
  return buildDay(dayOffset, channelId);
}
export async function getWeekSchedule(channelId: ChannelId = "rt_tv") {
  return buildWeek(channelId);
}
export async function getNowAndNext(channelId: ChannelId = "rt_tv") {
  const today: ScheduleItem[] = [...buildDay(0, channelId), ...buildDay(1, channelId)];
  return nowAndNext(today, nowIso());
}

/* ------------------------------------------------------------ distribution */
export async function getChannels() { return CHANNELS; }
export async function getEndpoints() { return ENDPOINTS; }
export async function getAffiliatePackages() { return AFFILIATE_PACKAGES; }
export async function getAffiliates() { return AFFILIATES; }
export async function getSyndicatedFormats() { return SYNDICATED_FORMATS; }

/* ------------------------------------------------------------ monetization */
export async function getSponsorOpportunities() { return SPONSOR_OPPORTUNITIES; }
export async function getAdvertisers() { return ADVERTISERS; }
export async function getCampaigns() { return CAMPAIGNS; }
export async function getSubmissionPlans() { return SUBMISSION_PLANS; }
export async function getSubmissions() { return SUBMISSIONS; }

/* -------------------------------------------------------------------- ops */
export async function getDriveSync() { return DRIVE_SYNC; }
export async function getHealthChecks() { return HEALTH_CHECKS; }
export async function getTicker() { return TICKER; }
export async function getRadioClock() { return radioClock(nowIso()); }
export async function getNowPlaying() { return nowPlaying(nowIso()); }
