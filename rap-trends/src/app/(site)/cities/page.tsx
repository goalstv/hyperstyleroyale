import type { Metadata } from "next";
import { getCities } from "@/lib/repo";
import { SectionHeader } from "@/components/ui";
import { CityCard } from "@/components/cards";

export const metadata: Metadata = { title: "City reports", description: "RAP TRENDS bureaus across thirteen cities." };

export default async function CitiesPage() {
  const cities = await getCities();
  const regions = [...new Set(cities.map((c) => c.region))];

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="CITY REPORT"
        title="The bureaus"
        description="Correspondents and creators reporting from the cities that set the direction of the format. Each bureau feeds the nightly CITY REPORT, the regional editions of the Index, and the local-affiliate strategy."
      />
      {regions.map((region) => (
        <section key={region} aria-labelledby={`region-${region}`} className="mt-10">
          <h2 id={`region-${region}`} className="eyebrow mb-4 text-silver">{region}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cities.filter((c) => c.region === region).map((c) => <CityCard key={c.id} city={c} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}
