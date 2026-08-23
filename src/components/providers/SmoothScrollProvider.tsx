"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

import { ScrollTrigger, ensureGsapRegistered, gsap } from "@/lib/gsap";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

const DESKTOP_LERP = 0.125;
const WHEEL_MULTIPLIER = 0.95;

export function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    ensureGsapRegistered();

    const prefersCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
      lerp: prefersCoarsePointer ? 1 : DESKTOP_LERP,
      smoothWheel: !prefersCoarsePointer,
      syncTouch: false,
      gestureOrientation: "vertical",
      wheelMultiplier: prefersCoarsePointer ? 1 : WHEEL_MULTIPLIER,
      touchMultiplier: 1,
      autoRaf: false,
      autoResize: true,
      anchors: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
      overscroll: true,
    });

    lenisRef.current = lenis;

    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", handleLenisScroll);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const refreshId = window.requestAnimationFrame(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshId);
      gsap.ticker.remove(updateLenis);
      lenis.off("scroll", handleLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;

    if (!lenis || typeof window === "undefined") {
      return;
    }

    const refreshId = window.requestAnimationFrame(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshId);
    };
  }, [pathname]);

  return children;
}
