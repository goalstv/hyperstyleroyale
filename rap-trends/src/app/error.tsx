"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Structured logging: the digest is the only safe correlator to surface.
    console.error("[rap-trends] render error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow text-blood">Signal lost</p>
      <h1 className="display mt-3 text-5xl text-bone">Something failed to render</h1>
      <p className="mt-4 text-bone-dim">
        The page could not be built. The failure has been logged with a correlation id; nothing you
        did caused it and nothing was lost.
      </p>
      {error.digest ? <p className="num mt-3 text-xs text-silver">Reference {error.digest}</p> : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded bg-bone px-4 py-2 text-sm font-semibold uppercase tracking-wide text-ink hover:bg-white"
        >
          Try again
        </button>
        <a href="/" className="rounded border border-ink-4 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-bone hover:border-silver">
          Back to the network
        </a>
      </div>
    </div>
  );
}
