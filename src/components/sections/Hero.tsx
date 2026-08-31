"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { HERO_STILLS, HERO_VIDEO } from "@/lib/assets";
import { usePreload } from "@/hooks/usePreloader";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The opening. The first still arrives as a small rectangle and grows to fill the
 * screen before the cut cycle starts.
 *
 * Measured off the reference: the card holds at roughly 38% for about two fifths
 * of a second, then expands over another two thirds. `power3.inOut` matches the
 * shape of it — slow to leave, fastest through the middle, settling rather than
 * arriving hard.
 *
 * Only the FIRST frame does this. The other seven are already at scale 1 behind
 * it, so the cut at OPEN_TOTAL + 0.5s lands on a full-bleed still as before.
 *
 * It reads as a rectangle rather than a square because the square frame clips a
 * section-shaped inner (see the two-box note below) — at 0.38 you see the inner's
 * rectangle with the section's navy around it.
 */
/*
  Zero, and the pause you actually see is still about half a second.

  The card is visible well before this timeline starts. The loader's exit runs
  0.4s delay -> 0.3s fade -> 0.8s wipe, and `markRevealed()` only fires at the end
  of all of it. The wipe uncovers the middle of the screen — where the card sits —
  around halfway through, so roughly the last 0.4s of the wipe already shows the
  card sitting still:

    loader wipe   0.6s ─────────────────────► 1.4s   markRevealed
    card visible          ~1.0s ─────────────► 1.4s   (~0.4s, static)
    this hold                                 1.4s +  OPEN_HOLD
    zoom starts

  So any hold added here lands ON TOP of that. At the previous 0.35 the card sat
  still for roughly three quarters of a second; at 0 it is the wipe tail alone.
  If it ever needs to feel longer, raise this — but measure from when the card
  first appears, not from when this timeline starts.
*/
const OPEN_HOLD = 0;
const OPEN_SCALE = 0.38;
const OPEN_DURATION = 0.85;
const OPEN_TOTAL = OPEN_HOLD + OPEN_DURATION;

/** Seconds each still holds before the cut. 8 x 0.5 = the 4s cycle. */
const STEP = 0.5;
const CYCLE_TOTAL = OPEN_TOTAL + STEP * HERO_STILLS.length;

/**
 * How far a still pushes in across its own hold.
 *
 * Kept deliberately small. At full-bleed the frame is already the whole screen, so
 * a few percent of drift is plainly visible — anything heavier stops reading as a
 * camera move and starts reading as the image lurching.
 */
const KEN_BURNS_SCALE = 1.04;

/** How long any single still takes to travel from full-bleed to its corner slot. */
const COLLAPSE_DURATION = 0.75;

/**
 * Gap between one still leaving and the next one behind it following.
 * This delay IS the nested-frames effect — see the timeline note below.
 */
const STAGGER_DESKTOP = 0.055;
const STAGGER_MOBILE = 0.07;

/**
 * Which stills stay parked in the corner: the FIRST three, hero-01 through -03,
 * top to bottom. They are the outermost frames during the cascade, so the column
 * resolves out of the frames that arrive last while the inner ones dissolve.
 */
const SLOT_COUNT = 3;

/** Start the loop a beat before the collapse so it is already running when revealed. */
const VIDEO_LEAD = 0.4;

/** Promote layers slightly before they move, so the promotion itself never hitches. */
const PROMOTE_LEAD = 0.35;

/** Geometry of the parked column, resolved per viewport. */
type Slots = {
  /** Uniform scale that takes a full-bleed square down to one thumbnail. */
  scale: number;
  /** Inner scale at rest, so the picture still covers the square. See `measure`. */
  fill: number;
  /** Screen-space centre of each slot, index 0 = top of the column. */
  centers: { x: number; y: number }[];
};

