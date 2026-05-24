import { notFound } from "next/navigation";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { Card } from "@/components/ui/card";
import { getTeamMemberById } from "@/lib/store";

export default async function EditTeamMemberPage(
  props: PageProps<"/admin/team/[id]/edit">
) {
  const { id } = await props.params;
  const member = await getTeamMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Edit Team Member
        </h1>
        <p className="mt-2 muted-copy">
          Update this member&apos;s role, photo, and public bio.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <TeamMemberForm member={member} />
      </Card>
    </div>
  );
}
