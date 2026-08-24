import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Field, KeyValue, Notice, Stat } from "@/components/ui";
import { getChannels, getHealthChecks, getNowAndNext, getNowPlaying } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { fmtTime } from "@/lib/format";
import { MasterControl } from "@/components/os/master-control";
import { SHOW_BY_ID } from "@/data/shows";

export const metadata = { title: "Channel origination" };

export default async function ChannelsPage() {
  const { allowed, user } = await requirePermission("channel.monitor");
  if (!allowed) return <PermissionDenied permission="channel.monitor" />;

  const [channels, { current, next }, health, radio] = await Promise.all([
    getChannels(), getNowAndNext(), getHealthChecks(), getNowPlaying(),
  ]);

  const canControl = user.roles.includes("master_control") || user.roles.includes("founder_admin");
  const feedHealth = health.filter((h) => h.area === "feeds");
  const show = current?.showId ? SHOW_BY_ID.get(current.showId) : undefined;

  return (
    <div>
      <OsHeader
        title="Channel origination"
        subtitle="Live-to-linear switching, branding, graphics, failover, and stream health across every channel the network originates."
        actions={canControl ? <Badge tone="live">Master-control access</Badge> : <Badge>Monitor only</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {feedHealth.map((h) => (
          <Stat
            key={h.id}
            label={h.label}
            value={h.value ?? h.status}
            sub={h.detail}
            tone={h.status === "ok" ? "good" : h.status === "warn" ? "warn" : "bad"}
          />
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="live-dot" aria-hidden />
              <p className="eyebrow text-blood">RAP TRENDS TV — on air</p>
            </div>
            <p className="display mt-2 text-3xl text-bone">{current?.title ?? "—"}</p>
            <p className="mt-1 text-sm text-bone-dim">
              {show?.pillar ?? "Programming"} · {show?.rating ?? "TV-14"} ·{" "}
              {current ? `started ${fmtTime(current.startIso)}` : "—"}
            </p>
            <div className="mt-4 border-t border-ink-4 pt-3">
              <p className="eyebrow mb-2 text-silver">Coming up</p>
              <ol className="space-y-1.5">
                {next.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex gap-3 text-sm">
                    <span className="num w-16 shrink-0 text-silver">{fmtTime(item.startIso)}</span>
                    <span className="truncate text-bone-dim">{item.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <MasterControl canControl={canControl} currentTitle={current?.title ?? "RAP TRENDS TV"} />
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <span className="live-dot" aria-hidden />
            <p className="eyebrow text-blood">RAP TRENDS RADIO — on air</p>
          </div>
          <p className="display mt-2 text-2xl text-bone">{radio.title}</p>
          {radio.artist ? <p className="mt-1 text-sm text-bone-dim">{radio.artist}</p> : null}
          <div className="mt-4">
            <KeyValue>
              <Field label="Segment type">{radio.kind.replace("_", " ")}</Field>
              <Field label="Explicit">{radio.explicit ? "Yes — digital feed only" : "No"}</Field>
              <Field label="Clean available">{radio.cleanAvailable ? "Yes" : "No"}</Field>
              <Field label="Affiliate feed">Clean, with legal-ID and local windows</Field>
            </KeyValue>
          </div>
        </Card>
      </div>

      <section aria-labelledby="channels" className="mb-8">
        <h2 id="channels" className="eyebrow mb-3 text-silver">Channels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="display text-xl text-bone">{c.name}</p>
                <Badge tone={c.status === "on_air" ? "good" : c.status === "standby" ? "warn" : "neutral"}>
                  {c.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-bone-dim">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.feedVariants.map((v) => (
                  <Badge key={v} tone={v === "clean" ? "good" : "warn"}>{v} feed</Badge>
                ))}
              </div>
              <p className="mt-3 text-xs text-silver">
                Originates to: {c.platforms.map((p) => p.replace("_", " ")).join(", ")}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <div>
        <Notice tone="volt" title="Vendor boundary">
          RAP TRENDS OS supervises origination: it decides what plays, validates that it may play,
          drives the branding and graphics, and monitors the result. The encoding and playout itself
          runs on a third-party provider — Amagi or comparable — behind an adapter interface, so the
          vendor can be replaced without rebuilding the control layer. See{" "}
          <span className="text-bone">docs/10-distribution-architecture.md</span>.
        </Notice>
      </div>
    </div>
  );
}
