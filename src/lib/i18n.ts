import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";
import { routePathByKey } from "@/data/navigation";
import { locales, type Locale, type Messages, type RouteKey } from "@/types";

export const localeCookieName = "preferred-locale";

const dictionaries: Record<Locale, Messages> = {
  en,
  es,
  pt,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

export function getRoutePath(routeKey: RouteKey): string {
  return routePathByKey[routeKey];
}

export function getLocalizedPath(locale: Locale, routeKey: RouteKey): string {
  const segment = getRoutePath(routeKey);
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}

export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) {
    return "/";
  }

  const [maybeLocale, ...rest] = segments;
  if (!isLocale(maybeLocale)) {
    return pathname;
  }

  return rest.length ? `/${rest.join("/")}` : "/";
}

export function getRouteKeyFromPathname(pathname: string): RouteKey {
  const strippedPathname = stripLocaleFromPathname(pathname);
  const normalized = strippedPathname === "/" ? "" : strippedPathname.replace(/^\//, "");

  const match = Object.entries(routePathByKey).find(([, value]) => value === normalized);
  return (match?.[0] as RouteKey | undefined) ?? "home";
}

export function replaceLocaleInPathname(pathname: string, locale: Locale): string {
  const routeKey = getRouteKeyFromPathname(pathname);
  return getLocalizedPath(locale, routeKey);
}
