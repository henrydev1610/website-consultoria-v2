"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const LETTER_POOL = Array.from("ABCDEFGHJKLNOPRSTUVXYZ23456789");
const ACCENTED_LETTER_POOL = Array.from(
  "ABCDEFGHJKLNOPRSTUVXYZ\u00C1\u00C0\u00C3\u00C2\u00C4\u00C9\u00C8\u00CA\u00CB\u00D3\u00D2\u00D5\u00D4\u00D6\u00DA\u00D9\u00DB\u00DC\u00C7\u00D123456789",
);
const DIGIT_POOL = Array.from("23456789");
const DEFAULT_FRAME_STEP_MS = 42;
const DEFAULT_DURATION_MS = 390;

interface ScrambleTextProps {
  text: string;
  className?: string;
  triggerMode?: "self" | "external";
  allowWrap?: boolean;
  durationMs?: number;
  frameStepMs?: number;
  staggerMs?: number;
  completeOnLeave?: boolean;
  progressEase?: "out" | "inOut";
  animationMode?: "scramble" | "verticalChars";
}

export interface ScrambleTextHandle {
  start: () => void;
  stop: () => void;
}

function isScramblableCharacter(char: string) {
  return /[\p{L}\p{N}]/u.test(char);
}

function getCharacterPool(char: string) {
  if (/\p{N}/u.test(char)) {
    return DIGIT_POOL;
  }

  if (/[\u00C0-\u024F]/u.test(char)) {
    return ACCENTED_LETTER_POOL;
  }

  return LETTER_POOL;
}

function getEasedProgress(progress: number, progressEase: "out" | "inOut") {
  if (progressEase === "inOut") {
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }

  return 1 - Math.pow(1 - progress, 3);
}

function getScrambledValue(
  chars: string[],
  elapsed: number,
  durationMs: number,
  frameStepMs: number,
  progressEase: "out" | "inOut",
) {
  const scramblableIndexes = chars.reduce<number[]>((indexes, char, index) => {
    if (isScramblableCharacter(char)) {
      indexes.push(index);
    }

    return indexes;
  }, []);

  const progress = Math.min(elapsed / durationMs, 1);
  const easedProgress = getEasedProgress(progress, progressEase);
  const resolvedCount = Math.floor(easedProgress * scramblableIndexes.length);
  const frameBucket = Math.floor(elapsed / frameStepMs);

  return chars
    .map((char, index) => {
      if (!isScramblableCharacter(char)) {
        return char;
      }

      const revealOrder = scramblableIndexes.indexOf(index);

      if (revealOrder < resolvedCount) {
        return char;
      }

      const pool = getCharacterPool(char);
      const poolIndex = (frameBucket + revealOrder * 2) % pool.length;

      return pool[poolIndex];
    })
    .join("");
}

function getDistributedDelay(index: number, staggerMs: number) {
  // Stable distributed order avoids an obvious left-to-right sweep.
  return ((index * 7) % 11) * staggerMs;
}

