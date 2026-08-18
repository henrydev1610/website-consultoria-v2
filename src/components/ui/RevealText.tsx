interface RevealTextProps {
  lines: string[];
  className?: string;
}

export function RevealText({ lines, className }: RevealTextProps) {
  return (
    <span className={className}>
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden">
          <span data-hero-line className="block will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
