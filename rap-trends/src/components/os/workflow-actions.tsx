"use client";

import { useState } from "react";

/**
 * Workflow transition control.
 *
 * A blocked transition is shown, not hidden, with the reason it is blocked —
 * "fact check must be cleared before approval" is more useful than a missing
 * button. Selecting an allowed transition previews what will happen; committing
 * it requires the persistence layer.
 */
export function WorkflowActions({
  current, options,
}: {
  current: string;
  options: { state: string; label: string; allowed: boolean; reason?: string }[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const allowed = options.filter((o) => o.allowed);
  const blocked = options.filter((o) => !o.allowed);

  return (
    <div>
      <p className="text-sm text-bone-dim">
        Currently <span className="font-semibold text-bone">{current}</span>.
      </p>

      {allowed.length > 0 ? (
        <>
          <p className="eyebrow mb-2 mt-4 text-silver">You can move this story to</p>
          <div className="flex flex-wrap gap-2">
            {allowed.map((o) => (
              <button
                key={o.state}
                type="button"
                onClick={() => setSelected(o.state === selected ? null : o.state)}
                aria-pressed={selected === o.state}
                className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  selected === o.state
                    ? "border-neon bg-neon/15 text-neon"
                    : "border-ink-4 text-bone hover:border-silver"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 rounded border border-ink-4 p-3 text-sm text-silver">
          Your role cannot move this story from its current state.
        </p>
      )}

      {selected ? (
        <div className="mt-4 rounded border border-neon/40 bg-neon/8 p-3">
          <p className="text-sm text-bone">
            Ready to move to <strong>{options.find((o) => o.state === selected)?.label}</strong>.
          </p>
          <p className="mt-1 text-xs text-bone-dim">
            The transition, your name, and the timestamp would be written to the story&apos;s
            append-only history. Demonstration build — no state is persisted here.
          </p>
        </div>
      ) : null}

      {blocked.length > 0 ? (
        <>
          <p className="eyebrow mb-2 mt-5 text-silver">Blocked, and why</p>
          <ul className="space-y-1.5">
            {blocked.map((o) => (
              <li key={o.state} className="flex flex-wrap gap-x-2 text-xs">
                <span className="font-semibold uppercase tracking-wide text-silver">{o.label}</span>
                <span className="text-bone-dim">— {o.reason}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