export const ScrambleText = forwardRef<ScrambleTextHandle, ScrambleTextProps>(
  function ScrambleText(
    {
      text,
      className,
      triggerMode = "self",
      allowWrap = false,
      durationMs = DEFAULT_DURATION_MS,
      frameStepMs = DEFAULT_FRAME_STEP_MS,
      staggerMs = 12,
      completeOnLeave = false,
      progressEase = "out",
      animationMode = "scramble",
    },
    ref,
  ) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [displayText, setDisplayText] = useState(text);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVerticalActive, setIsVerticalActive] = useState(false);
    const frameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const measureContainerRef = useRef<HTMLSpanElement>(null);
    const measureCharacterRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const animatedCharacterRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const originalChars = Array.from(text);
    const displayChars = Array.from(displayText);

    useLayoutEffect(() => {
      const measureContainer = measureContainerRef.current;

      if (!measureContainer || animationMode !== "scramble") {
        return;
      }

      const syncMetrics = () => {
        measureCharacterRefs.current.forEach((measureCharacter, index) => {
          const animatedCharacter = animatedCharacterRefs.current[index];

          if (!measureCharacter || !animatedCharacter) {
            return;
          }

          animatedCharacter.style.left = `${measureCharacter.offsetLeft}px`;
          animatedCharacter.style.top = `${measureCharacter.offsetTop}px`;
          animatedCharacter.style.width = `${measureCharacter.offsetWidth}px`;
          animatedCharacter.style.height = `${measureCharacter.offsetHeight}px`;
        });
      };

      syncMetrics();

      const resizeObserver = new ResizeObserver(() => {
        syncMetrics();
      });

      resizeObserver.observe(measureContainer);

      return () => {
        resizeObserver.disconnect();
      };
    }, [allowWrap, animationMode, text]);

    useEffect(() => {
      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }, []);

    useEffect(() => {
      setDisplayText(text);
      setIsVerticalActive(false);
    }, [text]);

    function stopAnimation() {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      startTimeRef.current = null;
      setDisplayText(text);
      setIsAnimating(false);
    }

    function stopVerticalChars() {
      setIsVerticalActive(false);
    }

    function startVerticalChars() {
      if (prefersReducedMotion || typeof window === "undefined") {
        stopVerticalChars();
        return;
      }

      if (
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        stopVerticalChars();
        return;
      }

      setIsVerticalActive(true);
    }

    function startAnimation() {
      if (animationMode === "verticalChars") {
        startVerticalChars();
        return;
      }

      if (prefersReducedMotion || typeof window === "undefined") {
        stopAnimation();
        return;
      }

      if (
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        stopAnimation();
        return;
      }

      if (frameRef.current !== null) {
        return;
      }

      stopAnimation();
      setIsAnimating(true);

      const chars = Array.from(text);

      const tick = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;

        if (elapsed >= durationMs) {
          stopAnimation();
          return;
        }

        setDisplayText(getScrambledValue(chars, elapsed, durationMs, frameStepMs, progressEase));
        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    }

    useImperativeHandle(
      ref,
      () => ({
        start: startAnimation,
        stop: () => {
          if (animationMode === "verticalChars") {
            stopVerticalChars();
            return;
          }

          if (completeOnLeave && frameRef.current !== null) {
            return;
          }

          stopAnimation();
        },
      }),
    );

    function handleMouseEnter() {
      startAnimation();
    }

    function handleMouseLeave() {
      if (animationMode === "verticalChars") {
        stopVerticalChars();
        return;
      }

      if (completeOnLeave && frameRef.current !== null) {
        return;
      }

      stopAnimation();
    }

    if (animationMode === "verticalChars") {
      const containerClass = allowWrap
        ? "relative block max-w-full whitespace-pre-wrap"
        : "relative inline-block whitespace-pre";
      const sharedTransitionStyle = prefersReducedMotion
        ? undefined
        : {
            transitionDuration: `${durationMs}ms`,
            transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
          };

      return (
        <span
          className={cn(containerClass, className)}
          onMouseEnter={triggerMode === "self" ? handleMouseEnter : undefined}
          onMouseLeave={triggerMode === "self" ? handleMouseLeave : undefined}
        >
          <span className="sr-only">{text}</span>
          <span aria-hidden="true" className={cn("block", allowWrap ? "whitespace-pre-wrap" : "whitespace-pre")}>
            {originalChars.map((char, index) => {
              if (char === " ") {
                return <span key={`space-${index}`}> </span>;
              }

              if (char === "\n") {
                return <span key={`newline-${index}`}>{"\n"}</span>;
              }

              const delay = getDistributedDelay(index, staggerMs);

              return (
                <span
                  key={`slot-${index}-${char}`}
                  className="relative inline-grid overflow-hidden align-top"
                  style={{ blockSize: "1lh", gridTemplateAreas: '"stack"' }}
                >
                  <span
                    className="inline-block [grid-area:stack]"
                    style={
                      prefersReducedMotion
                        ? undefined
                        : {
                            ...sharedTransitionStyle,
                            transitionDelay: `${delay}ms`,
                            transform: isVerticalActive ? "translate3d(0, 100%, 0)" : "translate3d(0, 0, 0)",
                          }
                    }
                  >
                    {char}
                  </span>
                  <span
                    className="inline-block [grid-area:stack]"
                    style={
                      prefersReducedMotion
                        ? { transform: "translate3d(0, -100%, 0)" }
                        : {
                            ...sharedTransitionStyle,
                            transitionDelay: `${delay}ms`,
                            transform: isVerticalActive ? "translate3d(0, 0, 0)" : "translate3d(0, -100%, 0)",
                          }
                    }
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </span>
        </span>
      );
    }

    return (
      <span
        className={cn(
          allowWrap ? "relative block max-w-full whitespace-pre-wrap" : "relative inline-block whitespace-pre",
          className,
        )}
        onMouseEnter={triggerMode === "self" ? handleMouseEnter : undefined}
        onMouseLeave={triggerMode === "self" ? handleMouseLeave : undefined}
      >
        <span className="sr-only">{text}</span>

        <span
          ref={measureContainerRef}
          aria-hidden="true"
          className={allowWrap ? "invisible whitespace-pre-wrap" : "invisible whitespace-pre"}
        >
          {originalChars.map((char, index) => (
            <span
              key={`measure-${index}-${char}`}
              ref={(element) => {
                measureCharacterRefs.current[index] = element;
              }}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            allowWrap
              ? "pointer-events-none absolute inset-0 whitespace-pre-wrap"
              : "pointer-events-none absolute inset-0 whitespace-pre",
            isAnimating && "opacity-0",
          )}
        >
          {text}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            allowWrap
              ? "pointer-events-none absolute inset-0 whitespace-pre-wrap"
              : "pointer-events-none absolute inset-0 whitespace-pre",
            !isAnimating && "opacity-0",
          )}
        >
          {displayChars.map((char, index) => (
            <span
              key={`animated-${index}-${originalChars[index] ?? ""}`}
              ref={(element) => {
                animatedCharacterRefs.current[index] = element;
              }}
              className="absolute text-left"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>
    );
  },
);

ScrambleText.displayName = "ScrambleText";
