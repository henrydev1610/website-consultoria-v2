"use client";

import { useEffect, useRef, useState } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    let isCancelled = false;

    const markReady = () => {
      if (isCancelled) {
        return;
      }

      setIsVideoReady(true);
    };

    const markNotReady = () => {
      if (isCancelled) {
        return;
      }

      setIsVideoReady(false);
    };

    const attemptPlayback = async () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;

      try {
        const playPromise = video.play();

        if (playPromise) {
          await playPromise;
        }
      } catch (error) {
        markNotReady();
        console.error("Hero video autoplay failed", error);
      }
    };

    const handleCanPlay = () => {
      void attemptPlayback();
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      void attemptPlayback();
    }

    video.addEventListener("loadeddata", handleCanPlay);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", markReady);
    video.addEventListener("error", markNotReady);

    return () => {
      isCancelled = true;
      video.removeEventListener("loadeddata", handleCanPlay);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", markReady);
      video.removeEventListener("error", markNotReady);
    };
  }, [prefersReducedMotion]);

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
      id="hero"
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-black text-white"
    >
      <div id="hero-sentinel" className="absolute inset-x-0 top-0 h-24" />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        data-hero-image
      >
        <Image
          src={homeImages.hero.src}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={homeImages.hero.src}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-[62%_center] transition-opacity duration-700 ease-out md:object-center",
            isVideoReady && !prefersReducedMotion ? "opacity-100" : "opacity-0",
          )}
        >
          <source src="/video/video1.mp4" type="video/mp4" />
        </video>
      </div>
      <div
        data-hero-overlay
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.23)_24%,rgba(0,0,0,0.34)_58%,rgba(0,0,0,0.74)_100%),linear-gradient(90deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.16)_55%,rgba(0,0,0,0.24)_100%)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_62%,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.22)_24%,rgba(0,0,0,0.1)_42%,rgba(0,0,0,0)_64%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_54%,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.08)_18%,rgba(0,0,0,0)_34%)]" />
      </div>

      <Container className="hero-shell relative z-[2] mb-[100px] w-full pb-11 pt-34 md:pb-14 xl:pb-18 xl:pt-35">
        <div className="hero-content-grid grid-layout items-end justify-items-center gap-y-10 md:justify-items-stretch">
          <div className="hero-heading-group col-span-4 grid justify-items-center gap-4 text-center md:col-span-6 md:justify-items-start md:gap-10 md:text-left xl:col-span-7">
            <Eyebrow
              className="text-center text-white/62 md:text-left"
              data-hero-eyebrow
            >
              {eyebrow}
            </Eyebrow>
            <h1
              data-hero-title
              className={cn("display-xl hero-title justify-self-start text-left text-white")}
            >
              <RevealText lines={title} />
            </h1>
          </div>

          <div className="hero-detail-group col-span-4 grid w-full justify-self-start justify-items-start gap-6 text-left md:col-span-7 md:col-start-2 md:justify-items-start md:text-left xl:col-span-3 xl:col-start-10">
            <p
              data-hero-copy
              className="hero-description justify-self-start max-w-[29ch] text-[1rem] leading-relaxed text-white/78 md:text-[1.05rem]"
            >
              {description}
            </p>
            <div data-hero-cta className="flex justify-center md:block">
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
