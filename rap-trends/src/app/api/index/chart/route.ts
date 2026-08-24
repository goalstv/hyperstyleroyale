import { NextResponse } from "next/server";
import { getTrending } from "@/lib/repo";
import { DATA_MODE } from "@/lib/repo";
import { isPublishable } from "@/lib/index-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/index/chart
 *
 * The TRENDING 10, scored at request time. `dataMode` is always present so a
 * consumer can never mistake demonstration data for verified measurement.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const profileId = url.searchParams.get("profile") ?? undefined;
  const regionId = url.searchParams.get("region") ?? undefined;
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 10) || 10));

  const entries = await getTrending({ profileId, regionId });

  return NextResponse.json(
    {
      dataMode: DATA_MODE,
      generatedIso: new Date().toISOString(),
      profileId: entries[0]?.score.profileId ?? profileId ?? null,
      methodology: "/trending/methodology",
      entries: entries.slice(0, limit).map((e) => ({
        rank: e.rank,
        previousRank: e.previousRank,
        peak: e.peak,
        weeksOn: e.weeksOn,
        title: e.title,
        artist: e.artistName,
        artistId: e.artistId,
        explicit: e.explicit,
        releaseIso: e.releaseIso,
        score: e.score.score,
        confidence: e.score.confidence,
        flags: e.score.flags,
        editorialDelta: e.score.editorialDelta,
        publishable: isPublishable(e.score),
        provenance: e.provenance,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
