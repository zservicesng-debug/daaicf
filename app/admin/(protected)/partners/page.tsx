import { Card } from "@/components/ui/card";
import { getPartnerPermissionKeys, listUsersByRole } from "@/lib/store";

export default async function AdminPartnersPage() {
  const partners = await listUsersByRole("partner");
  const partnerRows = await Promise.all(
    partners.map(async (user) => ({
      user,
      permissions: await getPartnerPermissionKeys(user.id),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Partners
        </h1>
        <p className="mt-2 muted-copy">Manage active partners and content permissions.</p>
      </div>

      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-4">Organisation</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Permissions</th>
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {partnerRows.map(({ user, permissions }) => (
              <tr key={user.id} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="px-4 py-4 font-semibold text-[var(--color-text)]">{user.orgName || user.displayName}</td>
                <td className="px-4 py-4 muted-copy">{user.email}</td>
                <td className="px-4 py-4 muted-copy">{permissions.join(", ")}</td>
                <td className="px-4 py-4 text-[var(--color-primary)]">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

