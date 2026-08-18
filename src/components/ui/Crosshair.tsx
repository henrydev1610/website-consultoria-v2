import { cn } from "@/lib/utils";

interface CrosshairProps {
  className?: string;
}

export function Crosshair({ className }: CrosshairProps) {
  return (
    <span
      data-crosshair
      className={cn(
        "absolute h-3 w-3 text-[var(--color-accent)] opacity-0",
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
    </span>
  );
}
