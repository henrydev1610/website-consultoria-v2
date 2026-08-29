"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";

import { aboutEditorialImages } from "@/data/images";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReveal } from "@/hooks/useReveal";
import { useScrollTextReveal } from "@/hooks/useScrollTextReveal";
import { getLocalizedPath } from "@/lib/i18n";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import type { Locale, Messages } from "@/types";

import { Container } from "../layout/Container";
import { Crosshair } from "../ui/Crosshair";
import { Eyebrow } from "../ui/Eyebrow";
import { SplitScrambleLink } from "../ui/SplitScrambleLink";

interface AboutSectionProps {
  locale: Locale;
  messages: Messages;
}

const cardImageById = {
  preparation: aboutEditorialImages.leftFeature,
  review: aboutEditorialImages.topPortrait,
  translation: aboutEditorialImages.flightDetail,
  checklist: aboutEditorialImages.checklistCard,
} as const;

const aboutParallaxItems = [
  {
    selector: '[data-about-float="top-right"]',
    desktop: { fromX: 5, toX: -4, fromY: -10, toY: 16 },
    tablet: { fromX: 4, toX: -3, fromY: -7, toY: 11 },
    mobile: { fromX: 2, toX: -2, fromY: -4, toY: 6 },
  },
  {
    selector: '[data-about-float="mid-left"]',
    desktop: { fromX: -4, toX: 3, fromY: 12, toY: -18 },
    tablet: { fromX: -3, toX: 2, fromY: 9, toY: -13 },
    mobile: { fromX: -1.5, toX: 1.5, fromY: 5, toY: -6 },
  },
  {
    selector: '[data-about-float="mid-right"]',
    desktop: { fromX: 4, toX: -3, fromY: 16, toY: -12 },
    tablet: { fromX: 3, toX: -2, fromY: 11, toY: -9 },
    mobile: { fromX: 1.5, toX: -1.5, fromY: 5, toY: -5 },
  },
  {
    selector: '[data-about-float="bottom-left"]',
    desktop: { fromX: -5, toX: 4, fromY: 24, toY: -20 },
    tablet: { fromX: -4, toX: 3, fromY: 16, toY: -14 },
    mobile: { fromX: -2, toX: 2, fromY: 7, toY: -7 },
  },
  {
    selector: '[data-about-float="bottom-right"]',
    desktop: { fromX: 5, toX: -4, fromY: 20, toY: -16 },
    tablet: { fromX: 4, toX: -3, fromY: 14, toY: -11 },
    mobile: { fromX: 2, toX: -2, fromY: 6, toY: -6 },
  },
  {
    selector: '[data-about-float="approach-top"]',
    desktop: { fromX: 3, toX: -3, fromY: 14, toY: -12 },
    tablet: { fromX: 2, toX: -2, fromY: 10, toY: -8 },
    mobile: { fromX: 0, toX: 0, fromY: 0, toY: 0 },
  },
  {
    selector: '[data-about-float="approach-mid"]',
    desktop: { fromX: 4, toX: -4, fromY: 18, toY: -15 },
    tablet: { fromX: 3, toX: -3, fromY: 12, toY: -10 },
    mobile: { fromX: 0, toX: 0, fromY: 0, toY: 0 },
  },
  {
    selector: '[data-about-float="approach-bottom"]',
    desktop: { fromX: -2, toX: 3, fromY: 11, toY: -9 },
    tablet: { fromX: -2, toX: 2, fromY: 8, toY: -6 },
    mobile: { fromX: 0, toX: 0, fromY: 0, toY: 0 },
  },
  {
    selector: "[data-card-media]",
    desktop: { fromX: 0, toX: 0, fromY: 14, toY: -14 },
    tablet: { fromX: 0, toX: 0, fromY: 9, toY: -9 },
    mobile: { fromX: 0, toX: 0, fromY: 3, toY: -3 },
  },
] as const;

