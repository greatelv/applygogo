import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: process.env.AUTH_COOKIE_NAME || "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Check if the path is a dashboard path (including localized versions)
      const isDashboardPath =
        /^\/(?:en|ja|ko)?\/?(resumes|billing|profile)/.test(pathname);
      // Check if the path is a login page (including localized versions)
      const isLoginPage = /^\/(?:en|ja|ko)?\/?login$/.test(pathname);

      if (isDashboardPath) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isLoginPage) {
        // Prevent logged-in users from accessing login page again
        const localeMatch = pathname.match(/^\/(en|ja|ko)\//);
        const locale = localeMatch ? localeMatch[1] : "ko";
        return Response.redirect(new URL(`/${locale}/resumes`, nextUrl));
      }
      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
