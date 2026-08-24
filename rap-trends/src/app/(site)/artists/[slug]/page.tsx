import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArtist, getArtists, getPublishedArticles, getTrending, getAssets } from "@/lib/repo";
import { Badge, Button, Card, Field, KeyValue, Meter, Notice, SectionHeader, Stat } from "@/components/ui";
import { ArtSurface, ArticleCard, VideoCard } from "@/components/cards";
import { ChartRow } from "@/components/chart-widgets";
import { SIGNAL_LABELS } from "@/lib/index-engine";
import type { SignalKey } from "@/lib/types";
import { CITY_BY_ID } from "@/data/cities";

export async function generateStaticParams() {
  const artists = await getArtists();
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  return artist
    ? { title: artist.name, description: `${artist.name} — ${artist.city}. ${artist.bio.slice(0, 140)}` }
    : { title: "Artist not found" };
}

export const dynamic = "force-dynamic";

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();

  const [trending, articles, assets] = await Promise.all([getTrending(), getPublishedArticles(), getAssets()]);
  const entries = trending.filter((e) => e.artistId === artist.id);
  const stories = articles.filter((a) => a.artistIds.includes(artist.id));
  const videos = assets.filter((a) => a.artistId === artist.id && a.publishStatus === "published");
  const city = CITY_BY_ID.get(artist.cityId);
  const topSignals = (Object.entries(artist.signals) as [SignalKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div>
      <div className="border-b border-ink-4">
        <div className="mx-auto grid max-w-[110rem] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[auto_1fr]">
          <div className="w-full max-w-xs">
            <ArtSurface seed={artist.name} ratio="aspect-[4/5]" className="rounded-lg" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {artist.verified ? <Badge tone="volt">Verified profile</Badge> : <Badge>Unclaimed profile</Badge>}
              {artist.nextUp ? <Badge tone="good">NEXT UP</Badge> : null}
              <Badge tone="warn">Demonstration profile</Badge>
            </div>
            <h1 className="display mt-3 text-6xl text-bone sm:text-7xl">{artist.name}</h1>
            <p className="mt-2 text-lg text-bone-dim">
              {city ? <Link href={`/cities/${city.slug}`} className="hover:text-bone hover:underline">{artist.city}</Link> : artist.city}
              {" · "}
              {artist.tier === "established" ? "Established" : artist.tier === "rising" ? "Rising" : "Independent"}
              {" · Active since "}{artist.formedYear}
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed text-bone-dim">{artist.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {artist.tags.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            {entries.length > 0 ? (
              <section aria-labelledby="chart">
                <SectionHeader id="chart" eyebrow="On the Index" title="Chart positions" />
                <Card className="mt-5 overflow-hidden">
                  {entries.map((e) => <ChartRow key={e.id} entry={e} expandable />)}
                </Card>
              </section>
            ) : null}

            {videos.length > 0 ? (
              <section aria-labelledby="videos">
                <SectionHeader id="videos" eyebrow="Watch" title="Video" />
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((a) => <VideoCard key={a.id} asset={a} href={`/videos/${a.id}`} />)}
                </ul>
              </section>
            ) : null}

            {stories.length > 0 ? (
              <section aria-labelledby="coverage">
                <SectionHeader id="coverage" eyebrow="Reporting" title="Coverage" />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {stories.map((a) => <ArticleCard key={a.id} article={a} compact />)}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Tier" value={artist.tier === "established" ? "Est." : artist.tier === "rising" ? "Rising" : "Indie"} />
              <Stat label="Label" value={artist.labelType === "major" ? "Major" : artist.labelType === "indie_label" ? "Indie" : "Self"} tone="volt" />
            </div>

            <Card className="p-4">
              <p className="eyebrow mb-3 text-silver">Strongest signals</p>
              <div className="space-y-3">
                {topSignals.map(([key, value]) => (
                  <Meter key={key} label={SIGNAL_LABELS[key]} value={value} tone="volt" />
                ))}
              </div>
              <p className="mt-3 text-xs text-silver">
                Normalized 0–100 readings from authorized sources, not absolute platform figures.
              </p>
            </Card>

            <Card className="p-4">
              <p className="eyebrow mb-2 text-silver">Profile</p>
              <KeyValue>
                <Field label="City">{artist.city}</Field>
                <Field label="Region">{artist.region}</Field>
                <Field label="Audience band">{artist.monthlyListenersBand}</Field>
                {artist.socials.map((s) => (
                  <Field key={s.platform} label={s.platform}>{s.handle}</Field>
                ))}
              </KeyValue>
            </Card>

            <Notice tone="warn" title="Audience figures">
              RAP TRENDS publishes audience bands, not precise platform counts, unless the figure is
              delivered by a licensed source and can be verified. Bands here are demonstration data.
            </Notice>

            <Card className="p-4">
              <p className="eyebrow text-silver">Is this you?</p>
              <p className="mt-2 text-sm text-bone-dim">
                Claim this profile to manage your catalogue, rights documentation, and submissions,
                and to see verified airtime reporting.
              </p>
              <Button href="/artist-portal" className="mt-4 w-full">Claim this profile</Button>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
