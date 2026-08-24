import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/repo";
import { SectionHeader } from "@/components/ui";
import { ArticleCard } from "@/components/cards";

export const metadata: Metadata = { title: "News", description: "Reporting from the RAP TRENDS newsroom." };

export default async function NewsPage() {
  const articles = await getPublishedArticles();
  const [lead, ...rest] = articles;
  const pillars = [...new Set(articles.map((a) => a.pillar))];

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="The newsroom"
        title="News"
        description="Reported, edited, fact-checked, and corrected in public. Every story carries its author, its sources, and any correction applied after publication."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {lead ? <ArticleCard article={lead} /> : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {rest.slice(0, 3).map((a) => <ArticleCard key={a.id} article={a} compact />)}
        </div>
      </div>

      {pillars.map((pillar) => {
        const list = articles.filter((a) => a.pillar === pillar);
        if (list.length === 0) return null;
        return (
          <section key={pillar} className="mt-12">
            <h2 className="eyebrow mb-4 border-b border-ink-4 pb-2 text-blood">{pillar}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((a) => <ArticleCard key={a.id} article={a} compact />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
