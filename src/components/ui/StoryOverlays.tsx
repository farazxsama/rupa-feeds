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

const ZONES = [
  { label: "Surface", y: 0 },
  { label: "Mid-water", y: -6 },
  { label: "Bottom", y: -12.5 },
];

/** Depth meter: makes the vertical journey legible at a glance. */
export function DepthGauge() {
  const marker = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const toPct = (y: number) => Math.min(100, Math.max(0, ((3 - y) / 16) * 100));
  useRaf(() => {
    if (!marker.current || !wrap.current) return;
    const y = story.cameraY;
    marker.current.style.top = `${toPct(y)}%`;
    const p = story.progress;
    wrap.current.style.opacity = p > 0.04 && p < 0.985 ? "1" : "0";
    if (readout.current) readout.current.textContent = y > 0.05 ? "Above water" : `${Math.abs(y).toFixed(1)} m`;
  });
  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none absolute right-8 top-1/2 hidden h-[46vh] -translate-y-1/2 opacity-0 transition-opacity duration-700 lg:block">
      <div className="relative h-full w-px bg-white/25">
        {ZONES.map((z) => (
          <div key={z.label} className="absolute right-0 flex -translate-y-1/2 items-center gap-2" style={{ top: `${toPct(z.y)}%` }}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">{z.label}</span>
            <span className="h-px w-2 bg-white/40" />
          </div>
        ))}
        <div ref={marker} className="absolute -left-[5px] -translate-y-1/2 transition-[top] duration-100">
          <span className="block h-[11px] w-[11px] rounded-full border-2 border-grain-300 bg-pond-950" />
          <span ref={readout} className="absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-pond-950/70 px-2 py-0.5 text-[11px] font-semibold text-grain-300 backdrop-blur" />
        </div>
      </div>
    </div>
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
        <button type="button" onClick={onEnable3D} className="btn-ghost pointer-events-auto absolute bottom-6 right-6 z-10 !py-2 text-xs">
          View 3D experience
        </button>
      )}
    </div>
  );
}
