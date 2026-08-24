import type { Metadata } from "next";
import Link from "next/link";
import { getSponsorOpportunities } from "@/lib/repo";
import { Badge, Card, Notice, SectionHeader, Stat, Table, Td, Th } from "@/components/ui";
import { EnquiryForm } from "@/components/enquiry-form";
import { fmtUsd } from "@/lib/format";
import { CATEGORY_RULES, RESTRICTED_LABELS } from "@/lib/ad-safety";
import type { RestrictedCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Advertise",
  description: "National and local advertising, sponsorships, branded content, and shoppable television on RAP TRENDS.",
};

export default async function AdvertisePage() {
  const sponsors = await getSponsorOpportunities();

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <p className="eyebrow text-gold">For brands and agencies</p>
      <h1 className="display mt-2 text-6xl text-bone sm:text-7xl">Advertise with RAP TRENDS</h1>
      <p className="mt-4 max-w-3xl text-lg text-bone-dim">
        A culturally influential audience reached through television, radio, connected TV, digital,
        and social — bought as one plan, measured as one campaign, and delivered against
        advertiser-safe content classifications.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Franchise sponsorships" value={sponsors.length} sub="Presenting positions available" tone="gold" />
        <Stat label="Entry rate card" value={fmtUsd(Math.min(...sponsors.map((s) => s.rateCardUsd)), true)} sub="Per market, per month" />
        <Stat label="Local avails" value="8–12 / hour" sub="Reserved for affiliate insertion" tone="volt" />
        <Stat label="Ad standards" value="SCTE-35 · VAST 4.2 · VMAP" sub="Server-side insertion ready" />
      </div>

      <section aria-labelledby="opportunities" className="mt-14">
        <SectionHeader
          id="opportunities"
          eyebrow="Rate card"
          title="Sponsorship opportunities"
          description="Indicative rates for demonstration. Nothing is reserved until a signed insertion order is in place."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {sponsors.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow text-blood">{s.franchise}</p>
                  <p className="display mt-1 text-2xl text-bone">{s.name}</p>
                </div>
                <div className="text-right">
                  <p className="num text-xl text-gold">{fmtUsd(s.rateCardUsd)}</p>
                  <p className="text-xs text-silver">{s.unit}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-bone-dim">{s.description}</p>
              <ul className="mt-3 space-y-1 text-sm text-bone-dim">
                {s.deliverables.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span aria-hidden className="text-gold">·</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.platforms.map((p) => <Badge key={p}>{p.replace("_", " ")}</Badge>)}
                <Badge tone="gold">{s.inventoryPerMonth} available / month</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="capabilities" className="mt-14">
        <SectionHeader id="capabilities" eyebrow="What you can buy" title="Capabilities" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["National advertising", "Linear and FAST inventory across the full 24-hour schedule, sold nationally with frequency control."],
            ["Local affiliate avails", "Eight to twelve minutes an hour reserved for affiliate insertion, reported monthly through the affiliate portal."],
            ["Program sponsorships", "Presenting positions on named franchises with billboards, lockups, and social extensions."],
            ["Branded content", "Original segments and co-produced episodes made by RAP TRENDS Studios, always disclosed as sponsored under FTC guidance."],
            ["Artist & concert promotion", "Clearly labelled promotional placements for releases, tours, and events, structurally separate from editorial and the chart."],
            ["Shoppable television", "On-screen QR codes and interactive overlays on connected-TV and ATSC 3.0 surfaces, with commerce attribution."],
            ["Dynamic ad insertion", "Server-side insertion against SCTE-35 markers, VAST 4.2 and VMAP compatible, with contextual and geographic targeting."],
            ["Contextual targeting", "Buy by franchise, city bureau, daypart, or content classification — never by sensitive personal category."],
            ["Campaign reporting", "Impressions, completion rates, clicks, pacing, make-goods, and proof-of-performance reports."],
          ].map(([title, body]) => (
            <Card key={title} className="p-5">
              <p className="display text-xl text-bone">{title}</p>
              <p className="mt-2 text-sm text-bone-dim">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="safety" className="mt-14">
        <SectionHeader
          id="safety"
          eyebrow="Advertiser safety"
          title="Restricted categories"
          description="These rules are enforced in software before a spot can be trafficked, not left to a trafficker's memory."
        />
        <div className="mt-6">
          <Table caption="Restricted advertising category rules">
            <thead>
              <tr><Th>Category</Th><Th>Minimum age</Th><Th>Permitted dayparts</Th><Th>Never on</Th><Th>Conditions</Th></tr>
            </thead>
            <tbody>
              {(Object.keys(CATEGORY_RULES) as RestrictedCategory[]).map((key) => {
                const rule = CATEGORY_RULES[key];
                return (
                  <tr key={key}>
                    <Td className="whitespace-nowrap font-semibold text-bone">{RESTRICTED_LABELS[key]}</Td>
                    <Td className="num whitespace-nowrap">{rule.minAudienceAge}+</Td>
                    <Td className="text-xs capitalize">{rule.allowedDayparts.join(", ")}</Td>
                    <Td className="text-xs uppercase">
                      {rule.blockedPlatforms.length ? rule.blockedPlatforms.join(", ") : "—"}
                    </Td>
                    <Td className="text-xs">{rule.note}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
        <div className="mt-5">
          <Notice tone="warn" title="Political advertising">
            Political and issue advertising on any broadcast carriage carries political-file,
            disclosure, and lowest-unit-charge obligations under FCC rules. RAP TRENDS will not
            accept political inventory on a broadcast feed until counsel has approved the operating
            policy and the political file is in place.
          </Notice>
        </div>
      </section>

      <section aria-labelledby="enquiry" className="mt-14 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionHeader id="enquiry" eyebrow="Talk to us" title="Start a conversation" />
          <div className="mt-6">
            <EnquiryForm
              endpoint="/api/advertising"
              submitLabel="Send enquiry"
              arrayFields={["interest"]}
              fields={[
                { name: "company", label: "Company or agency", required: true },
                { name: "contactName", label: "Contact name", required: true },
                { name: "contactEmail", label: "Contact email", type: "email", required: true },
                {
                  name: "budgetBand", label: "Budget band", type: "select", required: true,
                  options: [
                    { value: "under_50k", label: "Under $50,000" },
                    { value: "50k_150k", label: "$50,000 – $150,000" },
                    { value: "150k_500k", label: "$150,000 – $500,000" },
                    { value: "over_500k", label: "Over $500,000" },
                  ],
                },
                {
                  name: "restrictedCategory", label: "Is this a restricted category?", type: "select", required: true,
                  help: "Declaring this now means we can tell you the rules before anyone writes a proposal.",
                  options: [
                    { value: "none", label: "No — standard category" },
                    { value: "alcohol", label: "Alcohol" },
                    { value: "cannabis", label: "Cannabis" },
                    { value: "gambling", label: "Gambling / sports betting" },
                    { value: "political", label: "Political / issue advocacy" },
                    { value: "pharma", label: "Pharmaceutical" },
                  ],
                },
                {
                  name: "interest", label: "What are you interested in?", type: "checkboxes", required: true,
                  options: [
                    { value: "national", label: "National advertising" },
                    { value: "sponsorship", label: "Franchise sponsorship" },
                    { value: "branded", label: "Branded content" },
                    { value: "local", label: "Local / market buys" },
                    { value: "audio", label: "Radio and podcast" },
                    { value: "shoppable", label: "Shoppable television" },
                  ],
                },
                { name: "notes", label: "Anything else", type: "textarea" },
              ]}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <Notice tone="volt" title="Editorial firewall">
            Advertising and sponsorship buy inventory and association. They do not buy editorial
            coverage, chart position, or NEXT UP selection, and the sales team has no route into
            those decisions.{" "}
            <Link href="/legal/editorial-standards" className="underline hover:text-bone">Read the standard</Link>.
          </Notice>
          <Card className="p-4">
            <p className="eyebrow text-silver">Measurement</p>
            <p className="mt-2 text-sm text-bone-dim">
              Owned-and-operated delivery is measured first-party. Nielsen-compatible measurement is
              obtained where it is commercially appropriate, at the point carriage justifies it — we
              do not claim ratings we have not bought.
            </p>
          </Card>
        </aside>
      </section>
    </div>
  );
}
