import Link from "next/link";

import { navigationItems } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import { getLocalizedPath } from "@/lib/i18n";
import type { Locale, Messages } from "@/types";

import { Button } from "../ui/Button";
import { BrandMark } from "./BrandMark";
import { Container } from "./Container";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface FooterProps {
  locale: Locale;
  messages: Messages;
}

export function Footer({ locale, messages }: FooterProps) {
  return (
    <footer className="overflow-hidden bg-black py-16 text-white md:py-24">
      <Container className="space-y-16">
        <div className="grid gap-12 border-t border-white/10 pt-10 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr]">
          <div className="space-y-5">
            <BrandMark locale={locale} />
            <p className="max-w-[32ch] text-base leading-relaxed text-white/70">
              {messages.footer.tagline}
            </p>
            <Button href={siteConfig.ctaUrl} variant="light">
              {messages.common.startProcess}
            </Button>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-white/42">
              {messages.footer.navigation}
            </p>
            <ul className="space-y-3 text-sm uppercase tracking-[0.18em] text-white/82">
              {navigationItems.map((item) => (
                <li key={item.key}>
                  <Link href={getLocalizedPath(locale, item.key)} className="footer-link">
                    {messages.navigation[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-white/42">
              {messages.footer.languages}
            </p>
            <LocaleSwitcher
              locale={locale}
              label={messages.common.languageLabel}
              inverted
              className="justify-start"
            />
          </div>

          <div className="space-y-4">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-white/42">
              {messages.footer.contact}
            </p>
            <div className="space-y-3 text-sm text-white/82">
              <Link href={`mailto:${siteConfig.email}`} className="footer-link block">
                {siteConfig.email}
              </Link>
              <Link href={`tel:${siteConfig.phone}`} className="footer-link block">
                {siteConfig.phone}
              </Link>
            </div>
            <div className="space-y-2 pt-4">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-white/42">
                {messages.footer.legal}
              </p>
              <div className="space-y-2 text-sm uppercase tracking-[0.18em] text-white/82">
                <span className="footer-link block">{messages.footer.privacy}</span>
                <span className="footer-link block">{messages.footer.terms}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none overflow-hidden border-t border-white/10 pt-6">
          <p className="footer-brand text-white/10">{siteConfig.name}</p>
        </div>
      </Container>
    </footer>
  );
}
