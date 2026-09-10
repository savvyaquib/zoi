"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { AMBIENCE_GALLERY, HERO_VIDEO } from "@/lib/assets";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const DESKTOP = "(min-width: 768px)";

/** Where the panel finishes wiping in, as a fraction of the scrubbed timeline. */
const WIPE_START = 0.3;
const WIPE_END = 0.56;

/**
 * Section 3 — Ambience. Two genuinely different builds, not one build with tweaks.
 *
 * ── Desktop: pinned stage, one scrubbed timeline ───────────────────────────
 *
 *   0.00 - 0.30   the loop plays full-bleed
 *   0.30 - 0.56   a white panel slides in FROM THE RIGHT across it, carrying the
 *                 headline and the cards with it — they ride in, they do not fade
 *   0.44 - 0.62   the cards pop the last few percent into place, staggered
 *   0.62 - 1.00   the card row travels left, the horizontal gallery
 *
 * The panel is a single translate. In the reference the headline's left edge tracks
 * the panel's left edge exactly, which is what tells you the text is INSIDE the
 * panel rather than being uncovered by it — so one transform moves all of it.
 *
 * ── Mobile: no pin, no scrub, no scroll-jacking ────────────────────────────
 *
 * The reference does not pin on a phone and neither do we. The video is a band at
 * the top, the headline sits under it, and the cards are a NATIVE horizontal
 * scroller with snap points: swipe it if you want the gallery, or keep scrolling
 * vertically past it if you don't. Nothing traps the page.
 *
 * That choice is also the performance story. A pinned, scrubbed stage runs work on
 * every scroll event; this runs none. The only scroll-linked JS on a phone is the
 * progress bar, which is a passive listener writing one `scaleX` per frame. Lenis
 * is already on native touch scroll (`syncTouch: false`), so it never handles
 * these gestures — see the note on the scroller for why it must NOT be marked
 * `data-lenis-prevent`.
 *
 * ── The video ──────────────────────────────────────────────────────────────
 *
 * Deliberately the HERO encode. The ambience folder used to ship its own
 * `hero.mp4`, but it was a byte-identical copy of the hero video (verified by
 * md5) that still carried the letterbox bars, so it was deleted rather than
 * wired up. Pointing at the hero URL means the HTTP cache serves it and nothing
 * is downloaded twice.
 *
 * It is still the same footage in two places on one page — swap in real ambience
 * footage here when it exists.
 */
