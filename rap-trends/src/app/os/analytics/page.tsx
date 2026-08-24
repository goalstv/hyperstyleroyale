import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Meter, Notice, Stat, Table, Td, Th } from "@/components/ui";
import { getArticles, getEndpoints, getCities, getTrending, getShows } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { fmtCompact, fmtUsd } from "@/lib/format";

export const metadata = { title: "Analytics" };

/**
 * Analytics.
 *
 * Owned-and-operated numbers are first-party and would be real in production.
 * Everything shown here is demonstration data and is labelled as such — the
 * network does not claim measurement it has not bought.
 */
export default async function AnalyticsPage() {
  const { allowed } = await requirePermission("analytics.read");
  if (!allowed) return <PermissionDenied permission="analytics.read" />;

  const [endpoints, articles, cities, trending, shows] = await Promise.all([
    getEndpoints(), getArticles(), getCities(), getTrending(), getShows(),
  ]);

  const impressions = endpoints.reduce((s, e) => s + e.monthlyImpressions, 0);
  const revenue = endpoints.reduce((s, e) => s + e.monthlyRevenueUsd, 0);
  const published = articles.filter((a) => a.state === "published");

  // Deterministic demonstration figures derived from the seed data, so the
  // numbers move together rather than being unrelated invented values.
  const showPerf = shows.map((s, i) => ({
    show: s,
    watchMinutes: 42_000 - i * 3_100,
    completion: 68 - i * 2.4,
    slot: s.cadence,
  }));

  const cityPerf = cities.slice(0, 8).map((c, i) => ({
    city: c,
    readers: 84_000 - i * 7_400,
    growth: 18.2 - i * 2.1,
  }));

  const RECOMMENDATIONS = [
    ["Turn this article into a video", "“The independent ownership math has changed” is in the top decile for read completion and has no video companion. THE BUSINESS has an open slot Tuesday.", "Editorial"],
    ["This video needs an article", "The Hollow Park SESSIONS performance has no accompanying written piece; sessions with one hold 31% more search traffic in the demonstration model.", "Editorial"],
    ["Clip this live moment", "Three marked moments from last night's flagship exceed the clip-worthiness threshold and have not been cut.", "Social"],
    ["Underperforming slot", "The 13:00–15:00 THE BUSINESS block trails its daypart average. Consider moving CITY REPORT into the second hour.", "Programming"],
    ["Trending artist without coverage", "Amara Veil debuted at No. 9 and has one story. Toronto bureau has capacity.", "Editorial"],
    ["Archive match", "Two ARCHIVE items relate to this week's Memphis reporting and could be scheduled behind it — pending chain-of-title clearance.", "Programming"],
    ["Sponsor alignment", "The athletic-brand campaign over-indexes on the NEXT UP audience; propose moving weight from primetime to the Thursday block.", "Sales"],
    ["Pop-up channel candidate", "Detroit content has produced the strongest week-over-week engagement growth. A seven-day Detroit pop-up channel is viable from existing rights-cleared assets.", "Programming"],
  ];

  return (
    <div>
      <OsHeader
        title="Analytics & intelligence"
        subtitle="Audience, content, and revenue in one view, with recommendations a person can accept, edit, or ignore."
        actions={<Badge tone="warn">Demonstration figures</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Stat label="Monthly impressions" value={fmtCompact(impressions)} sub="All platforms" tone="volt" />
        <Stat label="Monthly revenue" value={fmtUsd(revenue, true)} sub="Live endpoints" tone="gold" />
        <Stat label="Live concurrents" value="3.4K" sub="Peak, flagship hour" />
        <Stat label="Radio listeners" value="1.1K" sub="Average quarter-hour" />
        <Stat label="Stories published" value={published.length} sub="This period" />
        <Stat label="Index confidence" value={(trending.reduce((s, e) => s + e.score.confidence, 0) / trending.length).toFixed(2)} sub="Mean across the chart" tone="good" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="eyebrow mb-3 text-silver">Platform distribution</p>
          <div className="space-y-3">
            {endpoints
              .filter((e) => e.monthlyImpressions > 0)
              .sort((a, b) => b.monthlyImpressions - a.monthlyImpressions)
              .map((e) => (
                <Meter
                  key={e.id}
                  label={`${e.name} — ${fmtCompact(e.monthlyImpressions)}`}
                  value={(e.monthlyImpressions / impressions) * 100}
                  tone="volt"
                  showValue={false}
                />
              ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="eyebrow mb-3 text-silver">City and regional engagement</p>
          <div className="space-y-3">
            {cityPerf.map((c) => (
              <div key={c.city.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-sm text-bone-dim">{c.city.name}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-ink-4">
                  <div className="h-full bg-neon" style={{ width: `${(c.readers / cityPerf[0].readers) * 100}%` }} />
                </div>
                <span className="num w-16 shrink-0 text-right text-xs text-bone">{fmtCompact(c.readers)}</span>
                <span className={`num w-14 shrink-0 text-right text-xs ${c.growth > 0 ? "text-neon" : "text-blood"}`}>
                  {c.growth > 0 ? "+" : ""}{c.growth.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <section aria-labelledby="schedule-perf" className="mb-8">
        <h2 id="schedule-perf" className="eyebrow mb-3 text-silver">Schedule performance</h2>
        <Card className="overflow-hidden">
          <Table caption="Franchise performance by slot">
            <thead><tr><Th>Franchise</Th><Th>Slot</Th><Th>Watch minutes</Th><Th>Completion</Th><Th>Verdict</Th></tr></thead>
            <tbody>
              {showPerf.map((p) => (
                <tr key={p.show.id} className="hover:bg-ink-3/50">
                  <Td className="font-semibold text-bone">{p.show.title}</Td>
                  <Td className="whitespace-nowrap text-xs">{p.slot}</Td>
                  <Td className="num whitespace-nowrap">{fmtCompact(p.watchMinutes)}</Td>
                  <Td className="num whitespace-nowrap">{p.completion.toFixed(1)}%</Td>
                  <Td>
                    <Badge tone={p.completion > 60 ? "good" : p.completion > 52 ? "warn" : "bad"}>
                      {p.completion > 60 ? "Performing" : p.completion > 52 ? "Watch" : "Review slot"}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </section>

      <section aria-labelledby="recommendations">
        <h2 id="recommendations" className="eyebrow mb-3 text-silver">Recommendations</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RECOMMENDATIONS.map(([title, body, owner]) => (
            <Card key={title} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-bone">{title}</p>
                <Badge>{owner}</Badge>
              </div>
              <p className="mt-2 text-sm text-bone-dim">{body}</p>
              <div className="mt-3 flex gap-2">
                <span className="rounded border border-ink-4 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-bone-dim">Accept</span>
                <span className="rounded border border-ink-4 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-bone-dim">Edit</span>
                <span className="rounded border border-ink-4 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-bone-dim">Dismiss</span>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-5">
          <Notice tone="volt" title="How recommendations work here">
            Every recommendation states the signal behind it, is editable, and does nothing until a
            person accepts it. None of them can move a chart position, publish a story, or change a
            schedule on their own.
          </Notice>
        </div>
      </section>
    </div>
  );
}
