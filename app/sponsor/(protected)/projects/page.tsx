import { Card } from "@/components/ui/card";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";
import { getSponsorProjects } from "@/lib/store";

export default async function SponsorProjectsPage() {
  const session = await requireAuthorizedPortalPageSession("sponsor");
  const projects = await getSponsorProjects(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Assigned Projects
        </h1>
        <p className="mt-2 muted-copy">These are the projects currently visible to your sponsor account.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
              {project.category}
            </p>
            <h2 className="serif-display mt-3 text-3xl font-semibold text-[var(--color-text)]">
              {project.title}
            </h2>
            <p className="mt-4 leading-8 muted-copy">{project.description}</p>
            <p className="mt-5 text-sm font-semibold text-[var(--color-text)]">
              Budget Goal: ₦{project.budgetGoal.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

