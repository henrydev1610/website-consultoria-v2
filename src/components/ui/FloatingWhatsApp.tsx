"use client";

import { useEffect, useMemo, useState } from "react";

import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

interface FloatingWhatsAppProps {
  ariaLabel: string;
  heroId?: string;
}

const HERO_VISIBILITY_THRESHOLD = 0.18;
const HERO_ROOT_MARGIN = "0px 0px -18% 0px";

export function FloatingWhatsApp({
  ariaLabel,
  heroId = "hero",
}: FloatingWhatsAppProps) {
  const [isVisible, setIsVisible] = useState(false);
  const whatsappHref = useMemo(
    () => `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`,
    [],
  );

  useEffect(() => {
    const hero = document.getElementById(heroId);

    if (!hero || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const heroIsRelevant =
          entry.isIntersecting && entry.intersectionRatio >= HERO_VISIBILITY_THRESHOLD;
        const hasScrolledPastHero = entry.boundingClientRect.top < 0;

        setIsVisible(!heroIsRelevant && hasScrolledPastHero);
      },
      {
        threshold: [0, HERO_VISIBILITY_THRESHOLD, 0.4, 0.7],
        rootMargin: HERO_ROOT_MARGIN,
      },
    );

    observer.observe(hero);

    return () => observer.disconnect();
  }, [heroId]);

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "pointer-events-none fixed bottom-[calc(1.375rem+env(safe-area-inset-bottom))] right-4 z-30 md:bottom-auto md:right-7 md:top-[65%] xl:right-9",
        "transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-200 motion-reduce:ease-linear",
        isVisible
          ? "translate-y-0 scale-100 opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100"
          : "translate-y-3 scale-[0.92] opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100",
      )}
    >
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        tabIndex={isVisible ? 0 : -1}
        className={cn(
          "pointer-events-auto inline-flex h-[3.625rem] w-[3.625rem] items-center justify-center border border-white/18 bg-[var(--color-accent)] text-white outline-none md:h-[3.9rem] md:w-[3.9rem]",
          "transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[0.96] focus-visible:scale-[0.96]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(17,17,17,0.6)] motion-reduce:transition-opacity",
        )}
      >
        <span className="sr-only">{ariaLabel}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-[1.6rem] w-[1.6rem] fill-current md:h-[1.72rem] md:w-[1.72rem]"
        >
          <path d="M19.05 4.94A9.9 9.9 0 0 0 12 2a9.95 9.95 0 0 0-8.63 14.93L2 22l5.22-1.36A9.95 9.95 0 0 0 12 22h.01A9.99 9.99 0 0 0 22 12.05a9.9 9.9 0 0 0-2.95-7.11Zm-7.04 15.37h-.01a8.3 8.3 0 0 1-4.23-1.15l-.3-.18-3.1.81.83-3.03-.2-.31a8.28 8.28 0 0 1 7-12.75 8.21 8.21 0 0 1 5.88 2.44 8.27 8.27 0 0 1-5.87 14.17Zm4.54-6.2c-.25-.12-1.5-.74-1.73-.82-.23-.09-.4-.13-.56.12-.17.25-.65.82-.8.99-.15.17-.3.19-.56.07-.25-.13-1.08-.4-2.05-1.28a7.66 7.66 0 0 1-1.42-1.76c-.15-.25-.02-.39.11-.52.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.07-.13-.56-1.36-.77-1.86-.2-.48-.41-.41-.56-.42h-.48c-.17 0-.43.06-.65.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.01 2.59.13.17 1.75 2.67 4.24 3.74.59.25 1.05.4 1.41.51.59.19 1.12.16 1.54.1.47-.07 1.5-.61 1.71-1.2.21-.6.21-1.11.15-1.21-.06-.1-.22-.15-.48-.28Z" />
        </svg>
      </a>
    </div>
  );
}
