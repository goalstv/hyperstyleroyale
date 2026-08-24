import type { User } from "@/lib/types";

/** DEMONSTRATION STAFF DIRECTORY. Placeholder names for role demonstration. */
export const USERS: User[] = [
  { id: "usr_01", name: "Network Administrator", email: "admin@raptrends.example", roles: ["founder_admin"], title: "Founder / Network Administrator", avatarInitials: "NA", active: true },
  { id: "usr_02", name: "Editor-in-Chief", email: "eic@raptrends.example", roles: ["editor_in_chief"], title: "Editor-in-Chief", avatarInitials: "EC", active: true },
  { id: "usr_03", name: "Rahman", email: "rahman@raptrends.example", roles: ["journalist"], title: "Staff Writer", city: "Atlanta", avatarInitials: "RA", active: true },
  { id: "usr_04", name: "Video Producer", email: "video@raptrends.example", roles: ["video_producer"], title: "Senior Video Producer", avatarInitials: "VP", active: true },
  { id: "usr_05", name: "Programming Director", email: "programming@raptrends.example", roles: ["programming_director"], title: "Director of Programming", avatarInitials: "PD", active: true },
  { id: "usr_06", name: "Master Control", email: "mcr@raptrends.example", roles: ["master_control"], title: "Master-Control Operator", avatarInitials: "MC", active: true },
  { id: "usr_07", name: "Social Producer", email: "social@raptrends.example", roles: ["social_producer"], title: "Social-Media Producer", avatarInitials: "SP", active: true },
  { id: "usr_08", name: "Sponsorship Manager", email: "sales@raptrends.example", roles: ["ad_sponsorship_manager"], title: "Advertising & Sponsorship Manager", avatarInitials: "SM", active: true },
  { id: "usr_09", name: "Rights & Compliance", email: "rights@raptrends.example", roles: ["rights_compliance"], title: "Rights & Compliance Manager", avatarInitials: "RC", active: true },
  { id: "usr_10", name: "Affiliate Manager", email: "affiliates@raptrends.example", roles: ["affiliate_manager"], title: "Director of Affiliate Relations", avatarInitials: "AM", active: true },
  { id: "usr_11", name: "Analytics Viewer", email: "analytics@raptrends.example", roles: ["analytics_viewer"], title: "Research Analyst", avatarInitials: "AV", active: true },
  { id: "usr_12", name: "Lagos Contributor", email: "lagos@raptrends.example", roles: ["external_contributor"], title: "Contributing Correspondent — Lagos", city: "Lagos", avatarInitials: "LC", active: true },
];

export const USER_BY_ID = new Map(USERS.map((u) => [u.id, u]));

/**
 * Demo session. Production replaces this with the identity provider described
 * in docs/11-security-and-privacy.md; every guard already reads from here.
 */
export const DEFAULT_SESSION_USER_ID = "usr_01";
