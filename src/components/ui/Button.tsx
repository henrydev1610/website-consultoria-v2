"use client";

import { useRef } from "react";
import type { MouseEventHandler, ReactNode, RefObject } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { ScrambleText } from "./ScrambleText";
import type { ScrambleTextHandle } from "./ScrambleText";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  wrapperClassName?: string;
  variant?: "dark" | "light" | "accent";
  fillClassName?: string;
  scrambleText?: string;
}

const variantClasses = {
  dark: "border-black bg-transparent text-black hover:bg-black hover:text-white",
  light: "border-white/32 bg-transparent text-white hover:border-white hover:bg-white hover:text-black",
  accent:
    "border-[var(--color-accent)] bg-[var(--color-accent)] text-black hover:bg-transparent hover:text-[var(--color-accent)]",
};

interface ButtonInnerProps extends ButtonProps {
  scrambleRef: RefObject<ScrambleTextHandle | null>;
}

function ButtonInner({
  children,
  className,
  variant = "dark",
  fillClassName,
  scrambleText,
  scrambleRef,
}: ButtonInnerProps) {
  return (
    <span
      className={cn(
        "group/button relative isolate inline-flex border px-5 py-3 text-[0.76rem] font-medium uppercase tracking-[0.24em] transition-[background-color,border-color,color] duration-300",
        fillClassName && "overflow-hidden",
        variantClasses[variant],
        className,
      )}
    >
      {fillClassName ? (
        <span
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0", fillClassName)}
        />
      ) : null}
      <span className="relative z-[1] inline-flex items-center gap-5">
        <span>
          {scrambleText ? (
            <ScrambleText ref={scrambleRef} text={scrambleText} triggerMode="external" />
          ) : (
            children
          )}
        </span>
        <span
          aria-hidden="true"
          className="translate-x-0 text-base transition-transform duration-300 group-hover/button:translate-x-1.5"
        >
          &rarr;
        </span>
      </span>
    </span>
  );
}

export function Button({
  href,
  onClick,
  wrapperClassName,
  scrambleText,
  ...props
}: ButtonProps) {
  const scrambleRef = useRef<ScrambleTextHandle | null>(null);
  const shouldTrackInteraction = Boolean(scrambleText);

  function handleInteractionStart() {
    if (!shouldTrackInteraction) {
      return;
    }

    scrambleRef.current?.start();
  }

  function handleInteractionEnd() {
    if (!shouldTrackInteraction) {
      return;
    }

    scrambleRef.current?.stop();
  }

  if (href) {
    return (
      <Link
        href={href}
        className={cn("inline-flex", wrapperClassName)}
        onClick={onClick}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleInteractionEnd}
        onFocus={handleInteractionStart}
        onBlur={handleInteractionEnd}
      >
        <ButtonInner
          {...props}
          scrambleText={scrambleText}
          scrambleRef={scrambleRef}
        />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex", wrapperClassName)}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onFocus={handleInteractionStart}
      onBlur={handleInteractionEnd}
    >
      <ButtonInner
        {...props}
        scrambleText={scrambleText}
        scrambleRef={scrambleRef}
      />
    </button>
  );
}
