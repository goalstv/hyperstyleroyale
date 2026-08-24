import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, Card, Notice, SectionHeader } from "@/components/ui";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "Account & membership",
  description: "Create a RAP TRENDS account, choose a membership, and manage your preferences.",
};

const TIERS = [
  {
    name: "Free account", price: "Free", highlight: false,
    features: [
      "Vote on the TRENDING 10 — one vote per record per day",
      "Personalised watch and listen history",
      "Newsletter and push notifications you actually chose",
      "Follow artists and city bureaus",
    ],
  },
  {
    name: "Member", price: "$6 / month", highlight: true,
    features: [
      "Everything in the free account",
      "Ad-free on-demand viewing on owned platforms",
      "Early access to RAP TRENDS SESSIONS episodes",
      "The weekly Index briefing with the full signal breakdown",
      "Member ballot in the RAP TRENDS AWARDS",
      "Priority access to live event tickets",
    ],
  },
  {
    name: "Insider", price: "$18 / month", highlight: false,
    features: [
      "Everything in Member",
      "The quarterly cultural-insight report",
      "Chart data exports and API access for personal use",
      "Access to the archive as chain-of-title clearance completes",
      "Invitations to showcases and tapings",
    ],
  },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
      <p className="eyebrow text-blood">Membership</p>
      <h1 className="display mt-2 text-6xl text-bone sm:text-7xl">Your account</h1>
      <p className="mt-4 max-w-3xl text-lg text-bone-dim">
        An account makes your vote count, keeps your history, and lets you follow the artists and
        cities you care about. A membership pays for programming rather than for placement.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeader eyebrow="Sign in" title="Access your account" />
          <Card className="mt-5 p-6">
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm text-bone">Email address</label>
                <input
                  id="email" type="email" autoComplete="email" placeholder="you@example.com"
                  className="mt-1 w-full rounded border border-ink-4 bg-ink-2 px-3 py-2 text-sm text-bone placeholder:text-silver focus:border-volt"
                />
              </div>
              <Button type="submit" className="w-full">Email me a sign-in link</Button>
              <p className="text-xs text-silver">
                Passwordless by default — we send a single-use link rather than storing another
                password. Passkeys and single sign-on are on the roadmap.
              </p>
            </form>
            <div className="mt-5 border-t border-ink-4 pt-4">
              <Notice tone="warn" title="Demonstration build">
                Authentication is not wired to an identity provider here. The route guard, session
                model, and role matrix are real — see{" "}
                <Link href="/os" className="underline hover:text-bone">RAP TRENDS OS</Link>, where the
                same session module drives every operator permission.
              </Notice>
            </div>
          </Card>

          <div className="mt-8">
            <SectionHeader eyebrow="Stay current" title="Newsletter" />
            <Card className="mt-5 p-6">
              <NewsletterForm />
            </Card>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <p className="eyebrow text-silver">Notification preferences</p>
            <ul className="mt-3 space-y-2 text-sm text-bone-dim">
              <li>· Breaking news — push and email</li>
              <li>· The daily countdown — push</li>
              <li>· NEXT UP discoveries — weekly email</li>
              <li>· Live premieres and events — push</li>
              <li>· Your city bureau — weekly email</li>
            </ul>
            <p className="mt-3 text-xs text-silver">
              Every channel is opt-in individually. We do not bundle consent.
            </p>
          </Card>
          <Card className="p-5">
            <p className="eyebrow text-silver">Are you an artist?</p>
            <p className="mt-2 text-sm text-bone-dim">
              Artist accounts are separate, with catalogue, rights, submission, and reporting tools.
            </p>
            <Button href="/artist-portal" tone="outline" className="mt-4 w-full">Artist portal</Button>
          </Card>
        </aside>
      </div>

      <section className="mt-16">
        <SectionHeader eyebrow="Membership" title="Choose a tier" description="Indicative pricing for demonstration." />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {TIERS.map((t) => (
            <Card key={t.name} className={`p-6 ${t.highlight ? "border-blood ring-1 ring-blood/30" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="display text-3xl text-bone">{t.name}</p>
                {t.highlight ? <Badge tone="live">Popular</Badge> : null}
              </div>
              <p className="num mt-2 text-2xl text-volt-soft">{t.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-bone-dim">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2"><span aria-hidden className="text-neon">·</span><span>{f}</span></li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-silver">
          Membership never affects editorial coverage or chart position. A member&apos;s vote counts
          exactly the same as a free account holder&apos;s.
        </p>
      </section>
    </div>
  );
}
