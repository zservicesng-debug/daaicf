import { AdminShell } from "@/components/layout/admin-shell";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthorizedPortalPageSession("admin");
  return <AdminShell>{children}</AdminShell>;
}
