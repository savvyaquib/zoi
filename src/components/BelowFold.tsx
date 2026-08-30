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
 * Client Components still prerender to HTML, so Reservation / Footer text stays in
 * the served markup for SEO. Only Ambience opts out of SSR — it is video plus
 * images with nothing worth indexing, and skipping its prerender keeps it fully
 * out of the critical path.
 */

const Ambience = dynamic(
  () => import("./sections/Ambience").then((m) => m.Ambience),
  {
    ssr: false,
    loading: () => <div className="h-svh bg-navy" />,
  }
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
