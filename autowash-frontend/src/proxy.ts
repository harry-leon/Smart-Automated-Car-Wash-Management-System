import { NextRequest, NextResponse } from "next/server";

const AUTH_TOKEN_COOKIE = "autowash_internal_token";
const AUTH_ROLE_COOKIE = "autowash_internal_role";

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/operations/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value?.toLowerCase();

  if (!token) {
    return redirectToLogin(request);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return redirectToLogin(request);
  }

  if ((pathname.startsWith("/staff") || pathname.startsWith("/operations")) && role !== "staff") {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/operations/:path*"]
};
