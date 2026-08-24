import Link from "next/link";
import type { Artist, Article, City, MediaAsset, Show } from "@/lib/types";
import { Badge, Card, ProvenanceTag } from "./ui";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { formatDuration } from "@/lib/schedule";

/** Cinematic placeholder surface. No unlicensed imagery is used anywhere. */
export function ArtSurface({
  seed, label, ratio = "aspect-video", color, className = "", children,
}: {
  seed: string; label?: string; ratio?: string; color?: string; className?: string; children?: React.ReactNode;
}) {
  // Deterministic hue from the seed so a given artist or show always looks the same.
  const hash = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  const base = color ?? `hsl(${hash} 55% 22%)`;
  const accent = `hsl(${(hash + 40) % 360} 70% 42%)`;
  return (
    <div
      className={`scan grain relative overflow-hidden ${ratio} ${className}`}
      style={{ background: `radial-gradient(120% 120% at 20% 10%, ${accent}33 0%, ${base} 45%, #050506 100%)` }}
      role="img"
      aria-label={label ?? `Placeholder artwork for ${seed}`}
    >
      <div className="absolute inset-0 flex items-end p-3">
        {children ?? (
          <span className="display text-lg leading-none text-bone/60">{seed}</span>
        )}
      </div>
    </div>
  );
}

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Card as="li" className="overflow-hidden transition-colors hover:border-silver">
      <Link href={`/artists/${artist.slug}`} className="block">
        <ArtSurface seed={artist.name} ratio="aspect-[4/5]" label={`${artist.name} — placeholder portrait`} />
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="display truncate text-lg text-bone">{artist.name}</p>
            {artist.verified ? <Badge tone="volt">Verified</Badge> : null}
          </div>
          <p className="mt-1 text-xs text-bone-dim">
            {artist.city} · {artist.tier === "established" ? "Established" : artist.tier === "rising" ? "Rising" : "Independent"}
          </p>
          {artist.nextUp ? <Badge tone="good" className="mt-2">NEXT UP</Badge> : null}
        </div>
      </Link>
    </Card>
  );
}

export function ShowCard({ show }: { show: Show }) {
  return (
    <Card as="li" className="overflow-hidden transition-colors hover:border-silver">
      <Link href={`/shows/${show.slug}`} className="block">
        <ArtSurface seed={show.title} color={`${show.artColor}22`} label={`${show.title} — title card`}>
          <div>
            <p className="eyebrow text-bone/70">{show.format}</p>
            <p className="display text-2xl leading-none text-bone">{show.title}</p>
          </div>
        </ArtSurface>
        <div className="p-3">
          <p className="text-xs text-bone-dim">{show.cadence}</p>
          <p className="mt-1.5 line-clamp-2 text-sm text-bone-dim">{show.synopsis}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{show.rating}</Badge>
            <Badge>{show.runtimeMinutes} min</Badge>
            {show.hasCleanVersion ? <Badge tone="good">Clean feed</Badge> : null}
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <Card as="article" className="overflow-hidden transition-colors hover:border-silver">
      <Link href={`/news/${article.slug}`} className="block">
        {compact ? null : <ArtSurface seed={article.headline.slice(0, 28)} label="Story artwork placeholder" />}
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow text-blood">{article.pillar}</span>
            {article.breaking ? <Badge tone="live">Breaking</Badge> : null}
          </div>
          <h3 className={`display mt-2 text-bone ${compact ? "text-lg" : "text-xl"}`}>{article.headline}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-bone-dim">{article.dek}</p>
          <p className="mt-3 text-xs text-silver">
            {article.authorName} · {article.publishedIso ? fmtDate(article.publishedIso) : "Unpublished"} ·{" "}
            {article.readMinutes} min read
          </p>
        </div>
      </Link>
    </Card>
  );
}

export function CityCard({ city }: { city: City }) {
  return (
    <Card as="li" className="overflow-hidden transition-colors hover:border-silver">
      <Link href={`/cities/${city.slug}`} className="block">
        <ArtSurface seed={city.name} ratio="aspect-[3/2]" label={`${city.name} bureau`}>
          <div>
            <p className="eyebrow text-bone/70">{city.country}</p>
            <p className="display text-2xl leading-none text-bone">{city.name}</p>
          </div>
        </ArtSurface>
        <div className="p-3">
          <p className="line-clamp-2 text-sm text-bone-dim">{city.blurb}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {city.scenes.slice(0, 3).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function VideoCard({ asset, href }: { asset: MediaAsset; href: string }) {
  return (
    <Card as="li" className="overflow-hidden transition-colors hover:border-silver">
      <Link href={href} className="block">
        <div className="relative">
          <ArtSurface
            seed={asset.title.slice(0, 30)}
            ratio={asset.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"}
            label={`${asset.title} — thumbnail placeholder`}
          />
          <span className="num absolute bottom-2 right-2 rounded bg-ink/85 px-1.5 py-0.5 text-xs text-bone">
            {formatDuration(asset.durationSeconds)}
          </span>
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-semibold text-bone">{asset.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge>{asset.rating}</Badge>
            {asset.explicit ? <Badge tone="warn">Explicit</Badge> : <Badge tone="good">Clean</Badge>}
            {asset.captionStatus === "human_reviewed" ? <Badge tone="good">CC</Badge> : <Badge tone="warn">No CC</Badge>}
          </div>
          <p className="mt-2 text-xs text-silver">{fmtDateTime(asset.createdIso)}</p>
        </div>
      </Link>
    </Card>
  );
}

export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs text-silver">
      <ProvenanceTag provenance="demo" />
      <span className="pt-0.5">{children}</span>
    </p>
  );
}
