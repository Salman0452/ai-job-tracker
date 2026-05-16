import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/dashboard", "/applications", "/resume", "/analytics", "/admin"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = pathname.startsWith("/admin");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/applications/:path*", "/resume/:path*", "/analytics/:path*", "/admin/:path*"],
};