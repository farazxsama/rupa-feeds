import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePelletAssets, applyPelletColors, HIDDEN } from "./pellets";
import { feed, allocPool, addRipple } from "./feedState";
import { beatLocal } from "@/lib/storyStore";
import { mulberry32, waveHeight } from "@/lib/pondMath";
import { WORLD } from "@/config/story";

/**
 * FLOATING FEED
 * Pellets are scattered onto the pond (scroll-driven drop), then *stay on the
 * surface*, riding the exact same wave function as the water shader.
 * Fish (FishSchool behaviour "surface") rise and take some of them.
 */
export function FloatingPellets({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometry, material } = usePelletAssets();

  const pellets = useMemo(() => {
    const r = mulberry32(21);
    allocPool(feed.floating, count, 0.55, r);
    return Array.from({ length: count }, () => {
      // clustered throw pattern: denser in the middle, like a hand-cast scoop
      const ang = r() * Math.PI * 2;
      const rad = Math.pow(r(), 0.7) * 1.8;
      return {
        bx: WORLD.floating.x + Math.cos(ang) * rad,
        bz: WORLD.floating.z + Math.sin(ang) * rad * 0.8,
        delay: 0.04 + r() * 0.26,
        yaw: r() * Math.PI * 2,
        ph: r() * 10,
        prevU: 0,
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
    if (f < 0.02) pool.alive.fill(1); // scrolled back to the start → restore

    for (let i = 0; i < count; i++) {
      const pl = pellets[i];
      const u = Math.min(1, Math.max(0, (f - pl.delay) / 0.1));
      if (u <= 0 || !pool.alive[i]) {
        pool.settled[i] = 0;
        mesh.setMatrixAt(i, HIDDEN);
        pl.prevU = u;
        continue;
      }
      let x = pl.bx, z = pl.bz, y: number;
      if (u < 1) {
        // falling through the air (gravity-like ease-in)
        y = THREE.MathUtils.lerp(2.6, WORLD.surfaceY, u * u);
        e.set(t * 3 + pl.ph, pl.yaw, t * 2);
        pool.settled[i] = 0;
      } else {
        // resting on the surface: slow drift + bob with the waves
        x += Math.sin(t * 0.13 + pl.ph) * 0.08;
        z += Math.cos(t * 0.11 + pl.ph * 1.3) * 0.08;
        y = waveHeight(x, z, t) + 0.006;
        e.set(Math.sin(t * 1.3 + pl.ph) * 0.15, pl.yaw + t * 0.05, Math.cos(t * 1.1 + pl.ph) * 0.15);
        pool.settled[i] = 1;
        if (pl.prevU < 1 && i % 3 === 0) addRipple(x, z, 0.45);
      }
      pl.prevU = u;
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
