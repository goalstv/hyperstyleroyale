import type { Role } from "./types";

/**
 * Permission model for RAP TRENDS OS.
 *
 * Permissions are coarse capability strings. Route guards resolve the union of
 * the signed-in user's roles; the demo session provider in `src/lib/session.ts`
 * swaps for a real identity provider without any page-level change.
 */
export type Permission =
  | "os.view"
  | "newsroom.read"
  | "newsroom.write"
  | "newsroom.assign"
  | "newsroom.approve"
  | "newsroom.publish"
  | "media.read"
  | "media.write"
  | "media.qc"
  | "schedule.read"
  | "schedule.write"
  | "schedule.approve"
  | "channel.monitor"
  | "channel.control"
  | "channel.emergency"
  | "distribution.read"
  | "distribution.write"
  | "ads.read"
  | "ads.write"
  | "ads.approve"
  | "rights.read"
  | "rights.write"
  | "affiliates.read"
  | "affiliates.write"
  | "analytics.read"
  | "users.manage"
  | "drive.manage";

export const ROLE_LABELS: Record<Role, string> = {
  founder_admin: "Founder / Network Administrator",
  editor_in_chief: "Editor-in-Chief",
  journalist: "Journalist",
  video_producer: "Video Producer",
  programming_director: "Programming Director",
  master_control: "Master-Control Operator",
  social_producer: "Social-Media Producer",
  ad_sponsorship_manager: "Advertising & Sponsorship Manager",
  rights_compliance: "Rights & Compliance Manager",
  affiliate_manager: "Affiliate Manager",
  analytics_viewer: "Analytics Viewer",
  external_contributor: "External Contributor",
  artist: "Artist / Representative",
  affiliate: "Affiliate Station",
  member: "Member",
};

const ALL: Permission[] = [
  "os.view", "newsroom.read", "newsroom.write", "newsroom.assign", "newsroom.approve",
  "newsroom.publish", "media.read", "media.write", "media.qc", "schedule.read",
  "schedule.write", "schedule.approve", "channel.monitor", "channel.control",
  "channel.emergency", "distribution.read", "distribution.write", "ads.read", "ads.write",
  "ads.approve", "rights.read", "rights.write", "affiliates.read", "affiliates.write",
  "analytics.read", "users.manage", "drive.manage",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  founder_admin: ALL,
  editor_in_chief: [
    "os.view", "newsroom.read", "newsroom.write", "newsroom.assign", "newsroom.approve",
    "newsroom.publish", "media.read", "media.write", "schedule.read", "distribution.read",
    "rights.read", "analytics.read", "drive.manage",
  ],
  // Rahman's workspace: everything needed to report and file, nothing that touches air.
  journalist: ["os.view", "newsroom.read", "newsroom.write", "media.read", "analytics.read"],
  video_producer: [
    "os.view", "newsroom.read", "media.read", "media.write", "media.qc", "schedule.read",
    "analytics.read",
  ],
  programming_director: [
    "os.view", "media.read", "schedule.read", "schedule.write", "schedule.approve",
    "channel.monitor", "distribution.read", "rights.read", "analytics.read",
  ],
  master_control: [
    "os.view", "schedule.read", "channel.monitor", "channel.control", "channel.emergency",
    "distribution.read", "media.read",
  ],
  social_producer: ["os.view", "newsroom.read", "media.read", "distribution.read", "analytics.read"],
  ad_sponsorship_manager: ["os.view", "ads.read", "ads.write", "analytics.read", "distribution.read"],
  rights_compliance: [
    "os.view", "rights.read", "rights.write", "media.read", "media.qc", "schedule.read",
    "ads.read", "ads.approve", "distribution.read",
  ],
  affiliate_manager: [
    "os.view", "affiliates.read", "affiliates.write", "distribution.read", "schedule.read",
    "analytics.read",
  ],
  analytics_viewer: ["os.view", "analytics.read"],
  external_contributor: ["os.view", "newsroom.read", "newsroom.write"],
  artist: [],
  affiliate: [],
  member: [],
};

export function permissionsFor(roles: Role[]): Set<Permission> {
  const set = new Set<Permission>();
  for (const role of roles) for (const p of ROLE_PERMISSIONS[role] ?? []) set.add(p);
  return set;
}

export function can(roles: Role[], permission: Permission): boolean {
  return permissionsFor(roles).has(permission);
}

/** Roles that may sign in to RAP TRENDS OS at all. */
export function isStaffRole(role: Role): boolean {
  return (ROLE_PERMISSIONS[role] ?? []).includes("os.view");
}
