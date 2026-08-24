import type { ChannelId, ScheduleItem, Show } from "@/lib/types";
import { EPISODES_BY_SHOW, SHOWS, SHOW_BY_ID } from "./shows";
import { daypartForHour } from "@/lib/schedule";
import { startOfNetworkDay } from "@/lib/clock";

/**
 * Sample programming schedule.
 *
 * A full week of RAP TRENDS TV generated from a daypart grid. The grid is the
 * same structure the programming director edits in RAP TRENDS OS; here it is
 * expressed as data so the public schedule, the EPG endpoint, and the operator
 * calendar all read from one source.
 *
 * Every hour is built as: programme + commercial break + promo + commercial
 * break, summing to exactly 30 or 60 minutes so the channel never drifts.
 */

/** Half-hour slot grid. Each tuple is [showId, halfHourSlots]. Must sum to 48. */
type Slot = [showId: string, halfHours: number];

const WEEKDAY_BASE: Slot[] = [
  ["sh_bars", 4],        // 00:00 — late-night BARS, explicit feed permitted
  ["sh_sessions", 8],    // 02:00 — SESSIONS overnight block
  ["sh_trending", 6],    // 06:00 — TRENDING 10 morning repeats
  ["sh_city", 6],        // 09:00 — CITY REPORT rotation
  ["sh_drop", 2],        // 12:00 — THE DROP
  ["sh_business", 6],    // 13:00 — THE BUSINESS block
  ["sh_nextup", 4],      // 16:00 — NEXT UP block
  ["sh_trending", 1],    // 18:00 — countdown
  ["sh_city", 1],        // 18:30 — city report
  ["sh_live", 2],        // 19:00 — FLAGSHIP, live
  ["__feature__", 2],    // 20:00 — nightly feature, varies by day
  ["sh_bars", 2],        // 21:00 — BARS, clean version in primetime
  ["sh_sessions", 2],    // 22:00 — SESSIONS
  ["sh_trending", 2],    // 23:00 — countdown replay
];

/** The 20:00 ET feature rotates through the week. */
const NIGHTLY_FEATURE: Record<number, string> = {
  0: "sh_sessions",  // Sunday
  1: "sh_city",      // Monday
  2: "sh_business",  // Tuesday
  3: "sh_bars",      // Wednesday
  4: "sh_nextup",    // Thursday
  5: "sh_drop",      // Friday
  6: "sh_sessions",  // Saturday
};

const WEEKEND_BASE: Slot[] = [
  ["sh_bars", 4],
  ["sh_sessions", 10],
  ["sh_trending", 4],
  ["sh_nextup", 6],
  ["sh_city", 6],
  ["sh_business", 4],
  ["sh_drop", 4],
  ["__feature__", 2],
  ["sh_sessions", 4],
  ["sh_trending", 4],
];

/** Break structure inside a slot, in seconds. Programme first, then inventory. */
const HALF_HOUR_BLOCK = { programme: 1530, break1: 150, promo: 60, break2: 60 };
const HOUR_BLOCK = { programme: 3120, break1: 240, promo: 60, break2: 180 };

let counter = 0;
function nextId(prefix: string) {
  counter += 1;
  return `${prefix}_${String(counter).padStart(5, "0")}`;
}

