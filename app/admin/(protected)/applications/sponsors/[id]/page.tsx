import { notFound } from "next/navigation";
import {
  deleteSponsorApplicationAction,
  updateSponsorApplicationAction,
} from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  findUserByEmail,
  getSponsorApplicationById,
  getSponsorProjects,
  listProjects,
} from "@/lib/store";

export default async function SponsorApplicationDetailPage(
  props: PageProps<"/admin/applications/sponsors/[id]">
) {
  const { id } = await props.params;
  const application = await getSponsorApplicationById(id);
  if (!application) {
    notFound();
  }
  const activeProjects = await listProjects("active");
  const existingUser = await findUserByEmail("sponsor", application.email);
  const selectedProjectIds = existingUser
    ? (await getSponsorProjects(existingUser.id)).map((project) => project.id)
    : application.projectIds;
  const deleteApplication = deleteSponsorApplicationAction.bind(null, application.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            Sponsor Application
          </h1>
          <p className="mt-2 muted-copy">
            Review the sponsorship preference, approve chat access, optionally
            assign projects, or remove the submission.
          </p>
        </div>
        <ConfirmActionModal
          action={deleteApplication}
          title="Delete sponsor application?"
          description={`This will permanently remove ${application.name}'s sponsor application and disable any sponsor portal access attached to ${application.email}. This action cannot be undone.`}
          trigger="Delete Application"
          confirmLabel="Delete Application"
          submitToastTitle="Deleting sponsor application"
        />
      </div>
      <Card className="p-6 md:p-8">
        <form action={updateSponsorApplicationAction} className="space-y-5">
          <input type="hidden" name="id" value={application.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput value={application.name} readOnly />
            <TextInput value={application.orgName} readOnly />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput value={application.email} readOnly />
            <TextInput value={application.phone} readOnly />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput value={application.applicantType} readOnly />
            <TextInput value={application.sponsorshipPreference} readOnly />
          </div>
          <TextInput value={application.budgetRange} readOnly />
          <TextInput
            value={
              application.sectorInterests.length > 0
                ? application.sectorInterests.join(", ")
                : "No sector preference provided"
            }
            readOnly
          />
          <TextArea value={application.message || "No message"} readOnly />
          <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Optional project access
            </p>
            <p className="text-sm muted-copy">
              Approved sponsors can sign in for private chat. Project access can
              be assigned here if you want to keep internal visibility ready.
            </p>
            {application.sectorInterests.length > 0 ? (
              <p className="text-sm muted-copy">
                Requested sectors: {application.sectorInterests.join(", ")}
              </p>
            ) : null}
            {activeProjects.map((project) => (
              <label key={project.id} className="flex items-start gap-3 text-sm muted-copy">
                <input
                  type="checkbox"
                  name="projectIds"
                  value={project.id}
                  defaultChecked={selectedProjectIds.includes(project.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium text-[var(--color-text)]">
                    {project.title}
                  </span>
                  {project.description}
                </span>
              </label>
            ))}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Decision</label>
            <SelectInput name="status" defaultValue={application.status}>
              <option value="pending">Pending</option>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </SelectInput>
          </div>
          {application.status === "approved" ? (
            <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm muted-copy">
              <input
                type="checkbox"
                name="resendAccessEmail"
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-[var(--color-text)]">
                  Resend portal access email
                </span>
                Send a fresh password setup link to {application.email}.
              </span>
            </label>
          ) : null}
          <SubmitButton>Save Sponsor Decision</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
