"use client";

import { useEffect, useRef, useState } from "react";
import { story, activeBeat } from "@/lib/storyStore";
import type { BeatId } from "@/config/story";
import { PondDiagram } from "./PondDiagram";

/** rAF helper that only runs while mounted. */
function useRaf(cb: () => void) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    let id = 0;
    const loop = () => {
      ref.current();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
}

/**
 * The moment the lens crosses the waterline: a brief green-teal wash with a
 * soft blur, peaking at y = 0. Driven by the real camera height.
 */
export function DiveOverlay() {
  const el = useRef<HTMLDivElement>(null);
  useRaf(() => {
    if (!el.current) return;
    const y = story.cameraY;
    const o = Math.exp(-((y / 0.32) ** 2)) * 0.55;
    el.current.style.opacity = o.toFixed(3);
    el.current.style.backdropFilter = o > 0.02 ? `blur(${(o * 5).toFixed(1)}px)` : "none";
  });
  return (
    <div
      ref={el}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0"
      style={{ background: "linear-gradient(180deg, rgba(210,230,240,0.35) 0%, rgba(34,128,160,0.6) 55%, rgba(12,60,90,0.7) 100%)" }}
    />
  );
}

/**
 * No-WebGL / reduced-motion backdrop: the same three-zone story as a calm
 * illustrated cross-section that highlights the zone being read.
 */
export function StoryFallback({ onEnable3D }: { onEnable3D?: () => void }) {
  const [beat, setBeat] = useState<BeatId>("hero");
  useRaf(() => {
    const b = activeBeat();
    setBeat((prev) => (prev === b ? prev : b));
  });
  const active = beat === "floating" || beat === "sinking" || beat === "polyculture" ? beat : "all";
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const check = () => setPortrait(window.innerWidth / window.innerHeight < 1);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-pond-950 pt-16">
      <PondDiagram active={active} fit={portrait ? "contain" : "cover"} className="h-full w-full opacity-90" />
      {onEnable3D && (
        <button type="button" onClick={onEnable3D} className="btn-ghost pointer-events-auto absolute bottom-28 right-6 z-10 !py-2 text-xs">
          View 3D experience
        </button>
      )}
    </div>
  );
}
