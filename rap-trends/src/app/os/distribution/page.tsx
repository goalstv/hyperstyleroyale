import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Notice, Stat, Table, Td, Th } from "@/components/ui";
import { getAffiliates, getAffiliatePackages, getEndpoints } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { fmtCompact, fmtDateTime, fmtUsd } from "@/lib/format";
import { USER_BY_ID } from "@/data/users";

export const metadata = { title: "Distribution" };

const INTEGRATIONS = [
  ["Cloud playout", "Amagi or comparable", "Adapter defined; vendor not contracted"],
  ["Broadcast encoding", "Vendor TBD", "Specification written"],
  ["Server-side ad insertion", "SSAI vendor TBD", "SCTE-35 markers already in the feed"],
  ["Broadcast contribution", "Vendor TBD", "Redundant path design complete"],
  ["FAST delivery", "Platform-specific", "No agreement in place"],
  ["Cable headend delivery", "Operator-specific", "No agreement in place"],
  ["OTA transmission", "Licensed station partner", "Requires a partnership; RAP TRENDS holds no licence"],
  ["Audience measurement", "Nielsen or comparable", "Obtained when carriage justifies it"],
  ["Music-rights reporting", "PRO reporting services", "Cue sheets generated; reporting not connected"],
];

export default async function DistributionPage() {
  const { allowed } = await requirePermission("distribution.read");
  if (!allowed) return <PermissionDenied permission="distribution.read" />;

  const [endpoints, affiliates, packages] = await Promise.all([
    getEndpoints(), getAffiliates(), getAffiliatePackages(),
  ]);

  const live = endpoints.filter((e) => e.status === "live");
  const errored = endpoints.filter((e) => e.status === "error");
  const revenue = endpoints.reduce((s, e) => s + e.monthlyRevenueUsd, 0);
  const impressions = endpoints.reduce((s, e) => s + e.monthlyImpressions, 0);

  return (
    <div>
      <OsHeader
        title="Distribution control centre"
        subtitle="Every destination the network delivers to, what it is receiving, when it last succeeded, and who owns it."
        actions={<Badge tone={errored.length ? "bad" : "good"}>{live.length} live · {errored.length} failing</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Live endpoints" value={live.length} sub={`of ${endpoints.length} configured`} tone="good" />
        <Stat label="Failing" value={errored.length} sub="Needs attention now" tone={errored.length ? "bad" : "good"} />
        <Stat label="Monthly revenue" value={fmtUsd(revenue, true)} sub="Across live endpoints" tone="gold" />
        <Stat label="Monthly impressions" value={fmtCompact(impressions)} sub="All platforms" tone="volt" />
      </div>

      {errored.length > 0 ? (
        <div className="mb-6">
          <Notice tone="bad" title="Delivery failures">
            <ul className="space-y-1.5">
              {errored.map((e) => (
                <li key={e.id}>
                  · <span className="text-bone">{e.name}</span> — {e.lastError}
                  {!e.rightsEligible ? " This endpoint is currently rights-ineligible." : ""}
                </li>
              ))}
            </ul>
          </Notice>
        </div>
      ) : null}

      <Card className="mb-10 overflow-hidden">
        <Table caption="Distribution endpoints">
          <thead>
            <tr>
              <Th>Destination</Th><Th>Package</Th><Th>Status</Th><Th>Territory</Th>
              <Th>Schedule</Th><Th>Last success</Th><Th>Rights</Th><Th>Revenue</Th><Th>Owner</Th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((e) => (
              <tr key={e.id} className={e.status === "error" ? "bg-blood/8" : "hover:bg-ink-3/50"}>
                <Td>
                  <span className="font-semibold text-bone">{e.name}</span>
                  <span className="mt-0.5 block text-xs text-silver">{e.technicalFormat}</span>
                </Td>
                <Td className="text-xs">{e.package}</Td>
                <Td>
                  <Badge tone={e.status === "live" ? "good" : e.status === "error" ? "bad" : e.status === "prospect" ? "neutral" : "warn"}>
                    {e.status}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap text-xs">{e.territory}</Td>
                <Td className="whitespace-nowrap text-xs">{e.scheduledDelivery}</Td>
                <Td className="whitespace-nowrap text-xs">{e.lastSuccessIso ? fmtDateTime(e.lastSuccessIso) : "—"}</Td>
                <Td>
                  <Badge tone={e.rightsEligible ? "good" : "bad"}>{e.rightsEligible ? "Eligible" : "Blocked"}</Badge>
                </Td>
                <Td className="num whitespace-nowrap">{e.monthlyRevenueUsd ? fmtUsd(e.monthlyRevenueUsd, true) : "—"}</Td>
                <Td className="whitespace-nowrap text-xs">{USER_BY_ID.get(e.ownerUserId)?.name ?? e.ownerUserId}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <section aria-labelledby="affiliates" className="mb-10">
        <h2 id="affiliates" className="eyebrow mb-3 text-silver">Affiliate pipeline</h2>
        <Card className="overflow-hidden">
          <Table caption="Affiliate stations and their status">
            <thead>
              <tr><Th>Station / group</Th><Th>Market</Th><Th>Type</Th><Th>Package</Th><Th>Status</Th><Th>Exclusivity</Th></tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.id} className="hover:bg-ink-3/50">
                  <Td className="font-semibold text-bone">{a.station}</Td>
                  <Td className="whitespace-nowrap">{a.market}</Td>
                  <Td className="whitespace-nowrap uppercase text-xs">{a.kind}</Td>
                  <Td className="text-xs">{packages.find((p) => p.id === a.packageId)?.name ?? a.packageId}</Td>
                  <Td>
                    <Badge tone={a.status === "on_air" ? "good" : a.status === "contracted" ? "volt" : a.status === "in_negotiation" ? "warn" : "neutral"}>
                      {a.status.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td className="text-xs">{a.exclusivityWindow ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <p className="mt-2 text-xs text-silver">
          Demonstration pipeline. No carriage agreement has been executed in any market.
        </p>
      </section>

      <section aria-labelledby="integrations">
        <h2 id="integrations" className="eyebrow mb-3 text-silver">Build versus integrate</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <p className="font-semibold text-bone">RAP TRENDS OS builds directly</p>
            <ul className="mt-3 space-y-1.5 text-sm text-bone-dim">
              {["Editorial CMS", "Google Drive workflow", "Media catalogue", "Rights metadata and the rights gate",
                "Programming calendar and validation", "Distribution dashboard", "User management and permissions",
                "Analytics aggregation", "Approval workflows"].map((x) => (
                <li key={x} className="flex gap-2"><span aria-hidden className="text-neon">·</span><span>{x}</span></li>
              ))}
            </ul>
          </Card>
          <Card className="overflow-hidden">
            <div className="p-5 pb-3">
              <p className="font-semibold text-bone">Integrated, not rebuilt</p>
              <p className="mt-1 text-sm text-bone-dim">
                Each sits behind an adapter interface so the vendor can be replaced without touching
                the control layer.
              </p>
            </div>
            <Table caption="Third-party integration status">
              <thead><tr><Th>Capability</Th><Th>Vendor</Th><Th>Status</Th></tr></thead>
              <tbody>
                {INTEGRATIONS.map(([cap, vendor, status]) => (
                  <tr key={cap}>
                    <Td className="whitespace-nowrap font-semibold text-bone">{cap}</Td>
                    <Td className="text-xs">{vendor}</Td>
                    <Td className="text-xs text-amber">{status}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </section>
    </div>
  );
}
