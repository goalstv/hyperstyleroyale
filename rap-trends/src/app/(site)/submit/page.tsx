import type { Metadata } from "next";
import Link from "next/link";
import { getSubmissionPlans } from "@/lib/repo";
import { Card, Notice, SectionHeader } from "@/components/ui";
import { SubmissionForm } from "@/components/submission-form";

export const metadata: Metadata = {
  title: "Submit your music",
  description: "Independent artist submissions to RAP TRENDS. Free and paid plans, reviewed by the same editors.",
};

export default async function SubmitPage() {
  const plans = await getSubmissionPlans();

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">Independent artists</p>
      <h1 className="display mt-2 text-6xl text-bone sm:text-7xl">Submit your music</h1>
      <p className="mt-4 max-w-3xl text-lg text-bone-dim">
        One queue, one standard. Free submissions and paid submissions are reviewed by the same
        editors against the same criteria — a plan changes how fast you hear back and how much
        reporting you get, and nothing else.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2.3fr_1fr]">
        <SubmissionForm plans={plans} />

        <aside className="space-y-4">
          <Notice tone="good" title="What we promise">
            <ul className="space-y-1.5">
              <li>· A human listens to every submission.</li>
              <li>· Editors scoring your record cannot see which plan you are on.</li>
              <li>· Chart position and editorial coverage are never for sale.</li>
              <li>· Paid promotion is available, always labelled as promotion, and kept separate from editorial.</li>
              <li>· You keep every right you have. Submitting grants us a limited, revocable licence to consider and, if selected, to air the record.</li>
            </ul>
          </Notice>

          <Card className="p-4">
            <p className="eyebrow text-silver">What gets a record scheduled</p>
            <ol className="mt-3 space-y-2 text-sm text-bone-dim">
              <li><strong className="text-bone">1.</strong> The record is good. This is most of it.</li>
              <li><strong className="text-bone">2.</strong> The rights are clean and documented.</li>
              <li><strong className="text-bone">3.</strong> A clean version exists if you want broadcast carriage.</li>
              <li><strong className="text-bone">4.</strong> Metadata is complete — ISRC, publisher, splits.</li>
              <li><strong className="text-bone">5.</strong> The territories you grant cover where we would air it.</li>
            </ol>
          </Card>

          <Card className="p-4">
            <p className="eyebrow text-silver">Already submitted?</p>
            <p className="mt-2 text-sm text-bone-dim">
              Track editorial status, upload rights documentation, and see verified airtime reporting
              in the artist portal.
            </p>
            <Link href="/artist-portal" className="mt-3 inline-block text-sm text-volt-soft underline hover:text-bone">
              Open the artist portal
            </Link>
          </Card>

          <Card className="p-4">
            <p className="eyebrow text-silver">Read first</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/legal/editorial-standards" className="text-volt-soft underline hover:text-bone">Editorial standards</Link></li>
              <li><Link href="/trending/methodology" className="text-volt-soft underline hover:text-bone">How the Index works</Link></li>
              <li><Link href="/next-up" className="text-volt-soft underline hover:text-bone">How NEXT UP selects artists</Link></li>
            </ul>
          </Card>
        </aside>
      </div>

      <section className="mt-16">
        <SectionHeader eyebrow="Plans" title="What each plan includes" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.id} className="p-5">
              <p className="display text-3xl text-bone">{p.name}</p>
              <p className="num mt-1 text-2xl text-volt-soft">
                {p.priceUsd === 0 ? "Free" : `$${p.priceUsd}`}
                <span className="ml-2 text-xs text-silver">{p.cadence}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-bone-dim">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden className="text-neon">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-ink-4 pt-3 text-xs text-amber">{p.editorialGuarantee}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
