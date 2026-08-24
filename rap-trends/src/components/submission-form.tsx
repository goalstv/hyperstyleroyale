"use client";

import { useState } from "react";
import type { SubmissionPlan } from "@/lib/types";
import { Badge, Button, Card, Notice } from "./ui";

const TERRITORIES = ["US", "CA", "GB", "NG", "ZA", "WORLDWIDE"];

type Result = {
  ok: boolean;
  reference?: string;
  reviewWindowDays?: number;
  nextSteps?: string[];
  editorialNotice?: string;
  errors?: Record<string, string>;
  error?: string;
};

/**
 * Independent artist submission portal.
 *
 * Three steps, validated client-side and again on the server. Rights fields are
 * first-class rather than an afterthought, because a record without a clean
 * chain of title cannot be scheduled no matter how good it is.
 */
export function SubmissionForm({ plans }: { plans: SubmissionPlan[] }) {
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState<string>(plans.find((p) => p.highlight)?.id ?? plans[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [territories, setTerritories] = useState<string[]>(["US"]);
  const [explicitVersion, setExplicitVersion] = useState(false);
  const [cleanVersion, setCleanVersion] = useState(true);
  const [rightsDocs, setRightsDocs] = useState(false);
  const [nextUp, setNextUp] = useState(true);
  const [attest, setAttest] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const errors = result?.errors ?? {};
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistName: values.artistName ?? "",
          contactEmail: values.contactEmail ?? "",
          trackTitle: values.trackTitle ?? "",
          city: values.city ?? "",
          planId,
          explicitVersion,
          cleanVersion,
          isrc: values.isrc ?? "",
          iswc: values.iswc ?? "",
          upc: values.upc ?? "",
          label: values.label ?? "",
          publisher: values.publisher ?? "",
          pro: values.pro ?? "",
          territories,
          licenseStartIso: values.licenseStartIso ?? "",
          licenseEndIso: values.licenseEndIso ?? "",
          rightsDocsProvided: rightsDocs,
          nextUpApplication: nextUp,
          rightsAttestation: attest,
          notes: values.notes ?? "",
        }),
      });
      const body = (await response.json()) as Result;
      setResult(body);
      if (body.ok) setStep(4);
      else if (body.errors) {
        // Jump back to the step holding the first failing field.
        const keys = Object.keys(body.errors);
        if (keys.some((k) => ["artistName", "contactEmail", "trackTitle", "city"].includes(k))) setStep(2);
        else setStep(3);
      }
    } catch {
      setResult({ ok: false, error: "The submission could not be sent. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const Err = ({ name }: { name: string }) =>
    errors[name] ? (
      <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-blood">
        {errors[name]}
      </p>
    ) : null;

  const inputCls =
    "mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone placeholder:text-silver focus:border-volt";

  if (step === 4 && result?.ok) {
    return (
      <Card className="p-6">
        <Badge tone="good">Submission received</Badge>
        <p className="display mt-3 text-3xl text-bone">Reference {result.reference}</p>
        <p className="mt-2 text-sm text-bone-dim">
          An editor will review within {result.reviewWindowDays} business days.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-bone-dim">
          {result.nextSteps?.map((s) => (
            <li key={s} className="flex gap-2">
              <span aria-hidden className="text-neon">→</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        {result.editorialNotice ? (
          <div className="mt-5">
            <Notice tone="volt" title="Editorial firewall">{result.editorialNotice}</Notice>
          </div>
        ) : null}
        <p className="mt-5 text-xs text-silver">
          Demonstration build — this submission was validated and acknowledged but not stored.
        </p>
        <Button
          tone="outline"
          className="mt-5"
          onClick={() => {
            setResult(null);
            setStep(1);
          }}
        >
          Submit another record
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <ol className="mb-6 flex gap-2" aria-label="Submission steps">
        {["Plan", "Record", "Rights"].map((label, i) => {
          const n = i + 1;
          const state = step === n ? "current" : step > n ? "done" : "todo";
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                onClick={() => setStep(n)}
                aria-current={state === "current" ? "step" : undefined}
                className={`w-full rounded border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${
                  state === "current"
                    ? "border-blood bg-blood/10 text-blood"
                    : state === "done"
                      ? "border-neon/40 text-neon"
                      : "border-ink-4 text-silver"
                }`}
              >
                <span className="num mr-2">{n}</span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>

      {result && !result.ok && result.error ? (
        <div className="mb-4">
          <Notice tone="bad" title="Submission failed">{result.error}</Notice>
        </div>
      ) : null}

      {step === 1 ? (
        <fieldset>
          <legend className="eyebrow mb-3 text-silver">Choose a plan</legend>
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const selected = plan.id === planId;
              return (
                <label
                  key={plan.id}
                  className={`surface cursor-pointer rounded-lg p-5 transition-colors ${
                    selected ? "border-blood ring-1 ring-blood/40" : "hover:border-silver"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span>
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={selected}
                        onChange={() => setPlanId(plan.id)}
                        className="sr-only"
                      />
                      <span className="display block text-2xl text-bone">{plan.name}</span>
                      <span className="num mt-1 block text-lg text-volt-soft">
                        {plan.priceUsd === 0 ? "Free" : `$${plan.priceUsd}`}
                        <span className="ml-1 text-xs text-silver">{plan.cadence}</span>
                      </span>
                    </span>
                    {plan.highlight ? <Badge tone="volt">Most used</Badge> : null}
                  </span>
                  <ul className="mt-4 space-y-1.5 text-sm text-bone-dim">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span aria-hidden className="text-neon">·</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-ink-4 pt-3 text-xs text-amber">{plan.editorialGuarantee}</p>
                </label>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        </fieldset>
      ) : null}

      {step === 2 ? (
        <fieldset className="space-y-4">
          <legend className="eyebrow mb-3 text-silver">The record</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="artistName" className="text-sm text-bone">Artist name *</label>
              <input id="artistName" name="artistName" required value={values.artistName ?? ""} onChange={set("artistName")}
                aria-invalid={!!errors.artistName} aria-describedby={errors.artistName ? "artistName-error" : undefined}
                className={inputCls} placeholder="How your name should appear on air" />
              <Err name="artistName" />
            </div>
            <div>
              <label htmlFor="contactEmail" className="text-sm text-bone">Contact email *</label>
              <input id="contactEmail" name="contactEmail" type="email" required value={values.contactEmail ?? ""} onChange={set("contactEmail")}
                aria-invalid={!!errors.contactEmail} className={inputCls} placeholder="you@example.com" />
              <Err name="contactEmail" />
            </div>
            <div>
              <label htmlFor="trackTitle" className="text-sm text-bone">Track title *</label>
              <input id="trackTitle" name="trackTitle" required value={values.trackTitle ?? ""} onChange={set("trackTitle")}
                aria-invalid={!!errors.trackTitle} className={inputCls} />
              <Err name="trackTitle" />
            </div>
            <div>
              <label htmlFor="city" className="text-sm text-bone">City *</label>
              <input id="city" name="city" required value={values.city ?? ""} onChange={set("city")}
                aria-invalid={!!errors.city} className={inputCls} placeholder="Where you work from" />
              <Err name="city" />
            </div>
          </div>

          <fieldset className="rounded border border-ink-4 p-4">
            <legend className="eyebrow px-1 text-silver">Versions available</legend>
            <p className="mb-3 text-xs text-silver">
              Broadcast and radio-affiliate carriage requires a clean version. Identify at least one.
            </p>
            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm text-bone-dim">
                <input type="checkbox" checked={cleanVersion} onChange={(e) => setCleanVersion(e.target.checked)} className="accent-[#1B57F5]" />
                Clean version
              </label>
              <label className="flex items-center gap-2 text-sm text-bone-dim">
                <input type="checkbox" checked={explicitVersion} onChange={(e) => setExplicitVersion(e.target.checked)} className="accent-[#1B57F5]" />
                Explicit version
              </label>
            </div>
            <Err name="cleanVersion" />
          </fieldset>

          <div>
            <label htmlFor="notes" className="text-sm text-bone">Anything an editor should know</label>
            <textarea id="notes" name="notes" rows={3} value={values.notes ?? ""} onChange={set("notes")} className={inputCls} />
          </div>

          <div className="flex justify-between">
            <Button tone="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Continue to rights</Button>
          </div>
        </fieldset>
      ) : null}

      {step === 3 ? (
        <fieldset className="space-y-4">
          <legend className="eyebrow mb-3 text-silver">Rights, ownership, and territories</legend>
          <Notice tone="warn" title="Why this section is not optional">
            RAP TRENDS cannot broadcast, stream, or syndicate a record without a documented chain of
            title. Incomplete rights information is the single most common reason a good record does
            not get scheduled.
          </Notice>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="isrc" className="text-sm text-bone">ISRC</label>
              <input id="isrc" name="isrc" value={values.isrc ?? ""} onChange={set("isrc")} placeholder="USRC17607839" className={inputCls} />
              <Err name="isrc" />
            </div>
            <div>
              <label htmlFor="iswc" className="text-sm text-bone">ISWC</label>
              <input id="iswc" name="iswc" value={values.iswc ?? ""} onChange={set("iswc")} placeholder="T-123456789-0" className={inputCls} />
              <Err name="iswc" />
            </div>
            <div>
              <label htmlFor="upc" className="text-sm text-bone">UPC</label>
              <input id="upc" name="upc" value={values.upc ?? ""} onChange={set("upc")} placeholder="012345678905" className={inputCls} />
              <Err name="upc" />
            </div>
            <div>
              <label htmlFor="label" className="text-sm text-bone">Label / distributor</label>
              <input id="label" name="label" value={values.label ?? ""} onChange={set("label")} className={inputCls} />
            </div>
            <div>
              <label htmlFor="publisher" className="text-sm text-bone">Publisher</label>
              <input id="publisher" name="publisher" value={values.publisher ?? ""} onChange={set("publisher")} className={inputCls} />
            </div>
            <div>
              <label htmlFor="pro" className="text-sm text-bone">PRO</label>
              <input id="pro" name="pro" value={values.pro ?? ""} onChange={set("pro")} placeholder="ASCAP / BMI / PRS …" className={inputCls} />
            </div>
            <div>
              <label htmlFor="licenseStartIso" className="text-sm text-bone">Licence start</label>
              <input id="licenseStartIso" name="licenseStartIso" type="date" value={values.licenseStartIso ?? ""} onChange={set("licenseStartIso")} className={inputCls} />
            </div>
            <div>
              <label htmlFor="licenseEndIso" className="text-sm text-bone">Licence end</label>
              <input id="licenseEndIso" name="licenseEndIso" type="date" value={values.licenseEndIso ?? ""} onChange={set("licenseEndIso")} className={inputCls} />
            </div>
          </div>

          <fieldset className="rounded border border-ink-4 p-4">
            <legend className="eyebrow px-1 text-silver">Territories granted *</legend>
            <div className="flex flex-wrap gap-4">
              {TERRITORIES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-bone-dim">
                  <input
                    type="checkbox"
                    checked={territories.includes(t)}
                    onChange={(e) =>
                      setTerritories((prev) => (e.target.checked ? [...prev, t] : prev.filter((x) => x !== t)))
                    }
                    className="accent-[#1B57F5]"
                  />
                  {t}
                </label>
              ))}
            </div>
            <Err name="territories" />
          </fieldset>

          <div className="space-y-3 rounded border border-ink-4 p-4">
            <label className="flex items-start gap-2 text-sm text-bone-dim">
              <input type="checkbox" checked={rightsDocs} onChange={(e) => setRightsDocs(e.target.checked)} className="mt-0.5 accent-[#1B57F5]" />
              <span>I have ownership and rights documentation ready to upload (split sheets, licences, releases).</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-bone-dim">
              <input type="checkbox" checked={nextUp} onChange={(e) => setNextUp(e.target.checked)} className="mt-0.5 accent-[#1B57F5]" />
              <span>Apply for NEXT UP consideration.</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-bone-dim">
              <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} aria-invalid={!!errors.rightsAttestation} className="mt-0.5 accent-[#1B57F5]" />
              <span>
                I confirm I control, or am authorized to grant, the rights described above, and that
                this submission does not infringe anyone else&apos;s rights. *
              </span>
            </label>
            <Err name="rightsAttestation" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button tone="outline" onClick={() => setStep(2)}>Back</Button>
            <Button type="submit" tone="live" disabled={submitting}>
              {submitting ? "Sending…" : "Submit record"}
            </Button>
          </div>
        </fieldset>
      ) : null}
    </form>
  );
}
