import type { Metadata } from "next";
import { SectionHeader, Notice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy & data",
  description: "What RAP TRENDS collects, why, how long it is kept, and how to get it removed.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">Privacy</p>
      <h1 className="display mt-2 text-5xl text-bone sm:text-6xl">Privacy and data</h1>
      <p className="mt-5 text-lg leading-relaxed text-bone-dim">
        Written to be read. This is a summary of the operating policy; a final policy requires
        review by privacy counsel before launch.
      </p>

      <SectionHeader eyebrow="Collection" title="What we collect" />
      <ul className="mt-4 space-y-2 text-bone-dim">
        <li>· <strong className="text-bone">Account data</strong> — email, display name, and preferences, when you create an account.</li>
        <li>· <strong className="text-bone">Artist data</strong> — the profile, catalogue, rights, and contact information you submit through the artist portal.</li>
        <li>· <strong className="text-bone">Usage data</strong> — what was watched or listened to, for programming decisions and aggregate reporting.</li>
        <li>· <strong className="text-bone">Voting</strong> — one vote per verified account per record per day, rate-limited and de-duplicated to keep the Index honest.</li>
        <li>· <strong className="text-bone">Diagnostics</strong> — errors and performance data, with IP addresses truncated.</li>
      </ul>

      <SectionHeader eyebrow="Consent" title="How consent works here" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          Consent is explicit and unbundled. Nothing is pre-checked, there is no
          &ldquo;by continuing you agree&rdquo; pattern, and email subscriptions use double opt-in.
          You can withdraw consent from any message we send.
        </p>
        <p>
          Non-essential analytics and advertising cookies are off until you turn them on. Turning
          them down does not degrade the service.
        </p>
      </div>

      <SectionHeader eyebrow="Sharing" title="Who else sees it" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          We do not sell personal data. Processors — hosting, email delivery, payment processing,
          analytics — act on our instructions under contract, and each is listed in the processor
          register available on request.
        </p>
        <p>
          Advertising on RAP TRENDS is contextual and geographic by default: bought by franchise,
          city bureau, daypart, or content classification. We do not target on sensitive personal
          categories.
        </p>
      </div>

      <SectionHeader eyebrow="Children" title="COPPA" />
      <p className="mt-4 text-bone-dim">
        RAP TRENDS is not directed to children under 13, does not knowingly collect their personal
        information, and builds no behavioural profile on a minor. Where a platform requires a
        child-directed designation, the surface is served without personalised advertising.
      </p>

      <SectionHeader eyebrow="Your rights" title="Access, correction, deletion, portability" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          You can request a copy of your data, correct it, delete it, or take it elsewhere. Requests
          go to <span className="text-bone">privacy@raptrends.example</span> (configurable
          placeholder) and are answered within the statutory window that applies to you.
        </p>
        <p>
          Deleting an account removes personal data. Content already broadcast is a different
          matter: airtime logs, cue sheets, and rights records are retained because performance
          reporting and licensing obligations require them.
        </p>
      </div>

      <SectionHeader eyebrow="Retention" title="How long things are kept" />
      <ul className="mt-4 space-y-2 text-bone-dim">
        <li>· Account data — for the life of the account, then 30 days.</li>
        <li>· Usage data — 25 months in identifiable form, aggregated after that.</li>
        <li>· Diagnostics — 90 days.</li>
        <li>· Rights records, cue sheets, and airtime logs — for the statutory and contractual period, which is longer than any of the above.</li>
      </ul>

      <div className="mt-10">
        <Notice tone="warn" title="Status">
          This is the operating policy for a demonstration build. No production personal data is
          held. A final published policy requires privacy counsel review against the jurisdictions
          the network actually operates in.
        </Notice>
      </div>
    </article>
  );
}
