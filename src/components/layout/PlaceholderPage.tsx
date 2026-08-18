import type { Locale, Messages, RouteKey } from "@/types";

import { Container } from "./Container";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";

interface PlaceholderPageProps {
  locale: Locale;
  messages: Messages;
  routeKey: Exclude<RouteKey, "home">;
}

export function PlaceholderPage({
  locale,
  messages,
  routeKey,
}: PlaceholderPageProps) {
  const content = messages.pages[routeKey];

  return (
    <section className="bg-black pt-40 text-white">
      <Container className="pb-20 md:pb-28">
        <div className="grid-layout">
          <div className="col-span-4 space-y-8 md:col-span-8 xl:col-span-7">
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h1 className="display-lg max-w-[10ch]">{content.title}</h1>
            <p className="max-w-[34ch] text-lg leading-relaxed text-white/68">
              {content.body}
            </p>
            <Button href={`/${locale}`}>{messages.common.startProcess}</Button>
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10 bg-white px-0 py-10 text-black">
        <Container>
          <p className="font-mono text-[0.74rem] uppercase tracking-[0.32em] text-black/48">
            {messages.common.notAvailableYet}
          </p>
        </Container>
      </div>
    </section>
  );
}
