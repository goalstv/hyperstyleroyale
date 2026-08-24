import { z } from "zod";

/**
 * Request validation.
 *
 * Every write endpoint validates here before touching anything. Schemas are
 * shared with the client forms so the same rules produce the same messages on
 * both sides.
 */

export const submissionSchema = z.object({
  artistName: z.string().trim().min(1, "Artist name is required").max(120),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  trackTitle: z.string().trim().min(1, "Track title is required").max(160),
  city: z.string().trim().min(1, "City is required").max(80),
  planId: z.enum(["plan_free", "plan_pro", "plan_enterprise"]),
  explicitVersion: z.boolean(),
  cleanVersion: z.boolean(),
  isrc: z.string().trim().regex(/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/, "ISRC must look like CCXXXYYNNNNN").optional().or(z.literal("")),
  iswc: z.string().trim().regex(/^T-?\d{9}-?\d$/, "ISWC must look like T-123456789-0").optional().or(z.literal("")),
  upc: z.string().trim().regex(/^\d{12,14}$/, "UPC must be 12–14 digits").optional().or(z.literal("")),
  label: z.string().trim().max(120).optional(),
  publisher: z.string().trim().max(120).optional(),
  pro: z.string().trim().max(80).optional(),
  territories: z.array(z.string().trim().min(2)).min(1, "Select at least one territory"),
  licenseStartIso: z.string().trim().optional(),
  licenseEndIso: z.string().trim().optional(),
  rightsDocsProvided: z.boolean(),
  nextUpApplication: z.boolean(),
  /** The submitter must affirm they control the rights they are granting. */
  rightsAttestation: z.literal(true, {
    errorMap: () => ({ message: "You must confirm you control the rights you are granting" }),
  }),
  notes: z.string().trim().max(2000).optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  // Explicit, unbundled consent — never pre-checked, never implied.
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required before we can email you" }),
  }),
  interests: z.array(z.enum(["chart", "news", "next_up", "business", "events"])).default([]),
});

export const carriageSchema = z.object({
  station: z.string().trim().min(1, "Station or group name is required").max(160),
  market: z.string().trim().min(1, "Market is required").max(120),
  kind: z.enum(["tv", "radio"]),
  packageId: z.enum(["pkg_full", "pkg_daypart", "pkg_syndication"]),
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  facilityId: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const advertisingSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(160),
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  budgetBand: z.enum(["under_50k", "50k_150k", "150k_500k", "over_500k"]),
  interest: z.array(z.string()).min(1, "Select at least one opportunity"),
  restrictedCategory: z.enum(["none", "alcohol", "cannabis", "gambling", "political", "pharma"]),
  notes: z.string().trim().max(2000).optional(),
});

/** Flatten a ZodError into a field → message map the forms can render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
