import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

import { NextResponse } from "next/server";

const i18nMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // i18n 처리를 먼저 수행하기 전에 현재 경로를 헤더에 추가
  req.headers.set("x-pathname", req.nextUrl.pathname);

  return i18nMiddleware(req);
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: [
    "/",
    "/(ko|en|ja)/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|global|.*\\..*).*)",
  ],
};
