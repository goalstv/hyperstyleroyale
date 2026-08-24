import Link from "next/link";
import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Notice, Stat, Table, Td, Th } from "@/components/ui";
import { getDriveSync } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { fmtDateTime } from "@/lib/format";
import { USER_BY_ID } from "@/data/users";

export const metadata = { title: "Drive ingestion" };

export default async function DrivePage() {
  const { allowed, user } = await requirePermission("media.read");
  if (!allowed) return <PermissionDenied permission="media.read" />;

  const records = await getDriveSync();
  const canManage = user.roles.includes("founder_admin") || user.roles.includes("editor_in_chief");
  const byStatus = (s: string) => records.filter((r) => r.status === s).length;

  return (
    <div>
      <OsHeader
        title="Google Drive ingestion"
        subtitle="Two watched folders, ARTICLES and VIDEOS. New files are detected, imported with their metadata, matched to related work, and routed to an editor. Nothing publishes on its own."
        actions={<Badge tone="good">Connected</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Files tracked" value={records.length} sub="Across both folders" />
        <Stat label="Imported" value={byStatus("imported")} sub="Assets created" tone="good" />
        <Stat label="Matched" value={byStatus("matched")} sub="Linked to a story or asset" tone="volt" />
        <Stat label="Duplicates skipped" value={byStatus("duplicate")} sub="Content hash matched" />
        <Stat label="Errors" value={byStatus("error")} sub="Retry scheduled" tone={byStatus("error") ? "warn" : "good"} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="eyebrow text-silver">Watched folders</p>
          <ul className="mt-3 space-y-3">
            {(["ARTICLES", "VIDEOS"] as const).map((folder) => (
              <li key={folder} className="flex items-center justify-between gap-3 rounded border border-ink-4 p-3">
                <div>
                  <p className="font-semibold text-bone">/{folder}</p>
                  <p className="text-xs text-silver">
                    {records.filter((r) => r.folder === folder).length} files tracked · original Drive links preserved
                  </p>
                </div>
                <Badge tone="good">Watching</Badge>
              </li>
            ))}
          </ul>
          {canManage ? (
            <p className="mt-4 text-xs text-silver">
              As {user.name} you can disconnect or reconnect either folder. Disconnecting stops
              detection; it never deletes anything already imported.
            </p>
          ) : (
            <p className="mt-4 text-xs text-silver">
              Connecting and disconnecting folders requires the editor-in-chief or network
              administrator role.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <p className="eyebrow text-silver">What the connector does on each sweep</p>
          <ol className="mt-3 space-y-2 text-sm text-bone-dim">
            <li><strong className="text-bone">1.</strong> Detect files added or changed since the last cursor.</li>
            <li><strong className="text-bone">2.</strong> Hash the content and skip anything already ingested.</li>
            <li><strong className="text-bone">3.</strong> Import file metadata and preserve the original Drive link.</li>
            <li><strong className="text-bone">4.</strong> Transcribe video and generate a draft transcript.</li>
            <li><strong className="text-bone">5.</strong> Match articles to related videos and vice versa.</li>
            <li><strong className="text-bone">6.</strong> Suggest a headline, summary, tags, SEO metadata, captions, and related artists.</li>
            <li><strong className="text-bone">7.</strong> Notify the appropriate editor and write to the sync log.</li>
          </ol>
          <p className="mt-4 text-xs text-amber">
            Automatic publishing is off. It can only be enabled by an authorized user, per folder,
            and the setting is recorded in the audit log.
          </p>
        </Card>
      </div>

      <Card className="mb-6 overflow-hidden">
        <Table caption="Google Drive synchronisation log">
          <thead>
            <tr><Th>File</Th><Th>Folder</Th><Th>Detected</Th><Th>Status</Th><Th>Routed to</Th><Th>Note</Th></tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-ink-3/50">
                <Td>
                  <span className="font-semibold text-bone">{r.fileName}</span>
                  <span className="mt-0.5 block text-xs text-silver">
                    <Link href={r.driveLink} className="underline hover:text-bone">Original in Drive</Link>
                    {" · "}{r.mimeType}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-xs">{r.folder}</Td>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(r.detectedIso)}</Td>
                <Td>
                  <Badge tone={r.status === "error" ? "bad" : r.status === "duplicate" ? "neutral" : r.status === "detected" ? "warn" : "good"}>
                    {r.status}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap text-xs">
                  {r.notifiedUserId ? USER_BY_ID.get(r.notifiedUserId)?.name ?? r.notifiedUserId : "—"}
                </Td>
                <Td className="text-xs">{r.message ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <section aria-labelledby="suggestions">
        <h2 id="suggestions" className="eyebrow mb-3 text-silver">AI suggestions awaiting an editor</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {records.filter((r) => r.aiSuggestions).map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-bone">{r.fileName}</p>
                <Badge tone="warn">Suggestion — not applied</Badge>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                {r.aiSuggestions?.headline ? (
                  <div><dt className="eyebrow text-silver">Headline</dt><dd className="text-bone-dim">{r.aiSuggestions.headline}</dd></div>
                ) : null}
                {r.aiSuggestions?.summary ? (
                  <div><dt className="eyebrow text-silver">Summary</dt><dd className="text-bone-dim">{r.aiSuggestions.summary}</dd></div>
                ) : null}
                {r.aiSuggestions?.tags ? (
                  <div>
                    <dt className="eyebrow text-silver">Tags</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">{r.aiSuggestions.tags.map((t) => <Badge key={t}>{t}</Badge>)}</dd>
                  </div>
                ) : null}
                {r.aiSuggestions?.artists ? (
                  <div>
                    <dt className="eyebrow text-silver">Artists detected</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">{r.aiSuggestions.artists.map((a) => <Badge key={a} tone="volt">{a}</Badge>)}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-4 text-xs text-silver">
                Suggestions are stored as suggestions. An editor accepts, edits, or rejects each one;
                nothing is written to the article or asset until they do.
              </p>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <Notice tone="volt" title="Integration status">
          This build models the connector&apos;s behaviour with a demonstration sync log. Connecting
          a real Drive requires a Google Cloud project, a service account with domain-wide delegation
          or a per-user OAuth grant, and the Drive Changes API for incremental detection — documented
          in <span className="text-bone">docs/09-media-workflow.md</span>.
        </Notice>
      </div>
    </div>
  );
}
