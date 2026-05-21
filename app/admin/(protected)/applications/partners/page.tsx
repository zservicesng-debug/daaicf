import Link from "next/link";
import { deletePartnerApplicationAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { getStore } from "@/lib/store";
import { statusTone } from "@/lib/utils";

export default async function PartnerApplicationsPage() {
  const { partnerApplications } = await getStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Partner Applications
        </h1>
        <p className="mt-2 muted-copy">Review new collaboration requests and approve content permissions.</p>
      </div>

      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-4">Organisation</th>
              <th className="px-4 py-4">Contact</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {partnerApplications.map((item) => {
              const deleteApplication = deletePartnerApplicationAction.bind(
                null,
                item.id
              );

              return (
                <tr
                  key={item.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-4 py-4 font-semibold text-[var(--color-text)]">
                    {item.orgName}
                  </td>
                  <td className="px-4 py-4 muted-copy">{item.contactName}</td>
                  <td className="px-4 py-4 muted-copy">{item.orgType}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status === "pending" ? "reviewed" : item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/applications/partners/${item.id}`}
                        className="font-semibold text-[var(--color-primary)]"
                      >
                        View
                      </Link>
                      <ConfirmActionModal
                        action={deleteApplication}
                        title="Delete partner application?"
                        description={`This will permanently remove ${item.orgName}'s partner application and disable any partner portal access attached to ${item.email}. This action cannot be undone.`}
                        trigger="Delete"
                        triggerClassName="!px-3 !py-2 text-xs"
                        confirmLabel="Delete Application"
                        submitToastTitle="Deleting partner application"
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

