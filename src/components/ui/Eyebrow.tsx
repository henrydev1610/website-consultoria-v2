import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EyebrowProps extends ComponentPropsWithoutRef<"p"> {
  children: ReactNode;
}

export function Eyebrow({ children, className, ...props }: EyebrowProps) {
  return (
    <p
      {...props}
      className={cn(
        "font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[var(--color-text-muted)]",
        className,
      )}
    >
      {children}
    </p>
  );
}
