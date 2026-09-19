"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { BRAND } from "@/lib/assets";
import { awaitImageDecoded } from "@/hooks/usePreloader";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SEEN_KEY } from "./MenuShell";

/** Hard ceiling — never trap the reader if an image silently hangs. */
const SAFETY_TIMEOUT_MS = 4_000;
/** Floor. On a warm cache everything is in well under 200ms, and a loader that flashes reads as a glitch. */
const MIN_DISPLAY_MS = 900;
/** The fonts' share of the line. Three faces, all self-hosted; the images are the slower half. */
const FONT_WEIGHT = 0.3;

const PHRASES = [
  { upTo: 0.55, text: "Setting the table" },
  { upTo: Infinity, text: "Opening the menu" },
] as const;

/**
 * The menu's preloader — the home page's, exactly: navy, the cream mark, the
 * orange line that fills by `scaleX`, the counter, a status phrase keyed to
 * real progress. One loader for the whole site, so leaving the home page for
 * the menu does not feel like leaving the site. What it waits for is what the reader
 * would otherwise watch arrive one by one: the three menu faces, and every
 * image marked `data-critical` — the cover drawing and the first section's
 * photograph and illustration. Nothing below the fold is gated; that loads as
 * it is scrolled to, as it should.
 *
 * Shown once per session. `MenuShell` decides that and mounts this only when
 * it is wanted; the `active` flag is false during the one hydration frame in
 * which the shell has not decided yet.
 */
export function MenuLoader({
  active,
  onLift,
  onDone,
}: {
  active: boolean;
  /** The wipe has begun — the page may start arriving underneath. */
  onLift: () => void;
  /** The wipe has finished — unmount. */
  onDone: () => void;
}) {
  const reducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const counterValue = useRef({ value: 0 });
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const activePhrase = PHRASES.findIndex((p) => progress < p.upTo);

  // Hold the page still underneath.
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, []);

  // The gate: fonts, then the critical images, each credited as it lands.
  useEffect(() => {
    if (!active) return;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked — the next view shows the loader again, which is fine */
    }
    let cancelled = false;
    const startedAt = Date.now();

    const images = Array.from(document.querySelectorAll<HTMLImageElement>("main [data-critical] img"));
    let fontsDone = 0;
    let imagesDone = 0;
    const publish = () => {
      if (cancelled) return;
      const imageShare = images.length ? imagesDone / images.length : 1;
      setProgress(Math.min(1, fontsDone * FONT_WEIGHT + imageShare * (1 - FONT_WEIGHT)));
    };

    const fonts = (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsDone = 1;
      publish();
    });
    const decoded = Promise.all(
      images.map(async (el) => {
        await awaitImageDecoded(el);
        imagesDone += 1;
        publish();
      })
    );

    const safety = setTimeout(() => {
      if (cancelled) return;
      setProgress(1);
      setReady(true);
    }, SAFETY_TIMEOUT_MS);

    Promise.all([fonts, decoded]).then(async () => {
      if (cancelled) return;
      setProgress(1);
      const remaining = MIN_DISPLAY_MS - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      if (cancelled) return;
      clearTimeout(safety);
      setReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, [active]);

  // Entrance and the ellipsis loop, one context so both die together.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const dots = gsap.utils.toArray<HTMLElement>("[data-dot]");
      if (reducedMotion) {
        gsap.set(dots, { opacity: 0.6 });
        return;
      }
      /*
        The mark and the line are visible in the HTML itself — before
        hydration, this overlay is the first paint, and a blank sheet of
        paper for the time the script takes to arrive would read as nothing
        loading at all. The only entrance is the mark settling to size.
      */
      gsap.fromTo(logoRef.current, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: "power2.out" });
      gsap
        .timeline({ repeat: -1 })
        .to(dots, { opacity: 0.9, duration: 0.26, stagger: 0.16, ease: "power1.out" })
        .to(dots, { opacity: 0.15, duration: 0.26, stagger: 0.16, ease: "power1.in" }, 0.72);
    }, rootRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  // The line and the counter ease toward the true ratio rather than stepping.
  useEffect(() => {
    const tween = gsap.to(counterValue.current, {
      value: progress,
      duration: 0.5,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        const v = counterValue.current.value;
        if (counterRef.current) counterRef.current.textContent = String(Math.round(v * 100));
        if (barFillRef.current) gsap.set(barFillRef.current, { scaleX: v });
      },
    });
    return () => {
      tween.kill();
    };
  }, [progress]);

  // Crossfade the phrase when its bracket changes.
  useEffect(() => {
    const tweens = phraseRefs.current.map((el, i) =>
      el
        ? gsap.to(el, { opacity: i === activePhrase ? 1 : 0, duration: reducedMotion ? 0 : 0.35, ease: "power2.inOut", overwrite: true })
        : null
    );
    return () => tweens.forEach((t) => t?.kill());
  }, [activePhrase, reducedMotion]);

  // Everything is in: lift, and hand the page its entrance.
  useEffect(() => {
    if (!ready) return;
    if (reducedMotion) {
      const id = requestAnimationFrame(() => {
        onLift();
        onDone();
      });
      return () => cancelAnimationFrame(id);
    }
    /*
      The masthead is under this overlay at full opacity. Its entrance will
      fade it in, so it is hidden here, before the wipe uncovers it — otherwise
      the reader would glimpse it, lose it, and see it come back.
    */
    gsap.set(document.querySelectorAll("[data-masthead-item]"), { opacity: 0 });
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.25, onComplete: onDone })
        .to([logoRef.current, groupRef.current, counterRef.current], { opacity: 0, duration: 0.25, ease: "power2.out" })
        .to(rootRef.current, { yPercent: -100, duration: 0.7, ease: "power3.inOut" }, "-=0.05")
        // A third of the way through the wipe the top of the page is clear.
        .call(onLift, [], "-=0.45");
    }, rootRef);
    return () => ctx.revert();
  }, [ready, reducedMotion, onLift, onDone]);

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label="Opening the menu"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-valuetext={PHRASES[activePhrase]?.text}
      className="fixed inset-0 z-100 flex items-center justify-center bg-navy will-change-transform"
    >
      <div className="flex flex-col items-center px-6">
        <div ref={logoRef} className="w-[130px] md:w-[180px]">
          <Image
            src={BRAND.logo.src}
            unoptimized
            alt="Zoi"
            width={BRAND.logo.width}
            height={BRAND.logo.height}
            priority
            sizes="(min-width: 768px) 150px, 112px"
            className="h-auto w-full"
          />
        </div>

        <div ref={groupRef} className="flex flex-col items-center">
          <div className="mt-8 h-0.5 w-[220px] max-w-[60vw] overflow-hidden bg-white/15">
            <div
              ref={barFillRef}
              className="h-full w-full origin-left bg-orange will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          {/* Phrases stacked so the crossfade never reflows. */}
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
        className="pointer-events-none absolute right-6 bottom-2 font-display text-[22vw] leading-[0.8] font-normal text-white/15 select-none md:right-12 md:bottom-4 md:text-[14vw]"
      >
        0
      </span>
    </div>
  );
}
