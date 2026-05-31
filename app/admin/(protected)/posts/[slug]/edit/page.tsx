import { notFound } from "next/navigation";
import { PostEditorForm } from "@/components/admin/post-editor-form";
import { Card } from "@/components/ui/card";
import { getPostBySlug, listUsersByRole } from "@/lib/store";

export default async function EditPostPage(
  props: PageProps<"/admin/posts/[slug]/edit">
) {
  const { slug } = await props.params;
  const [post, partners] = await Promise.all([
    getPostBySlug(slug),
    listUsersByRole("partner"),
  ]);

  if (!post) {
    notFound();
  }

  const partnerOptions = Array.from(
    new Map(
      partners
        .map((partner) => ({
          id: partner.id,
          name: (partner.orgName || partner.displayName || "").trim(),
        }))
        .filter((partner) => partner.name.length > 0)
        .map((partner) => [partner.name, partner])
    ).values()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Edit Post
        </h1>
        <p className="mt-2 muted-copy">Update article content and publishing settings.</p>
      </div>
      <Card className="p-6 md:p-8">
        <PostEditorForm post={post} partnerOptions={partnerOptions} />
      </Card>
    </div>
  );
}
