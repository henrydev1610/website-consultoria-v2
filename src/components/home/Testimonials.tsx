"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReveal } from "@/hooks/useReveal";
import { useScrollTextReveal } from "@/hooks/useScrollTextReveal";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

import { Container } from "../layout/Container";
import { Eyebrow } from "../ui/Eyebrow";

interface TestimonialsProps {
  eyebrow: string;
  title: string[];
  previousLabel: string;
  nextLabel: string;
  carouselLabel: string;
  items: Testimonial[];
}

interface RepeatedTestimonial extends Testimonial {
  copyIndex: number;
  originalIndex: number;
  key: string;
}

interface CarouselMetrics {
  firstStart: number;
  secondStart: number;
  thirdStart: number;
  sequenceWidth: number;
}

const AUTO_SCROLL_PX_PER_SECOND = 32;
const FOCUS_RESUME_DELAY_MS = 700;
const INTERACTION_RESUME_DELAY_MS = 1000;
const HOVER_PAUSE_DURATION_S = 0.35;
const HOVER_RESUME_DURATION_S = 0.45;

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function Testimonials({
  eyebrow,
  title,
  previousLabel,
  nextLabel,
  carouselLabel,
  items,
}: TestimonialsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRevealRef = useRef<HTMLHeadingElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLLIElement | null>>([]);
  const dragStateRef = useRef(false);
  const autoScrollTweenRef = useRef<gsap.core.Tween | null>(null);
  const timeScaleTweenRef = useRef<gsap.core.Tween | null>(null);
  const metricsRef = useRef<CarouselMetrics>({
    firstStart: 0,
    secondStart: 0,
    thirdStart: 0,
    sequenceWidth: 0,
  });
  const activeIndexRef = useRef(0);
  const activeRepeatedIndexRef = useRef(items.length);
  const resumeTimeoutRef = useRef<number | null>(null);
  const shouldAutoScrollRef = useRef(false);
  const headingId = useId();
  const carouselId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isResumeBlocked, setIsResumeBlocked] = useState(false);

  const repeatedItems = useMemo<RepeatedTestimonial[]>(
    () =>
      Array.from({ length: 3 }, (_, copyIndex) =>
        items.map((item, originalIndex) => ({
          ...item,
          copyIndex,
          originalIndex,
          key: `${copyIndex}-${item.id}`,
        })),
      ).flat(),
    [items],
  );

  useReveal(sectionRef, {
    selector: "[data-testimonials-reveal]",
    y: 24,
    stagger: 0.08,
    start: "top 82%",
  });
  useScrollTextReveal(titleRevealRef);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const killAutoScrollTween = useCallback(() => {
    timeScaleTweenRef.current?.kill();
    timeScaleTweenRef.current = null;
    autoScrollTweenRef.current?.kill();
    autoScrollTweenRef.current = null;
  }, []);

  const tweenAutoScrollTimeScale = useCallback(
    (timeScale: number, duration: number) => {
      const autoScrollTween = autoScrollTweenRef.current;

      if (!autoScrollTween) {
        return;
      }

      timeScaleTweenRef.current?.kill();
      timeScaleTweenRef.current = gsap.to(autoScrollTween, {
        timeScale,
        duration,
        ease: "power2.out",
        overwrite: true,
      });
    },
    [],
  );

  const scheduleAutoPlayResume = useCallback(
    (delay = FOCUS_RESUME_DELAY_MS) => {
      clearResumeTimeout();
      setIsResumeBlocked(true);
      resumeTimeoutRef.current = window.setTimeout(() => {
        setIsResumeBlocked(false);
        resumeTimeoutRef.current = null;
      }, delay);
    },
    [clearResumeTimeout],
  );

  const holdAutoPlay = useCallback(() => {
    clearResumeTimeout();
    setIsResumeBlocked(true);
    killAutoScrollTween();
  }, [clearResumeTimeout, killAutoScrollTween]);

  const normalizeScrollPosition = useCallback(() => {
    const scroller = scrollerRef.current;
    const { secondStart, thirdStart, sequenceWidth } = metricsRef.current;

    if (!scroller || sequenceWidth <= 0) {
      return;
    }

    if (scroller.scrollLeft < secondStart) {
      scroller.scrollLeft += sequenceWidth;
    } else if (scroller.scrollLeft >= thirdStart) {
      scroller.scrollLeft -= sequenceWidth;
    }
  }, []);

  const updateActiveSlide = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const viewportCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearestRepeatedIndex = activeRepeatedIndexRef.current;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) {
        return;
      }

      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(slideCenter - viewportCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestRepeatedIndex = index;
      }
    });

    const nextActiveIndex = nearestRepeatedIndex % items.length;

    activeRepeatedIndexRef.current = nearestRepeatedIndex;
    activeIndexRef.current = nextActiveIndex;

    setActiveIndex((current) =>
      current === nextActiveIndex ? current : nextActiveIndex,
    );
  }, [items.length]);

  const getNormalizedLoopOffset = useCallback((scrollLeft?: number) => {
    const { secondStart, sequenceWidth } = metricsRef.current;

    if (sequenceWidth <= 0) {
      return 0;
    }

    const currentScrollLeft =
      scrollLeft ?? scrollerRef.current?.scrollLeft ?? secondStart;

    return gsap.utils.wrap(0, sequenceWidth, currentScrollLeft - secondStart);
  }, []);

  const buildAutoScrollTween = useCallback(() => {
    const scroller = scrollerRef.current;
    const { sequenceWidth } = metricsRef.current;

    if (!scroller || sequenceWidth <= 0 || prefersReducedMotion) {
      return;
    }

    killAutoScrollTween();

    const wrapOffset = gsap.utils.wrap(0, sequenceWidth);
    const startOffset = getNormalizedLoopOffset(scroller.scrollLeft);
    const state = { offset: startOffset };

    autoScrollTweenRef.current = gsap.to(state, {
      offset: startOffset + sequenceWidth,
      duration: sequenceWidth / AUTO_SCROLL_PX_PER_SECOND,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        const element = scrollerRef.current;

        if (!element) {
          return;
        }

        element.scrollLeft = metricsRef.current.secondStart + wrapOffset(state.offset);
        updateActiveSlide();
      },
    });
  }, [getNormalizedLoopOffset, killAutoScrollTween, prefersReducedMotion, updateActiveSlide]);

  const measureAndCenter = useCallback(() => {
    const scroller = scrollerRef.current;
    const first = slideRefs.current[0];
    const second = slideRefs.current[items.length];
    const third = slideRefs.current[items.length * 2];
    const target = slideRefs.current[items.length + activeIndexRef.current];
    const previousSequenceWidth = metricsRef.current.sequenceWidth;
    const previousOffsetRatio =
      scroller && previousSequenceWidth > 0
        ? getNormalizedLoopOffset(scroller.scrollLeft) / previousSequenceWidth
        : null;

    if (!scroller || !first || !second || !third || !target) {
      return;
    }

    metricsRef.current = {
      firstStart: first.offsetLeft,
      secondStart: second.offsetLeft,
      thirdStart: third.offsetLeft,
      sequenceWidth: second.offsetLeft - first.offsetLeft,
    };

    scroller.scrollLeft =
      previousOffsetRatio === null
        ? target.offsetLeft
        : metricsRef.current.secondStart +
          previousOffsetRatio * metricsRef.current.sequenceWidth;

    updateActiveSlide();

    killAutoScrollTween();

    if (shouldAutoScrollRef.current) {
      buildAutoScrollTween();
    }
  }, [buildAutoScrollTween, getNormalizedLoopOffset, items.length, killAutoScrollTween, updateActiveSlide]);

  const scrollToRepeatedIndex = (requestedIndex: number) => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const minIndex = items.length;
    const maxIndex = items.length * 2 - 1;
    let targetIndex = requestedIndex;

    if (targetIndex < minIndex) {
      targetIndex += items.length;
    }

    if (targetIndex > maxIndex) {
      targetIndex -= items.length;
    }

    const slide = slideRefs.current[targetIndex];

    if (!slide) {
      return;
    }

    holdAutoPlay();
    scroller.scrollTo({
      left: slide.offsetLeft,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    scheduleAutoPlayResume(INTERACTION_RESUME_DELAY_MS);
  };

  useEffect(() => {
    measureAndCenter();

    const handleResize = () => {
      measureAndCenter();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [items.length, measureAndCenter]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragStateRef.current || !scrollerRef.current) {
        return;
      }

      scrollerRef.current.scrollLeft -= event.movementX;
      normalizeScrollPosition();
      updateActiveSlide();
    };

    const handleMouseUp = () => {
      if (!dragStateRef.current) {
        return;
      }

      dragStateRef.current = false;
      setIsDragging(false);
      scheduleAutoPlayResume(INTERACTION_RESUME_DELAY_MS);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
    };
  }, [normalizeScrollPosition, scheduleAutoPlayResume, updateActiveSlide]);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    let frame = 0;

    const handleScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        normalizeScrollPosition();
        updateActiveSlide();
      });
    };

    handleScroll();
    scroller.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", handleScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [items.length, normalizeScrollPosition, updateActiveSlide]);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio > 0.14);
      },
      {
        threshold: [0, 0.14, 0.35],
        rootMargin: "0px 0px -12% 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearResumeTimeout();
      killAutoScrollTween();
    };
  }, [clearResumeTimeout, killAutoScrollTween]);

  const canAutoScroll =
    isInView &&
    isDocumentVisible &&
    !prefersReducedMotion &&
    !isDragging &&
    !hasFocusWithin &&
    !isResumeBlocked;
  const isAutoScrollActive = canAutoScroll && !isHovered;

  useEffect(() => {
    shouldAutoScrollRef.current = canAutoScroll && !isHovered;

    if (!canAutoScroll) {
      killAutoScrollTween();
      return;
    }

    if (isHovered) {
      tweenAutoScrollTimeScale(0, HOVER_PAUSE_DURATION_S);
      return;
    }

    if (!autoScrollTweenRef.current) {
      buildAutoScrollTween();
    }

    tweenAutoScrollTimeScale(1, HOVER_RESUME_DURATION_S);
  }, [
    buildAutoScrollTween,
    canAutoScroll,
    isHovered,
    killAutoScrollTween,
    tweenAutoScrollTimeScale,
  ]);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden border-y border-black/10 bg-[#f7f3ec] py-[clamp(5.5rem,9vw,11rem)] text-black"
    >
      <Container className="space-y-10 md:space-y-12">
        <div className="grid-layout items-end gap-y-8">
          <div className="col-span-4 space-y-5 md:col-span-6 xl:col-span-8">
            <Eyebrow data-testimonials-reveal>{eyebrow}</Eyebrow>
            <h2
              ref={titleRevealRef}
              id={headingId}
              data-testimonials-reveal
              className="w-full max-w-[12ch] text-[clamp(4.4rem,8.3vw,10.2rem)] font-[600] leading-[0.88] tracking-[-0.055em] text-black/18 md:max-w-[18ch] xl:max-w-[20ch]"
              style={{ textWrap: "balance" }}
            >
              {title.map((line) => (
                <span key={line} className="block">
                  {line.split(/\s+/).map((word, index, words) => (
                    <span key={`${line}-${word}-${index}`}>
                      <span data-word className="manifesto-word">
                        {word}
                      </span>
                      {index < words.length - 1 ? " " : ""}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
          </div>

          <div
            data-testimonials-reveal
            className="col-span-4 flex items-center justify-between gap-5 md:col-span-2 md:col-start-7 md:justify-end xl:col-span-3 xl:col-start-10"
          >
            <p className="font-mono text-[0.74rem] uppercase tracking-[0.28em] text-black/48">
              {formatIndex(activeIndex)} / {String(items.length).padStart(2, "0")}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={previousLabel}
                aria-controls={carouselId}
                onClick={() =>
                  scrollToRepeatedIndex(activeRepeatedIndexRef.current - 1)
                }
                onFocus={() => {
                  clearResumeTimeout();
                  setHasFocusWithin(true);
                }}
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget;

                  if (
                    nextTarget instanceof Node &&
                    event.currentTarget.parentElement?.contains(nextTarget)
                  ) {
                    return;
                  }

                  setHasFocusWithin(false);
                  scheduleAutoPlayResume(FOCUS_RESUME_DELAY_MS);
                }}
                className="inline-flex h-12 w-12 items-center justify-center border border-black/12 text-lg text-black transition-colors duration-300 ease-out hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-accent)]"
              >
                <span aria-hidden="true">&larr;</span>
              </button>

              <button
                type="button"
                aria-label={nextLabel}
                aria-controls={carouselId}
                onClick={() =>
                  scrollToRepeatedIndex(activeRepeatedIndexRef.current + 1)
                }
                onFocus={() => {
                  clearResumeTimeout();
                  setHasFocusWithin(true);
                }}
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget;

                  if (
                    nextTarget instanceof Node &&
                    event.currentTarget.parentElement?.contains(nextTarget)
                  ) {
                    return;
                  }

                  setHasFocusWithin(false);
                  scheduleAutoPlayResume(FOCUS_RESUME_DELAY_MS);
                }}
                className="inline-flex h-12 w-12 items-center justify-center border border-black/12 text-lg text-black transition-colors duration-300 ease-out hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-accent)]"
              >
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </Container>

      <div data-testimonials-reveal className="pt-3 md:pt-5">
        <div
          id={carouselId}
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={carouselLabel}
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse") {
              return;
            }

            clearResumeTimeout();
            setIsHovered((current) => (current ? current : true));
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== "mouse") {
              return;
            }

            setIsHovered(false);
          }}
          onFocusCapture={() => {
            clearResumeTimeout();
            setHasFocusWithin(true);
          }}
          onBlurCapture={(event) => {
            const nextTarget = event.relatedTarget;

            if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
              return;
            }

            setHasFocusWithin(false);
            scheduleAutoPlayResume(FOCUS_RESUME_DELAY_MS);
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            clearResumeTimeout();
            dragStateRef.current = true;
            killAutoScrollTween();
            setIsDragging(true);
            setIsResumeBlocked(true);
          }}
          onTouchStart={() => {
            holdAutoPlay();
          }}
          onTouchEnd={() => {
            scheduleAutoPlayResume(INTERACTION_RESUME_DELAY_MS);
          }}
          onTouchCancel={() => {
            scheduleAutoPlayResume(INTERACTION_RESUME_DELAY_MS);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              scrollToRepeatedIndex(activeRepeatedIndexRef.current - 1);
            }

            if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollToRepeatedIndex(activeRepeatedIndexRef.current + 1);
            }
          }}
          onDragStart={(event) => event.preventDefault()}
          className={cn(
            "testimonials-scroller overflow-x-auto overflow-y-hidden px-[clamp(1.25rem,4vw,3.5rem)] outline-none overscroll-x-contain scroll-px-[clamp(1.25rem,4vw,3.5rem)] touch-pan-y",
            isAutoScrollActive || isHovered ? "snap-none" : "snap-x snap-proximity",
            isDragging ? "cursor-grabbing select-none" : "cursor-grab",
          )}
        >
          <ul className="flex items-stretch gap-[clamp(1rem,2vw,1.8rem)] pb-1">
            {repeatedItems.map((item, index) => (
              <li
                key={item.key}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                aria-hidden={item.copyIndex !== 1}
                aria-roledescription={item.copyIndex === 1 ? "slide" : undefined}
                role={item.copyIndex === 1 ? "group" : undefined}
                aria-label={
                  item.copyIndex === 1
                    ? `${formatIndex(item.originalIndex)} of ${String(items.length).padStart(2, "0")}`
                    : undefined
                }
                className="min-h-[34rem] shrink-0 snap-start basis-[92%] md:min-h-[28rem] md:basis-[88%] lg:basis-[78%] xl:min-h-[31rem] xl:basis-[72%] 2xl:basis-[66%]"
              >
                <article className="grid h-full gap-6 border border-black/10 bg-[#fbf8f2] px-6 py-6 transition-[border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-black/16 hover:bg-[#fcf9f4] md:grid-cols-[minmax(0,1fr)_clamp(220px,28vw,320px)] md:gap-8 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1fr)_clamp(240px,26vw,330px)] xl:gap-10 xl:px-12 xl:py-12">
                  <div className="order-2 flex h-full flex-col justify-between md:order-1">
                    <div className="space-y-8 md:space-y-10">
                      <blockquote className="max-w-[18ch] text-[clamp(1.9rem,3vw,3.7rem)] leading-[0.96] tracking-[-0.05em] text-black">
                        “{item.quote}”
                      </blockquote>
                    </div>

                    <footer className="space-y-2 border-t border-black/10 pt-6 md:pt-8">
                      <p className="text-[0.95rem] font-medium uppercase tracking-[0.22em] text-black">
                        {item.name}
                      </p>
                      <p className="text-sm uppercase tracking-[0.22em] text-black/48">
                        {item.context}
                      </p>
                    </footer>
                  </div>

                  <div className="order-1 md:order-2">
                    <div className="relative aspect-[16/10] overflow-hidden border border-black/10 bg-[#efe9df] md:aspect-[4/5]">
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        fill
                        sizes="(max-width: 767px) 88vw, (max-width: 1023px) 28vw, 320px"
                        className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        draggable={false}
                      />
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
