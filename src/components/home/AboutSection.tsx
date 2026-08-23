"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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

interface AboutSectionProps {
  locale: Locale;
  messages: Messages;
}

const cardLayoutClasses = [
  "xl:col-span-7",
  "xl:col-span-5 xl:translate-y-20",
  "xl:col-span-5 xl:-translate-y-10",
  "xl:col-span-7 xl:-translate-y-24",
];

const cardImageById = {
  preparation: aboutEditorialImages.leftFeature,
  review: aboutEditorialImages.topPortrait,
  translation: aboutEditorialImages.flightDetail,
  checklist: aboutEditorialImages.checklistCard,
} as const;

const aboutParallaxItems = [
  {
    selector: '[data-about-float="top"]',
    desktop: { from: 36, to: -34 },
    tablet: { from: 22, to: -20 },
    mobile: { from: 10, to: -12 },
  },
  {
    selector: '[data-about-float="left"]',
    desktop: { from: 26, to: -28 },
    tablet: { from: 16, to: -18 },
    mobile: { from: 8, to: -9 },
  },
  {
    selector: '[data-about-float="detail"]',
    desktop: { from: 18, to: -26 },
    tablet: { from: 12, to: -16 },
    mobile: { from: 6, to: -8 },
  },
  {
    selector: '[data-about-float="flight"]',
    desktop: { from: 34, to: -30 },
    tablet: { from: 20, to: -18 },
    mobile: { from: 9, to: -11 },
  },
  {
    selector: "[data-card-media]",
    desktop: { from: 14, to: -14 },
    tablet: { from: 9, to: -9 },
    mobile: { from: 3, to: -3 },
  },
] as const;

