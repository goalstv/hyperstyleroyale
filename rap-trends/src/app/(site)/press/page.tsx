import type { Metadata } from "next";
import Link from "next/link";
import { getCities, getShows, getSyndicatedFormats } from "@/lib/repo";
import { Card, Notice, SectionHeader, Stat, Table, Td, Th } from "@/components/ui";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "Press",
  description: "Network facts, brand assets, and media contacts for RAP TRENDS.",
};

export default async function PressPage() {
  const [shows, cities, formats] = await Promise.all([getShows(), getCities(), getSyndicatedFormats()]);

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">Press</p>
      <h1 className="display mt-2 text-6xl text-bone sm:text-7xl">Press centre</h1>
      <p className="mt-4 max-w-3xl text-lg text-bone-dim">
        Network facts, brand guidance, and contacts. Everything on this page is accurate as written;
        where a thing is planned rather than done, it says so.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Original franchises" value={shows.length} sub="In the launch slate" />
        <Stat label="City bureaus" value={cities.length} sub="Across four continents" tone="volt" />
        <Stat label="Syndicated radio formats" value={formats.length} sub="Clean, automation-ready" />
        <Stat label="Carriage agreements" value="0" sub="None executed. Stated plainly." tone="warn" />
      </div>

      <section className="mt-14">
        <SectionHeader eyebrow="The network" title="Fact sheet" />
        <div className="mt-6">
          <Table caption="RAP TRENDS network fact sheet">
            <tbody>
              {[
                ["Working name", "RAP TRENDS"],
                ["Tagline", "Hip-Hop Is Happening Now."],
                ["Positioning line", "The Real-Time Network for Hip-Hop Culture."],
                ["What it is", "A hip-hop television, radio, and digital media network: a 24/7 linear channel, a FAST and connected-TV channel, a digital and syndicated radio service, a website and applications, and a real-time cultural intelligence platform."],
                ["Primary audience", "Hip-hop fans 18–44, music discovery audiences, independent artists, DJs, producers, managers, labels, and promoters."],
                ["Programming", `${shows.length} original franchises in the launch slate, with ARCHIVE, CULTURE MARKET, and RAP TRENDS AWARDS in development.`],
                ["The chart", "TRENDING 10, ranked by the RAP TRENDS Index — a published, auditable model with fifteen weighted signal types and a public methodology page."],
                ["Editorial policy", "Chart position and editorial coverage are never for sale. Paid promotion is labelled and structurally separated."],
                ["Distribution status", "Digital origination is operational in this build. FAST, cable, over-the-air, and radio distribution all require negotiated agreements that do not currently exist."],
                ["Broadcast licensing", "RAP TRENDS holds no FCC licence and no spectrum. Over-the-air distribution requires a partnership with a licensed station."],
                ["Press contact", "press@raptrends.example (configurable placeholder)"],
                ["Affiliate contact", "affiliates@raptrends.example (configurable placeholder)"],
                ["Sales contact", "sales@raptrends.example (configurable placeholder)"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <Th scope="row" className="w-56 align-top">{k}</Th>
                  <Td className="text-bone-dim">{v}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <SectionHeader eyebrow="Brand" title="Using the RAP TRENDS name and marks" />
          <div className="mt-5 space-y-4 text-bone-dim">
            <p>
              The wordmark is set in a condensed display face, always uppercase, always as two words:
              <span className="text-bone"> RAP TRENDS</span>. It is never abbreviated to
              &ldquo;RT&rdquo; in body copy, and the two words are never split across lines.
            </p>
            <p>
              The palette is black, bone, deep red, electric blue, silver, and restrained neon. The
              red is reserved for live and breaking states; it is not a general accent colour.
            </p>
            <p>
              Do not recolour the mark, place it on a low-contrast background, apply effects to it,
              or use it in a way that implies a partnership, endorsement, or carriage relationship
              that does not exist.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <p className="eyebrow text-silver">Press releases</p>
            <p className="mt-2 text-sm text-bone-dim">
              None issued. This section will carry dated releases once there is something factual to
              announce — we will not pad it with announcements about announcements.
            </p>
          </Card>
          <Card className="p-5">
            <p className="eyebrow mb-3 text-silver">Media newsletter</p>
            <NewsletterForm compact />
          </Card>
        </div>
      </section>

      <div className="mt-12">
        <Notice tone="warn" title="For journalists writing about this build">
          Everything on this site is demonstration data: the artists, records, chart positions,
          stories, campaigns, affiliates, and distribution figures are fictional and were created to
          exercise the platform. No carriage agreement, partnership, endorsement, or licensing
          relationship exists.{" "}
          <Link href="/about" className="underline hover:text-bone">More about the project</Link>.
        </Notice>
      </div>
    </div>
  );
}
