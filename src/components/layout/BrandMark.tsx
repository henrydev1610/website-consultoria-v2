import Link from "next/link";

import { headerBrand } from "@/data/brand";
import { siteConfig } from "@/data/site";
import { getLocalizedPath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface BrandMarkProps {
  locale: Locale;
  className?: string;
  branding?: "default" | "header";
}

export function BrandMark({
  locale,
  className,
  branding = "default",
}: BrandMarkProps) {
  const brandLabel = branding === "header" ? headerBrand.name : siteConfig.name;
  const brandMonogram = headerBrand.monogram;

  return (
    <Link
      href={getLocalizedPath(locale, "home")}
      className={cn(
        "inline-flex items-center gap-3 uppercase tracking-[0.24em]",
        className,
      )}
      aria-label={brandLabel}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center border border-current text-[0.7rem] font-semibold tracking-[0.18em]">
        {brandMonogram}
      </span>
      <span className="text-[0.64rem] font-medium leading-none tracking-[0.18em] sm:text-[0.72rem] sm:tracking-[0.22em]">
        {brandLabel}
      </span>
    </Link>
  );
}
