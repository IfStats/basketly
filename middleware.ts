import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "./src/lib/admin-auth-constants";

export function middleware(
  request: NextRequest
) {
  const pathname = request.nextUrl.pathname;

  if (
    !pathname.startsWith("/admin") ||
    pathname === "/admin/login"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(
    COOKIE_NAME
  )?.value;

  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL(
    "/admin/login",
    request.url
  );

  loginUrl.searchParams.set(
    "next",
    pathname
  );

  return NextResponse.redirect(
    loginUrl
  );
}

export const config = {
  matcher: ["/admin/:path*"],
};