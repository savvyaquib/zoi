"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { BRAND } from "@/lib/assets";
import { usePreload } from "@/hooks/usePreloader";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Status copy, keyed to real progress brackets rather than a timer — the line only
 * advances because bytes actually landed.
 */
const PHRASES = [
  { upTo: 0.35, text: "Setting the table" },
  { upTo: 0.7, text: "Lighting the candles" },
  { upTo: 0.95, text: "Pouring the wine" },
  { upTo: Infinity, text: "Welcome to Zoi" },
] as const;

function phraseIndex(progress: number) {
  return PHRASES.findIndex((p) => progress < p.upTo);
}

/**
 * Section 1 — full-screen navy preloader.
 *
 * Nothing here is decorative: the bar, the counter and the status line are all
 * driven by `usePreload().progress`, which only advances as real assets decode.
 *
 * The bar fills with `scaleX` off a left origin — animating `width` would force
 * layout on every frame of the load, which is the worst possible moment for it.
 */
export function Loading() {
  const { progress, ready, markRevealed } = usePreload();
  const reducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const counterValue = useRef({ value: 0 });

  const [done, setDone] = useState(false);
  const active = phraseIndex(progress);

  // Hold the page still while the loader is up. Locking the document is enough —
  // with nothing to scroll, Lenis has nothing to advance either.
  useEffect(() => {
    if (done) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [done]);

  // Entrance, then the loops. One context so every tween — including the two
  // infinite ones — is killed together on unmount. No orphaned loops.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const dots = gsap.utils.toArray<HTMLElement>("[data-dot]");

      if (reducedMotion) {
        // Logo static, dots static and legible. The bar and status line stay —
        // they are information, not decoration.
        gsap.set(logoRef.current, { opacity: 1, scale: 1 });
        gsap.set(dots, { opacity: 0.6 });
        return;
      }

      gsap
        .timeline()
        .fromTo(
          logoRef.current,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
        )
        // Breathing: 1.5s each way = a ~3s cycle. 3% is barely perceptible on
        // purpose — alive, not distracting.
        .to(logoRef.current, {
          scale: 1.03,
          duration: 1.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

      gsap.fromTo(
        groupRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.25 }
      );

      // Ellipsis: three dots rising and falling in sequence, ~1.4s a cycle.
      gsap
        .timeline({ repeat: -1 })
        .to(dots, { opacity: 0.9, duration: 0.26, stagger: 0.16, ease: "power1.out" })
        .to(
          dots,
          { opacity: 0.15, duration: 0.26, stagger: 0.16, ease: "power1.in" },
          0.72
        );
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Counter and bar both ease toward the true ratio so they climb smoothly rather
  // than stepping in eighths.
  useEffect(() => {
    const tween = gsap.to(counterValue.current, {
      value: progress,
      duration: 0.6,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        const v = counterValue.current.value;
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(v * 100));
        }
        if (barFillRef.current) {
          gsap.set(barFillRef.current, { scaleX: v });
        }
      },
    });
    return () => {
      tween.kill();
    };
  }, [progress]);

  // Crossfade the status line whenever the progress bracket changes.
  useEffect(() => {
    const phrases = phraseRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (phrases.length === 0) return;

    const tweens = phrases.map((el, i) =>
      gsap.to(el, {
        opacity: i === active ? 1 : 0,
        duration: reducedMotion ? 0 : 0.4,
        ease: "power2.inOut",
        overwrite: true,
      })
    );
    return () => tweens.forEach((t) => t.kill());
  }, [active, reducedMotion]);

  // Assets are in -> wipe the loader up and hand the stage to Hero.
  useEffect(() => {
    if (!ready) return;

    if (reducedMotion) {
      // Deferred a frame so the lock cleanup runs in its own commit rather than
      // cascading a render from inside this effect.
      const id = requestAnimationFrame(() => {
        setDone(true);
        markRevealed();
      });
      return () => cancelAnimationFrame(id);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        // Just long enough for the counter to visibly land on 100.
        delay: 0.4,
        onComplete: () => {
          setDone(true);
          markRevealed();
        },
      });

      tl.to([logoRef.current, groupRef.current, counterRef.current], {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      }).to(
        rootRef.current,
        { yPercent: -100, duration: 0.8, ease: "power3.inOut" },
        "-=0.1"
      );
    }, rootRef);

    return () => ctx.revert();
  }, [ready, reducedMotion, markRevealed]);

  /**
   * Re-measure every ScrollTrigger once the scroll lock is gone.
   *
   * Sections below the fold build their triggers while this loader still has
   * `html { overflow: hidden }` set, so they measure against a document that
   * cannot scroll — start and end collapse and the trigger reads as already
   * passed, freezing its timeline at the end state. Nothing else re-measures
   * afterwards, so without this the About morph never plays.
   *
   * Deferred two frames: `done` has to commit, the lock effect's cleanup has to
   * restore overflow, and layout has to settle before measuring is meaningful.
   */
  useEffect(() => {
    if (!done) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [done]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-100 flex items-center justify-center bg-navy will-change-transform"
      role="progressbar"
      aria-label="Loading Zoi"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-valuetext={PHRASES[active]?.text}
    >
      <div className="flex flex-col items-center px-6">
        <div ref={logoRef} className="w-[130px] md:w-[180px]">
          <Image
            src={BRAND.logo.src}
            alt="Zoi"
            width={BRAND.logo.width}
            height={BRAND.logo.height}
            priority
            sizes="(min-width: 768px) 180px, 130px"
            className="h-auto w-full"
          />
        </div>

        <div ref={groupRef} className="flex flex-col items-center">
          {/* 32px below the logo */}
          <div className="mt-8 h-0.5 w-[220px] max-w-[60vw] overflow-hidden bg-white/15">
            <div
              ref={barFillRef}
              className="h-full w-full origin-left bg-orange will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          {/* 16px below the bar. Phrases are stacked so a crossfade never reflows. */}
          <div className="relative mt-4 h-4 w-full">
            {PHRASES.map((phrase, i) => (
              <span
                key={phrase.text}
                ref={(el) => {
                  phraseRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="absolute inset-x-0 top-0 flex items-center justify-center font-sans text-[10px] tracking-[0.3em] whitespace-nowrap text-white/60 uppercase md:text-[11px]"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {phrase.text}
                <span className="ml-1 inline-flex">
                  {[0, 1, 2].map((d) => (
                    <span key={d} data-dot style={{ opacity: 0.15 }}>
                      .
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <span
        ref={counterRef}
        aria-hidden="true"
        className="pointer-events-none absolute right-6 bottom-2 font-display text-[22vw] leading-[0.8] font-normal text-white/15 tabular-nums select-none md:right-12 md:bottom-4 md:text-[14vw]"
      >
        0
      </span>
    </div>
  );
}
