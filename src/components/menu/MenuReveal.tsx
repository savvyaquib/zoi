"use client";

import { useEffect } from "react";
import { DESKTOP_QUERY, gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMenuShell } from "./MenuShell";

/**
 * Brings a menu page in.
 *
 * Renders nothing. It waits for the shell to say the loader has lifted, then
 * plays the entrance — masthead (first view only), the rail's chips, and the
 * sections as they reach the viewport — and sets up the one scroll-linked
 * effect, a shallow parallax on the three photographs, desktop only.
 *
 * ── What moves, and why only that ────────────────────────────────────────────
 *
 * Every element starts from where it is and settles: a section lifts sixteen
 * pixels and fades; its illustration scales from 0.94 and a few degrees off
 * true — a drawing set down on the page, not one that pops; the items follow
 * with a stagger capped at three-tenths of a second however long the list, so
 * a thirty-line Spirits list never becomes a slow drip. Opacity and transform
 * only, per CLAUDE.md. Each section fires once and then nothing is listening
 * for it.
 *
 * Reduced motion keeps the fades and drops every translate, scale and the
 * parallax — the reader still sees the page settle, nothing moves.
 */
export function MenuReveal() {
  const reducedMotion = useReducedMotion();
  const { revealed, firstVisit } = useMenuShell();

  useEffect(() => {
    if (!revealed) return;

    const sections = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    const rail = document.querySelector<HTMLElement>("[data-reveal-rail]");
    const chips = rail ? gsap.utils.toArray<HTMLElement>("a", rail) : [];
    const masthead = firstVisit ? gsap.utils.toArray<HTMLElement>("[data-masthead-item]") : [];
    const photos = gsap.utils.toArray<HTMLElement>("[data-parallax]");

    if (reducedMotion) {
      gsap.set([...sections, ...masthead, rail].filter(Boolean), { opacity: 1, clearProps: "transform" });
      return;
    }

    let mm: gsap.MatchMedia | undefined;
    const ctx = gsap.context(() => {
      // ── Entrance ──────────────────────────────────────────────────────────
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (masthead.length) {
        entrance.fromTo(
          masthead,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, clearProps: "transform" }
        );
      }
      if (rail) {
        entrance.set(rail, { opacity: 1 }, masthead.length ? "-=0.35" : 0);
        entrance.fromTo(
          chips,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, stagger: { amount: 0.3 }, clearProps: "transform" },
          "<"
        );
      }

      // ── Sections, as they arrive ──────────────────────────────────────────
      // Whatever is on screen at the start waits its turn behind the rail, so
      // the page arrives top-down; after that the lead is zero.
      const startedAt = performance.now();
      const entranceEnd = Math.max(0, entrance.duration() - 0.25);
      const lead = () => Math.max(0, entranceEnd - (performance.now() - startedAt) / 1000);
      gsap.set(sections, { opacity: 0, y: 16 });
      const reveal = (section: Element, delay: number) => {
        const art = gsap.utils.toArray<HTMLElement>("[data-art]", section);
        const items = gsap.utils.toArray<HTMLElement>("li", section);
        const tl = gsap.timeline({ delay, defaults: { ease: "power3.out" } });
        tl.to(section, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" });
        if (art.length) {
          tl.fromTo(
            art,
            { opacity: 0, scale: 0.94, rotate: -3 },
            { opacity: 1, scale: 1, rotate: 0, duration: 0.7, clearProps: "transform" },
            0.05
          );
        }
        if (items.length) {
          tl.fromTo(
            items,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.45, stagger: { amount: Math.min(0.3, items.length * 0.04) }, clearProps: "transform" },
            0.1
          );
        }
      };
      ScrollTrigger.batch(sections, {
        start: "top 88%",
        once: true,
        /*
          A chip tap crosses a dozen sections in one frame. What the jump has
          already scrolled PAST is set visible at once — animating it is
          invisible work that delays what is on screen — and what remains is
          capped per batch so the stagger never accumulates.
        */
        batchMax: 4,
        onEnter: (batch) => {
          const passed = batch.filter((el) => el.getBoundingClientRect().bottom < 0);
          const ahead = batch.filter((el) => !passed.includes(el));
          if (passed.length) gsap.set(passed, { opacity: 1, y: 0, clearProps: "transform" });
          const wait = lead();
          ahead.forEach((section, i) => reveal(section, wait + i * 0.08));
        },
      });

      // ── Photographs: a shallow parallax, desktop only ─────────────────────
      // Scrub-linked, so linear by nature. Scaled to keep the frame covered
      // through the travel. The phone gets the still photograph — it is the
      // one place a scroll-linked transform can be felt, and there is nothing
      // to gain there.
      mm = gsap.matchMedia();
      mm.add(DESKTOP_QUERY, () => {
        photos.forEach((figure) => {
          const img = figure.querySelector("img");
          if (!img) return;
          gsap.fromTo(
            img,
            { yPercent: -6, scale: 1.12 },
            {
              yPercent: 6,
              scale: 1.12,
              ease: "none",
              scrollTrigger: { trigger: figure, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });
      });
    });

    /*
      Measure once the page can actually scroll. The loader holds
      `overflow: hidden` on <html> until a frame before this runs, and any
      trigger built against an unscrollable document reads as already passed.
      Fonts arrive after first paint and change every section's height, so
      measure again then.
    */
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      mm?.revert();
      ctx.revert();
    };
  }, [revealed, firstVisit, reducedMotion]);

  return null;
}
