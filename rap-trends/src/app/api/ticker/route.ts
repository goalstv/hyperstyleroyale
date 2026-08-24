import { NextResponse } from "next/server";
import { getTicker, DATA_MODE } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/ticker — the real-time strip shown across the network's surfaces. */
export async function GET() {
  const items = await getTicker();
  return NextResponse.json(
    { dataMode: DATA_MODE, generatedIso: new Date().toISOString(), items },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } },
  );
}
