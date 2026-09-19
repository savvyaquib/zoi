"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { BRAND, VENUE } from "@/lib/assets";
import { HOME_LINK, NAV_LINKS, hashOf } from "@/lib/links";
import { useLenisRef } from "@/components/SmoothScroll";
import { InstagramIcon } from "@/components/InstagramIcon";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const OPEN_DURATION = 0.72;
/** Closing is faster than opening — the decision is already made. */
const CLOSE_DURATION = 0.45;

/**
 * Site navigation — a hamburger that opens into panels.
 *
 * CLAUDE.md rules out a conventional sticky navbar, and this is not one: there is
 * no persistent bar of links competing with the scroll story. It is a single
 * button that opens a full-bleed menu and gets out of the way again.
 *
 * ── The reference, and how it is built ─────────────────────────────────────
 *
 * Desktop opens from BOTH sides at once: a light panel sweeps in from the left
 * carrying the Z, a navy panel sweeps in from the right carrying the links. They
 * meet in the middle. The split is what makes it feel like the page is opening
 * rather than something being laid on top of it.
 *
 * Mobile has no room for that, and the reference does not try: one navy panel
 * covers the screen from the right. Same markup — the left panel is simply not
 * rendered below `md`, and the right one goes full width.
 *
 * The Z panel is off-white on purpose. The mark is navy, so a navy panel would
 * hide it entirely; the reference pairs its dark mark with a light panel for the
 * same reason. The navy is where it was asked for: the link panel and the button.
 *
 * ── Motion ─────────────────────────────────────────────────────────────────
 *
 * Panels move on `xPercent` and the links fade up on `y`/`autoAlpha` — transforms
 * and opacity only, nothing that touches layout. No blanket `will-change`: these
 * elements are idle almost all the time, and GSAP's `force3D` promotes them for
 * the half-second they actually move.
 */
