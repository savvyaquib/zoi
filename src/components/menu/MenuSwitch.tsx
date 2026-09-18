"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

const TABS = [
  { id: "food", label: "Food", href: "/menu" },
  { id: "bar", label: "Bar", href: "/menu/bar" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function tabFor(pathname: string): TabId {
  return pathname.startsWith("/menu/bar") ? "bar" : "food";
}

/**
 * Food | Bar — the one control that is always within reach.
 *
 * Two instances of the same segmented switch. The `masthead` one sits under
 * the big "Menu" and scrolls away with it. The `dock` one is fixed: on a
 * phone it is a pill at the bottom of the screen, in the thumb's reach; on
 * desktop it sits centred in the paper band under the nav, between the
 * wordmark and the nav pill. The dock appears the moment the masthead switch
 * scrolls under the band and leaves the moment it comes back — the control
 * hands off from one position to the other rather than existing twice.
 *
 * ── The indicator ───────────────────────────────────────────────────────────
 *
 * A second copy of the two labels, set as the active state (red fill, paper
 * text), clipped to the active half. Switching animates the clip — one
 * element revealed, so the fill and the label colour move together with
 * nothing to fall out of sync. Both instances live in the /menu layout, which
 * persists across the navigation, so the reader sees the pill slide from Food
 * to Bar while the card underneath changes.
 *
 * `clip-path` is the sanctioned property for this, next to transform and
 * opacity: no layout, no paint of anything but the one element.
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

  /*
    The dock shows once the masthead switch has gone under the band, and
    retires again when the site footer comes into view — a paper pill has no
    business floating over the navy footer and its links.
  */
  const [pastMasthead, setPastMasthead] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const shown = pastMasthead && !atFooter;
  useEffect(() => {
    if (variant !== "dock") return;
    const masthead = document.querySelector<HTMLElement>('[data-menu-switch="masthead"]');
    if (!masthead) return;
    const band = document.querySelector<HTMLElement>("[data-menu-band]");
    const triggers = [
      ScrollTrigger.create({
        trigger: masthead,
        start: () => `bottom ${band?.offsetHeight ?? 0}px`,
        onEnter: () => setPastMasthead(true),
        onLeaveBack: () => setPastMasthead(false),
      }),
    ];
    const footer = document.querySelector<HTMLElement>("body > footer");
    if (footer) {
      triggers.push(
        ScrollTrigger.create({
          trigger: footer,
          start: "top bottom",
          onEnter: () => setAtFooter(true),
          onLeaveBack: () => setAtFooter(false),
        })
      );
    }
    return () => triggers.forEach((t) => t.kill());
  }, [variant]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: TabId, href: string) => {
    // Leave modified clicks to the browser — new tab, new window.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (id === active) return;
    setPending({ id, from: pathname });
    router.push(href);
  };

  const dock = variant === "dock";
  const type = dock
    ? "text-[11px] tracking-[0.16em]"
    : "text-xs tracking-[0.18em] md:text-[13px]";
  const box = dock ? "h-10 w-[12rem]" : "h-12 w-[15rem] md:h-14 md:w-[18rem]";

  const control = (
    <div className={`relative grid grid-cols-2 rounded-full border border-menu-red/30 bg-menu-paper/90 backdrop-blur-sm ${box}`}>
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
        className="pointer-events-none absolute inset-0 z-20 grid grid-cols-2 rounded-full bg-menu-red text-menu-paper transition-[clip-path] duration-[250ms] ease-in-out-strong motion-reduce:transition-none"
        style={{ clipPath: active === "food" ? "inset(0 50% 0 0 round 9999px)" : "inset(0 0 0 50% round 9999px)" }}
      >
        {TABS.map((t) => (
          <span key={t.id} className={`flex items-center justify-center font-menu-sans font-bold uppercase ${type}`}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );

  if (!dock) {
    return (
      <nav aria-label="Menus" data-menu-switch="masthead" data-masthead-item className="mt-7 md:mt-9">
        {control}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Switch menu"
      data-menu-switch="dock"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] z-30 flex justify-center md:top-[1.625rem] md:bottom-auto"
    >
      {/*
        Enters from the direction it lives in — up from the bottom edge on a
        phone, down from the band on desktop — and leaves the same way.
      */}
      <div
        data-shown={shown ? "" : undefined}
        className="pointer-events-none translate-y-3 rounded-full opacity-0 shadow-[0_10px_30px_-12px] shadow-menu-ink/30 transition-[opacity,transform] duration-[220ms] ease-out-strong data-shown:pointer-events-auto data-shown:translate-y-0 data-shown:opacity-100 md:-translate-y-2 md:shadow-none motion-reduce:translate-y-0 motion-reduce:transition-[opacity]"
      >
        {control}
      </div>
    </nav>
  );
}
