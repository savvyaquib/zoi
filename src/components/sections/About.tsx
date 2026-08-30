"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** One accent word per slide, used sparingly per the palette rules. */
const SLIDES = [
  { word: "ROOTED", line: "Jharkhand's harvest, on every plate.", accent: "text-navy" },
  { word: "CRAFTED", line: "Each dish built by hand, to order.", accent: "text-orange" },
  { word: "WARM", line: "Low light, long dinners, no rush.", accent: "text-navy" },
  { word: "OURS", line: "Ranchi's table, whenever you arrive.", accent: "text-blue" },
] as const;

/**
 * Section — About. Four word-to-sentence morphs on a pinned stage.
 *
 * Layout: the word sits above, the sentence directly BELOW it — never stacked in
 * the same cell. The sentence begins small, reading as a caption under the word;
 * as the word shrinks and drifts up out of frame the sentence grows into the
 * space it vacates, so one hands off to the other in a single continuous move.
 *
 * CLAUDE.md forbids animating font-size, so both texts are rendered at their FINAL
 * size and moved only with transform. Both only ever scale DOWN from their laid-out
 * size, which is what keeps them crisp — text scaled above 1 renders soft.
 *
 * Performance notes, because this section is the one that used to stutter:
 *
 *  - panels use autoAlpha, not opacity. An opacity-0 layer is still painted and
 *    composited every frame; visibility:hidden drops it from the pipeline entirely.
 *    Three of the four panels are therefore doing no work at any given moment.
 *  - no blanket `will-change`. Twelve permanently-promoted layers carrying display
 *    type at 13vw is a lot of GPU memory and compositing cost for elements that are
 *    idle most of the time. GSAP's force3D promotes each element only while its own
 *    tween is actually running.
 *  - `scrub` is a number, not `true`. That decouples the timeline from raw scroll
 *    events and lets it catch up smoothly instead of jumping on every delta.
 */
export function About() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reducedMotion) return;

    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slides.length === 0 || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          // Smoothing, not 1:1. Reads calmer and does less work per scroll event.
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      slides.forEach((slide, i) => {
        const word = slide.querySelector<HTMLElement>("[data-word]");
        const line = slide.querySelector<HTMLElement>("[data-line]");
        if (!word || !line) return;

        gsap.set(slide, { autoAlpha: i === 0 ? 1 : 0 });

        if (i > 0) {
          tl.fromTo(
            slide,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.2, ease: "power2.out" },
            i
          );
        }

        // The word shrinks and lifts away.
        tl.fromTo(
          word,
          { scale: 1, y: 0, opacity: 1 },
          {
            scale: 0.32,
            y: "-5vh",
            opacity: 0,
            duration: 0.54,
            ease: "power2.inOut",
            force3D: true,
          },
          i + 0.2
        );

        // The sentence grows into the space the word just left.
        tl.fromTo(
          line,
          { scale: 0.34, y: 0, opacity: 0.35 },
          {
            scale: 1,
            y: "-7vh",
            opacity: 1,
            duration: 0.54,
            ease: "power2.inOut",
            force3D: true,
          },
          i + 0.2
        );

        if (i < slides.length - 1) {
          tl.to(slide, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, i + 0.8);
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Reduced motion: a plain vertical stack of static panels, no pin, no transforms.
  if (reducedMotion) {
    return (
      <section id="about" className="bg-white text-navy">
        {SLIDES.map((slide) => (
          <div
            key={slide.word}
            className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center"
          >
            <h2
              className={`font-display text-[18vw] leading-none ${slide.accent} md:text-[13vw]`}
            >
              {slide.word}
            </h2>
            <p className="max-w-3xl font-display text-[6vw] leading-tight text-navy/70 md:text-[3.2vw]">
              {slide.line}
            </p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative h-[400vh] bg-white text-navy md:h-[450vh]"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.word}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-[2.5vh] px-6 text-center"
            /* Matches the autoAlpha start state so there is no flash of all four
               words stacked on top of each other before the effect runs. */
            style={{
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? "visible" : "hidden",
            }}
          >
            <h2
              data-word
              className={`font-display text-[18vw] leading-[0.9] ${slide.accent} md:text-[13vw]`}
            >
              {slide.word}
            </h2>
            <p
              data-line
              className="max-w-3xl font-display text-[6vw] leading-tight text-navy/70 md:text-[3.2vw]"
            >
              {slide.line}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
