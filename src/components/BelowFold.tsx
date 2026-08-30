"use client";

import dynamic from "next/dynamic";

/**
 * Code-splitting boundary for everything below the hero.
 *
 * This has to be a Client Component: Next 16 rejects `ssr: false` inside a Server
 * Component (node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md).
 *
 * Client Components still prerender to HTML, so About / Reservation / Footer text
 * stays in the served markup for SEO. Only Ambience opts out of SSR — it is a
 * canvas plus images with nothing worth indexing, and skipping its prerender keeps
 * it fully out of the critical path.
 */

const Ambience = dynamic(
  () => import("./sections/Ambience").then((m) => m.Ambience),
  {
    ssr: false,
    loading: () => <div className="h-svh bg-navy" />,
  }
);

const About = dynamic(() => import("./sections/About").then((m) => m.About));
const Reservation = dynamic(() =>
  import("./sections/Reservation").then((m) => m.Reservation)
);
const Footer = dynamic(() => import("./sections/Footer").then((m) => m.Footer));

export function BelowFold() {
  return (
    <>
      <About />
      <Ambience />
      <Reservation />
      <Footer />
    </>
  );
}
