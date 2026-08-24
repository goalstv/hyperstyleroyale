import type { Metadata } from "next";
import Link from "next/link";
import {
  getArtist, getSubmissions, getSubmissionPlans, getNextUpChart, getSchedule,
} from "@/lib/repo";
import { Badge, Button, Card, Field, KeyValue, Notice, SectionHeader, Stat, Table, Td, Th } from "@/components/ui";
import { ArtSurface } from "@/components/cards";
import { SIGNAL_LABELS } from "@/lib/index-engine";
import { Meter } from "@/components/ui";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { SUBMISSION_PLAN_BY_ID } from "@/data/monetization";
import type { SignalKey } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Artist portal",
  description: "Manage your profile, submissions, rights documentation, and verified airtime reporting.",
};

/**
 * Artist portal.
 *
 * Signed in as a demonstration artist so every surface can be walked through.
 * The reporting shown is the network's own delivery log — the only airtime data
 * we will ever show an artist, because it is the only kind we can verify.
 */
export default async function ArtistPortalPage() {
  const [artist, submissions, plans, nextUp, schedule] = await Promise.all([
    getArtist("kp-verse"), getSubmissions(), getSubmissionPlans(), getNextUpChart(), getSchedule(0),
  ]);

  if (!artist) return null;

  const mySubmissions = submissions.filter((s) => s.artistName === artist.name || s.artistName === "North Pierre");
  const myNextUp = nextUp.find((e) => e.artistId === artist.id);
  const signals = (Object.entries(artist.signals) as [SignalKey, number][])
    .sort((a, b) => b[1] - a[1]).slice(0, 8);
  const plan = SUBMISSION_PLAN_BY_ID.get("plan_pro");

  // Demonstration airtime derived from the real schedule so the figures are at
  // least internally consistent.
  const airings = schedule.filter((i) => i.kind === "episode").slice(0, 5);

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="volt">Verified artist</Badge>
        <Badge tone="warn">Demonstration account</Badge>
      </div>
      <h1 className="display mt-3 text-5xl text-bone sm:text-6xl">Artist portal</h1>
      <p className="mt-3 max-w-3xl text-lg text-bone-dim">
        Signed in as <span className="text-bone">{artist.name}</span>. Manage your profile,
        catalogue, rights documentation, and submissions, and see verified airtime.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Plan" value={plan?.name ?? "Professional"} sub={`$${plan?.priceUsd ?? 29} ${plan?.cadence ?? "per month"}`} tone="volt" />
        <Stat label="Submissions" value={mySubmissions.length} sub="This account" />
        <Stat label="NEXT UP position" value={myNextUp ? `#${myNextUp.rank}` : "—"} sub="Emerging edition" tone={myNextUp ? "good" : "neutral"} />
        <Stat label="Airings logged" value={airings.length} sub="Last 7 days, demonstration" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-10">
          {/* ------------------------------------------------------ submissions */}
          <section aria-labelledby="submissions">
            <SectionHeader
              id="submissions"
              eyebrow="Your queue"
              title="Submissions"
              action={<Button href="/submit" size="sm">New submission</Button>}
            />
            <Card className="mt-5 overflow-hidden">
              <Table caption="Your submissions and their editorial status">
                <thead>
                  <tr><Th>Track</Th><Th>Submitted</Th><Th>Plan</Th><Th>Versions</Th><Th>Rights docs</Th><Th>Status</Th></tr>
                </thead>
                <tbody>
                  {mySubmissions.map((s) => (
                    <tr key={s.id} className="hover:bg-ink-3/50">
                      <Td>
                        <span className="font-semibold text-bone">{s.trackTitle}</span>
                        <span className="mt-0.5 block text-xs text-silver">
                          {s.isrc ? `ISRC ${s.isrc}` : "No ISRC provided"}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap text-xs">{fmtDate(s.submittedIso)}</Td>
                      <Td className="whitespace-nowrap text-xs">{SUBMISSION_PLAN_BY_ID.get(s.planId)?.name ?? s.planId}</Td>
                      <Td className="text-xs">
                        {s.cleanVersion ? "Clean" : ""}{s.cleanVersion && s.explicitVersion ? " + " : ""}
                        {s.explicitVersion ? "Explicit" : ""}
                      </Td>
                      <Td>
                        <Badge tone={s.rightsDocsProvided ? "good" : "bad"}>
                          {s.rightsDocsProvided ? "On file" : "Missing"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge tone={s.status === "accepted" ? "good" : s.status === "declined" ? "neutral" : s.status === "editorial_hold" ? "warn" : "volt"}>
                          {s.status.replace(/_/g, " ")}
                        </Badge>
                        {s.notes ? <span className="mt-1 block text-xs text-silver">{s.notes}</span> : null}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </section>

          {/* --------------------------------------------------------- reporting */}
          <section aria-labelledby="airtime">
            <SectionHeader
              id="airtime"
              eyebrow="Verified only"
              title="Airtime & performance"
              description="Airings come from the network's own playout log. We do not report estimated plays or third-party figures we cannot verify."
            />
            <Card className="mt-5 overflow-hidden">
              <Table caption="Verified airtime log">
                <thead><tr><Th>Programme</Th><Th>Channel</Th><Th>Aired</Th><Th>Daypart</Th><Th>Feed</Th></tr></thead>
                <tbody>
                  {airings.map((a) => (
                    <tr key={a.id}>
                      <Td className="font-semibold text-bone">{a.title}</Td>
                      <Td className="whitespace-nowrap text-xs">RAP TRENDS TV</Td>
                      <Td className="whitespace-nowrap text-xs">{fmtDateTime(a.startIso)}</Td>
                      <Td className="whitespace-nowrap text-xs capitalize">{a.daypart}</Td>
                      <Td><Badge tone={a.explicitAllowed ? "warn" : "good"}>{a.explicitAllowed ? "Explicit" : "Clean"}</Badge></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
            <p className="mt-3 text-xs text-silver">
              Enterprise accounts can pull the same log through the API with market-level detail.
            </p>
          </section>

          {/* ----------------------------------------------------------- signals */}
          <section aria-labelledby="signals">
            <SectionHeader
              id="signals"
              eyebrow="How the Index sees you"
              title="Your signals"
              description="Normalized 0–100 readings from authorized sources. These are the inputs behind any chart position, and the weights are published."
            />
            <Card className="mt-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {signals.map(([key, value]) => (
                  <Meter key={key} label={SIGNAL_LABELS[key]} value={value} tone="volt" />
                ))}
              </div>
              <Link href="/trending/methodology" className="mt-4 inline-block text-sm text-volt-soft underline hover:text-bone">
                How these are weighted
              </Link>
            </Card>
          </section>

          {/* -------------------------------------------------------- promotion */}
          <section aria-labelledby="promotion">
            <SectionHeader
              id="promotion"
              eyebrow="Clearly labelled"
              title="Promotional products"
              description="Paid promotion is available. It is labelled as promotion everywhere it appears, and it is separated from editorial and the chart by policy and by system design."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ["Release promotion", "$1,200", "A labelled promotional placement across the app, site, and social for a release week."],
                ["Tour & event promotion", "$800", "Labelled placement for dated events, with geographic targeting to the markets you are playing."],
                ["Video premiere slot", "$2,400", "A scheduled premiere on the linear channel with a labelled sponsor billboard."],
              ].map(([name, price, body]) => (
                <Card key={name} className="p-4">
                  <p className="font-semibold text-bone">{name}</p>
                  <p className="num mt-1 text-lg text-gold">{price}</p>
                  <p className="mt-2 text-sm text-bone-dim">{body}</p>
                  <Badge tone="warn" className="mt-3">Labelled as promotion</Badge>
                </Card>
              ))}
            </div>
            <div className="mt-5">
              <Notice tone="volt" title="What promotion cannot buy">
                Not a chart position. Not editorial coverage. Not NEXT UP selection. Not a review.
                Editors reviewing your work cannot see whether you have purchased anything.
              </Notice>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <Card className="overflow-hidden">
            <ArtSurface seed={artist.name} ratio="aspect-square" />
            <div className="p-4">
              <p className="display text-2xl text-bone">{artist.name}</p>
              <p className="text-sm text-bone-dim">{artist.city}</p>
              <Button href={`/artists/${artist.slug}`} tone="outline" size="sm" className="mt-3 w-full">
                View public profile
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Profile & rights</p>
            <KeyValue>
              <Field label="Verified">Yes</Field>
              <Field label="Label type">{artist.labelType.replace("_", " ")}</Field>
              <Field label="Territories granted">US, CA</Field>
              <Field label="Licence window">Open</Field>
              <Field label="Publishing">On file</Field>
              <Field label="PRO">On file</Field>
            </KeyValue>
            <Button tone="outline" size="sm" className="mt-3 w-full">Upload rights documentation</Button>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Invitations</p>
            <ul className="space-y-3 text-sm">
              <li className="rounded border border-ink-4 p-3">
                <p className="font-semibold text-bone">BARS — writing conversation</p>
                <p className="mt-1 text-xs text-bone-dim">Taping window: next month. Awaiting your response.</p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded border border-neon/40 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-neon">Accept</span>
                  <span className="rounded border border-ink-4 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-bone-dim">Decline</span>
                </div>
              </li>
              <li className="rounded border border-ink-4 p-3">
                <p className="font-semibold text-bone">NEXT UP application</p>
                <p className="mt-1 text-xs text-bone-dim">In the editorial selection queue.</p>
                <Badge tone="volt" className="mt-2">Under review</Badge>
              </li>
            </ul>
          </Card>

          <Card className="p-4">
            <p className="eyebrow mb-2 text-silver">Plans</p>
            <ul className="space-y-2 text-sm">
              {plans.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-bone-dim">{p.name}</span>
                  <span className="num text-bone">{p.priceUsd === 0 ? "Free" : `$${p.priceUsd}`}</span>
                </li>
              ))}
            </ul>
            <Link href="/submit" className="mt-3 inline-block text-sm text-volt-soft underline hover:text-bone">
              Compare plans
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
