"use client";

import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type LenisRef = RefObject<Lenis | null>;

const LenisContext = createContext<LenisRef | null>(null);

/**
 * Returns a ref to the live Lenis instance.
 *
 * Deliberately a ref, not state: the instance is created in a parent effect, which
 * runs AFTER child effects, so any state-based value would still read null in a
 * child's first effect. Consumers read `.current` at call time (e.g. inside a click
 * handler), by which point it is populated.
 */
export function useLenisRef(): LenisRef {
  const ctx = useContext(LenisContext);
  const fallback = useRef<Lenis | null>(null);
  return ctx ?? fallback;
}

/**
 * Wires Lenis to GSAP ScrollTrigger.
 *
 * Two rules from CLAUDE.md are load-bearing here:
 *  - `syncTouch: false` leaves touch devices on NATIVE scroll. Hijacking touch is the
 *    difference between "smooth" and "seasick" on a phone.
 *  - `autoRaf: false` + gsap.ticker means ONE requestAnimationFrame loop for the whole
 *    page, not two competing ones.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Reduced motion: skip Lenis entirely and let the browser scroll natively.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      syncTouch: false, // v1.3 API — verified in lenis/dist/lenis.d.ts
      autoRaf: false,
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = instance;
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  /**
   * Recompute every trigger's start/end once fonts and images have settled.
   * Font swap changes text metrics and images change box heights — both shift the
   * scroll distances that pins and the horizontal track were measured against.
   */
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
