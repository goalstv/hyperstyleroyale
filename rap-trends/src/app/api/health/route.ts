import { NextResponse } from "next/server";
import { getHealthChecks, DATA_MODE } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/health — system health rollup for monitoring and the OS dashboard. */
export async function GET() {
  const checks = await getHealthChecks();
  const failing = checks.filter((c) => c.status === "fail");
  const warning = checks.filter((c) => c.status === "warn");
  return NextResponse.json(
    {
      status: failing.length > 0 ? "fail" : warning.length > 0 ? "warn" : "ok",
      dataMode: DATA_MODE,
      checkedIso: new Date().toISOString(),
      counts: { ok: checks.length - failing.length - warning.length, warn: warning.length, fail: failing.length },
      checks,
    },
    { status: failing.length > 0 ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
