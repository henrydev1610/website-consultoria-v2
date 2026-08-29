"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

import { ScrambleText } from "./ScrambleText";
import type { ScrambleTextHandle } from "./ScrambleText";

interface SplitScrambleLinkProps {
  href: string;
  label: string;
  className?: string;
  labelClassName?: string;
  arrowClassName?: string;
}

export function SplitScrambleLink({
  href,
  label,
  className,
  labelClassName,
  arrowClassName,
}: SplitScrambleLinkProps) {
  const scrambleRef = useRef<ScrambleTextHandle | null>(null);
  const rootRef = useRef<HTMLAnchorElement | null>(null);
  const textCellRef = useRef<HTMLSpanElement | null>(null);
  const leftArrowTileRef = useRef<HTMLSpanElement | null>(null);
  const rightArrowSlotRef = useRef<HTMLSpanElement | null>(null);
  const rightArrowTileRef = useRef<HTMLSpanElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isActiveRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const textCell = textCellRef.current;
    const leftArrowTile = leftArrowTileRef.current;
    const rightArrowSlot = rightArrowSlotRef.current;
    const rightArrowTile = rightArrowTileRef.current;

    if (
      !root ||
      !textCell ||
      !leftArrowTile ||
      !rightArrowSlot ||
      !rightArrowTile ||
      typeof window === "undefined"
    ) {
      return;
    }

    const hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const resetToInitialState = () => {
      gsap.set(textCell, { x: 0 });
      gsap.set(leftArrowTile, { yPercent: 12, autoAlpha: 0 });
      gsap.set(rightArrowTile, { yPercent: 0, autoAlpha: 1 });
    };

    const buildTimeline = () => {
      timelineRef.current?.kill();
      timelineRef.current = null;

      gsap.killTweensOf([textCell, leftArrowTile, rightArrowTile]);
      gsap.set([textCell, leftArrowTile, rightArrowTile], { clearProps: "willChange" });

      if (prefersReducedMotion || !hoverMediaQuery.matches) {
        resetToInitialState();
        return;
      }

      const gap = getGapValue(root);
      const textShift = rightArrowSlot.offsetWidth + gap;

      const timeline = gsap.timeline({
        paused: true,
        defaults: { overwrite: "auto" },
      });

      timeline
        .set([textCell, leftArrowTile, rightArrowTile], { willChange: "transform,opacity" })
        .to(
          rightArrowTile,
          {
            yPercent: -14,
            autoAlpha: 0,
            duration: 0.16,
            ease: "power2.out",
          },
          0,
        )
        .to(
          textCell,
          {
            x: textShift,
            duration: 0.32,
            ease: "power3.inOut",
          },
          0.06,
        )
        .to(
          leftArrowTile,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.16,
            ease: "power2.out",
          },
          0.17,
        );

      const clearWillChange = () => {
        gsap.set([textCell, leftArrowTile, rightArrowTile], { clearProps: "willChange" });
      };

      timeline.eventCallback("onComplete", clearWillChange);
      timeline.eventCallback("onReverseComplete", clearWillChange);

      timelineRef.current = timeline;
      timeline.progress(isActiveRef.current ? 1 : 0).pause();
    };

    buildTimeline();

    const resizeObserver = new ResizeObserver(() => {
      buildTimeline();
    });

    resizeObserver.observe(root);
    resizeObserver.observe(textCell);
    resizeObserver.observe(rightArrowSlot);
    hoverMediaQuery.addEventListener("change", buildTimeline);

    return () => {
      hoverMediaQuery.removeEventListener("change", buildTimeline);
      resizeObserver.disconnect();
      timelineRef.current?.kill();
      timelineRef.current = null;
      gsap.killTweensOf([textCell, leftArrowTile, rightArrowTile]);
      gsap.set([textCell, leftArrowTile, rightArrowTile], {
        clearProps: "transform,opacity,visibility,willChange",
      });
    };
  }, [prefersReducedMotion]);

  function syncInteractionState() {
    const nextActive = isHoveredRef.current || isFocusedRef.current;

    if (nextActive === isActiveRef.current) {
      return;
    }

    isActiveRef.current = nextActive;

    if (nextActive) {
      scrambleRef.current?.start();
      timelineRef.current?.play();
      return;
    }

    scrambleRef.current?.stop();
    timelineRef.current?.reverse();
  }

  function handlePointerEnter() {
    isHoveredRef.current = true;
    syncInteractionState();
  }

  function handlePointerLeave() {
    isHoveredRef.current = false;
    syncInteractionState();
  }

  function handleFocus() {
    isFocusedRef.current = true;
    syncInteractionState();
  }

  function handleBlur() {
    isFocusedRef.current = false;
    syncInteractionState();
  }

  return (
    <Link
      href={href}
      ref={rootRef}
      className={cn(
        "group/split relative inline-flex h-[var(--split-size)] max-w-full items-stretch gap-[var(--split-gap)] self-start [--split-gap:0.24rem] [--split-size:clamp(4.1rem,5vw,4.75rem)] [--split-text-width:clamp(13rem,15vw,15.25rem)] text-white motion-reduce:transition-none",
        className,
      )}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[var(--split-size)] overflow-hidden"
      >
        <span
          ref={leftArrowTileRef}
          className={cn(
            "grid h-full w-full place-items-center border border-white/24 bg-[var(--color-accent)] text-[1.12rem] text-white",
            arrowClassName,
          )}
        >
          &rarr;
        </span>
      </span>

      <span
        ref={textCellRef}
        className={cn(
          "relative z-[1] inline-flex w-[var(--split-text-width)] min-w-0 items-center justify-center overflow-hidden whitespace-nowrap border border-white/24 bg-[var(--color-accent)] px-6 text-[clamp(0.98rem,1.08vw,1.08rem)] font-[560] uppercase tracking-[0.01em] text-white md:px-7",
          labelClassName,
        )}
      >
        <ScrambleText
          ref={scrambleRef}
          text={label}
          className="max-w-full"
          triggerMode="external"
        />
      </span>

      <span
        ref={rightArrowSlotRef}
        aria-hidden="true"
        className="relative z-[2] inline-flex w-[var(--split-size)] shrink-0 overflow-hidden"
      >
        <span
          ref={rightArrowTileRef}
          className={cn(
            "grid h-full w-full place-items-center border border-white/24 bg-[var(--color-accent)] text-[1.12rem] text-white",
            arrowClassName,
          )}
        >
          &rarr;
        </span>
      </span>
    </Link>
  );
}

function getGapValue(element: HTMLElement) {
  const styles = window.getComputedStyle(element);
  return Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
}
