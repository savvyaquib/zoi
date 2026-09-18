"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

const TABS = [
  { id: "food", label: "Food", href: "/menu" },
  { id: "bar", label: "Bar", href: "/menu/bar" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function tabFor(pathname: string): TabId {
  return pathname.startsWith("/menu/bar") ? "bar" : "food";
}

/** How long the page must be still before the docked switch withdraws. */
const IDLE_MS = 1_100;

/**
 * Food | Bar — in two forms.
 *
 * `masthead`: two underlined tabs under the big "Menu", as the page opened
 * with. A red rule slides under whichever card is open.
 *
 * `dock`: a pill at the bottom of the screen, in the thumb's reach on a
 * phone and out of the way of everything on desktop. It exists only while
 * the reader is moving: it rises the moment the page scrolls past the
 * masthead and withdraws a second after the page comes to rest, so a page
 * being READ carries nothing over it, and a page being SEARCHED always has
 * the other card one tap away.
 *
 * ── The indicator ───────────────────────────────────────────────────────────
 *
 * The pill's active half is a second copy of the two labels, set as the
 * active state (red fill, paper text), clipped to that half. Switching
 * animates the clip — one element revealed, so the fill and the label colour
 * move together with nothing to fall out of sync. The masthead's rule is a
 * translate of one bar across two equal cells. Both instances live in the
 * /menu layout, which persists across the navigation, so the reader sees the
 * indicator slide from Food to Bar while the card underneath changes.
 */
export function MenuSwitch({ variant }: { variant: "masthead" | "dock" }) {
  const pathname = usePathname();
  const router = useRouter();

  /*
    Optimistic state for the slide: set on click, honoured only while the path
    it was set from is still current. Once the route changes the path is the
    truth again — including on browser back, where no click happened.
  */
  const [pending, setPending] = useState<{ id: TabId; from: string } | null>(null);
  const active: TabId = pending && pending.from === pathname ? pending.id : tabFor(pathname);

  // Both cards are static; have the other one ready before it is asked for.
  useEffect(() => {
    TABS.forEach((t) => router.prefetch(t.href));
  }, [router]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: TabId, href: string) => {
    // Leave modified clicks to the browser — new tab, new window.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (id === active) return;
    setPending({ id, from: pathname });
    router.push(href);
  };

  // ── The dock's conditions: past the masthead, moving, not over the footer ──
  const [pastMasthead, setPastMasthead] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const [moving, setMoving] = useState(false);
  const movingRef = useRef(false);

  useEffect(() => {
    if (variant !== "dock") return;
    const masthead = document.querySelector<HTMLElement>('[data-menu-switch="masthead"]');
    const band = document.querySelector<HTMLElement>("[data-menu-band]");
    const trigger = masthead
      ? ScrollTrigger.create({
          trigger: masthead,
          start: () => `bottom ${band?.offsetHeight ?? 0}px`,
          onEnter: () => setPastMasthead(true),
          onLeaveBack: () => setPastMasthead(false),
        })
      : null;
    // And never over the site footer — the menu's own ground ends there.
    const footer = document.querySelector<HTMLElement>("body > footer");
    const footerTrigger = footer
      ? ScrollTrigger.create({
          trigger: footer,
          start: "top bottom",
          onEnter: () => setAtFooter(true),
          onLeaveBack: () => setAtFooter(false),
        })
      : null;

    /*
      One passive scroll listener; state changes only at the edges — the
      first event of a movement and the timer after the last — so a long
      scroll is two renders, not hundreds. Lenis scrolls the window itself,
      so this hears smooth scroll and native touch scroll alike.
    */
    let timer: number | undefined;
    const onScroll = () => {
      if (!movingRef.current) {
        movingRef.current = true;
        setMoving(true);
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        movingRef.current = false;
        setMoving(false);
      }, IDLE_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      trigger?.kill();
      footerTrigger?.kill();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [variant]);

  if (variant === "masthead") {
    return (
      <nav
        aria-label="Menus"
        data-menu-switch="masthead"
        data-masthead-item
        className="relative mt-7 grid w-52 grid-cols-2 border-b border-menu-red/20 md:mt-9 md:w-60"
      >
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            aria-current={t.id === active ? "page" : undefined}
            onClick={(e) => go(e, t.id, t.href)}
            className={`pb-3 text-center font-menu-sans text-xs font-bold tracking-[0.18em] uppercase transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-menu-red focus-visible:outline-none ${
              t.id === active ? "text-menu-red" : "text-menu-ink/50 hover:text-menu-red"
            }`}
          >
            {t.label}
          </Link>
        ))}
        {/* The rule: one bar, half the row, translated to the open card. */}
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-0.5 w-1/2 bg-menu-red transition-transform duration-250 ease-in-out-strong motion-reduce:transition-none"
          style={{ transform: active === "food" ? "translateX(0)" : "translateX(100%)" }}
        />
      </nav>
    );
  }

  const shown = pastMasthead && moving && !atFooter;
  const type = "text-[11px] tracking-[0.16em]";

  return (
    <nav
      aria-label="Switch menu"
      data-menu-switch="dock"
      /* `inert` while withdrawn: nothing invisible can take focus or a tap. */
      inert={!shown}
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] z-30 flex justify-center md:bottom-8"
    >
      {/*
        Rises from just below its resting place and settles to size; withdraws
        the same way. Transitions rather than keyframes — the page can start
        and stop many times a second, and a transition retargets from wherever
        it is instead of restarting.
      */}
      <div
        data-shown={shown ? "" : undefined}
        className="pointer-events-none translate-y-4 scale-[0.94] rounded-full opacity-0 shadow-[0_12px_32px_-12px] shadow-menu-ink/35 transition-[opacity,transform] duration-320 ease-out-strong data-shown:pointer-events-auto data-shown:translate-y-0 data-shown:scale-100 data-shown:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-opacity"
      >
        <div className="relative grid h-10 w-48 grid-cols-2 rounded-full border border-menu-red/30 bg-menu-paper/90 backdrop-blur-sm">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              aria-current={t.id === active ? "page" : undefined}
              onClick={(e) => go(e, t.id, t.href)}
              className={`relative z-10 flex items-center justify-center rounded-full font-menu-sans font-bold text-menu-red uppercase transition-transform duration-100 ease-out-strong active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-menu-red focus-visible:ring-offset-2 focus-visible:ring-offset-menu-paper focus-visible:outline-none ${type}`}
            >
              {t.label}
            </Link>
          ))}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 grid grid-cols-2 rounded-full bg-menu-red text-menu-paper transition-[clip-path] duration-250 ease-in-out-strong motion-reduce:transition-none"
            style={{ clipPath: active === "food" ? "inset(0 50% 0 0 round 9999px)" : "inset(0 0 0 50% round 9999px)" }}
          >
            {TABS.map((t) => (
              <span key={t.id} className={`flex items-center justify-center font-menu-sans font-bold uppercase ${type}`}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
