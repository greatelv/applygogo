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

  const response = i18nMiddleware(req);

  // SEO: 캐시 서버와 구글봇에게 "이 페이지는 접속자 언어마다 결과가 다름"을 명시
  // 307 리디렉션 시 이 헤더가 필수적임
  response.headers.set("Vary", "Accept-Language");

  return response;
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: [
    "/",
    "/(ko|en|ja)/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|global|.*\\..*).*)",
  ],
};
