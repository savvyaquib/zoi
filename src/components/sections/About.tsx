"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenisRef } from "@/components/SmoothScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Four beats, each with its own colour combination.
 *
 * Only the four palette colours, as required — orange, blue, navy ("black") and
 * the warm off-white. The sequence is chosen to read as a journey rather than a
 * set of unrelated screens:
 *
 *   white -> navy -> blue -> orange
 *
 * Light, then dark, then a cooler dark, then warm. Two darks sit next to each
 * other in the middle so the eye is never thrown from white straight to orange,
 * which is the jump that would feel abrupt. The accent word carries the contrast
 * on each one, so the word colour rotates independently of the ground.
 *
 * Every pairing clears WCAG AA for body text at these sizes (the display word is
 * far past it): navy-on-white and navy-on-orange ~6:1, orange-on-navy ~6:1,
 * white-on-blue ~5.4:1. The sentence tints are held above 4.5:1 on their ground.
 */
const SLIDES = [
  {
    word: "ROOTED",
    line: "Jharkhand's harvest, on every plate.",
    bg: "bg-white",
    wordColor: "text-navy",
    lineColor: "text-navy/65",
  },
  {
    word: "CRAFTED",
    line: "Each dish built by hand, to order.",
    bg: "bg-navy",
    wordColor: "text-orange",
    lineColor: "text-white/70",
  },
  {
    word: "WARM",
    line: "Low light, long dinners, no rush.",
    bg: "bg-blue",
    wordColor: "text-white",
    lineColor: "text-white/80",
  },
  {
    word: "OURS",
    line: "Ranchi's table, whenever you arrive.",
    bg: "bg-orange",
    wordColor: "text-navy",
    lineColor: "text-navy/75",
  },
] as const;

/** Where the word/sentence morph sits inside each slide's one-unit window. */
const MORPH_START = 0.12;
const MORPH_DURATION = 0.6;

/** The handover to the next slide, overlapping the tail of the morph. */
const CROSSFADE_AT = 0.72;
const CROSSFADE_DURATION = 0.28;

/** Quiet time after scrolling stops before the deck settles onto a beat. */
const SETTLE_DELAY_MS = 140;
/** How long the settle itself takes. Short — it is a nudge, not a journey. */
const SETTLE_DURATION = 0.55;
/** Already within this many pixels of a rest point: leave it alone. */
const SETTLE_EPSILON = 2;

