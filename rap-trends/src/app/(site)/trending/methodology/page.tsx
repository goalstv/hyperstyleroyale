import type { Metadata } from "next";
import Link from "next/link";
import { getIndexProfiles, getIndexSources } from "@/lib/repo";
import { Badge, Card, Notice, SectionHeader, Table, Td, Th } from "@/components/ui";
import { SIGNAL_LABELS, MIN_SIGNALS_FOR_PUBLICATION } from "@/lib/index-engine";
import type { SignalKey } from "@/lib/types";

export const metadata: Metadata = {
  title: "Index methodology",
  description: "How the RAP TRENDS Index is calculated, weighted, decayed, flagged, and audited.",
};

const AUTHORIZATION_LABEL: Record<string, string> = {
  licensed_api: "Licensed API",
  approved_feed: "Approved feed",
  public_source: "Public source",
  direct_submission: "Direct artist submission",
  internal_editorial: "Internal editorial",
};

export default async function MethodologyPage() {
  const [sources, profiles] = await Promise.all([getIndexSources(), getIndexProfiles()]);
  const national = profiles[0];

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">Public methodology</p>
      <h1 className="display mt-2 text-5xl text-bone sm:text-6xl">How the RAP TRENDS Index works</h1>
      <p className="mt-5 text-lg leading-relaxed text-bone-dim">
        A chart is only worth what its method is worth. This page describes exactly how a record
        gets its position: which signals count, what each is worth, how age is handled, when a
        human intervenes, and what happens when the evidence is not good enough to publish.
      </p>

      <Notice tone="volt" title="The two rules everything else follows">
        <p className="mb-2">
          <strong className="text-bone">One.</strong> A signal only counts if we are authorized to
          read it — a licensed API, an approved feed, a genuinely public source, a direct artist
          submission, or our own editorial process. We do not scrape platforms against their terms,
          and an unlicensed source contributes zero rather than an estimate.
        </p>
        <p>
          <strong className="text-bone">Two.</strong> Chart position cannot be purchased. Not
          through a submission plan, not through a sponsorship, not through an advertising
          relationship. Promotional products exist, they are labelled as promotion, and they are
          walled off from every editorial and chart decision.
        </p>
      </Notice>

      <SectionHeader eyebrow="Step one" title="Signals and weights" />
      <p className="mt-4 text-bone-dim">
        Each signal is normalized to a 0–100 reading within its release cohort, then multiplied by
        its published weight. The weights below are profile <span className="num text-bone">{national.id}</span>.
        We re-normalize across the weight actually reported, so a missing source does not silently
        deflate a score — it shows up in the confidence figure instead.
      </p>
      <div className="mt-5">
        <Table caption="Index signal weights and their authorization basis">
          <thead>
            <tr><Th>Signal</Th><Th>Weight</Th><Th>Basis</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {(Object.entries(national.weights) as [SignalKey, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([key, weight]) => {
                const source = sources.find((s) => s.key === key);
                return (
                  <tr key={key}>
                    <Td className="text-bone">
                      {SIGNAL_LABELS[key]}
                      {source ? <span className="mt-0.5 block text-xs text-silver">{source.notes}</span> : null}
                    </Td>
                    <Td className="num whitespace-nowrap text-bone">{(weight * 100).toFixed(0)}%</Td>
                    <Td className="whitespace-nowrap text-xs">
                      {source ? AUTHORIZATION_LABEL[source.authorization] : "—"}
                    </Td>
                    <Td>
                      <Badge tone={source?.status === "connected" ? "good" : "warn"}>
                        {source?.status === "connected" ? "Counting" : "Excluded"}
                      </Badge>
                    </Td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>

      <SectionHeader eyebrow="Step two" title="Recency, region, and emerging artists" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          <strong className="text-bone">Time decay.</strong> A record's recency contribution halves
          every <span className="num text-bone">{national.halfLifeDays}</span> days, floored at 0.55.
          The floor matters: catalogue records genuinely resurging should not be erased by age
          alone, and a chart that only ever shows this week's releases is not measuring culture.
        </p>
        <p>
          <strong className="text-bone">Emerging-artist adjustment.</strong> Artists in the rising
          and independent tiers carry a ×<span className="num text-bone">{national.emergingBoost}</span>{" "}
          multiplier on the national profile and ×
          <span className="num text-bone">{profiles[1]?.emergingBoost ?? "—"}</span> on the NEXT UP
          edition. This is a deliberate thumb on the scale, published rather than hidden, because
          raw volume will always favour artists with marketing budgets behind them.
        </p>
        <p>
          <strong className="text-bone">Regional weighting.</strong> Regional editions apply a
          per-market multiplier so a Detroit chart reflects Detroit. The national chart applies no
          regional multiplier at all.
        </p>
      </div>

      <SectionHeader eyebrow="Step three" title="Manipulation flags" />
      <p className="mt-4 text-bone-dim">
        Four patterns raise a flag. A flag is not an accusation and does not remove a record — it is
        a statement that the evidence pattern is unusual and that a human is looking at it. Flags
        stay visible on the public chart.
      </p>
      <ul className="mt-4 space-y-3">
        {[
          ["Flat engagement", "Consumption far outrunning save, share, and repeat behaviour — plays without listeners behind them."],
          ["Velocity spike", "High play volume with no matching conversation or search footprint."],
          ["Single-source dominance", "One signal accounting for more than 40% of all reported activity."],
          ["Geographic concentration", "Activity concentrated in an implausibly narrow geography with no supporting airplay."],
        ].map(([title, detail]) => (
          <li key={title} className="surface rounded-lg p-4">
            <p className="font-semibold text-bone">{title}</p>
            <p className="mt-1 text-sm text-bone-dim">{detail}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-silver">
        We publish the patterns, not the thresholds that would let someone tune around them.
      </p>

      <SectionHeader eyebrow="Step four" title="Confidence, and when we refuse to publish" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          Confidence is a statement about the evidence, not about the record. It starts at the share
          of authorized sources actually reporting, then subtracts for stale feeds and for open
          flags. A position with a confidence of 0.62 is telling you something real: we are less
          sure of it than we are of a 0.94.
        </p>
        <p>A record is held from air when any of the following is true:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Confidence is below 0.50.</li>
          <li>A high-severity manipulation flag is open and unreviewed.</li>
          <li>Fewer than {MIN_SIGNALS_FOR_PUBLICATION} authorized signals have reported.</li>
        </ul>
      </div>

      <SectionHeader eyebrow="Step five" title="Human override, and the audit trail" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          Editors can adjust a composite score. This is a feature, not a loophole: models miss
          context, and a meme using four seconds of an intro is not the same cultural event as a
          record breaking. Every override carries a point delta, a written reason, and the name of
          the person who applied it, and every one of them is published on the chart page.
        </p>
        <p>
          Every recompute, every source change, every profile change, and every override writes an
          append-only audit record. Nothing in the Index's history is editable.
        </p>
      </div>

      <SectionHeader eyebrow="Corrections" title="When we get it wrong" />
      <p className="mt-4 text-bone-dim">
        Chart errors are corrected in public with a dated note, the same as any editorial
        correction. If a source is found to have delivered bad data, we say which source, which
        positions were affected, and what we changed.
      </p>

      <Card className="mt-10 p-5">
        <p className="eyebrow text-silver">Related</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li><Link href="/trending" className="text-volt-soft underline hover:text-bone">This week's Trending 10</Link></li>
          <li><Link href="/legal/editorial-standards" className="text-volt-soft underline hover:text-bone">Editorial standards</Link></li>
          <li><Link href="/submit" className="text-volt-soft underline hover:text-bone">Submit a record for consideration</Link></li>
        </ul>
      </Card>
    </article>
  );
}
