"use client";

import { useState } from "react";
import { Button, Card, Notice, Badge } from "./ui";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "select" | "checkboxes";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
};

type Result = {
  ok: boolean;
  reference?: string;
  status?: string;
  nextSteps?: string[];
  disclaimer?: string;
  restrictions?: {
    category: string; minAudienceAge: number; allowedDayparts: string[];
    blockedPlatforms: string[]; note: string;
  } | null;
  package?: { name: string; priceModel: string; exclusivity: string } | null;
  errors?: Record<string, string>;
  error?: string;
};

/**
 * Shared enquiry form used by the carriage and advertising flows. Both post to
 * their own validated endpoint and render whatever compliance information the
 * server sends back — the rules are stated before a conversation starts, not
 * after a proposal has been written.
 */
export function EnquiryForm({
  endpoint, fields, submitLabel, arrayFields = [],
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  arrayFields?: string[];
}) {
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const errors = result?.errors ?? {};
  const inputCls =
    "mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone placeholder:text-silver focus:border-volt";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const payload: Record<string, unknown> = { ...values };
    for (const key of arrayFields) payload[key] = (values[key] as string[]) ?? [];
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setResult((await response.json()) as Result);
    } catch {
      setResult({ ok: false, error: "The enquiry could not be sent. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <Card className="p-6">
        <Badge tone="good">Enquiry received</Badge>
        <p className="display mt-3 text-3xl text-bone">Reference {result.reference}</p>
        {result.package ? (
          <p className="mt-2 text-sm text-bone-dim">
            {result.package.name} — {result.package.priceModel}
          </p>
        ) : null}
        <ul className="mt-5 space-y-2 text-sm text-bone-dim">
          {result.nextSteps?.map((s) => (
            <li key={s} className="flex gap-2">
              <span aria-hidden className="text-neon">→</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        {result.restrictions ? (
          <div className="mt-5">
            <Notice tone="warn" title={`${result.restrictions.category} — rules that will apply`}>
              <ul className="space-y-1">
                <li>· Minimum audience age: {result.restrictions.minAudienceAge}+</li>
                <li>· Permitted dayparts: {result.restrictions.allowedDayparts.join(", ")}</li>
                {result.restrictions.blockedPlatforms.length > 0 ? (
                  <li>· Not permitted on: {result.restrictions.blockedPlatforms.join(", ").toUpperCase()}</li>
                ) : null}
                <li>· {result.restrictions.note}</li>
              </ul>
            </Notice>
          </div>
        ) : null}
        {result.disclaimer ? <p className="mt-5 text-xs text-silver">{result.disclaimer}</p> : null}
        <Button tone="outline" className="mt-5" onClick={() => setResult(null)}>Send another enquiry</Button>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {result?.error ? <Notice tone="bad" title="Could not send">{result.error}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const err = errors[f.name];
          const wide = f.type === "textarea" || f.type === "checkboxes";
          return (
            <div key={f.name} className={wide ? "sm:col-span-2" : undefined}>
              {f.type === "checkboxes" ? (
                <fieldset className="rounded border border-ink-4 p-4">
                  <legend className="eyebrow px-1 text-silver">{f.label}{f.required ? " *" : ""}</legend>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {f.options?.map((o) => {
                      const list = (values[f.name] as string[]) ?? [];
                      return (
                        <label key={o.value} className="flex items-center gap-2 text-sm text-bone-dim">
                          <input
                            type="checkbox"
                            checked={list.includes(o.value)}
                            onChange={(e) =>
                              setValues((v) => ({
                                ...v,
                                [f.name]: e.target.checked
                                  ? [...list, o.value]
                                  : list.filter((x) => x !== o.value),
                              }))
                            }
                            className="accent-[#1B57F5]"
                          />
                          {o.label}
                        </label>
                      );
                    })}
                  </div>
                  {err ? <p role="alert" className="mt-2 text-xs text-blood">{err}</p> : null}
                </fieldset>
              ) : (
                <>
                  <label htmlFor={f.name} className="text-sm text-bone">
                    {f.label}{f.required ? " *" : ""}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      id={f.name} name={f.name} rows={4} className={inputCls}
                      value={(values[f.name] as string) ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    />
                  ) : f.type === "select" ? (
                    <select
                      id={f.name} name={f.name} className={inputCls}
                      value={(values[f.name] as string) ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    >
                      <option value="">Select…</option>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      id={f.name} name={f.name} type={f.type ?? "text"} placeholder={f.placeholder}
                      className={inputCls} aria-invalid={!!err}
                      value={(values[f.name] as string) ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    />
                  )}
                  {f.help ? <p className="mt-1 text-xs text-silver">{f.help}</p> : null}
                  {err ? <p role="alert" className="mt-1 text-xs text-blood">{err}</p> : null}
                </>
              )}
            </div>
          );
        })}
      </div>
      <Button type="submit" tone="live" disabled={submitting}>
        {submitting ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
