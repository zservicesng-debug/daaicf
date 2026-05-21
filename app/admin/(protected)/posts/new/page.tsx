import { PostEditorForm } from "@/components/admin/post-editor-form";
import { Card } from "@/components/ui/card";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Create Post
        </h1>
        <p className="mt-2 muted-copy">Draft a new activity update or announcement.</p>
      </div>
      <Card className="p-6 md:p-8">
        <PostEditorForm />
      </Card>
    </div>
  );
}
