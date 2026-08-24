import Link from "next/link";
import { Badge, Button, Card, Notice, SectionHeader, Table, Td, Th } from "./ui";

export type SpecRow = { label: string; value: string; note?: string };
export type PitchSection = { title: string; body: string };

/**
 * Shared layout for the four distribution pitch pages. Each one is a document a
 * platform, operator, station group, or radio group can actually evaluate:
 * what we deliver, in what format, on what terms, and what is still unresolved.
 */
export function PitchPage({
  track, title, lede, phase, status, sections, specs, deliverables, openQuestions, ctaLabel = "Request carriage",
}: {
  track: string;
  title: string;
  lede: string;
  phase: string;
  status: { label: string; tone: "good" | "warn" | "neutral" };
  sections: PitchSection[];
  specs: SpecRow[];
  deliverables: string[];
  openQuestions: string[];
  ctaLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-[80rem] px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-silver">
        <Link href="/partners" className="hover:text-bone hover:underline">Distribution partners</Link>
        <span className="mx-2" aria-hidden>/</span>
        <span className="text-bone-dim">{track}</span>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="volt">{phase}</Badge>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <h1 className="display mt-3 text-5xl text-bone sm:text-7xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-bone-dim">{lede}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="display text-2xl text-bone">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-bone-dim">{s.body}</p>
            </section>
          ))}

          <section>
            <SectionHeader eyebrow="Technical" title="Delivery specification" />
            <div className="mt-5">
              <Table caption={`${title} technical specification`}>
                <thead>
                  <tr><Th>Item</Th><Th>Specification</Th></tr>
                </thead>
                <tbody>
                  {specs.map((row) => (
                    <tr key={row.label}>
                      <Td className="whitespace-nowrap font-semibold text-bone">{row.label}</Td>
                      <Td>
                        {row.value}
                        {row.note ? <span className="mt-0.5 block text-xs text-silver">{row.note}</span> : null}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <p className="eyebrow text-silver">What you receive</p>
            <ul className="mt-3 space-y-2 text-sm text-bone-dim">
              {deliverables.map((d) => (
                <li key={d} className="flex gap-2"><span aria-hidden className="text-neon">·</span><span>{d}</span></li>
              ))}
            </ul>
          </Card>

          <Notice tone="warn" title="Open items — stated plainly">
            <ul className="space-y-1.5">
              {openQuestions.map((q) => <li key={q}>· {q}</li>)}
            </ul>
          </Notice>

          <Card className="p-5">
            <p className="eyebrow text-silver">Next step</p>
            <Button href="/partners#request" className="mt-3 w-full">{ctaLabel}</Button>
            <Link href="/affiliate-portal" className="mt-3 block text-center text-sm text-volt-soft underline hover:text-bone">
              Affiliate portal
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
