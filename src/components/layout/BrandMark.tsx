import Link from "next/link";

import { siteConfig } from "@/data/site";
import { getLocalizedPath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface BrandMarkProps {
  locale: Locale;
  className?: string;
}

export function BrandMark({ locale, className }: BrandMarkProps) {
  return (
    <Link
      href={getLocalizedPath(locale, "home")}
      className={cn(
        "inline-flex items-center gap-3 uppercase tracking-[0.24em]",
        className,
      )}
      aria-label={siteConfig.name}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center border border-current text-[0.7rem] font-semibold tracking-[0.18em]">
        ND
      </span>
      <span className="text-[0.68rem] font-medium leading-none sm:text-[0.74rem]">
        {siteConfig.name}
      </span>
    </Link>
  );
}