export function Ambience() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery(DESKTOP);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  /**
   * One encode, chosen in JS, plus play/pause on visibility so we are never
   * decoding a 1080p loop that is scrolled off screen.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const wide = window.matchMedia(`(min-width: ${HERO_VIDEO.breakpoint}px)`).matches;
    const chosen = wide ? HERO_VIDEO.desktop : HERO_VIDEO.mobile;
    if (video.getAttribute("src") !== chosen) {
      video.setAttribute("src", chosen);
    }

    if (reducedMotion) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay refused — poster stays */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(video);

    return () => {
      io.disconnect();
      video.pause();
    };
  }, [reducedMotion, isDesktop]);

  /** Desktop only — the pinned, scrubbed stage. */
  useEffect(() => {
    if (reducedMotion || !isDesktop) return;

    const section = sectionRef.current;
    const stage = stageRef.current;
    const panel = panelRef.current;
    const track = trackRef.current;
    if (!section || !stage || !panel || !track) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];

    const ctx = gsap.context(() => {
      gsap.set(panel, { xPercent: 100 });
      gsap.set(cards, { opacity: 0, scale: 0.94, y: 28 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          // A number, not `true`. Decouples the timeline from raw scroll deltas and
          // lets it catch up smoothly instead of jumping on every event.
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // The wipe. One transform carries the panel, the headline and the cards.
      tl.to(
        panel,
        { xPercent: 0, ease: "power2.inOut", duration: WIPE_END - WIPE_START },
        WIPE_START
      );

      // Cards settle the last few percent while the panel is still travelling, so
      // there is no dead beat between the wipe landing and the row coming alive.
      tl.to(
        cards,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.1,
          stagger: 0.025,
        },
        WIPE_START + 0.14
      );

      /*
        The horizontal gallery. `ease: "none"` is required — anything else breaks the
        1:1 mapping between scroll distance and horizontal position. Measured in a
        function so `invalidateOnRefresh` re-reads it after fonts and images settle.
      */
      tl.to(
        track,
        {
          x: () => {
            const overflow = track.scrollWidth - stage.clientWidth;
            return overflow > 0 ? -(overflow + 48) : 0;
          },
          ease: "none",
          duration: 1 - WIPE_END - 0.06,
        },
        WIPE_END + 0.06
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion, isDesktop]);

  /**
   * Mobile only — the horizontal scroll progress bar.
   *
   * A passive listener coalesced into one rAF, writing a single `scaleX`. No
   * layout reads per frame beyond the scroller's own scroll metrics, and nothing
   * touches the vertical scroll at all.
   */
  useEffect(() => {
    if (isDesktop) return;

    const scroller = scrollerRef.current;
    const bar = barRef.current;
    if (!scroller || !bar) return;

    let frame = 0;

    const write = () => {
      frame = 0;
      const travel = scroller.scrollWidth - scroller.clientWidth;
      const progress = travel > 0 ? scroller.scrollLeft / travel : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0.06, progress))})`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    write();
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [isDesktop]);

  const headlineText = (
    <>
      Where every night becomes a <span className="text-orange">story.</span>
    </>
  );

  /*
    ── Mobile and reduced motion ───────────────────────────────────────────────
    Same markup for both. Reduced motion gets a section that simply does not move,
    which is the correct answer for it, and the phone build was never going to move
    on scroll anyway.
  */
  if (!isDesktop || reducedMotion) {
    return (
      <section ref={sectionRef} id="ambience" className="bg-navy">
        <video
          ref={videoRef}
          className="block h-[38svh] w-full object-cover"
          poster={HERO_VIDEO.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/*
          Flush against the video, square-cornered. A rounded, overlapping card
          was tried here and read as the panel sitting heavily on the loop; that
          treatment now lives on the Reservation section instead, where navy over
          this white block is the stronger contrast for it.
        */}
        <div className="bg-white py-10 text-navy">
          {/* Wraps on a phone by design — one line here would be unreadably small. */}
          <h2 className="max-w-xl px-5 font-display text-3xl leading-tight">
            {headlineText}
          </h2>

          {/* Native horizontal scroll with snap points. */}
          <div
            ref={scrollerRef}
            /*
              Three things here exist so a finger landing on a photo can still
              scroll the PAGE. Getting any one of them wrong traps the gesture.

              1. NO `data-lenis-prevent`. Lenis ships a stylesheet (imported by
                 globals.css) containing:

                     .lenis [data-lenis-prevent] { overscroll-behavior: contain; }

                 That is the shorthand, so it lands on BOTH axes, and
                 `overscroll-behavior-y: contain` means "never chain scrolling to
                 the parent" — a vertical swipe in here was forbidden from reaching
                 the page. At (0,2,0) it also outranks any single-class utility, so
                 it could not be overridden by adding `overscroll-y-auto`. The
                 attribute bought nothing anyway: Lenis runs on native touch
                 (`syncTouch: false`), so it never handles these gestures.

              2. `overflow-y-hidden`. Setting only `overflow-x: auto` does not
                 leave the other axis alone — per the CSS Overflow spec, when one
                 axis is non-`visible` and the other is `visible`, the visible one
                 computes to `auto`. This was silently a vertical scroll container
                 with zero scrollable height, swallowing upward swipes.

              3. NO `touch-action`. It stays at its default `auto`, which permits
                 every gesture. `touch-action` does NOT delegate — the browser
                 intersects the value down the ancestor chain from whatever the
                 finger lands on, and the STRICTEST value wins. So `pan-x` on this
                 strip does not mean "vertical belongs to the page", it means
                 "vertical panning is forbidden for this touch", page included.
                 Naming an axis here is how you trap the gesture, not how you free
                 it.

              `overscroll-x-contain` stays: a horizontal swipe running off the end
              should not chain sideways into browser back-navigation.

              ── Why the padding is 18vw and not 5 ──────────────────────────────

              This is a CENTRED carousel: the active card sits in the middle of the
              screen with an equal sliver of its neighbours either side. Three
              things have to agree for that, and it breaks if any one of them is
              off:

                card      64vw   `snap-center`, so it centres in the scrollport
                padding   18vw   = (100 - 64) / 2, the leftover split evenly
                gap        4     eats into each sliver equally

              The padding is what lets the FIRST and LAST cards reach the middle at
              all — without it they can only ever sit flush against an edge, which
              is what `snap-start` with `px-5` was doing.

              Snap is back to `mandatory` here. Proximity is gentler, but it lets a
              card rest half-centred, which defeats the whole point of a centred
              carousel. The heaviness that made proximity necessary before was the
              trapped vertical swipe, and that is fixed above.
            */
            className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-auto px-[18vw] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {AMBIENCE_GALLERY.map((item) => (
              // `snap-center`, not `snap-start` — see the geometry note above.
              <figure key={item.src} className="w-[64vw] shrink-0 snap-center">
                <div className="relative aspect-2/3 overflow-hidden rounded-2xl bg-navy/5">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    /* Kept in step with the card's `w-[64vw]` above. */
                    sizes="64vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            ))}
          </div>

          {/* Swipe progress. Transform only — the track never relayouts. */}
          <div className="mx-5 mt-5 h-px bg-navy/15">
            <div
              ref={barRef}
              className="h-px origin-left bg-orange"
              style={{ transform: "scaleX(0.06)" }}
            />
          </div>
        </div>
      </section>
    );
  }

  /* ── Desktop ──────────────────────────────────────────────────────────────── */
  return (
    <section ref={sectionRef} id="ambience" className="relative h-[420vh] bg-navy">
      <div ref={stageRef} className="sticky top-0 h-dvh w-full overflow-hidden bg-navy">
        {/* Beat 1 — the loop, full-bleed. */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={HERO_VIDEO.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/*
          Beats 2 + 3 — the panel wipes in from the right, carrying everything.

          ── The rounded leading edge, and why it is done with geometry ────────

          The left edge is rounded while it travels and square once it lands. The
          obvious way — tween border-radius to 0 as the wipe finishes — repaints
          a full-screen surface on every scrubbed frame, and CLAUDE.md allows only
          transform and opacity to animate. So nothing here animates at all:

            the panel is 3rem WIDER than the stage and sits 3rem to the LEFT of it
            (`-left-12` + `w-[calc(100%+3rem)]`), with a 3rem radius on that edge.

          While it slides, the curve is on screen. When `xPercent` reaches 0 the
          left 3rem — which is exactly the curve — sits past the stage's
          `overflow-hidden` edge, so what remains visible is a square edge. Same
          transform as before; the corner simply drives itself off the screen.

          `pl-12` on the panel puts the headline and the track back where they
          were. It lives on the panel, not the track, so `track.scrollWidth` and
          the overflow calculation below are unchanged.
        */}
        <div
          ref={panelRef}
          className="absolute inset-y-0 -left-12 z-10 flex w-[calc(100%+3rem)] flex-col justify-center gap-[6svh] rounded-l-[3rem] bg-white pl-12 text-navy will-change-transform"
        >
          {/*
            One line, always. `max-w-2xl` was what forced the wrap; the fluid size
            is capped so the longest the line ever gets is ~1170px against ~1820px
            of available width, which leaves room at every width from md up.
          */}
          <h2 className="px-12 font-display text-[clamp(1.75rem,4vw,4.5rem)] leading-[1.1] whitespace-nowrap">
            {headlineText}
          </h2>

          {/*
            Sized by HEIGHT, not width. The reference cards are a little over half
            the viewport tall with real air above and below; driving off height
            keeps that proportion on any aspect, and the width follows the assets'
            native 2:3 so nothing is cropped.
          */}
          <div
            ref={trackRef}
            className="flex items-center gap-10 pl-12 will-change-transform"
          >
            {AMBIENCE_GALLERY.map((item, i) => (
              <figure
                key={item.src}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="h-[52svh] w-[35svh] shrink-0"
              >
                <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-navy/5">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    /* Card width is height-derived, so this approximates it in vw
                       — `sizes` only picks a srcset candidate, it is not layout. */
                    sizes="(min-width: 1280px) 22vw, 34vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
