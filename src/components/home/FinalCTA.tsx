import { siteConfig } from "@/data/site";

import { Container } from "../layout/Container";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";

interface FinalCTAProps {
  eyebrow: string;
  title: string[];
  body: string;
  cta: string;
}

export function FinalCTA({ eyebrow, title, body, cta }: FinalCTAProps) {
  return (
    <section className="bg-[var(--color-accent)] py-18 text-black md:py-24">
      <Container>
        <div className="grid-layout gap-y-8">
          <div className="col-span-4 space-y-6 md:col-span-7 xl:col-span-7">
            <Eyebrow className="text-black/58">{eyebrow}</Eyebrow>
            <h2 className="display-lg max-w-[9ch] text-black">
              {title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <div className="col-span-4 flex flex-col gap-6 md:col-span-3 md:col-start-6 xl:col-span-3 xl:col-start-10">
            <p className="max-w-[27ch] text-lg leading-relaxed text-black/74">{body}</p>
            <Button href={siteConfig.ctaUrl}>{cta}</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
