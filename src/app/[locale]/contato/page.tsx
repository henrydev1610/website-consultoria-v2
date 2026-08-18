import { notFound } from "next/navigation";

import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { createPageMetadata } from "@/lib/metadata";
import { getMessages, isLocale } from "@/lib/i18n";

export async function generateMetadata(props: PageProps<"/[locale]/contato">) {
  const localeParam = (await props.params).locale;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const messages = getMessages(locale);

  return createPageMetadata(locale, messages, "contact");
}

export default async function ContactPage(props: PageProps<"/[locale]/contato">) {
  const localeParam = (await props.params).locale;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const messages = getMessages(locale);

  return <PlaceholderPage locale={locale} messages={messages} routeKey="contact" />;
}
