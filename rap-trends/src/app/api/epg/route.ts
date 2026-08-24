import { NextResponse } from "next/server";
import { getWeekSchedule, DATA_MODE } from "@/lib/repo";
import { SHOW_BY_ID } from "@/data/shows";
import { endIso } from "@/lib/schedule";
import type { ChannelId } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/epg
 *
 * Electronic programme guide for FAST platforms, connected-TV applications, and
 * affiliates. Returns JSON by default; `?format=xmltv` returns XMLTV, which is
 * what most FAST aggregators actually ingest.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const channelId = (url.searchParams.get("channel") ?? "rt_tv") as ChannelId;
  const items = await getWeekSchedule(channelId);
  const programmes = items.filter((i) => i.kind === "episode" || i.kind === "live_window");

  if (url.searchParams.get("format") === "xmltv") {
    const stamp = (iso: string) => iso.replace(/[-:T]/g, "").slice(0, 14) + " +0000";
    const esc = (s: string) => s.replace(/[<>&'"]/g, (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string));

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<tv generator-info-name="RAP TRENDS OS" source-info-name="RAP TRENDS (${DATA_MODE} data)">
  <channel id="${channelId}">
    <display-name>RAP TRENDS TV</display-name>
  </channel>
${programmes
  .map((p) => {
    const show = p.showId ? SHOW_BY_ID.get(p.showId) : undefined;
    return `  <programme start="${stamp(p.startIso)}" stop="${stamp(endIso(p))}" channel="${channelId}">
    <title lang="en">${esc(p.title)}</title>
    <desc lang="en">${esc(show?.synopsis ?? "RAP TRENDS programming")}</desc>
    <category lang="en">${esc(show?.pillar ?? "Music")}</category>
    <rating system="VCHIP"><value>${esc(show?.rating ?? "TV-14")}</value></rating>
    <subtitles type="teletext" />
  </programme>`;
  })
  .join("\n")}
</tv>`;
    return new NextResponse(body, {
      headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=300" },
    });
  }

  return NextResponse.json({
    dataMode: DATA_MODE,
    channelId,
    generatedIso: new Date().toISOString(),
    programmes: programmes.map((p) => {
      const show = p.showId ? SHOW_BY_ID.get(p.showId) : undefined;
      return {
        id: p.id, startIso: p.startIso, endIso: endIso(p), durationSeconds: p.durationSeconds,
        title: p.title, description: show?.synopsis ?? null, category: show?.pillar ?? "Music",
        rating: show?.rating ?? "TV-14", live: p.kind === "live_window",
        explicitFeed: p.explicitAllowed, captions: true, daypart: p.daypart,
      };
    }),
  });
}
