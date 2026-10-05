import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePelletAssets, applyPelletColors, HIDDEN } from "./pellets";
import { feed, allocPool, addRipple } from "./feedState";
import { beatLocal } from "@/lib/storyStore";
import { mulberry32, waveHeight } from "@/lib/pondMath";
import { BOAT, FLOAT_FEED, WORLD } from "@/config/story";

/**
 * FLOATING FEED
 * Pellets are hand-cast by the farmer in the boat (Farmer.tsx): each handful
 * rides in his palm (`feed.hand`) from the scoop until the cast, then flies a
 * short arc and *stays on the surface*, riding the exact same wave function as
 * the water shader. Fish (FishSchool behaviour "surface") rise and take some.
 *
 * Scoop / release moments are scroll-driven (FLOAT_FEED, shared with the arm
 * animation); the flight itself is time-based so pellets never hang in the air
 * when the user stops scrolling.
 */
const NOT_LAUNCHED = -1;
const ALREADY_DOWN = -1e6;

export function FloatingPellets({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometry, material } = usePelletAssets();

  const pellets = useMemo(() => {
    const r = mulberry32(21);
    allocPool(feed.floating, count, 0.55, r);
    const { throws, start, cycle, grabAt, releaseAt } = FLOAT_FEED;
    return Array.from({ length: count }, (_, i) => {
      // clustered throw pattern: denser in the middle, like a hand-cast scoop
      const ang = r() * Math.PI * 2;
      const rad = Math.pow(r(), 0.7) * BOAT.landing.r;
      const k = i % throws;
      return {
        bx: BOAT.landing.x + Math.cos(ang) * rad,
        bz: BOAT.landing.z + Math.sin(ang) * rad * 0.75,
        grab: start + cycle * (k + grabAt),
        release: start + cycle * (k + releaseAt) + r() * 0.012,
        stagger: r() * 0.22, // seconds — a handful leaves the palm as a loose spray
        // offset inside the cupped palm
        ox: (r() - 0.5) * 0.06,
        oy: r() * 0.03,
        oz: (r() - 0.5) * 0.06,
        yaw: r() * Math.PI * 2,
        ph: r() * 10,
        launch: NOT_LAUNCHED, // clock time the pellet left the hand
        sx: 0,
        sy: 0,
        sz: 0,
        landed: false,
      };
    });
  }, [count]);

  useEffect(() => {
    if (ref.current) applyPelletColors(ref.current, count, 5, "#9a6430");
  }, [count]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const one = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const f = beatLocal("floating");
    const pool = feed.floating;
    const hand = feed.hand;
    if (f < 0.02) pool.alive.fill(1); // scrolled back to the start → restore

    for (let i = 0; i < count; i++) {
      const pl = pellets[i];
      if (f < pl.release) {
        pl.launch = NOT_LAUNCHED;
        pl.landed = false;
      } else if (pl.launch === NOT_LAUNCHED) {
        // crossing the release point: cast it — unless we arrived here by a
        // jump (anchor link / reload), in which case it is already on the water
        if (f - pl.release > 0.07) {
          pl.launch = ALREADY_DOWN;
          pl.landed = true;
        } else {
          pl.launch = t + pl.stagger;
        }
      }
      if (f < pl.grab || !pool.alive[i]) {
        pool.settled[i] = 0;
        mesh.setMatrixAt(i, HIDDEN);
        continue;
      }

      let x: number, y: number, z: number;
      const dt = t - pl.launch;
      if (pl.launch === NOT_LAUNCHED || dt < 0) {
        // carried in the farmer's cupped hand
        x = pl.sx = hand.x + pl.ox;
        y = pl.sy = hand.y + pl.oy;
        z = pl.sz = hand.z + pl.oz;
        e.set(pl.ph, pl.yaw, 0);
        pool.settled[i] = 0;
      } else {
        const dist = Math.hypot(pl.bx - pl.sx, pl.bz - pl.sz);
        const u = dt / (0.5 + dist * 0.14);
        if (u < 1) {
          // short arc from the hand to the water
          x = pl.sx + (pl.bx - pl.sx) * u;
          z = pl.sz + (pl.bz - pl.sz) * u;
          y = pl.sy + (WORLD.surfaceY - pl.sy) * u * u + (0.12 + dist * 0.1) * 4 * u * (1 - u);
          e.set(t * 5 + pl.ph, pl.yaw, t * 3);
          pool.settled[i] = 0;
        } else {
          // resting on the surface: slow drift + bob with the waves
          x = pl.bx + Math.sin(t * 0.13 + pl.ph) * 0.08;
          z = pl.bz + Math.cos(t * 0.11 + pl.ph * 1.3) * 0.08;
          y = waveHeight(x, z, t) + 0.006;
          e.set(Math.sin(t * 1.3 + pl.ph) * 0.15, pl.yaw + t * 0.05, Math.cos(t * 1.1 + pl.ph) * 0.15);
          pool.settled[i] = 1;
          if (!pl.landed && i % 3 === 0) addRipple(x, z, 0.45);
          pl.landed = true;
        }
      }
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