/**
 * Section 2 — Hero. Three phases, no navbar, no text, no UI of any kind.
 *
 *   0.0s - 4.0s   eight stills, each pushing in slowly across its own 0.5s hold,
 *                 then hard-cut to the next (opacity 0/1, duration 0 — never a fade)
 *   4.0s - 5.1s   every still collapses toward the bottom-left, staggered
 *   5.1s onward   the loop video, already playing underneath, is fully revealed;
 *                 three square thumbnails stay parked in the bottom-left corner
 *
 * ── Why the hero is half-height on mobile ──────────────────────────────────
 *
 * The loop is 2.22:1. Filling a portrait phone with it means `object-cover` scales
 * it to the viewport HEIGHT, which throws away roughly four fifths of the frame.
 * At half height the box is close to square and about twice as much survives.
 * Desktop keeps the full viewport, where the aspect mismatch is small.
 *
 * The frame squares and the inner boxes below are sized off the SAME two heights.
 * If one changes, all three have to change with it.
 *
 * ── The two nested boxes, and why the picture is not in the square ─────────
 *
 * Each still is TWO elements:
 *
 *   frame — a square, side max(section width, section height), clipping.
 *   inner — exactly section-sized, centred in that square, holding the picture.
 *
 * The square exists only so the parked thumbnail is square on every device: a box
 * scaled uniformly keeps its aspect, so anything section-shaped would park as a
 * landscape tile on a laptop and a portrait one on a phone.
 *
 * But the PICTURE must not live in the square. `object-cover` into a 1920x1920 box
 * shows about 67% of a 2400x1600 photo's width; into the real 1920x930 section it
 * shows all of it. Putting the picture in a section-shaped inner box is what keeps
 * the full-bleed phase from looking permanently zoomed in.
 *
 * The cost is that at rest the inner no longer covers the square — its short side
 * is short by exactly max/min of the section's dimensions. So the collapse scales
 * the inner UP by that ratio (`fill`) while the frame scales down. The picture ends
 * up cropped square and full, and the whole thing is still transforms only.
 *
 * Both boxes are centred by GRID, with explicit `grid-cols-1 grid-rows-1` tracks.
 * That is load-bearing: without them the implicit row SIZES TO THE ITEM, so a
 * square taller than its container makes a row taller than its container, and
 * centring happens against the row instead of against the section. On desktop that
 * put the frames' centre ~495px below the section's, and the parked column landed
 * off-screen. `1fr` tracks are always the container's size, so an oversized item
 * overflows symmetrically and its centre stays put.
 *
 * ── Why the collapse is staggered, and not one wrapper scaling ──────────────
 *
 * The reference pulls the camera back through a stack of images: the picture you
 * were just looking at shrinks first, and the ones shown before it are revealed
 * around it as a series of nested frames, each larger than the last.
 *
 * That is not a zoom. It is eight separate collapses fired a few frames apart,
 * newest first. At any instant still 7 has travelled furthest (smallest), still 6
 * slightly less (larger, framing it), still 5 less again — so the stack reads as
 * concentric frames converging on the corner. DOM order gives us the paint order
 * for free: still 7 is last in the map, so it is on top, which is exactly where
 * the innermost frame belongs.
 *
 * Only transform and opacity are ever animated.
 */
