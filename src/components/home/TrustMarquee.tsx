import { Container } from "../layout/Container";

interface TrustMarqueeProps {
  items: string[];
}

export function TrustMarquee({ items }: TrustMarqueeProps) {
  const repeatedItems = [...items, ...items];

  return (
    <section className="border-y border-black/10 bg-white py-5">
      <Container className="overflow-hidden">
        <div className="marquee-track">
          {repeatedItems.map((item, index) => (
            <div key={`${item}-${index}`} className="marquee-item">
              <span>{item}</span>
              <span className="text-[var(--color-accent)]">+</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
