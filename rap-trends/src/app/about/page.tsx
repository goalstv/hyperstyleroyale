import type { Metadata } from "next";
import Link from "next/link";
import { Card, Notice, SectionHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: "What RAP TRENDS is, what it is not, and how the network is being built.",
};

const PHASES = [
  ["Phase 1 — Digital proof of concept", "Website, live internet radio, six to eight hours of daily video programming repeated as a 24/7 channel, the trending chart, artist submissions, the editorial dashboard, YouTube and social distribution, email and push."],
  ["Phase 2 — FAST launch", "Cloud playout, EPG, SCTE-35 ad markers, connected-TV applications, the advertising system, and distribution conversations with FAST aggregators and platforms."],
  ["Phase 3 — Radio syndication", "The clean affiliate feed, hourly reports, the weekend countdown, the affiliate portal, and first market partnerships."],
  ["Phase 4 — OTA pilot", "A subchannel or programming partnership with an existing licensed station in one influential market, testing local advertising, events, interactive voting, and regional content."],
  ["Phase 5 — Cable and national affiliate expansion", "Measurement where commercially appropriate, a national affiliate sales operation, carriage negotiation, and market-specific feeds."],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">About</p>
      <h1 className="display mt-2 text-6xl text-bone sm:text-7xl">What RAP TRENDS is</h1>
      <p className="mt-5 text-xl leading-relaxed text-bone-dim">
        A hip-hop television, radio, and digital network built for how the culture actually moves
        now — fast, everywhere at once, and increasingly driven by artists who own their own
        businesses.
      </p>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-bone-dim">
        <p>
          The channels that shaped this format — MTV, BET, Rap City, 106 &amp; Park, The Box, and the
          urban radio that carried all of it — worked because they were programmed by people with
          taste who were paying attention. What they did not have was a way to see what was
          happening in real time, and what they eventually lost was the trust that the countdown
          meant something.
        </p>
        <p>
          RAP TRENDS is built around both problems. The Index is a published, auditable model rather
          than a black box, and the firewall between commercial relationships and editorial
          decisions is written down, enforced in software, and stated on every page where it
          matters. A record does not chart because someone bought a plan. It charts because the
          evidence says it should, and if the evidence is thin we say so on air.
        </p>
      </div>

      <SectionHeader eyebrow="Being direct" title="What this is not" />
      <div className="mt-5 space-y-4 text-bone-dim">
        <p>
          <strong className="text-bone">This is not a distribution guarantee.</strong> Building
          excellent origination software does not secure cable carriage, a FAST slot, or a broadcast
          licence. Those are commercial negotiations and, in the over-the-air case, a regulated
          licence held by someone else. Every distribution surface in this product says exactly
          where things stand.
        </p>
        <p>
          <strong className="text-bone">This is not a music service.</strong> RAP TRENDS does not
          host, download, or rebroadcast copyrighted recordings. It schedules and delivers content
          for which rights have been documented, and it blocks anything that has not been.
        </p>
        <p>
          <strong className="text-bone">This is not legal advice.</strong> The compliance
          architecture in this product encodes a serious reading of the obligations involved, and it
          is not a substitute for qualified broadcast counsel and music-licensing professionals, who
          must review and approve the operating model before anything transmits.
        </p>
      </div>

      <SectionHeader eyebrow="How it gets built" title="Five phases" />
      <ol className="mt-6 space-y-4">
        {PHASES.map(([title, body], i) => (
          <li key={title}>
            <Card className="p-5">
              <p className="num text-xs text-silver">{String(i + 1).padStart(2, "0")}</p>
              <p className="display mt-1 text-2xl text-bone">{title}</p>
              <p className="mt-2 text-sm text-bone-dim">{body}</p>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <Notice tone="volt" title="The operating system behind it">
          RAP TRENDS OS is the newsroom, media library, programming calendar, channel origination,
          distribution control centre, advertising system, and rights engine, running as one product.{" "}
          <Link href="/os" className="underline hover:text-bone">Look inside RAP TRENDS OS</Link>.
        </Notice>
      </div>
    </div>
  );
}
