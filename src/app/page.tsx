import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PreloadProvider } from "@/hooks/usePreloader";
import { Loading } from "@/components/sections/Loading";
import { Hero } from "@/components/sections/Hero";
import { BelowFold } from "@/components/BelowFold";

export default function Home() {
  return (
    <SmoothScroll>
      <PreloadProvider>
        <Loading />
        <ScrollProgress />
        <main>
          <Hero />
          <BelowFold />
        </main>
      </PreloadProvider>
    </SmoothScroll>
  );
}
