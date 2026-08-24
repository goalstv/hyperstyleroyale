import Link from "next/link";
import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Notice, Table, Td, Th } from "@/components/ui";
import { getArticles } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { STATE_LABELS, WORKFLOW_ORDER, progressPercent } from "@/lib/workflow";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { USER_BY_ID } from "@/data/users";
import type { ArticleState } from "@/lib/types";

export const metadata = { title: "Newsroom" };

const COLUMN_TONE: Partial<Record<ArticleState, "neutral" | "warn" | "volt" | "good">> = {
  idea: "neutral", assigned: "neutral", drafting: "volt", editing: "volt",
  fact_check: "warn", approved: "good", scheduled: "good", published: "good",
};

export default async function NewsroomPage() {
  const { user, allowed } = await requirePermission("newsroom.read");
  if (!allowed) return <PermissionDenied permission="newsroom.read" />;

  const articles = await getArticles();
  const isJournalist = user.roles.includes("journalist") || user.roles.includes("external_contributor");
  // A journalist's workspace shows their own desk first; editors see everything.
  const mine = articles.filter((a) => a.authorId === user.id);
  const board = isJournalist ? mine : articles;

  return (
    <div>
      <OsHeader
        title={isJournalist ? "Your desk" : "Newsroom"}
        subtitle={
          isJournalist
            ? "Draft, edit, organise, and file. Everything you need to report, and nothing that touches air."
            : "Every story in the pipeline, from idea to published, with the gates that stop a piece going out before it is ready."
        }
        actions={<Badge tone="volt">{board.length} stories</Badge>}
      />

      {isJournalist ? (
        <div className="mb-6">
          <Notice tone="volt" title="Your workspace">
            You can move a story as far as <strong className="text-bone">Editing</strong>. Fact
            check, approval, scheduling, and publication belong to the editor-in-chief — that
            boundary is enforced by the workflow, not by convention. You have no access to
            programming, master control, distribution, or advertising.
          </Notice>
        </div>
      ) : null}

      {/* ---------------------------------------------------------- the board */}
      <section aria-labelledby="board" className="mb-10">
        <h2 id="board" className="eyebrow mb-3 text-silver">Editorial workflow</h2>
        <div className="thin-scroll overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {WORKFLOW_ORDER.map((state) => {
              const column = board.filter((a) => a.state === state);
              return (
                <div key={state} className="w-64 shrink-0">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="eyebrow text-silver">{STATE_LABELS[state]}</p>
                    <Badge tone={COLUMN_TONE[state] ?? "neutral"}>{column.length}</Badge>
                  </div>
                  <ul className="space-y-2">
                    {column.length === 0 ? (
                      <li className="rounded border border-dashed border-ink-4 p-4 text-center text-xs text-silver">
                        Empty
                      </li>
                    ) : null}
                    {column.map((a) => (
                      <li key={a.id}>
                        <Link href={`/os/newsroom/${a.id}`} className="surface block rounded p-3 transition-colors hover:border-silver">
                          <p className="line-clamp-2 text-sm font-semibold text-bone">{a.headline}</p>
                          <p className="mt-1.5 text-xs text-silver">{a.authorName}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge>{a.pillar}</Badge>
                            {a.breaking ? <Badge tone="live">Breaking</Badge> : null}
                            {a.embargoIso ? <Badge tone="warn">Embargo</Badge> : null}
                          </div>
                          <div className="mt-2 h-0.5 w-full overflow-hidden rounded bg-ink-4">
                            <div className="h-full bg-volt" style={{ width: `${progressPercent(a.state)}%` }} />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- editorial calendar */}
      <section aria-labelledby="calendar">
        <h2 id="calendar" className="eyebrow mb-3 text-silver">Editorial calendar</h2>
        <Card className="overflow-hidden">
          <Table caption="All stories with their state, owner, and publication timing">
            <thead>
              <tr>
                <Th>Headline</Th><Th>State</Th><Th>Author</Th><Th>Editor</Th>
                <Th>Fact check</Th><Th>Timing</Th>
              </tr>
            </thead>
            <tbody>
              {board.map((a) => (
                <tr key={a.id} className="hover:bg-ink-3/50">
                  <Td>
                    <Link href={`/os/newsroom/${a.id}`} className="font-semibold text-bone hover:underline">
                      {a.headline}
                    </Link>
                    <span className="mt-0.5 block text-xs text-silver">{a.pillar}</span>
                  </Td>
                  <Td><Badge tone={COLUMN_TONE[a.state] ?? "neutral"}>{STATE_LABELS[a.state]}</Badge></Td>
                  <Td className="whitespace-nowrap text-xs">{a.authorName}</Td>
                  <Td className="whitespace-nowrap text-xs">{a.editorId ? USER_BY_ID.get(a.editorId)?.name ?? "—" : "—"}</Td>
                  <Td>
                    <Badge tone={a.factCheck.status === "cleared" ? "good" : a.factCheck.status === "in_progress" ? "warn" : "neutral"}>
                      {a.factCheck.status.replace("_", " ")}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-xs">
                    {a.publishedIso
                      ? `Published ${fmtDate(a.publishedIso)}`
                      : a.scheduledIso
                        ? `Scheduled ${fmtDateTime(a.scheduledIso)}`
                        : a.embargoIso
                          ? `Embargo ${fmtDateTime(a.embargoIso)}`
                          : "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
