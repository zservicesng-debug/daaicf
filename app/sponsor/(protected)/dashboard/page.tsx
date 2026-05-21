import { Card } from "@/components/ui/card";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";
import { getSponsorProjects, listChatRoomsForUser } from "@/lib/store";

export default async function SponsorDashboardPage() {
  const session = await requireAuthorizedPortalPageSession("sponsor");
  const projects = await getSponsorProjects(session.userId);
  const rooms = await listChatRoomsForUser(session.userId);

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8">
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Welcome back
        </h1>
        <p className="mt-3 text-lg muted-copy">
          {session?.orgName || session?.displayName}, you currently have access to{" "}
          {projects.length} project{projects.length === 1 ? "" : "s"} and {rooms.length} chat room
          {rooms.length === 1 ? "" : "s"}.
        </p>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Assigned Projects</h2>
          <div className="mt-4 space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-4">
                <p className="font-semibold text-[var(--color-text)]">{project.title}</p>
                <p className="mt-2 text-sm leading-7 muted-copy">{project.description}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Messages</h2>
          <p className="mt-4 text-sm muted-copy">
            Use the chat area to follow up on reporting, timelines, and collaboration.
          </p>
        </Card>
      </div>
    </div>
  );
}

