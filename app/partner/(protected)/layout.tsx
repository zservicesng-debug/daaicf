import { PortalShell } from "@/components/layout/portal-shell";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";

export default async function PartnerProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthorizedPortalPageSession("partner");
  return <PortalShell role="partner">{children}</PortalShell>;
}
