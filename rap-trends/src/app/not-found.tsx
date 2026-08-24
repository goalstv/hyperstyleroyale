import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow text-blood">404</p>
      <h1 className="display mt-3 text-6xl text-bone">Off air</h1>
      <p className="mt-4 text-bone-dim">
        That page is not part of the schedule. It may have moved, or the rights window behind it may
        have closed.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded bg-bone px-4 py-2 text-sm font-semibold uppercase tracking-wide text-ink hover:bg-white">
          Back to the network
        </Link>
        <Link href="/schedule" className="rounded border border-ink-4 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-bone hover:border-silver">
          What&apos;s on
        </Link>
      </div>
    </div>
  );
}
