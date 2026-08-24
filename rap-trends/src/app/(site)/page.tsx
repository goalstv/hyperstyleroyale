import Link from "next/link";
import {
  getCities, getNextUpChart, getNowAndNext, getNowPlaying, getPublishedArticles,
  getShows, getSponsorOpportunities, getTicker, getTrending, getAssets, getArtists,
} from "@/lib/repo";
import { Ticker } from "@/components/ticker";
import { DataModeBanner } from "@/components/data-mode-banner";
import { Badge, Button, Card, LiveBadge, SectionHeader, Stat } from "@/components/ui";
import { ArtSurface, ArticleCard, CityCard, ShowCard, VideoCard } from "@/components/cards";
import { ChartRow } from "@/components/chart-widgets";
import { fmtTime, fmtUsd } from "@/lib/format";
import { ARTIST_BY_ID } from "@/data/artists";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [ticker, trending, nextUp, { current, next }, articles, shows, cities, nowPlaying, assets, artists, sponsors] =
    await Promise.all([
      getTicker(), getTrending(), getNextUpChart(), getNowAndNext(), getPublishedArticles(),
      getShows(), getCities(), getNowPlaying(), getAssets(), getArtists(), getSponsorOpportunities(),
    ]);

  const lead = articles[0];
  const secondary = articles.slice(1, 4);
  const videoAssets = assets.filter((a) => a.type === "long_form_video" && a.publishStatus === "published").slice(0, 4);
  const newReleases = trending.slice(0, 6);

  return (
    <>
      <DataModeBanner />
      <Ticker items={ticker} />

      {/* ------------------------------------------------------------ LIVE NOW */}
      <section aria-labelledby="live-now" className="border-b border-ink-4">
        <div className="mx-auto grid max-w-[110rem] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <LiveBadge label="On air now" />
              <h1 id="live-now" className="eyebrow text-silver">RAP TRENDS TV</h1>
            </div>

            <Link href="/live" className="group block">
              <div className="relative overflow-hidden rounded-lg border border-ink-4">
                <ArtSurface
                  seed={current?.title ?? "RAP TRENDS TV"}
                  ratio="aspect-video"
                  label="Live channel preview"
                >
                  <div className="w-full">
                    <p className="eyebrow mb-1 text-blood">Now playing</p>
                    <p className="display-tight text-3xl text-bone sm:text-5xl">
                      {current?.title ?? "RAP TRENDS TV"}
                    </p>
                  </div>
                </ArtSurface>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-bone/60 bg-ink/60 text-2xl text-bone transition-transform group-hover:scale-110">
                    <span aria-hidden>▶</span>
                    <span className="sr-only">Watch RAP TRENDS TV live</span>
                  </span>
                </div>
              </div>
            </Link>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <p className="text-bone-dim">
                <span className="eyebrow mr-2 text-silver">Next</span>
                {next[0] ? `${fmtTime(next[0].startIso)} — ${next[0].title}` : "Schedule loading"}
              </p>
              <Link href="/schedule" className="text-sm text-volt-soft underline hover:text-bone">
                Full schedule
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <LiveBadge label="Radio" />
                <p className="eyebrow text-silver">RAP TRENDS RADIO</p>
              </div>
              <p className="display mt-3 text-2xl text-bone">{nowPlaying.title}</p>
              {nowPlaying.artist ? <p className="mt-1 text-sm text-bone-dim">{nowPlaying.artist}</p> : null}
              <p className="mt-3 text-xs text-silver">
                Continuous audio — music, hourly reports, interviews, and discovery. Use LISTEN LIVE
                at the bottom of the screen.
              </p>
              <Button href="/radio" tone="outline" size="sm" className="mt-4">Radio schedule</Button>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Bureaus" value={cities.length} sub="City reports in rotation" />
              <Stat label="Franchises" value={shows.length} sub="Original programmes" tone="volt" />
            </div>

            <Card className="p-4">
              <p className="eyebrow text-silver">Answering right now</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["What is happening in hip-hop right now?", "/news"],
                  ["Who is breaking next?", "/next-up"],
                  ["What should I watch?", "/shows"],
                  ["What should I listen to?", "/radio"],
                  ["What is happening in my city?", "/cities"],
                  ["How do I submit my music?", "/submit"],
                  ["How can my station carry RAP TRENDS?", "/partners"],
                  ["How can my brand advertise?", "/advertise"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="flex items-baseline gap-2 text-bone-dim hover:text-bone">
                      <span aria-hidden className="text-blood">→</span>
                      <span className="hover:underline">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- TRENDING 10 */}
      <section aria-labelledby="trending-10" className="mx-auto max-w-[110rem] px-4 py-12 sm:px-6">
        <SectionHeader
          id="trending-10"
          eyebrow="The RAP TRENDS Index"
          title="Trending 10"
          description="Ranked by a published, auditable model. Every position shows its confidence figure; expand a row on the full chart to see the signals behind it."
          action={<Button href="/trending" tone="outline" size="sm">Full chart & methodology</Button>}
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="overflow-hidden">
            {trending.slice(0, 10).map((entry) => (
              <ChartRow
                key={entry.id}
                entry={entry}
                artistSlug={ARTIST_BY_ID.get(entry.artistId)?.slug}
              />
            ))}
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <p className="eyebrow text-silver">How this chart is built</p>
              <p className="mt-2 text-sm leading-relaxed text-bone-dim">
                Fifteen signal types, each weighted and published. Records decay with age, emerging
                artists carry a documented adjustment, and every anomaly flag stays visible on the
                chart rather than being quietly removed.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-bone-dim">
                A signal from a source we are not licensed to use contributes nothing. It lowers the
                confidence figure instead of being filled in with a guess.
              </p>
              <Button href="/trending/methodology" tone="outline" size="sm" className="mt-4">
                Read the methodology
              </Button>
            </Card>
            <Card className="p-4">
              <p className="eyebrow text-silver">Editorial firewall</p>
              <p className="mt-2 text-sm leading-relaxed text-bone-dim">
                Chart position and editorial coverage cannot be purchased. Promotional products are
                sold, labelled as promotion, and kept away from every editorial decision.
              </p>
              <Link href="/legal/editorial-standards" className="mt-3 inline-block text-sm text-volt-soft underline hover:text-bone">
                Editorial standards
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ BREAKING IN HIP-HOP */}
      <section aria-labelledby="breaking" className="mx-auto max-w-[110rem] px-4 pb-12 sm:px-6">
        <SectionHeader
          id="breaking"
          eyebrow="Reported by the newsroom"
          title="Breaking in hip-hop"
          action={<Button href="/news" tone="outline" size="sm">All stories</Button>}
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {lead ? <ArticleCard article={lead} /> : null}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {secondary.map((a) => (
              <ArticleCard key={a.id} article={a} compact />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- WATCH */}
      <section aria-labelledby="watch" className="mx-auto max-w-[110rem] px-4 pb-12 sm:px-6">
        <SectionHeader
          id="watch"
          eyebrow="On demand"
          title="Watch"
          description="Full episodes, performances, and interviews. Every title carries its rating, caption status, and clean-version availability."
          action={<Button href="/videos" tone="outline" size="sm">Video library</Button>}
        />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {videoAssets.map((asset) => (
            <VideoCard key={asset.id} asset={asset} href={`/videos/${asset.id}`} />
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------------------- SHOWS */}
      <section aria-labelledby="shows" className="mx-auto max-w-[110rem] px-4 pb-12 sm:px-6">
        <SectionHeader
          id="shows"
          eyebrow="Programming"
          title="The franchises"
          action={<Button href="/shows" tone="outline" size="sm">All shows</Button>}
        />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shows.slice(0, 4).map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------- NEXT UP */}
      <section aria-labelledby="next-up" className="border-y border-ink-4 bg-ink-2">
        <div className="mx-auto max-w-[110rem] px-4 py-12 sm:px-6">
          <SectionHeader
            id="next-up"
            eyebrow="Emerging & independent"
            title="Next up"
            description="Selected by editorial review against verified performance data, scored on the emerging-artist profile. Placement is never for sale."
            action={<Button href="/next-up" tone="outline" size="sm">The full list</Button>}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="overflow-hidden">
              {nextUp.map((entry) => (
                <ChartRow key={entry.id} entry={entry} artistSlug={ARTIST_BY_ID.get(entry.artistId)?.slug} />
              ))}
            </Card>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
              {artists.filter((a) => a.nextUp).slice(0, 4).map((artist) => (
                <li key={artist.id} className="surface overflow-hidden rounded-lg">
                  <Link href={`/artists/${artist.slug}`}>
                    <ArtSurface seed={artist.name} ratio="aspect-square" />
                    <div className="p-2.5">
                      <p className="truncate text-sm font-semibold text-bone">{artist.name}</p>
                      <p className="text-xs text-silver">{artist.city}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- CITY REPORTS */}
      <section aria-labelledby="cities" className="mx-auto max-w-[110rem] px-4 py-12 sm:px-6">
        <SectionHeader
          id="cities"
          eyebrow="Thirteen bureaus"
          title="City reports"
          description="Correspondents and creators reporting from the cities that set the format's direction."
          action={<Button href="/cities" tone="outline" size="sm">All cities</Button>}
        />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities.slice(0, 4).map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </ul>
      </section>

      {/* -------------------------------------------------------- NEW RELEASES */}
      <section aria-labelledby="releases" className="mx-auto max-w-[110rem] px-4 pb-12 sm:px-6">
        <SectionHeader id="releases" eyebrow="The Drop" title="New releases" />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {newReleases.map((entry) => {
            const artist = ARTIST_BY_ID.get(entry.artistId);
            return (
              <li key={entry.id} className="surface overflow-hidden rounded-lg">
                <Link href={artist ? `/artists/${artist.slug}` : "/trending"}>
                  <ArtSurface seed={entry.title} ratio="aspect-square" />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-bone">{entry.title}</p>
                    <p className="truncate text-xs text-bone-dim">{entry.artistName}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------ PARTNER / SUBMIT */}
      <section aria-labelledby="work-with-us" className="mx-auto max-w-[110rem] px-4 pb-16 sm:px-6">
        <h2 id="work-with-us" className="sr-only">Work with RAP TRENDS</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="flex flex-col p-6">
            <Badge tone="good">Artists</Badge>
            <p className="display mt-3 text-3xl text-bone">Submit your music</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-bone-dim">
              Free and paid plans, both reviewed by the same editors against the same criteria.
              Upload rights documentation, set territories and licence windows, and track exactly
              where your record stands.
            </p>
            <Button href="/submit" className="mt-5 self-start">Start a submission</Button>
          </Card>

          <Card className="flex flex-col p-6">
            <Badge tone="volt">Stations & platforms</Badge>
            <p className="display mt-3 text-3xl text-bone">Carry the network</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-bone-dim">
              Full-time carriage, daypart blocks, and programme syndication for television and radio
              affiliates, plus FAST, CTV, cable, and OTA partnership material.
            </p>
            <Button href="/partners" tone="outline" className="mt-5 self-start">Distribution partners</Button>
          </Card>

          <Card className="flex flex-col p-6">
            <Badge tone="gold">Brands</Badge>
            <p className="display mt-3 text-3xl text-bone">Partner with RAP TRENDS</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-bone-dim">
              Franchise sponsorships from {fmtUsd(Math.min(...sponsors.map((s) => s.rateCardUsd)), true)}, branded
              production, local affiliate avails, and shoppable television.
            </p>
            <Button href="/advertise" tone="outline" className="mt-5 self-start">Advertise with us</Button>
          </Card>
        </div>
      </section>
    </>
  );
}
