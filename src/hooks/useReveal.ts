"use client";

import { useEffect, type RefObject } from "react";

import { ensureGsapRegistered, gsap } from "@/lib/gsap";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface RevealOptions {
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
}

export function useReveal(
  scope: RefObject<HTMLElement | null>,
  options: RevealOptions = {},
) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = scope.current;

    if (!element) {
      return;
    }

    const selector = options.selector ?? "[data-reveal]";
    const targets = Array.from(element.querySelectorAll<HTMLElement>(selector));

    if (!targets.length) {
      return;
    }

    if (prefersReducedMotion) {
      gsap.set(targets, { clearProps: "all", opacity: 1, y: 0 });
      return;
    }

    ensureGsapRegistered();

    const context = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: options.y ?? 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: "power3.out",
          stagger: options.stagger ?? 0.12,
          scrollTrigger: {
            trigger: element,
            start: options.start ?? "top 78%",
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [options.selector, options.stagger, options.start, options.y, prefersReducedMotion, scope]);
}
