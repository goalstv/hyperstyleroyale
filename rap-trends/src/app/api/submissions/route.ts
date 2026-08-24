import { NextResponse } from "next/server";
import { submissionSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { DATA_MODE } from "@/lib/repo";

export const dynamic = "force-dynamic";

/**
 * POST /api/submissions
 *
 * Accepts an artist submission. In this build the record is validated, assigned
 * a reference, and returned — it is not persisted, because persistence belongs
 * to the Postgres adapter described in docs/06-technical-architecture.md.
 *
 * What this endpoint deliberately does NOT do: accept a payment that changes
 * editorial treatment. The selected plan changes review speed and reporting
 * detail only, and that promise is enforced upstream in the newsroom, where a
 * submission's plan is not visible to the editors scoring it.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "submissions"), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions from this address. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request body." }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  const data = parsed.data;

  // A record with neither a clean nor an explicit version identified cannot be
  // routed to a feed, so it is rejected at the door rather than in the newsroom.
  if (!data.explicitVersion && !data.cleanVersion) {
    return NextResponse.json(
      { ok: false, errors: { cleanVersion: "Identify at least one version — clean, explicit, or both." } },
      { status: 422 },
    );
  }

  const reference = `RT-${new Date().getUTCFullYear()}-${Math.abs(
    [...`${data.artistName}${data.trackTitle}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7),
  )
    .toString(36)
    .toUpperCase()
    .slice(0, 6)}`;

  const reviewDays = data.planId === "plan_free" ? 14 : data.planId === "plan_pro" ? 5 : 3;

  return NextResponse.json(
    {
      ok: true,
      dataMode: DATA_MODE,
      reference,
      status: "received",
      reviewWindowDays: reviewDays,
      nextSteps: [
        data.rightsDocsProvided
          ? "Rights documentation received and queued for the rights and compliance manager."
          : "Upload ownership and rights documentation — nothing can be scheduled without it.",
        `An editor will review within ${reviewDays} business days.`,
        data.nextUpApplication
          ? "Your NEXT UP application enters the editorial selection queue."
          : "You can apply for NEXT UP at any time from the artist portal.",
      ],
      editorialNotice:
        "Your plan affects review speed and reporting detail only. It has no effect on editorial selection or chart position, and editors scoring your record cannot see which plan you are on.",
      persisted: false,
      persistenceNote:
        "This demonstration build validates and acknowledges submissions without storing them. Connect the Postgres adapter to persist.",
    },
    { status: 201 },
  );
}
