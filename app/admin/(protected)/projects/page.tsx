import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { listProjects } from "@/lib/store";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            Projects
          </h1>
          <p className="mt-2 muted-copy">Manage active and completed projects.</p>
        </div>
        <ButtonLink href="/admin/projects/new" className="rounded-[var(--radius-card)]">
          + New Project
        </ButtonLink>
      </div>

      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-4">Title</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Budget Goal</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="px-4 py-4 font-semibold text-[var(--color-text)]">{project.title}</td>
                <td className="px-4 py-4 muted-copy">{project.category}</td>
                <td className="px-4 py-4 muted-copy">{project.status}</td>
                <td className="px-4 py-4 muted-copy">₦{project.budgetGoal.toLocaleString()}</td>
                <td className="px-4 py-4">
                  <Link href={`/admin/projects/${project.id}/edit`} className="font-semibold text-[var(--color-primary)]">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

