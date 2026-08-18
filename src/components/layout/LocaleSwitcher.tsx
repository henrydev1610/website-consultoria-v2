"use client";

import { startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { replaceLocaleInPathname } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const localeLabels: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

interface LocaleSwitcherProps {
  locale: Locale;
  label: string;
  className?: string;
  inverted?: boolean;
}

export function LocaleSwitcher({
  locale,
  label,
  className,
  inverted = false,
}: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      router.push(replaceLocaleInPathname(pathname, nextLocale));
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em]",
        className,
      )}
      aria-label={label}
    >
      <span className={cn("sr-only")}>{label}</span>
      {(["pt", "en", "es"] as const).map((item, index) => (
        <div key={item} className="inline-flex items-center gap-3">
          <button
            type="button"
            onClick={() => switchLocale(item)}
            className={cn(
              "transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              item === locale
                ? "text-[var(--color-accent)]"
                : inverted
                  ? "text-white/72 hover:text-white"
                  : "text-black/56 hover:text-black",
            )}
            aria-pressed={item === locale}
          >
            {localeLabels[item]}
          </button>
          {index < 2 ? (
            <span className={inverted ? "text-white/28" : "text-black/20"}>/</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
