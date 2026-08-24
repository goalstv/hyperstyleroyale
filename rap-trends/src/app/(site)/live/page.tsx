import type { Metadata } from "next";
import Link from "next/link";
import { getNowAndNext, getShows, getTicker } from "@/lib/repo";
import { Badge, Button, Card, LiveBadge, Notice, SectionHeader } from "@/components/ui";
import { ArtSurface } from "@/components/cards";
import { Ticker } from "@/components/ticker";
import { LivePlayer } from "@/components/live-player";
import { fmtTime } from "@/lib/format";
import { formatDuration } from "@/lib/schedule";
import { SHOW_BY_ID } from "@/data/shows";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Watch live",
  description: "RAP TRENDS TV — the 24/7 linear channel, plus what is on next.",
};

export default async function LivePage() {
  const [{ current, next }, ticker, shows] = await Promise.all([getNowAndNext(), getTicker(), getShows()]);
  const show = current?.showId ? SHOW_BY_ID.get(current.showId) : undefined;

  return (
    <>
      <Ticker items={ticker} />
      <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
          <div>
            <LivePlayer
              title={current?.title ?? "RAP TRENDS TV"}
              showTitle={show?.title}
              rating={show?.rating ?? "TV-14"}
              startIso={current?.startIso}
              durationSeconds={current?.durationSeconds ?? 0}
            />

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-3">
                <LiveBadge label="On air" />
                {show ? <Badge tone="volt">{show.pillar}</Badge> : null}
                <Badge>{show?.rating ?? "TV-14"}</Badge>
                <Badge tone="good">Closed captions</Badge>
              </div>
              <h1 className="display mt-3 text-4xl text-bone sm:text-5xl">{current?.title ?? "RAP TRENDS TV"}</h1>
              {show ? <p className="mt-3 max-w-3xl text-bone-dim">{show.synopsis}</p> : null}
            </div>

            <Notice tone="warn" title="About this player" >
              This build does not stream licensed video. The player is the real interface —
              transport, captions toggle, quality selection, and the live clock all work — attached
              to a slate instead of a programme feed. Connecting it to the cloud playout output is a
              vendor integration, described in <Link className="underline hover:text-bone" href="/partners/fast">the FAST partner material</Link>.
            </Notice>
          </div>

          <aside aria-labelledby="up-next" className="space-y-4">
            <Card className="overflow-hidden">
              <h2 id="up-next" className="eyebrow border-b border-ink-4 p-3 text-silver">Up next on RAP TRENDS TV</h2>
              <ol>
                {next.map((item, i) => {
                  const s = item.showId ? SHOW_BY_ID.get(item.showId) : undefined;
                  return (
                    <li key={item.id} className="flex gap-3 border-b border-ink-4/60 p-3 last:border-0">
                      <span className="num w-16 shrink-0 text-xs text-silver">{fmtTime(item.startIso)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-bone">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-silver">
                          {s?.pillar ?? "Programming"} · {formatDuration(item.durationSeconds)}
                          {i === 0 ? " · next" : ""}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div className="p-3">
                <Button href="/schedule" tone="outline" size="sm">Seven-day schedule</Button>
              </div>
            </Card>

            <Card className="p-4">
              <p className="eyebrow text-silver">Where to watch</p>
              <ul className="mt-3 space-y-2 text-sm text-bone-dim">
                <li>· raptrends.tv on any browser</li>
                <li>· iOS and Android applications (in certification)</li>
                <li>· Connected-TV applications for Roku, Fire TV, Apple TV, Android TV, Samsung, and LG (in certification)</li>
                <li>· FAST platforms — <span className="text-amber">in discussion, no agreement in place</span></li>
                <li>· Cable, vMVPD, and over-the-air — <span className="text-amber">requires negotiated carriage and, for OTA, a partnership with an FCC-licensed station</span></li>
              </ul>
              <Button href="/partners" tone="outline" size="sm" className="mt-4">Carriage & distribution</Button>
            </Card>
          </aside>
        </div>

        <section aria-labelledby="all-shows" className="mt-14">
          <SectionHeader id="all-shows" eyebrow="Programming" title="What runs on this channel" />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shows.map((s) => (
              <li key={s.id} className="surface overflow-hidden rounded-lg">
                <Link href={`/shows/${s.slug}`} className="block">
                  <ArtSurface seed={s.title} ratio="aspect-[16/7]" color={`${s.artColor}22`}>
                    <p className="display text-xl leading-none text-bone">{s.title}</p>
                  </ArtSurface>
                  <p className="p-3 text-xs text-bone-dim">{s.cadence}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
