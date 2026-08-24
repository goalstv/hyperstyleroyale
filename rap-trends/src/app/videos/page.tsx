import type { Metadata } from "next";
import { getAssets } from "@/lib/repo";
import { SectionHeader, Badge } from "@/components/ui";
import { VideoCard } from "@/components/cards";

export const metadata: Metadata = { title: "Video library", description: "Episodes, performances, interviews, and clips." };

const GROUPS: { type: string; label: string }[] = [
  { type: "long_form_video", label: "Full episodes" },
  { type: "performance", label: "Performances" },
  { type: "interview", label: "Interviews" },
  { type: "music_video", label: "Music video" },
  { type: "short_form_video", label: "Clips" },
];

export default async function VideosPage() {
  const assets = await getAssets();
  const published = assets.filter((a) => a.publishStatus === "published");

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="On demand"
        title="Video library"
        description="Every title shows its rating, caption status, and whether a clean version exists — the same metadata the distribution system uses to decide where it can go."
        action={<Badge tone="warn">{published.length} demonstration assets</Badge>}
      />
      {GROUPS.map((g) => {
        const list = published.filter((a) => a.type === g.type);
        if (list.length === 0) return null;
        return (
          <section key={g.type} aria-labelledby={`vg-${g.type}`} className="mt-10">
            <h2 id={`vg-${g.type}`} className="eyebrow mb-4 text-silver">{g.label} — {list.length}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {list.map((a) => <VideoCard key={a.id} asset={a} href={`/videos/${a.id}`} />)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
