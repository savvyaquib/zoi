"use client";

/**
 * Registers ScrollTrigger exactly once, client-side only.
 * Every module that needs GSAP imports from HERE, never from "gsap" directly,
 * so the plugin is guaranteed registered before any tween is created.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ES module evaluation is cached, so this runs exactly once per bundle.
// registerPlugin is idempotent regardless.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/** Matches the `md:` Tailwind breakpoint. Desktop gets the heavier motion set. */
export const DESKTOP_QUERY = "(min-width: 768px)";
export const MOBILE_QUERY = "(max-width: 767px)";
export const NO_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
