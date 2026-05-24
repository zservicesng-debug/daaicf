import { TeamMemberForm } from "@/components/admin/team-member-form";
import { Card } from "@/components/ui/card";

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          New Team Member
        </h1>
        <p className="mt-2 muted-copy">
          Create a profile that will appear on the public team page.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <TeamMemberForm />
      </Card>
    </div>
  );
}
