import type { Metadata } from "next";
import Link from "next/link";
import { getIndexSources, getOverrides, getTrending } from "@/lib/repo";
import { Badge, Card, Notice, SectionHeader, Table, Td, Th } from "@/components/ui";
import { DEFAULT_PROFILE, MIN_SIGNALS_FOR_PUBLICATION } from "@/lib/index-engine";
import { freezeSnapshot, replaySnapshot } from "@/lib/ingest/snapshot";
import { SIGNAL_LABELS } from "@/lib/index-engine";
import type { SignalKey } from "@/lib/types";

export const metadata: Metadata = {
  title: "Index audit",
  description:
    "Freeze the inputs behind a published chart, then recompute it and compare. The Index is checkable, not just described.",
};

const NOW = new Date().toISOString();

export default async function AuditPage() {
  const [entries, sources, overrides] = await Promise.all([
    getTrending(),
    getIndexSources(),
    getOverrides(),
  ]);

  const snapshot = freezeSnapshot({
    weekId: "current",
    createdIso: NOW,
    computedAtIso: entries[0]?.score.computedIso ?? NOW,
    profile: DEFAULT_PROFILE,
    sources,
    overrides,
    observations: [],
    published: entries,
  });

  const replay = replaySnapshot(snapshot, entries);
  const connected = sources.filter((s) => s.status === "connected");

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">Public audit</p>
      <h1 className="display mt-2 text-5xl text-bone sm:text-6xl">Check the chart yourself</h1>
      <p className="mt-5 text-lg leading-relaxed text-bone-dim">
        A methodology page describes a method. This page proves one. The scoring engine is pure —
        the same signals, weights and timestamp always produce the same number — so the inputs
        behind a published chart can be frozen, handed to anyone, and recomputed. If the result
        differs, the chart is wrong and this page says so.
      </p>

      <Notice
        tone={replay.matches ? "good" : "bad"}
        title={replay.matches ? "This chart reproduces exactly" : "This chart does not reproduce"}
      >
        <p>
          {replay.checkedEntries} entries were recomputed from the frozen inputs.{" "}
          {replay.matches
            ? "Every score, rank and confidence figure matched the published value."
            : `${replay.diffs.length} value(s) did not match and are listed below.`}
        </p>
        <p className="mt-2">
          Snapshot digest <code className="text-bone">{snapshot.digest}</code> —{" "}
          {replay.digestIntact ? "intact" : "the frozen inputs have been altered since publication"}.
        </p>
      </Notice>

      <SectionHeader
        eyebrow="What is frozen"
        title="The inputs behind this chart"
        description="Everything the engine read, recorded at publication so the arithmetic can be repeated rather than trusted."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-bone">Weight profile</h3>
          <p className="mt-2 text-sm text-bone-dim">
            <code>{snapshot.profile.id}</code> — half-life {snapshot.profile.halfLifeDays} days,
            emerging multiplier {snapshot.profile.emergingBoost}.
          </p>
          <p className="mt-2 text-sm text-bone-dim">
            Computed at <code>{snapshot.computedAtIso}</code>. Decay depends on this instant, so it
            is frozen with everything else.
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-bone">Connected sources</h3>
          <p className="mt-2 text-sm text-bone-dim">
            {connected.length} of {sources.length} sources were authorized and connected. A signal
            from a source that is not connected contributes nothing — it does not fall back to an
            estimate.
          </p>
          <p className="mt-2 text-sm text-bone-dim">
            {MIN_SIGNALS_FOR_PUBLICATION} signals are required before an entry may publish.
          </p>
        </Card>
      </div>

      <SectionHeader
        eyebrow="Editorial interventions"
        title="Every human adjustment, in full"
        description="An override moves a published position. It is part of the arithmetic, so removing one from the record breaks the replay."
      />

      {overrides.length === 0 ? (
        <p className="text-sm text-bone-dim">No editorial overrides are applied to this chart.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Entry</Th>
              <Th>Delta</Th>
              <Th>Reason</Th>
              <Th>Logged</Th>
            </tr>
          </thead>
          <tbody>
            {overrides.map((o) => (
              <tr key={o.id}>
                <Td><code>{o.entryId}</code></Td>
                <Td>{o.deltaPoints > 0 ? `+${o.deltaPoints}` : o.deltaPoints}</Td>
                <Td>{o.reason}</Td>
                <Td>{o.createdIso.slice(0, 10)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <SectionHeader
        eyebrow="Per entry"
        title="Recomputed against published"
        description="Signal count is shown against the publication floor, so a thinly-sourced entry is visible rather than hidden behind a score."
      />

      <Table>
        <thead>
          <tr>
            <Th>Rank</Th>
            <Th>Entry</Th>
            <Th>Score</Th>
            <Th>Signals</Th>
            <Th>Confidence</Th>
            <Th>Reproduces</Th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const bad = replay.diffs.filter((d) => d.entryId === entry.id);
            const signalCount = entry.score.contributions.length;
            return (
              <tr key={entry.id}>
                <Td>{entry.rank}</Td>
                <Td>
                  <span className="text-bone">{entry.title}</span>
                  <span className="block text-xs text-bone-dim">{entry.artistName}</span>
                </Td>
                <Td>{entry.score.score.toFixed(1)}</Td>
                <Td>
                  {signalCount}
                  {signalCount < MIN_SIGNALS_FOR_PUBLICATION ? (
                    <Badge tone="bad">below floor</Badge>
                  ) : null}
                </Td>
                <Td>{entry.score.confidence.toFixed(2)}</Td>
                <Td>
                  {bad.length === 0 ? (
                    <Badge tone="good">yes</Badge>
                  ) : (
                    <Badge tone="bad">{bad.map((d) => d.field).join(", ")}</Badge>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <SectionHeader
        eyebrow="What is missing"
        title="This page is honest about its own limits"
        description=""
      />

      <Notice tone="warn" title="No observations are frozen yet">
        <p>
          The ingestion layer exists and is tested, but no live source is connected, so the
          observation list in this snapshot is empty and the signals come from the demonstration
          dataset. Until a real source is wired, this page proves that the chart reproduces from
          its recorded inputs — not that those inputs describe the world.
        </p>
        <p className="mt-2">
          When a source is connected, every observation behind every entry appears here with the URL
          it came from and the time it was read.{" "}
          <Link href="/trending/methodology" className="underline">
            The methodology page
          </Link>{" "}
          explains what each signal is worth.
        </p>
      </Notice>

      <p className="mt-6 text-xs text-bone-dim">
        Signals in this profile:{" "}
        {(Object.keys(DEFAULT_PROFILE.weights) as SignalKey[])
          .map((k) => SIGNAL_LABELS[k] ?? k)
          .join(", ")}
        .
      </p>
    </article>
  );
}
