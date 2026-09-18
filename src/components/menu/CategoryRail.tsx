"use client";

import { useEffect, useRef, useState } from "react";
import { useLenisRef } from "@/components/SmoothScroll";

type Entry = { id: string; title: string };

/**
 * The sticky category strip.
 *
 * One horizontal row of chips, scrollable on a phone, that stays pinned under
 * the nav while the menu scrolls beneath it. Tapping a chip carries the page
 * to that section; scrolling the page moves the highlight to whichever section
 * is under the reader.
 *
 * ── Tracking is IntersectionObserver, not a scroll listener ────────────────
 *
 * A scroll handler that measures every section on every frame is exactly the
 * layout-thrash the performance rule forbids. The observer fires only when a
 * section crosses a line a third of the way down the viewport, off the main
 * thread's critical path, and the handler does nothing but set state.
 *
 * It watches the SECTIONS, not their headings. Sections are contiguous and
 * fill the whole scroll range, so that line is always inside exactly one of
 * them — a tap on a distant chip, or a landing on #desserts, reports leave and
 * enter in the same frame and the highlight lands on the right chip. A line
 * watching headings alone can be jumped clean over.
 *
 * The active chip scrolls itself into view horizontally, so on a phone the
 * strip follows the reader down a twenty-section menu without a finger on it.
 */
export function CategoryRail({ entries }: { entries: Entry[] }) {
  const lenisRef = useLenisRef();
  const [active, setActive] = useState(entries[0]?.id);
  const railRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    const sections = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // rootMargin collapses the observer's box to a line 35% down the viewport.
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (r.isIntersecting) setActive(r.target.id);
        }
      },
      { rootMargin: "-35% 0px -64% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [entries]);

  /*
    Keep the highlighted chip centred in the strip.

    Measured with rects, not offsetLeft. The rail is not positioned, so
    offsetLeft reports from the nearest positioned ancestor — the sticky
    wrapper, which is the full viewport wide. On a phone the two coincide; on
    desktop the rail is a centred 896px box, and the 272px of margin between
    them sent every active chip to the left edge, under the fade.
  */
  useEffect(() => {
    const chip = active ? chipRefs.current.get(active) : undefined;
    const rail = railRef.current;
    if (!chip || !rail) return;
    const railBox = rail.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    const chipLeft = rail.scrollLeft + (chipBox.left - railBox.left);
    const left = chipLeft - rail.clientWidth / 2 + chipBox.width / 2;
    rail.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // Scroll to the heading, not the section box — the section carries its own
    // top padding and border, and landing on those leaves a gap under the rail.
    const target = document.getElementById(`${id}-title`) ?? document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    /*
      Land the heading just under the rail, not at the very top where the rail
      would cover it. Lenis on desktop, native on touch — the same split every
      in-page link on the site uses.
    */
    /*
      Where the rail WILL be once stuck, not where it is now. At the top of the
      page it still sits in flow under the masthead, and measuring it there
      would land the heading a masthead's height too low. Its stuck position is
      its own `top` plus its height — stable at every scroll position.
    */
    const wrap = railRef.current?.closest<HTMLElement>("[data-rail-sticky]");
    const stuckBottom = wrap
      ? parseFloat(getComputedStyle(wrap).top) + wrap.offsetHeight
      : 0;
    const offset = -stuckBottom - 20;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.1 });
    } else {
      const y = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div
      ref={railRef}
      role="navigation"
      aria-label="Menu sections"
      /*
        The paper texture continues behind the strip so the menu scrolls under
        it rather than behind a flat band. Edges fade so the row reads as
        continuing off-screen on a phone.
      */
      className="scrollbar-none flex gap-2 overflow-x-auto px-5 py-3 [mask-image:linear-gradient(to_right,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)] md:justify-center-safe md:px-8"
    >
      {entries.map((e) => {
        const isActive = e.id === active;
        return (
          <a
            key={e.id}
            ref={(el) => {
              if (el) chipRefs.current.set(e.id, el);
              else chipRefs.current.delete(e.id);
            }}
            href={`#${e.id}`}
            onClick={(ev) => go(ev, e.id)}
            aria-current={isActive ? "true" : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-2 font-sans text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-menu-red focus-visible:ring-offset-2 focus-visible:ring-offset-menu-paper focus-visible:outline-none ${
              isActive
                ? "border-menu-red bg-menu-red text-menu-paper"
                : "border-menu-red/30 text-menu-red hover:border-menu-red"
            }`}
          >
            {e.title}
          </a>
        );
      })}
    </div>
  );
}
