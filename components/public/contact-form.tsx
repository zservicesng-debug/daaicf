"use client";

import { useActionState, useEffect } from "react";
import { Send } from "lucide-react";
import { submitContactMessage, type ActionState } from "@/app/_actions/public";
import { TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast-provider";

const initialState: ActionState = {
  status: "idle",
};

export function ContactForm() {
  const [state, formAction] = useActionState(
    submitContactMessage,
    initialState
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    toast({
      type: state.status === "success" ? "success" : "error",
      title: state.status === "success" ? "Message sent" : "Message not sent",
      description: state.message,
    });
  }, [state, toast]);

  return (
    <form
      action={formAction}
      className="space-y-5"
      data-submit-toast-title="Sending message"
    >
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-semibold">
          Full Name
        </label>
        <TextInput id="name" name="name" placeholder="Your full name" required />
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">
          Email Address
        </label>
        <TextInput
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-semibold">
          Message
        </label>
        <TextArea
          id="message"
          name="message"
          placeholder="How can we help you?"
          required
        />
      </div>
      <SubmitButton className="rounded-[var(--radius-card)]">
        <Send className="h-4 w-4" />
        Send Message
      </SubmitButton>
    </form>
  );
}
