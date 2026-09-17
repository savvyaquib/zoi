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
 *   white -> navy -> blue -> white
 *
 * Light, then dark, then a cooler dark, then back to light. It opens and closes
 * on the same ground, so the deck reads as a single arc that returns home rather
 * than ending somewhere new — and the two darks in the middle mean the eye is
 * never thrown straight from white to a saturated accent. The accent carries
 * through from the word to the tagline on each slide, so the colour rotates
 * independently of the ground.
 *
 * Every pairing clears WCAG AA for body text at these sizes (the display word is
 * far past it): navy-on-white ~17:1, orange-on-navy ~6.5:1, white-on-blue ~5.4:1.
 * The body tints are held above 4.5:1 on their ground.
 *
 * Copy is the client's own, verbatim — see the brand notes. Each beat is one
 * word, one tagline, one paragraph.
 */
const SLIDES = [
  {
    word: "Global Cuisine",
    tagline: "Flavours without borders.",
    body:
      "Zoi brings together global cuisine, familiar favourites and unexpected flavours in a menu made for every kind of occasion. Thoughtfully crafted food, cocktails and beverages come together in a dining experience that can be as relaxed, indulgent or celebratory as you want it to be.",
    bg: "bg-white",
    accent: "text-navy",
    body_: "text-navy/70",
  },
  {
    word: "Hospitality",
    tagline: "A space that meets you where you are.",
    body:
      "Zoi changes with you. Bright and easy over lunch, warm and intimate as the evening unfolds, and full of energy when the night comes alive. Thoughtful service, an evolving ambience and a culture built around making people feel comfortable make Zoi a space for family dinners, coffee dates, meetings, solo moments, work and everything in between.",
    bg: "bg-navy",
    accent: "text-orange",
    body_: "text-white/75",
  },
  {
    word: "Experiences",
    tagline: "Every visit can become a story.",
    body:
      "Some evenings call for a great meal. Some call for music, celebration and a little more energy. From curated events and live entertainment to intimate celebrations and nights that turn into something unexpected, Zoi creates experiences designed to be felt — not simply attended. Because what stays with you is rarely just what you ate or where you went, but how you felt while you were there.",
    bg: "bg-blue",
    accent: "text-white",
    body_: "text-white/85",
  },
  {
    word: "Community",
    tagline: "Come as you are. Stay for the feeling.",
    body:
      "Zoi is a space for everyone — and every version of you. A quiet dinner with your family. Your first coffee date. Drinks with friends. A meeting between two busy days. A moment alone. A celebration that brings everyone together. We believe the places we love are shaped by the people who fill them, and Zoi is built to make every person feel welcomed, acknowledged and part of something.",
    bg: "bg-white",
    accent: "text-navy",
    body_: "text-navy/70",
  },
] as const;

/**
 * ── The beat, as fractions of each slide's one-unit window ──────────────────
 *
 *   0.00 ─ 0.12   the word, at rest
 *   0.12 ─ 0.48   the morph: the word shrinks away, the tagline grows into it
 *   0.48 ─ 0.86   the copy, at rest  ← the read
 *   0.86 ─ 1.00   the next ground rises over this one
 *
 * The morph is deliberately long enough to be WATCHED — over a third of the
 * beat, ~40svh of scroll — because it is the section's one piece of
 * choreography: the word visibly becoming smaller while the tagline visibly
 * becomes larger. A short morph read as a cut. This one reads as a move.
 *
 * It does not conflict with the snap. Rest points sit at both ends of the
 * morph, so a stop in the middle is carried to a side — and the scrubbed
 * timeline then plays the remainder out at its own pace, which is exactly the
 * animation the visitor was meant to see.
 */
const WORD_HOLD = 0.12;
const MORPH = 0.36;
const CROSSFADE_AT = 0.86;
const CROSSFADE = 1 - CROSSFADE_AT;

/**
 * How far behind the scroll the timeline runs, in seconds.
 *
 * This is what makes a snap feel like an animation rather than a jump. On a
 * phone the browser lands the fling on a rest point in one motion; the
 * timeline then eases across whatever it was carried over — a whole morph, if
 * the stop was mid-way — over this duration. 0.8 is long enough to be seen and
 * short enough that a continuous scroll still feels attached to the finger.
 */
