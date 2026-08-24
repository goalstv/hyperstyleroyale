"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Demonstration role switcher.
 *
 * Sets the session cookie the real guards read. In production this control does
 * not exist and the session comes from the identity provider — but every
 * permission check it exercises is the production one.
 */
export function RoleSwitcher({
  currentUserId, users,
}: { currentUserId: string; users: { id: string; name: string; role: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(currentUserId);

  function change(id: string) {
    setValue(id);
    document.cookie = `rt_os_user=${id}; path=/; max-age=86400; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <label className="flex items-center gap-2">
      <span className="eyebrow hidden text-silver sm:inline">View as</span>
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        disabled={pending}
        className="max-w-[14rem] rounded border border-ink-4 bg-ink-3 px-2 py-1.5 text-xs text-bone"
        aria-label="Switch operator role (demonstration)"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} — {u.role}
          </option>
        ))}
      </select>
    </label>
  );
}
