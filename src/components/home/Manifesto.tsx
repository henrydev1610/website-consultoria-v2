"use client";

import { useRef } from "react";

import { useReveal } from "@/hooks/useReveal";
import { useScrollTextReveal } from "@/hooks/useScrollTextReveal";

import { Container } from "../layout/Container";
import { Eyebrow } from "../ui/Eyebrow";

interface ManifestoProps {
  eyebrow: string;
  text: string;
}

export function Manifesto({ eyebrow, text }: ManifestoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useReveal(sectionRef, { selector: "[data-reveal]", y: 18, start: "top 86%" });
  useScrollTextReveal(sectionRef);

  return (
    <section ref={sectionRef} className="bg-white py-12 md:py-20">
      <Container>
        <div className="grid-layout items-start gap-y-8">
          <div className="col-span-4 md:col-span-2 xl:col-span-2">
            <Eyebrow data-reveal>{eyebrow}</Eyebrow>
          </div>
          <div className="col-span-4 md:col-span-6 xl:col-span-9">
            <p className="manifesto-text">
              {words.map((word, index) => (
                <span key={`${word}-${index}`} data-word className="manifesto-word">
                  {word}&nbsp;
                </span>
              ))}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
