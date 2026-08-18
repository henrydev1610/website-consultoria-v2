"use client";

import { useEffect, useState } from "react";

export type HeaderTheme = "light" | "dark";

export function useHeaderTheme(isHomePage: boolean) {
  const [theme, setTheme] = useState<HeaderTheme>("light");

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const sentinel = document.getElementById("hero-sentinel");

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setTheme(entry.isIntersecting ? "light" : "dark");
      },
      { threshold: 0.35 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [isHomePage]);

  return isHomePage ? theme : "dark";
}
