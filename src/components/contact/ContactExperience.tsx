"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { useReveal } from "@/hooks/useReveal";
import { useScrollTextReveal } from "@/hooks/useScrollTextReveal";
import { siteConfig } from "@/data/site";
import type { Messages } from "@/types";

import { Container } from "../layout/Container";
import { Eyebrow } from "../ui/Eyebrow";

interface ContactExperienceProps {
  messages: Messages;
}

const MAP_QUERY = "500 Brickell Avenue, Suite 1200, Miami, FL 33131";
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2.4" />
      <line x1="7.6" y1="10.2" x2="7.6" y2="16.5" />
      <circle cx="7.6" cy="7.2" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.4 16.5v-3.8c0-1.4 0.9-2.4 2.2-2.4s2 0.9 2 2.4v3.8" />
      <line x1="11.4" y1="10.2" x2="11.4" y2="16.5" />
    </svg>
  );
}

function RevealWords({ text }: { text: string }) {
  const words = text.split(/\s+/);

  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} data-word className="manifesto-word">
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function ContactExperience({ messages }: ContactExperienceProps) {
  const content = messages.pages.contact;
  const heroRef = useRef<HTMLElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const formTitleRef = useRef<HTMLHeadingElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const formTitleWords = content.form.title.split(/\s+/);

  useReveal(heroRef);
  useReveal(formSectionRef, { selector: "[data-contact-reveal]" });
  useScrollTextReveal(formTitleRef);
  useScrollTextReveal(infoCardRef, { start: "top 95%", end: "top 55%" });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("success");
    event.currentTarget.reset();
  }

  return (
    <>
      <section ref={heroRef} className="bg-black pt-40 text-white">
        <Container className="pb-20 md:pb-28">
          <div className="grid-layout">
            <div className="col-span-4 space-y-8 md:col-span-8 xl:col-span-7">
              <Eyebrow data-reveal>{content.eyebrow}</Eyebrow>
              <h1 data-reveal className="display-lg max-w-[10ch]">
                {content.title}
              </h1>
              <p data-reveal className="max-w-[34ch] text-lg leading-relaxed text-white/68">
                {content.body}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section ref={formSectionRef} className="bg-white py-22 text-black md:py-30">
        <Container className="space-y-14">
          <div className="grid-layout gap-y-6">
            <div className="col-span-4 space-y-5 md:col-span-8 xl:col-span-9">
              <Eyebrow data-contact-reveal>{content.form.eyebrow}</Eyebrow>
              <h2
                ref={formTitleRef}
                className="w-full max-w-[14ch] text-[clamp(2.6rem,5.4vw,5.2rem)] font-[600] leading-[0.95] tracking-[-0.045em] text-black/18 md:max-w-[22ch]"
                style={{ textWrap: "balance" }}
              >
                {formTitleWords.map((word, index) => (
                  <span key={`${word}-${index}`} data-word className="manifesto-word">
                    {word}
                    {index < formTitleWords.length - 1 ? " " : ""}
                  </span>
                ))}
              </h2>
            </div>
          </div>

          <div className="grid-layout gap-y-14">
            <div data-contact-reveal className="col-span-4 md:col-span-8 xl:col-span-12">
              {status === "success" ? (
                <div className="border border-black/10 px-6 py-10 md:px-10 md:py-14">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[var(--color-accent)]">
                    {content.form.successTitle}
                  </p>
                  <p className="mt-4 max-w-[40ch] text-lg leading-relaxed text-black/68">
                    {content.form.successBody}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid gap-x-8 gap-y-9 md:grid-cols-2">
                    <label className="block space-y-3">
                      <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/85">
                        {content.form.nameLabel}
                      </span>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder={content.form.namePlaceholder}
                        className="w-full border-b border-black/15 bg-transparent py-3 text-lg text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                    </label>
                    <label className="block space-y-3">
                      <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/85">
                        {content.form.emailLabel}
                      </span>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder={content.form.emailPlaceholder}
                        className="w-full border-b border-black/15 bg-transparent py-3 text-lg text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                    </label>
                    <label className="block space-y-3 md:col-span-2">
                      <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/85">
                        {content.form.phoneLabel}
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder={content.form.phonePlaceholder}
                        className="w-full border-b border-black/15 bg-transparent py-3 text-lg text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                    </label>
                    <label className="block space-y-3 md:col-span-2">
                      <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/85">
                        {content.form.messageLabel}
                      </span>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder={content.form.messagePlaceholder}
                        className="w-full resize-none border-b border-black/15 bg-transparent py-3 text-lg text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="group/button relative isolate inline-flex border border-black bg-transparent px-5 py-3 text-[0.76rem] font-medium uppercase tracking-[0.24em] text-black transition-[background-color,border-color,color] duration-300 hover:bg-black hover:text-white"
                  >
                    <span className="relative z-[1] inline-flex items-center gap-5">
                      <span>{content.form.submitLabel}</span>
                      <span
                        aria-hidden="true"
                        className="translate-x-0 text-base transition-transform duration-300 group-hover/button:translate-x-1.5"
                      >
                        &rarr;
                      </span>
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="grid-layout gap-y-10">
            <div
              ref={infoCardRef}
              data-contact-reveal
              className="col-span-4 space-y-6 md:col-span-4 xl:col-span-5"
            >
              <Eyebrow>{content.info.eyebrow}</Eyebrow>

              <div className="border border-black/10">
                <div className="border-b border-black/10 px-6 py-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/48">
                    {content.info.addressLabel}
                  </p>
                  <p className="mt-2 text-lg leading-relaxed">
                    <RevealWords text={content.info.address} />
                  </p>
                </div>

                <div className="border-b border-black/10 px-6 py-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/48">
                    {content.info.emailLabel}
                  </p>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="footer-link mt-2 block w-fit text-lg"
                  >
                    <RevealWords text={siteConfig.email} />
                  </a>
                </div>

                <div className="grid grid-cols-2 divide-x divide-black/10 border-b border-black/10">
                  <div className="px-6 py-5">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/48">
                      {content.info.phoneLabel}
                    </p>
                    <a
                      href={`tel:${siteConfig.phone}`}
                      className="footer-link mt-2 block w-fit text-base"
                    >
                      <RevealWords text={siteConfig.phone} />
                    </a>
                  </div>
                  <div className="px-6 py-5">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/48">
                      {content.info.whatsappLabel}
                    </p>
                    <a
                      href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="footer-link mt-2 block w-fit text-base"
                    >
                      <RevealWords text={siteConfig.whatsapp} />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-black/10 border-b border-black/10">
                  <div className="px-6 py-5">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/48">
                      {content.info.languagesLabel}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">
                      <RevealWords text={content.info.languages} />
                    </p>
                  </div>
                  <div className="px-6 py-5">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/48">
                      {content.info.hoursLabel}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">
                      <RevealWords text={content.info.hours} />
                    </p>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-black/48">
                    {content.info.socialLabel}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                    <a
                      href={siteConfig.socials.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="footer-link inline-flex w-fit items-center gap-2 text-sm uppercase tracking-[0.1em] text-black/78"
                    >
                      <InstagramIcon />
                      Instagram
                    </a>
                    <a
                      href={siteConfig.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="footer-link inline-flex w-fit items-center gap-2 text-sm uppercase tracking-[0.1em] text-black/78"
                    >
                      <LinkedInIcon />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-contact-reveal
              className="col-span-4 md:col-span-4 xl:col-span-7"
            >
              <div className="h-full min-h-[22rem] overflow-hidden border border-black/10">
                <iframe
                  src={MAP_SRC}
                  title={content.info.mapAlt}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[22rem] w-full grayscale transition-[filter] duration-500 hover:grayscale-0"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
