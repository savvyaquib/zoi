import { PreloadProvider } from "@/hooks/usePreloader";
import { Loading } from "@/components/sections/Loading";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { BelowFold } from "@/components/BelowFold";

/**
 * The home page — the scrollytelling.
 *
 * Nav, Footer, smooth scroll and the progress bar live in layout.tsx now, shared
 * with every other page. What stays here is the part only this page has: the
 * loader that gates on the hero's assets, and the sections in their order.
 */
export default function Home() {
  return (
    <PreloadProvider>
      <Loading />
      <main>
        {/*
          About is imported directly rather than lazily through BelowFold: on a
          phone the hero is half height, so About's opening word shares the first
          screen with it. Deferring it would mean deferring above-the-fold
          content.
        */}
        <Hero />
        <About />
        <BelowFold />
      </main>
    </PreloadProvider>
  );
}
