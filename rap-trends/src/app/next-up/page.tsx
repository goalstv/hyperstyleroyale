import type { Metadata } from "next";
import { getNextUpArtists, getNextUpChart } from "@/lib/repo";
import { Button, Card, Notice, SectionHeader } from "@/components/ui";
import { ArtistCard } from "@/components/cards";
import { ChartRow } from "@/components/chart-widgets";
import { ARTIST_BY_ID } from "@/data/artists";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Next Up",
  description: "Emerging and independent artists, selected by editorial review against verified performance data.",
};

export default async function NextUpPage() {
  const [entries, artists] = await Promise.all([getNextUpChart(), getNextUpArtists()]);

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <p className="eyebrow text-neon">Emerging & independent</p>
      <h1 className="display mt-2 text-6xl text-bone sm:text-7xl">Next Up</h1>
      <p className="mt-4 max-w-3xl text-lg text-bone-dim">
        The artists we think are about to matter. Selection is editorial, informed by verified
        performance data and scored on a published emerging-artist profile that deliberately
        discounts raw volume in favour of momentum, geography, and engagement quality.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div>
          <SectionHeader eyebrow="The emerging edition" title="This week" description="Scored on profile profile_emerging_v2. Expand a row for the signals." />
          <Card className="mt-5 overflow-hidden">
            {entries.map((e) => (
              <ChartRow key={e.id} entry={e} expandable artistSlug={ARTIST_BY_ID.get(e.artistId)?.slug} />
            ))}
          </Card>
        </div>

        <aside className="space-y-4">
          <Notice tone="good" title="Placement is never for sale">
            No submission plan, sponsorship, or advertising relationship can put an artist on NEXT
            UP. Paid promotional products exist, they are labelled as promotion wherever they
            appear, and they are structurally separated from this selection.
          </Notice>
          <Card className="p-4">
            <p className="eyebrow text-silver">How selection works</p>
            <ol className="mt-3 space-y-2 text-sm text-bone-dim">
              <li><strong className="text-bone">1.</strong> Submissions and editorial nominations enter one queue.</li>
              <li><strong className="text-bone">2.</strong> At least three editors listen and score independently.</li>
              <li><strong className="text-bone">3.</strong> Verified performance data is checked against the editorial score.</li>
              <li><strong className="text-bone">4.</strong> Rights and metadata are confirmed before anything is scheduled.</li>
              <li><strong className="text-bone">5.</strong> The selection, and the reason for it, is logged.</li>
            </ol>
          </Card>
          <Button href="/submit" className="w-full">Apply for NEXT UP</Button>
        </aside>
      </div>

      <section className="mt-14">
        <SectionHeader eyebrow="On the list" title="Artists in the NEXT UP pool" />
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8">
          {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
        </ul>
      </section>
    </div>
  );
}
