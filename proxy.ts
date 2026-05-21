import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  parseSessionCookie,
} from "@/lib/auth/session";

function redirectToLogin(request: NextRequest, path: "/admin/login" | "/sponsor/login" | "/partner/login") {
  const loginUrl = new URL(path, request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname === "/admin/login" ||
    pathname === "/sponsor/login" ||
    pathname === "/partner/login"
  ) {
    return NextResponse.next();
  }

  const session = parseSessionCookie(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );

  if (pathname.startsWith("/admin")) {
    if (
      !session ||
      session.role !== "admin" ||
      session.status !== "active" ||
      !session.isAdmin
    ) {
      return redirectToLogin(request, "/admin/login");
    }
  }

  if (pathname.startsWith("/sponsor")) {
    if (!session || session.role !== "sponsor" || session.status !== "active") {
      return redirectToLogin(request, "/sponsor/login");
    }
  }

  if (pathname.startsWith("/partner")) {
    if (!session || session.role !== "partner" || session.status !== "active") {
      return redirectToLogin(request, "/partner/login");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sponsor/:path*", "/partner/:path*"],
};
