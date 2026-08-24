import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Notice, Stat, Table, Td, Th } from "@/components/ui";
import { getHealthChecks } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "System health" };

const AREA_LABELS: Record<string, string> = {
  feeds: "Feeds", transcode: "Transcode", captions: "Captions", rights: "Rights",
  delivery: "Delivery", schedule: "Schedule", advertising: "Advertising",
  storage: "Storage", api: "API", drive_sync: "Drive sync", editorial: "Editorial",
};

export default async function HealthPage() {
  const { allowed } = await requirePermission("os.view");
  if (!allowed) return <PermissionDenied permission="os.view" />;

  const checks = await getHealthChecks();
  const failing = checks.filter((c) => c.status === "fail");
  const warning = checks.filter((c) => c.status === "warn");
  const ok = checks.filter((c) => c.status === "ok");
  const areas = [...new Set(checks.map((c) => c.area))];

  return (
    <div>
      <OsHeader
        title="System health"
        subtitle="Feeds, transcodes, captions, licences, deliveries, schedule continuity, advertising, storage, APIs, and the Drive connector."
        actions={
          <Badge tone={failing.length ? "bad" : warning.length ? "warn" : "good"}>
            {failing.length ? "Degraded" : warning.length ? "Warnings" : "Nominal"}
          </Badge>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Healthy" value={ok.length} sub="Checks passing" tone="good" />
        <Stat label="Warnings" value={warning.length} sub="Action needed soon" tone={warning.length ? "warn" : "good"} />
        <Stat label="Failures" value={failing.length} sub="Action needed now" tone={failing.length ? "bad" : "good"} />
      </div>

      {failing.length > 0 ? (
        <div className="mb-6">
          <Notice tone="bad" title="Failing now">
            <ul className="space-y-1.5">
              {failing.map((c) => <li key={c.id}>· <span className="text-bone">{c.label}</span> — {c.detail}</li>)}
            </ul>
          </Notice>
        </div>
      ) : null}

      {areas.map((area) => (
        <section key={area} aria-labelledby={`area-${area}`} className="mb-6">
          <h2 id={`area-${area}`} className="eyebrow mb-2 text-silver">{AREA_LABELS[area] ?? area}</h2>
          <Card className="overflow-hidden">
            <Table caption={`${AREA_LABELS[area] ?? area} health checks`}>
              <thead><tr><Th>Check</Th><Th>Status</Th><Th>Value</Th><Th>Detail</Th><Th>Updated</Th></tr></thead>
              <tbody>
                {checks.filter((c) => c.area === area).map((c) => (
                  <tr key={c.id} className={c.status === "fail" ? "bg-blood/8" : undefined}>
                    <Td className="whitespace-nowrap font-semibold text-bone">{c.label}</Td>
                    <Td>
                      <Badge tone={c.status === "ok" ? "good" : c.status === "warn" ? "warn" : "bad"}>{c.status}</Badge>
                    </Td>
                    <Td className="num whitespace-nowrap">{c.value ?? "—"}</Td>
                    <Td className="text-xs">{c.detail}</Td>
                    <Td className="whitespace-nowrap text-xs">{fmtDateTime(c.updatedIso)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </section>
      ))}

      <Notice tone="volt" title="Alerting">
        Critical failures raise email, SMS, and in-app alerts to the on-call operator, with
        escalation after ten minutes unacknowledged. The health rollup is also exposed at{" "}
        <span className="num text-bone">GET /api/health</span>, which returns 503 while any check is
        failing so an external monitor can page without scraping this page.
      </Notice>
    </div>
  );
}
