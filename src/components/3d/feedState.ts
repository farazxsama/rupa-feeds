import * as THREE from "three";

/**
 * Shared, mutable simulation state between pellets, fish and shrimp.
 * Pellet components write positions; animals read them as targets and
 * mark pellets as eaten. Nothing here causes React renders.
 */
export interface PelletPool {
  count: number;
  pos: Float32Array; // xyz per pellet
  alive: Uint8Array; // 1 = visible
  edible: Uint8Array; // only some pellets get eaten so feed stays readable
  /** 1 once the pellet is resting in its "feeding zone" (surface / tray). */
  settled: Uint8Array;
}

function pool(): PelletPool {
  return { count: 0, pos: new Float32Array(0), alive: new Uint8Array(0), edible: new Uint8Array(0), settled: new Uint8Array(0) };
}

export function allocPool(p: PelletPool, n: number, edibleRatio: number, rand: () => number) {
  p.count = n;
  p.pos = new Float32Array(n * 3);
  p.alive = new Uint8Array(n).fill(1);
  p.settled = new Uint8Array(n);
  p.edible = new Uint8Array(n);
  for (let i = 0; i < n; i++) p.edible[i] = rand() < edibleRatio ? 1 : 0;
}

export const feed = {
  floating: pool(),
  sinking: pool(),
  poly: pool(),
  /** centre of the sinking pellet cloud (fish follow this downward) */
  sinkCenter: new THREE.Vector3(7, 2, -1),
  sinkActive: false,
  /** surface ripple events (time-based so they keep animating when scroll stops) */
  ripples: [] as { x: number; z: number; t0: number; s: number }[],
  clock: 0,
};

export function addRipple(x: number, z: number, strength = 1) {
  feed.ripples.push({ x, z, t0: feed.clock, s: strength });
  if (feed.ripples.length > 32) feed.ripples.shift();
}
