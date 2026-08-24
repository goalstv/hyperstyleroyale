import Link from "next/link";
import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Notice, Stat, Table, Td, Th } from "@/components/ui";
import { getSchedule, getChannels, assetMap, rightsMap } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { DAYPARTS, dayCoverage, formatDuration, totalDuration, validateSchedule } from "@/lib/schedule";
import { fmtDay, fmtDate, fmtTime } from "@/lib/format";
import { startOfNetworkDay } from "@/lib/clock";
import { SHOW_BY_ID } from "@/data/shows";
import type { ChannelId } from "@/lib/types";

export const metadata = { title: "Programming" };

export default async function ProgrammingPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; channel?: string }>;
}) {
  const { allowed, user } = await requirePermission("schedule.read");
  if (!allowed) return <PermissionDenied permission="schedule.read" />;

  const params = await searchParams;
  const offset = Math.max(0, Math.min(6, Number(params.day ?? 0) || 0));
  const channelId = (params.channel ?? "rt_tv") as ChannelId;

  const [items, channels] = await Promise.all([getSchedule(offset, channelId), getChannels()]);
  const issues = validateSchedule({
    channelId, items, assets: assetMap(), rights: rightsMap(), platform: "fast", territory: "US",
  });
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const coverage = dayCoverage(items);
  const canEdit = user.roles.includes("programming_director") || user.roles.includes("founder_admin");

  const programmes = items.filter((i) => i.kind === "episode" || i.kind === "live_window");
  const breaks = items.filter((i) => i.kind === "commercial_break");
  const inventorySeconds = totalDuration(breaks);

  return (
    <div>
      <OsHeader
        title="Programming calendar"
        subtitle="Build, validate, and approve the schedule. Gap and overlap detection, rights-window validation, and explicit-content restrictions run on every change."
        actions={
          <>
            <Badge tone={errors.length ? "bad" : warnings.length ? "warn" : "good"}>
              {errors.length} errors · {warnings.length} warnings
            </Badge>
            {canEdit ? <Badge tone="volt">Edit access</Badge> : <Badge>Read only</Badge>}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {channels.map((c) => (
          <Link
            key={c.id}
            href={`/os/programming?channel=${c.id}&day=${offset}`}
            aria-current={c.id === channelId ? "page" : undefined}
            className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              c.id === channelId ? "border-volt bg-volt/15 text-volt-soft" : "border-ink-4 text-bone-dim hover:border-silver"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <nav aria-label="Choose a day" className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 7 }, (_, i) => {
          const date = startOfNetworkDay(i).toISOString();
          return (
            <Link
              key={i}
              href={`/os/programming?channel=${channelId}&day=${i}`}
              aria-current={i === offset ? "page" : undefined}
              className={`rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                i === offset ? "border-blood bg-blood/15 text-blood" : "border-ink-4 text-bone-dim hover:border-silver"
              }`}
            >
              <span className="block">{i === 0 ? "Today" : fmtDay(date).slice(0, 3)}</span>
              <span className="num block text-[0.625rem] font-normal text-silver">{fmtDate(date).slice(0, 6)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Day coverage" value={`${(coverage * 100).toFixed(1)}%`} sub="Must reach 100% on a linear channel" tone={coverage >= 0.999 ? "good" : "bad"} />
        <Stat label="Programmes" value={programmes.length} sub={`${items.length} total events`} />
        <Stat label="Commercial inventory" value={formatDuration(inventorySeconds)} sub="Across the day" tone="gold" />
        <Stat label="Unapproved items" value={items.filter((i) => !i.approved).length} sub="Blocked from air" tone={items.some((i) => !i.approved) ? "warn" : "good"} />
      </div>

      {issues.length > 0 ? (
        <div className="mb-6">
          <Notice tone={errors.length ? "bad" : "warn"} title={`Validation report — ${issues.length} issue${issues.length === 1 ? "" : "s"}`}>
            <ul className="space-y-1.5">
              {issues.slice(0, 10).map((issue, i) => (
                <li key={i}>
                  <Badge tone={issue.severity === "error" ? "bad" : "warn"}>{issue.code.replace(/_/g, " ")}</Badge>{" "}
                  {issue.message}
                  {issue.startIso ? <span className="ml-1 text-xs text-silver">({fmtTime(issue.startIso)})</span> : null}
                </li>
              ))}
            </ul>
            {issues.length > 10 ? <p className="mt-2 text-xs">…and {issues.length - 10} more.</p> : null}
          </Notice>
        </div>
      ) : (
        <div className="mb-6">
          <Notice tone="good" title="Schedule validates clean">
            No gaps, no overlaps, no rights-window violations, no explicit content outside its
            permitted dayparts, and every scheduled asset has reviewed captions.
          </Notice>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-ink-4 p-3">
            <p className="eyebrow text-silver">Playlist — every event, in order</p>
          </div>
          <Table caption="Full playout list for the selected day">
            <thead>
              <tr><Th>Start</Th><Th>Event</Th><Th>Kind</Th><Th>Daypart</Th><Th>Duration</Th><Th>State</Th></tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const show = item.showId ? SHOW_BY_ID.get(item.showId) : undefined;
                const hasIssue = issues.some((i) => i.itemId === item.id);
                return (
                  <tr key={item.id} className={hasIssue ? "bg-blood/8" : "hover:bg-ink-3/50"}>
                    <Td className="num whitespace-nowrap text-bone">{fmtTime(item.startIso)}</Td>
                    <Td>
                      <span className={item.kind === "commercial_break" ? "text-silver" : "font-semibold text-bone"}>
                        {item.title}
                      </span>
                      {show ? <span className="mt-0.5 block text-xs text-silver">{show.pillar}</span> : null}
                    </Td>
                    <Td className="whitespace-nowrap text-xs capitalize">{item.kind.replace(/_/g, " ")}</Td>
                    <Td className="whitespace-nowrap text-xs capitalize">{item.daypart}</Td>
                    <Td className="num whitespace-nowrap">{formatDuration(item.durationSeconds)}</Td>
                    <Td>
                      {item.explicitAllowed ? <Badge tone="warn">Explicit</Badge> : null}
                      {item.approved ? <Badge tone="good">Approved</Badge> : <Badge tone="warn">Unapproved</Badge>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>

        <aside className="space-y-4">
          <Card className="p-4">
            <p className="eyebrow mb-3 text-silver">Daypart map</p>
            <ul className="space-y-2">
              {DAYPARTS.map((d) => {
                const inPart = programmes.filter((i) => i.daypart === d.id);
                return (
                  <li key={d.id} className="flex items-center justify-between gap-2 border-b border-ink-4/50 pb-2 last:border-0">
                    <div>
                      <p className="text-sm text-bone">{d.label}</p>
                      <p className="num text-xs text-silver">
                        {String(d.startHour).padStart(2, "0")}:00–{String(d.endHour).padStart(2, "0")}:00
                      </p>
                    </div>
                    <span className="num text-sm text-bone-dim">{inPart.length}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">What the validator checks</p>
            <ul className="space-y-1.5 text-sm text-bone-dim">
              <li>· Gaps — any dead air between events</li>
              <li>· Overlaps — double-booked playout</li>
              <li>· Rights windows — per platform and territory, at the airing&apos;s own time</li>
              <li>· Explicit restrictions — by daypart and platform</li>
              <li>· Caption status — AI drafts blocked</li>
              <li>· Missing or unknown assets</li>
              <li>· Programming-director approval</li>
            </ul>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Scheduling tools</p>
            <ul className="space-y-1.5 text-sm text-bone-dim">
              <li>· Drag-and-drop grid editing</li>
              <li>· Recurring programming and schedule templates</li>
              <li>· Automatic duration calculation and gap filling</li>
              <li>· Regional scheduling and blackout rules</li>
              <li>· Schedule approval and version history</li>
              <li>· Emergency schedule replacement</li>
              <li>· Backup programming and filler content</li>
            </ul>
            <p className="mt-3 text-xs text-silver">
              The grid in this build is generated from the daypart template in{" "}
              <span className="text-bone-dim">src/data/schedule.ts</span>; the validation, rights,
              and approval logic around it is production code.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
