import { notFound } from "next/navigation";
import { saveProjectAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { getProjectById } from "@/lib/store";

export default async function EditProjectPage(
  props: PageProps<"/admin/projects/[id]/edit">
) {
  const { id } = await props.params;
  const project = await getProjectById(id);
  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Edit Project
        </h1>
        <p className="mt-2 muted-copy">Update project information and status.</p>
      </div>
      <Card className="p-6 md:p-8">
        <form action={saveProjectAction} className="space-y-5">
          <input type="hidden" name="id" value={project.id} />
          <div>
            <label className="mb-2 block text-sm font-semibold">Title</label>
            <TextInput name="title" defaultValue={project.title} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Description</label>
            <TextArea name="description" defaultValue={project.description} required />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold">Category</label>
              <SelectInput name="category" defaultValue={project.category}>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Empowerment">Empowerment</option>
                <option value="Events">Events</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Relief">Relief</option>
              </SelectInput>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Status</label>
              <SelectInput name="status" defaultValue={project.status}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </SelectInput>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Budget Goal</label>
              <TextInput name="budgetGoal" type="number" min="0" defaultValue={project.budgetGoal} required />
            </div>
          </div>
          <SubmitButton>Save Project</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