const SCRUB_SECONDS = 0.8;

/** Set on <html> while the deck is pinned; globals.css keys the mobile snap off it. */
const SNAP_CLASS = "about-snap";

/**
 * Where the deck is allowed to come to rest, per slide.
 *
 * The ends of each transition, so a scroll that stops mid-morph or
 * mid-crossfade is carried to the nearer side and never parks on a half-sized
 * word over a half-faded paragraph. Inside a rest nothing moves, so a stop
 * anywhere in one is already a clean frame — the browser may still nudge to a
 * marker there, and the nudge is invisible because the stage is pinned.
 *
 * Exported as fractions of the whole timeline (SLIDES.length units) because two
 * consumers need them: the mobile CSS snap markers rendered into the section,
 * and the desktop Lenis settle.
 */
const REST_POINTS: number[] = (() => {
  const points = new Set<number>([0]);
  SLIDES.forEach((_, i) => {
    points.add(i + WORD_HOLD);
    points.add(i + WORD_HOLD + MORPH);
    points.add(i + CROSSFADE_AT);
    points.add(i + 1);
  });
  return [...points].map((p) => Math.min(1, p / SLIDES.length)).sort((a, b) => a - b);
})();

/** Quiet time after scrolling stops before the deck settles onto a beat. */
const SETTLE_DELAY_MS = 140;
/** How long the settle itself takes. Short — it is a nudge, not a journey. */
const SETTLE_DURATION = 0.55;
/** Already within this many pixels of a rest point: leave it alone. */
const SETTLE_EPSILON = 2;

/**
 * Section — About. Four word-to-copy beats on a pinned stage.
 *
 * ── Layout: the word and the copy share one cell ────────────────────────────
 *
 * Both sit in the same grid cell, each centred on its own. Neither takes
 * layout room from the other, so the word is dead-centre when it is alone and
 * the copy is dead-centre when it is alone. The morph moves them only with
 * transform. Stacking them in a column would push the word up by half the
 * paragraph's height on every slide — noticeable once the paragraph is seventy
 * words.
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
 * CLAUDE.md forbids animating font-size, so all text is rendered at its FINAL
 * size and moved only with transform. Everything only ever scales DOWN from its
 * laid-out size, which is what keeps it crisp — text scaled above 1 renders soft.
 *
 * ── Snap: two mechanisms, one per input ─────────────────────────────────────
 *
 * On a phone, CSS scroll-snap. Lenis leaves touch on native scroll, so the
 * browser owns the fling — and native snap is computed INSIDE the fling, the
 * same way the Ambience carousel lands on a card. Invisible 1px markers are
 * rendered into the section at every rest point with `snap-start`, and
 * globals.css turns on `scroll-snap-type: y proximity` for the root below `md`
 * — but only while <html> carries SNAP_CLASS, which the ScrollTrigger toggles
 * as the deck pins and unpins. Outside the deck there is no snap at all, so the
 * hero scrolls away under native momentum. Proximity, never mandatory:
 * mandatory on the root would drag the page back to the nearest marker from
 * anywhere on the site.
 *
 * On desktop, the hand-rolled Lenis settle further down. Lenis writes scrollTop
 * every frame there, so CSS snap would fight it — the settle routes the nudge
 * through Lenis instead, which keeps it the single writer.
 *
 * Performance notes, because this section is the one that used to stutter:
 *
 *  - panels use autoAlpha, not opacity. An opacity-0 layer is still painted and
 *    composited every frame; visibility:hidden drops it from the pipeline entirely.
 *    Three of the four panels are therefore doing no work at any given moment.
 *  - no blanket `will-change`. Twelve permanently-promoted layers carrying display
 *    type is a lot of GPU memory and compositing cost for elements that are idle
 *    most of the time. GSAP's force3D promotes each element only while its own
 *    tween is actually running.
 *  - `scrub` is a number, not `true`. That decouples the timeline from raw scroll
 *    events and lets it catch up smoothly instead of jumping on every delta.
 */
