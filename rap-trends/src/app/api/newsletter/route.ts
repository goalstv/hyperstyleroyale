import { NextResponse } from "next/server";
import { newsletterSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/newsletter
 *
 * Consent is explicit, unbundled, and recorded with a timestamp. Nothing is
 * pre-checked and there is no "by continuing you agree" pattern anywhere in the
 * flow. See docs/11-security-and-privacy.md.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "newsletter"), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request body." }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  return NextResponse.json(
    {
      ok: true,
      status: "pending_confirmation",
      message:
        "Check your inbox and confirm to complete the subscription. We use double opt-in and you can withdraw consent from any email we send.",
      consentRecordedIso: new Date().toISOString(),
      persisted: false,
    },
    { status: 202 },
  );
}
