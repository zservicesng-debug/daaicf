import { blockEmailAction, unblockEmailAction } from "@/app/_actions/admin";
import { BlockEmailForm } from "@/components/admin/block-email-form";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

const returnTo = "/admin/blocked-emails";

type SenderCandidate = {
  email: string;
  name: string;
  source: string;
  latestAt: string;
  count: number;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export default async function AdminBlockedEmailsPage() {
  const {
    blockedEmails,
    comments,
    contactMessages,
    sponsorApplications,
    partnerApplications,
  } = await getStore();
  const blockedEmailSet = new Set(blockedEmails.map((item) => item.email));
  const senderCandidates = new Map<string, SenderCandidate>();

  function addSenderCandidate(input: {
    email?: string;
    name: string;
    source: string;
    createdAt: string;
  }) {
    const email = normalizeEmail(input.email || "");
    if (!email || blockedEmailSet.has(email)) {
      return;
    }

    const existing = senderCandidates.get(email);
    if (existing) {
      existing.count += 1;
      if (input.createdAt > existing.latestAt) {
        existing.latestAt = input.createdAt;
        existing.name = input.name;
        existing.source = input.source;
      }
      return;
    }

    senderCandidates.set(email, {
      email,
      name: input.name,
      source: input.source,
      latestAt: input.createdAt,
      count: 1,
    });
  }

  comments.forEach((comment) =>
    addSenderCandidate({
      email: comment.authorEmail,
      name: comment.authorName,
      source: "Comment",
      createdAt: comment.createdAt,
    })
  );
  contactMessages.forEach((message) =>
    addSenderCandidate({
      email: message.email,
      name: message.name,
      source: "Contact message",
      createdAt: message.createdAt,
    })
  );
  sponsorApplications.forEach((application) =>
    addSenderCandidate({
      email: application.email,
      name: application.orgName || application.name,
      source: "Sponsor application",
      createdAt: application.createdAt,
    })
  );
  partnerApplications.forEach((application) =>
    addSenderCandidate({
      email: application.email,
      name: application.orgName || application.contactName,
      source: "Partner application",
      createdAt: application.createdAt,
    })
  );

  const recentSenders = Array.from(senderCandidates.values())
    .sort((left, right) => right.latestAt.localeCompare(left.latestAt))
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Blocked Emails
        </h1>
        <p className="mt-2 muted-copy">
          Block email addresses from submitting comments, contact messages,
          sponsor applications, and partner applications.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Add Block
          </h2>
          <p className="mt-2 text-sm leading-7 muted-copy">
            Use this for addresses reported outside the admin records.
          </p>
          <div className="mt-5">
            <BlockEmailForm returnTo={returnTo} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Current Blocks
            </h2>
          </div>
          {blockedEmails.length > 0 ? (
            <div className="divide-y divide-[var(--color-border)]">
              {blockedEmails.map((item) => {
                const unblockEmail = unblockEmailAction.bind(
                  null,
                  item.id,
                  returnTo
                );

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="break-all font-semibold text-[var(--color-text)]">
                        {item.email}
                      </p>
                      <p className="mt-1 text-sm muted-copy">
                        {item.source || "Admin block"} | {formatDate(item.createdAt)}
                      </p>
                      {item.reason ? (
                        <p className="mt-2 text-sm leading-7 muted-copy">
                          {item.reason}
                        </p>
                      ) : null}
                    </div>
                    <ConfirmActionModal
                      action={unblockEmail}
                      title="Unblock this email?"
                      description={`${item.email} will be able to submit controlled website forms again.`}
                      trigger="Unblock"
                      triggerVariant="surface"
                      triggerClassName="!px-3 !py-2 text-xs"
                      confirmLabel="Unblock Email"
                      submitToastTitle="Unblocking email"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-sm muted-copy">
              No email addresses are blocked yet.
            </div>
          )}
        </Card>
      </div>

      <Card className="overflow-auto">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Recent Senders
          </h2>
        </div>
        {recentSenders.length > 0 ? (
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-4 py-4">Sender</th>
                <th className="px-4 py-4">Source</th>
                <th className="px-4 py-4">Last Seen</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentSenders.map((sender) => {
                const blockSender = blockEmailAction.bind(null, {
                  email: sender.email,
                  reason: `Blocked after ${sender.source.toLowerCase()} review.`,
                  source: sender.source,
                  returnTo,
                });

                return (
                  <tr
                    key={sender.email}
                    className="border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--color-text)]">
                        {sender.name}
                      </p>
                      <p className="break-all text-xs muted-copy">{sender.email}</p>
                    </td>
                    <td className="px-4 py-4 muted-copy">
                      {sender.source}
                      {sender.count > 1 ? ` (${sender.count})` : ""}
                    </td>
                    <td className="px-4 py-4 muted-copy">
                      {formatDate(sender.latestAt)}
                    </td>
                    <td className="px-4 py-4">
                      <ConfirmActionModal
                        action={blockSender}
                        title="Block this email?"
                        description={`${sender.email} will no longer be able to submit controlled website forms.`}
                        trigger="Block"
                        triggerClassName="!px-3 !py-2 text-xs"
                        confirmLabel="Block Email"
                        submitToastTitle="Blocking email"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-5 py-8 text-sm muted-copy">
            No unblocked senders have submitted forms yet.
          </div>
        )}
      </Card>
    </div>
  );
}
