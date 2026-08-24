import type { Metadata } from "next";
import Link from "next/link";
import {
  getAffiliatePackages, getAffiliates, getSyndicatedFormats, getSchedule, getShows,
} from "@/lib/repo";
import { Badge, Button, Card, Field, KeyValue, Notice, SectionHeader, Stat, Table, Td, Th } from "@/components/ui";
import { fmtDate, fmtTime } from "@/lib/format";
import { formatDuration } from "@/lib/schedule";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Affiliate portal",
  description: "Schedules, metadata, feeds, promotional assets, technical specifications, and local-insertion reporting for RAP TRENDS affiliates.",
};

const ASSETS = [
  ["Network logo pack", "SVG, EPS, PNG — light and dark, with clear-space rules", "2.4 MB"],
  ["On-air imaging", "Station-brandable IDs, bumpers, and sweepers", "180 MB"],
  ["Programme artwork", "16:9, 9:16, 1:1 key art for every franchise", "94 MB"],
  ["Radio imaging", "Sung and spoken IDs, beds, and stingers", "48 MB"],
  ["Sales one-sheet", "Audience, franchises, and local avail structure", "1.1 MB"],
  ["Technical specification", "Delivery, formats, cue tones, captions, and monitoring", "620 KB"],
];

export default async function AffiliatePortalPage() {
  const [packages, affiliates, formats, schedule, shows] = await Promise.all([
    getAffiliatePackages(), getAffiliates(), getSyndicatedFormats(), getSchedule(0), getShows(),
  ]);

  const affiliate = affiliates[0];
  const pkg = packages.find((p) => p.id === affiliate.packageId);
  const programmes = schedule.filter((i) => i.kind === "episode" || i.kind === "live_window").slice(0, 12);

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="volt">Affiliate access</Badge>
        <Badge tone="warn">Demonstration account</Badge>
      </div>
      <h1 className="display mt-3 text-5xl text-bone sm:text-6xl">Affiliate portal</h1>
      <p className="mt-3 max-w-3xl text-lg text-bone-dim">
        Signed in as <span className="text-bone">{affiliate.station}</span> — {affiliate.market}.
        Everything you need to carry, brand, sell, and report the network.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Package" value={pkg?.name ?? "—"} sub={pkg?.priceModel ?? ""} tone="volt" />
        <Stat label="Status" value={affiliate.status.replace(/_/g, " ")} sub="Contract stage" tone="warn" />
        <Stat label="Local avails" value={`${pkg?.localAvailsPerHour ?? 0}/hr`} sub="Reserved for you" tone="gold" />
        <Stat label="Feed" value="Clean" sub="Explicit never rides a broadcast feed" tone="good" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-10">
          <section aria-labelledby="schedule">
            <SectionHeader
              id="schedule"
              eyebrow="Today"
              title="Schedule & metadata"
              description="The same grid that drives the EPG. Machine-readable at /api/epg in XMLTV or JSON."
              action={<Button href="/api/epg?format=xmltv" tone="outline" size="sm">XMLTV feed</Button>}
            />
            <Card className="mt-5 overflow-hidden">
              <Table caption="Today's programme schedule for affiliates">
                <thead><tr><Th>Start</Th><Th>Programme</Th><Th>Franchise</Th><Th>Runs</Th><Th>Feed</Th></tr></thead>
                <tbody>
                  {programmes.map((p) => {
                    const show = shows.find((s) => s.id === p.showId);
                    return (
                      <tr key={p.id}>
                        <Td className="num whitespace-nowrap text-bone">{fmtTime(p.startIso)}</Td>
                        <Td className="font-semibold text-bone">{p.title}</Td>
                        <Td className="whitespace-nowrap text-xs">{show?.pillar ?? "—"}</Td>
                        <Td className="num whitespace-nowrap">{formatDuration(p.durationSeconds)}</Td>
                        <Td><Badge tone="good">Clean</Badge></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          </section>

          <section aria-labelledby="radio">
            <SectionHeader id="radio" eyebrow="Radio" title="Syndicated programmes" />
            <Card className="mt-5 overflow-hidden">
              <Table caption="Syndicated radio programmes and delivery windows">
                <thead><tr><Th>Programme</Th><Th>Length</Th><Th>Cadence</Th><Th>Delivery</Th></tr></thead>
                <tbody>
                  {formats.map((f) => (
                    <tr key={f.id}>
                      <Td>
                        <span className="font-semibold text-bone">{f.name}</span>
                        <span className="mt-0.5 block text-xs text-silver">{f.description}</span>
                      </Td>
                      <Td className="num whitespace-nowrap">{f.length}</Td>
                      <Td className="whitespace-nowrap text-xs">{f.cadence}</Td>
                      <Td className="text-xs">{f.deliveryWindow}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </section>

          <section aria-labelledby="reporting">
            <SectionHeader
              id="reporting"
              eyebrow="Required monthly"
              title="Local insertion reporting"
              description="Report what you inserted into the reserved avails. We reconcile against our own delivery log and issue the affidavit."
            />
            <Card className="mt-5 p-5">
              <form className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="period" className="text-sm text-bone">Reporting period</label>
                  <input id="period" type="month" className="mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone" />
                </div>
                <div>
                  <label htmlFor="spots" className="text-sm text-bone">Local spots inserted</label>
                  <input id="spots" type="number" min={0} placeholder="0" className="mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone placeholder:text-silver" />
                </div>
                <div>
                  <label htmlFor="minutes" className="text-sm text-bone">Total local minutes</label>
                  <input id="minutes" type="number" min={0} placeholder="0" className="mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone placeholder:text-silver" />
                </div>
                <div>
                  <label htmlFor="categories" className="text-sm text-bone">Restricted categories inserted</label>
                  <select id="categories" className="mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone">
                    <option>None</option><option>Alcohol</option><option>Gambling</option><option>Political</option><option>Pharmaceutical</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="text-sm text-bone">Preemptions or notes</label>
                  <textarea id="notes" rows={3} className="mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone" />
                </div>
              </form>
              <p className="mt-3 text-xs text-silver">
                Demonstration form — reporting is not persisted in this build.
              </p>
              <div className="mt-4">
                <Notice tone="warn" title="Restricted categories in local inventory">
                  The network&apos;s restricted-category rules apply to inventory you insert as well
                  as to ours. Cannabis advertising is not permitted on any broadcast or MVPD feed
                  regardless of state legality, and political inventory carries political-file and
                  lowest-unit-charge obligations that remain yours as the licensee.
                </Notice>
              </div>
            </Card>
          </section>

          <section aria-labelledby="specs">
            <SectionHeader id="specs" eyebrow="Engineering" title="Technical specifications" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <p className="font-semibold text-bone">Television</p>
                <KeyValue>
                  <Field label="Delivery">Secure IP; satellite by agreement</Field>
                  <Field label="Video">1080i/59.94 or 1080p/59.94</Field>
                  <Field label="Audio">Stereo, -24 LKFS, CALM compliant</Field>
                  <Field label="Captions">CEA-608/708, pass through without re-encode</Field>
                  <Field label="Cue signalling">SCTE-35 / SCTE-104</Field>
                  <Field label="Ratings">V-chip, per programme</Field>
                  <Field label="Local windows">8–12 min/hour</Field>
                </KeyValue>
              </Card>
              <Card className="p-5">
                <p className="font-semibold text-bone">Radio</p>
                <KeyValue>
                  <Field label="Delivery">Secure IP; satellite by agreement</Field>
                  <Field label="Codec">AAC 128 kb/s stereo</Field>
                  <Field label="Metadata">Now-playing, artwork, programme info</Field>
                  <Field label="Cue tones">Standard, at every local window</Field>
                  <Field label="Legal ID">Top-of-hour window reserved</Field>
                  <Field label="Emergency">Station retains full override and EAS</Field>
                  <Field label="Local windows">12 min/hour</Field>
                </KeyValue>
              </Card>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Your agreement</p>
            <KeyValue>
              <Field label="Station">{affiliate.station}</Field>
              <Field label="Market">{affiliate.market}</Field>
              <Field label="Type">{affiliate.kind.toUpperCase()}</Field>
              <Field label="Package">{pkg?.name ?? "—"}</Field>
              <Field label="Exclusivity">{affiliate.exclusivityWindow ?? "Not yet agreed"}</Field>
              <Field label="Last report">{affiliate.lastReportIso ? fmtDate(affiliate.lastReportIso) : "None filed"}</Field>
            </KeyValue>
            <p className="mt-3 text-xs text-amber">
              Demonstration record. No carriage agreement has been executed.
            </p>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Promotional assets</p>
            <ul className="space-y-2">
              {ASSETS.map(([name, desc, size]) => (
                <li key={name} className="flex items-start justify-between gap-2 border-b border-ink-4/50 pb-2 last:border-0">
                  <span className="min-w-0">
                    <span className="block text-sm text-bone">{name}</span>
                    <span className="block text-xs text-silver">{desc}</span>
                  </span>
                  <span className="num shrink-0 text-xs text-silver">{size}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-silver">Asset delivery is not wired in this build.</p>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Feeds</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/api/epg?format=xmltv" className="text-volt-soft underline hover:text-bone">EPG — XMLTV</Link></li>
              <li><Link href="/api/epg" className="text-volt-soft underline hover:text-bone">EPG — JSON</Link></li>
              <li><Link href="/api/schedule" className="text-volt-soft underline hover:text-bone">Schedule with validation report</Link></li>
              <li><Link href="/api/index/chart" className="text-volt-soft underline hover:text-bone">Chart data</Link></li>
              <li><Link href="/api/health" className="text-volt-soft underline hover:text-bone">Feed health</Link></li>
            </ul>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Local segment insertion</p>
            <p className="mt-1 text-sm text-bone-dim">
              Approved local segments can be inserted into designated windows. Segments are reviewed
              against the network&apos;s content standards before approval, and the schedule marks
              where they may run.
            </p>
            <Button tone="outline" size="sm" className="mt-3 w-full">Submit a local segment</Button>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Packages</p>
            <ul className="space-y-2 text-sm">
              {packages.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-bone-dim">{p.name}</span>
                  <span className="num text-xs text-silver">{p.hoursPerWeek} h/wk</span>
                </li>
              ))}
            </ul>
            <Link href="/partners" className="mt-3 inline-block text-sm text-volt-soft underline hover:text-bone">
              Compare packages
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
