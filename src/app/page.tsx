import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PreloadProvider } from "@/hooks/usePreloader";
import { Loading } from "@/components/sections/Loading";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { BelowFold } from "@/components/BelowFold";

export default function Home() {
  return (
    <SmoothScroll>
      <PreloadProvider>
        <Loading />
        <Nav />
        <ScrollProgress />
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
    </SmoothScroll>
  );
}
