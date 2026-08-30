# CLAUDE.md — Zoi Restaurant Website

## What this is
A single-page, scroll-driven ("scrollytelling") marketing site for **Zoi**, a
fine-dining restaurant in Ranchi. Image-heavy, minimal text, cinematic. This is
NOT a 3D/WebGL showcase and NOT a traditional layout — no standard sticky top
navbar, no wordy About section. The scroll IS the experience.

Live venue details (use these exact values, don't invent):
- Address: 4th Floor, JD Hi Street Mall, Mahatma Gandhi Main Road, Hindpiri, Ranchi
- Phone: +91 77799 74888
- Hours: Daily 12:00 PM – 11:00 PM
- Instagram: @lifeatzoi
- Tagline: "Life at Zoi — where every night becomes a story."

## Non-negotiable constraints (read before writing any code)

### Performance is the #1 requirement
The client explicitly said: must run seamlessly on phones, zero lag. Every
decision below serves that. When a choice trades visual flourish for mobile
smoothness, choose smoothness.

- Animate **only `transform` and `opacity`**. Never animate `top/left/width/height/margin`
  — they trigger layout on every frame and kill mobile scroll.
- Use `will-change: transform` sparingly, only on actively-animating elements.
- All scroll-driven "videos" are **canvas image sequences** (frames scrubbed by
  scroll), NOT `<video>` elements. Scrubbing `<video>.currentTime` is janky on
  mobile Safari — do not do it.
- Every raster image goes through **next/image** with AVIF/WebP, correct `sizes`,
  and lazy loading below the fold. No hand-written `<img>` for content images.
- Below-the-fold sections are **code-split** with `next/dynamic` so the initial
  bundle stays tiny.
- Use **`gsap.matchMedia()`**: serve a lighter animation set on mobile
  breakpoints (fewer frames, shorter translate distances, simpler pins).
- Honor **`prefers-reduced-motion`**: fall back to simple fades / static frames.
- Target Lighthouse mobile Performance ≥ 90. Enable Vercel Speed Insights.

### Smooth scroll
- Use **Lenis** for smooth scroll, wired into GSAP ScrollTrigger via
  `lenis.on('scroll', ScrollTrigger.update)` and the raf loop.
- Set `smoothTouch: false` (or Lenis v1 `syncTouch: false`) — let touch devices
  use **native scroll**. Do NOT hijack scroll on mobile. This is the difference
  between smooth and seasick on a phone.

### Do NOT use
- ❌ Locomotive Scroll or any scroll-jacking lib (Lenis only, configured as above)
- ❌ Three.js / WebGL / any 3D
- ❌ Framer Motion for the scroll timeline (use GSAP — one animation engine, no conflicts)
- ❌ `<video>` for scrubbed sequences (canvas frames instead)
- ❌ Heavy UI kits (no MUI/Chakra). Tailwind only.

## Stack
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** for styling
- **GSAP** + **ScrollTrigger** for all scroll animation
- **Lenis** for smooth scroll
- **next/image** for images
- Deploy target: **Vercel** (site already lives there)

## Color palette — ONLY these 4. No other colors anywhere.
Define as CSS variables / Tailwind theme tokens and reference by name only.
```
--color-orange:  #FF6542;  /* accent, CTAs, highlights */
--color-navy:    #0B0F1A;  /* Zoi brand dark — dark bg, "black" text */
--color-white:   #F5F3EE;  /* warm off-white — light bg, light text */
--color-blue:    #4169E1;  /* secondary accent — script labels, links */
```
Never introduce greys, other blues, drop-shadowed colors, etc. Tint with
opacity of these four if you need lighter/darker steps.

## Typography
- One expressive display face for the huge scroll words (about section, hero).
- One clean sans for body/labels.
- Load via `next/font` (self-hosted, no layout shift, no render-blocking).
- Big type is a design element here — go large and confident.

## Asset folder (assets are provided — reference these paths, don't generate images)
```
/public/assets/
  loading/                 loading logo / mark
  hero/
    images/                hero-01..04  (the 4 rotating hero stills)
    frames/                frame_0001.webp … frame_NNNN.webp  (hero canvas sequence)
  ambience/
    frames/                amb_0001.webp … amb_NNNN.webp      (ambience canvas sequence)
    gallery/               ambience-01..NN  (the horizontal-slide images)
  about/                   any about-slide imagery
  reservation/             reservation-bg / dining image
  brand/                   zoi-logo.svg, favicon
```
If a real asset is missing during the build, use a solid `--color-navy` block or
a labeled placeholder of the correct dimensions — never pull a random stock URL.

## Code conventions
- Each section = its own component in `/components/sections/`
  (`Loading`, `Hero`, `Ambience`, `About`, `Reservation`, `Footer`).
- Reusable scroll logic in `/hooks/` (e.g. `useCanvasSequence`, `useLenis`).
- Register ScrollTrigger once, client-side only (`'use client'`), and
  `ScrollTrigger.refresh()` after fonts/images load.
- Kill/clean up every GSAP tween and ScrollTrigger on unmount.
- Mobile-first Tailwind. Test breakpoints: 375px, 768px, 1440px.

## Commands
- `npm run dev` — local dev
- `npm run build` — production build (must pass before "done")
- `npm run lint` — run after edits

## Workflow rules for you (Claude Code)
1. **Plan first.** Before writing code, map the section order and the scroll
   timeline, and show me the plan. Don't touch files until the structure is agreed.
2. Build **one section at a time**, in order. After each, let me preview on a
   real phone before moving on.
3. Make small, reviewable diffs. Explain what each scroll trigger does.
4. Run `npm run build` before declaring any section finished.
5. Stop and ask before destructive commands or large dependency additions.
