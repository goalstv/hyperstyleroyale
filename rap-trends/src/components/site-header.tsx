"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";

const NAV = [
  { href: "/live", label: "Watch" },
  { href: "/radio", label: "Listen" },
  { href: "/trending", label: "Trending" },
  { href: "/shows", label: "Shows" },
  { href: "/artists", label: "Artists" },
  { href: "/cities", label: "Cities" },
  { href: "/news", label: "News" },
  { href: "/videos", label: "Video" },
];

const SECONDARY = [
  { href: "/submit", label: "Submit music" },
  { href: "/partners", label: "Carry the network" },
  { href: "/advertise", label: "Advertise" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-4 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
      <div className="mx-auto flex h-16 max-w-[110rem] items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="RAP TRENDS home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`rounded px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    isActive(item.href) ? "bg-ink-3 text-bone" : "text-bone-dim hover:bg-ink-3 hover:text-bone"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link
            href="/submit"
            className="rounded border border-ink-4 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-bone-dim transition-colors hover:border-silver hover:text-bone"
          >
            Submit music
          </Link>
          <Link
            href="/account"
            className="rounded bg-bone px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-white"
          >
            Sign in
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto rounded border border-ink-4 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-bone lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ink-4 bg-ink-2 lg:hidden">
          <ul className="mx-auto max-w-[110rem] px-4 py-2 sm:px-6">
            {[...NAV, ...SECONDARY].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block border-b border-ink-4/60 py-3 text-sm font-semibold uppercase tracking-wide ${
                    isActive(item.href) ? "text-bone" : "text-bone-dim"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/account" onClick={() => setOpen(false)} className="block py-3 text-sm font-semibold uppercase tracking-wide text-volt-soft">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
