import { DATA_MODE } from "@/lib/repo";

/**
 * Site-wide data-integrity statement. The network's rule is that demonstration
 * data is never presented as verified live data, and the statement is not
 * dismissible while the build is running on the demo adapter.
 */
export function DataModeBanner() {
  if (DATA_MODE === "live") return null;
  return (
    <div className="border-b border-amber/30 bg-amber/10">
      <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:px-6">
        <span className="eyebrow rounded bg-amber px-1.5 py-0.5 text-ink">Demonstration data</span>
        <p className="text-xs text-bone-dim">
          Artists, records, charts, stories, and carriage status on this site are fictional sample
          data. Nothing here is verified live measurement, and no distribution agreement is
          represented.{" "}
          <a href="/trending/methodology" className="underline hover:text-bone">
            How the Index works
          </a>
        </p>
      </div>
    </div>
  );
}
