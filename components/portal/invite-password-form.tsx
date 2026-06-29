"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TextInput } from "@/components/ui/field";
import { type PortalRole } from "@/types";

type FormStatus = "loading" | "ready" | "saving" | "success" | "error";
type InviteTokenType = "invite" | "recovery" | "magiclink" | "signup" | "email";

function loginPathForRole(role: PortalRole) {
  switch (role) {
    case "admin":
      return "/admin/login";
    case "partner":
      return "/partner/login";
    case "sponsor":
      return "/sponsor/login?redirectTo=/sponsor/chat";
  }
}

export function InvitePasswordForm({ role }: { role: PortalRole }) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("loading");
  const [inviteVerified, setInviteVerified] = useState(false);
  const [message, setMessage] = useState("Checking your invite link...");
  const hydratedInvite = useRef(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    async function hydrateInviteSession() {
      if (hydratedInvite.current) {
        return;
      }

      hydratedInvite.current = true;

      if (!supabase) {
        setStatus("error");
        setMessage("Portal auth is not configured yet.");
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const tokenHash = searchParams.get("token_hash");
      const tokenType = searchParams.get("type") as InviteTokenType | null;
      const authCode = searchParams.get("code");
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (tokenHash && tokenType) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: tokenType,
        });

        if (error) {
          setStatus("error");
          setMessage("This invite link could not be verified. Please ask admin for a fresh link.");
          return;
        }

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete("token_hash");
        nextUrl.searchParams.delete("type");
        window.history.replaceState(
          null,
          "",
          nextUrl.pathname + nextUrl.search
        );
      } else if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);

        if (error) {
          setStatus("error");
          setMessage("This invite link could not be verified. Please ask admin for a fresh link.");
          return;
        }

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete("code");
        window.history.replaceState(
          null,
          "",
          nextUrl.pathname + nextUrl.search
        );
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setStatus("error");
          setMessage("This invite link could not be verified. Please ask admin for a fresh link.");
          return;
        }

        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStatus("error");
        setMessage("This invite link is missing or expired. Please ask admin for a fresh link.");
        return;
      }

      setInviteVerified(true);
      setStatus("ready");
      setMessage("Create a password to finish setting up your portal access.");
    }

    void hydrateInviteSession();
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || status === "saving") {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password.length < 8) {
      setStatus("error");
      setMessage("Use at least 8 characters for your password.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Both password fields must match.");
      return;
    }

    setStatus("saving");
    setMessage("Saving your password...");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message || "Unable to save your password. Please try again.");
      return;
    }

    await supabase.auth.signOut();
    setStatus("success");
    setMessage("Password saved. Redirecting you to sign in...");
    router.replace(loginPathForRole(role));
  }

  const isSaving = status === "saving";
  const canSubmit = inviteVerified && (status === "ready" || status === "error");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm muted-copy">
        {message}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold">
          Password
        </label>
        <TextInput
          id="password"
          name="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          disabled={!canSubmit || isSaving}
          required
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold">
          Confirm Password
        </label>
        <TextInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          autoComplete="new-password"
          disabled={!canSubmit || isSaving}
          required
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isSaving}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-primary)] px-5 font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <KeyRound className="h-4 w-4" />
        {isSaving ? "Saving..." : "Set Password"}
      </button>
    </form>
  );
}
