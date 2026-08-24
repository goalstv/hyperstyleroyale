import type { Metadata } from "next";
import { Notice, SectionHeader, Table, Td, Th } from "@/components/ui";
import { PLATFORM_REQUIREMENTS, RIGHT_LABELS } from "@/lib/rights";
import type { Platform } from "@/lib/types";

export const metadata: Metadata = {
  title: "Rights & compliance",
  description: "The rights RAP TRENDS clears before anything is distributed, and the obligations attached to each destination.",
};

const PLATFORM_LABELS: Record<Platform, string> = {
  web: "Web", ios: "iOS app", android: "Android app", ctv_app: "Connected-TV app",
  fast: "FAST channel", cable: "Cable", ota: "Over-the-air", vmvpd: "Virtual MVPD",
  youtube: "YouTube", social: "Social", podcast: "Podcast",
  radio_affiliate: "Radio affiliate", internet_radio: "Internet radio",
};

export default function RightsPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">Compliance</p>
      <h1 className="display mt-2 text-5xl text-bone sm:text-6xl">Rights, licensing, and compliance</h1>
      <p className="mt-5 text-lg leading-relaxed text-bone-dim">
        Music television is a rights business before it is a media business. This page describes
        what RAP TRENDS clears, how the system enforces it, and what still requires professional
        approval.
      </p>

      <Notice tone="warn" title="Professional review is required">
        The architecture described here encodes a serious reading of the obligations involved. It is
        not legal advice and it is not a substitute for qualified broadcast counsel and
        music-licensing professionals, who must review and approve the final operating model before
        any transmission, carriage, syndication, or public performance takes place.
      </Notice>

      <SectionHeader eyebrow="The gate" title="Nothing ships without passing it" />
      <div className="mt-4 space-y-4 text-bone-dim">
        <p>
          Every asset carries a rights record listing the specific rights actually cleared, the
          authorized platforms, the licensed territories, the licence start and end dates, any
          advertising restrictions the licensor imposed, and whether a talent release is on file.
        </p>
        <p>
          Before an asset can be scheduled, delivered, or published, the gate checks that record
          against the destination. It fails closed: a missing rights record is treated as
          &ldquo;not cleared&rdquo;, never as &ldquo;probably fine&rdquo;. A licence that expires
          mid-schedule blocks the airing that would fall outside the window, not the whole day.
        </p>
      </div>

      <SectionHeader eyebrow="By destination" title="What each platform requires" />
      <div className="mt-5">
        <Table caption="Rights required for each distribution destination">
          <thead>
            <tr><Th>Destination</Th><Th>Rights required</Th></tr>
          </thead>
          <tbody>
            {(Object.keys(PLATFORM_REQUIREMENTS) as Platform[]).map((platform) => (
              <tr key={platform}>
                <Td className="whitespace-nowrap font-semibold text-bone">{PLATFORM_LABELS[platform]}</Td>
                <Td className="text-xs">
                  {PLATFORM_REQUIREMENTS[platform].map((r) => RIGHT_LABELS[r]).join(" · ")}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <SectionHeader eyebrow="Beyond music" title="The rest of the compliance surface" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ["Talent and location releases", "Required for every interview and performance. The gate blocks an interview or performance asset whose release is not on file."],
          ["Archival footage", "Not exhibited without a documented chain of title. This costs us programming, and it is not negotiable."],
          ["User-generated content", "Licensed explicitly from the creator before use. Nothing is used on the theory that posting it publicly granted us a licence."],
          ["Union obligations", "Where performers, writers, or crew are covered by a collective agreement, those terms govern the production and the reuse."],
          ["DMCA", "A designated agent, a documented notice-and-takedown procedure, counter-notice handling, and a repeat-infringer policy."],
          ["FTC disclosure", "Sponsored and branded content is disclosed clearly and conspicuously, in the content itself, not only in a description field."],
          ["FCC obligations", "Captions, ratings, political file, EAS, and indecency rules attach to broadcast carriage. On an OTA partnership these remain the licensee's obligations, and the agreement must say so."],
          ["Accessibility", "Captions on every programme, human-reviewed. Transcripts on long-form. WCAG 2.2 AA as the standard for every digital surface."],
          ["COPPA and privacy", "The service is not directed to children under 13. No behavioural profile is built on a minor. Consent is explicit and unbundled."],
          ["Content ratings", "Every asset carries a rating, and explicit audio is confined to late and overnight dayparts on owned digital origination only."],
          ["Restricted advertising", "Alcohol, cannabis, gambling, political, and pharmaceutical categories carry rules enforced in software by platform, daypart, territory, and age gate."],
          ["Performance reporting", "Cue sheets and music reporting are generated for every programme so performance-rights obligations can be met accurately."],
        ].map(([title, body]) => (
          <div key={title} className="surface rounded-lg p-4">
            <p className="font-semibold text-bone">{title}</p>
            <p className="mt-1.5 text-sm text-bone-dim">{body}</p>
          </div>
        ))}
      </div>

      <SectionHeader eyebrow="What we will not build" title="Lines we do not cross" />
      <ul className="mt-4 space-y-2 text-bone-dim">
        <li>· No scraping of platforms in ways that violate their terms of service.</li>
        <li>· No rebroadcasting of another network&apos;s or platform&apos;s feed.</li>
        <li>· No music download functionality.</li>
        <li>· No hosting of copyrighted recordings we have not licensed.</li>
        <li>· No presenting estimated or simulated figures as verified measurement.</li>
      </ul>
    </article>
  );
}
