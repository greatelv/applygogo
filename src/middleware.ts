import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;

  // Determine Region
  let region = "KR"; // Default

  // 1. Path-based detection (Priority)
  if (pathname.startsWith("/en/") || pathname === "/en") {
    region = "GLOBAL";
  }
  // 2. Cookie-based detection (Fallback for API routes or root)
  else if (pathname.startsWith("/api") || pathname === "/") {
    const localeCookie = req.cookies.get("NEXT_LOCALE")?.value;
    if (localeCookie === "en") {
      region = "GLOBAL";
    }
  }

  let response;

  // Skip next-intl for API routes to avoid redirects/localization logic on APIs
  if (pathname.startsWith("/api")) {
    response = NextResponse.next();
  } else {
    // Run next-intl for pages
    response = intlMiddleware(req);
  }

  // Set Region Header for downstream use (Server Components, API Routes)
  response.headers.set("x-application-region", region);

  return response;
});

export const config = {
  // Match all pathnames except static files
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
