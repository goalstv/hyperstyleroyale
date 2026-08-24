import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEpisodesForShow, getShow, getShows, getWeekSchedule } from "@/lib/repo";
import { Badge, Button, Card, KeyValue, Field, SectionHeader } from "@/components/ui";
import { ArtSurface, VideoCard } from "@/components/cards";
import { ASSET_BY_ID } from "@/data/media";
import { fmtTime, fmtDay } from "@/lib/format";
import { formatDuration } from "@/lib/schedule";

export async function generateStaticParams() {
  const shows = await getShows();
  return shows.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const show = await getShow(slug);
  return show ? { title: show.title, description: show.synopsis } : { title: "Show not found" };
}

export const dynamic = "force-dynamic";

export default async function ShowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const show = await getShow(slug);
  if (!show) notFound();

  const [episodes, week] = await Promise.all([getEpisodesForShow(show.id), getWeekSchedule()]);
  const airings = week
    .filter((i) => i.showId === show.id && (i.kind === "episode" || i.kind === "live_window"))
    .slice(0, 8);

  return (
    <div>
      <div className="border-b border-ink-4">
        <ArtSurface seed={show.title} ratio="aspect-[21/6]" color={`${show.artColor}22`} className="min-h-52">
          <div className="mx-auto w-full max-w-[110rem] px-4 sm:px-6">
            <p className="eyebrow text-blood">{show.pillar}</p>
            <h1 className="display-tight mt-2 text-5xl text-bone sm:text-7xl">{show.title}</h1>
          </div>
        </ArtSurface>
      </div>

      <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="volt">{show.format}</Badge>
              <Badge>{show.runtimeMinutes} minutes</Badge>
              <Badge>{show.rating}</Badge>
              {show.hasCleanVersion ? <Badge tone="good">Clean feed available</Badge> : null}
            </div>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-bone-dim">{show.synopsis}</p>

            <div className="mt-8">
              <SectionHeader eyebrow="On demand" title="Episodes" />
              {episodes.length === 0 ? (
                <p className="mt-5 text-sm text-bone-dim">No episodes catalogued yet.</p>
              ) : (
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {episodes.map((ep) => {
                    const asset = ASSET_BY_ID.get(ep.assetId);
                    return asset ? (
                      <VideoCard key={ep.id} asset={asset} href={`/videos/${asset.id}`} />
                    ) : null;
                  })}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <Card className="p-4">
              <p className="eyebrow mb-2 text-silver">Details</p>
              <KeyValue>
                <Field label="Cadence">{show.cadence}</Field>
                <Field label="Runtime">{show.runtimeMinutes} min</Field>
                <Field label="Rating">{show.rating}</Field>
                <Field label="Format">{show.format}</Field>
                <Field label="Hosts">{show.hosts.join(", ")}</Field>
              </KeyValue>
            </Card>

            <Card className="overflow-hidden">
              <p className="eyebrow border-b border-ink-4 p-3 text-silver">Next airings</p>
              <ol>
                {airings.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 border-b border-ink-4/60 px-3 py-2.5 last:border-0">
                    <span className="w-24 shrink-0 text-xs text-silver">{fmtDay(a.startIso)}</span>
                    <span className="num w-16 shrink-0 text-xs text-bone">{fmtTime(a.startIso)}</span>
                    <span className="num flex-1 text-right text-xs text-silver">{formatDuration(a.durationSeconds)}</span>
                  </li>
                ))}
              </ol>
              <div className="p-3">
                <Button href="/schedule" tone="outline" size="sm">Full schedule</Button>
              </div>
            </Card>

            <Card className="p-4">
              <p className="eyebrow text-silver">Sponsorship</p>
              <p className="mt-2 text-sm text-bone-dim">
                Presenting positions, branded segments, and production partnerships are available on
                this franchise.
              </p>
              <Link href="/advertise" className="mt-3 inline-block text-sm text-volt-soft underline hover:text-bone">
                Rate card & opportunities
              </Link>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
