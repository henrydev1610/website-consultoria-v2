"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  variant?: "dark" | "light" | "accent";
}

const variantClasses = {
  dark: "border-black bg-transparent text-black hover:bg-black hover:text-white",
  light: "border-white/32 bg-transparent text-white hover:border-white hover:bg-white hover:text-black",
  accent:
    "border-[var(--color-accent)] bg-[var(--color-accent)] text-black hover:bg-transparent hover:text-[var(--color-accent)]",
};

function ButtonInner({ children, className, variant = "dark" }: ButtonProps) {
  return (
    <span
      className={cn(
        "group/button inline-flex items-center gap-5 border px-5 py-3 text-[0.76rem] font-medium uppercase tracking-[0.24em] transition-all duration-300",
        variantClasses[variant],
        className,
      )}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="translate-x-0 text-base transition-transform duration-300 group-hover/button:translate-x-1.5"
      >
        →
      </span>
    </span>
  );
}

export function Button({ href, onClick, ...props }: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className="inline-flex" onClick={onClick}>
        <ButtonInner {...props} />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-flex">
      <ButtonInner {...props} />
    </button>
  );
}
