import type { NavigationItem, RouteKey } from "@/types";

export const routePathByKey: Record<RouteKey, string> = {
  home: "",
  about: "sobre",
  services: "servicos",
  process: "como-funciona",
  contact: "contato",
};

export const navigationItems: NavigationItem[] = [
  { key: "home", href: routePathByKey.home },
  { key: "about", href: routePathByKey.about },
  { key: "services", href: routePathByKey.services },
  { key: "process", href: routePathByKey.process },
  { key: "contact", href: routePathByKey.contact },
];
