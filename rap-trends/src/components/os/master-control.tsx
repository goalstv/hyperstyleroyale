"use client";

import { useState } from "react";
import { Badge, Card, Notice } from "@/components/ui";

/**
 * Master control.
 *
 * Graphics, branding, and the emergency path. The emergency override is
 * deliberately two-step and states what it would do to every downstream feed
 * before it fires — an operator should never trip it by reflex.
 */
export function MasterControl({ canControl, currentTitle }: { canControl: boolean; currentTitle: string }) {
  const [graphics, setGraphics] = useState({ bug: true, ticker: true, lowerThird: false, nowNext: true });
  const [armed, setArmed] = useState(false);
  const [fired, setFired] = useState<string | null>(null);

  const toggle = (key: keyof typeof graphics) =>
    setGraphics((g) => ({ ...g, [key]: !g[key] }));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-silver">Master control</p>
        {canControl ? <Badge tone="live">Live control</Badge> : <Badge>Read only</Badge>}
      </div>

      <p className="eyebrow mb-2 mt-4 text-silver">On-air graphics</p>
      <div className="flex flex-wrap gap-2">
        {([
          ["bug", "Channel bug"],
          ["ticker", "Ticker"],
          ["lowerThird", "Lower third"],
          ["nowNext", "Now / Next"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            disabled={!canControl}
            onClick={() => toggle(key)}
            aria-pressed={graphics[key]}
            className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 ${
              graphics[key] ? "border-neon/50 bg-neon/12 text-neon" : "border-ink-4 text-bone-dim hover:border-silver"
            }`}
          >
            {label} {graphics[key] ? "on" : "off"}
          </button>
        ))}
      </div>

      <p className="eyebrow mb-2 mt-5 text-silver">Feed actions</p>
      <div className="flex flex-wrap gap-2">
        {["Switch to live", "Return to playout", "Insert promo", "Roll filler block"].map((action) => (
          <button
            key={action}
            type="button"
            disabled={!canControl}
            onClick={() => setFired(`${action} — queued against "${currentTitle}". Demonstration build: no playout command was sent.`)}
            className="rounded border border-ink-4 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-bone transition-colors hover:border-silver disabled:opacity-40"
          >
            {action}
          </button>
        ))}
      </div>

      {fired ? (
        <p className="mt-3 rounded border border-volt/40 bg-volt/8 p-2.5 text-xs text-bone-dim">{fired}</p>
      ) : null}

      <div className="mt-6 rounded border border-blood/40 bg-blood/8 p-4">
        <p className="eyebrow text-blood">Emergency broadcast override</p>
        <p className="mt-2 text-sm text-bone-dim">
          Cuts every RAP TRENDS TV feed variant to the emergency slate, holds the schedule in place,
          and notifies distribution partners. Affiliates retain their own override and EAS
          capability independently of this control.
        </p>
        {!armed ? (
          <button
            type="button"
            disabled={!canControl}
            onClick={() => setArmed(true)}
            className="mt-3 rounded border border-blood px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blood transition-colors hover:bg-blood/15 disabled:opacity-40"
          >
            Arm override
          </button>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFired("Emergency override would cut all RAP TRENDS TV variants to slate and notify partners. Demonstration build: nothing was sent.");
                setArmed(false);
              }}
              className="rounded bg-blood px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white"
            >
              Confirm — cut to slate
            </button>
            <button
              type="button"
              onClick={() => setArmed(false)}
              className="rounded border border-ink-4 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-bone-dim"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {!canControl ? (
        <div className="mt-4">
          <Notice tone="warn" title="Monitor only">
            Your role can watch the channel but cannot touch air. Master-control actions require the
            master-control operator or network administrator role.
          </Notice>
        </div>
      ) : null}
    </Card>
  );
}
