"use client";

import { useState } from "react";
import { Button, Badge } from "./ui";

const INTERESTS = [
  { value: "chart", label: "The daily chart" },
  { value: "news", label: "Breaking news" },
  { value: "next_up", label: "NEXT UP discoveries" },
  { value: "business", label: "The music business" },
  { value: "events", label: "Live events" },
];

/** Double opt-in, unbundled consent, no pre-checked boxes. */
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; message?: string }>({ status: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, interests }),
      });
      const body = await response.json();
      if (body.ok) setState({ status: "done", message: body.message });
      else setState({ status: "error", message: body.errors?.email ?? body.errors?.consent ?? body.error ?? "Could not subscribe." });
    } catch {
      setState({ status: "error", message: "Could not reach the server." });
    }
  }

  if (state.status === "done") {
    return (
      <div className="rounded-lg border border-neon/35 bg-neon/8 p-4">
        <Badge tone="good">Almost there</Badge>
        <p className="mt-2 text-sm text-bone-dim">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div>
        <label htmlFor="newsletter-email" className="text-sm text-bone">Email address</label>
        <input
          id="newsletter-email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          className="mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone placeholder:text-silver focus:border-volt"
        />
      </div>

      {compact ? null : (
        <fieldset>
          <legend className="eyebrow mb-2 text-silver">What should we send you?</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {INTERESTS.map((i) => (
              <label key={i.value} className="flex items-center gap-2 text-sm text-bone-dim">
                <input
                  type="checkbox"
                  checked={interests.includes(i.value)}
                  onChange={(e) =>
                    setInterests((prev) => (e.target.checked ? [...prev, i.value] : prev.filter((x) => x !== i.value)))
                  }
                  className="accent-[#1B57F5]"
                />
                {i.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex items-start gap-2 text-sm text-bone-dim">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#1B57F5]" />
        <span>
          Yes, email me. I can withdraw consent from any message, and RAP TRENDS will not sell or
          share my address.
        </span>
      </label>

      {state.status === "error" ? <p role="alert" className="text-xs text-blood">{state.message}</p> : null}

      <Button type="submit" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Sending…" : "Subscribe"}
      </Button>
    </form>
  );
}
