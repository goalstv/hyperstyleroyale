import type { Metadata } from "next";
import { getShows } from "@/lib/repo";
import { SectionHeader } from "@/components/ui";
import { ShowCard } from "@/components/cards";

export const metadata: Metadata = { title: "Shows", description: "The RAP TRENDS programming slate." };

export default async function ShowsPage() {
  const shows = await getShows();
  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Programming"
        title="Shows"
        description="Twelve content franchises anchor the network. Eight are in production for the launch slate; ARCHIVE, CULTURE MARKET, RAP TRENDS AWARDS, and the full RAP TRENDS RADIO strip follow in later phases."
      />
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shows.map((show) => <ShowCard key={show.id} show={show} />)}
      </ul>

      <section className="mt-16">
        <SectionHeader eyebrow="Roadmap" title="Franchises in development" />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["ARCHIVE", "Classic interviews, documentaries, performances, and regional histories. Blocked from launch until chain-of-title clearance completes on the catalogue."],
            ["CULTURE MARKET", "Fashion, sneakers, spirits, nightlife, technology, gaming, sports, art, and travel."],
            ["RAP TRENDS AWARDS", "An annual, data-informed celebration of music, cultural impact, entrepreneurship, and independent achievement."],
            ["THE BUSINESS — daily radio edition", "The music-business report, cut for the syndicated radio feed."],
          ].map(([title, blurb]) => (
            <li key={title} className="surface rounded-lg p-5">
              <p className="display text-2xl text-bone">{title}</p>
              <p className="mt-2 text-sm text-bone-dim">{blurb}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
