"use client";

import dynamic from "next/dynamic";

/**
 * Code-splitting boundary for everything below the first screen.
 *
 * This has to be a Client Component: Next 16 rejects `ssr: false` inside a Server
 * Component (node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md).
 *
 * About used to live here, but it now shares the first screen with the hero on
 * mobile, so page.tsx imports it eagerly — deferring it would mean deferring
 * above-the-fold content.
 *
 * Client Components still prerender to HTML, so every section's text ships in the
 * served markup for SEO. Nothing opts out of SSR.
 *
 * ── Why Ambience no longer sets `ssr: false` ────────────────────────────────
 *
 * It used to, on the reasoning that the section is "video plus images with nothing
 * worth indexing". The video part is true. The images part was not: the seven
 * AMBIENCE_GALLERY entries carry written alt text — "The dining room under warm
 * pendant light", "Arched seating along the far wall" — which is exactly the
 * room-focused language a fine-dining search rewards, and it was being excluded
 * from the document. Googlebot renders JavaScript on a second, queued pass and may
 * eventually have seen it; most AI crawlers do not render at all, so for them the
 * visual heart of the restaurant simply did not exist.
 *
 * Dropping `ssr: false` costs nothing at runtime. The section still code-splits —
 * that is the `dynamic()` call, not the flag — and the server render is the mobile
 * branch, whose video is `preload="none"` and whose images are `loading="lazy"`,
 * so no extra byte is fetched. What changes is only that the markup is in the HTML.
 *
 * The server render is the mobile branch because both `useMediaQuery` and
 * `useReducedMotion` are `useSyncExternalStore` hooks whose server snapshot is
 * `false`. A desktop visitor therefore gets the phone layout in the initial HTML
 * and the pinned stage after hydration. That swap is below the fold and replaces
 * an identical swap from the old navy placeholder, so it is not a new cost.
 */

const Ambience = dynamic(() =>
  import("./sections/Ambience").then((m) => m.Ambience)
);

const Reservation = dynamic(() =>
  import("./sections/Reservation").then((m) => m.Reservation)
);
const Footer = dynamic(() => import("./sections/Footer").then((m) => m.Footer));

export function BelowFold() {
  return (
    <>
      <Ambience />
      <Reservation />
      <Footer />
    </>
  );
}
