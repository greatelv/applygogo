import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth((req) => {
  // Global instance - no locale routing needed
  return undefined; // Let NextAuth handle the request
});

export const config = {
  // Match all pathnames except static files
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
