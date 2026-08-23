"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import { getLocalizedPath } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale, Messages } from "@/types";

import { Button } from "../ui/Button";
import { ScrambleText } from "../ui/ScrambleText";
import { BrandMark } from "./BrandMark";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { Container } from "./Container";
import { useHeaderTheme } from "@/hooks/useHeaderTheme";

interface HeaderProps {
  locale: Locale;
  messages: Messages;
}

export function Header({ locale, messages }: HeaderProps) {
  const pathname = usePathname();
  const panelId = useId();
  const isHomePage = pathname === `/${locale}`;
  const theme = useHeaderTheme(isHomePage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHeroHeader = theme === "light" && !isMenuOpen;

  return (
    <>
      <header
        data-header-root
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          isHeroHeader
            ? "bg-transparent text-white"
            : "border-b border-black/10 bg-white/94 text-black backdrop-blur-md",
        )}
      >
        <Container className="flex items-center gap-6 py-4 md:py-5">
          <div className="flex flex-1 items-center">
            <BrandMark locale={locale} branding="header" />
          </div>

          <nav
            className="hidden items-center gap-8 text-[0.78rem] uppercase tracking-[0.22em] lg:flex"
            aria-label="Primary"
          >
            {navigationItems.map((item) => (
              <Link
                key={`${item.key}-${messages.navigation[item.key]}`}
                href={getLocalizedPath(locale, item.key)}
                className="header-link"
              >
                <ScrambleText text={messages.navigation[item.key]} />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-8 lg:flex">
            <LocaleSwitcher
              locale={locale}
              label={messages.common.languageLabel}
              inverted={isHeroHeader}
            />
            <Button
              href={siteConfig.ctaUrl}
              wrapperClassName="header-cta"
              fillClassName="header-cta-fill"
              scrambleText={messages.common.startProcess}
              className={cn(
                "header-cta-shell",
                isHeroHeader &&
                  "border-white bg-transparent text-white",
              )}
            >
              {messages.common.startProcess}
            </Button>
          </div>

          <button
            type="button"
            className="ml-auto inline-flex items-center gap-3 text-[0.78rem] uppercase tracking-[0.26em] lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-expanded={isMenuOpen}
            aria-controls={panelId}
            aria-label={isMenuOpen ? messages.common.closeMenu : messages.common.openMenu}
          >
            <span>{messages.common.menuLabel}</span>
          </button>
        </Container>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        locale={locale}
        messages={messages}
        onClose={() => setIsMenuOpen(false)}
        panelId={panelId}
      />
    </>
  );
}
