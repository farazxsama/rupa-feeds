/**
 * Device capability detection → quality tier.
 * Every count / resolution used by the 3D scene comes from here so the
 * mobile experience is the *same story* with a lighter budget.
 */
export type Tier = "high" | "medium" | "low";

export interface QualitySettings {
  tier: Tier;
  dpr: [number, number];
  antialias: boolean;
  waterSegments: number;
  terrainSegments: number;
  fish: { surface: number; mid: number; bottom: number };
  shrimp: number;
  pellets: { floating: number; sinking: number; poly: number };
  particles: number;
  bubbles: number;
  rays: number;
  plants: number;
  reeds: number;
  trees: number;
}

const SETTINGS: Record<Tier, QualitySettings> = {
  high: {
    tier: "high",
    dpr: [1, 1.75],
    antialias: true,
    waterSegments: 180,
    terrainSegments: 220,
    fish: { surface: 14, mid: 14, bottom: 12 },
    shrimp: 14,
    pellets: { floating: 70, sinking: 60, poly: 60 },
    particles: 1100,
    bubbles: 160,
    rays: 10,
    plants: 1500,
    reeds: 2200,
    trees: 150,
  },
  medium: {
    tier: "medium",
    dpr: [1, 1.4],
    antialias: true,
    waterSegments: 120,
    terrainSegments: 160,
    fish: { surface: 11, mid: 10, bottom: 9 },
    shrimp: 10,
    pellets: { floating: 55, sinking: 45, poly: 45 },
    particles: 650,
    bubbles: 110,
    rays: 7,
    plants: 900,
    reeds: 1300,
    trees: 100,
  },
  low: {
    tier: "low",
    dpr: [1, 1.25],
    antialias: false,
    waterSegments: 72,
    terrainSegments: 110,
    fish: { surface: 8, mid: 7, bottom: 6 },
    shrimp: 7,
    pellets: { floating: 40, sinking: 32, poly: 32 },
    particles: 320,
    bubbles: 60,
    rays: 4,
    plants: 420,
    reeds: 600,
    trees: 50,
  },
};

export function detectTier(): Tier {
  if (typeof window === "undefined") return "medium";
  const forced = new URLSearchParams(window.location.search).get("quality");
  if (forced === "high" || forced === "medium" || forced === "low") return forced;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const w = Math.min(window.innerWidth, window.screen?.width || window.innerWidth);
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (w < 768 || mem <= 3 || cores <= 3) return "low";
  if (w < 1200 || coarse || mem <= 4) return "medium";
  return "high";
}

export const getQuality = (tier: Tier) => SETTINGS[tier];

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
