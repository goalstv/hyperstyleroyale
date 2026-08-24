import { cookies } from "next/headers";
import { USERS, USER_BY_ID, DEFAULT_SESSION_USER_ID } from "@/data/users";
import { can, permissionsFor, type Permission } from "./roles";
import type { User } from "./types";

/**
 * Demonstration session.
 *
 * The signed-in operator is selected by a cookie so the prototype can be walked
 * through every role without an identity provider. In production this module is
 * the single place that changes: it resolves a real session (Supabase Auth /
 * SSO) and returns the same `User`. Nothing downstream knows the difference.
 */
export const SESSION_COOKIE = "rt_os_user";

export async function getSessionUser(): Promise<User> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value ?? DEFAULT_SESSION_USER_ID;
  return USER_BY_ID.get(id) ?? USER_BY_ID.get(DEFAULT_SESSION_USER_ID) ?? USERS[0];
}

export async function requirePermission(permission: Permission) {
  const user = await getSessionUser();
  return { user, allowed: can(user.roles, permission) };
}

export async function getSessionPermissions() {
  const user = await getSessionUser();
  return { user, permissions: permissionsFor(user.roles) };
}
