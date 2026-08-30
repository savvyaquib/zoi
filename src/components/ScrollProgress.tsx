"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A 2px page-progress bar. Driven purely by scaleX on the compositor —
 * animating `width` here would force layout on every scroll frame.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || reducedMotion) return;

    gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
    >
      <div ref={barRef} className="h-full w-full origin-left bg-orange" />
    </div>
  );
}
