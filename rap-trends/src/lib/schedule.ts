import type {
  ChannelId,
  Daypart,
  MediaAsset,
  Platform,
  RightsWindow,
  ScheduleIssue,
  ScheduleItem,
} from "./types";
import { checkEligibility } from "./rights";

/** Network clock. All schedule times are authored in this zone. */
export const NETWORK_TZ = "America/New_York";

export const DAYPARTS: { id: Daypart; label: string; startHour: number; endHour: number }[] = [
  { id: "overnight", label: "Overnight", startHour: 0, endHour: 6 },
  { id: "morning", label: "Morning", startHour: 6, endHour: 10 },
  { id: "midday", label: "Midday", startHour: 10, endHour: 15 },
  { id: "afternoon", label: "Afternoon", startHour: 15, endHour: 19 },
  { id: "primetime", label: "Primetime", startHour: 19, endHour: 23 },
  { id: "late", label: "Late", startHour: 23, endHour: 24 },
];

/** Explicit audio may only air late-night on the linear feeds. */
export const EXPLICIT_ALLOWED_DAYPARTS: Daypart[] = ["late", "overnight"];

export function daypartForHour(hour: number): Daypart {
  const match = DAYPARTS.find((d) => hour >= d.startHour && hour < d.endHour);
  return match?.id ?? "overnight";
}

export function endIso(item: Pick<ScheduleItem, "startIso" | "durationSeconds">): string {
  return new Date(Date.parse(item.startIso) + item.durationSeconds * 1000).toISOString();
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export interface ValidateOptions {
  channelId: ChannelId;
  items: ScheduleItem[];
  assets?: Map<string, MediaAsset>;
  rights?: Map<string, RightsWindow>;
  /** Destination class the channel originates to, for the rights check. */
  platform?: Platform;
  territory?: string;
  /** Tolerated gap before it is reported, in seconds. */
  gapToleranceSeconds?: number;
}

/**
 * Validate one channel's schedule.
 *
 * Ordering, gaps, and overlaps are hard errors — dead air and double-booking
 * both take a channel off the air. Rights and caption problems are hard errors
 * too, because they are the ones that end in a takedown notice.
 */
export function validateSchedule(options: ValidateOptions): ScheduleIssue[] {
  const {
    channelId,
    assets,
    rights,
    platform = "fast",
    territory = "US",
    gapToleranceSeconds = 0,
  } = options;

  const items = [...options.items].sort((a, b) => Date.parse(a.startIso) - Date.parse(b.startIso));
  const issues: ScheduleIssue[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemEnd = Date.parse(endIso(item));

    if (i < items.length - 1) {
      const next = items[i + 1];
      const nextStart = Date.parse(next.startIso);
      const deltaSeconds = (nextStart - itemEnd) / 1000;

      if (deltaSeconds < 0) {
        issues.push({
          severity: "error",
          code: "overlap",
          channelId,
          itemId: next.id,
          startIso: next.startIso,
          message: `"${next.title}" starts ${Math.abs(deltaSeconds)}s before "${item.title}" ends.`,
        });
      } else if (deltaSeconds > gapToleranceSeconds) {
        issues.push({
          severity: "error",
          code: "gap",
          channelId,
          itemId: item.id,
          startIso: endIso(item),
          message: `${Math.round(deltaSeconds)}s of dead air after "${item.title}". Insert filler or extend the break.`,
        });
      }
    }

    if (!item.approved) {
      issues.push({
        severity: "warning",
        code: "unapproved",
        channelId,
        itemId: item.id,
        startIso: item.startIso,
        message: `"${item.title}" has not been approved by the programming director.`,
      });
    }

    const hour = new Date(item.startIso).getUTCHours();
    if (item.explicitAllowed && !EXPLICIT_ALLOWED_DAYPARTS.includes(item.daypart)) {
      issues.push({
        severity: "error",
        code: "explicit_restriction",
        channelId,
        itemId: item.id,
        startIso: item.startIso,
        message: `"${item.title}" is flagged explicit but is scheduled in the ${item.daypart} daypart (hour ${hour}). Explicit audio is cleared for late and overnight only.`,
      });
    }

    if (item.kind === "episode" && !item.assetId) {
      issues.push({
        severity: "error",
        code: "missing_asset",
        channelId,
        itemId: item.id,
        startIso: item.startIso,
        message: `"${item.title}" has no media asset attached and cannot play out.`,
      });
      continue;
    }

    if (item.assetId && assets) {
      const asset = assets.get(item.assetId);
      if (!asset) {
        issues.push({
          severity: "error",
          code: "missing_asset",
          channelId,
          itemId: item.id,
          startIso: item.startIso,
          message: `Asset ${item.assetId} referenced by "${item.title}" is not in the media library.`,
        });
        continue;
      }
      if (rights) {
        const result = checkEligibility({
          asset,
          window: rights.get(asset.id),
          platform,
          territory,
          atIso: item.startIso,
        });
        for (const blocker of result.blockers) {
          issues.push({
            severity: "error",
            code: blocker.toLowerCase().includes("caption") ? "missing_captions" : "rights_window",
            channelId,
            itemId: item.id,
            startIso: item.startIso,
            message: `"${item.title}": ${blocker}`,
          });
        }
        for (const warning of result.warnings) {
          issues.push({
            severity: "warning",
            code: "rights_window",
            channelId,
            itemId: item.id,
            startIso: item.startIso,
            message: `"${item.title}": ${warning}`,
          });
        }
      }
    }
  }

  return issues;
}

/** Total scheduled seconds, used by the calendar's automatic duration readout. */
export function totalDuration(items: ScheduleItem[]): number {
  return items.reduce((sum, i) => sum + i.durationSeconds, 0);
}

/** Coverage of a 24-hour day, as a fraction. A linear channel must reach 1. */
export function dayCoverage(items: ScheduleItem[]): number {
  return Math.min(1, totalDuration(items) / 86_400);
}
