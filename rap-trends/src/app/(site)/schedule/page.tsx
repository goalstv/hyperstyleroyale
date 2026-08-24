import type { Metadata } from "next";
import Link from "next/link";
import { getSchedule, getShows } from "@/lib/repo";
import { Badge, Card, Notice, SectionHeader } from "@/components/ui";
import { fmtDay, fmtDate, fmtTime } from "@/lib/format";
import { formatDuration, DAYPARTS } from "@/lib/schedule";
import { SHOW_BY_ID } from "@/data/shows";
import { startOfNetworkDay } from "@/lib/clock";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Schedule",
  description: "The seven-day RAP TRENDS TV schedule, all times Eastern.",
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const { day } = await searchParams;
  const offset = Math.max(0, Math.min(6, Number(day ?? 0) || 0));
  const [items, shows] = await Promise.all([getSchedule(offset), getShows()]);
  const programmes = items.filter((i) => i.kind === "episode" || i.kind === "live_window");

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="RAP TRENDS TV"
        title="Schedule"
        description="All times Eastern. The same grid drives the electronic programme guide delivered to FAST platforms, connected-TV applications, and affiliates."
      />

      <nav aria-label="Choose a day" className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 7 }, (_, i) => {
          const date = startOfNetworkDay(i).toISOString();
          const active = i === offset;
          return (
            <Link
              key={i}
              href={`/schedule?day=${i}`}
              aria-current={active ? "page" : undefined}
              className={`rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                active ? "border-blood bg-blood/15 text-blood" : "border-ink-4 text-bone-dim hover:border-silver hover:text-bone"
              }`}
            >
              <span className="block">{i === 0 ? "Today" : fmtDay(date).slice(0, 3)}</span>
              <span className="num block text-[0.625rem] font-normal text-silver">{fmtDate(date).slice(0, 6)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2.4fr_1fr]">
        <Card className="overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">RAP TRENDS TV schedule for the selected day</caption>
            <thead>
              <tr className="border-b border-ink-4 bg-ink-2">
                <th scope="col" className="eyebrow px-3 py-2.5 text-left text-silver">Time</th>
                <th scope="col" className="eyebrow px-3 py-2.5 text-left text-silver">Programme</th>
                <th scope="col" className="eyebrow hidden px-3 py-2.5 text-left text-silver sm:table-cell">Franchise</th>
                <th scope="col" className="eyebrow px-3 py-2.5 text-right text-silver">Runs</th>
              </tr>
            </thead>
            <tbody>
              {programmes.map((item) => {
                const show = item.showId ? SHOW_BY_ID.get(item.showId) : undefined;
                const live = item.kind === "live_window";
                return (
                  <tr key={item.id} className="border-b border-ink-4/60 last:border-0 hover:bg-ink-3/50">
                    <td className="num whitespace-nowrap px-3 py-2.5 align-top text-bone">
                      {fmtTime(item.startIso)}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="flex flex-wrap items-center gap-2">
                        {show ? (
                          <Link href={`/shows/${show.slug}`} className="font-semibold text-bone hover:underline">
                            {item.title}
                          </Link>
                        ) : (
                          <span className="text-bone">{item.title}</span>
                        )}
                        {live ? <Badge tone="live">Live</Badge> : null}
                        {item.explicitAllowed ? <Badge tone="warn">Explicit feed</Badge> : null}
                      </span>
                      <span className="mt-0.5 block text-xs capitalize text-silver">{item.daypart}</span>
                    </td>
                    <td className="hidden px-3 py-2.5 align-top text-bone-dim sm:table-cell">{show?.pillar ?? "—"}</td>
                    <td className="num px-3 py-2.5 text-right align-top text-silver">
                      {formatDuration(item.durationSeconds)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <aside className="space-y-4">
          <Card className="p-4">
            <p className="eyebrow mb-3 text-silver">Dayparts</p>
            <ul className="space-y-1.5 text-sm text-bone-dim">
              {DAYPARTS.map((d) => (
                <li key={d.id} className="flex justify-between">
                  <span className="capitalize">{d.label}</span>
                  <span className="num text-silver">
                    {String(d.startHour).padStart(2, "0")}:00–{String(d.endHour).padStart(2, "0")}:00
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Notice tone="volt" title="Clean and explicit feeds">
            Explicit audio rides the feed only in the late and overnight dayparts, and only on owned
            digital origination. Broadcast and radio-affiliate carriage always receives the clean
            feed. The scheduler enforces this — an explicit asset placed in primetime is rejected
            before it can reach air.
          </Notice>

          <Card className="p-4">
            <p className="eyebrow mb-3 text-silver">On this channel</p>
            <ul className="space-y-2 text-sm">
              {shows.map((s) => (
                <li key={s.id}>
                  <Link href={`/shows/${s.slug}`} className="text-bone-dim hover:text-bone hover:underline">
                    {s.title}
                  </Link>
                  <span className="ml-2 text-xs text-silver">{s.cadence}</span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
