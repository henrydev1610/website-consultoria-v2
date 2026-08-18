import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { siteConfig } from "@/data/site";
import { isLocale, localeCookieName } from "@/lib/i18n";

function detectLocale(request: NextRequest) {
  const storedLocale = request.cookies.get(localeCookieName)?.value;

  if (storedLocale && isLocale(storedLocale)) {
    return storedLocale;
  }

  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() ?? "";

  if (acceptLanguage.startsWith("pt") || acceptLanguage.includes(",pt")) {
    return "pt";
  }

  if (acceptLanguage.startsWith("es") || acceptLanguage.includes(",es")) {
    return "es";
  }

  return siteConfig.defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [localeSegment] = pathname.split("/").filter(Boolean);

  if (localeSegment && isLocale(localeSegment)) {
    const response = NextResponse.next();
    response.cookies.set(localeCookieName, localeSegment, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
