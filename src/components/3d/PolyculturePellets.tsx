import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePelletAssets, applyPelletColors, HIDDEN } from "./pellets";
import { feed, allocPool } from "./feedState";
import { beatLocal } from "@/lib/storyStore";
import { mulberry32 } from "@/lib/pondMath";
import { WORLD } from "@/config/story";

/**
 * POLYCULTURE FEED
 * Pellets are introduced from the surface above the feeding structure, are
 * guided by the funnel net and settle onto the tray where fish and shrimp
 * share them.
 */
function funnelRadius(y: number) {
  const u = (WORLD.netTopY - y) / (WORLD.netTopY - WORLD.netBottomY);
  return THREE.MathUtils.lerp(WORLD.netTopR, WORLD.netBottomR, THREE.MathUtils.clamp(u, 0, 1));
}

export function PolyculturePellets({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometry, material } = usePelletAssets();

  const pellets = useMemo(() => {
    const r = mulberry32(44);
    allocPool(feed.poly, count, 0.6, r);
    return Array.from({ length: count }, () => ({
      ang: r() * Math.PI * 2,
      r0: Math.sqrt(r()) * 2.0,
      rLand: Math.sqrt(r()) * (WORLD.trayR - 0.35),
      delay: 0.03 + r() * 0.36,
      dur: 0.24 + r() * 0.08,
      ph: r() * 10,
    }));
  }, [count]);

  useEffect(() => {
    if (ref.current) applyPelletColors(ref.current, count, 13, "#a8743c");
  }, [count]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const one = useMemo(() => new THREE.Vector3(1.2, 1.2, 1.2), []);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const qp = beatLocal("polyculture");
    const pool = feed.poly;
    if (qp < 0.02) pool.alive.fill(1);
    const landY = WORLD.trayY + 0.035;

    for (let i = 0; i < count; i++) {
      const pl = pellets[i];
      const u = (qp - pl.delay) / pl.dur;
      if (u <= 0 || !pool.alive[i]) {
        pool.settled[i] = 0;
        mesh.setMatrixAt(i, HIDDEN);
        continue;
      }
      const uc = Math.min(1, u);
      const y = THREE.MathUtils.lerp(WORLD.surfaceY - 0.05, landY, uc); // constant (terminal) sink speed
      // the funnel net gathers pellets toward the tray
      let r = pl.r0;
      if (y < WORLD.netTopY) r = Math.min(r, funnelRadius(y) * 0.82);
      if (y < WORLD.netBottomY) {
        const k = (WORLD.netBottomY - y) / (WORLD.netBottomY - landY);
        r = THREE.MathUtils.lerp(Math.min(pl.r0, WORLD.netBottomR * 0.8), pl.rLand, THREE.MathUtils.clamp(k, 0, 1));
      }
      const wob = uc < 1 ? Math.sin(t * 0.8 + pl.ph) * 0.03 : 0;
      const x = WORLD.net.x + Math.cos(pl.ang) * r + wob;
      const z = WORLD.net.z + Math.sin(pl.ang) * r + wob;
      pool.settled[i] = uc >= 1 ? 1 : 0;
      if (uc >= 1) e.set(0, pl.ang, 0);
      else e.set(t * 1.2 + pl.ph, pl.ang, t * 0.9);
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
