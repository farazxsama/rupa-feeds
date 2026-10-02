import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createShrimpGeometry } from "./geometry/shrimpGeometry";
import { patchPondMaterial } from "./pondMaterial";
import { feed } from "./feedState";
import { beatLocal } from "@/lib/storyStore";
import { mulberry32, terrainHeight, smoothstep } from "@/lib/pondMath";
import { WORLD } from "@/config/story";

/**
 * SHRIMP — bottom-dwelling agents around the polyculture feeding tray.
 * Slow walk / pause cycles; during the polyculture beat they walk onto the
 * tray and pick at settled pellets. One InstancedMesh, GPU leg/antenna motion.
 * Swap `createShrimpGeometry()` for a GLB (same aBody / aPart attributes).
 */

const SHRIMP_GLSL = {
  header: /* glsl */ `
    attribute float aBody;
    attribute float aPart;
    attribute float aPhase;
  `,
  deform: /* glsl */ `
    if (aPart > 1.5) {
      // antennae: slow independent sway
      transformed.x += sin(uPondTime * 1.4 + aPhase * 0.3 + aBody * 3.0) * 0.03 * aBody;
      transformed.y += sin(uPondTime * 1.1 + aPhase * 0.2 + aBody * 2.0) * 0.02 * aBody;
    } else if (aPart > 0.5) {
      // legs / swimmerets: metachronal ripple (phase offset along the body)
      transformed.z += sin(aPhase + position.z * 40.0 + sign(position.x) * 1.57) * 0.012;
    } else if (aBody > 0.6) {
      transformed.y += sin(aPhase * 0.5) * 0.008 * (aBody - 0.6);
    }
  `,
};

/** Ground height including the raised feeding tray. */
function groundAt(x: number, z: number) {
  const r = Math.hypot(x - WORLD.net.x, z - WORLD.net.z);
  const ground = terrainHeight(x, z);
  const tray = WORLD.trayY + 0.03;
  const w = 1 - smoothstep(WORLD.trayR - 0.15, WORLD.trayR + 0.12, r);
  return ground + (tray - ground) * w;
}

interface Agent {
  x: number;
  z: number;
  yaw: number;
  speed: number;
  wx: number;
  wz: number;
  pause: number;
  phase: number;
  target: number;
  size: number;
}

export function Shrimp({ count, seed = 11 }: { count: number; seed?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const baseGeo = useMemo(() => createShrimpGeometry(), []);
  const material = useMemo(
    () =>
      patchPondMaterial(
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.05, side: THREE.DoubleSide }),
        { vertexHeader: SHRIMP_GLSL.header, vertexDeform: SHRIMP_GLSL.deform }
      ),
    []
  );
  const rand = useMemo(() => mulberry32(seed), [seed]);

  const { agents, phaseAttr, geo } = useMemo(() => {
    const r = mulberry32(seed + 1);
    const agents: Agent[] = Array.from({ length: count }, () => {
      const ang = r() * Math.PI * 2, rad = 2.2 + r() * 2.4;
      const x = WORLD.net.x + Math.cos(ang) * rad, z = WORLD.net.z + Math.sin(ang) * rad;
      return { x, z, yaw: r() * Math.PI * 2, speed: 0, wx: x, wz: z, pause: r() * 3, phase: r() * 10, target: -1, size: 0.8 + r() * 0.3 };
    });
    const phaseAttr = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    phaseAttr.setUsage(THREE.DynamicDrawUsage);
    const geo = baseGeo.clone();
    geo.setAttribute("aPhase", phaseAttr);
    return { agents, phaseAttr, geo };
  }, [count, seed, baseGeo]);

  useEffect(() => {
    if (meshRef.current) meshRef.current.frustumCulled = false;
    return () => {
      geo.dispose();
      baseGeo.dispose();
      material.dispose();
    };
  }, [geo, baseGeo, material]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(rawDt, 1 / 20);
    const poly = beatLocal("polyculture");
    const pool = feed.poly;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      let tx = a.wx, tz = a.wz;
      let walk = 0.11;

      // during the polyculture beat: walk onto the tray toward settled pellets
      if (poly > 0.3 && i < Math.ceil(agents.length * 0.8)) {
        if (a.target < 0 || !pool.alive[a.target]) {
          let best = -1, bd = 1e9;
          for (let j = 0; j < pool.count; j++) {
            if (!pool.alive[j] || !pool.settled[j] || !pool.edible[j]) continue;
            const d = (pool.pos[j * 3] - a.x) ** 2 + (pool.pos[j * 3 + 2] - a.z) ** 2;
            if (d < bd) { bd = d; best = j; }
          }
          a.target = best;
        }
        if (a.target >= 0) {
          tx = pool.pos[a.target * 3];
          tz = pool.pos[a.target * 3 + 2];
          walk = 0.2;
          if (Math.hypot(tx - a.x, tz - a.z) < 0.1 && poly > 0.5) {
            pool.alive[a.target] = 0; // picked up
            a.target = -1;
            a.pause = 1.2 + rand() * 1.5;
          }
        }
      } else if (Math.hypot(a.wx - a.x, a.wz - a.z) < 0.15) {
        const ang = rand() * Math.PI * 2, rad = 1.9 + rand() * 2.8;
        a.wx = WORLD.net.x + Math.cos(ang) * rad;
        a.wz = WORLD.net.z + Math.sin(ang) * rad;
        a.pause = 0.8 + rand() * 3;
      }

      // walk / pause cycle
      a.pause -= dt;
      const goal = a.pause > 0 ? 0 : walk;
      a.speed += (goal - a.speed) * (1 - Math.exp(-dt * 3));
      const desiredYaw = Math.atan2(tx - a.x, tz - a.z);
      let dy = desiredYaw - a.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      a.yaw += dy * (1 - Math.exp(-dt * 1.8));
      a.x += Math.sin(a.yaw) * a.speed * dt;
      a.z += Math.cos(a.yaw) * a.speed * dt;
      a.phase += dt * (1.5 + a.speed * 60);
      phaseAttr.array[i] = a.phase;

      const y = groundAt(a.x, a.z) + 0.09 * a.size;
      // slight nose-down pitch while walking, nose-up when idle
      e.set(-0.06 + a.speed * 0.3, a.yaw, 0, "YXZ");
      q.setFromEuler(e);
      m.compose(p.set(a.x, y, a.z), q, s.setScalar(a.size));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    phaseAttr.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, material, count]} />;
}
