import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ko", "en", "ja"];
const defaultLocale = "ko";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // 1. Skip paths that don't need locale handling
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/api/") ||
    pathname.includes("favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Check if path has locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 3. SEO-critical paths: Rewrite to /ko (Root & Blog)
  if (pathname === "/" || pathname.startsWith("/blog")) {
    return NextResponse.rewrite(
      new URL(`/${defaultLocale}${pathname === "/" ? "" : pathname}`, nextUrl),
    );
  }

  // 4. Other App paths: Redirect to /ko
  return NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname}`, nextUrl),
  );
}

export const config = {
  // Matcher ignoring internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