export function Nav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  /*
    The Z panel's mask image mounts the first time the menu opens, not on
    every page load: a CSS mask is fetched at high priority the moment its
    element renders, so the closed, invisible panel was putting a 24 KB
    request into the first frames of every visit. It stays mounted after.
  */
  const [everOpened, setEverOpened] = useState(false);
  const reducedMotion = useReducedMotion();
  const lenisRef = useLenisRef();

  /*
    Prefetch the menu route once the page has finished loading and the browser
    is idle — never during the load itself. The pill's Menu link is on screen
    on every page, so the default prefetch-on-sight put the menu's stylesheet
    and its script font on the critical path of every visit.
  */
  useEffect(() => {
    let idle: number | undefined;
    let timer: number | undefined;
    const schedule = () => {
      const run = () => router.prefetch("/menu");
      // Safari has no requestIdleCallback; a short timer after load stands in.
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(run, { timeout: 4000 });
      } else {
        timer = window.setTimeout(run, 2500);
      }
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, [router]);

  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const barTop = useRef<HTMLSpanElement>(null);
  const barBottom = useRef<HTMLSpanElement>(null);
  /** False until the menu has been opened once, so the initial render never tweens. */
  const hasOpened = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  /**
   * Freeze the page behind the menu.
   *
   * Lenis has to be stopped as well as the document locked: it drives scroll
   * itself, so `overflow: hidden` alone would leave it happily animating a
   * position nobody can see, and the page would jump on close.
   */
  useEffect(() => {
    if (!open) return;
    const lenis = lenisRef.current;
    const html = document.documentElement;
    const previous = html.style.overflow;

    lenis?.stop();
    html.style.overflow = "hidden";

    return () => {
      html.style.overflow = previous;
      lenis?.start();
    };
  }, [open, lenisRef]);

  /** Escape closes, and focus moves into the panel so a keyboard can reach it. */
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const id = requestAnimationFrame(() => linkRefs.current[0]?.focus());
    // Captured now: by cleanup time the ref may point somewhere else.
    const opener = buttonRef.current;

    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(id);
      // Send focus back to the control that opened it, not to the top of the page.
      opener?.focus();
    };
  }, [open, close]);

  /**
   * Panels in and out.
   *
   * Deliberately NOT wrapped in a `gsap.context` that reverts on every toggle.
   * Reverting restores the pre-tween values, so the closed state would be applied
   * instantly the moment `open` flips false and the sweep-out would animate from
   * closed to closed — invisible. Tweens are created directly and killed once, on
   * unmount, by the effect below.
   *
   * `x: 0` is declared alongside every `xPercent` for the same reason it is in
   * About's lift: GSAP reads a starting transform from getComputedStyle, which
   * reports a matrix with percentages already resolved to pixels. Without pinning
   * the pixel channel, the CSS `translateX(100%)` would be read as `x: <halfwidth>`
   * and stack on top of the percentage — the panel would start twice as far out
   * and never fully arrive.
   *
   * `overwrite: true` so tapping the button twice quickly retargets from wherever
   * the panels currently are instead of queueing a second sweep.
   */
  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    const links = linkRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (!right) return;

    const panels = left ? [left, right] : [right];

    if (reducedMotion) {
      // No sweep. The menu simply is, or is not.
      gsap.set(panels, { xPercent: (i) => (open ? 0 : left && i === 0 ? -100 : 100), x: 0 });
      gsap.set(links, { autoAlpha: open ? 1 : 0, y: 0 });
      return;
    }

    if (open) {
      hasOpened.current = true;
      const tl = gsap.timeline();
      if (left) {
        tl.fromTo(
          left,
          { xPercent: -100, x: 0 },
          {
            xPercent: 0,
            x: 0,
            duration: OPEN_DURATION,
            ease: "power3.inOut",
            force3D: true,
            overwrite: true,
          },
          0
        );
      }
      tl.fromTo(
        right,
        { xPercent: 100, x: 0 },
        {
          xPercent: 0,
          x: 0,
          duration: OPEN_DURATION,
          ease: "power3.inOut",
          force3D: true,
          overwrite: true,
        },
        0
      );
      // Links arrive once the panel has mostly landed, staggered.
      tl.fromTo(
        links,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.07,
          ease: "power2.out",
          force3D: true,
          overwrite: true,
        },
        OPEN_DURATION * 0.55
      );
    } else if (hasOpened.current) {
      /*
        Sweep back out, faster than it came in — an exit that takes as long as the
        entrance feels like the interface is reluctant to let go. The panel stays
        mounted (it is `inert` instead) precisely so this can play; unmounting on
        close would cut it off mid-sweep.
      */
      const tl = gsap.timeline();
      tl.to(
        links,
        { autoAlpha: 0, y: 12, duration: 0.18, ease: "power2.in", overwrite: true },
        0
      );
      tl.to(
        panels,
        {
          xPercent: (i: number) => (left && i === 0 ? -100 : 100),
          x: 0,
          duration: CLOSE_DURATION,
          ease: "power3.inOut",
          force3D: true,
          overwrite: true,
        },
        0.06
      );
    } else {
      // First mount: park the panels off-screen with no tween at all.
      gsap.set(panels, { xPercent: (i) => (left && i === 0 ? -100 : 100), x: 0 });
      gsap.set(links, { autoAlpha: 0, y: 24 });
    }
  }, [open, reducedMotion]);

  /** Kill panel tweens once, on unmount — not on every toggle. */
  useEffect(() => {
    const targets = [leftRef.current, rightRef.current, ...linkRefs.current];
    return () => {
      gsap.killTweensOf(targets.filter(Boolean) as Element[]);
    };
  }, []);

  /** Hamburger to X. Two bars, rotated and collapsed onto each other. */
  useEffect(() => {
    const top = barTop.current;
    const bottom = barBottom.current;
    if (!top || !bottom) return;

    const duration = reducedMotion ? 0 : 0.32;
    const ctx = gsap.context(() => {
      gsap.to(top, {
        y: open ? 4 : 0,
        rotate: open ? 45 : 0,
        duration,
        ease: "power3.inOut",
      });
      gsap.to(bottom, {
        y: open ? -4 : 0,
        rotate: open ? -45 : 0,
        duration,
        ease: "power3.inOut",
      });
    }, rootRef);

    return () => ctx.revert();
  }, [open, reducedMotion]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Query by the hash alone; the full "/#about" is not a valid selector. No
    // match means we are on another page — stand down and let the browser
    // follow the href home.
    const hash = hashOf(href);
    const target = hash ? document.querySelector(hash) : null;
    if (!target) return;
    event.preventDefault();
    close();

    /*
      Deferred to the next frame on purpose: the scroll lock is released in the
      cleanup above, and scrolling to a target while the document is still
      `overflow: hidden` lands nowhere.
    */
    requestAnimationFrame(() => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target as HTMLElement, { duration: 1.4 });
      } else {
        target.scrollIntoView({ block: "start" });
      }
    });
  };

  return (
    <div ref={rootRef}>
      {/* The control. Fixed, above the page, below the loader. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 md:px-8 md:py-6">
        <a
          href={HOME_LINK}
          onClick={(e) => go(e, HOME_LINK)}
          aria-label="Zoi — back to top"
          tabIndex={open ? -1 : 0}
          /*
            Fades out while the menu is open. The wordmark is the cream on-navy
            mark, and on desktop the left panel it would sit over is off-white —
            it would simply disappear. The panels carry the brand themselves once
            open: the Z on the left, the links on the right.
          */
          className={`rounded-sm transition-opacity duration-300 ease-out focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none ${
            open ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
          }`}
        >
          {/*
            The mark is cream, drawn for the dark hero. A page on a light ground
            declares itself with data-surface="paper" on <html> (see
            SurfaceFlag) and globals.css turns this black there — the wordmark
            never has to know which page it is on.
          */}
          <Image
            data-nav-wordmark
            src={BRAND.logo.src}
            unoptimized
            alt="Zoi"
            width={BRAND.logo.width}
            height={BRAND.logo.height}
            priority
            sizes="72px"
            className="h-auto w-14 md:w-[72px]"
          />
        </a>

        {/*
          The control cluster — a white pill, exactly the reference's shape, with
          the language switcher and search replaced by the one link Zoi actually
          has. It stays put and stays white when the menu opens, so the navy X sits
          on white against the navy panel behind it and the handle never becomes
          unreachable.

          `z-60` keeps it above the panels, so this single control both opens and
          closes — no separate X to hunt for.
        */}
        {/*
          `rounded-[22px]`, not `rounded-full`. Our pill is far shorter than the
          reference's, so a full radius turns it into a lozenge; a fixed radius
          keeps a little straight edge top and bottom, which is what the reference
          actually reads as at its size.
        */}
        <div className="pointer-events-auto relative z-60 flex items-center gap-3 rounded-[22px] bg-white py-2 pr-2 pl-5 md:gap-5 md:py-2.5 md:pr-2.5 md:pl-7">
          {/*
            Three controls, in the order they matter: the menu — the page most
            visitors came for — first; Instagram beside the toggle, the two
            utilities together at the pill's tapered end. Menu is orange because
            it is a link, not a button — "Reserve" keeps the one filled control.
          */}
          <Link
            href="/menu"
            /*
              Not prefetched on sight. This link is in the viewport on every
              page, and Next's default prefetch pulled the menu route's CSS and
              its 73 KB script font into the first seconds of every load, at
              high priority, beside the hero poster and the body font. The
              route is prefetched instead once the page has loaded and the
              browser is idle — see the effect above — so the click is still
              instant, just not at first paint's expense.
            */
            prefetch={false}
            className="rounded-full font-display text-base font-medium text-orange transition-colors duration-200 ease-out hover:text-navy focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none md:text-lg"
          >
            Menu
          </Link>

          <span aria-hidden="true" className="h-5 w-px bg-navy/15" />

          {/*
            The glyph alone on a phone, the glyph and the handle from md. The
            handle is real content — it is the name people remember — but on a
            375px screen the pill has no room to spell it; the glyph is the same
            control at the size the space allows. The label keeps the handle for
            screen readers on every width.
          */}
          <a
            href={VENUE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Zoi on Instagram, ${VENUE.instagram}`}
            className="flex h-11 items-center gap-2 rounded-full font-sans text-sm tracking-[0.02em] text-navy transition-colors duration-200 ease-out hover:text-orange focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none md:text-base"
          >
            <InstagramIcon className="h-[22px] w-[22px] md:h-5 md:w-5" />
            <span className="hidden md:inline">{VENUE.instagram}</span>
          </a>

          <span aria-hidden="true" className="h-5 w-px bg-navy/15" />

          <button
            ref={buttonRef}
            type="button"
            onClick={() => {
              setEverOpened(true);
              setOpen((v) => !v);
            }}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            /* 44x44 is the minimum comfortable touch target; this is 44. */
            className="group flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
          >
            {/*
              Two behaviours, and they must not fight each other:

              CLOSED — the lower bar retracts to just over half its width on hover,
              anchored right, and the colour does not change. That restraint is the
              whole character of it in the reference.

              OPEN — the assembled X rotates a quarter turn on hover.

              Both are Tailwind, and both are SAFE alongside GSAP because Tailwind
              v4 compiles `scale-x-*` and `rotate-*` to the standalone `scale` and
              `rotate` properties, while GSAP writes `transform`. CSS applies
              scale/rotate before transform, so the hover composes with the X morph
              instead of overwriting it.

              The hover scale is gated to the closed state deliberately: applied
              while the bars sit at 45 degrees it would shear the X rather than
              shorten a line.
            */}
            <span
              className={`relative block h-2.5 w-7 transition-transform duration-300 ease-out ${
                open ? "group-hover:rotate-90" : ""
              }`}
            >
              <span
                ref={barTop}
                className="absolute inset-x-0 top-0 block h-px bg-navy"
              />
              {/*
                Two nested spans, not one, and that nesting is load-bearing.

                GSAP writes an inline `transform-origin: 50% 50%` whenever it
                animates a rotation, which would beat an `origin-right` class on
                the same element — the bar would retract from both ends instead of
                from the left. The outer span is GSAP's (centre origin, for the X);
                the inner one is the hover's (right origin, for the retract). Each
                keeps its own origin because they are different elements.
              */}
              <span ref={barBottom} className="absolute inset-x-0 bottom-0 block h-px">
                <span
                  className={`block h-full w-full origin-right bg-navy transition-transform duration-300 ease-out ${
                    open ? "" : "group-hover:scale-x-[0.55]"
                  }`}
                />
              </span>
            </span>
          </button>
        </div>
      </header>

      {/*
        The menu. Kept mounted so the panels can animate out, but `inert` while
        closed so it is invisible to the keyboard and to screen readers — a
        `hidden`/unmount swap would kill the closing sweep.
      */}
      <div
        id="site-menu"
        ref={panelRef}
        aria-label="Site menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex ${open ? "" : "pointer-events-none"}`}
      >
        {/* Left — the Z. Desktop only; there is no room for it on a phone. */}
        <div
          ref={leftRef}
          className="hidden w-1/2 items-center justify-center bg-white md:flex"
          /* Same property GSAP writes, so its inline transform replaces this
             cleanly rather than composing with it. */
          style={{ transform: "translateX(-100%)" }}
        >
          {/*
            Painted as a MASK, not rendered as an image.

            The mark is exactly #0b0f1a in the source file, but shipping it through
            next/image re-encodes it as lossy WebP: measured, the delivered pixels
            came back around #070d15 across 69 distinct shades instead of one flat
            colour. Lossy compression is the wrong tool for a flat vector-like mark
            and there is no quality setting that makes it exactly right.

            So the PNG supplies only its alpha channel and the colour comes from
            `bg-navy` — the palette token, which IS #0b0f1a. The rendered colour is
            now exact by construction rather than by luck, and it follows the token
            if the palette ever moves.

            `-webkit-` duplicates are for Safari before 15.4, which shipped masks
            prefixed only.
          */}
          <div
            aria-hidden="true"
            className="aspect-[1200/941] w-[88%] -scale-x-100 bg-navy"
            style={{
              maskImage: everOpened ? `url(${BRAND.z.src})` : "none",
              WebkitMaskImage: everOpened ? `url(${BRAND.z.src})` : "none",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
              maskSize: "contain",
              WebkitMaskSize: "contain",
            }}
          />
        </div>

        {/* Right — the links. */}
        <div
          ref={rightRef}
          className="flex w-full flex-col justify-center bg-navy px-8 md:w-1/2 md:px-16"
          style={{ transform: "translateX(100%)" }}
        >
          <nav>
            <ul className="flex flex-col">
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} className="border-b border-white/10">
                  <a
                    ref={(el) => {
                      linkRefs.current[i] = el;
                    }}
                    href={link.href}
                    onClick={(e) => go(e, link.href)}
                    style={{ opacity: 0, visibility: "hidden" }}
                    className="block py-5 font-display text-4xl text-white transition-colors duration-200 ease-out hover:text-orange focus-visible:text-orange focus-visible:outline-none md:py-6 md:text-5xl"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
