import { notFound } from "next/navigation";
import {
  deletePartnerApplicationAction,
  updatePartnerApplicationAction,
} from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  findUserByEmail,
  getPartnerApplicationById,
  getPartnerPermissionKeys,
} from "@/lib/store";

const permissionOptions = [
  { value: "public.posts", label: "Public posts and updates" },
  { value: "reports.projects", label: "Project progress summaries" },
  { value: "gallery.highlights", label: "Gallery highlights" },
  { value: "events.calendar", label: "Event planning visibility" },
];

export default async function PartnerApplicationDetailPage(
  props: PageProps<"/admin/applications/partners/[id]">
) {
  const { id } = await props.params;
  const application = await getPartnerApplicationById(id);
  if (!application) {
    notFound();
  }
  const existingUser = await findUserByEmail("partner", application.email);
  const selectedPermissionKeys = existingUser
    ? await getPartnerPermissionKeys(existingUser.id)
    : [];
  const deleteApplication = deletePartnerApplicationAction.bind(null, application.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            Partner Application
          </h1>
          <p className="mt-2 muted-copy">
            Approve a partner, assign content permissions, or remove the submission.
          </p>
        </div>
        <ConfirmActionModal
          action={deleteApplication}
          title="Delete partner application?"
          description={`This will permanently remove ${application.orgName}'s partner application and disable any partner portal access attached to ${application.email}. This action cannot be undone.`}
          trigger="Delete Application"
          confirmLabel="Delete Application"
          submitToastTitle="Deleting partner application"
        />
      </div>
      <Card className="p-6 md:p-8">
        <form action={updatePartnerApplicationAction} className="space-y-5">
          <input type="hidden" name="id" value={application.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput value={application.orgName} readOnly />
            <TextInput value={application.contactName} readOnly />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput value={application.email} readOnly />
            <TextInput value={application.phone} readOnly />
          </div>
          <TextInput value={application.orgType} readOnly />
          <TextArea value={application.description} readOnly />
          <TextInput value={application.website || "No website"} readOnly />
          <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Content permissions
            </p>
            {permissionOptions.map((permission) => (
              <label key={permission.value} className="flex items-center gap-3 text-sm muted-copy">
                <input
                  type="checkbox"
                  name="permissionKeys"
                  value={permission.value}
                  defaultChecked={selectedPermissionKeys.includes(permission.value)}
                />
                {permission.label}
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
          <SubmitButton>Save Partner Decision</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
