import type { Metadata } from "next";

import { siteConfig } from "@/data/site";
import { getLocalizedPath } from "@/lib/i18n";
import type { Locale, Messages, RouteKey } from "@/types";

export function createPageMetadata(
  locale: Locale,
  messages: Messages,
  routeKey: RouteKey,
): Metadata {
  const localizedUrl = new URL(getLocalizedPath(locale, routeKey), siteConfig.siteUrl);
  const homeMeta = messages.meta.home;
  const pageMeta =
    routeKey === "home"
      ? homeMeta
      : messages.meta[routeKey === "process" ? "process" : routeKey];

  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: localizedUrl.toString(),
      languages: Object.fromEntries(
        siteConfig.supportedLocales.map((item) => [
          item,
          new URL(getLocalizedPath(item, routeKey), siteConfig.siteUrl).toString(),
        ]),
      ),
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: localizedUrl.toString(),
      siteName: siteConfig.name,
      locale,
      type: "website",
    },
  };
}
