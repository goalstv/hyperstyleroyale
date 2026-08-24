import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, getPublishedArticles } from "@/lib/repo";
import { Badge, Card, Notice } from "@/components/ui";
import { ArtSurface } from "@/components/cards";
import { fmtDateTime } from "@/lib/format";
import { ARTIST_BY_ID } from "@/data/artists";
import { CITY_BY_ID } from "@/data/cities";
import { ASSET_BY_ID } from "@/data/media";

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Story not found" };
  return {
    title: article.seo.title || article.headline,
    description: article.seo.description || article.dek,
    openGraph: { title: article.headline, description: article.dek, type: "article" },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || (article.state !== "published" && article.state !== "updated")) notFound();

  const artists = article.artistIds.map((id) => ARTIST_BY_ID.get(id)).filter(Boolean);
  const cities = article.cityIds.map((id) => CITY_BY_ID.get(id)).filter(Boolean);
  const related = article.relatedAssetIds.map((id) => ASSET_BY_ID.get(id)).filter(Boolean);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow text-blood">{article.pillar}</span>
            {article.breaking ? <Badge tone="live">Breaking</Badge> : null}
            <Badge tone="warn">Demonstration story</Badge>
          </div>

          <h1 className="display mt-3 text-4xl leading-[0.95] text-bone sm:text-6xl">{article.headline}</h1>
          <p className="mt-4 text-xl leading-relaxed text-bone-dim">{article.dek}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-ink-4 py-3 text-sm text-silver">
            <span className="text-bone">{article.authorName}</span>
            <span aria-hidden>·</span>
            <span>{article.publishedIso ? fmtDateTime(article.publishedIso) : "Unpublished"}</span>
            <span aria-hidden>·</span>
            <span>{article.readMinutes} min read</span>
            {article.factCheck.status === "cleared" ? (
              <>
                <span aria-hidden>·</span>
                <Badge tone="good">Fact-checked</Badge>
              </>
            ) : null}
          </div>

          <ArtSurface seed={article.headline.slice(0, 28)} className="mt-6 rounded-lg" label="Story artwork placeholder" />

          <div className="mt-8 space-y-5 text-lg leading-relaxed text-bone-dim">
            {article.body.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {article.corrections.length > 0 ? (
            <div className="mt-8">
              <Notice tone="warn" title="Corrections">
                <ul className="space-y-2">
                  {article.corrections.map((c) => (
                    <li key={c.iso}>
                      <span className="text-bone">{fmtDateTime(c.iso)}</span> — {c.note}
                    </li>
                  ))}
                </ul>
              </Notice>
            </div>
          ) : null}

          <div className="mt-8">
            <h2 className="eyebrow mb-3 text-silver">Sources</h2>
            <ul className="space-y-2 text-sm text-bone-dim">
              {article.sources.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span aria-hidden className="text-silver">·</span>
                  <span>
                    {s.url ? (
                      <Link href={s.url} className="text-volt-soft underline hover:text-bone">{s.label}</Link>
                    ) : (
                      s.label
                    )}
                    {s.verifiedBy ? <span className="ml-2 text-xs text-silver">(verified in fact check)</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          {artists.length > 0 ? (
            <Card className="p-4">
              <p className="eyebrow mb-2 text-silver">Artists in this story</p>
              <ul className="space-y-1.5">
                {artists.map((a) => (
                  <li key={a!.id}>
                    <Link href={`/artists/${a!.slug}`} className="text-sm text-volt-soft underline hover:text-bone">
                      {a!.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {cities.length > 0 ? (
            <Card className="p-4">
              <p className="eyebrow mb-2 text-silver">Cities</p>
              <ul className="space-y-1.5">
                {cities.map((c) => (
                  <li key={c!.id}>
                    <Link href={`/cities/${c!.slug}`} className="text-sm text-volt-soft underline hover:text-bone">
                      {c!.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {related.length > 0 ? (
            <Card className="p-4">
              <p className="eyebrow mb-2 text-silver">Related video</p>
              <ul className="space-y-1.5">
                {related.map((r) => (
                  <li key={r!.id}>
                    <Link href={`/videos/${r!.id}`} className="text-sm text-volt-soft underline hover:text-bone">
                      {r!.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          </Card>
        </aside>
      </div>
    </article>
  );
}
