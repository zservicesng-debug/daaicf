import { Card } from "@/components/ui/card";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";
import { getPartnerPermissionKeys, listChatRoomsForUser } from "@/lib/store";

export default async function PartnerDashboardPage() {
  const session = await requireAuthorizedPortalPageSession("partner");
  const permissions = await getPartnerPermissionKeys(session.userId);
  const rooms = await listChatRoomsForUser(session.userId);

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8">
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Welcome back
        </h1>
        <p className="mt-3 text-lg muted-copy">
          {session?.orgName || session?.displayName}, your partner account currently
          has {permissions.length} content permission{permissions.length === 1 ? "" : "s"} and {rooms.length} chat room
          {rooms.length === 1 ? "" : "s"}.
        </p>
      </Card>
    </div>
  );
}

