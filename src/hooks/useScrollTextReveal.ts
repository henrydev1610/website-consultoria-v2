"use client";

import { useEffect, type RefObject } from "react";

import { ensureGsapRegistered, gsap } from "@/lib/gsap";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface ScrollTextRevealOptions {
  start?: string;
  end?: string;
}

export function useScrollTextReveal(
  scope: RefObject<HTMLElement | null>,
  options: ScrollTextRevealOptions = {},
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const start = options.start ?? "top 68%";
  const end = options.end ?? "bottom 48%";

  useEffect(() => {
    const element = scope.current;

    if (!element) {
      return;
    }

    const words = Array.from(element.querySelectorAll<HTMLElement>("[data-word]"));

    if (!words.length) {
      return;
    }

    if (prefersReducedMotion) {
      gsap.set(words, { color: "var(--color-text-primary)" });
      return;
    }

    ensureGsapRegistered();

    const context = gsap.context(() => {
      gsap.fromTo(
        words,
        { color: "var(--color-text-ghost)" },
        {
          color: "var(--color-text-primary)",
          ease: "none",
          stagger: 0.18,
          scrollTrigger: {
            trigger: element,
            start,
            end,
            scrub: true,
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [prefersReducedMotion, scope, start, end]);
}
