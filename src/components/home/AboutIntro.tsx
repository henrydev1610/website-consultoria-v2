"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { homeImages } from "@/data/images";
import { useParallax } from "@/hooks/useParallax";
import { useReveal } from "@/hooks/useReveal";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

import { Container } from "../layout/Container";
import { Eyebrow } from "../ui/Eyebrow";
import { GridFrame } from "../ui/GridFrame";

interface AboutIntroProps {
  eyebrow: string;
  title: string;
  body: string;
  secondary: string;
  primaryImageAlt: string;
  secondaryImageAlt: string;
  frameTitle: string;
  frameBody: string;
}

export function AboutIntro(props: AboutIntroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useReveal(sectionRef, { selector: "[data-reveal]", start: "top 80%" });
  useParallax(sectionRef, [
    { selector: "[data-about-image-primary]", yPercent: 8 },
    { selector: "[data-about-image-secondary]", yPercent: 12 },
  ]);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const lines = Array.from(element.querySelectorAll<HTMLElement>("[data-frame-line]"));
    const crosshairs = Array.from(
      element.querySelectorAll<HTMLElement>("[data-crosshair]"),
    );

    if (prefersReducedMotion) {
      gsap.set(lines, { scaleX: 1 });
      gsap.set(crosshairs, { opacity: 1, rotate: 0 });
      return;
    }

    ensureGsapRegistered();

    const context = gsap.context(() => {
      gsap.fromTo(
        lines,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: element.querySelector("[data-grid-frame]"),
            start: "top 78%",
          },
        },
      );

      gsap.fromTo(
        crosshairs,
        { opacity: 0, rotate: -45 },
        {
          opacity: 1,
          rotate: 0,
          duration: 0.55,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element.querySelector("[data-grid-frame]"),
            start: "top 78%",
          },
        },
      );

      gsap.fromTo(
        "[data-about-clip]",
        { clipPath: "inset(18% 0% 18% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: element,
            start: "top 74%",
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="bg-white py-22 md:py-30">
      <Container className="space-y-18 md:space-y-24">
        <div className="grid-layout items-start gap-y-10">
          <div className="col-span-4 space-y-6 md:col-span-7 xl:col-span-6">
            <Eyebrow data-reveal>{props.eyebrow}</Eyebrow>
            <h2 data-reveal className="display-lg max-w-[13ch] text-black">
              {props.title}
            </h2>
          </div>

          <div className="col-span-4 space-y-6 md:col-span-3 md:col-start-6 xl:col-span-3 xl:col-start-9">
            <p
              data-reveal
              className="max-w-[28ch] text-lg leading-relaxed text-black/72"
            >
              {props.body}
            </p>
            <p data-reveal className="max-w-[28ch] text-base leading-relaxed text-black/52">
              {props.secondary}
            </p>
          </div>
        </div>

        <div className="grid-layout items-start gap-y-8">
          <figure
            data-reveal
            className="col-span-3 overflow-hidden md:col-span-3 xl:col-span-2"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={homeImages.aboutPrimary.src}
                alt={props.primaryImageAlt}
                width={homeImages.aboutPrimary.width}
                height={homeImages.aboutPrimary.height}
                sizes="(max-width: 768px) 48vw, 20vw"
                className="aspect-[4/5] w-full object-cover"
                data-about-image-primary
              />
            </div>
          </figure>

          <figure
            data-reveal
            className="col-span-4 md:col-span-3 md:col-start-6 xl:col-span-3 xl:col-start-10"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={homeImages.aboutSecondary.src}
                alt={props.secondaryImageAlt}
                width={homeImages.aboutSecondary.width}
                height={homeImages.aboutSecondary.height}
                sizes="(max-width: 768px) 72vw, 24vw"
                className="aspect-[5/4] w-full object-cover"
                data-about-image-secondary
              />
            </div>
          </figure>
        </div>

        <div className="grid-layout">
          <div
            data-grid-frame
            className="col-span-4 md:col-span-7 md:col-start-2 xl:col-span-6 xl:col-start-4"
          >
            <GridFrame title={props.frameTitle} body={props.frameBody} />
          </div>
        </div>
      </Container>
    </section>
  );
}
