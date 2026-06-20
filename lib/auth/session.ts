import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { type PortalSession } from "@/types";

export const SESSION_COOKIE_NAME = "daaicf_portal_session";
const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 12;
const REMEMBERED_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  return "daaicf-dev-session-secret";
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

export function serializeSession(session: PortalSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signValue(payload);
  return `${payload}.${signature}`;
}

export function parseSessionCookie(value?: string | null) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = signValue(payload);

  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(decoded) as PortalSession;
  } catch {
    return null;
  }
}

export async function getPortalSession() {
  const cookieStore = await cookies();
  return parseSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function setPortalSession(
  session: PortalSession,
  options?: { rememberDevice?: boolean }
) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, serializeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: options?.rememberDevice
      ? REMEMBERED_SESSION_MAX_AGE
      : DEFAULT_SESSION_MAX_AGE,
  });
}

export async function clearPortalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
