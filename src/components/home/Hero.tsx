"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { homeImages } from "@/data/images";
import { siteConfig } from "@/data/site";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";
import { RevealText } from "../ui/RevealText";
import { Container } from "../layout/Container";

interface HeroProps {
  eyebrow: string;
  title: string[];
  description: string;
  cta: string;
  imageAlt: string;
}

export function Hero({
  eyebrow,
  title,
  description,
  cta,
  imageAlt,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = sectionRef.current;
    const header = document.querySelector<HTMLElement>("[data-header-root]");

    if (!element) {
      return;
    }

    if (prefersReducedMotion) {
      gsap.set(
        [
          element.querySelector("[data-hero-image]"),
          element.querySelector("[data-hero-overlay]"),
          element.querySelector("[data-hero-eyebrow]"),
          element.querySelectorAll("[data-hero-line]"),
          element.querySelector("[data-hero-copy]"),
          element.querySelector("[data-hero-cta]"),
          header,
        ],
        { clearProps: "all", opacity: 1, y: 0, scale: 1 },
      );
      return;
    }

    ensureGsapRegistered();

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .fromTo(
          "[data-hero-image]",
          { scale: 1.06, opacity: 0.6 },
          { scale: 1, opacity: 1, duration: 1.3 },
        )
        .fromTo(
          "[data-hero-overlay]",
          { opacity: 0 },
          { opacity: 1, duration: 0.9 },
          0.12,
        )
        .fromTo(
          header,
          { y: -24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          0.25,
        )
        .fromTo(
          "[data-hero-eyebrow]",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55 },
          0.36,
        )
        .fromTo(
          "[data-hero-line]",
          { yPercent: 120 },
          { yPercent: 0, duration: 0.9, stagger: 0.08 },
          0.42,
        )
        .fromTo(
          "[data-hero-copy]",
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          0.76,
        )
        .fromTo(
          "[data-hero-cta]",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55 },
          0.88,
        );

      gsap.to("[data-hero-image]", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to("[data-hero-title]", {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, element);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-black text-white"
    >
      <div id="hero-sentinel" className="absolute inset-x-0 top-0 h-24" />
      <div className="absolute inset-0">
        <Image
          src={homeImages.hero.src}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          data-hero-image
        />
      </div>
      <div
        data-hero-overlay
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.68)_55%,rgba(0,0,0,0.9))]"
      />

      <Container className="relative z-10 w-full pb-10 pt-36 md:pb-14 xl:pb-18">
        <div className="grid-layout items-end gap-y-10">
          <div className="col-span-4 space-y-6 md:col-span-6 xl:col-span-7">
            <Eyebrow
              className="text-white/62"
              data-hero-eyebrow
            >
              {eyebrow}
            </Eyebrow>
            <h1
              data-hero-title
              className={cn("display-xl max-w-[9ch] text-white")}
            >
              <RevealText lines={title} />
            </h1>
          </div>

          <div className="col-span-4 grid gap-6 md:col-span-7 md:col-start-2 xl:col-span-3 xl:col-start-10">
            <p
              data-hero-copy
              className="max-w-[29ch] text-[1rem] leading-relaxed text-white/78 md:text-[1.05rem]"
            >
              {description}
            </p>
            <div data-hero-cta>
              <Button
                href={siteConfig.ctaUrl}
                variant="light"
              >
                {cta}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
