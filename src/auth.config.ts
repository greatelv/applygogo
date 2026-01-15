import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Strip locale from pathname to check protected routes
      // Matches /en, /ko, /en/..., /ko/...
      const publicPathname = nextUrl.pathname.replace(
        /^\/(?:en|ko)(?:\/|$)/,
        "/"
      );
      // Ensure path starts with / if it became empty (e.g. /en -> /)
      const pathname = publicPathname === "" ? "/" : publicPathname;

      const isOnDashboard =
        pathname.startsWith("/resumes") ||
        pathname.startsWith("/billing") ||
        pathname.startsWith("/profile");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Prevent logged-in users from accessing login page again
        if (pathname === "/login") {
          return Response.redirect(new URL("/resumes", nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
