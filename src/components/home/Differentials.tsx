import { Container } from "../layout/Container";
import { Eyebrow } from "../ui/Eyebrow";

interface DifferentialsProps {
  eyebrow: string;
  title: string[];
  points: string[];
}

export function Differentials({
  eyebrow,
  title,
  points,
}: DifferentialsProps) {
  return (
    <section className="bg-black py-22 text-white md:py-30">
      <Container>
        <div className="grid-layout gap-y-10">
          <div className="col-span-4 space-y-6 md:col-span-7 xl:col-span-7">
            <Eyebrow className="text-white/44">{eyebrow}</Eyebrow>
            <h2 className="display-lg max-w-[11ch] text-white">
              {title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <div className="col-span-4 md:col-span-3 md:col-start-6 xl:col-span-3 xl:col-start-10">
            <ul className="space-y-4 border-t border-white/12 pt-5">
              {points.map((point) => (
                <li
                  key={point}
                  className="border-b border-white/12 pb-4 font-mono text-[0.78rem] uppercase tracking-[0.28em] text-white/72"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
