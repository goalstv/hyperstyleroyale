import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArtists, getCities, getCity, getPublishedArticles, getTrending } from "@/lib/repo";
import { Badge, Button, Card, Field, KeyValue, Notice, SectionHeader } from "@/components/ui";
import { ArtSurface, ArticleCard, ArtistCard } from "@/components/cards";
import { ChartRow } from "@/components/chart-widgets";
import { ARTIST_BY_ID } from "@/data/artists";

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);
  return city ? { title: `${city.name} — City Report`, description: city.blurb } : { title: "City not found" };
}

export const dynamic = "force-dynamic";

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) notFound();

  const [artists, articles, trending] = await Promise.all([getArtists(), getPublishedArticles(), getTrending()]);
  const local = artists.filter((a) => a.cityId === city.id);
  const stories = articles.filter((a) => a.cityIds.includes(city.id));
  const entries = trending.filter((e) => e.cityId === city.id);

  return (
    <div>
      <ArtSurface seed={city.name} ratio="aspect-[21/6]" className="min-h-52 border-b border-ink-4">
        <div className="mx-auto w-full max-w-[110rem] px-4 sm:px-6">
          <p className="eyebrow text-blood">City Report · {city.country}</p>
          <h1 className="display-tight mt-2 text-6xl text-bone sm:text-8xl">{city.name}</h1>
        </div>
      </ArtSurface>

      <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-12">
            <p className="max-w-3xl text-lg leading-relaxed text-bone-dim">{city.blurb}</p>

            {entries.length > 0 ? (
              <section aria-labelledby="city-chart">
                <SectionHeader id="city-chart" eyebrow="Regional edition" title={`On the Index from ${city.name}`} />
                <Card className="mt-5 overflow-hidden">
                  {entries.map((e) => (
                    <ChartRow key={e.id} entry={e} expandable artistSlug={ARTIST_BY_ID.get(e.artistId)?.slug} />
                  ))}
                </Card>
              </section>
            ) : null}

            {local.length > 0 ? (
              <section aria-labelledby="city-artists">
                <SectionHeader id="city-artists" eyebrow="From the city" title="Artists" />
                <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {local.map((a) => <ArtistCard key={a.id} artist={a} />)}
                </ul>
              </section>
            ) : null}

            {stories.length > 0 ? (
              <section aria-labelledby="city-stories">
                <SectionHeader id="city-stories" eyebrow="Filed from the bureau" title="Reporting" />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {stories.map((a) => <ArticleCard key={a.id} article={a} compact />)}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <Card className="p-4">
              <p className="eyebrow mb-2 text-silver">Bureau</p>
              <KeyValue>
                <Field label="Correspondent">{city.correspondent}</Field>
                <Field label="Region">{city.region}</Field>
                <Field label="Timezone">{city.timezone}</Field>
              </KeyValue>
            </Card>

            <Card className="p-4">
              <p className="eyebrow mb-3 text-silver">Scenes we cover</p>
              <div className="flex flex-wrap gap-1.5">
                {city.scenes.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </Card>

            <Card className="p-4">
              <p className="eyebrow mb-2 text-silver">Venues in rotation</p>
              <KeyValue>
                {city.venues.map((v) => (
                  <Field key={v.name} label={v.name}>{v.capacity.toLocaleString()} cap.</Field>
                ))}
              </KeyValue>
              <p className="mt-2 text-xs text-silver">Demonstration venue records.</p>
            </Card>

            <Notice tone="volt" title="Distribution in this market">
              <p className="mb-2"><strong className="text-bone">Radio:</strong> {city.radioAffiliateTarget}</p>
              <p><strong className="text-bone">Over-the-air:</strong> {city.otaTarget}</p>
              <p className="mt-2 text-xs text-silver">
                Prospective only. No carriage agreement exists in any market.
              </p>
            </Notice>

            <Card className="p-4">
              <p className="eyebrow text-silver">Report for this bureau</p>
              <p className="mt-2 text-sm text-bone-dim">
                RAP TRENDS works with correspondents, photographers, and creators in every market.
              </p>
              <Button href="/press" tone="outline" className="mt-4 w-full">Get in touch</Button>
              <Link href="/submit" className="mt-3 block text-center text-sm text-volt-soft underline hover:text-bone">
                Submit music from {city.name}
              </Link>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
