"use client";

import { useEffect, type RefObject } from "react";

import { ensureGsapRegistered, gsap } from "@/lib/gsap";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function useScrollTextReveal(scope: RefObject<HTMLElement | null>) {
  const prefersReducedMotion = usePrefersReducedMotion();

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
            start: "top 68%",
            end: "bottom 48%",
            scrub: true,
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [prefersReducedMotion, scope]);
}
