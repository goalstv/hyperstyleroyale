"use client";

export default function OsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-blood/40 bg-blood/10 p-8">
      <p className="display text-3xl text-blood">Console error</p>
      <p className="mt-3 max-w-xl text-sm text-bone-dim">
        This section failed to load. Air is unaffected — the console is a control surface, not the
        playout path, and channel origination continues independently of it.
      </p>
      {error.digest ? <p className="num mt-3 text-xs text-silver">Reference {error.digest}</p> : null}
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded border border-blood px-4 py-2 text-sm font-semibold uppercase tracking-wide text-blood hover:bg-blood/15"
      >
        Retry
      </button>
    </div>
  );
}
