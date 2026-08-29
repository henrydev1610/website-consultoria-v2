"use client";

import { useEffect, useId, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";
import type { Service } from "@/types";

import { Container } from "../layout/Container";
import { Eyebrow } from "../ui/Eyebrow";

interface ServicesProps {
  eyebrow: string;
  title: string;
  imageAlt: string;
  items: Service[];
}

export function Services({ eyebrow, title, items }: ServicesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const accordionId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useReveal(sectionRef, { selector: "[data-reveal]", start: "top 82%" });

  useEffect(() => {
    const video = videoRef.current;

    if (prefersReducedMotion) {
      video?.pause();
      return;
    }

    const playPromise = video?.play();
    playPromise?.catch(() => {});
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[80vh] overflow-hidden bg-black py-22 text-white md:py-30"
    >
      {!prefersReducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadStart={() => setIsVideoReady(false)}
            onCanPlay={() => setIsVideoReady(true)}
            onLoadedData={() => setIsVideoReady(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out",
              isVideoReady ? "opacity-100" : "opacity-0",
            )}
            style={{ filter: "saturate(0.78) contrast(0.93)", objectPosition: "center center" }}
          >
            <source src="/video/passaport1.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.76)_42%,rgba(0,0,0,0.78)_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.74)_44%,rgba(0,0,0,0.7)_100%)]"
      />

      <Container className="relative z-[2]">
        <div className="grid-layout items-center gap-y-10">
          <div className="col-span-4 space-y-6 md:col-span-4 xl:col-span-4">
            <Eyebrow data-reveal className="text-white/44">
              {eyebrow}
            </Eyebrow>
            <h2 data-reveal className="display-lg max-w-[11ch] text-white">
              {title}
            </h2>
          </div>

          <div className="col-span-4 md:col-span-8 xl:col-span-8">
            <div data-reveal className="border-t border-white/14">
              {items.map((item) => {
                const isOpen = openId === item.id;
                const buttonId = `${accordionId}-${item.id}-button`;
                const panelId = `${accordionId}-${item.id}-panel`;

                return (
                  <article key={item.id} className="border-b border-white/14">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => {
                        setOpenId((current) => (current === item.id ? null : item.id));
                      }}
                      className="service-row group w-full cursor-pointer py-6 text-left md:grid md:grid-cols-[84px_minmax(0,1fr)_auto] md:items-start md:gap-6"
                    >
                      <span className="mb-4 block font-mono text-[0.72rem] uppercase tracking-[0.32em] text-white/42 md:mb-0">
                        {item.number}
                      </span>

                      <span className="block pr-4">
                        <span className="block text-[clamp(1.5rem,3vw,2.85rem)] leading-[0.94] tracking-[-0.04em] text-white transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-white/72 group-focus-visible:text-white/72 motion-reduce:transition-none">
                          {item.title}
                        </span>
                      </span>

                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-4 inline-flex text-[1.15rem] text-white/72 transition-transform duration-300 md:mt-1 md:justify-self-end motion-reduce:transition-none",
                          isOpen && "rotate-90 text-white",
                        )}
                      >
                        &rarr;
                      </span>
                    </button>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={cn(
                        "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div
                          className={cn(
                            "pb-6 transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none motion-reduce:transition-none md:grid md:grid-cols-[84px_minmax(0,1fr)_auto] md:gap-6",
                            isOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
                          )}
                        >
                          <span aria-hidden="true" className="hidden md:block" />
                          <p className="max-w-[42ch] text-sm leading-relaxed text-white/62 md:text-base">
                            {item.description}
                          </p>
                          <span aria-hidden="true" className="hidden md:block" />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
