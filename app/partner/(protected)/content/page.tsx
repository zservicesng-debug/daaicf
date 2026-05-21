import { Card } from "@/components/ui/card";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";
import { getPartnerPermissionKeys, getStore, listProjects } from "@/lib/store";

const permissionCopy: Record<string, { title: string; description: string }> = {
  "public.posts": {
    title: "Public Posts and Updates",
    description: "Access to recent stories, outreach highlights, and published activity posts.",
  },
  "reports.projects": {
    title: "Project Progress Summaries",
    description: "Visibility into project-level snapshots, goals, and current programme priorities.",
  },
  "gallery.highlights": {
    title: "Gallery Highlights",
    description: "Access to photo stories and communication-ready visual highlights.",
  },
  "events.calendar": {
    title: "Events Calendar",
    description: "Awareness of upcoming programme dates, outreach moments, and coordination opportunities.",
  },
};

export default async function PartnerContentPage() {
  const session = await requireAuthorizedPortalPageSession("partner");
  const permissions = await getPartnerPermissionKeys(session.userId);
  const { posts, gallery } = await getStore();
  const projects = await listProjects("active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Permitted Content
        </h1>
        <p className="mt-2 muted-copy">This view is restricted to the sections your admin permissions currently allow.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {permissions.map((permission) => (
          <Card key={permission} className="p-6">
            <h2 className="serif-display text-3xl font-semibold text-[var(--color-text)]">
              {permissionCopy[permission]?.title || permission}
            </h2>
            <p className="mt-4 leading-8 muted-copy">
              {permissionCopy[permission]?.description}
            </p>
            {permission === "public.posts" ? (
              <ul className="mt-5 space-y-2 text-sm muted-copy">
                {posts.slice(0, 3).map((post) => (
                  <li key={post.id}>• {post.title}</li>
                ))}
              </ul>
            ) : null}
            {permission === "reports.projects" ? (
              <ul className="mt-5 space-y-2 text-sm muted-copy">
                {projects.slice(0, 3).map((project) => (
                  <li key={project.id}>• {project.title}</li>
                ))}
              </ul>
            ) : null}
            {permission === "gallery.highlights" ? (
              <p className="mt-5 text-sm muted-copy">{gallery.length} gallery items available.</p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

