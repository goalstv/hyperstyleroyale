import { Skeleton } from "@/components/ui";

/** Loading state for public pages. Mirrors the shape of a typical section. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-12 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-96 w-full" />
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    </div>
  );
}