export function AboutSection({ locale, messages }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const aboutHeadlineRef = useRef<HTMLHeadingElement>(null);
  const ghostRevealRef = useRef<HTMLDivElement>(null);
  const servicesStatementRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const about = messages.home.about;
  const manifesto = messages.home.manifesto;
  const services = messages.home.services;
  const aboutLink = getLocalizedPath(locale, "about");
  const servicesLink = getLocalizedPath(locale, "services");
  const manifestoHeadline = manifesto.text.split(/(?<=[.!?])\s+/)[0] ?? manifesto.text;
  const manifestoHeadlineWords = manifestoHeadline.replace(/[.!?]+$/, "").split(/\s+/);
  const manifestoLineBreakIndex = Math.ceil(manifestoHeadlineWords.length / 2);
  const manifestoHeadlineLines = [
    manifestoHeadlineWords.slice(0, manifestoLineBreakIndex),
    manifestoHeadlineWords.slice(manifestoLineBreakIndex),
  ].filter((line) => line.length > 0);
  const serviceTitleWords = services.title.split(/\s+/);

  useReveal(sectionRef, {
    selector: "[data-about-reveal]",
    y: 22,
    stagger: 0.08,
    start: "top 82%",
  });

  useScrollTextReveal(aboutHeadlineRef);
  useScrollTextReveal(ghostRevealRef);
  useScrollTextReveal(servicesStatementRef);
  useScrollTextReveal(statementRef);

  const serviceCards = useMemo(
    () =>
      services.items.map((item) => ({
        ...item,
        image: cardImageById[item.id as keyof typeof cardImageById] ?? aboutEditorialImages.preparationCard,
      })),
    [services.items],
  );

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    if (prefersReducedMotion) {
      aboutParallaxItems.forEach(({ selector }) => {
        const elements = Array.from(element.querySelectorAll<HTMLElement>(selector));
        gsap.set(elements, { clearProps: "transform" });
      });
      return;
    }

    ensureGsapRegistered();
    const matchMedia = gsap.matchMedia();
    const context = gsap.context(() => {
      const applyParallax = (breakpoint: "desktop" | "tablet" | "mobile") => {
        aboutParallaxItems.forEach(({ selector, ...ranges }) => {
          const targets = Array.from(element.querySelectorAll<HTMLElement>(selector));
          const range = ranges[breakpoint];

          targets.forEach((target) => {
            gsap.fromTo(
              target,
              {
                xPercent: range.fromX,
                yPercent: range.fromY,
              },
              {
                xPercent: range.toX,
                yPercent: range.toY,
                ease: "none",
                scrollTrigger: {
                  trigger: element,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.9,
                },
              },
            );
          });
        });
      };

      matchMedia.add("(min-width: 1280px)", () => {
        applyParallax("desktop");
      });

      matchMedia.add("(min-width: 768px) and (max-width: 1279px)", () => {
        applyParallax("tablet");
      });

      matchMedia.add("(max-width: 767px)", () => {
        applyParallax("mobile");
      });
    }, element);

    return () => {
      matchMedia.revert();
      context.revert();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const clips = Array.from(element.querySelectorAll<HTMLElement>("[data-about-clip]"));
    const linesX = Array.from(element.querySelectorAll<HTMLElement>("[data-about-line-x]"));
    const linesY = Array.from(element.querySelectorAll<HTMLElement>("[data-about-line-y]"));
    const ghost = element.querySelector<HTMLElement>("[data-about-ghost]");
    const servicesGrid = element.querySelector<HTMLElement>("[data-services-grid]");
    const serviceCards = servicesGrid
      ? Array.from(servicesGrid.querySelectorAll<HTMLElement>("[data-service-card]"))
      : [];

    if (prefersReducedMotion) {
      gsap.set(clips, { clearProps: "all", clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0 });
      gsap.set(linesX, { scaleX: 1 });
      gsap.set(linesY, { scaleY: 1 });
      gsap.set("[data-crosshair]", { opacity: 1, rotate: 0 });
      gsap.set(ghost, { clearProps: "transform" });
      gsap.set(serviceCards, { clearProps: "all", opacity: 1, x: 0, y: 0 });
      return;
    }

    ensureGsapRegistered();
    const matchMedia = gsap.matchMedia();

    const context = gsap.context(() => {
      gsap.fromTo(
        clips,
        { clipPath: "inset(18% 0% 18% 0%)", opacity: 0.72, y: 26 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          y: 0,
          duration: 1.15,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
          },
        },
      );

      gsap.fromTo(
        linesX,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.95,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: element,
            start: "top 84%",
          },
        },
      );

      gsap.fromTo(
        linesY,
        { scaleY: 0, transformOrigin: "center top" },
        {
          scaleY: 1,
          duration: 0.95,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: element,
            start: "top 84%",
          },
        },
      );

      gsap.fromTo(
        "[data-crosshair]",
        { opacity: 0, rotate: -35 },
        {
          opacity: 1,
          rotate: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.03,
          scrollTrigger: {
            trigger: element,
            start: "top 84%",
          },
        },
      );

      if (ghost) {
        gsap.fromTo(
          ghost,
          { yPercent: 8 },
          {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: ghost,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      if (servicesGrid && serviceCards.length) {
        matchMedia.add("(min-width: 768px)", () => {
          const rows = [serviceCards.slice(0, 2), serviceCards.slice(2, 4)].filter((row) => row.length > 0);
          const horizontalOffset = window.innerWidth >= 1280 ? 22 : 14;

          rows.forEach((row) => {
            const trigger = row[0];

            if (!trigger) {
              return;
            }

            gsap.fromTo(
              row,
              {
                xPercent: (_, target) =>
                  target instanceof HTMLElement && target.dataset.serviceDirection === "right"
                    ? horizontalOffset
                    : -horizontalOffset,
                opacity: 0.32,
              },
              {
                xPercent: 0,
                opacity: 1,
                ease: "none",
                stagger: 0,
                scrollTrigger: {
                  trigger,
                  start: "top 90%",
                  end: "top 38%",
                  scrub: 0.6,
                },
              },
            );
          });
        });

        matchMedia.add("(max-width: 767px)", () => {
          serviceCards.forEach((card, index) => {
            gsap.fromTo(
              card,
              {
                xPercent: index % 2 === 0 ? -7 : 7,
                opacity: 0.42,
              },
              {
                xPercent: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top 92%",
                  end: "top 58%",
                  scrub: 0.5,
                },
              },
            );
          });
        });
      }
    }, element);

    return () => {
      matchMedia.revert();
      context.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f5f4f0] text-black"
    >
      <Container className="relative py-20 md:py-28 xl:py-34">
        <div className="relative grid gap-8 md:min-h-[84rem] md:block xl:min-h-[92rem]">
          <span
            data-about-line-x
            className="pointer-events-none absolute left-[5%] right-[12%] top-[11%] hidden h-px origin-left bg-black/10 md:block"
          />
          <span
            data-about-line-x
            className="pointer-events-none absolute left-[10%] right-[8%] top-[56%] hidden h-px origin-left bg-black/10 md:block"
          />
          <span
            data-about-line-x
            className="pointer-events-none absolute left-[6%] right-[6%] top-[86%] hidden h-px origin-left bg-black/10 xl:block"
          />
          <span
            data-about-line-y
            className="pointer-events-none absolute left-[24%] top-[11%] hidden h-[68%] w-px origin-top bg-black/10 md:block"
          />
          <span
            data-about-line-y
            className="pointer-events-none absolute right-[19%] top-[11%] hidden h-[74%] w-px origin-top bg-black/10 xl:block"
          />

          <Crosshair className="left-[24%] top-[11%] hidden md:block" />
          <Crosshair className="left-[10%] top-[56%] hidden md:block" />
          <Crosshair className="right-[19%] top-[56%] hidden xl:block" />
          <Crosshair className="right-[6%] top-[86%] hidden xl:block" />

          <figure
            data-about-reveal
            data-about-float="top-right"
            aria-hidden="true"
            className="relative order-1 ml-auto w-[42vw] max-w-[11rem] overflow-hidden md:absolute md:right-[9%] md:top-[7%] md:w-[11rem] md:z-0 xl:right-[11%] xl:w-[13rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.topPortrait.src}
                alt=""
                width={aboutEditorialImages.topPortrait.width}
                height={aboutEditorialImages.topPortrait.height}
                sizes="(max-width: 767px) 44vw, 12rem"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </figure>

          <div className="order-3 relative z-[2] mx-auto flex w-full max-w-[52rem] flex-col items-center text-center md:w-[min(76vw,58rem)] md:pt-[8.5rem] xl:w-[min(72vw,66rem)] xl:pt-[8rem]">
            <h2
              ref={aboutHeadlineRef}
              data-about-reveal
              className="w-full max-w-[12ch] text-center text-[clamp(4.4rem,8.3vw,10.2rem)] font-[600] leading-[0.88] tracking-[-0.055em] text-black/18 md:max-w-[24ch] xl:max-w-[28ch]"
              style={{ textWrap: "balance" }}
            >
              {about.headlineLines.map((line) => (
                <span key={line} className="block">
                  {line.split(/\s+/).map((word, wordIndex, words) => (
                    <span key={`${line}-${word}-${wordIndex}`}>
                      <span data-word className="manifesto-word">
                        {word}
                      </span>
                      {wordIndex < words.length - 1 ? " " : ""}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
          </div>

          <figure
            data-about-reveal
            data-about-float="mid-left"
            aria-hidden="true"
            className="relative order-4 hidden overflow-hidden md:absolute md:left-[8%] md:top-[45%] md:block md:w-[10rem] md:z-0 xl:left-[10%] xl:w-[11.5rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.reviewCard.src}
                alt=""
                width={aboutEditorialImages.reviewCard.width}
                height={aboutEditorialImages.reviewCard.height}
                sizes="(max-width: 1279px) 16vw, 11.5rem"
                className="aspect-square w-full object-cover"
              />
            </div>
          </figure>

          <div
            data-about-reveal
            className="order-6 relative z-[3] mx-auto mt-[clamp(3rem,6vw,6.25rem)] w-full max-w-[36rem] border border-black/10 bg-[#f5f4f0]/92 p-6 md:w-[min(44vw,38rem)] md:max-w-none md:p-8 xl:w-[min(42vw,41rem)] xl:p-10"
          >
            <Crosshair className="-left-1.5 -top-1.5" />
            <Crosshair className="-right-1.5 -top-1.5" />
            <Crosshair className="-bottom-1.5 -left-1.5" />
            <Crosshair className="-bottom-1.5 -right-1.5" />
            <span
              data-about-line-x
              className="absolute left-0 top-0 h-px w-full origin-left bg-black/10"
            />
            <span
              data-about-line-y
              className="absolute right-0 top-0 h-full w-px origin-top bg-black/10"
            />

            <div className="space-y-5">
              <Eyebrow className="text-black/48">{about.frameTitle}</Eyebrow>
              <p className="max-w-[26ch] text-[clamp(1.38rem,1.85vw,1.92rem)] font-[400] leading-[1.14] tracking-[-0.026em] text-black/82">
                {about.body}
              </p>
              <p className="max-w-[33ch] text-sm leading-relaxed text-black/56 md:text-[0.98rem]">
                {about.secondary}
              </p>
              <SplitScrambleLink
                href={aboutLink}
                label={about.ctaLabel}
                className="mt-3"
              />
            </div>
          </div>

          <figure
            data-about-reveal
            data-about-float="mid-right"
            aria-hidden="true"
            className="relative order-5 ml-auto  w-[54vw] max-w-[13rem] overflow-hidden md:absolute md:right-[9%] md:top-[37%] md:w-[11rem] md:z-0 xl:right-[11%] xl:top-[36%] xl:w-[12.5rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.documentDetail.src}
                alt=""
                width={aboutEditorialImages.documentDetail.width}
                height={aboutEditorialImages.documentDetail.height}
                sizes="(max-width: 767px) 54vw, (max-width: 1279px) 18vw, 12.5rem"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </figure>

          <figure
            data-about-reveal
            data-about-float="bottom-left"
            aria-hidden="true"
            className="relative order-7 hidden overflow-hidden md:absolute md:left-[7%] md:top-[73%] md:block md:w-[13rem] md:z-0 xl:left-[9%] xl:w-[15rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.leftFeature.src}
                alt=""
                width={aboutEditorialImages.leftFeature.width}
                height={aboutEditorialImages.leftFeature.height}
                sizes="(max-width: 1279px) 20vw, 15rem"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </figure>

          <figure
            data-about-reveal
            data-about-float="bottom-right"
            aria-hidden="true"
            className="relative order-8 ml-auto w-[62vw] max-w-[16rem] overflow-hidden md:absolute md:right-[6%] md:top-[72%] md:w-[14rem] md:z-0 xl:right-[7%] xl:top-[71%] xl:w-[17rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.checklistCard.src}
                alt=""
                width={aboutEditorialImages.checklistCard.width}
                height={aboutEditorialImages.checklistCard.height}
                sizes="(max-width: 767px) 62vw, (max-width: 1279px) 21vw, 17rem"
                className="aspect-[5/3.7] w-full object-cover"
              />
            </div>
          </figure>
        </div>

        <div className="relative mt-18 space-y-14 md:mt-8 md:space-y-18 xl:mt-16 xl:space-y-24">
          <div
            ref={ghostRevealRef}
            className="relative overflow-hidden border-y border-black/8 py-10 md:py-16 xl:py-20"
          >
            <span
              data-about-line-x
              className="absolute left-0 top-0 h-px w-full origin-left bg-black/10"
            />
            <span
              data-about-line-x
              className="absolute bottom-0 left-0 h-px w-full origin-left bg-black/10"
            />
            <Crosshair className="-left-1.5 top-0" />
            <Crosshair className="-right-1.5 top-0" />

            <p
              data-about-ghost
              className="pointer-events-none about-ghost-heading relative z-0 max-w-[10ch] text-[rgba(17,17,17,0.1)]"
            >
              {about.backgroundLines.map((line) => (
                <span key={line} className="block">
                  {line.split(/\s+/).map((word, wordIndex, words) => (
                    <span key={`${line}-${word}-${wordIndex}`}>
                      <span data-word className="manifesto-word">
                        {word}
                      </span>
                      {wordIndex < words.length - 1 ? " " : ""}
                    </span>
                  ))}
                </span>
              ))}
            </p>

            <figure
              data-about-reveal
              data-about-float="flight"
              className="relative z-[1] ml-auto -mt-8 hidden w-[16rem] overflow-hidden md:block xl:-mt-12 xl:w-[19rem]"
            >
              <div data-about-clip className="overflow-hidden">
                <Image
                  src={aboutEditorialImages.flightDetail.src}
                  alt={messages.home.international.imageAlt}
                  width={aboutEditorialImages.flightDetail.width}
                  height={aboutEditorialImages.flightDetail.height}
                  sizes="(max-width: 1279px) 30vw, 19rem"
                  className="aspect-[5/3.2] w-full object-cover"
                />
              </div>
            </figure>
          </div>

          <div
            ref={statementRef}
            className="relative grid gap-8 overflow-hidden border-t border-black/10 pt-8 md:grid-cols-[1.1fr_2.2fr] md:pt-12 xl:gap-12"
          >
            <div className="relative z-[1] space-y-4">
              <Eyebrow data-about-reveal>{manifesto.eyebrow}</Eyebrow>
              <p data-about-reveal className="max-w-[24ch] text-sm leading-relaxed text-black/54 md:text-base">
                {about.frameBody}
              </p>
            </div>
            <h2
              className="relative z-[1] manifesto-text max-w-[15ch] text-black/18 md:max-w-[12.75ch] xl:max-w-[13.25ch]"
            >
              {manifestoHeadlineLines.map((lineWords, lineIndex) => (
                <span key={`manifesto-line-${lineIndex}`} className="block">
                  {lineWords.map((word, wordIndex) => (
                    <span
                      key={`${lineIndex}-${word}-${wordIndex}`}
                      data-word
                      className="manifesto-word"
                    >
                      {word}
                      {wordIndex < lineWords.length - 1 ? "\u00A0" : ""}
                    </span>
                  ))}
                </span>
              ))}
            </h2>

            <figure
              data-about-reveal
              data-about-float="approach-top"
              aria-hidden="true"
              className="pointer-events-none absolute right-[6%] top-[8%] hidden overflow-hidden md:block md:w-[8.75rem] xl:right-[8%] xl:w-[10rem]"
            >
              <div data-about-clip className="overflow-hidden">
                <Image
                  src={aboutEditorialImages.consultingDetail.src}
                  alt=""
                  width={aboutEditorialImages.consultingDetail.width}
                  height={aboutEditorialImages.consultingDetail.height}
                  sizes="(max-width: 1279px) 14vw, 10rem"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </figure>

            <figure
              data-about-reveal
              data-about-float="approach-mid"
              aria-hidden="true"
              className="pointer-events-none absolute right-[18%] top-[42%] hidden overflow-hidden md:block md:w-[12.5rem] xl:right-[22%] xl:w-[15rem]"
            >
              <div data-about-clip className="overflow-hidden">
                <Image
                  src={aboutEditorialImages.corridorDetail.src}
                  alt=""
                  width={aboutEditorialImages.corridorDetail.width}
                  height={aboutEditorialImages.corridorDetail.height}
                  sizes="(max-width: 1279px) 22vw, 15rem"
                  className="aspect-[5/3.8] w-full object-cover"
                />
              </div>
            </figure>

            <figure
              data-about-reveal
              data-about-float="approach-bottom"
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[7%] right-[5%] hidden overflow-hidden md:block md:w-[7.5rem] xl:right-[10%] xl:w-[9rem]"
            >
              <div data-about-clip className="overflow-hidden">
                <Image
                  src={aboutEditorialImages.passportDetail.src}
                  alt=""
                  width={aboutEditorialImages.passportDetail.width}
                  height={aboutEditorialImages.passportDetail.height}
                  sizes="(max-width: 1279px) 12vw, 9rem"
                  className="aspect-square w-full object-cover"
                />
              </div>
            </figure>
          </div>

          <div className="space-y-10 border-t border-black/10 pt-10 md:space-y-14 md:pt-12 xl:space-y-16 xl:pt-14">
            <div
              ref={servicesStatementRef}
              className="grid justify-items-center gap-8 md:gap-10 xl:gap-12"
            >
              <h3
                data-about-reveal
                className="w-full max-w-[15.5ch] text-left text-[clamp(4.4rem,8.3vw,10.2rem)] font-[600] leading-[0.9] tracking-[-0.055em] text-black md:max-w-[14.5ch] xl:max-w-[16.4ch]"
                style={{ textWrap: "balance" }}
              >
                {serviceTitleWords.map((word, index) => (
                  <span key={`${word}-${index}`} data-word className="manifesto-word">
                    {word}
                    {index < serviceTitleWords.length - 1 ? " " : ""}
                  </span>
                ))}
              </h3>
              <p
                data-about-reveal
                className="max-w-[34ch] text-center text-[clamp(1.4rem,2.35vw,2.7rem)] font-[400] leading-[1.08] tracking-[-0.03em] text-black/66"
              >
                {services.subtitle}
              </p>
            </div>

            <div data-services-grid className="grid gap-6 md:auto-rows-fr md:grid-cols-2">
              {serviceCards.map((item, index) => (
                <article
                  key={item.id}
                  data-service-card
                  data-service-direction={index % 2 === 0 ? "left" : "right"}
                  className="relative flex h-full border border-black/10 bg-[#f8f7f2]"
                >
                  <Crosshair className="-left-1.5 -top-1.5" />
                  <Crosshair className="-right-1.5 -top-1.5" />
                  <Crosshair className="-bottom-1.5 -right-1.5" />

                  <div className="flex h-full w-full flex-col">
                    <div className="overflow-hidden">
                      <div
                        data-about-clip
                        data-card-media
                        className="aspect-[5/3.6] overflow-hidden"
                      >
                        <Image
                          src={item.image.src}
                          alt={item.title}
                          width={item.image.width}
                          height={item.image.height}
                          sizes="(max-width: 767px) 100vw, 50vw"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-7 border-t border-black/10 p-5 md:gap-8 md:p-6 xl:p-7">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-black/42">
                          {item.number}
                        </span>
                        <span className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-black/42">
                          {messages.navigation.services}
                        </span>
                      </div>

                      <div className="grid flex-1 content-start gap-5 md:gap-6">
                        <h4 className="max-w-[16ch] text-[clamp(1.45rem,2vw,2.3rem)] uppercase leading-[0.94] tracking-[-0.04em] text-black">
                          {item.title}
                        </h4>
                        <p className="max-w-[19ch] text-[clamp(1.6rem,2.2vw,2.7rem)] font-[400] leading-[1.08] tracking-[-0.032em] text-black/76">
                          {item.description}
                        </p>
                      </div>

                      <SplitScrambleLink
                        href={servicesLink}
                        label={services.ctaLabel}
                        className="mt-auto"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
