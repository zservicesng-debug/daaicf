"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authorizePortalProfile } from "@/lib/auth/portal";
import { setFlashToast } from "@/lib/flash-toast.server";
import {
  clearPortalSession,
  setPortalSession,
} from "@/lib/auth/session";
import { hasPortalAuthEnv } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type PortalRole, type PortalSession } from "@/types";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
};

const loginSchema = z.object({
  role: z.enum(["admin", "sponsor", "partner"]),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  redirectTo: z.string().optional(),
});

function defaultRedirect(role: PortalRole) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "sponsor":
      return "/sponsor/dashboard";
    case "partner":
      return "/partner/dashboard";
  }
}

function sanitizeRedirectTarget(role: PortalRole, redirectTo?: string) {
  const candidate = redirectTo?.trim();
  const roleRoot = `/${role}`;

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return defaultRedirect(role);
  }

  if (candidate === roleRoot || candidate.startsWith(`${roleRoot}/`)) {
    return candidate;
  }

  return defaultRedirect(role);
}

async function trySupabaseLogin(
  role: PortalRole,
  email: string,
  password: string
): Promise<PortalSession | null> {
  const serverClient = createSupabaseServerClient();

  if (!serverClient) {
    return null;
  }

  const { data, error } = await serverClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return null;
  }

  return authorizePortalProfile({
    userId: data.user.id,
    role,
    email: data.user.email || email,
  });
}

export async function loginPortal(
  _prevState: LoginState,
  formData: FormData
) {
  const parsed = loginSchema.safeParse({
    role: formData.get("role"),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message || "Unable to sign in.",
    };
  }

  if (!hasPortalAuthEnv()) {
    return {
      status: "error" as const,
      message:
        "Portal sign-in is unavailable until Supabase portal auth is fully configured.",
    };
  }

  const session = await trySupabaseLogin(
    parsed.data.role,
    parsed.data.email,
    parsed.data.password
  );

  if (!session) {
    return {
      status: "error" as const,
      message: "Invalid credentials or portal access is disabled for this account.",
    };
  }

  await setPortalSession(session);
  redirect(sanitizeRedirectTarget(parsed.data.role, parsed.data.redirectTo));
}

export async function logoutPortal(role: PortalRole) {
  const serverClient = createSupabaseServerClient();
  if (serverClient) {
    await serverClient.auth.signOut();
  }

  await clearPortalSession();
  await setFlashToast({
    type: "info",
    title: "Signed out",
    description: "Your portal session has been closed successfully.",
  });
  redirect(`/${role}/login`);
}

