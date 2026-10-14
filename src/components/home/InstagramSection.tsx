"use client";

import { useEffect } from "react";
import Script from "next/script";

import { instagramPostPermalinks, instagramProfileUrl } from "@/data/instagram";
import type { Messages } from "@/types";

import { Container } from "../layout/Container";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";

interface InstagramSectionProps {
  content: Messages["home"]["instagram"];
}

const postSlotCount = 4;

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

function normalizePostPermalink(value: string) {
  try {
    const url = new URL(value);
    const isInstagramHost = ["instagram.com", "www.instagram.com"].includes(url.hostname);
    const isPublicPostPath = /^\/(?:p|reel)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);

    if (url.protocol !== "https:" || !isInstagramHost || !isPublicPostPath) {
      return null;
    }

    const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    return `https://www.instagram.com${path}`;
  } catch {
    return null;
  }
}

const postPermalinks = instagramPostPermalinks
  .map(normalizePostPermalink)
  .filter((permalink): permalink is string => permalink !== null)
  .slice(0, postSlotCount);
const postSlots = Array.from(
  { length: postSlotCount },
  (_, index) => postPermalinks[index] ?? null,
);

let instagramProcessRunning = false;

function hasUnprocessedInstagramEmbeds(section: HTMLElement) {
  return Array.from(
    section.querySelectorAll<HTMLElement>(".instagram-section__embed"),
  ).some((embed) => !embed.querySelector("iframe"));
}

function processInstagramEmbeds() {
  const section = document.getElementById("instagram");

  if (!section || instagramProcessRunning) {
    return;
  }

  instagramProcessRunning = true;
  let attempts = 0;

  const processPendingEmbeds = () => {
    if (!section.isConnected) {
      instagramProcessRunning = false;
      return;
    }

    if (!window.instgrm?.Embeds) {
      if (attempts < 8) {
        attempts += 1;
        window.setTimeout(processPendingEmbeds, 500);
      } else {
        instagramProcessRunning = false;
      }

      return;
    }

    window.instgrm.Embeds.process();
    attempts += 1;

    if (hasUnprocessedInstagramEmbeds(section) && attempts < 8) {
      window.setTimeout(processPendingEmbeds, 600);
      return;
    }

    instagramProcessRunning = false;
  };

  window.requestAnimationFrame(() => {
    processPendingEmbeds();
  });
}

export function InstagramSection({ content }: InstagramSectionProps) {
  useEffect(() => {
    const section = document.getElementById("instagram");

    if (!section || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          processInstagramEmbeds();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        id="instagram"
        aria-labelledby="instagram-title"
        className="instagram-section instagram-section--bleed"
      >
        <Container>
          <div className="instagram-section__intro">
            <div className="instagram-section__copy">
              <Eyebrow className="instagram-section__eyebrow">{content.eyebrow}</Eyebrow>
              <h2
                id="instagram-title"
                className="instagram-section__title"
              >
                {content.title}
              </h2>
              <p className="instagram-section__subtitle">
                {content.subtitle}
              </p>
              <p className="instagram-section__description">
                {content.description}
              </p>
            </div>
            <Button href={instagramProfileUrl} variant="accent" className="instagram-section__follow">
              {content.followLabel}
            </Button>
          </div>

          <div className="instagram-section__grid">
            {postSlots.map((permalink, index) => (
              <article
                key={permalink ?? `slot-${index}`}
                className={`instagram-section__card${permalink ? " instagram-section__card--embed" : ""}`}
              >
                {permalink ? (
                  <>
                    <div className="instagram-section__embed">
                      <blockquote
                        className="instagram-media !m-0 !w-full"
                        data-instgrm-permalink={permalink}
                        data-instgrm-version="14"
                        style={{
                          background: "#ffffff",
                          border: 0,
                          borderRadius: "4px",
                          boxShadow: "none",
                          margin: "0 auto",
                          maxWidth: "100%",
                          minWidth: 0,
                          padding: 0,
                          width: "100%",
                        }}
                      />
                    </div>
                    <a
                      className="instagram-section__fallback-link"
                      href={permalink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content.openPostLabel} <span aria-hidden="true">&rarr;</span>
                    </a>
                  </>
                ) : (
                  <div className="instagram-section__placeholder" aria-hidden="true">
                    <span className="instagram-section__number">
                      {String(index + 1).padStart(2, "0")} / 04
                    </span>
                    <span className="instagram-section__rule" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </Container>
      </section>
      {postPermalinks.length > 0 ? (
        <Script
          id="instagram-embed-script"
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
          onReady={processInstagramEmbeds}
        />
      ) : null}
    </>
  );
}