"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStoryScroll } from "@/hooks/useStoryScroll";
import { useExperienceMode } from "@/hooks/useExperienceMode";
import { story } from "@/lib/storyStore";
import { DepthGauge, DiveOverlay, StoryFallback } from "@/components/ui/StoryOverlays";
import {
  HeroSection,
  FloatingFeedSection,
  UnderwaterTransition,
  SinkingFeedSection,
  PolycultureFeedSection,
  BrandReturnSection,
} from "./StoryBeats";

// The 3D bundle (three + r3f + drei) is code-split and only fetched on the
// client after first paint, so the hero HTML is interactive immediately.
const PondScene = dynamic(() => import("@/components/3d/PondScene"), { ssr: false });

/** Painted instantly, before WebGL is ready: a calm sky-over-water gradient. */
function Poster({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 transition-opacity duration-1000 ${hidden ? "opacity-0" : "opacity-100"}`}
      style={{
        background:
          "linear-gradient(180deg, #8fb3cf 0%, #c9d8dc 38%, #a9b9a6 44%, #3e5a43 47%, #1d3a2c 70%, #0f2a22 100%)",
      }}
    />
  );
}

export function StoryExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mode, quality, reducedMotion, webgl, enable3D, disable3D } = useExperienceMode();
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);

  useStoryScroll(containerRef, reducedMotion);

  // Pause the WebGL render loop entirely once the story is scrolled past.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      story.inView = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div ref={containerRef} id="story" className="relative bg-pond-950">
      {/* Visual layer: pinned for the whole story */}
      <div className="sticky top-0 h-[100vh] w-full overflow-hidden">
        <Poster hidden={mode === "3d" && ready} />
        {mode === "3d" && quality && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <PondScene quality={quality} active={inView} onReady={onReady} onContextLost={disable3D} />
          </div>
        )}
        {mode === "fallback" && <StoryFallback onEnable3D={webgl ? enable3D : undefined} />}
        {mode === "3d" && (
          <>
            <DiveOverlay />
            <DepthGauge />
          </>
        )}
        {/* cinematic vignette + bottom scrim for text legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(4,18,15,0.45) 100%), linear-gradient(0deg, rgba(4,18,15,0.45) 0%, transparent 35%)",
          }}
        />
        {mode === "3d" && !ready && (
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.25em] text-white/70" role="status">
            Preparing the pond…
          </p>
        )}
      </div>

      {/* Story content layer (scrolls over the pinned visual) */}
      <div className="pointer-events-none relative -mt-[100vh]">
        <HeroSection />
        <FloatingFeedSection />
        <UnderwaterTransition />
        <SinkingFeedSection />
        <PolycultureFeedSection />
        <BrandReturnSection />
      </div>
    </div>
  );
}
