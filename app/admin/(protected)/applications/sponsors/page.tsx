import Link from "next/link";
import {
  blockEmailAction,
  deleteSponsorApplicationAction,
} from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { getStore } from "@/lib/store";
import { statusTone } from "@/lib/utils";

export default async function SponsorApplicationsPage() {
  const { blockedEmails, sponsorApplications } = await getStore();
  const blockedEmailSet = new Set(blockedEmails.map((item) => item.email));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Sponsor Applications
        </h1>
        <p className="mt-2 muted-copy">
          Review new sponsor applications, requested sectors, and approve project access.
        </p>
      </div>

      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-4">Name / Org</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Preference</th>
              <th className="px-4 py-4">Budget</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {sponsorApplications.map((item) => {
              const deleteApplication = deleteSponsorApplicationAction.bind(
                null,
                item.id
              );
              const isBlocked = blockedEmailSet.has(item.email.toLowerCase());
              const blockApplicant = blockEmailAction.bind(null, {
                email: item.email,
                reason: `Blocked from sponsor application review: ${item.orgName || item.name}`,
                source: "Sponsor application",
                returnTo: "/admin/applications/sponsors",
              });

              return (
                <tr
                  key={item.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-4 py-4 font-semibold text-[var(--color-text)]">
                    {item.name}
                    <span className="mt-1 block text-xs font-normal muted-copy">
                      {item.orgName}
                    </span>
                    {isBlocked ? (
                      <span className="mt-2 inline-flex rounded-full bg-[#FDECEC] px-2.5 py-1 text-xs font-semibold text-[#A12626]">
                        Blocked
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 muted-copy">{item.applicantType}</td>
                  <td className="px-4 py-4 muted-copy">
                    <span className="block">{item.sponsorshipPreference}</span>
                    {item.sectorInterests.length > 0 ? (
                      <span className="mt-1 block text-xs">
                        Sectors: {item.sectorInterests.join(", ")}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 muted-copy">{item.budgetRange}</td>
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
                        href={`/admin/applications/sponsors/${item.id}`}
                        className="font-semibold text-[var(--color-primary)]"
                      >
                        View
                      </Link>
                      {!isBlocked ? (
                        <ConfirmActionModal
                          action={blockApplicant}
                          title="Block this sponsor email?"
                          description={`${item.email} will no longer be able to submit controlled website forms.`}
                          trigger="Block"
                          triggerClassName="!px-3 !py-2 text-xs"
                          confirmLabel="Block Email"
                          submitToastTitle="Blocking email"
                        />
                      ) : null}
                      <ConfirmActionModal
                        action={deleteApplication}
                        title="Delete sponsor application?"
                        description={`This will permanently remove ${item.name}'s sponsor application and disable any sponsor portal access attached to ${item.email}. This action cannot be undone.`}
                        trigger="Delete"
                        triggerClassName="!px-3 !py-2 text-xs"
                        confirmLabel="Delete Application"
                        submitToastTitle="Deleting sponsor application"
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

