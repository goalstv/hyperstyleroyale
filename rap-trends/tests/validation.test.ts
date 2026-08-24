import { describe, expect, it } from "vitest";
import { advertisingSchema, carriageSchema, fieldErrors, newsletterSchema, submissionSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

const validSubmission = {
  artistName: "Demo Artist", contactEmail: "artist@example.com", trackTitle: "Demo Record",
  city: "Atlanta", planId: "plan_free" as const, explicitVersion: false, cleanVersion: true,
  isrc: "USRC17607839", iswc: "T-123456789-0", upc: "012345678905",
  territories: ["US"], rightsDocsProvided: true, nextUpApplication: true,
  rightsAttestation: true as const,
};

describe("submission validation", () => {
  it("accepts a complete submission", () => {
    expect(submissionSchema.safeParse(validSubmission).success).toBe(true);
  });

  it("requires a rights attestation", () => {
    const result = submissionSchema.safeParse({ ...validSubmission, rightsAttestation: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).rightsAttestation).toMatch(/control the rights/i);
    }
  });

  it("requires at least one territory", () => {
    const result = submissionSchema.safeParse({ ...validSubmission, territories: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).territories).toMatch(/at least one/i);
  });

  it("rejects a malformed ISRC but allows it to be omitted", () => {
    expect(submissionSchema.safeParse({ ...validSubmission, isrc: "NOPE" }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...validSubmission, isrc: "" }).success).toBe(true);
  });

  it("rejects a malformed UPC", () => {
    expect(submissionSchema.safeParse({ ...validSubmission, upc: "123" }).success).toBe(false);
  });

  it("rejects an invalid contact email", () => {
    const result = submissionSchema.safeParse({ ...validSubmission, contactEmail: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).contactEmail).toMatch(/valid contact email/i);
  });

  it("rejects an unknown plan", () => {
    expect(submissionSchema.safeParse({ ...validSubmission, planId: "plan_gold" }).success).toBe(false);
  });
});

describe("newsletter consent", () => {
  it("accepts explicit consent", () => {
    expect(newsletterSchema.safeParse({ email: "a@b.com", consent: true, interests: ["chart"] }).success).toBe(true);
  });

  it("refuses to subscribe without consent", () => {
    const result = newsletterSchema.safeParse({ email: "a@b.com", consent: false, interests: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).consent).toMatch(/consent is required/i);
  });

  it("rejects an unknown interest rather than silently dropping it", () => {
    expect(newsletterSchema.safeParse({ email: "a@b.com", consent: true, interests: ["everything"] }).success).toBe(false);
  });
});

describe("carriage and advertising enquiries", () => {
  it("accepts a complete carriage enquiry", () => {
    const result = carriageSchema.safeParse({
      station: "Demo Group", market: "Atlanta", kind: "tv", packageId: "pkg_daypart",
      contactName: "Contact", contactEmail: "c@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown carriage package", () => {
    const result = carriageSchema.safeParse({
      station: "Demo", market: "Atlanta", kind: "tv", packageId: "pkg_free",
      contactName: "C", contactEmail: "c@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one advertising interest", () => {
    const result = advertisingSchema.safeParse({
      company: "Brand", contactName: "C", contactEmail: "c@example.com",
      budgetBand: "50k_150k", interest: [], restrictedCategory: "none",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).interest).toMatch(/at least one/i);
  });

  it("accepts a declared restricted category", () => {
    const result = advertisingSchema.safeParse({
      company: "Brand", contactName: "C", contactEmail: "c@example.com",
      budgetBand: "over_500k", interest: ["national"], restrictedCategory: "cannabis",
    });
    expect(result.success).toBe(true);
  });
});

describe("rate limiting on public write endpoints", () => {
  it("allows requests up to the limit, then refuses with a retry hint", () => {
    const key = `test-${Math.floor(Date.now() / 1000)}-a`;
    for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps separate buckets per key", () => {
    const a = `test-${Math.floor(Date.now() / 1000)}-b`;
    const b = `test-${Math.floor(Date.now() / 1000)}-c`;
    rateLimit(a, 1, 60_000);
    expect(rateLimit(a, 1, 60_000).ok).toBe(false);
    expect(rateLimit(b, 1, 60_000).ok).toBe(true);
  });

  it("opens a fresh window once the previous one has elapsed", () => {
    const key = `test-${Math.floor(Date.now() / 1000)}-d`;
    // A zero-length window has always elapsed, so every call starts a new one.
    expect(rateLimit(key, 1, 0).ok).toBe(true);
    expect(rateLimit(key, 1, 0).ok).toBe(true);
  });
});
