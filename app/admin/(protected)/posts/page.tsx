import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/_actions/admin";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStore } from "@/lib/store";
import { categoryTone, cn, formatDate } from "@/lib/utils";

export default async function AdminPostsPage() {
  const { posts } = await getStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
            Posts
          </h1>
          <p className="mt-2 muted-copy">
            Manage activity posts and announcements. The homepage automatically
            shows the 3 most recent published posts.
          </p>
        </div>
        <ButtonLink href="/admin/posts/new" className="rounded-[var(--radius-card)]">
          + New Post
        </ButtonLink>
      </div>

      {posts.length === 0 ? (
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">No posts yet</h2>
          <p className="mt-2 muted-copy">
            Create and publish your first activity post. Recent published posts will
            appear on the homepage automatically.
          </p>
        </Card>
      ) : (
        <Card className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-4 py-4">Title</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const deletePost = deletePostAction.bind(null, post.slug);

                return (
                  <tr
                    key={post.id}
                    className="border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <td className="px-4 py-4 font-semibold text-[var(--color-text)]">
                      {post.title}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={cn(categoryTone(post.category))}>
                        {post.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-[var(--color-primary)]">
                      {post.published ? "Published" : "Draft"}
                    </td>
                    <td className="px-4 py-4 muted-copy">{formatDate(post.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/activities/${post.slug}`}
                          className="text-[var(--color-text-muted)]"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/posts/${post.slug}/edit`}
                          className="text-[var(--color-text-muted)]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <form action={deletePost}>
                          <button
                            type="submit"
                            className="text-[var(--color-text-muted)]"
                            aria-label={`Delete ${post.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

