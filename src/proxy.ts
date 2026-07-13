import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED = ["/", "/stats", "/settings"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = PROTECTED.includes(pathname);
  if (!isProtectedPage) return NextResponse.next();
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/stats", "/settings"],
};
