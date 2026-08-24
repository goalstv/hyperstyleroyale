import { NextResponse } from "next/server";
import { getSchedule, DATA_MODE } from "@/lib/repo";
import { validateSchedule } from "@/lib/schedule";
import { assetMap, rightsMap } from "@/lib/repo";
import type { ChannelId } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/schedule — one day of playout, with its validation report. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const dayOffset = Math.max(0, Math.min(6, Number(url.searchParams.get("day") ?? 0) || 0));
  const channelId = (url.searchParams.get("channel") ?? "rt_tv") as ChannelId;

  const items = await getSchedule(dayOffset, channelId);
  const issues = validateSchedule({
    channelId, items, assets: assetMap(), rights: rightsMap(), platform: "fast", territory: "US",
  });

  return NextResponse.json({
    dataMode: DATA_MODE,
    channelId,
    dayOffset,
    totalSeconds: items.reduce((s, i) => s + i.durationSeconds, 0),
    items,
    issues,
  });
}
