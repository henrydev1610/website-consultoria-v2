import en from "@/messages/en.json";

export const locales = ["pt", "en", "es"] as const;

export type Locale = (typeof locales)[number];

export type RouteKey =
  | "home"
  | "about"
  | "services"
  | "process"
  | "contact";

export interface SiteConfig {
  name: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  ctaUrl: string;
  siteUrl: string;
  defaultLocale: Locale;
  supportedLocales: Locale[];
  socials: {
    instagram: string;
    linkedin: string;
  };
}

export interface NavigationItem {
  key: RouteKey;
  href: string;
}

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
}

export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  context: string;
  image: string;
  imageAlt: string;
}

export type Messages = typeof en;
