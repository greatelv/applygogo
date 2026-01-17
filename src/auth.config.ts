import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/en/login",
  },
  basePath: "/en/api/auth",
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isOnDashboard =
        pathname.startsWith("/en/resumes") ||
        pathname.startsWith("/en/billing") ||
        pathname.startsWith("/en/profile") ||
        pathname.startsWith("/en/settings");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Prevent logged-in users from accessing login page again
        if (pathname === "/en/login") {
          return Response.redirect(new URL("/en/resumes", nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