export function Hero() {
  const { registerStill, registerVideo, revealed } = usePreload();
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasRun = useRef(false);
  const videoStarted = useRef(false);

  /**
   * Pick the encode in JS and assign it directly, so exactly ONE file is fetched.
   * The server renders no `src` at all — shipping two <source> tags would let the
   * browser choose on MIME type rather than breakpoint, and rendering the mobile
   * src during hydration would make desktop start the wrong download.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const desktop = window.matchMedia(`(min-width: ${HERO_VIDEO.breakpoint}px)`).matches;
    const chosen = desktop ? HERO_VIDEO.desktop : HERO_VIDEO.mobile;
    if (video.getAttribute("src") !== chosen) {
      video.setAttribute("src", chosen);
      video.load();
    }

    // Registered only AFTER src is set — the preloader calls load() on it.
    registerVideo(video);

    /*
      Pause the loop once the hero scrolls away.

      Without this a 1080p video decodes continuously for the entire page — the
      whole time you are reading About, the gallery, the form. That is a constant
      CPU/GPU cost for something nobody can see, and it is the kind of background
      drain that shows up as stutter in whatever section you ARE looking at.
    */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
        } else if (videoStarted.current) {
          video.play().catch(() => {
            /* autoplay refused — poster stays */
          });
        }
      },
      { threshold: 0.01 }
    );
    io.observe(video);

    return () => {
      io.disconnect();
      registerVideo(null);
    };
  }, [registerVideo]);

  useEffect(() => {
    if (!revealed || hasRun.current) return;

    const section = sectionRef.current;
    const video = videoRef.current;
    const frames = frameRefs.current.filter(Boolean) as HTMLDivElement[];
    const inners = innerRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!section || frames.length !== HERO_STILLS.length) return;

    hasRun.current = true;

    /**
     * Autoplay can be refused (low-power mode, some mobile browsers). Swallow the
     * rejection and leave the poster showing rather than throwing.
     */
    const startVideo = () => {
      videoStarted.current = true;
      video?.play().catch(() => {
        /* poster stays visible — nothing else to do */
      });
    };

    /**
     * Resolve the parked column against the live section.
     *
     * Measured off the section, not the window: the section is half-height on
     * mobile, so window height would put the column below the fold entirely.
     */
    const measure = (): Slots => {
      const w = section.clientWidth;
      const h = section.clientHeight;
      /** Side of the square frame, as laid out by the arbitrary widths below. */
      const side = frames[0].offsetWidth || Math.max(w, h);

      // Thumbnail tracks the SHORT edge so it stays proportionate on a phone and on
      // a wide desktop alike, clamped so it is never a postage stamp or a poster.
      const thumb = Math.round(Math.min(132, Math.max(56, Math.min(w, h) * 0.13)));
      const gap = Math.round(thumb * 0.11);
      const padX = w < 768 ? 16 : 40;
      const padY = w < 768 ? 16 : 40;

      const centers = Array.from({ length: SLOT_COUNT }, (_, j) => ({
        x: padX + thumb / 2,
        // j = 0 is the top of the column, so it sits the most slots above the floor.
        y: h - padY - thumb / 2 - (SLOT_COUNT - 1 - j) * (thumb + gap),
      }));

      return {
        scale: thumb / side,
        // The inner is section-shaped, so its short side falls short of the square
        // by exactly this ratio. 1% over so rounding can never leave a hairline.
        fill: (side / Math.min(w, h)) * 1.01,
        centers,
      };
    };

    /**
     * GSAP composes `translate(x, y) scale(s)`, and CSS applies the translate in the
     * PARENT's space — so x/y stay in unscaled screen pixels no matter the scale.
     * The frame is centred by the grid, so its centre starts at the middle of the
     * section and x/y are simply the offset from there.
     */
    const toCenter = (c: { x: number; y: number }) => ({
      x: c.x - section.clientWidth / 2,
      y: c.y - section.clientHeight / 2,
    });

    // Reduced motion: no cycle, no push-in, no cascade. Land on the settled state
    // and leave the poster up rather than autoplaying motion at someone who asked
    // for none.
    if (reducedMotion) {
      const { scale, fill, centers } = measure();
      // No intro to hide it behind, so the video (its poster) is simply present.
      gsap.set(video, { opacity: 1 });
      gsap.set(frames, { autoAlpha: 0 });
      gsap.set(inners, { scale: 1 });
      for (let j = 0; j < SLOT_COUNT; j++) {
        gsap.set(frames[j], {
          autoAlpha: 1,
          scale,
          ...toCenter(centers[j]),
          force3D: true,
        });
        gsap.set(inners[j], { scale: fill, force3D: true });
      }
      return;
    }

    const mm = gsap.matchMedia();

    const build = (stagger: number) => {
      const { scale, fill, centers } = measure();

      gsap.set(frames, {
        force3D: true,
        scale: 1,
        x: 0,
        y: 0,
        autoAlpha: 0,
        willChange: "auto",
      });
      gsap.set(inners, { scale: 1, force3D: true });
      gsap.set(frames[0], { autoAlpha: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          // Nothing else will move; release every compositor layer we asked for.
          gsap.set(frames, { willChange: "auto" });
          gsap.set(inners, { willChange: "auto" });
        },
      });

      /*
        ── Phase 1 — push in, then cut.

        Each still scales up across its own hold with ease "none", so the motion is
        a constant drift rather than something that eases to a stop, and the cut
        lands while it is still moving.
      */
      /*
        ── Phase 0 — the opening card.

        The first frame starts small and grows to full bleed. Everything after it
        is offset by OPEN_TOTAL so the cut cycle begins the instant this lands.
      */
      tl.set(frames[0], { scale: OPEN_SCALE }, 0);
      tl.to(
        frames[0],
        {
          scale: 1,
          duration: OPEN_DURATION,
          ease: "power3.inOut",
          force3D: true,
        },
        OPEN_HOLD
      );

      HERO_STILLS.forEach((_, i) => {
        const at = OPEN_TOTAL + i * STEP;
        if (i > 0) {
          tl.set(frames[i - 1], { autoAlpha: 0 }, at);
          tl.set(frames[i], { autoAlpha: 1 }, at);
        }
        tl.set(inners[i], { willChange: "transform" }, Math.max(0, at - 0.1));
        tl.to(
          inners[i],
          { scale: KEN_BURNS_SCALE, duration: STEP, ease: "none", force3D: true },
          at
        );
      });

      // Promote the travelling frames before they move, not as they start.
      tl.set(frames, { willChange: "transform" }, CYCLE_TOTAL - PROMOTE_LEAD);

      /*
        Bring the video up from the inline `opacity: 0` it renders with. This
        happens while the stills still cover the whole screen, so the fade itself
        is never visible — by the time the collapse uncovers it, it is simply
        there and already playing.
      */
      tl.to(
        video,
        { opacity: 1, duration: 0.3, ease: "none" },
        CYCLE_TOTAL - VIDEO_LEAD
      );

      tl.call(startVideo, undefined, CYCLE_TOTAL - VIDEO_LEAD);

      /*
        ── Phase 2 — the cascade.

        Everything becomes visible at once. The newest still is already full-bleed
        and on top, so nothing pops: the ones behind it are simply uncovered as it
        leaves.
      */
      tl.set(frames, { autoAlpha: 1 }, CYCLE_TOTAL);

      frames.forEach((frame, i) => {
        // Newest leads, oldest trails — that ordering is what nests the frames.
        const delay = (frames.length - 1 - i) * stagger;
        const parks = i < SLOT_COUNT;
        const target = centers[parks ? i : SLOT_COUNT - 1];
        const at = CYCLE_TOTAL + delay;

        tl.to(
          frame,
          {
            scale,
            ...toCenter(target),
            duration: COLLAPSE_DURATION,
            ease: "expo.out",
            force3D: true,
          },
          at
        );

        // The picture grows into the square as the square shrinks around it, so the
        // thumbnail ends up a full, square crop. Same curve, so they stay locked.
        tl.to(
          inners[i],
          { scale: fill, duration: COLLAPSE_DURATION, ease: "expo.out", force3D: true },
          at
        );

        // Stills with no slot exist only to build the nesting on the way in. Fade
        // them mid-flight so the column resolves to exactly three.
        if (!parks) {
          tl.to(
            frame,
            { autoAlpha: 0, duration: 0.35, ease: "power1.out" },
            at + 0.3
          );
        }
      });
    };

    mm.add("(min-width: 768px)", () => build(STAGGER_DESKTOP));
    mm.add("(max-width: 767px)", () => build(STAGGER_MOBILE));

    return () => {
      mm.revert();
      hasRun.current = false;
    };
  }, [revealed, reducedMotion]);

  return (
    /*
      Half height on a phone, full viewport from `md` up — see the aspect note in
      the block comment. `svh` rather than `dvh` on mobile deliberately: `dvh`
      changes as the URL bar hides, which would resize the section mid-timeline and
      leave the parked column measured against a height that no longer exists.
    */
    <section
      ref={sectionRef}
      id="hero"
      /*
        Half height on a phone so the About deck's opening word shares the first
        screen with it; full viewport from `md` up.

        Plain `relative`, never sticky and never static. It scrolls away normally —
        About lifts its own content up into centre as that happens (see the "lift"
        note in About.tsx). And it must stay a positioned ancestor: everything
        inside is `absolute inset-0`, so making it static would send those children
        to the next positioned ancestor and stretch the video to that box's height.
      */
      /*
        White, not navy. The opening card is smaller than the screen, so whatever
        this section's ground is becomes the field the card sits on — and the brief
        is a white field, matching the loader handing over to a clean page.
      */
      className="relative h-[50svh] w-full overflow-hidden bg-white md:h-dvh"
    >
      {/*
        Phase 3. Sits underneath the stills for the whole intro and is absolutely
        positioned inside a fixed-height section, so it reserves its own space and
        contributes zero CLS. `src` is assigned in JS — see the effect above.

        Starts at `opacity: 0`, inline, so it is invisible from first paint. It is
        full-bleed and sits behind everything, so without this its poster frame
        would be the backdrop the opening card grows against — the video showing
        through before the intro has even begun. It is faded up later, while the
        stills still cover the screen, so the reveal itself is never seen.

        Plain `opacity` rather than `autoAlpha` deliberately: `visibility: hidden`
        risks the browser deprioritising a video the preloader is gating on.
      */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={HERO_VIDEO.poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        style={{ opacity: 0 }}
      />

      {/*
        Phases 1 + 2. The explicit `grid-cols-1 grid-rows-1` on both this container
        and each frame is load-bearing, not decoration — see the grid note in the
        block comment above.
      */}
      <div className="absolute inset-0 grid grid-cols-1 grid-rows-1 place-items-center">
        {HERO_STILLS.map((still, i) => (
          <div
            key={still.src}
            ref={(el) => {
              frameRefs.current[i] = el;
            }}
            className="col-start-1 row-start-1 grid h-[max(100vw,50svh)] w-[max(100vw,50svh)] grid-cols-1 grid-rows-1 place-items-center overflow-hidden md:h-[max(100vw,100dvh)] md:w-[max(100vw,100dvh)]"
            /*
              The first frame is ALSO scaled down inline, not just in the timeline.

              The loader wipes upward for 0.8s and the hero is visible underneath
              it the whole time. Without this the first still paints full-bleed,
              then GSAP snaps it to 0.38 the instant `revealed` fires — you see the
              image, then the video behind it, then the image again. Matching the
              timeline's opening value here means the card is already small on the
              very first paint and the zoom is the only movement.

              A scale is safe to hand GSAP this way — unlike a percentage translate,
              it survives the computed-matrix round trip unambiguously.
            */
            style={{
              opacity: i === 0 ? 1 : 0,
              transform: i === 0 ? `scale(${OPEN_SCALE})` : undefined,
            }}
          >
            {/* Section-shaped, so the full-bleed crop is the section's, not the
                square's. Carries both the push-in and the fill-out. */}
            <div
              ref={(el) => {
                innerRefs.current[i] = el;
              }}
              className="relative col-start-1 row-start-1 h-[50svh] w-screen md:h-dvh"
            >
              <Image
                ref={(el) => registerStill(i, el)}
                src={still.src}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                loading={i === 0 ? undefined : "eager"}
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
