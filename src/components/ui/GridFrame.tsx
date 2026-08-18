import { Crosshair } from "./Crosshair";
import { Eyebrow } from "./Eyebrow";

interface GridFrameProps {
  title: string;
  body: string;
}

export function GridFrame({ title, body }: GridFrameProps) {
  return (
    <div className="relative border border-[var(--color-border-light)] p-8 md:p-10">
      <Crosshair className="-left-1.5 -top-1.5" />
      <Crosshair className="-right-1.5 -top-1.5" />
      <Crosshair className="-bottom-1.5 -left-1.5" />
      <Crosshair className="-bottom-1.5 -right-1.5" />

      <span
        data-frame-line
        className="absolute left-0 top-0 h-px w-full origin-left bg-[var(--color-border-light)]"
      />
      <span
        data-frame-line
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-[var(--color-border-light)]"
      />

      <div className="space-y-6">
        <Eyebrow className="text-[var(--color-text-primary)]/55">{title}</Eyebrow>
        <p className="max-w-[31ch] text-lg leading-relaxed text-[var(--color-text-primary)]">
          {body}
        </p>
      </div>
    </div>
  );
}
