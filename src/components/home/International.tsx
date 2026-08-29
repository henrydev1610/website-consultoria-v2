"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { homeImages } from "@/data/images";
import { useParallax } from "@/hooks/useParallax";
import { useReveal } from "@/hooks/useReveal";
import { useScrollTextReveal } from "@/hooks/useScrollTextReveal";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

import { Container } from "../layout/Container";
import { Eyebrow } from "../ui/Eyebrow";

interface InternationalProps {
  eyebrow: string;
  title: string;
  body: string;
  imageAlt: string;
}

export function International({
  eyebrow,
  title,
  body,
  imageAlt,
}: InternationalProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRevealRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const titleWords = title.split(/\s+/);

  useReveal(sectionRef);
  useScrollTextReveal(titleRevealRef);
  useParallax(sectionRef, [{ selector: "[data-international-image]", yPercent: 9 }]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || prefersReducedMotion) {
      return;
    }

    ensureGsapRegistered();

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-international-mask]",
        { clipPath: "inset(18% 0% 18% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 72%",
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="bg-white py-22 md:py-30">
      <Container className="space-y-10">
        <div className="grid-layout gap-y-8">
          <div className="col-span-4 space-y-6 md:col-span-8 xl:col-span-9">
            <Eyebrow data-reveal>{eyebrow}</Eyebrow>
            <h2
              ref={titleRevealRef}
              data-reveal
              className="w-full max-w-[11ch] text-[clamp(4.4rem,8.3vw,10.2rem)] font-[600] leading-[0.88] tracking-[-0.055em] text-black/18 md:max-w-[16ch] xl:max-w-[19ch]"
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
          <div className="col-span-4 md:col-span-3 md:col-start-6 xl:col-span-3 xl:col-start-10">
            <p data-reveal className="max-w-[28ch] text-lg leading-relaxed text-black/62">
              {body}
            </p>
          </div>
        </div>

        <div data-international-mask className="overflow-hidden">
          <Image
            src={homeImages.international.src}
            alt={imageAlt}
            width={homeImages.international.width}
            height={homeImages.international.height}
            sizes="100vw"
            className="aspect-[16/9] w-full object-cover"
            data-international-image
          />
        </div>
      </Container>
    </section>
  );
}
