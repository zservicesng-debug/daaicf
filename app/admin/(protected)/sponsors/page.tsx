import { Card } from "@/components/ui/card";
import { getSponsorProjects, listUsersByRole } from "@/lib/store";

export default async function AdminSponsorsPage() {
  const sponsors = await listUsersByRole("sponsor");
  const sponsorRows = await Promise.all(
    sponsors.map(async (user) => ({
      user,
      projects: await getSponsorProjects(user.id),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Sponsors
        </h1>
        <p className="mt-2 muted-copy">Manage active sponsors and assigned project access.</p>
      </div>

      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-4">Name / Org</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Assigned Projects</th>
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sponsorRows.map(({ user, projects }) => (
              <tr key={user.id} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="px-4 py-4 font-semibold text-[var(--color-text)]">
                  {user.displayName}
                  <span className="mt-1 block text-xs font-normal muted-copy">{user.orgName}</span>
                </td>
                <td className="px-4 py-4 muted-copy">{user.email}</td>
                <td className="px-4 py-4 muted-copy">
                  {projects.map((project) => project.title).join(", ")}
                </td>
                <td className="px-4 py-4 text-[var(--color-primary)]">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

