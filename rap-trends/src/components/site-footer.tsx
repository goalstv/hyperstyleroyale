import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Watch & listen",
    links: [
      { href: "/live", label: "Live TV" },
      { href: "/radio", label: "Live radio" },
      { href: "/shows", label: "Shows" },
      { href: "/schedule", label: "Schedule" },
      { href: "/videos", label: "Video library" },
    ],
  },
  {
    title: "Music",
    links: [
      { href: "/trending", label: "TRENDING 10" },
      { href: "/trending/methodology", label: "Index methodology" },
      { href: "/next-up", label: "NEXT UP" },
      { href: "/artists", label: "Artists" },
      { href: "/cities", label: "City reports" },
    ],
  },
  {
    title: "Work with us",
    links: [
      { href: "/submit", label: "Submit your music" },
      { href: "/artist-portal", label: "Artist portal" },
      { href: "/partners", label: "Distribution partners" },
      { href: "/affiliate-portal", label: "Affiliate portal" },
      { href: "/advertise", label: "Advertise" },
    ],
  },
  {
    title: "Network",
    links: [
      { href: "/press", label: "Press" },
      { href: "/about", label: "About RAP TRENDS" },
      { href: "/os", label: "RAP TRENDS OS" },
      { href: "/legal/editorial-standards", label: "Editorial standards" },
      { href: "/legal/privacy", label: "Privacy & data" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink-4 bg-ink-2">
      <div className="mx-auto max-w-[110rem] px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2.8fr]">
          <div>
            <Logo size="lg" />
            <p className="display mt-3 text-lg text-bone-dim">Hip-Hop Is Happening Now.</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-silver">
              The real-time network for hip-hop culture. Television, radio, streaming, and
              editorial, programmed from one newsroom.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="eyebrow mb-3 text-silver">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-bone-dim transition-colors hover:text-bone">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-ink-4 pt-6">
          <p className="text-xs leading-relaxed text-silver">
            <strong className="text-bone-dim">Demonstration build.</strong> Artists, recordings,
            stories, charts, campaigns, affiliates, and carriage status shown throughout this
            product are fictional sample data created to demonstrate the platform. No carriage,
            distribution, endorsement, or partnership is represented or implied. No licensed
            music or copyrighted media is stored or served. A qualified broadcast attorney and
            music-licensing professionals must review and approve the operating model before any
            transmission, carriage, or public performance.
          </p>
          <p className="mt-4 text-xs text-silver">
            © {new Date().getFullYear()} RAP TRENDS (working name). Configurable placeholder entity.
          </p>
        </div>
      </div>
    </footer>
  );
}
