import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

/**
 * Edge-compatible auth config (no DB adapter).
 * Used by middleware to avoid pulling in node-postgres at the edge.
 */
export const authConfig = {
  providers: [Google, GitHub],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicPaths = ["/login", "/api/auth"];
      const isPublic = publicPaths.some(
        (path) =>
          nextUrl.pathname === path ||
          nextUrl.pathname.startsWith(path + "/")
      );

      if (!isPublic && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl.origin));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
