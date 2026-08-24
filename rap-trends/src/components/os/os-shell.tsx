import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionPermissions } from "@/lib/session";
import { ROLE_LABELS, type Permission } from "@/lib/roles";
import { LogoMark } from "@/components/logo";
import { RoleSwitcher } from "./role-switcher";
import { USERS } from "@/data/users";

const NAV: { href: string; label: string; permission: Permission; group: string }[] = [
  { href: "/os", label: "Control room", permission: "os.view", group: "Overview" },
  { href: "/os/newsroom", label: "Newsroom", permission: "newsroom.read", group: "Editorial" },
  { href: "/os/drive", label: "Drive ingestion", permission: "media.read", group: "Editorial" },
  { href: "/os/media", label: "Media library", permission: "media.read", group: "Media" },
  { href: "/os/rights", label: "Rights & compliance", permission: "rights.read", group: "Media" },
  { href: "/os/programming", label: "Programming", permission: "schedule.read", group: "Air" },
  { href: "/os/channels", label: "Channel origination", permission: "channel.monitor", group: "Air" },
  { href: "/os/distribution", label: "Distribution", permission: "distribution.read", group: "Air" },
  { href: "/os/monetization", label: "Advertising", permission: "ads.read", group: "Revenue" },
  { href: "/os/analytics", label: "Analytics", permission: "analytics.read", group: "Revenue" },
  { href: "/os/health", label: "System health", permission: "os.view", group: "Operations" },
  { href: "/os/users", label: "Users & roles", permission: "os.view", group: "Operations" },
];

/**
 * RAP TRENDS OS chrome.
 *
 * Navigation is filtered by the signed-in operator's permissions, so a
 * journalist never sees a route into master control. The role switcher is a
 * demonstration affordance; the permission checks it exercises are the real ones.
 */
export async function OsShell({ children }: { children: ReactNode }) {
  const { user, permissions } = await getSessionPermissions();
  const visible = NAV.filter((item) => permissions.has(item.permission));
  const groups = [...new Set(visible.map((i) => i.group))];

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-30 border-b border-ink-4 bg-ink-2">
        <div className="flex h-14 items-center gap-4 px-4">
          <Link href="/os" className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="display text-lg text-bone">
              RAP TRENDS <span className="text-volt-soft">OS</span>
            </span>
          </Link>
          <span className="hidden text-xs text-silver sm:inline">Media operations control</span>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="hidden text-xs text-bone-dim hover:text-bone sm:inline">
              View the public site →
            </Link>
            <RoleSwitcher
              currentUserId={user.id}
              users={USERS.map((u) => ({ id: u.id, name: u.name, role: ROLE_LABELS[u.roles[0]] }))}
            />
          </div>
        </div>
      </header>

      <div className="flex">
        <nav aria-label="RAP TRENDS OS" className="hidden w-56 shrink-0 border-r border-ink-4 bg-ink-2 lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-3">
            {groups.map((group) => (
              <div key={group} className="mb-5">
                <p className="eyebrow mb-2 px-2 text-silver">{group}</p>
                <ul className="space-y-0.5">
                  {visible.filter((i) => i.group === group).map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block rounded px-2 py-1.5 text-sm text-bone-dim transition-colors hover:bg-ink-3 hover:text-bone"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-6 rounded border border-ink-4 p-3">
              <p className="eyebrow text-silver">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-bone">{user.name}</p>
              <p className="text-xs text-bone-dim">{ROLE_LABELS[user.roles[0]]}</p>
              <p className="num mt-2 text-xs text-silver">{permissions.size} permissions</p>
            </div>
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          <nav aria-label="RAP TRENDS OS sections" className="thin-scroll flex gap-1 overflow-x-auto border-b border-ink-4 bg-ink-2 px-3 py-2 lg:hidden">
            {visible.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-bone-dim hover:bg-ink-3 hover:text-bone"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

/** Standard page header inside the console. */
export function OsHeader({
  title, subtitle, actions,
}: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink-4 pb-4">
      <div>
        <h1 className="display text-3xl text-bone sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-3xl text-sm text-bone-dim">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** Shown when an operator reaches a route their role does not cover. */
export function PermissionDenied({ permission }: { permission: string }) {
  return (
    <div className="rounded-lg border border-blood/40 bg-blood/10 p-8 text-center">
      <p className="display text-3xl text-blood">Not your desk</p>
      <p className="mx-auto mt-3 max-w-md text-sm text-bone-dim">
        Your role does not carry the <span className="num text-bone">{permission}</span> permission.
        This is the same check that runs on every route, action, and API call in RAP TRENDS OS —
        the navigation simply hides what you cannot reach.
      </p>
      <Link href="/os" className="mt-5 inline-block text-sm text-volt-soft underline hover:text-bone">
        Back to the control room
      </Link>
    </div>
  );
}
