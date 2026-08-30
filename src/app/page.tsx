import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PreloadProvider } from "@/hooks/usePreloader";
import { Loading } from "@/components/sections/Loading";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { BelowFold } from "@/components/BelowFold";

export default function Home() {
  return (
    <SmoothScroll>
      <PreloadProvider>
        <Loading />
        <ScrollProgress />
        <main>
          {/*
            Hero and About share this wrapper because on a phone they share a
            SCREEN: the hero is `sticky top-0` holding the top half, About's stage
            is `sticky top-[50svh]` holding the bottom half. Scrolling advances the
            About deck while the hero stays put; once the deck runs out, the
            wrapper ends, both release together and the page moves on to Ambience.

            The wrapper is what bounds that. Without a shared parent the hero would
            stay stuck for the entire document and sit on top of every section
            below it.

            About is imported directly rather than lazily through BelowFold: it now
            shares the first screen on mobile, and deferring it would mean
            deferring above-the-fold content.
          */}
          <div className="relative">
            <Hero />
            <About />
          </div>
          <BelowFold />
        </main>
      </PreloadProvider>
    </SmoothScroll>
  );
}
