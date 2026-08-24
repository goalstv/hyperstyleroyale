import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Notice, Stat, Table, Td, Th } from "@/components/ui";
import { getAssets, getRightsWindows } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { checkEligibility, expiringSoon, RIGHT_LABELS, PLATFORM_REQUIREMENTS } from "@/lib/rights";
import { nowIso } from "@/lib/clock";
import { fmtDate } from "@/lib/format";
import { ASSET_BY_ID, RIGHTS_BY_ASSET } from "@/data/media";
import type { Platform } from "@/lib/types";

export const metadata = { title: "Rights & compliance" };

/** The destinations an operator most often needs to check an asset against. */
const CHECK_PLATFORMS: Platform[] = ["fast", "ota", "youtube", "radio_affiliate", "web"];

export default async function RightsPage() {
  const { allowed } = await requirePermission("rights.read");
  if (!allowed) return <PermissionDenied permission="rights.read" />;

  const [windows, assets] = await Promise.all([getRightsWindows(), getAssets()]);
  const at = nowIso();
  const expiring = expiringSoon(windows, at, 60);
  const missing = assets.filter((a) => !RIGHTS_BY_ASSET.has(a.id));

  // Build the eligibility matrix operators actually use before scheduling.
  const matrix = assets
    .filter((a) => a.type !== "caption" && a.type !== "transcript")
    .map((asset) => ({
      asset,
      results: CHECK_PLATFORMS.map((platform) => ({
        platform,
        result: checkEligibility({
          asset, window: RIGHTS_BY_ASSET.get(asset.id), platform, territory: "US", atIso: at,
        }),
      })),
    }));

  const blockedCount = matrix.reduce(
    (sum, row) => sum + row.results.filter((r) => !r.result.eligible).length, 0,
  );

  return (
    <div>
      <OsHeader
        title="Rights & compliance"
        subtitle="The gate everything passes through. A missing record is treated as not cleared, never as probably fine."
        actions={
          <Badge tone={missing.length || expiring.length ? "warn" : "good"}>
            {missing.length} missing · {expiring.length} expiring
          </Badge>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Rights records" value={windows.length} sub="On file" />
        <Stat label="Assets with no record" value={missing.length} sub="Delivery blocked" tone={missing.length ? "bad" : "good"} />
        <Stat label="Expiring in 60 days" value={expiring.length} sub="Renewal conversation needed" tone={expiring.length ? "warn" : "good"} />
        <Stat label="Blocked combinations" value={blockedCount} sub="Asset × platform pairs" tone={blockedCount ? "warn" : "good"} />
      </div>

      {missing.length > 0 ? (
        <div className="mb-6">
          <Notice tone="bad" title="Blocked: no rights record">
            <ul className="space-y-1">
              {missing.map((a) => <li key={a.id}>· <span className="text-bone">{a.title}</span></li>)}
            </ul>
            <p className="mt-2">
              These assets cannot be scheduled, delivered, or published on any platform until a
              rights record exists. The scheduler and the distribution control centre both refuse
              them.
            </p>
          </Notice>
        </div>
      ) : null}

      {expiring.length > 0 ? (
        <div className="mb-8">
          <Notice tone="warn" title="Licences expiring">
            <ul className="space-y-1.5">
              {expiring.map((w) => {
                const days = Math.floor((Date.parse(w.endIso as string) - Date.parse(at)) / 86_400_000);
                return (
                  <li key={w.id}>
                    · <span className="text-bone">{ASSET_BY_ID.get(w.assetId)?.title ?? w.assetId}</span> —
                    expires {fmtDate(w.endIso as string)} ({days} days). {w.notes}
                  </li>
                );
              })}
            </ul>
          </Notice>
        </div>
      ) : null}

      <section aria-labelledby="matrix" className="mb-10">
        <h2 id="matrix" className="eyebrow mb-3 text-silver">Eligibility matrix — United States, today</h2>
        <Card className="overflow-hidden">
          <Table caption="Asset eligibility by destination platform">
            <thead>
              <tr>
                <Th>Asset</Th>
                {CHECK_PLATFORMS.map((p) => <Th key={p}>{p.replace("_", " ")}</Th>)}
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ asset, results }) => (
                <tr key={asset.id} className="hover:bg-ink-3/50">
                  <Td>
                    <span className="font-semibold text-bone">{asset.title}</span>
                    <span className="mt-0.5 block text-xs text-silver">
                      {RIGHTS_BY_ASSET.get(asset.id)?.rightsOwner ?? "No rights record"}
                    </span>
                  </Td>
                  {results.map(({ platform, result }) => (
                    <Td key={platform}>
                      {result.eligible ? (
                        <Badge tone={result.warnings.length ? "warn" : "good"}>
                          {result.warnings.length ? "Cleared *" : "Cleared"}
                        </Badge>
                      ) : (
                        <span title={result.blockers.join(" ")} className="cursor-help">
                          <Badge tone="bad">Blocked</Badge>
                        </span>
                      )}
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <p className="mt-2 text-xs text-silver">
          Hover a blocked cell for the reason. An asterisk means cleared with a warning — usually an
          approaching expiry or incomplete QC.
        </p>
      </section>

      <section aria-labelledby="records" className="mb-10">
        <h2 id="records" className="eyebrow mb-3 text-silver">Rights records</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {windows.map((w) => {
            const asset = ASSET_BY_ID.get(w.assetId);
            return (
              <Card key={w.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-bone">{asset?.title ?? w.assetId}</p>
                    <p className="text-xs text-silver">{w.rightsOwner}</p>
                  </div>
                  <Badge tone={w.endIso ? "warn" : "good"}>
                    {w.endIso ? `Until ${fmtDate(w.endIso)}` : "Open window"}
                  </Badge>
                </div>

                <p className="eyebrow mb-1.5 mt-4 text-silver">Rights cleared</p>
                <div className="flex flex-wrap gap-1.5">
                  {w.cleared.map((r) => <Badge key={r} tone="good">{RIGHT_LABELS[r]}</Badge>)}
                </div>

                <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <p className="eyebrow text-silver">Territories</p>
                    <p className="mt-1 text-bone-dim">{w.territories.join(", ")}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-silver">Platforms</p>
                    <p className="mt-1 text-bone-dim">{w.platforms.length} authorized</p>
                  </div>
                  <div>
                    <p className="eyebrow text-silver">Talent release</p>
                    <p className={`mt-1 ${w.talentReleaseOnFile ? "text-neon" : "text-blood"}`}>
                      {w.talentReleaseOnFile ? "On file" : "Not on file"}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow text-silver">Ad restrictions</p>
                    <p className="mt-1 text-bone-dim">
                      {w.adRestrictions.length ? w.adRestrictions.join(", ") : "None"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 border-t border-ink-4 pt-3 text-xs text-bone-dim">{w.notes}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="requirements">
        <h2 id="requirements" className="eyebrow mb-3 text-silver">What each destination requires</h2>
        <Card className="overflow-hidden">
          <Table caption="Rights required by destination">
            <thead><tr><Th>Destination</Th><Th>Rights required</Th></tr></thead>
            <tbody>
              {(Object.keys(PLATFORM_REQUIREMENTS) as Platform[]).map((p) => (
                <tr key={p}>
                  <Td className="whitespace-nowrap font-semibold uppercase text-bone">{p.replace("_", " ")}</Td>
                  <Td className="text-xs">{PLATFORM_REQUIREMENTS[p].map((r) => RIGHT_LABELS[r]).join(" · ")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
