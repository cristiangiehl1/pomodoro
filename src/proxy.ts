import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/", "/stats", "/stats/:path*", "/settings", "/settings/:path*"],
};
