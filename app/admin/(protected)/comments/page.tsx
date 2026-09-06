import { blockEmailAction, updateCommentAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function AdminCommentsPage() {
  const { blockedEmails, comments, posts } = await getStore();
  const blockedEmailSet = new Set(blockedEmails.map((item) => item.email));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Comments
        </h1>
        <p className="mt-2 muted-copy">
          Review and approve comments before they appear publicly.
        </p>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => {
          const post = posts.find((item) => item.id === comment.postId);
          const approveComment = updateCommentAction.bind(null, comment.id, "approve");
          const deleteComment = updateCommentAction.bind(null, comment.id, "delete");
          const isBlocked = comment.authorEmail
            ? blockedEmailSet.has(comment.authorEmail.toLowerCase())
            : false;
          const blockCommenter = comment.authorEmail
            ? blockEmailAction.bind(null, {
                email: comment.authorEmail,
                reason: `Blocked from comment moderation: ${comment.authorName}`,
                source: "Comment",
                returnTo: "/admin/comments",
              })
            : null;

          return (
            <Card key={comment.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{comment.authorName}</p>
                  <p className="mt-1 text-sm muted-copy">
                    On: {post?.title} | {formatDate(comment.createdAt)}
                  </p>
                  {comment.authorEmail ? (
                    <a
                      href={`mailto:${comment.authorEmail}`}
                      className="mt-1 inline-block text-sm font-medium text-[var(--color-primary)]"
                    >
                      {comment.authorEmail}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm muted-copy">No email captured</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-semibold text-[var(--color-primary)]">
                    {comment.status === "pending" ? "Pending" : "Approved"}
                  </span>
                  {isBlocked ? (
                    <span className="rounded-full bg-[#FDECEC] px-3 py-1 text-xs font-semibold text-[#A12626]">
                      Blocked
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-4 leading-8 muted-copy">{comment.message}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {comment.status === "pending" ? (
                  <form action={approveComment}>
                    <button
                      type="submit"
                      className="rounded-[var(--radius-card)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>
                  </form>
                ) : null}
                {blockCommenter && !isBlocked ? (
                  <ConfirmActionModal
                    action={blockCommenter}
                    title="Block this commenter?"
                    description={`${comment.authorEmail} will no longer be able to submit comments, contact messages, sponsor applications, or partner applications.`}
                    trigger="Block Email"
                    triggerClassName="!px-4 !py-2"
                    confirmLabel="Block Email"
                    submitToastTitle="Blocking email"
                  />
                ) : null}
                <ConfirmActionModal
                  action={deleteComment}
                  title="Delete this comment?"
                  description={`This will permanently remove ${comment.authorName}'s comment. This action cannot be undone.`}
                  trigger="Delete"
                  triggerClassName="!px-4 !py-2"
                  confirmLabel="Delete Comment"
                  submitToastTitle="Deleting comment"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
