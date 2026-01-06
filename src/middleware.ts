export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resumes/:path*",
    "/new/:path*",
    "/profile/:path*",
  ],
};
