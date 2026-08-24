import type { Metadata } from "next";
import Link from "next/link";
import { getAffiliatePackages, getEndpoints } from "@/lib/repo";
import { Badge, Button, Card, Notice, SectionHeader, Table, Td, Th } from "@/components/ui";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Distribution partners",
  description: "Carriage, syndication, and distribution partnership material for FAST platforms, cable operators, broadcast stations, and radio groups.",
};

const TRACKS = [
  { href: "/partners/fast", title: "FAST & connected TV", blurb: "A 24/7 linear HLS feed with SCTE-35 markers, XMLTV EPG, and server-side ad insertion readiness.", badge: "Phase 2" },
  { href: "/partners/cable", title: "Cable & virtual MVPD", blurb: "Broadcast-grade linear origination with redundant contribution, 608/708 captions, ratings, and national plus local insertion.", badge: "Phase 5" },
  { href: "/partners/ota", title: "Over-the-air television", blurb: "Subchannel and daypart partnerships with FCC-licensed stations, ATSC 1.0 compatible with an ATSC 3.0 roadmap.", badge: "Phase 4" },
  { href: "/partners/radio", title: "Radio syndication", blurb: "A clean 24/7 feed plus hourly reports, the daily countdown, and a two-hour weekend countdown, automation-ready.", badge: "Phase 3" },
];

export default async function PartnersPage() {
  const [packages, endpoints] = await Promise.all([getAffiliatePackages(), getEndpoints()]);

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <p className="eyebrow text-volt-soft">Distribution</p>
      <h1 className="display mt-2 text-6xl text-bone sm:text-7xl">Carry RAP TRENDS</h1>
      <p className="mt-4 max-w-3xl text-lg text-bone-dim">
        One master programming operation, many feeds. Television and radio affiliates, FAST
        platforms, connected-TV storefronts, cable operators, and virtual MVPDs each receive a feed
        built for their technical and rights requirements.
      </p>

      <Notice tone="warn" title="What software can and cannot do">
        RAP TRENDS OS originates, schedules, validates, and delivers the feeds. It does not, and
        cannot, secure cable carriage, broadcast spectrum, or an FCC licence. Over-the-air
        distribution requires a partnership with an existing FCC-licensed station. Every carriage
        relationship is a negotiated commercial agreement, and none is represented as existing on
        this site.
      </Notice>

      <section aria-labelledby="tracks" className="mt-12">
        <SectionHeader id="tracks" eyebrow="Choose your route" title="Partnership tracks" />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {TRACKS.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="surface block h-full rounded-lg p-6 transition-colors hover:border-silver">
                <Badge tone="volt">{t.badge}</Badge>
                <p className="display mt-3 text-3xl text-bone">{t.title}</p>
                <p className="mt-2 text-sm text-bone-dim">{t.blurb}</p>
                <p className="mt-4 text-sm text-volt-soft">Technical specifications and pitch material →</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="packages" className="mt-14">
        <SectionHeader
          id="packages"
          eyebrow="Affiliate packages"
          title="Three ways to carry the network"
          description="All three are barter in year one — inventory split, no cash licence fee."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {packages.map((p) => (
            <Card key={p.id} className="flex flex-col p-5">
              <Badge tone={p.kind === "both" ? "gold" : "volt"}>{p.kind === "both" ? "TV & radio" : p.kind.toUpperCase()}</Badge>
              <p className="display mt-3 text-3xl text-bone">{p.name}</p>
              <p className="mt-2 text-sm text-bone-dim">{p.summary}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between border-b border-ink-4/60 pb-2">
                  <dt className="text-silver">Hours per week</dt><dd className="num text-bone">{p.hoursPerWeek}</dd>
                </div>
                <div className="flex justify-between border-b border-ink-4/60 pb-2">
                  <dt className="text-silver">Local avails / hour</dt><dd className="num text-bone">{p.localAvailsPerHour}</dd>
                </div>
                <div className="flex justify-between border-b border-ink-4/60 pb-2">
                  <dt className="text-silver">Feed</dt><dd className="text-right text-bone">{p.feed}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-silver">Terms</dt><dd className="text-right text-bone">{p.priceModel}</dd>
                </div>
              </dl>
              <p className="eyebrow mt-4 text-silver">Requirements</p>
              <ul className="mt-2 flex-1 space-y-1 text-sm text-bone-dim">
                {p.requirements.map((r) => (
                  <li key={r} className="flex gap-2"><span aria-hidden className="text-volt-soft">·</span><span>{r}</span></li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-silver">{p.exclusivity}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="status" className="mt-14">
        <SectionHeader
          id="status"
          eyebrow="Where we actually are"
          title="Distribution status"
          description="Published honestly. Prospect means prospect."
        />
        <div className="mt-6">
          <Table caption="Current distribution endpoint status">
            <thead>
              <tr><Th>Destination</Th><Th>Package</Th><Th>Status</Th><Th>Territory</Th><Th>Technical format</Th></tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr key={e.id}>
                  <Td className="font-semibold text-bone">{e.name}</Td>
                  <Td className="text-xs">{e.package}</Td>
                  <Td>
                    <Badge tone={e.status === "live" ? "good" : e.status === "error" ? "bad" : e.status === "prospect" ? "neutral" : "warn"}>
                      {e.status}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-xs">{e.territory}</Td>
                  <Td className="text-xs">{e.technicalFormat}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      <section aria-labelledby="request" className="mt-14 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionHeader id="request" eyebrow="Request carriage" title="Start the conversation" />
          <div className="mt-6">
            <EnquiryForm
              endpoint="/api/carriage"
              submitLabel="Request carriage"
              fields={[
                { name: "station", label: "Station or group", required: true },
                { name: "market", label: "Market", required: true },
                { name: "kind", label: "Type", type: "select", required: true, options: [
                  { value: "tv", label: "Television" }, { value: "radio", label: "Radio" },
                ] },
                { name: "packageId", label: "Package", type: "select", required: true, options: packages.map((p) => ({ value: p.id, label: p.name })) },
                { name: "contactName", label: "Contact name", required: true },
                { name: "contactEmail", label: "Contact email", type: "email", required: true },
                { name: "facilityId", label: "FCC facility ID", help: "If you have one — it speeds up technical and market checks." },
                { name: "notes", label: "Notes", type: "textarea" },
              ]}
            />
          </div>
        </div>
        <aside className="space-y-4">
          <Card className="p-4">
            <p className="eyebrow text-silver">Already an affiliate?</p>
            <p className="mt-2 text-sm text-bone-dim">
              Schedules, metadata, promotional assets, technical specifications, contracts, and
              local-insertion reporting all live in the affiliate portal.
            </p>
            <Button href="/affiliate-portal" className="mt-4 w-full">Open the affiliate portal</Button>
          </Card>
          <Card className="p-4">
            <p className="eyebrow text-silver">Press & investor material</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/press" className="text-volt-soft underline hover:text-bone">Press kit and network facts</Link></li>
              <li><Link href="/about" className="text-volt-soft underline hover:text-bone">About RAP TRENDS</Link></li>
            </ul>
          </Card>
        </aside>
      </section>
    </div>
  );
}
