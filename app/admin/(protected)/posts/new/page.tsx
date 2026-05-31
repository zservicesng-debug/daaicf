import { PostEditorForm } from "@/components/admin/post-editor-form";
import { Card } from "@/components/ui/card";
import { listUsersByRole } from "@/lib/store";

export default async function NewPostPage() {
  const partners = await listUsersByRole("partner");
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
          Create Post
        </h1>
        <p className="mt-2 muted-copy">Draft a new activity update or announcement.</p>
      </div>
      <Card className="p-6 md:p-8">
        <PostEditorForm partnerOptions={partnerOptions} />
      </Card>
    </div>
  );
}
