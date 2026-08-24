import Link from "next/link";
import { notFound } from "next/navigation";
import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Field, KeyValue, Notice, Table, Td, Th } from "@/components/ui";
import { getArticleById } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { STATE_LABELS, canTransition, nextStates, progressPercent } from "@/lib/workflow";
import { WorkflowActions } from "@/components/os/workflow-actions";
import { fmtDateTime } from "@/lib/format";
import { USER_BY_ID } from "@/data/users";
import { ARTIST_BY_ID } from "@/data/artists";
import { CITY_BY_ID } from "@/data/cities";
import { ASSET_BY_ID } from "@/data/media";
import type { ArticleState } from "@/lib/types";

export const metadata = { title: "Story" };

const ALL_STATES: ArticleState[] = [
  "idea", "assigned", "drafting", "editing", "fact_check", "approved",
  "scheduled", "published", "updated", "archived",
];

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { allowed, user } = await requirePermission("newsroom.read");
  if (!allowed) return <PermissionDenied permission="newsroom.read" />;

  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const available = nextStates(article, user.roles);
  // Show every transition and why the blocked ones are blocked — an editor should
  // never have to guess what a greyed-out button wants from them.
  const evaluated = ALL_STATES.filter((s) => s !== article.state).map((state) => ({
    state,
    ...canTransition(article, state, user.roles),
  }));

  return (
    <div>
      <OsHeader
        title={article.headline}
        subtitle={`${article.pillar} · ${article.authorName} · ${article.readMinutes} min read`}
        actions={
          <>
            <Badge tone={article.state === "published" ? "good" : "volt"}>{STATE_LABELS[article.state]}</Badge>
            {article.breaking ? <Badge tone="live">Breaking</Badge> : null}
          </>
        }
      />

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded bg-ink-4">
            <div className="h-full bg-volt" style={{ width: `${progressPercent(article.state)}%` }} />
          </div>
          <span className="num text-xs text-silver">{progressPercent(article.state)}%</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <p className="eyebrow mb-2 text-silver">Dek</p>
            <p className="text-lg text-bone-dim">{article.dek}</p>
            <p className="eyebrow mb-2 mt-6 text-silver">Body</p>
            <div className="space-y-4 text-sm leading-relaxed text-bone-dim">
              {article.body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </Card>

          <Card className="p-5">
            <p className="eyebrow mb-3 text-silver">Fact check</p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={article.factCheck.status === "cleared" ? "good" : article.factCheck.status === "in_progress" ? "warn" : "neutral"}>
                {article.factCheck.status.replace("_", " ")}
              </Badge>
              {article.factCheck.checkedBy ? (
                <span className="text-sm text-bone-dim">
                  {USER_BY_ID.get(article.factCheck.checkedBy)?.name ?? article.factCheck.checkedBy}
                </span>
              ) : null}
            </div>
            {article.factCheck.notes ? <p className="mt-3 text-sm text-bone-dim">{article.factCheck.notes}</p> : null}

            <p className="eyebrow mb-2 mt-5 text-silver">Source citations</p>
            {article.sources.length === 0 ? (
              <p className="text-sm text-blood">
                No sources cited. This story cannot be approved until at least one is recorded.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm text-bone-dim">
                {article.sources.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="text-silver">·</span>
                    <span>
                      {s.label}
                      {s.verifiedBy ? <span className="ml-2 text-xs text-neon">verified</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <p className="eyebrow mb-3 text-silver">Workflow</p>
            <WorkflowActions
              current={STATE_LABELS[article.state]}
              options={evaluated.map((e) => ({
                state: e.state,
                label: STATE_LABELS[e.state],
                allowed: available.includes(e.state),
                reason: e.reason,
              }))}
            />
          </Card>

          <Card className="p-5">
            <p className="eyebrow mb-3 text-silver">Distribution copy</p>
            <Table caption="Copy prepared for each distribution surface">
              <tbody>
                <tr><Th scope="row" className="w-40 align-top">SEO title</Th><Td>{article.seo.title || <span className="text-blood">Required before publication</span>}</Td></tr>
                <tr><Th scope="row" className="align-top">SEO description</Th><Td>{article.seo.description || <span className="text-blood">Required before publication</span>}</Td></tr>
                <tr><Th scope="row" className="align-top">Social</Th><Td>{article.socialCopy || <span className="text-silver">Not written</span>}</Td></tr>
                <tr><Th scope="row" className="align-top">Push</Th><Td>{article.pushCopy || <span className="text-silver">Not written</span>}</Td></tr>
              </tbody>
            </Table>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Assignment</p>
            <KeyValue>
              <Field label="Author">{article.authorName}</Field>
              <Field label="Editor">{article.editorId ? USER_BY_ID.get(article.editorId)?.name ?? "—" : "Unassigned"}</Field>
              <Field label="Pillar">{article.pillar}</Field>
              <Field label="Read time">{article.readMinutes} min</Field>
              {article.embargoIso ? <Field label="Embargo">{fmtDateTime(article.embargoIso)}</Field> : null}
              {article.scheduledIso ? <Field label="Scheduled">{fmtDateTime(article.scheduledIso)}</Field> : null}
              {article.publishedIso ? <Field label="Published">{fmtDateTime(article.publishedIso)}</Field> : null}
            </KeyValue>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Tagging</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-silver">Artists</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {article.artistIds.length === 0 ? <span className="text-xs text-silver">None</span> : null}
                  {article.artistIds.map((id) => (
                    <Badge key={id}>{ARTIST_BY_ID.get(id)?.name ?? id}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-silver">Cities</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {article.cityIds.length === 0 ? <span className="text-xs text-silver">None</span> : null}
                  {article.cityIds.map((id) => <Badge key={id}>{CITY_BY_ID.get(id)?.name ?? id}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-silver">Topics</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {article.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                </div>
              </div>
            </div>
          </Card>

          {article.relatedAssetIds.length > 0 ? (
            <Card className="p-4">
              <p className="eyebrow mb-2 text-silver">Related media</p>
              <ul className="space-y-1.5 text-sm">
                {article.relatedAssetIds.map((id) => (
                  <li key={id}>
                    <Link href={`/os/media?asset=${id}`} className="text-volt-soft underline hover:text-bone">
                      {ASSET_BY_ID.get(id)?.title ?? id}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {article.corrections.length > 0 ? (
            <Notice tone="warn" title="Corrections on the record">
              <ul className="space-y-2">
                {article.corrections.map((c) => (
                  <li key={c.iso}>
                    <span className="text-bone">{fmtDateTime(c.iso)}</span> — {c.note}
                  </li>
                ))}
              </ul>
            </Notice>
          ) : null}

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Version history</p>
            <p className="text-sm text-bone-dim">
              Every state change, edit, comment, and correction writes an append-only record with an
              author and a timestamp. Nothing in a story&apos;s history is editable.
            </p>
            <p className="mt-2 text-xs text-silver">
              Demonstration build — the history table is defined in the schema and not populated here.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
