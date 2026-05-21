import { saveProjectAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

function ProjectForm() {
  return (
    <form action={saveProjectAction} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold">Title</label>
        <TextInput name="title" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Description</label>
        <TextArea name="description" required />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold">Category</label>
          <SelectInput name="category" defaultValue="Health">
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
          <SelectInput name="status" defaultValue="active">
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </SelectInput>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Budget Goal</label>
          <TextInput name="budgetGoal" type="number" min="0" required />
        </div>
      </div>
      <SubmitButton>Save Project</SubmitButton>
    </form>
  );
}

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          New Project
        </h1>
        <p className="mt-2 muted-copy">Create a new project record.</p>
      </div>
      <Card className="p-6 md:p-8">
        <ProjectForm />
      </Card>
    </div>
  );
}
