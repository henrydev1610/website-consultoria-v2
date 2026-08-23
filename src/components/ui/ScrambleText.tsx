"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const LETTER_POOL = Array.from("ABCDEFGHJKLNOPRSTUVXYZ23456789");
const ACCENTED_LETTER_POOL = Array.from(
  "ABCDEFGHJKLNOPRSTUVXYZ\u00C1\u00C0\u00C3\u00C2\u00C4\u00C9\u00C8\u00CA\u00CB\u00D3\u00D2\u00D5\u00D4\u00D6\u00DA\u00D9\u00DB\u00DC\u00C7\u00D123456789",
);
const DIGIT_POOL = Array.from("23456789");
const FRAME_STEP_MS = 42;
const DURATION_MS = 390;

interface ScrambleTextProps {
  text: string;
  className?: string;
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

function getScrambledValue(chars: string[], elapsed: number) {
  const scramblableIndexes = chars.reduce<number[]>((indexes, char, index) => {
    if (isScramblableCharacter(char)) {
      indexes.push(index);
    }

    return indexes;
  }, []);

  const progress = Math.min(elapsed / DURATION_MS, 1);
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  const resolvedCount = Math.floor(easedProgress * scramblableIndexes.length);
  const frameBucket = Math.floor(elapsed / FRAME_STEP_MS);

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

export function ScrambleText({ text, className }: ScrambleTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const measureContainerRef = useRef<HTMLSpanElement>(null);
  const measureCharacterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const animatedCharacterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const originalChars = Array.from(text);
  const displayChars = Array.from(displayText);

  useLayoutEffect(() => {
    const measureContainer = measureContainerRef.current;

    if (!measureContainer) {
      return;
    }

    const syncMetrics = () => {
      measureCharacterRefs.current.forEach((measureCharacter, index) => {
        const animatedCharacter = animatedCharacterRefs.current[index];

        if (!measureCharacter || !animatedCharacter) {
          return;
        }

        animatedCharacter.style.left = `${measureCharacter.offsetLeft}px`;
        animatedCharacter.style.width = `${measureCharacter.offsetWidth}px`;
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
  }, [text]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  function stopAnimation() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    startTimeRef.current = null;
    setDisplayText(text);
    setIsAnimating(false);
  }

  function handleMouseEnter() {
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

    stopAnimation();
    setIsAnimating(true);

    const chars = Array.from(text);

    const tick = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (elapsed >= DURATION_MS) {
        stopAnimation();
        return;
      }

      setDisplayText(getScrambledValue(chars, elapsed));
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }

  function handleMouseLeave() {
    stopAnimation();
  }

  return (
    <span
      className={cn("relative inline-block whitespace-pre", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="sr-only">{text}</span>

      <span
        ref={measureContainerRef}
        aria-hidden="true"
        className="invisible whitespace-pre"
      >
        {originalChars.map((char, index) => (
          <span
            key={`measure-${index}-${char}`}
            ref={(element) => {
              measureCharacterRefs.current[index] = element;
            }}
          >
            {char}
          </span>
        ))}
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 whitespace-pre",
          isAnimating && "opacity-0",
        )}
      >
        {text}
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 whitespace-pre",
          !isAnimating && "opacity-0",
        )}
      >
        {displayChars.map((char, index) => (
          <span
            key={`animated-${index}-${originalChars[index] ?? ""}`}
            ref={(element) => {
              animatedCharacterRefs.current[index] = element;
            }}
            className="absolute top-0 text-left"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </span>
  );
}
