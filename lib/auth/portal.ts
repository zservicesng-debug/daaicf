import "server-only";

import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { type PortalRole, type PortalSession } from "@/types";

type PortalProfileRow = {
  id: string;
  role: PortalRole;
  display_name: string;
  org_name: string | null;
  email: string;
  status: PortalSession["status"];
  is_admin: boolean;
};

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || "";
}

function configuredAdminEmail() {
  return normalizeEmail(process.env.ADMIN_EMAIL || "admin@daaicf.org");
}

function buildPortalSession(profile: PortalProfileRow): PortalSession {
  return {
    userId: profile.id,
    role: profile.role,
    displayName: profile.display_name,
    email: profile.email,
    orgName: profile.org_name || undefined,
    isAdmin: profile.is_admin,
    status: profile.status,
  };
}

function isAuthorizedPortalProfile(
  profile: PortalProfileRow,
  options?: {
    role?: PortalRole;
    email?: string;
  }
) {
  if (profile.status !== "active") {
    return false;
  }

  if (options?.role && profile.role !== options.role) {
    return false;
  }

  if (options?.email && normalizeEmail(profile.email) !== normalizeEmail(options.email)) {
    return false;
  }

  if (profile.role === "admin") {
    const adminEmail = configuredAdminEmail();
    if (!adminEmail || !profile.is_admin) {
      return false;
    }

    if (normalizeEmail(profile.email) !== adminEmail) {
      return false;
    }
  }

  return true;
}

async function getPortalProfileById(id: string) {
  const client = createSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const { data } = await client
    .from("user_profiles")
    .select("id, role, display_name, org_name, email, status, is_admin")
    .eq("id", id)
    .maybeSingle()
    .throwOnError();

  return (data as PortalProfileRow | null) || null;
}

export async function authorizePortalProfile(options: {
  userId: string;
  role: PortalRole;
  email: string;
}) {
  const profile = await getPortalProfileById(options.userId);
  if (!profile || !isAuthorizedPortalProfile(profile, options)) {
    return null;
  }

  return buildPortalSession(profile);
}

export async function getAuthorizedPortalSession(role?: PortalRole) {
  const session = await getPortalSession();
  if (!session) {
    return null;
  }

  const profile = await getPortalProfileById(session.userId);
  if (
    !profile ||
    !isAuthorizedPortalProfile(profile, {
      role: role || session.role,
      email: session.email,
    })
  ) {
    return null;
  }

  return buildPortalSession(profile);
}

export async function requireAuthorizedPortalSession(role?: PortalRole) {
  const session = await getAuthorizedPortalSession(role);
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAuthorizedPortalPageSession(role: PortalRole) {
  const session = await getAuthorizedPortalSession(role);
  if (!session) {
    redirect(`/${role}/login`);
  }

  return session;
}
