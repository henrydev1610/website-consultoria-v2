import { notFound } from "next/navigation";

import { AboutSection } from "@/components/home/AboutSection";
import { Differentials } from "@/components/home/Differentials";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { International } from "@/components/home/International";
import { Process } from "@/components/home/Process";
import { Services } from "@/components/home/Services";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { getMessages, isLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata(props: PageProps<"/[locale]">) {
  const localeParam = (await props.params).locale;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const messages = getMessages(locale);

  return createPageMetadata(locale, messages, "home");
}

export default async function HomePage(props: PageProps<"/[locale]">) {
  const localeParam = (await props.params).locale;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const messages = getMessages(locale);

  return (
    <>
      <Hero {...messages.home.hero} />
      <AboutSection locale={locale} messages={messages} />
      <TrustMarquee items={messages.home.trustMarquee.items} />
      <Services
        eyebrow={messages.home.services.eyebrow}
        title={messages.home.services.title}
        items={messages.home.services.items}
      />
      <Process
        eyebrow={messages.home.process.eyebrow}
        title={messages.home.process.title}
        items={messages.home.process.items}
      />
      <Differentials {...messages.home.differentials} />
      <International {...messages.home.international} />
      <FinalCTA {...messages.home.finalCta} />
    </>
  );
}
