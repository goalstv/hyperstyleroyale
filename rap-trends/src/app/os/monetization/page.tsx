import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Meter, Notice, Stat, Table, Td, Th } from "@/components/ui";
import { getAdvertisers, getCampaigns, getSponsorOpportunities, getAssets, getRightsForAsset } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { completionRate, evaluatePlacement, pacing, RESTRICTED_LABELS } from "@/lib/ad-safety";
import { nowIso } from "@/lib/clock";
import { fmtCompact, fmtDate, fmtUsd } from "@/lib/format";
import { ADVERTISER_BY_ID } from "@/data/monetization";
import { RIGHTS_BY_ASSET } from "@/data/media";

export const metadata = { title: "Advertising" };

export default async function MonetizationPage() {
  const { allowed, user } = await requirePermission("ads.read");
  if (!allowed) return <PermissionDenied permission="ads.read" />;

  const [campaigns, advertisers, sponsors, assets] = await Promise.all([
    getCampaigns(), getAdvertisers(), getSponsorOpportunities(), getAssets(),
  ]);

  const at = nowIso();
  const live = campaigns.filter((c) => c.status === "live");
  const pending = campaigns.filter((c) => c.status === "pending_compliance");
  const booked = campaigns.reduce((s, c) => s + c.budgetUsd, 0);
  const delivered = campaigns.reduce((s, c) => s + c.deliveredUsd, 0);
  const canApprove = user.roles.includes("rights_compliance") || user.roles.includes("founder_admin");

  // Run a real placement check for each restricted campaign against a primetime
  // FAST break inside a network-owned programme.
  const sampleAsset = assets.find((a) => a.id === "asset_perf_01");
  const decisions = campaigns
    .filter((c) => c.restrictedCategory)
    .map((campaign) => ({
      campaign,
      primetimeFast: evaluatePlacement({
        campaign, platform: "fast", daypart: "primetime", territory: "US",
        asset: sampleAsset, assetRights: sampleAsset ? RIGHTS_BY_ASSET.get(sampleAsset.id) : undefined,
      }),
      lateFast: evaluatePlacement({
        campaign, platform: "fast", daypart: "late", territory: "US",
        asset: sampleAsset, assetRights: sampleAsset ? RIGHTS_BY_ASSET.get(sampleAsset.id) : undefined,
      }),
      ota: evaluatePlacement({
        campaign, platform: "ota", daypart: "late", territory: "US",
        asset: sampleAsset, assetRights: sampleAsset ? RIGHTS_BY_ASSET.get(sampleAsset.id) : undefined,
      }),
    }));

  return (
    <div>
      <OsHeader
        title="Advertising & sponsorship"
        subtitle="Campaigns, pacing, delivery, and the compliance gate that decides where a spot may run."
        actions={<Badge tone={pending.length ? "warn" : "good"}>{pending.length} awaiting compliance</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Booked" value={fmtUsd(booked, true)} sub="All campaigns" tone="gold" />
        <Stat label="Delivered" value={fmtUsd(delivered, true)} sub={`${((delivered / booked) * 100).toFixed(0)}% of booked`} />
        <Stat label="Live campaigns" value={live.length} sub={`${campaigns.length} total`} tone="volt" />
        <Stat label="Make-goods owed" value={fmtCompact(campaigns.reduce((s, c) => s + c.makeGoodImpressions, 0))} sub="Impressions" tone={campaigns.some((c) => c.makeGoodImpressions) ? "warn" : "good"} />
      </div>

      <Card className="mb-8 overflow-hidden">
        <Table caption="Campaign delivery and pacing">
          <thead>
            <tr>
              <Th>Campaign</Th><Th>Advertiser</Th><Th>Flight</Th><Th>Budget</Th>
              <Th>Pacing</Th><Th>Impressions</Th><Th>Completion</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const p = pacing(c, at);
              const advertiser = ADVERTISER_BY_ID.get(c.advertiserId);
              return (
                <tr key={c.id} className="hover:bg-ink-3/50">
                  <Td>
                    <span className="font-semibold text-bone">{c.name}</span>
                    {c.restrictedCategory ? (
                      <span className="mt-1 block">
                        <Badge tone="warn">{RESTRICTED_LABELS[c.restrictedCategory]}</Badge>
                      </span>
                    ) : null}
                  </Td>
                  <Td className="whitespace-nowrap text-xs">{advertiser?.name ?? c.advertiserId}</Td>
                  <Td className="whitespace-nowrap text-xs">{fmtDate(c.startIso)} → {fmtDate(c.endIso)}</Td>
                  <Td className="num whitespace-nowrap">{fmtUsd(c.budgetUsd, true)}</Td>
                  <Td className="min-w-32">
                    {c.status === "live" ? (
                      <Meter
                        label={`${(p * 100).toFixed(0)}%`}
                        value={Math.min(150, p * 100)}
                        max={150}
                        tone={p < 0.85 ? "warn" : p > 1.15 ? "bad" : "good"}
                        showValue={false}
                      />
                    ) : (
                      <span className="text-xs text-silver">—</span>
                    )}
                  </Td>
                  <Td className="num whitespace-nowrap">{c.impressions ? fmtCompact(c.impressions) : "—"}</Td>
                  <Td className="num whitespace-nowrap">{c.impressions ? `${completionRate(c)}%` : "—"}</Td>
                  <Td>
                    <Badge tone={c.status === "live" ? "good" : c.status === "pending_compliance" ? "warn" : "neutral"}>
                      {c.status.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <section aria-labelledby="compliance" className="mb-10">
        <h2 id="compliance" className="eyebrow mb-3 text-silver">Restricted-category placement check</h2>
        <p className="mb-4 max-w-3xl text-sm text-bone-dim">
          Live evaluation against a real programme — the RAP TRENDS SESSIONS performance, whose
          rights record forbids cannabis adjacency. Each result below is produced by the same gate
          that runs at traffic time.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {decisions.map(({ campaign, primetimeFast, lateFast, ota }) => (
            <Card key={campaign.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-bone">{campaign.name}</p>
                  <p className="text-xs text-silver">
                    {RESTRICTED_LABELS[campaign.restrictedCategory!]} · age gate {campaign.ageGate ?? "none"}
                  </p>
                </div>
                <Badge tone={campaign.status === "live" ? "good" : "warn"}>{campaign.status.replace(/_/g, " ")}</Badge>
              </div>

              <div className="mt-4 space-y-3">
                {([
                  ["FAST — primetime", primetimeFast],
                  ["FAST — late", lateFast],
                  ["Over-the-air — late", ota],
                ] as const).map(([label, decision]) => (
                  <div key={label} className="rounded border border-ink-4 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-bone">{label}</p>
                      <Badge tone={decision.allowed ? "good" : "bad"}>{decision.allowed ? "Allowed" : "Refused"}</Badge>
                    </div>
                    {decision.blockers.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-xs text-bone-dim">
                        {decision.blockers.map((b) => <li key={b}>· {b}</li>)}
                      </ul>
                    ) : null}
                    {decision.warnings.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-xs text-amber">
                        {decision.warnings.map((w) => <li key={w}>· {w}</li>)}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>

              {campaign.status === "pending_compliance" ? (
                <p className="mt-4 text-xs text-silver">
                  {canApprove
                    ? "You can clear this campaign for traffic once the category conditions are satisfied."
                    : "Only the rights and compliance manager can clear a restricted-category campaign."}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="rate-card" className="mb-10">
        <h2 id="rate-card" className="eyebrow mb-3 text-silver">Sponsorship inventory</h2>
        <Card className="overflow-hidden">
          <Table caption="Sponsorship opportunities and inventory">
            <thead><tr><Th>Opportunity</Th><Th>Franchise</Th><Th>Rate</Th><Th>Unit</Th><Th>Inventory</Th></tr></thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id}>
                  <Td className="font-semibold text-bone">{s.name}</Td>
                  <Td className="whitespace-nowrap text-xs">{s.franchise}</Td>
                  <Td className="num whitespace-nowrap text-gold">{fmtUsd(s.rateCardUsd)}</Td>
                  <Td className="whitespace-nowrap text-xs">{s.unit}</Td>
                  <Td className="num whitespace-nowrap">{s.inventoryPerMonth} / month</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </section>

      <section aria-labelledby="advertisers" className="mb-8">
        <h2 id="advertisers" className="eyebrow mb-3 text-silver">Advertisers</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {advertisers.map((a) => (
            <Card key={a.id} className="p-4">
              <p className="font-semibold text-bone">{a.name}</p>
              <p className="text-xs text-silver">{a.category}</p>
              {a.restrictedCategory ? (
                <Badge tone="warn" className="mt-2">{RESTRICTED_LABELS[a.restrictedCategory]}</Badge>
              ) : (
                <Badge tone="good" className="mt-2">Standard category</Badge>
              )}
            </Card>
          ))}
        </div>
      </section>

      <Notice tone="volt" title="Editorial firewall, in software">
        The sales console has no write path into the newsroom, the chart, or NEXT UP selection.
        Campaign records carry no field that could influence editorial scoring, and editors reviewing
        a submission cannot see the submitter&apos;s plan or any commercial relationship.
      </Notice>
    </div>
  );
}
