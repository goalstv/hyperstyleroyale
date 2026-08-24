import Link from "next/link";
import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Field, KeyValue, Notice, Stat, Table, Td, Th } from "@/components/ui";
import { getAssets, getRightsWindows } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { formatDuration } from "@/lib/schedule";
import { fmtDateTime } from "@/lib/format";
import { RIGHTS_BY_ASSET } from "@/data/media";

export const metadata = { title: "Media library" };

const PREP_STEPS = [
  ["File validation", "Container, codec, frame rate, and audio configuration checked against the ingest profile before anything else runs."],
  ["Transcoding", "Mezzanine master to the delivery ladder; six renditions to 1080p, HEVC on request."],
  ["Proxy creation", "Low-bitrate proxy for editorial review and clipping, generated first so producers are not waiting on the full ladder."],
  ["Thumbnails", "Scene-change detection produces candidates; a human picks the one that ships."],
  ["Captions", "AI draft, then human review. An unreviewed draft is blocked from every captioned platform."],
  ["Transcripts", "Full transcript with speaker separation, feeding search, chapters, and clip suggestions."],
  ["Loudness normalization", "Broadcast-safe audio at -24 LKFS, CALM Act compliant."],
  ["Derivatives", "Vertical 9:16, square 1:1, and horizontal cuts for social and app surfaces."],
  ["Clip recommendations", "AI proposes moments; a producer approves, trims, and captions before anything publishes."],
  ["Branding", "Intro, outro, bug, and watermark application per channel and per destination."],
  ["Quality control", "Automated QC report — black frames, silence, loudness, caption timing, aspect errors."],
  ["Version management", "Clean and explicit variants linked to each other so the rights gate can find the right one."],
];

export default async function MediaPage() {
  const { allowed } = await requirePermission("media.read");
  if (!allowed) return <PermissionDenied permission="media.read" />;

  const [assets, rights] = await Promise.all([getAssets(), getRightsWindows()]);
  const noRights = assets.filter((a) => !RIGHTS_BY_ASSET.has(a.id));
  const unreviewedCaptions = assets.filter((a) => a.captionStatus === "auto_draft" || a.captionStatus === "none");
  const pendingQc = assets.filter((a) => a.qcStatus === "pending" || a.qcStatus === "failed");

  return (
    <div>
      <OsHeader
        title="Media library"
        subtitle="Every asset the network holds, with the metadata that decides where it can go. Search, filter, and inspect; the rights gate reads the same records."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Assets" value={assets.length} sub="All types" />
        <Stat label="Rights records" value={rights.length} sub={`${noRights.length} asset(s) with none`} tone={noRights.length ? "warn" : "good"} />
        <Stat label="Captions outstanding" value={unreviewedCaptions.length} sub="Blocked from captioned platforms" tone={unreviewedCaptions.length ? "warn" : "good"} />
        <Stat label="QC open" value={pendingQc.length} sub="Pending or failed" tone={pendingQc.length ? "warn" : "good"} />
      </div>

      {noRights.length > 0 ? (
        <div className="mb-6">
          <Notice tone="warn" title="Assets with no rights record">
            <ul className="space-y-1">
              {noRights.map((a) => (
                <li key={a.id}>· <span className="text-bone">{a.title}</span> — cannot be scheduled, delivered, or published until a rights record exists.</li>
              ))}
            </ul>
            <Link href="/os/rights" className="mt-3 inline-block underline hover:text-bone">
              Open rights &amp; compliance
            </Link>
          </Notice>
        </div>
      ) : null}

      <Card className="mb-10 overflow-hidden">
        <Table caption="Media asset catalogue">
          <thead>
            <tr>
              <Th>Asset</Th><Th>Type</Th><Th>Duration</Th><Th>Rating</Th>
              <Th>Version</Th><Th>Captions</Th><Th>QC</Th><Th>Status</Th><Th>Rights</Th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => {
              const r = RIGHTS_BY_ASSET.get(a.id);
              return (
                <tr key={a.id} id={a.id} className="hover:bg-ink-3/50">
                  <Td>
                    <span className="font-semibold text-bone">{a.title}</span>
                    <span className="mt-0.5 block text-xs text-silver">
                      {a.resolution} · {a.aspectRatio}
                      {a.sourceRef ? ` · from ${a.sourceRef.kind.replace("_", " ")}` : ""}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-xs capitalize">{a.type.replace(/_/g, " ")}</Td>
                  <Td className="num whitespace-nowrap">{formatDuration(a.durationSeconds)}</Td>
                  <Td className="whitespace-nowrap">{a.rating}</Td>
                  <Td>
                    {a.explicit ? (
                      <Badge tone={a.cleanVersionAssetId ? "warn" : "bad"}>
                        {a.cleanVersionAssetId ? "Explicit + clean" : "Explicit only"}
                      </Badge>
                    ) : (
                      <Badge tone="good">Clean</Badge>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={a.captionStatus === "human_reviewed" || a.captionStatus === "delivered" ? "good" : a.captionStatus === "auto_draft" ? "warn" : "bad"}>
                      {a.captionStatus.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={a.qcStatus === "passed" ? "good" : a.qcStatus === "failed" ? "bad" : "warn"}>{a.qcStatus}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-xs capitalize">{a.publishStatus.replace(/_/g, " ")}</Td>
                  <Td>
                    {r ? (
                      <Badge tone="good">On file</Badge>
                    ) : (
                      <Badge tone="bad">Missing</Badge>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <section aria-labelledby="prep" className="mb-10">
        <h2 id="prep" className="eyebrow mb-3 text-silver">Media preparation pipeline</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PREP_STEPS.map(([title, body], i) => (
            <Card key={title} className="p-4">
              <p className="num text-xs text-silver">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 font-semibold text-bone">{title}</p>
              <p className="mt-1.5 text-sm text-bone-dim">{body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-5">
          <Notice tone="volt" title="Every AI step is reviewable">
            Captions, transcripts, chapters, metadata tags, clip suggestions, and summaries are all
            produced as drafts. Nothing generated reaches air or publication without a person
            approving it, and the rights gate enforces that for captions specifically.
          </Notice>
        </div>
      </section>

      <section aria-labelledby="ingest">
        <h2 id="ingest" className="eyebrow mb-3 text-silver">Ingest specification</h2>
        <Card className="p-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <KeyValue>
              <Field label="Mezzanine">ProRes 422 HQ or DNxHR HQX, 1080p or 2160p</Field>
              <Field label="Container">MOV or MXF (OP1a)</Field>
              <Field label="Frame rate">23.976, 29.97, or 59.94 — constant, not variable</Field>
              <Field label="Audio">48 kHz, 24-bit, stereo or 5.1 with fold-down</Field>
            </KeyValue>
            <KeyValue>
              <Field label="Loudness target">-24 LKFS ±2, true peak ≤ -2 dBTP</Field>
              <Field label="Captions">SCC, SRT, or embedded 608/708</Field>
              <Field label="Delivery">Google Drive, direct upload, or watch folder</Field>
              <Field label="Naming">Show / season / episode, or artist / title / version</Field>
            </KeyValue>
          </div>
        </Card>
      </section>
    </div>
  );
}