export function About() {
  const reducedMotion = useReducedMotion();
  const lenisRef = useLenisRef();
  const sectionRef = useRef<HTMLElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (reducedMotion) return;

    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slides.length === 0 || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      /*
        Built paused and attached to the ScrollTrigger afterwards, rather than
        passing `scrollTrigger` inline. That ordering is what lets the settle
        below be derived from the timeline's REAL duration instead of a hand-kept
        copy of it that would drift the moment a constant above changes.
      */
      const tl = gsap.timeline({ paused: true });

      slides.forEach((slide, i) => {
        const word = slide.querySelector<HTMLElement>("[data-word]");
        const tagline = slide.querySelector<HTMLElement>("[data-tagline]");
        const body = slide.querySelector<HTMLElement>("[data-body]");
        if (!word || !tagline || !body) return;

        gsap.set(slide, { autoAlpha: i === 0 ? 1 : 0 });

        const at = i + WORD_HOLD;

        /*
          ── One path ──────────────────────────────────────────────────────

          The copy block — tagline over paragraph — is centred as a whole, so
          the tagline's resting place is half a paragraph ABOVE where the word
          rests. Left alone, the tagline would appear above the shrinking word
          and the two would read as a stack, not a handover.

          So the tagline starts AT the word's centre and rises to its rest as
          it grows, and the word rises along the same line as it shrinks —
          finishing, invisible, exactly where the tagline now stands. One
          upward motion in which the big word turns into the small line.

          `dy` is measured from layout (offsetTop ignores transforms), as a
          function so invalidateOnRefresh re-reads it after a resize or a font
          swap changes the paragraph's height.
        */
        const dy = () =>
          word.offsetTop + word.offsetHeight / 2 - (tagline.offsetTop + tagline.offsetHeight / 2);

        /*
          Size and opacity are separate tweens on purpose. If the word faded at
          the same rate it shrank, it would be half-gone before it had visibly
          got any smaller and the shrink would never register. It holds full
          opacity for the first quarter — you WATCH it start to become small —
          then dissolves over the next third, so by the time the tagline has its
          full size the word is a ghost behind it, not a second line on top.
        */
        tl.fromTo(
          word,
          { scale: 1, y: 0 },
          { scale: 0.28, y: () => -dy(), duration: MORPH, ease: "power2.inOut", force3D: true },
          at
        );
        tl.fromTo(
          word,
          { opacity: 1 },
          { opacity: 0, duration: MORPH * 0.35, ease: "power1.inOut" },
          at + MORPH * 0.25
        );

        // The tagline grows out of the word's centre and rises into its own.
        tl.fromTo(
          tagline,
          { scale: 0.32, y: () => dy() },
          { scale: 1, y: 0, duration: MORPH, ease: "power2.inOut", force3D: true },
          at
        );
        tl.fromTo(
          tagline,
          { opacity: 0 },
          { opacity: 1, duration: MORPH * 0.45, ease: "power1.out" },
          at + MORPH * 0.15
        );

        // The paragraph settles in beneath it once the tagline has most of its
        // size — so the eye lands on the tagline first and the reading order is
        // the visual order.
        tl.fromTo(
          body,
          { y: "3vh", opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: MORPH * 0.45,
            ease: "power2.out",
            force3D: true,
          },
          at + MORPH * 0.55
        );

        const next = slides[i + 1];
        if (!next) return;

        // The next ground rises over this one — see the crossfade note above.
        tl.fromTo(
          next,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: CROSSFADE,
            ease: "power1.inOut",
          },
          i + CROSSFADE_AT
        );

        // Fully covered by now, so dropping it is invisible — and it takes one
        // more full-screen layer out of the compositor for the rest of the scroll.
        tl.set(slide, { autoAlpha: 0 }, i + CROSSFADE_AT + CROSSFADE);
      });

      /*
        Pin the timeline's length to exactly SLIDES.length units. Without this
        the last slide's copy-rest — which has no crossfade after it to mark its
        end — would be cut off at the morph, and every REST_POINT fraction would
        be scaled against the wrong total.
      */
      tl.set({}, {}, SLIDES.length);

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB_SECONDS,
        animation: tl,
        invalidateOnRefresh: true,
        /*
          Arms the mobile snap ONLY while the deck is pinned.

          Left on permanently, the root's `scroll-snap-type` was live while the
          hero was still on screen, and a flick from the hero was caught by the
          deck's first marker — the page leapt the rest of the way and the hero
          appeared to be thrown off the top. With the class toggled here the
          hero scrolls out under native momentum, untouched, and the snap exists
          only once there is something to snap between.

          The first marker sits at progress 0, exactly where this fires, so
          arming the snap never moves the page by more than the few pixels the
          scroll has already travelled past the trigger.
        */
        onToggle: (self) => {
          document.documentElement.classList.toggle(SNAP_CLASS, self.isActive);
        },
      });

      /*
        The lift — mobile only. See the note on the element itself.

        Tied to the HERO's scroll range rather than a hand-picked distance, so the
        word finishes arriving at centre exactly as the hero clears the top of the
        screen however tall the hero happens to be. `yPercent` keeps it resolution
        independent, and `ease: "none"` keeps it locked 1:1 to the scroll instead
        of easing ahead of or behind the hero.

        This runs entirely BEFORE `st` becomes active, so it never competes with
        the slide timeline or with the snap settle (which bails unless `st` is
        active).
      */
      const mm = gsap.matchMedia();
      mm.add("(max-width: 767px)", () => {
        const hero = document.getElementById("hero");
        const lift = liftRef.current;
        if (!hero || !lift) return;

        /*
          `y: 0` is pinned in BOTH states on purpose, and removing it breaks this.

          GSAP reads an element's starting transform from getComputedStyle, which
          reports a MATRIX — percentages are already resolved to pixels by then. So
          the CSS `translateY(-25%)` on this element is read as `y: -233px`, not as
          `yPercent: -25`. Those are separate, additive channels: animating only
          yPercent would leave that -233px in place forever, and the word would
          settle a quarter-screen high instead of centred.

          Declaring `y: 0` tells GSAP the pixel channel is zero, so yPercent alone
          drives the move and it genuinely lands at centre.

          `scrub: true` rather than a number: this is meant to track the hero 1:1.
          A scrub delay makes the text lag the finger, which is the "heavy" feel —
          here the text should move exactly as much as the hero does.
        */
        gsap.fromTo(
          lift,
          { yPercent: -25, y: 0 },
          {
            yPercent: 0,
            y: 0,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
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

        Desktop only. A phone gets native CSS snap instead — see the section note.
        A JS settle firing 140ms after a finger lifts pulls against a fling the
        visitor is still watching, which is the "heavy" feel; native snap is
        computed inside the fling and never fights it.
      */
      const canSettle = window.matchMedia("(min-width: 768px)").matches;

      const settle = () => {
        const lenis = lenisRef.current;
        if (!canSettle || !st.isActive) return;

        const progress = st.progress;
        const nearest = REST_POINTS.reduce((best, p) =>
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

    return () => {
      ctx.revert();
      // revert() kills the trigger without firing onToggle — drop the class by hand.
      document.documentElement.classList.remove(SNAP_CLASS);
    };
  }, [reducedMotion, lenisRef]);

  // Reduced motion: a plain vertical stack of static panels, no pin, no transforms.
  // Each keeps its own colour pairing, so the sequence still reads as designed.
  if (reducedMotion) {
    return (
      <section id="about">
        {SLIDES.map((slide) => (
          <div
            key={slide.word}
            className={`flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-24 text-center ${slide.bg}`}
          >
            <h2
              className={`font-display text-[12vw] leading-[0.95] uppercase text-balance ${slide.accent} md:text-[8vw]`}
            >
              {slide.word}
            </h2>
            <p
              className={`max-w-2xl font-display text-[6.5vw] leading-tight text-balance ${slide.accent} md:text-[3vw]`}
            >
              {slide.tagline}
            </p>
            <p
              className={`max-w-md font-sans text-[4.2vw] leading-relaxed text-pretty md:max-w-xl md:text-lg ${slide.body_}`}
            >
              {slide.body}
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

      Taller than before — 550svh / 600vh against 400 / 450 — because the copy
      rest is now half of every beat and a seventy-word paragraph needs scroll
      distance to be read at a walking pace. Per beat that is ~56svh of scroll
      spent on the paragraph.
    */
    <section
      ref={sectionRef}
      id="about"
      className={`relative z-0 h-[550svh] md:h-[600vh] ${SLIDES[0].bg}`}
    >
      {/*
        The mobile snap markers. One per rest point, placed at the scroll offset
        that corresponds to it: a timeline fraction p maps to scrollY = section
        top + p × (section height − stage height), and `100% − 100dvh` is
        exactly that range as this element's containing block sees it. A marker
        with `snap-start` snaps its own top to the scrollport's top, which lands
        the timeline on p. They are inert on desktop because the root's
        `scroll-snap-type` is only set below `md` (globals.css).
      */}
      {REST_POINTS.map((p) => (
        <div
          key={p}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 h-px w-px snap-start"
          style={{ top: `calc(${p} * (100% - 100dvh))` }}
        />
      ))}

      <div className="sticky top-0 h-dvh overflow-hidden">
        {/*
          The "lift".

          On a phone the hero is half height, so at rest this stage's top sits at
          50svh and its centred content would fall at 100svh — off the bottom of
          the screen. Starting the content a quarter of the stage higher puts it in
          the middle of the visible bottom half instead, which is the composition
          you see before scrolling.

          As the hero scrolls away the lift eases back to 0, so the word glides up
          into the centre of the screen exactly as the hero clears it — one
          continuous move rather than the content snapping into place once the pin
          engages. Driven off the HERO's own scroll range, so the two are locked
          together by construction.

          The offset is repeated in CSS as well as in the tween because this
          section is server rendered — without it the first paint would put the
          word off-screen for a frame before GSAP takes over.

          It is written as an arbitrary `transform`, NOT `-translate-y-1/4`.
          Tailwind v4 compiles its translate utilities to the separate `translate`
          property, which COMPOSES with `transform` rather than replacing it — so
          the class and GSAP's inline `transform` would both apply and the content
          would sit twice as high as intended. Same property, no stacking.
        */}
        <div
          ref={liftRef}
          /*
            No `will-change` here. This wrapper holds four full-screen panels, so
            promoting it permanently keeps a viewport-sized layer of display type
            in GPU memory for the life of the page. GSAP's `force3D` promotes it
            only while the lift is actually running, which is the ~50svh it takes
            the hero to leave.
          */
          className="absolute inset-0 [transform:translateY(-25%)] md:[transform:none]"
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.word}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              /*
                One cell, two occupants — see the layout note above. `px-6` keeps
                the paragraph off the edges on a 375px phone; the paragraph's own
                max-width does the rest.
              */
              className={`absolute inset-0 grid grid-cols-1 grid-rows-1 place-items-center px-6 text-center ${slide.bg}`}
              /* Matches the autoAlpha start state so there is no flash of all four
                 words stacked on top of each other before the effect runs. */
              style={{
                opacity: i === 0 ? 1 : 0,
                visibility: i === 0 ? "visible" : "hidden",
              }}
            >
              {/*
                Uppercase via CSS, not in the copy — the client wrote the headings
                in caps and the paragraphs in sentence case, and the accessible
                name should read as words, not shouting. `text-balance` splits
                "Global Cuisine" evenly when it has to wrap on a phone.
              */}
              <h2
                data-word
                className={`col-start-1 row-start-1 font-display text-[12vw] leading-[0.95] uppercase text-balance ${slide.accent} md:text-[8vw]`}
              >
                {slide.word}
              </h2>

              {/*
                Starts invisible — the inline opacity matches the tween's `from`
                so the first paint of a slide never shows both states at once.
              */}
              <div
                className="col-start-1 row-start-1 flex max-w-md flex-col items-center gap-5 md:max-w-2xl md:gap-7"
              >
                <p
                  data-tagline
                  style={{ opacity: 0 }}
                  className={`font-display text-[6.5vw] leading-tight text-balance ${slide.accent} md:text-[3vw]`}
                >
                  {slide.tagline}
                </p>
                <p
                  data-body
                  style={{ opacity: 0 }}
                  className={`font-sans text-[4.2vw] leading-relaxed text-pretty md:max-w-xl md:text-lg ${slide.body_}`}
                >
                  {slide.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
