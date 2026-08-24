import { NextResponse } from "next/server";
import { getIndexSources, DATA_MODE } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/index/sources — the public source register behind the Index. */
export async function GET() {
  const sources = await getIndexSources();
  return NextResponse.json({
    dataMode: DATA_MODE,
    sources: sources.map((s) => ({
      key: s.key, label: s.label, provider: s.provider,
      authorization: s.authorization, status: s.status, weight: s.weight,
      refreshMinutes: s.refreshMinutes, lastSyncIso: s.lastSyncIso ?? null, notes: s.notes,
    })),
  });
}
