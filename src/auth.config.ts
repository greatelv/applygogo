import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Protected routes checking
      const isOnDashboard = /^\/([a-z]{2}\/)?(resumes|billing|profile)/.test(
        pathname,
      );

      if (isOnDashboard) {
        return isLoggedIn;
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
