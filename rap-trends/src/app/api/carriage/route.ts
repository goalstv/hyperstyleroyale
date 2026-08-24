import { NextResponse } from "next/server";
import { carriageSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { AFFILIATE_PACKAGES } from "@/data/distribution";

export const dynamic = "force-dynamic";

/**
 * POST /api/carriage
 *
 * Records a carriage enquiry from a station or group. The response is careful
 * about what it promises: an enquiry is an enquiry. Carriage requires a
 * negotiated agreement, and over-the-air carriage additionally requires a
 * partnership with an FCC-licensed station — software cannot deliver either.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "carriage"), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request body." }, { status: 400 });
  }

  const parsed = carriageSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  const pkg = AFFILIATE_PACKAGES.find((p) => p.id === parsed.data.packageId);
  const reference = `RT-CAR-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  return NextResponse.json(
    {
      ok: true,
      reference,
      status: "enquiry_received",
      package: pkg ? { id: pkg.id, name: pkg.name, priceModel: pkg.priceModel, exclusivity: pkg.exclusivity } : null,
      nextSteps: [
        "An affiliate manager will follow up to confirm market, daypart availability, and technical delivery.",
        "Technical specifications and pitch materials are available immediately in the affiliate portal.",
        "Market exclusivity is negotiated per agreement and is not reserved by this enquiry.",
      ],
      disclaimer:
        "This is an enquiry, not an agreement. No carriage, market exclusivity, or programme placement is committed. Over-the-air carriage requires a partnership with an FCC-licensed station; RAP TRENDS does not hold spectrum or a broadcast licence.",
      persisted: false,
    },
    { status: 201 },
  );
}
