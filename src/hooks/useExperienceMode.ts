"use client";

import { useCallback, useEffect, useState } from "react";
import { detectTier, getQuality, hasWebGL, type QualitySettings } from "@/lib/quality";

export type ExperienceMode = "pending" | "3d" | "fallback";

/**
 * Decides between the full 3D story and the illustrated fallback:
 *  - no WebGL                     → fallback
 *  - prefers-reduced-motion       → fallback (user can opt back in)
 *  - ?mode=fallback / ?mode=3d    → manual override (QA / client demos)
 * Also picks a quality tier for the device (see lib/quality.ts).
 */
export function useExperienceMode() {
  const [mode, setMode] = useState<ExperienceMode>("pending");
  const [quality, setQuality] = useState<QualitySettings | null>(null);
  const [reducedMotion, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = new URLSearchParams(window.location.search).get("mode");
    const gl = hasWebGL();
    setWebgl(gl);
    setReduced(mq.matches);
    setQuality(getQuality(detectTier()));
    if (!gl || forced === "fallback") setMode("fallback");
    else if (mq.matches && forced !== "3d") setMode("fallback");
    else setMode("3d");

    const onChange = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
      if (e.matches) setMode("fallback");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const enable3D = useCallback(() => setMode("3d"), []);
  const disable3D = useCallback(() => setMode("fallback"), []);

  return { mode, quality, reducedMotion, webgl, enable3D, disable3D };
}
