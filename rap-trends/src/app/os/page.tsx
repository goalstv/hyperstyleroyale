import Link from "next/link";
import { OsHeader } from "@/components/os/os-shell";
import { Badge, Card, Meter, Notice, Stat } from "@/components/ui";
import {
  getArticles, getCampaigns, getDriveSync, getEndpoints, getHealthChecks,
  getNowAndNext, getRightsWindows, getSchedule, getSubmissions, getTrending, assetMap, rightsMap,
} from "@/lib/repo";
import { getSessionUser } from "@/lib/session";
import { validateSchedule } from "@/lib/schedule";
import { expiringSoon } from "@/lib/rights";
import { nowIso } from "@/lib/clock";
import { fmtTime, fmtUsd, fmtCompact } from "@/lib/format";
import { pacing } from "@/lib/ad-safety";
import { ROLE_LABELS } from "@/lib/roles";

export const metadata = { title: "Control room" };

export default async function OsDashboard() {
  const [user, articles, schedule, health, endpoints, campaigns, rights, drive, submissions, trending, { current, next }] =
    await Promise.all([
      getSessionUser(), getArticles(), getSchedule(0), getHealthChecks(), getEndpoints(),
      getCampaigns(), getRightsWindows(), getDriveSync(), getSubmissions(), getTrending(), getNowAndNext(),
    ]);

  const issues = validateSchedule({
    channelId: "rt_tv", items: schedule, assets: assetMap(), rights: rightsMap(),
    platform: "fast", territory: "US",
  });
  const errors = issues.filter((i) => i.severity === "error");
  const expiring = expiringSoon(rights, nowIso(), 45);
  const failing = health.filter((h) => h.status === "fail");
  const warning = health.filter((h) => h.status === "warn");
  const openEditorial = articles.filter((a) => !["published", "archived", "updated"].includes(a.state));
  const liveCampaigns = campaigns.filter((c) => c.status === "live");
  const pendingCompliance = campaigns.filter((c) => c.status === "pending_compliance");
  const revenue = endpoints.reduce((s, e) => s + e.monthlyRevenueUsd, 0);
  const impressions = endpoints.reduce((s, e) => s + e.monthlyImpressions, 0);
  const driveOpen = drive.filter((d) => d.status === "detected" || d.status === "error");
  const submissionQueue = submissions.filter((s) => s.status === "received" || s.status === "in_review");
  const avgConfidence = trending.reduce((s, e) => s + e.score.confidence, 0) / trending.length;

  return (
    <div>
      <OsHeader
        title="Control room"
        subtitle={`${user.name} — ${ROLE_LABELS[user.roles[0]]}. Everything that needs a person, in one place.`}
        actions={
          <>
            <Badge tone={failing.length ? "bad" : warning.length ? "warn" : "good"}>
              {failing.length ? `${failing.length} failing` : warning.length ? `${warning.length} warnings` : "All systems nominal"}
            </Badge>
          </>
        }
      />

      {/* ------------------------------------------------------------ on air */}
      <section aria-labelledby="on-air" className="mb-8">
        <h2 id="on-air" className="eyebrow mb-3 text-silver">On air right now</h2>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <span className="live-dot" aria-hidden />
              <span className="eyebrow text-blood">RAP TRENDS TV</span>
            </div>
            <p className="display mt-2 text-2xl text-bone">{current?.title ?? "—"}</p>
            <p className="mt-1 text-sm text-bone-dim">
              Next {next[0] ? `${fmtTime(next[0].startIso)} — ${next[0].title}` : "—"}
            </p>
            <Link href="/os/channels" className="mt-3 inline-block text-xs text-volt-soft underline hover:text-bone">
              Open channel origination
            </Link>
          </Card>
          <Stat label="Schedule errors" value={errors.length} sub="Today, RAP TRENDS TV" tone={errors.length ? "bad" : "good"} />
          <Stat label="Index confidence" value={avgConfidence.toFixed(2)} sub="Mean across the chart" tone={avgConfidence >= 0.75 ? "good" : "warn"} />
        </div>
      </section>

      {/* ------------------------------------------------------- needs a human */}
      <section aria-labelledby="attention" className="mb-8">
        <h2 id="attention" className="eyebrow mb-3 text-silver">Needs a person</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <QueueCard href="/os/newsroom" label="Editorial approvals" count={openEditorial.length} tone={openEditorial.length ? "warn" : "good"} />
          <QueueCard href="/os/drive" label="Drive items open" count={driveOpen.length} tone={driveOpen.length ? "warn" : "good"} />
          <QueueCard href="/os/rights" label="Licences expiring" count={expiring.length} tone={expiring.length ? "warn" : "good"} />
          <QueueCard href="/os/monetization" label="Campaigns in compliance" count={pendingCompliance.length} tone={pendingCompliance.length ? "warn" : "good"} />
          <QueueCard href="/os/programming" label="Schedule issues" count={issues.length} tone={errors.length ? "bad" : issues.length ? "warn" : "good"} />
          <QueueCard href="/os/health" label="Failing checks" count={failing.length} tone={failing.length ? "bad" : "good"} />
        </div>
      </section>

      {errors.length > 0 ? (
        <div className="mb-8">
          <Notice tone="bad" title={`${errors.length} schedule error${errors.length === 1 ? "" : "s"} would stop or compromise the feed`}>
            <ul className="space-y-1.5">
              {errors.slice(0, 4).map((e, i) => (
                <li key={i}>· {e.message}</li>
              ))}
            </ul>
            <Link href="/os/programming" className="mt-3 inline-block underline hover:text-bone">
              Open the programming calendar
            </Link>
          </Notice>
        </div>
      ) : null}

      {/* -------------------------------------------------------- performance */}
      <section aria-labelledby="performance" className="mb-8">
        <h2 id="performance" className="eyebrow mb-3 text-silver">This month</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Distributed revenue" value={fmtUsd(revenue, true)} sub="Across live endpoints" tone="gold" />
          <Stat label="Impressions" value={fmtCompact(impressions)} sub="All platforms" tone="volt" />
          <Stat label="Live campaigns" value={liveCampaigns.length} sub={`${pendingCompliance.length} awaiting compliance`} />
          <Stat label="Submission queue" value={submissionQueue.length} sub="Awaiting editorial review" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="eyebrow text-silver">Campaign pacing</h2>
            <Link href="/os/monetization" className="text-xs text-volt-soft underline hover:text-bone">All campaigns</Link>
          </div>
          <div className="space-y-3">
            {liveCampaigns.map((c) => {
              const p = pacing(c, nowIso());
              return (
                <Meter
                  key={c.id}
                  label={`${c.name} — ${(p * 100).toFixed(0)}% of plan`}
                  value={Math.min(150, p * 100)}
                  max={150}
                  tone={p < 0.85 ? "warn" : p > 1.15 ? "bad" : "good"}
                  showValue={false}
                />
              );
            })}
          </div>
          <p className="mt-3 text-xs text-silver">
            100% is on plan. Under-pacing risks a make-good; over-pacing exhausts the flight early.
          </p>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="eyebrow text-silver">Distribution status</h2>
            <Link href="/os/distribution" className="text-xs text-volt-soft underline hover:text-bone">Control centre</Link>
          </div>
          <ul className="space-y-2">
            {endpoints.slice(0, 8).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 border-b border-ink-4/50 pb-2 last:border-0">
                <span className="min-w-0 truncate text-sm text-bone-dim">{e.name}</span>
                <Badge tone={e.status === "live" ? "good" : e.status === "error" ? "bad" : e.status === "prospect" ? "neutral" : "warn"}>
                  {e.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function QueueCard({
  href, label, count, tone,
}: { href: string; label: string; count: number; tone: "good" | "warn" | "bad" }) {
  const color = tone === "bad" ? "text-blood" : tone === "warn" ? "text-amber" : "text-neon";
  return (
    <Link href={href} className="surface rounded-lg p-4 transition-colors hover:border-silver">
      <p className="eyebrow text-silver">{label}</p>
      <p className={`num mt-2 text-3xl font-semibold ${color}`}>{count}</p>
    </Link>
  );
}