/**
 * Section — About. Four word-to-sentence morphs on a pinned stage.
 *
 * Layout: the word sits above, the sentence directly BELOW it — never stacked in
 * the same cell. The sentence begins small, reading as a caption under the word;
 * as the word shrinks and drifts up out of frame the sentence grows into the
 * space it vacates, so one hands off to the other in a single continuous move.
 *
 * ── How the colour change stays seamless ───────────────────────────────────
 *
 * Each slide carries its own opaque background, so the ground colour changes for
 * free as the panels cross over — nothing animates `background-color`, which
 * would repaint the whole viewport every frame and is exactly the kind of work
 * that makes a scrubbed section stutter on a phone. Opacity is composited.
 *
 * The crossfade OVERLAPS the outgoing slide rather than following it. Panels are
 * painted in DOM order, so the incoming one is already on top: it simply fades up
 * and covers its predecessor. That matters — an out-then-in sequence leaves a gap
 * where neither panel is opaque and the section's own background flashes through
 * between every beat. The outgoing panel is only hidden once it is fully covered,
 * with a `set` at the end of the handover rather than a second tween.
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
  const lenisRef = useLenisRef();
  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reducedMotion) return;

    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slides.length === 0 || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      /*
        Built paused and attached to the ScrollTrigger afterwards, rather than
        passing `scrollTrigger` inline. That ordering is what lets the snap points
        below be derived from the timeline's REAL duration instead of a hand-kept
        copy of it that would drift the moment a constant above changes.
      */
      const tl = gsap.timeline({ paused: true });

      slides.forEach((slide, i) => {
        const word = slide.querySelector<HTMLElement>("[data-word]");
        const line = slide.querySelector<HTMLElement>("[data-line]");
        if (!word || !line) return;

        gsap.set(slide, { autoAlpha: i === 0 ? 1 : 0 });

        // The word shrinks and lifts away.
        tl.fromTo(
          word,
          { scale: 1, y: 0, opacity: 1 },
          {
            scale: 0.32,
            y: "-5vh",
            opacity: 0,
            duration: MORPH_DURATION,
            ease: "power2.inOut",
            force3D: true,
          },
          i + MORPH_START
        );

        // The sentence grows into the space the word just left.
        tl.fromTo(
          line,
          { scale: 0.34, y: 0, opacity: 0.35 },
          {
            scale: 1,
            y: "-7vh",
            opacity: 1,
            duration: MORPH_DURATION,
            ease: "power2.inOut",
            force3D: true,
          },
          i + MORPH_START
        );

        const next = slides[i + 1];
        if (!next) return;

        // The next ground rises over this one — see the crossfade note above.
        tl.fromTo(
          next,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: CROSSFADE_DURATION,
            ease: "power1.inOut",
          },
          i + CROSSFADE_AT
        );

        // Fully covered by now, so dropping it is invisible — and it takes one
        // more full-screen layer out of the compositor for the rest of the scroll.
        tl.set(slide, { autoAlpha: 0 }, i + CROSSFADE_AT + CROSSFADE_DURATION);
      });

      /*
        The two rest states of every beat, as timeline progress:
        the word standing at full size, and the sentence fully grown after the
        morph. Those are the only places worth stopping — anything between them is
        a half-finished morph with a half-sized word and a half-sized sentence.
      */
      const total = tl.duration();
      const points = [0];
      SLIDES.forEach((_, i) => {
        points.push((i + MORPH_START) / total);
        points.push((i + MORPH_START + MORPH_DURATION) / total);
      });
      const snapPoints = [...new Set(points.map((p) => Math.min(1, Math.max(0, p))))];

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        // Smoothing, not 1:1. Reads calmer and does less work per scroll event.
        scrub: 0.6,
        animation: tl,
        invalidateOnRefresh: true,
      });

      /*
        ── Why the settle is hand-rolled instead of ScrollTrigger's `snap` ───────

        Lenis owns the scroll position: every frame it writes scrollTop toward its
        own internal target. ScrollTrigger's built-in snap writes scrollTop too, so
        the two would take turns overwriting each other and the page would judder
        or simply refuse to land. Routing the settle through `lenis.scrollTo` makes
        Lenis the single writer, which is the only way this stays smooth.

        Lenis emits `scroll` continuously while it eases, so a debounce on that
        event is a genuine "the page has stopped moving" signal rather than a
        guess. The settle's own scrolling restarts the debounce; by the time it
        fires again we are already on a rest point and the epsilon check bails.
      */
      const settle = () => {
        const lenis = lenisRef.current;
        if (!st.isActive) return;

        const progress = st.progress;
        const nearest = snapPoints.reduce((best, p) =>
          Math.abs(p - progress) < Math.abs(best - progress) ? p : best
        );

        const target = st.start + nearest * (st.end - st.start);
        const current = lenis?.scroll ?? window.scrollY;
        if (Math.abs(target - current) < SETTLE_EPSILON) return;

        if (lenis) {
          lenis.scrollTo(target, { duration: SETTLE_DURATION });
        } else {
          // Reduced motion disables Lenis entirely; native smooth scroll respects
          // that setting on its own.
          window.scrollTo({ top: target, behavior: "smooth" });
        }
      };

      let idle: ReturnType<typeof setTimeout>;
      const onScroll = () => {
        clearTimeout(idle);
        idle = setTimeout(settle, SETTLE_DELAY_MS);
      };

      const lenis = lenisRef.current;
      lenis?.on("scroll", onScroll);
      // Fallback for the frame before Lenis exists, and for any scroll it does not
      // author (keyboard, scrollbar drag).
      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        clearTimeout(idle);
        lenis?.off("scroll", onScroll);
        window.removeEventListener("scroll", onScroll);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion, lenisRef]);

  // Reduced motion: a plain vertical stack of static panels, no pin, no transforms.
  // Each keeps its own colour pairing, so the sequence still reads as designed.
  if (reducedMotion) {
    return (
      <section id="about">
        {SLIDES.map((slide) => (
          <div
            key={slide.word}
            className={`flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center ${slide.bg}`}
          >
            <h2
              className={`font-display text-[18vw] leading-none ${slide.wordColor} md:text-[13vw]`}
            >
              {slide.word}
            </h2>
            <p
              className={`max-w-3xl font-display text-[6vw] leading-tight ${slide.lineColor} md:text-[3.2vw]`}
            >
              {slide.line}
            </p>
          </div>
        ))}
      </section>
    );
  }

  return (
    /*
      The section's own ground matches the FIRST slide. It is only ever visible for
      the instant before the pin engages, but if it did not match, that instant
      would read as a flash.
    */
    <section
      ref={sectionRef}
      id="about"
      className={`relative z-0 h-[400svh] md:h-[450vh] ${SLIDES[0].bg}`}
    >
      {/*
        On a phone the stage occupies the BOTTOM half, directly beneath the sticky
        hero, so the pair fills exactly one screen with no gap. `top-[50svh]` and
        `h-[50svh]` are the hero's height — if that changes, both of these change
        with it.

        `svh` rather than `dvh` deliberately: `dvh` shifts as the URL bar hides,
        which would slide the stage out from under the hero mid-scroll.

        From `md` up it takes the whole viewport, as before.
      */}
      <div className="sticky top-[50svh] h-[50svh] overflow-hidden md:top-0 md:h-dvh">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.word}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className={`absolute inset-0 flex flex-col items-center justify-center gap-[1.5vh] px-6 text-center md:gap-[2.5vh] ${slide.bg}`}
            /* Matches the autoAlpha start state so there is no flash of all four
               words stacked on top of each other before the effect runs. */
            style={{
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? "visible" : "hidden",
            }}
          >
            <h2
              data-word
              /* Smaller than the reduced-motion stack: on mobile this sits in a
                 half-height stage, not a full one. */
              className={`font-display text-[16vw] leading-[0.9] ${slide.wordColor} md:text-[13vw]`}
            >
              {slide.word}
            </h2>
            <p
              data-line
              className={`max-w-3xl font-display text-[5vw] leading-tight ${slide.lineColor} md:text-[3.2vw]`}
            >
              {slide.line}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
