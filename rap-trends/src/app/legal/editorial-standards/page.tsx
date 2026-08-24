import type { Metadata } from "next";
import Link from "next/link";
import { Notice, SectionHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Editorial standards",
  description: "How RAP TRENDS reports, verifies, corrects, and separates commercial relationships from editorial decisions.",
};

export default function EditorialStandardsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">Standards</p>
      <h1 className="display mt-2 text-5xl text-bone sm:text-6xl">Editorial standards</h1>
      <p className="mt-5 text-lg leading-relaxed text-bone-dim">
        A network that ranks culture has to be able to explain itself. This is what RAP TRENDS
        commits to, and what you should hold us to.
      </p>

      <SectionHeader eyebrow="One" title="The commercial firewall" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          Editorial placement is never secretly pay-to-play. No submission plan, sponsorship,
          advertising relationship, label relationship, or promotional purchase can produce
          editorial coverage, a chart position, or NEXT UP selection.
        </p>
        <p>
          Paid promotion exists. It is sold at published rates, it is labelled as promotion
          everywhere it appears — on air, on the site, in the applications, and in social posts — and
          it is kept structurally away from editorial. Editors scoring a submission cannot see which
          plan the artist is on.
        </p>
        <p>
          Sponsorship of a franchise buys the surround: billboards, lockups, branded segments, and
          association. It does not buy the content of that franchise.
        </p>
      </div>

      <SectionHeader eyebrow="Two" title="Verification" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          Every story passes through a documented workflow — idea, assigned, drafting, editing, fact
          check, approved, scheduled, published — and cannot be approved or published until the fact
          check is cleared and at least one source is cited. This is enforced by the software, not
          by good intentions.
        </p>
        <p>
          We do not publish a quote we have not verified against a recording or a first-hand
          account. We do not publish a statistic without a source we can name. We do not report a
          rumour as news because someone else did.
        </p>
      </div>

      <SectionHeader eyebrow="Three" title="AI, and where it stops" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          RAP TRENDS uses AI for transcription, caption drafting, chapter creation, metadata
          tagging, clip suggestions, moderation triage, search, and translation. Those are real
          efficiencies and we use them.
        </p>
        <p>
          Every AI output requires human review before broadcast or publication. Captions drafted by
          AI and not reviewed by a person are blocked from delivery to any platform that requires
          captions — the rights gate treats an unreviewed caption file as a hard blocker.
        </p>
        <p>
          AI does not write quotes, statistics, artist information, chart performance, or breaking
          news. Nothing generated is presented as reported.
        </p>
      </div>

      <SectionHeader eyebrow="Four" title="Corrections" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          When we get something wrong we correct it in public, on the story, with a date and a
          description of what changed. We do not silently edit a published piece.
        </p>
        <p>
          Chart errors are corrected the same way. If a source delivered bad data we say which
          source, which positions were affected, and what we changed.
        </p>
      </div>

      <SectionHeader eyebrow="Five" title="Data honesty" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          The Index never presents estimated or simulated data as verified live data. A signal from
          a source we are not licensed to read contributes nothing to a score — it lowers the
          published confidence figure instead.
        </p>
        <p>
          We publish audience bands rather than precise counts unless a figure comes from a licensed
          source and can be verified. We do not claim ratings we have not bought.
        </p>
      </div>

      <SectionHeader eyebrow="Six" title="Conflicts" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          Staff disclose financial interests in artists, labels, managers, promoters, and brands the
          network covers. Anyone with a conflict is recused from decisions touching it.
        </p>
        <p>
          Where a story involves a RAP TRENDS commercial partner, that relationship is disclosed
          inside the story.
        </p>
      </div>

      <div className="mt-10">
        <Notice tone="volt" title="Related">
          <ul className="space-y-1.5">
            <li>· <Link href="/trending/methodology" className="underline hover:text-bone">How the RAP TRENDS Index works</Link></li>
            <li>· <Link href="/legal/rights" className="underline hover:text-bone">Rights, licensing, and compliance</Link></li>
            <li>· <Link href="/legal/privacy" className="underline hover:text-bone">Privacy and data</Link></li>
          </ul>
        </Notice>
      </div>
    </article>
  );
}
