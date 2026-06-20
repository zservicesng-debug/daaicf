"use client";

import { useActionState, useEffect } from "react";
import { submitComment, type ActionState } from "@/app/_actions/public";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast-provider";

const initialState: ActionState = {
  status: "idle",
};

export function QuickCommentForm({
  postId,
  postSlug,
}: {
  postId: string;
  postSlug: string;
}) {
  const [state, formAction] = useActionState(submitComment, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    toast({
      type: state.status === "success" ? "success" : "error",
      title: state.status === "success" ? "Comment received" : "Comment not sent",
      description: state.message,
    });
  }, [state, toast]);

  return (
    <form
      action={formAction}
      className="space-y-3"
      data-submit-toast-title="Submitting comment"
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="postSlug" value={postSlug} />
      <TextInput name="authorName" placeholder="Your name" required />
      <TextInput
        name="authorEmail"
        type="email"
        placeholder="Your email"
        required
      />
      <SubmitButton className="py-2!" fullWidth={false}>
        Post
      </SubmitButton>
    </form>
  );
}

export function FullCommentForm({
  postId,
  postSlug,
}: {
  postId: string;
  postSlug: string;
}) {
  const [state, formAction] = useActionState(submitComment, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    toast({
      type: state.status === "success" ? "success" : "error",
      title: state.status === "success" ? "Comment received" : "Comment not sent",
      description: state.message,
    });
  }, [state, toast]);

  return (
    <form
      action={formAction}
      className="space-y-4"
      data-submit-toast-title="Submitting comment"
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="postSlug" value={postSlug} />
      <div>
        <label htmlFor="authorName" className="mb-2 block text-sm font-semibold">
          Name
        </label>
        <TextInput id="authorName" name="authorName" required />
      </div>
      <div>
        <label htmlFor="authorEmail" className="mb-2 block text-sm font-semibold">
          Email
        </label>
        <TextInput id="authorEmail" name="authorEmail" type="email" required />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-semibold">
          Message
        </label>
        <TextArea id="message" name="message" required />
      </div>
      <SubmitButton>Submit Comment</SubmitButton>
    </form>
  );
}
