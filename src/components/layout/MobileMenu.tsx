"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

import { navigationItems } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import { getLocalizedPath } from "@/lib/i18n";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { Locale, Messages } from "@/types";

import { Button } from "../ui/Button";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface MobileMenuProps {
  isOpen: boolean;
  locale: Locale;
  messages: Messages;
  onClose: () => void;
  panelId: string;
}

export function MobileMenu({
  isOpen,
  locale,
  messages,
  onClose,
  panelId,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const previousFocusedRef = useRef<HTMLElement | null>(null);
  const focusableSelector = useMemo(
    () => 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    [],
  );

  useEffect(() => {
    const element = panelRef.current;

    if (!element) {
      return;
    }

    ensureGsapRegistered();

    const context = gsap.context(() => {
      gsap.set(element, { opacity: 0, pointerEvents: "none" });

      timelineRef.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.out" },
          onReverseComplete: () => {
            gsap.set(element, { pointerEvents: "none" });
          },
        })
        .to(element, { opacity: 1, duration: 0.38 })
        .fromTo(
          "[data-menu-panel]",
          { yPercent: -6 },
          { yPercent: 0, duration: 0.58 },
          0,
        )
        .fromTo(
          "[data-menu-line]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.45, stagger: 0.05 },
          0.08,
        )
        .fromTo(
          "[data-menu-link]",
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.52, stagger: 0.06 },
          0.16,
        )
        .fromTo(
          "[data-menu-footer]",
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45 },
          0.34,
        );
    }, element);

    return () => {
      timelineRef.current = null;
      context.revert();
    };
  }, []);

  useEffect(() => {
    const element = panelRef.current;
    const timeline = timelineRef.current;

    if (!element || !timeline) {
      return;
    }

    if (isOpen) {
      previousFocusedRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      gsap.set(element, { pointerEvents: "auto" });
      timeline.play();

      const firstFocusable = element.querySelector<HTMLElement>(focusableSelector);
      firstFocusable?.focus();
    } else {
      document.body.style.overflow = "";
      timeline.reverse();
      previousFocusedRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [focusableSelector, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const element = panelRef.current;

    if (!element) {
      return;
    }

    const panel = element;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusableSelector, isOpen, onClose]);

  return (
    <div
      ref={panelRef}
      id={panelId}
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-40 bg-black/96 text-white lg:hidden",
        !isOpen && "pointer-events-none",
      )}
    >
      <div
        data-menu-panel
        className="flex min-h-dvh flex-col justify-between px-5 pb-6 pt-28"
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-5">
          {navigationItems.map((item) => (
            <div key={item.key} className="space-y-5 overflow-hidden">
              <div data-menu-line className="h-px origin-left bg-white/16" />
              <Link
                href={getLocalizedPath(locale, item.key)}
                data-menu-link
                className="flex items-end justify-between gap-4 uppercase tracking-[-0.05em]"
                onClick={onClose}
              >
                <span className="font-mono text-[0.72rem] tracking-[0.34em] text-white/48">
                  {String(navigationItems.indexOf(item) + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[clamp(2.1rem,12vw,4.7rem)] leading-[0.88]">
                    {messages.navigation[item.key]}
                  </span>
                  <span className="text-lg text-[var(--color-accent)]">-&gt;</span>
                </Link>
              </div>
          ))}
        </div>

        <div data-menu-footer className="space-y-8 border-t border-white/12 pt-6">
          <LocaleSwitcher
            locale={locale}
            label={messages.common.languageLabel}
            inverted
          />
          <Button
            href={siteConfig.ctaUrl}
            variant="light"
            className="w-full justify-between"
          >
            {messages.common.startProcess}
          </Button>
        </div>
      </div>
    </div>
  );
}
