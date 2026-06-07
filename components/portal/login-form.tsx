"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { Lock } from "lucide-react";
import { loginPortal, type LoginState } from "@/app/_actions/auth";
import { TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast-provider";
import { type PortalRole } from "@/types";

const initialState: LoginState = {
  status: "idle",
};

export function PortalLoginForm({
  role,
  redirectTo,
}: {
  role: PortalRole;
  redirectTo?: string;
}) {
  const [state, formAction] = useActionState(loginPortal, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    toast({
      type: "error",
      title: "Sign-in failed",
      description: state.message,
    });
  }, [state, toast]);

  return (
    <form
      action={formAction}
      className="space-y-5"
      data-submit-toast-title="Signing in"
    >
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="redirectTo" value={redirectTo || ""} />

      <div>
        <label htmlFor={`${role}-email`} className="mb-2 block text-sm font-semibold">
          Email Address
        </label>
        <TextInput
          id={`${role}-email`}
          name="email"
          type="email"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label htmlFor={`${role}-password`} className="mb-2 block text-sm font-semibold">
          Password
        </label>
        <TextInput
          id={`${role}-password`}
          name="password"
          type="password"
          placeholder="Enter your password"
          required
        />
      </div>

      <SubmitButton className="rounded-[var(--radius-card)]">
        <Lock className="h-4 w-4" />
        {role === "sponsor" ? "Sign In to Chat" : "Sign In to Dashboard"}
      </SubmitButton>
    </form>
  );
}
