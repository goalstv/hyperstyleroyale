import { OsHeader, PermissionDenied } from "@/components/os/os-shell";
import { Badge, Card, Notice, Table, Td, Th } from "@/components/ui";
import { getUsers } from "@/lib/repo";
import { requirePermission } from "@/lib/session";
import { ROLE_LABELS, ROLE_PERMISSIONS, permissionsFor } from "@/lib/roles";
import type { Role } from "@/lib/types";

export const metadata = { title: "Users & roles" };

const STAFF_ROLES: Role[] = [
  "founder_admin", "editor_in_chief", "journalist", "video_producer", "programming_director",
  "master_control", "social_producer", "ad_sponsorship_manager", "rights_compliance",
  "affiliate_manager", "analytics_viewer", "external_contributor",
];

export default async function UsersPage() {
  const { allowed, user } = await requirePermission("os.view");
  if (!allowed) return <PermissionDenied permission="os.view" />;

  const users = await getUsers();
  const canManage = user.roles.includes("founder_admin");

  return (
    <div>
      <OsHeader
        title="Users & roles"
        subtitle="Role-based access across the whole platform. A role is a set of capabilities, and every route, action, and API call checks them."
        actions={canManage ? <Badge tone="volt">Can manage users</Badge> : <Badge>Read only</Badge>}
      />

      <Card className="mb-8 overflow-hidden">
        <Table caption="Staff directory">
          <thead><tr><Th>Person</Th><Th>Role</Th><Th>Title</Th><Th>Permissions</Th><Th>Status</Th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={u.id === user.id ? "bg-volt/8" : "hover:bg-ink-3/50"}>
                <Td>
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-4 text-[0.625rem] font-bold text-bone">
                      {u.avatarInitials}
                    </span>
                    <span>
                      <span className="block font-semibold text-bone">{u.name}</span>
                      <span className="block text-xs text-silver">{u.email}</span>
                    </span>
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-xs">{u.roles.map((r) => ROLE_LABELS[r]).join(", ")}</Td>
                <Td className="whitespace-nowrap text-xs">{u.title ?? "—"}</Td>
                <Td className="num whitespace-nowrap">{permissionsFor(u.roles).size}</Td>
                <Td><Badge tone={u.active ? "good" : "neutral"}>{u.active ? "Active" : "Inactive"}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <section aria-labelledby="matrix" className="mb-8">
        <h2 id="matrix" className="eyebrow mb-3 text-silver">Permission matrix</h2>
        <Card className="overflow-hidden">
          <Table caption="Permissions granted to each role">
            <thead><tr><Th>Role</Th><Th>Count</Th><Th>Permissions</Th></tr></thead>
            <tbody>
              {STAFF_ROLES.map((role) => (
                <tr key={role} className="hover:bg-ink-3/50">
                  <Td className="whitespace-nowrap font-semibold text-bone">{ROLE_LABELS[role]}</Td>
                  <Td className="num">{ROLE_PERMISSIONS[role].length}</Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {ROLE_PERMISSIONS[role].map((p) => (
                        <span key={p} className="num rounded bg-ink-4/70 px-1.5 py-0.5 text-[0.625rem] text-bone-dim">
                          {p}
                        </span>
                      ))}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </section>

      <Notice tone="volt" title="Rahman's workspace">
        The journalist role carries exactly five permissions: view the console, read and write in
        the newsroom, read the media library, and read analytics. It has no route into programming,
        master control, distribution, advertising, rights, or user management, and it cannot move a
        story past Editing. Switch the operator selector at the top of the screen to Rahman to see
        the console re-render for that role.
      </Notice>
    </div>
  );
}
