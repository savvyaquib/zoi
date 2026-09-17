"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Brings each menu section in as it reaches the viewport.
 *
 * Renders nothing — it exists to attach one ScrollTrigger.batch to every
 * `[data-reveal]` element below it. The elements start at their inline
 * `opacity: 0` so the server HTML never paints a flash of everything visible,
 * and each one is set back to fully visible if this never runs (no JS, or
 * reduced motion), which is the `gsap.set` in the early return.
 *
 * ── Why batch, and why only opacity + y ──────────────────────────────────────
 *
 * `batch` groups elements that enter in the same frame and plays them with one
 * stagger, so a fast scroll past six sections is one short cascade rather than
 * six overlapping tweens. And it creates ONE ScrollTrigger per element that
 * fires once — `once: true` — so after a section has appeared there is nothing
 * left listening to scroll for it.
 *
 * Opacity and transform only, per CLAUDE.md. Sixteen pixels of lift, not
 * forty: this is a menu people are reading, and the motion's job is to make the
 * page feel settled as it arrives, not to perform.
 */
export function MenuReveal() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (targets.length === 0) return;

    if (reducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 16 });
      ScrollTrigger.batch(targets, {
        start: "top 88%",
        once: true,
        /*
          A jump — tapping a chip, or landing on #desserts — crosses a dozen
          sections in one frame, and all of them arrive in a single batch.
          Two things keep that from becoming a long slow fade:

            1. Anything the jump has already scrolled PAST is set visible at
               once. It is off-screen; animating it is invisible work that only
               delays what is on screen.
            2. What remains is capped at a few per batch, so the stagger never
               accumulates past a fraction of a second.
        */
        batchMax: 4,
        onEnter: (batch) => {
          const passed = batch.filter((el) => el.getBoundingClientRect().bottom < 0);
          const ahead = batch.filter((el) => !passed.includes(el));
          if (passed.length) gsap.set(passed, { opacity: 1, y: 0, clearProps: "transform" });
          if (ahead.length)
            gsap.to(ahead, {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power2.out",
              stagger: 0.06,
              overwrite: true,
              force3D: true,
              clearProps: "transform",
            });
        },
      });
    });

    // Fonts arrive after first paint and change every section's height.
    const onFonts = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onFonts);

    return () => ctx.revert();
  }, [reducedMotion]);

  return null;
}
