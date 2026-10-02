import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePelletAssets, applyPelletColors, HIDDEN } from "./pellets";
import { feed, allocPool, addRipple } from "./feedState";
import { beatLocal } from "@/lib/storyStore";
import { mulberry32, terrainHeight } from "@/lib/pondMath";
import { WORLD } from "@/config/story";

/**
 * SINKING FEED
 * The pellet cloud's depth is *scrubbed by scroll* using the same depth
 * curve the camera follows (config/story.ts CAMERA_KEYS for "sinking"), so the
 * camera and the feed always travel down together. Individual pellets spread
 * out with depth and settle on the pond floor.
 */

// (sinking-local progress, cloud depth) — matched to the camera's look target.
const DEPTH_CURVE: [number, number][] = [
  [0.1, 0.0],
  [0.18, -1.3],
  [0.5, -6.5],
  [0.85, -12.0],
  [0.93, -12.9],
];

function cloudDepth(s: number) {
  if (s <= DEPTH_CURVE[0][0]) return DEPTH_CURVE[0][1];
  for (let i = 0; i < DEPTH_CURVE.length - 1; i++) {
    const [a, ya] = DEPTH_CURVE[i];
    const [b, yb] = DEPTH_CURVE[i + 1];
    if (s <= b) {
      const u = (s - a) / (b - a);
      return ya + (yb - ya) * (u * u * (3 - 2 * u)) * 0.35 + (yb - ya) * u * 0.65;
    }
  }
  return DEPTH_CURVE[DEPTH_CURVE.length - 1][1];
}

export function SinkingPellets({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometry, material } = usePelletAssets();
  const crossed = useRef(false);

  const pellets = useMemo(() => {
    const r = mulberry32(33);
    allocPool(feed.sinking, count, 0.4, r);
    return Array.from({ length: count }, () => ({
      ang: r() * Math.PI * 2,
      r0: Math.pow(r(), 0.6) * 0.7,
      spread: r() * 2 - 1,
      delay: r() * 0.05,
      ph: r() * 10,
      tumble: 0.5 + r() * 1.5,
    }));
  }, [count]);

  useEffect(() => {
    if (ref.current) applyPelletColors(ref.current, count, 9, "#b07a40");
  }, [count]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const one = useMemo(() => new THREE.Vector3(1.3, 1.3, 1.3), []);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const s = beatLocal("sinking");
    const pool = feed.sinking;
    if (s < 0.02) pool.alive.fill(1);

    const center = cloudDepth(s);
    feed.sinkCenter.set(WORLD.sinking.x, center, WORLD.sinking.z);
    feed.sinkActive = s > 0.14 && s < 0.95;
    const depthFrac = Math.min(1, -center / 13);

    // splash when the cloud enters the water (time-based ripple)
    if (s > 0.1 && !crossed.current) {
      crossed.current = true;
      addRipple(WORLD.sinking.x, WORLD.sinking.z, 1.4);
    } else if (s < 0.08) crossed.current = false;

    for (let i = 0; i < count; i++) {
      const pl = pellets[i];
      const local = s - pl.delay;
      if (local < 0.03 || !pool.alive[i]) {
        pool.settled[i] = 0;
        mesh.setMatrixAt(i, HIDDEN);
        continue;
      }
      let y: number;
      const rad = pl.r0 * (1 + depthFrac * 1.8);
      let x = WORLD.sinking.x + Math.cos(pl.ang) * rad;
      let z = WORLD.sinking.z + Math.sin(pl.ang) * rad;
      if (local < 0.1) {
        // thrown in from above the surface
        const u = (local - 0.03) / 0.07;
        y = THREE.MathUtils.lerp(2.2, 0, u * u);
      } else {
        // descending: pellets spread vertically as they fall (different sink rates)
        y = cloudDepth(local) + pl.spread * (0.15 + depthFrac * 1.1);
        y = Math.min(y, -0.05);
        // gentle side-to-side drift while sinking
        x += Math.sin(t * 0.7 + pl.ph) * 0.03 * (1 - depthFrac * 0.5);
        z += Math.cos(t * 0.6 + pl.ph) * 0.03 * (1 - depthFrac * 0.5);
      }
      const ground = terrainHeight(x, z) + 0.03;
      const settled = y <= ground;
      if (settled) y = ground;
      pool.settled[i] = settled ? 1 : 0;
      if (settled) e.set(0, pl.ang, 0);
      else e.set(t * pl.tumble + pl.ph, pl.ang, t * pl.tumble * 0.7);
      pool.pos[i * 3] = x;
      pool.pos[i * 3 + 1] = y;
      pool.pos[i * 3 + 2] = z;
      q.setFromEuler(e);
      m.compose(p.set(x, y, z), q, one);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, count]} />;
}
