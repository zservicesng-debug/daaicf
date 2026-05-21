import { PortalShell } from "@/components/layout/portal-shell";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";

export default async function SponsorProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthorizedPortalPageSession("sponsor");
  return <PortalShell role="sponsor">{children}</PortalShell>;
}
