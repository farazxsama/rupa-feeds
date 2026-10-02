import { BEATS, type BeatId } from "@/config/story";

/**
 * Tiny mutable store shared between GSAP (writer) and the R3F render loop
 * (reader). We intentionally avoid React state here: scroll progress changes
 * every frame and must never trigger React re-renders.
 */

export type BeatRanges = Record<BeatId, [number, number]>;

function proportionalRanges(): BeatRanges {
  const total = BEATS.reduce((s, b) => s + b.vh, 0);
  let acc = 0;
  const out = {} as BeatRanges;
  for (const b of BEATS) {
    out[b.id] = [acc / total, (acc + b.vh) / total];
    acc += b.vh;
  }
  return out;
}

export const story = {
  /** Global story progress 0..1 (already smoothed by ScrollTrigger scrub). */
  progress: 0,
  /** Measured beat ranges in global progress. */
  ranges: proportionalRanges(),
  /** Bumps whenever ranges change so consumers can rebuild cached paths. */
  version: 0,
  /** Written by the camera controller each frame. */
  cameraY: 5,
  /** 0 = above water, 1 = fully underwater (smoothed around the waterline). */
  underwater: 0,
  reducedMotion: false,
  /** Whether the story container is on screen (render loop pauses otherwise). */
  inView: true,
};

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Progress (0..1) inside a beat for the current — or a given — global progress. */
export function beatLocal(id: BeatId, p: number = story.progress): number {
  const [a, b] = story.ranges[id];
  return clamp01((p - a) / Math.max(1e-5, b - a));
}

/** Convert a beat-relative time into global progress. */
export function beatGlobal(id: BeatId, at: number): number {
  const [a, b] = story.ranges[id];
  return a + (b - a) * at;
}

export function activeBeat(p: number = story.progress): BeatId {
  for (const b of BEATS) {
    const [s, e] = story.ranges[b.id];
    if (p >= s && p < e) return b.id;
  }
  return BEATS[BEATS.length - 1].id;
}

/**
 * Measure the beat sections in the DOM. A beat starts when its section's top
 * edge reaches the middle of the viewport, so the 3D action lines up with the
 * text panel that is sliding into view.
 */
export function measureRanges(container: HTMLElement) {
  const vh = window.innerHeight;
  const maxScroll = Math.max(1, container.offsetHeight - vh);
  const sections = Array.from(container.querySelectorAll<HTMLElement>("[data-beat]"));
  if (sections.length !== BEATS.length) return;
  const starts = sections.map((el) => Math.max(0, el.offsetTop - vh * 0.5) / maxScroll);
  const next = {} as BeatRanges;
  sections.forEach((el, i) => {
    const id = el.dataset.beat as BeatId;
    next[id] = [i === 0 ? 0 : starts[i], i === sections.length - 1 ? 1 : starts[i + 1]];
  });
  story.ranges = next;
  story.version++;
}
