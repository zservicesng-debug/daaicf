import { blockEmailAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function AdminMessagesPage() {
  const { blockedEmails, contactMessages } = await getStore();
  const blockedEmailSet = new Set(blockedEmails.map((item) => item.email));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Contact Messages
        </h1>
        <p className="mt-2 muted-copy">
          Review public contact-form messages and block unwanted senders.
        </p>
      </div>

      <div className="space-y-4">
        {contactMessages.length > 0 ? (
          contactMessages.map((message) => {
            const isBlocked = blockedEmailSet.has(message.email.toLowerCase());
            const blockSender = blockEmailAction.bind(null, {
              email: message.email,
              reason: `Blocked from contact message review: ${message.name}`,
              source: "Contact message",
              returnTo: "/admin/messages",
            });

            return (
              <Card key={message.id} className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-text)]">
                      {message.name}
                    </p>
                    <a
                      href={`mailto:${message.email}`}
                      className="mt-1 inline-block break-all text-sm font-medium text-[var(--color-primary)]"
                    >
                      {message.email}
                    </a>
                    <p className="mt-1 text-sm muted-copy">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {isBlocked ? (
                      <span className="inline-flex min-h-10 items-center rounded-full bg-[#FDECEC] px-3 text-xs font-semibold text-[#A12626]">
                        Blocked
                      </span>
                    ) : (
                      <ConfirmActionModal
                        action={blockSender}
                        title="Block this sender?"
                        description={`${message.email} will no longer be able to submit controlled website forms.`}
                        trigger="Block Email"
                        triggerClassName="!px-4 !py-2"
                        confirmLabel="Block Email"
                        submitToastTitle="Blocking email"
                      />
                    )}
                  </div>
                </div>
                <p className="mt-4 leading-8 muted-copy">{message.message}</p>
              </Card>
            );
          })
        ) : (
          <Card className="px-5 py-8 text-sm muted-copy">
            No contact messages have been submitted yet.
          </Card>
        )}
      </div>
    </div>
  );
}
