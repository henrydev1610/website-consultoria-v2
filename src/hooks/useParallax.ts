"use client";

import { useEffect, type RefObject } from "react";

import { ensureGsapRegistered, gsap } from "@/lib/gsap";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface ParallaxItem {
  selector: string;
  yPercent: number;
  start?: string;
  end?: string;
}

export function useParallax(
  scope: RefObject<HTMLElement | null>,
  items: ParallaxItem[],
) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = scope.current;

    if (!element || !items.length) {
      return;
    }

    if (prefersReducedMotion) {
      items.forEach(({ selector }) => {
        const targets = element.querySelectorAll<HTMLElement>(selector);
        gsap.set(targets, { clearProps: "transform" });
      });
      return;
    }

    ensureGsapRegistered();

    const context = gsap.context(() => {
      items.forEach(({ selector, yPercent, start, end }) => {
        const targets = element.querySelectorAll<HTMLElement>(selector);

        targets.forEach((target) => {
          gsap.fromTo(
            target,
            { yPercent: -yPercent },
            {
              yPercent,
              ease: "none",
              scrollTrigger: {
                trigger: target,
                start: start ?? "top bottom",
                end: end ?? "bottom top",
                scrub: true,
              },
            },
          );
        });
      });
    }, element);

    return () => context.revert();
  }, [items, prefersReducedMotion, scope]);
}
