import type { Metadata } from "next";
import { getArtists } from "@/lib/repo";
import { SectionHeader, Badge } from "@/components/ui";
import { ArtistCard } from "@/components/cards";

export const metadata: Metadata = { title: "Artists", description: "Artist profiles across the RAP TRENDS network." };

export default async function ArtistsPage() {
  const artists = await getArtists();
  const groups = [
    { tier: "established" as const, label: "Established" },
    { tier: "rising" as const, label: "Rising" },
    { tier: "independent" as const, label: "Independent" },
  ];

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Profiles"
        title="Artists"
        description="Verified profiles, signal breakdowns, and airtime history. Every artist here can claim their profile through the artist portal."
        action={<Badge tone="warn">{artists.length} demonstration profiles</Badge>}
      />
      {groups.map((g) => {
        const list = artists.filter((a) => a.tier === g.tier);
        if (list.length === 0) return null;
        return (
          <section key={g.tier} aria-labelledby={`tier-${g.tier}`} className="mt-10">
            <h2 id={`tier-${g.tier}`} className="eyebrow mb-4 text-silver">
              {g.label} — {list.length}
            </h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              {list.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
