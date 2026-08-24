import { Skeleton } from "@/components/ui";

export default function OsLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading console</span>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-3 h-4 w-96" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
      <Skeleton className="mt-6 h-96 w-full" />
    </div>
  );
}
