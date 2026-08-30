"use client";

import Image from "next/image";
import { BRAND, VENUE } from "@/lib/assets";
import { useLenisRef } from "@/components/SmoothScroll";
import { BUTTON_MOTION } from "@/lib/reservation";

const QUICK_LINKS = [
  // TODO: there is no menu section on this site yet. Pointed at the ambience
  // beat as a placeholder — needs a real menu section, a PDF, or removal.
  { label: "Menu", href: "#ambience" },
  { label: "Ambience", href: "#ambience" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reserve", href: "#reserve" },
];

const WHATSAPP_URL = `https://wa.me/${VENUE.phoneRaw.replace(/\D/g, "")}`;

const SOCIALS = [
  {
    label: "Instagram",
    href: VENUE.instagramUrl,
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2a3.8 3.8 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-1.1.05-1.7.24-2.1.4-.5.2-.9.44-1.3.84-.4.4-.64.8-.84 1.3-.16.4-.35 1-.4 2.1C2.6 9.9 2.6 10.3 2.6 12s0 2.1.06 3.3c.05 1.1.24 1.7.4 2.1.2.5.44.9.84 1.3.4.4.8.64 1.3.84.4.16 1 .35 2.1.4 1.2.06 1.6.06 4.7.06s3.5 0 4.7-.06c1.1-.05 1.7-.24 2.1-.4.5-.2.9-.44 1.3-.84.4-.4.64-.8.84-1.3.16-.4.35-1 .4-2.1.06-1.2.06-1.6.06-3.3s0-2.1-.06-3.3c-.05-1.1-.24-1.7-.4-2.1a3.5 3.5 0 0 0-.84-1.3 3.5 3.5 0 0 0-1.3-.84c-.4-.16-1-.35-2.1-.4C15.5 4 15.1 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Zm6.2-8.2a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M14 9h2.5V6H14c-2 0-3.4 1.5-3.4 3.5V11H8.5v3h2.1v7h3v-7h2.4l.4-3h-2.8V9.7c0-.4.2-.7.4-.7Z",
  },
  {
    label: "X",
    href: "https://x.com",
    path: "M17.5 3h3l-6.6 7.5L21.5 21h-6l-4.3-5.6L6.2 21H3.1l7-8L2.8 3h6.2l3.9 5.2L17.5 3Zm-1.1 16.2h1.7L7.7 4.7H5.9l10.5 14.5Z",
  },
];

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
              alt="Zoi"
              width={BRAND.logo.width}
              height={BRAND.logo.height}
              loading="lazy"
              sizes="112px"
              className="h-auto w-28"
            />
            <p className="mt-5 max-w-xs font-display text-lg leading-snug text-white/80 italic">
              {VENUE.tagline}
            </p>
            <a
              href={VENUE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-sans text-sm text-blue underline-offset-4 hover:underline"
            >
              {VENUE.instagram}
            </a>
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
            <ul className="mt-5 flex gap-4">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors duration-150 ease-out hover:border-orange hover:text-orange focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none ${BUTTON_MOTION}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="currentColor"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>

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
