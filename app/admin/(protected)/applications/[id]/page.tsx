import Image from "next/image";
import { notFound } from "next/navigation";
import {
  deleteHelpApplicationAction,
  updateHelpApplicationAction,
} from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { getApplicationById } from "@/lib/store";

export default async function AdminApplicationDetailPage(
  props: PageProps<"/admin/applications/[id]">
) {
  const { id } = await props.params;
  const application = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  const deleteApplication = deleteHelpApplicationAction.bind(null, application.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            Help Application
          </h1>
          <p className="mt-2 muted-copy">
            Review application details, update status, or remove the submission.
          </p>
        </div>
        <ConfirmActionModal
          action={deleteApplication}
          title="Delete help application?"
          description={`This will permanently remove ${application.name}'s application and any uploaded evidence images. This action cannot be undone.`}
          trigger="Delete Application"
          confirmLabel="Delete Application"
          submitToastTitle="Deleting help application"
        />
      </div>

      <Card className="p-6 md:p-8">
        <form action={updateHelpApplicationAction} className="space-y-5">
          <input type="hidden" name="id" value={application.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Name</label>
              <TextInput value={application.name} readOnly />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Phone</label>
              <TextInput value={application.phone} readOnly />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Location</label>
            <TextInput value={application.location} readOnly />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Help Type</label>
            <TextInput value={application.helpType} readOnly />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Description</label>
            <TextArea value={application.description} readOnly />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">How did they hear about us?</label>
            <TextInput value={application.howHeard || "Not provided"} readOnly />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Picture Evidence</label>
            {application.evidenceImageUrls.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {application.evidenceImageUrls.map((imageUrl, index) => (
                  <a
                    key={`${application.id}-evidence-${index + 1}`}
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Evidence ${index + 1} for ${application.name}`}
                      width={1200}
                      height={900}
                      unoptimized
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-5 text-sm muted-copy">
                No evidence images were provided with this application.
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Status</label>
            <SelectInput name="status" defaultValue={application.status}>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </SelectInput>
          </div>
          <SubmitButton>Save Status</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
