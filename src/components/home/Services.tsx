"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

import { homeImages } from "@/data/images";
import { useReveal } from "@/hooks/useReveal";
import type { Service } from "@/types";

import { Container } from "../layout/Container";
import { Eyebrow } from "../ui/Eyebrow";

interface ServicesProps {
  eyebrow: string;
  title: string;
  items: Service[];
}

const serviceImages = {
  preparation: homeImages.servicesPrimary,
  review: homeImages.servicesReview,
  translation: homeImages.servicesTranslation,
  checklist: homeImages.servicesChecklist,
};

export function Services({ eyebrow, title, items }: ServicesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "preparation");
  const activeImage = useMemo(
    () => serviceImages[activeId as keyof typeof serviceImages] ?? homeImages.servicesPrimary,
    [activeId],
  );

  useReveal(sectionRef, { selector: "[data-reveal]", start: "top 82%" });

  return (
    <section ref={sectionRef} className="bg-black py-22 text-white md:py-30">
      <Container>
        <div className="grid-layout gap-y-10">
          <div className="col-span-4 space-y-6 md:col-span-4 xl:col-span-4">
            <Eyebrow data-reveal className="text-white/44">
              {eyebrow}
            </Eyebrow>
            <h2 data-reveal className="display-lg max-w-[10ch] text-white">
              {title}
            </h2>
          </div>

          <div className="col-span-4 flex items-start justify-end md:col-span-3 md:col-start-6 xl:col-span-3 xl:col-start-10">
            <div
              data-reveal
              className="relative hidden aspect-[4/5] w-full max-w-[20rem] overflow-hidden border border-white/10 md:block"
            >
              {items.map((item) => {
                const image = serviceImages[item.id as keyof typeof serviceImages] ?? activeImage;
                return (
                  <Image
                    key={item.id}
                    src={image.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1280px) 28vw, 18vw"
                    className={`absolute inset-0 object-cover transition-all duration-500 ${
                      item.id === activeId ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
                    }`}
                  />
                );
              })}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.54)_100%)]" />
            </div>
          </div>

          <div className="col-span-4 md:col-span-8 xl:col-span-8">
            <div className="border-t border-white/14">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveId(item.id)}
                  onFocus={() => setActiveId(item.id)}
                  className="service-row group flex w-full flex-col gap-4 border-b border-white/14 py-6 text-left md:grid md:grid-cols-[84px_1fr_auto]"
                >
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-white/42">
                    {item.number}
                  </span>
                  <span className="text-[clamp(1.6rem,4vw,3.15rem)] uppercase leading-[0.92] tracking-[-0.04em] transition-transform duration-300 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5">
                    {item.title}
                  </span>
                  <span className="flex items-start gap-6 md:justify-end">
                    <span className="max-w-[28ch] text-sm leading-relaxed text-white/56 md:text-base">
                      {item.description}
                    </span>
                    <span className="translate-x-0 text-[var(--color-accent)] transition-transform duration-300 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5">
                      →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
