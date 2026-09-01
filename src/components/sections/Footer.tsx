"use client";

import Image from "next/image";
import { BRAND, VENUE } from "@/lib/assets";
import { useLenisRef } from "@/components/SmoothScroll";
import { BUTTON_MOTION } from "@/lib/reservation";

/**
 * Only the sections that actually exist, in the order you meet them.
 *
 * "Menu" was pointed at #ambience because there is no menu section — a link that
 * lies about where it goes. "Gallery" was a second link to the same #ambience
 * beat under a different name. Both removed rather than left as decoration.
 */
const QUICK_LINKS = [
  { label: "About", href: "#about" },
  { label: "Ambience", href: "#ambience" },
  { label: "Reserve", href: "#reserve" },
];

const WHATSAPP_URL = `https://wa.me/${VENUE.phoneRaw.replace(/\D/g, "")}`;

/**
 * The Instagram glyph, drawn as strokes rather than one long filled path.
 *
 * It is the real mark — rounded square, concentric lens, offset dot — at the
 * proportions Instagram actually uses, so it reads correctly at 20px instead of
 * approximating the shape. Stroked also means it inherits weight sensibly and
 * stays crisp at any size.
 *
 * Facebook and X used to sit beside this, pointed at bare `facebook.com` and
 * `x.com`. Those are not Zoi's accounts — they were placeholder links that would
 * have sent guests to a login page. Instagram is the only channel CLAUDE.md
 * lists, so it is the only one here.
 */
function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const lenisRef = useLenisRef();

  const scrollTo = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    // Read at click time — the instance is created in a parent effect.
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target as HTMLElement, { duration: 1.4 });
    } else {
      // Lenis is absent under reduced motion — native scroll respects that setting.
      target.scrollIntoView({ block: "start" });
    }
  };

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-12 md:py-20">
        <div className="grid gap-12 md:grid-cols-4 md:gap-10">
          <div className="md:col-span-1">
            <Image
              src={BRAND.logo.src}
              alt="Zoi restaurant Ranchi"
              width={BRAND.logo.width}
              height={BRAND.logo.height}
              loading="lazy"
              sizes="112px"
              className="h-auto w-28"
            />
            <p className="mt-5 max-w-xs font-display text-lg leading-snug text-white/80 italic">
              {VENUE.tagline}
            </p>
          </div>

          <nav aria-labelledby="footer-quick-links">
            <h2
              id="footer-quick-links"
              className="font-sans text-xs tracking-[0.25em] text-white/50 uppercase"
            >
              Quick Links
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollTo(e, link.href)}
                    className="font-sans text-sm text-white/80 underline-offset-4 hover:text-orange hover:underline focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-sans text-xs tracking-[0.25em] text-white/50 uppercase">
              Visit Us
            </h2>
            <address className="mt-5 flex flex-col gap-3 font-sans text-sm text-white/80 not-italic">
              <span>{VENUE.address.line}</span>
              <a
                href={`tel:${VENUE.phoneRaw}`}
                className="underline-offset-4 hover:text-orange hover:underline"
              >
                {VENUE.phone}
              </a>
              <span>{VENUE.hours}</span>
            </address>
          </div>

          <div>
            <h2 className="font-sans text-xs tracking-[0.25em] text-white/50 uppercase">
              Connect
            </h2>
            {/*
              One channel, so it shows the handle rather than being a bare icon
              the visitor has to hover to identify. This also replaces the
              duplicate handle link that used to sit under the tagline.
            */}
            <a
              href={VENUE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-5 inline-flex items-center gap-3 rounded-full border border-white/20 py-2.5 pr-5 pl-3 font-sans text-sm text-white/85 transition-colors duration-150 ease-out hover:border-orange hover:text-orange focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none ${BUTTON_MOTION}`}
            >
              <InstagramIcon />
              {VENUE.instagram}
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 inline-flex items-center gap-2.5 rounded-full bg-orange px-6 py-3.5 font-sans text-xs font-medium tracking-[0.18em] text-navy uppercase focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy focus-visible:outline-none ${BUTTON_MOTION}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.700-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.1.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3a3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.5 3.9 1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <p className="mt-16 border-t border-white/10 pt-6 font-sans text-xs text-white/40">
          © 2026 Zoi Restaurant. All rights reserved. · Ranchi
        </p>
      </div>
    </footer>
  );
}
