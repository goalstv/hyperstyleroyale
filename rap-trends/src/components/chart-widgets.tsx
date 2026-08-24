import Link from "next/link";
import { movement, SIGNAL_LABELS, isPublishable, type RankedEntry } from "@/lib/index-engine";
import { Badge, Meter } from "./ui";
import type { FraudFlag, IndexScore } from "@/lib/types";

export function MovementArrow({ rank, previousRank }: { rank: number; previousRank: number | null }) {
  const m = movement({ rank, previousRank });
  if (m.direction === "new") return <Badge tone="volt">New</Badge>;
  if (m.direction === "flat") {
    return (
      <span className="num text-xs text-silver" aria-label="No change in position">
        <span aria-hidden>—</span>
      </span>
    );
  }
  const up = m.direction === "up";
  return (
    <span
      className={`num inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-neon" : "text-blood"}`}
      aria-label={`${up ? "Up" : "Down"} ${m.delta} position${m.delta === 1 ? "" : "s"}`}
    >
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      {m.delta}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const tone = confidence >= 0.75 ? "good" : confidence >= 0.5 ? "warn" : "bad";
  return (
    <Badge tone={tone}>
      <span title="Share of authorized sources reporting, adjusted for staleness and open flags.">
        Confidence {confidence.toFixed(2)}
      </span>
    </Badge>
  );
}

export function FlagList({ flags }: { flags: FraudFlag[] }) {
  if (flags.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {flags.map((f) => (
        <li key={f.code} className="flex gap-2 text-xs">
          <Badge tone={f.severity === "high" ? "bad" : f.severity === "medium" ? "warn" : "neutral"}>
            {f.severity}
          </Badge>
          <span className="text-bone-dim">{f.detail}</span>
        </li>
      ))}
    </ul>
  );
}

/** The full "show your work" panel that sits under every chart position. */
export function SignalBreakdown({ score }: { score: IndexScore }) {
  const publishable = isPublishable(score);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {score.contributions.slice(0, 8).map((c) => (
          <Meter
            key={c.key}
            label={`${SIGNAL_LABELS[c.key]} — weight ${(c.weight * 100).toFixed(0)}%`}
            value={c.raw}
            tone="volt"
          />
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-ink-4 pt-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="eyebrow text-silver">Recency</dt>
          <dd className="num text-bone">×{score.recencyMultiplier.toFixed(3)}</dd>
        </div>
        <div>
          <dt className="eyebrow text-silver">Emerging</dt>
          <dd className="num text-bone">×{score.emergingMultiplier.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="eyebrow text-silver">Regional</dt>
          <dd className="num text-bone">×{score.regionalMultiplier.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="eyebrow text-silver">Editorial</dt>
          <dd className={`num ${score.editorialDelta === 0 ? "text-bone" : "text-amber"}`}>
            {score.editorialDelta > 0 ? "+" : ""}
            {score.editorialDelta.toFixed(1)}
          </dd>
        </div>
      </dl>

      <FlagList flags={score.flags} />

      {!publishable.ok ? (
        <p className="rounded border border-amber/40 bg-amber/10 p-2.5 text-xs text-amber">
          Held from air: {publishable.reason}
        </p>
      ) : null}

      <p className="text-[0.625rem] text-silver">
        Profile {score.profileId} · computed {new Date(score.computedIso).toISOString().slice(0, 16).replace("T", " ")}Z ·{" "}
        <Link href="/trending/methodology" className="underline hover:text-bone">
          methodology
        </Link>
      </p>
    </div>
  );
}

/** One row of the countdown. Compact on the homepage, expandable on /trending. */
export function ChartRow({
  entry, expandable = false, artistSlug,
}: { entry: RankedEntry; expandable?: boolean; artistSlug?: string }) {
  const row = (
    <div className="flex items-center gap-4 px-3 py-3">
      <span className="num w-9 shrink-0 text-right text-2xl font-bold text-bone">
        {String(entry.rank).padStart(2, "0")}
      </span>
      <span className="w-10 shrink-0">
        <MovementArrow rank={entry.rank} previousRank={entry.previousRank} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate font-semibold text-bone">{entry.title}</span>
          {entry.explicit ? (
            <span className="rounded border border-ink-4 px-1 text-[0.625rem] font-bold text-silver" title="Explicit">E</span>
          ) : null}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-bone-dim">
          {artistSlug ? (
            <Link href={`/artists/${artistSlug}`} className="hover:text-bone hover:underline">
              {entry.artistName}
            </Link>
          ) : (
            <span>{entry.artistName}</span>
          )}
          <span className="text-silver">·</span>
          <span className="text-silver">
            {entry.weeksOn} {entry.weeksOn === 1 ? "week" : "weeks"} · peak {entry.peak}
          </span>
        </span>
      </span>
      <span className="hidden shrink-0 sm:block">
        <ConfidenceBadge confidence={entry.score.confidence} />
      </span>
      <span className="num w-14 shrink-0 text-right text-lg font-semibold text-volt-soft">
        {entry.score.score.toFixed(1)}
      </span>
    </div>
  );

  if (!expandable) return <div className="border-b border-ink-4/60 last:border-0">{row}</div>;

  return (
    <details className="group border-b border-ink-4/60 last:border-0">
      <summary className="cursor-pointer list-none transition-colors hover:bg-ink-3/60 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center">
          <div className="min-w-0 flex-1">{row}</div>
          <span className="eyebrow px-3 text-silver group-open:hidden">Signals</span>
          <span className="eyebrow hidden px-3 text-silver group-open:inline">Close</span>
        </div>
      </summary>
      <div className="border-t border-ink-4/60 bg-ink-2/60 p-4">
        <SignalBreakdown score={entry.score} />
      </div>
    </details>
  );
}