function buildBlock(
  channelId: ChannelId,
  show: Show,
  cursor: Date,
  halfHours: number,
  dayOffset: number,
  slotIndex: number,
): { items: ScheduleItem[]; next: Date } {
  const items: ScheduleItem[] = [];
  const hourly = halfHours >= 2 && show.runtimeMinutes >= 60;
  const perBlock = hourly ? 2 : 1;
  const blocks = Math.floor(halfHours / perBlock);
  const shape = hourly ? HOUR_BLOCK : HALF_HOUR_BLOCK;

  const episodes = EPISODES_BY_SHOW[show.id] ?? [];

  for (let b = 0; b < blocks; b++) {
    const episode = episodes[(dayOffset + slotIndex + b) % Math.max(1, episodes.length)];
    const hour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" })
        .format(cursor),
    ) % 24;
    const daypart = daypartForHour(hour);
    const live = show.format === "live" && daypart === "primetime";
    // Explicit audio only rides the feed in the dayparts it is cleared for.
    const explicitAllowed = show.rating === "TV-MA" && (daypart === "late" || daypart === "overnight");

    items.push({
      id: nextId("sched"),
      channelId,
      startIso: cursor.toISOString(),
      durationSeconds: shape.programme,
      kind: live ? "live_window" : "episode",
      title: live ? `${show.title} (LIVE)` : episode?.title ?? show.title,
      showId: show.id,
      episodeId: episode?.id,
      assetId: episode?.assetId,
      daypart,
      explicitAllowed,
      approved: true,
    });
    cursor = new Date(cursor.getTime() + shape.programme * 1000);

    items.push({
      id: nextId("sched"), channelId, startIso: cursor.toISOString(),
      durationSeconds: shape.break1, kind: "commercial_break",
      title: "Commercial break — national + local avail", daypart, explicitAllowed: false, approved: true,
    });
    cursor = new Date(cursor.getTime() + shape.break1 * 1000);

    items.push({
      id: nextId("sched"), channelId, startIso: cursor.toISOString(),
      durationSeconds: shape.promo, kind: "promo", title: "NEXT UP — Thursday promo",
      assetId: "asset_promo_01", daypart, explicitAllowed: false, approved: true,
    });
    cursor = new Date(cursor.getTime() + shape.promo * 1000);

    items.push({
      id: nextId("sched"), channelId, startIso: cursor.toISOString(),
      durationSeconds: shape.break2, kind: "commercial_break",
      title: "Commercial break — national", daypart, explicitAllowed: false, approved: true,
    });
    cursor = new Date(cursor.getTime() + shape.break2 * 1000);
  }

  return { items, next: cursor };
}

/** Build one day of RAP TRENDS TV. `dayOffset` is relative to today. */
export function buildDay(dayOffset: number, channelId: ChannelId = "rt_tv"): ScheduleItem[] {
  const start = startOfNetworkDay(dayOffset);
  const weekday = start.getUTCDay();
  const base = weekday === 0 || weekday === 6 ? WEEKEND_BASE : WEEKDAY_BASE;

  let cursor = new Date(start);
  const items: ScheduleItem[] = [];

  base.forEach(([showId, halfHours], slotIndex) => {
    const resolved = showId === "__feature__" ? NIGHTLY_FEATURE[weekday] : showId;
    const show = SHOW_BY_ID.get(resolved) ?? SHOWS[0];
    const built = buildBlock(channelId, show, cursor, halfHours, dayOffset, slotIndex);
    items.push(...built.items);
    cursor = built.next;
  });

  return items;
}

/** Seven days of schedule, today forward. */
export function buildWeek(channelId: ChannelId = "rt_tv"): ScheduleItem[] {
  counter = 0;
  return Array.from({ length: 7 }, (_, i) => buildDay(i, channelId)).flat();
}

/** What is on the channel at a given instant, and what follows. */
export function nowAndNext(items: ScheduleItem[], atIso: string) {
  const at = Date.parse(atIso);
  const programmes = items.filter((i) => i.kind === "episode" || i.kind === "live_window");
  const current =
    programmes.find(
      (i) => Date.parse(i.startIso) <= at && at < Date.parse(i.startIso) + i.durationSeconds * 1000,
    ) ??
    // Between programmes the viewer is in a break; show the block they are inside.
    [...programmes].reverse().find((i) => Date.parse(i.startIso) <= at) ??
    programmes[0];

  const upcoming = programmes
    .filter((i) => Date.parse(i.startIso) > at)
    .sort((a, b) => Date.parse(a.startIso) - Date.parse(b.startIso));

  return { current, next: upcoming.slice(0, 6) };
}
