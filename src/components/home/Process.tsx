"use client";

import { useEffect, useRef } from "react";

import { useReveal } from "@/hooks/useReveal";
import { useScrollTextReveal } from "@/hooks/useScrollTextReveal";
import { getLocalizedPath } from "@/lib/i18n";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { Locale, ProcessStep } from "@/types";

import { Container } from "../layout/Container";
import { SplitScrambleLink } from "../ui/SplitScrambleLink";

interface ProcessProps {
  locale: Locale;
  title: string;
  ctaLabel: string;
  items: ProcessStep[];
}

export function Process({ locale, title, ctaLabel, items }: ProcessProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRevealRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const titleWords = title.split(/\s+/);
  const ctaHref = getLocalizedPath(locale, "process");

  useReveal(sectionRef, { selector: "[data-process-head]" });
  useScrollTextReveal(titleRevealRef);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const rows = Array.from(element.querySelectorAll<HTMLElement>("[data-process-row]"));
    const lines = Array.from(element.querySelectorAll<HTMLElement>("[data-process-line]"));

    if (prefersReducedMotion) {
      gsap.set(rows, { opacity: 1, y: 0 });
      gsap.set(lines, { scaleX: 1, scaleY: 1 });
      return;
    }

    ensureGsapRegistered();

    const context = gsap.context(() => {
      gsap.fromTo(
        rows,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 74%",
          },
        },
      );

      gsap.fromTo(
        lines,
        { scaleX: 0, scaleY: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          scaleY: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: element,
            start: "top 76%",
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="bg-white py-22 md:py-30">
      <Container className="space-y-12">
        <div className="grid-layout gap-y-6">
          <div className="col-span-4 mb-[8rem] mt-[5rem] md:col-span-8 xl:col-span-11">
            <h2
              ref={titleRevealRef}
              className="w-full max-w-[12ch] text-center text-[clamp(4.4rem,8.3vw,10.2rem)] font-[600] leading-[0.88] tracking-[-0.055em] text-black/18 md:max-w-[24ch] xl:max-w-[28ch]"
              style={{ textWrap: "balance" }}
            >
              {titleWords.map((word, index) => (
                <span key={`${word}-${index}`} data-word className="manifesto-word">
                  {word}
                  {index < titleWords.length - 1 ? " " : ""}
                </span>
              ))}
            </h2>
          </div>
        </div>

        <div className="relative border border-black/10">
          <span data-process-line className="absolute left-0 top-0 h-px w-full bg-black/10" />
          {items.map((item, index) => (
            <div key={item.number} className="relative">
              <div
                data-process-row
                className="grid gap-5 px-5 py-7 md:grid-cols-[110px_1.4fr_1fr] md:px-8 xl:grid-cols-[140px_1.2fr_0.9fr] xl:px-10"
              >
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[var(--color-accent)]">
                  {item.number}
                </span>
                <h3 className="text-[clamp(1.8rem,3.2vw,2.8rem)] uppercase leading-[0.95] tracking-[-0.04em] text-black">
                  {item.title}
                </h3>
                <p className="max-w-[30ch] text-base leading-relaxed text-black/60">
                  {item.description}
                </p>
              </div>
              {index < items.length - 1 ? (
                <span
                  data-process-line
                  className="absolute bottom-0 left-0 h-px w-full bg-black/10"
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-[clamp(3rem,6vw,7rem)]">
          <SplitScrambleLink href={ctaHref} label={ctaLabel} className="mx-auto" />
        </div>
      </Container>
    </section>
  );
}
