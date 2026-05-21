import { updateCommentAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function AdminCommentsPage() {
  const { comments, posts } = await getStore();

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

          return (
            <Card key={comment.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{comment.authorName}</p>
                  <p className="mt-1 text-sm muted-copy">
                    On: {post?.title} | {formatDate(comment.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-primary)]">
                  {comment.status === "pending" ? "Pending" : "Approved"}
                </span>
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
                <form action={deleteComment}>
                  <button
                    type="submit"
                    className="rounded-[var(--radius-card)] border border-[#efb3b3] bg-white px-4 py-2 text-sm font-semibold text-[#a12626]"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
