import { NextResponse } from "next/server";
import { advertisingSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { CATEGORY_RULES, RESTRICTED_LABELS } from "@/lib/ad-safety";
import type { RestrictedCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/advertising
 *
 * An advertising enquiry. When a restricted category is declared, the response
 * states the rules that will apply *before* anyone spends time on a proposal —
 * cannabis, for example, cannot run on broadcast or MVPD carriage at all,
 * regardless of state legality.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "advertising"), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request body." }, { status: 400 });
  }

  const parsed = advertisingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  const category = parsed.data.restrictedCategory;
  const restrictions =
    category !== "none"
      ? (() => {
          const rule = CATEGORY_RULES[category as RestrictedCategory];
          return {
            category: RESTRICTED_LABELS[category as RestrictedCategory],
            minAudienceAge: rule.minAudienceAge,
            allowedDayparts: rule.allowedDayparts,
            blockedPlatforms: rule.blockedPlatforms,
            note: rule.note,
            complianceReviewRequired: true,
          };
        })()
      : null;

  return NextResponse.json(
    {
      ok: true,
      reference: `RT-ADV-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      status: category === "none" ? "enquiry_received" : "enquiry_received_pending_compliance",
      restrictions,
      nextSteps: [
        "A sponsorship manager will follow up with availability and a proposal.",
        category === "none"
          ? "Standard advertiser-safety classifications apply to all inventory."
          : "Rights and compliance review is required before any restricted-category campaign can be trafficked.",
      ],
      disclaimer:
        "Rates and inventory are indicative. Nothing is reserved until a signed insertion order is in place.",
      persisted: false,
    },
    { status: 201 },
  );
}
