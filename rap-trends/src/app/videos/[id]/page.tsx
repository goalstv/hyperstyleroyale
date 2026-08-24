import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAsset, getAssets, getRightsForAsset } from "@/lib/repo";
import { Badge, Card, Field, KeyValue, Notice, SectionHeader } from "@/components/ui";
import { ArtSurface, VideoCard } from "@/components/cards";
import { formatDuration } from "@/lib/schedule";
import { fmtDateTime } from "@/lib/format";
import { ARTIST_BY_ID } from "@/data/artists";
import { SHOW_BY_ID } from "@/data/shows";
import { checkEligibility } from "@/lib/rights";
import { nowIso } from "@/lib/clock";

export async function generateStaticParams() {
  const assets = await getAssets();
  return assets.filter((a) => a.publishStatus === "published").map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const asset = await getAsset(id);
  return asset ? { title: asset.title, description: asset.description } : { title: "Video not found" };
}

export const dynamic = "force-dynamic";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset || asset.publishStatus !== "published") notFound();

  const [rights, all] = await Promise.all([getRightsForAsset(asset.id), getAssets()]);
  const eligibility = checkEligibility({ asset, window: rights, platform: "web", territory: "US", atIso: nowIso() });
  const artist = asset.artistId ? ARTIST_BY_ID.get(asset.artistId) : undefined;
  const show = asset.showId ? SHOW_BY_ID.get(asset.showId) : undefined;
  const more = all
    .filter((a) => a.id !== asset.id && a.publishStatus === "published" && (a.showId === asset.showId || a.artistId === asset.artistId))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[2.2fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-lg border border-ink-4">
            <ArtSurface
              seed={asset.title.slice(0, 30)}
              ratio={asset.aspectRatio === "9:16" ? "aspect-[9/16] max-h-[70vh]" : "aspect-video"}
              label={`${asset.title} — player slate`}
            >
              <div>
                <p className="eyebrow text-blood">{show?.title ?? asset.type.replace(/_/g, " ")}</p>
                <p className="display text-2xl text-bone">{asset.title}</p>
              </div>
            </ArtSurface>
          </div>

          <h1 className="display mt-5 text-3xl text-bone sm:text-4xl">{asset.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{formatDuration(asset.durationSeconds)}</Badge>
            <Badge>{asset.rating}</Badge>
            <Badge>{asset.resolution}</Badge>
            {asset.explicit ? <Badge tone="warn">Explicit</Badge> : <Badge tone="good">Clean</Badge>}
            {asset.captionStatus === "human_reviewed" ? <Badge tone="good">Captions reviewed</Badge> : <Badge tone="warn">Captions unreviewed</Badge>}
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-bone-dim">{asset.description}</p>

          {artist ? (
            <p className="mt-3 text-sm">
              <Link href={`/artists/${artist.slug}`} className="text-volt-soft underline hover:text-bone">{artist.name}</Link>
            </p>
          ) : null}

          {more.length > 0 ? (
            <section className="mt-12">
              <SectionHeader eyebrow="More" title="Related" />
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {more.map((a) => <VideoCard key={a.id} asset={a} href={`/videos/${a.id}`} />)}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Technical</p>
            <KeyValue>
              <Field label="Type">{asset.type.replace(/_/g, " ")}</Field>
              <Field label="Duration">{formatDuration(asset.durationSeconds)}</Field>
              <Field label="Resolution">{asset.resolution}</Field>
              <Field label="Aspect">{asset.aspectRatio}</Field>
              <Field label="Audio">{asset.audioFormat}</Field>
              {asset.loudnessLufs !== undefined ? <Field label="Loudness">{asset.loudnessLufs} LKFS</Field> : null}
              <Field label="QC">{asset.qcStatus}</Field>
              <Field label="Ingested">{fmtDateTime(asset.createdIso)}</Field>
            </KeyValue>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Rights</p>
            {rights ? (
              <>
                <KeyValue>
                  <Field label="Owner">{rights.rightsOwner}</Field>
                  <Field label="Territories">{rights.territories.join(", ")}</Field>
                  <Field label="Window">
                    {rights.startIso.slice(0, 10)} → {rights.endIso ? rights.endIso.slice(0, 10) : "open"}
                  </Field>
                  <Field label="Platforms">{rights.platforms.length} authorized</Field>
                </KeyValue>
                <p className="mt-3 text-xs text-silver">{rights.notes}</p>
              </>
            ) : (
              <p className="text-sm text-blood">No rights record on file. Delivery is blocked.</p>
            )}
          </Card>

          <Notice tone={eligibility.eligible ? "good" : "warn"} title="Web delivery check">
            {eligibility.eligible ? (
              <p>Cleared for web delivery in the United States as of now.</p>
            ) : (
              <ul className="space-y-1">
                {eligibility.blockers.map((b) => <li key={b}>· {b}</li>)}
              </ul>
            )}
            {eligibility.warnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-amber">
                {eligibility.warnings.map((w) => <li key={w}>· {w}</li>)}
              </ul>
            ) : null}
          </Notice>
        </aside>
      </div>
    </div>
  );
}
