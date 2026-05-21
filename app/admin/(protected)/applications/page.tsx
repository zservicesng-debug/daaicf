import Link from "next/link";
import { deleteHelpApplicationAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { getStore } from "@/lib/store";
import { statusTone } from "@/lib/utils";

export default async function AdminApplicationsPage() {
  const { applications } = await getStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Applications
        </h1>
        <p className="mt-2 muted-copy">Manage all help applications submitted by the public.</p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/applications" className="rounded-full bg-[var(--color-primary)] px-4 py-2 font-semibold text-white">
          Help Applications
        </Link>
        <Link href="/admin/applications/sponsors" className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 font-semibold text-[var(--color-text-muted)]">
          Sponsor Applications
        </Link>
        <Link href="/admin/applications/partners" className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 font-semibold text-[var(--color-text-muted)]">
          Partner Applications
        </Link>
      </div>

      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Location</th>
              <th className="px-4 py-4">Help Type</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((item) => {
              const deleteApplication = deleteHelpApplicationAction.bind(
                null,
                item.id
              );

              return (
                <tr
                  key={item.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-4 py-4 font-semibold text-[var(--color-text)]">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 muted-copy">{item.location}</td>
                  <td className="px-4 py-4 muted-copy">{item.helpType}</td>
                  <td className="px-4 py-4 muted-copy">{item.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/applications/${item.id}`}
                        className="font-semibold text-[var(--color-primary)]"
                      >
                        View
                      </Link>
                      <ConfirmActionModal
                        action={deleteApplication}
                        title="Delete help application?"
                        description={`This will permanently remove ${item.name}'s help application and any uploaded evidence images. This action cannot be undone.`}
                        trigger="Delete"
                        triggerClassName="!px-3 !py-2 text-xs"
                        confirmLabel="Delete Application"
                        submitToastTitle="Deleting help application"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