export function AboutSection({ locale, messages }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const about = messages.home.about;
  const manifesto = messages.home.manifesto;
  const services = messages.home.services;
  const introLink = getLocalizedPath(locale, "process");
  const servicesLink = getLocalizedPath(locale, "services");

  useReveal(sectionRef, {
    selector: "[data-about-reveal]",
    y: 22,
    stagger: 0.08,
    start: "top 82%",
  });

  useScrollTextReveal(statementRef);

  const serviceCards = useMemo(
    () =>
      services.items.map((item, index) => ({
        ...item,
        image: cardImageById[item.id as keyof typeof cardImageById] ?? aboutEditorialImages.preparationCard,
        layoutClass: cardLayoutClasses[index] ?? "xl:col-span-6",
      })),
    [services.items],
  );

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const parallaxTargets = aboutParallaxItems.map((item) => ({
      ...item,
      elements: Array.from(element.querySelectorAll<HTMLElement>(item.selector)),
    }));

    if (prefersReducedMotion) {
      parallaxTargets.forEach(({ elements }) => {
        gsap.set(elements, { clearProps: "transform" });
      });
      return;
    }

    let frameId = 0;

    const updateParallax = () => {
      frameId = 0;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(Math.max((viewportHeight - rect.top) / (rect.height + viewportHeight), 0), 1);
      const viewportWidth = window.innerWidth;

      parallaxTargets.forEach(({ desktop, tablet, mobile, elements }) => {
        const range =
          viewportWidth >= 1280
            ? desktop
            : viewportWidth >= 768
              ? tablet
              : mobile;
        const yPercent = gsap.utils.interpolate(range.from, range.to, progress);

        elements.forEach((target) => {
          target.style.transform = `translate3d(0, ${yPercent}%, 0)`;
        });
      });
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateParallax);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
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

    if (prefersReducedMotion) {
      gsap.set(clips, { clearProps: "all", clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0 });
      gsap.set(linesX, { scaleX: 1 });
      gsap.set(linesY, { scaleY: 1 });
      gsap.set("[data-crosshair]", { opacity: 1, rotate: 0 });
      gsap.set(ghost, { clearProps: "transform" });
      return;
    }

    ensureGsapRegistered();

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
    }, element);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f5f4f0] text-black"
    >
      <Container className="relative py-20 md:py-28 xl:py-34">
        <div className="relative grid gap-10 md:min-h-[72rem] md:block xl:min-h-[80rem]">
          <span
            data-about-line-x
            className="pointer-events-none absolute left-[6%] right-[24%] top-[12%] hidden h-px origin-left bg-black/10 md:block"
          />
          <span
            data-about-line-x
            className="pointer-events-none absolute left-[12%] right-[10%] top-[58%] hidden h-px origin-left bg-black/10 md:block"
          />
          <span
            data-about-line-x
            className="pointer-events-none absolute left-[4%] right-[4%] top-[84%] hidden h-px origin-left bg-black/10 xl:block"
          />
          <span
            data-about-line-y
            className="pointer-events-none absolute left-[26%] top-[12%] hidden h-[46%] w-px origin-top bg-black/10 md:block"
          />
          <span
            data-about-line-y
            className="pointer-events-none absolute right-[20%] top-[12%] hidden h-[66%] w-px origin-top bg-black/10 xl:block"
          />

          <Crosshair className="left-[26%] top-[12%] hidden md:block" />
          <Crosshair className="left-[12%] top-[58%] hidden md:block" />
          <Crosshair className="right-[20%] top-[58%] hidden xl:block" />
          <Crosshair className="right-[4%] top-[84%] hidden xl:block" />

          <figure
            data-about-reveal
            data-about-float="left"
            className="relative order-2 overflow-hidden md:absolute md:left-[4%] md:top-[34%] md:w-[18rem] md:z-0 xl:left-[5%] xl:w-[22rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.leftFeature.src}
                alt={messages.home.hero.imageAlt}
                width={aboutEditorialImages.leftFeature.width}
                height={aboutEditorialImages.leftFeature.height}
                sizes="(max-width: 767px) 100vw, (max-width: 1279px) 28vw, 22rem"
                className="aspect-[6/4.5] w-full object-cover"
              />
            </div>
          </figure>

          <figure
            data-about-reveal
            data-about-float="top"
            className="relative order-1 ml-auto w-[44vw] max-w-[12rem] overflow-hidden md:absolute md:right-[8%] md:top-[4%] md:w-[11rem] md:z-0 xl:right-[9%] xl:w-[13rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.topPortrait.src}
                alt={about.primaryImageAlt}
                width={aboutEditorialImages.topPortrait.width}
                height={aboutEditorialImages.topPortrait.height}
                sizes="(max-width: 767px) 44vw, 12rem"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </figure>

          <div className="order-3 space-y-6 md:absolute md:left-[10%] md:right-[8%] md:top-[12%] md:z-[2] xl:right-[6%]">
            <Eyebrow data-about-reveal>{about.eyebrow}</Eyebrow>
            <h2
              data-about-reveal
              className="max-w-[17ch] text-[clamp(3.55rem,6.25vw,7rem)] font-[560] leading-[0.94] tracking-[-0.05em] text-black md:max-w-[15ch] xl:max-w-[17ch]"
              style={{ textWrap: "balance" }}
            >
              {about.headlineLines.join(" ")}
            </h2>
          </div>

          <div
            data-about-reveal
            className="order-5 relative border border-black/10 bg-[#f5f4f0]/92 p-6 md:absolute md:left-[36%] md:right-[10%] md:top-[62%] md:z-[2] md:p-8 xl:left-[44%] xl:right-[12%] xl:top-[61%] xl:p-10"
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
              <p className="max-w-[31ch] text-base leading-relaxed text-black/72 md:text-lg">
                {about.body}
              </p>
              <p className="max-w-[31ch] text-sm leading-relaxed text-black/52 md:text-base">
                {about.secondary}
              </p>
              <Link
                href={introLink}
                className="group inline-flex items-center gap-3 border-b border-black/14 pb-2 text-[0.74rem] uppercase tracking-[0.28em] text-black"
              >
                <span>{messages.navigation.process}</span>
                <span className="translate-x-0 text-[var(--color-accent)] transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          <figure
            data-about-reveal
            data-about-float="detail"
            className="relative order-4 overflow-hidden md:absolute md:left-[11%] md:top-[68%] md:w-[10rem] md:z-0 xl:left-[13%] xl:top-[69%] xl:w-[12rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.documentDetail.src}
                alt={about.tertiaryImageAlt}
                width={aboutEditorialImages.documentDetail.width}
                height={aboutEditorialImages.documentDetail.height}
                sizes="(max-width: 767px) 62vw, 13rem"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </figure>

          <figure
            data-about-reveal
            data-about-float="flight"
            className="relative order-6 ml-auto w-[58vw] max-w-[15rem] overflow-hidden md:absolute md:right-[6%] md:top-[73%] md:w-[13rem] md:z-0 xl:right-[7%] xl:top-[72%] xl:w-[16rem]"
          >
            <div data-about-clip className="overflow-hidden">
              <Image
                src={aboutEditorialImages.flightDetail.src}
                alt={messages.home.international.imageAlt}
                width={aboutEditorialImages.flightDetail.width}
                height={aboutEditorialImages.flightDetail.height}
                sizes="(max-width: 767px) 58vw, 17rem"
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </figure>
        </div>

        <div className="relative mt-18 space-y-14 md:mt-8 md:space-y-18 xl:mt-16 xl:space-y-24">
          <div className="relative overflow-hidden border-y border-black/8 py-10 md:py-16 xl:py-20">
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
                  {line}
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
            className="grid gap-8 border-t border-black/10 pt-8 md:grid-cols-[1.1fr_2.2fr] md:pt-12 xl:gap-12"
          >
            <div className="space-y-4">
              <Eyebrow data-about-reveal>{manifesto.eyebrow}</Eyebrow>
              <p data-about-reveal className="max-w-[24ch] text-sm leading-relaxed text-black/54 md:text-base">
                {about.frameBody}
              </p>
            </div>
            <p className="manifesto-text max-w-[18ch] text-black/18">
              {manifesto.text.split(" ").map((word, index) => (
                <span key={`${word}-${index}`} data-word className="manifesto-word">
                  {word}&nbsp;
                </span>
              ))}
            </p>
          </div>

          <div className="space-y-8 border-t border-black/10 pt-8 md:space-y-12 md:pt-12">
            <div className="grid items-end gap-6 md:grid-cols-[1fr_1.3fr] xl:grid-cols-[1fr_1.5fr]">
              <Eyebrow data-about-reveal>{services.eyebrow}</Eyebrow>
              <h3 data-about-reveal className="display-lg max-w-[12ch] text-black">
                {services.title}
              </h3>
            </div>

            <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
              {serviceCards.map((item) => (
                <article
                  key={item.id}
                  data-about-reveal
                  className={`relative border border-black/10 bg-[#f8f7f2] ${item.layoutClass}`}
                >
                  <Crosshair className="-left-1.5 -top-1.5" />
                  <Crosshair className="-right-1.5 -top-1.5" />
                  <Crosshair className="-bottom-1.5 -right-1.5" />

                  <div className="grid gap-0">
                    <div className="overflow-hidden">
                      <div data-about-clip data-card-media className="overflow-hidden">
                        <Image
                          src={item.image.src}
                          alt={item.title}
                          width={item.image.width}
                          height={item.image.height}
                          sizes="(max-width: 1279px) 100vw, 42vw"
                          className="aspect-[5/3.6] w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 border-t border-black/10 p-5 md:p-6 xl:p-7">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-black/42">
                          {item.number}
                        </span>
                        <span className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-black/42">
                          {messages.navigation.services}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-end">
                        <h4 className="text-[clamp(1.7rem,3.4vw,3.15rem)] uppercase leading-[0.92] tracking-[-0.04em] text-black">
                          {item.title}
                        </h4>
                        <p className="max-w-[30ch] text-sm leading-relaxed text-black/62 md:text-base">
                          {item.description}
                        </p>
                      </div>

                      <Link
                        href={servicesLink}
                        className="group inline-flex items-center gap-3 border-b border-black/12 pb-2 text-[0.72rem] uppercase tracking-[0.28em] text-black"
                      >
                        <span>{messages.navigation.services}</span>
                        <span className="translate-x-0 text-[var(--color-accent)] transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1">
                          &rarr;
                        </span>
                      </Link>
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
