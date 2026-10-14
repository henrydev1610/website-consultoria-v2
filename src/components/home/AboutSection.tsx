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
import { InstagramSection } from "./InstagramSection";

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

const aboutGalleryImages = [
  {
    position: "mid-left",
    src: "/foto-1-site.jpeg",
    width: 638,
    height: 480,
    positionClass: "md:left-[6%] md:top-[38%]",
  },
  {
    position: "mid-right",
    src: "/foto-2-site.jpeg",
    width: 689,
    height: 445,
    positionClass: "md:right-[6%] md:top-[38%]",
  },
  {
    position: "bottom-left",
    src: "/foto-3-site.jpg",
    width: 2560,
    height: 1696,
    positionClass: "md:left-[6%] md:top-[67%]",
  },
  {
    position: "bottom-right",
    src: "/foto-4-site.webp",
    width: 800,
    height: 534,
    positionClass: "md:right-[6%] md:top-[67%]",
  },
] as const;

const aboutParallaxItems = [
  {
    selector: '[data-about-float="top-right"]',
    desktop: { fromX: 5, toX: -4, fromY: 0, toY: 0 },
    tablet: { fromX: 4, toX: -3, fromY: 0, toY: 0 },
    mobile: { fromX: 2, toX: -2, fromY: 0, toY: 0 },
  },
  {
    selector: '[data-about-float="mid-left"]',
    desktop: { fromX: -1, toX: 1, fromY: 0, toY: 0 },
    tablet: { fromX: -0.5, toX: 0.5, fromY: 0, toY: 0 },
    mobile: { fromX: 0, toX: 0, fromY: 0, toY: 0 },
  },
  {
    selector: '[data-about-float="mid-right"]',
    desktop: { fromX: 1, toX: -1, fromY: 0, toY: 0 },
    tablet: { fromX: 0.5, toX: -0.5, fromY: 0, toY: 0 },
    mobile: { fromX: 0, toX: 0, fromY: 0, toY: 0 },
  },
  {
    selector: '[data-about-float="bottom-left"]',
    desktop: { fromX: -1, toX: 1, fromY: 0, toY: 0 },
    tablet: { fromX: -0.5, toX: 0.5, fromY: 0, toY: 0 },
    mobile: { fromX: 0, toX: 0, fromY: 0, toY: 0 },
  },
  {
    selector: '[data-about-float="bottom-right"]',
    desktop: { fromX: 1, toX: -1, fromY: 0, toY: 0 },
    tablet: { fromX: 0.5, toX: -0.5, fromY: 0, toY: 0 },
    mobile: { fromX: 0, toX: 0, fromY: 0, toY: 0 },
  },
  {
    selector: '[data-about-float="approach-top"]',
    desktop: { fromX: 3, toX: -3, fromY: 14, toY: -12 },
    tablet: { fromX: 2, toX: -2, fromY: 10, toY: -8 },
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

          <div className="order-1 mx-auto grid w-full grid-cols-1 items-center gap-7 md:w-[min(74vw,70rem)] md:grid-cols-[minmax(0,1fr)_13rem] md:gap-8 md:pt-[8.5rem] xl:grid-cols-[minmax(0,1fr)_15rem] xl:pt-[8rem]">
            <figure
              data-about-reveal
              data-about-float="top-right"
              aria-hidden="true"
              className="relative order-1 mx-auto w-[min(55vw,12rem)] justify-self-center overflow-hidden border border-black/10 md:order-2 md:ml-0 md:w-full md:justify-self-end"
            >
              <div data-about-clip className="overflow-hidden">
                <Image
                  src="/adriano-processo.png"
                  alt=""
                  width={1045}
                  height={1506}
                  sizes="(max-width: 349px) 55vw, (max-width: 767px) 12rem, (max-width: 1279px) 13rem, 15rem"
                  className="h-auto w-full object-contain"
                />
              </div>
            </figure>
            <h2
              ref={aboutHeadlineRef}
              data-about-reveal
              className="order-2 w-full max-w-[24ch] text-center text-[clamp(1.5rem,3.4vw,3.25rem)] font-[500] leading-[1.18] tracking-[-0.025em] text-black/18 md:order-1 md:justify-self-start md:text-left"
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

          <div className="order-4 grid grid-cols-2 gap-3 md:contents">
            {aboutGalleryImages.map((image) => (
              <figure
                key={image.position}
                data-about-reveal
                data-about-float={image.position}
                aria-hidden="true"
                className={`relative aspect-[7/5] w-full overflow-hidden rounded-sm border border-black/10 bg-white md:absolute md:z-[1] md:w-40 xl:w-56 ${image.positionClass}`}
              >
                <div data-about-clip className="h-full overflow-hidden">
                  <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 767px) 45vw, (max-width: 1279px) 10rem, 14rem"
                    className="h-full w-full object-cover"
                  />
                </div>
              </figure>
            ))}
          </div>

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

            <div className="mx-auto flex w-full max-w-[42ch] flex-col items-center gap-6 text-center md:gap-8">
              <div className="max-w-[36ch] space-y-3">
                <h3 className="text-[clamp(1.5rem,2.2vw,2rem)] font-[500] leading-[1.08] tracking-[-0.025em] text-black">
                  {about.frameTitle}
                </h3>
                <p className="text-base leading-relaxed text-black/72 md:text-lg">
                  {about.body}
                </p>
              </div>
              <div className="w-full max-w-[44ch] space-y-4 text-left text-sm leading-[1.65] text-black/68 md:text-base">
                {about.secondary.map((paragraph, paragraphIndex) => (
                  <p key={`institutional-paragraph-${paragraphIndex}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <p className="max-w-[36ch] border-t border-black/10 pt-5 text-base font-medium leading-relaxed text-black/82 md:text-lg">
                {about.closingStatement}
              </p>
              <SplitScrambleLink
                href={aboutLink}
                label={about.ctaLabel}
                className="mx-auto"
              />
            </div>
          </div>

        </div>

        <InstagramSection content={messages.home.instagram} />

        <div className="relative mt-18 space-y-14 md:mt-8 md:space-y-18 xl:mt-16 xl:space-y-24">
          <div
            ref={ghostRevealRef}
            className="relative grid items-center gap-8 overflow-hidden border-y border-black/8 py-10 md:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:pr-4 xl:gap-12 xl:py-20 xl:pr-6"
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
              className="pointer-events-none about-ghost-heading relative z-0 max-w-[11ch] text-[rgba(17,17,17,0.1)]"
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
              className="relative z-[1] w-full max-w-[24rem] justify-self-center overflow-hidden lg:w-[24rem] lg:justify-self-end xl:w-[28rem] xl:max-w-[28rem]"
            >
              <div data-about-clip className="overflow-hidden">
                <Image
                  src={aboutEditorialImages.flightDetail.src}
                  alt={messages.home.international.imageAlt}
                  width={aboutEditorialImages.flightDetail.width}
                  height={aboutEditorialImages.flightDetail.height}
                  sizes="(max-width: 415px) calc(100vw - 32px), (max-width: 1279px) 384px, 448px"
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
              className="pointer-events-none absolute right-[6%] top-[8%] hidden overflow-hidden md:block md:w-[8.75rem] lg:max-2xl:right-0 lg:max-xl:w-[7.5rem] xl:right-[8%] xl:w-[10rem] xl:max-2xl:right-0 xl:max-2xl:w-[9rem]"
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
              data-about-float="approach-bottom"
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[7%] right-[5%] hidden overflow-hidden md:block md:w-[7.5rem] lg:max-2xl:right-0 xl:right-[10%] xl:w-[9rem] xl:max-2xl:right-0"
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
                className="mx-auto w-full max-w-[15.5ch] text-center text-[clamp(3.75rem,7vw,8.7rem)] font-[600] leading-[0.95] tracking-[-0.055em] text-black md:max-w-[14.5ch] xl:max-w-[16.4ch]"
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
