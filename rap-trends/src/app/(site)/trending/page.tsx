import type { Metadata } from "next";
import Link from "next/link";
import { getIndexSources, getOverrides, getTrending } from "@/lib/repo";
import { Badge, Button, Card, Notice, SectionHeader, Stat } from "@/components/ui";
import { ChartRow } from "@/components/chart-widgets";
import { ARTIST_BY_ID } from "@/data/artists";
import { fmtDateTime } from "@/lib/format";
import { isPublishable } from "@/lib/index-engine";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Trending 10",
  description: "The RAP TRENDS Index — a published, auditable ranking of what is moving hip-hop right now.",
};

export default async function TrendingPage() {
  const [entries, sources, overrides] = await Promise.all([
    getTrending(), getIndexSources(), getOverrides(),
  ]);

  const connected = sources.filter((s) => s.status === "connected");
  const pending = sources.filter((s) => s.status !== "connected");
  const avgConfidence = entries.reduce((s, e) => s + e.score.confidence, 0) / entries.length;
  const held = entries.filter((e) => !isPublishable(e.score).ok);
  const flagged = entries.filter((e) => e.score.flags.length > 0);

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6">
      <div className="border-b border-ink-4 pb-6">
        <p className="eyebrow text-blood">The RAP TRENDS Index</p>
        <h1 className="display mt-2 text-6xl text-bone sm:text-7xl">Trending 10</h1>
        <p className="mt-4 max-w-3xl text-lg text-bone-dim">
          What is actually moving right now, ranked by a model we publish. Expand any position to
          see the signals, the weights, the decay, and any editorial adjustment applied to it.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sources connected" value={`${connected.length} / ${sources.length}`} sub={`${pending.length} awaiting an executed agreement`} tone="volt" />
        <Stat label="Mean confidence" value={avgConfidence.toFixed(2)} sub="Across all published positions" tone={avgConfidence >= 0.75 ? "good" : "warn"} />
        <Stat label="Open flags" value={flagged.length} sub="Visible on the chart, not removed" tone={flagged.length ? "warn" : "good"} />
        <Stat label="Held from air" value={held.length} sub="Below the publication floor" tone={held.length ? "warn" : "good"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2.2fr_1fr]">
        <div>
          <SectionHeader
            eyebrow="Updated continuously"
            title="This week's countdown"
            description="Click a row to open its signal breakdown."
          />
          <Card className="mt-5 overflow-hidden">
            {entries.map((entry) => (
              <ChartRow
                key={entry.id}
                entry={entry}
                expandable
                artistSlug={ARTIST_BY_ID.get(entry.artistId)?.slug}
              />
            ))}
          </Card>

          {overrides.length > 0 ? (
            <div className="mt-6">
              <h2 className="eyebrow mb-3 text-silver">Editorial adjustments in force</h2>
              <ul className="space-y-3">
                {overrides.map((o) => {
                  const entry = entries.find((e) => e.id === o.entryId);
                  return (
                    <li key={o.id} className="rounded-lg border border-amber/35 bg-amber/8 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="warn">
                          {o.deltaPoints > 0 ? "+" : ""}
                          {o.deltaPoints} points
                        </Badge>
                        <span className="text-sm font-semibold text-bone">
                          {entry ? `${entry.title} — ${entry.artistName}` : o.entryId}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-bone-dim">{o.reason}</p>
                      <p className="mt-2 text-xs text-silver">
                        Applied by editorial board · {fmtDateTime(o.createdIso)} · logged in the Index audit history
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <p className="eyebrow text-silver">Signal sources</p>
            <ul className="mt-3 space-y-2.5">
              {sources.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-3 border-b border-ink-4/50 pb-2.5 last:border-0">
                  <span className="min-w-0">
                    <span className="block text-sm text-bone">{s.label}</span>
                    <span className="block text-xs text-silver">{s.provider}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <Badge tone={s.status === "connected" ? "good" : "warn"}>
                      {s.status === "connected" ? "Connected" : "Not licensed"}
                    </Badge>
                    <span className="num mt-1 block text-xs text-silver">{(s.weight * 100).toFixed(0)}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Notice tone="volt" title="A note on what we will not do">
            RAP TRENDS does not scrape platforms in ways that violate their terms, and it does not
            fill a missing signal with an estimate. A source we are not licensed to read contributes
            nothing to a score — it lowers the confidence figure, in public, instead.
          </Notice>

          <Card className="p-4">
            <p className="eyebrow text-silver">Read further</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/trending/methodology" className="text-volt-soft underline hover:text-bone">Full Index methodology</Link></li>
              <li><Link href="/next-up" className="text-volt-soft underline hover:text-bone">NEXT UP — the emerging edition</Link></li>
              <li><Link href="/legal/editorial-standards" className="text-volt-soft underline hover:text-bone">Editorial standards & the commercial firewall</Link></li>
            </ul>
          </Card>

          <Button href="/submit" className="w-full">Submit your record</Button>
        </aside>
      </div>
    </div>
  );
}
