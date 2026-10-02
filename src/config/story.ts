/**
 * STORY TIMELINE + WORLD LAYOUT
 * ------------------------------------------------------------------
 * The homepage is one continuous scroll. Each "beat" is a DOM section with a
 * height (in vh). At runtime we measure the sections and convert them into
 * global progress ranges (0..1) — see `lib/storyStore.ts`.
 *
 * Camera keyframes are expressed *relative to a beat* (`at` = 0..1 inside that
 * beat) so section heights can be retuned without re-authoring the camera.
 */

export type BeatId = "hero" | "floating" | "dive" | "sinking" | "polyculture" | "brand";

export const BEATS: { id: BeatId; vh: number; mobileVh: number }[] = [
  { id: "hero", vh: 130, mobileVh: 110 },
  { id: "floating", vh: 240, mobileVh: 180 },
  { id: "dive", vh: 140, mobileVh: 110 },
  { id: "sinking", vh: 260, mobileVh: 190 },
  { id: "polyculture", vh: 240, mobileVh: 180 },
  { id: "brand", vh: 150, mobileVh: 120 },
];

/** World anchors (metres-ish). Water surface is y = 0. */
export const WORLD = {
  surfaceY: 0,
  floorY: -13,
  floating: { x: 0, z: 0 },
  sinking: { x: 7, z: -1 },
  net: { x: 15, z: -4 },
  /** Funnel / tray dimensions for the polyculture feeding zone. */
  netTopY: -9.6,
  netTopR: 2.6,
  netBottomY: -11.9,
  netBottomR: 1.0,
  trayY: -12.72,
  trayR: 1.9,
};

type V3 = [number, number, number];
export interface CameraKey {
  beat: BeatId;
  at: number;
  pos: V3;
  look: V3;
}

/**
 * Camera path. Tuned so that:
 * - floating: camera sits just above the waterline (air / surface / fish all visible)
 * - dive: camera crosses y=0 smoothly (fog + overlay blend handle the transition)
 * - sinking: the look target tracks the sinking pellet cloud downward
 * - polyculture: settles beside the feeding funnel + tray on the floor
 * - brand: rises and looks up at the bright surface
 */
export const CAMERA_KEYS: CameraKey[] = [
  { beat: "hero", at: 0.0, pos: [-10, 5.8, 21], look: [1, -0.6, -2] },
  { beat: "hero", at: 1.0, pos: [-5.5, 3.4, 14], look: [0, -0.4, -0.8] },
  { beat: "floating", at: 0.3, pos: [-2.4, 1.55, 7.4], look: [0, -0.25, 0] },
  { beat: "floating", at: 0.65, pos: [-0.8, 0.62, 4.7], look: [0.1, -0.32, 0] },
  { beat: "floating", at: 1.0, pos: [0.4, 0.42, 4.1], look: [0.8, -0.55, 0] },
  { beat: "dive", at: 0.5, pos: [2.2, -0.7, 4.8], look: [3.8, -1.6, -0.6] },
  { beat: "dive", at: 1.0, pos: [4.4, -2.4, 6.6], look: [6.6, -1.1, -1] },
  { beat: "sinking", at: 0.18, pos: [4.9, -2.5, 6.8], look: [7, -1.2, -1] },
  { beat: "sinking", at: 0.5, pos: [5.4, -6.2, 7.0], look: [7, -6.4, -1] },
  { beat: "sinking", at: 0.85, pos: [5.9, -10.4, 7.2], look: [7, -12.2, -1] },
  { beat: "polyculture", at: 0.18, pos: [9.4, -10.0, 6.6], look: [13.8, -11.4, -3.4] },
  { beat: "polyculture", at: 0.5, pos: [11.6, -10.2, 3.9], look: [15, -11.6, -4] },
  { beat: "polyculture", at: 0.85, pos: [12.6, -11.3, 2.4], look: [15, -12.2, -4] },
  { beat: "brand", at: 0.45, pos: [10.5, -6.5, 7.5], look: [11, -1.5, -3] },
  { beat: "brand", at: 1.0, pos: [8.5, -2.0, 9.5], look: [8.8, 2.6, -3] },
];
