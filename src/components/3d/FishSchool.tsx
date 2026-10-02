import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useFishGeometry, useFishMaterial } from "./Fish";
import { feed, addRipple, type PelletPool } from "./feedState";
import { beatLocal } from "@/lib/storyStore";
import { mulberry32, terrainHeight } from "@/lib/pondMath";
import { WORLD } from "@/config/story";

export type FishBehaviour = "surface" | "sinking" | "bottom";

interface FishSchoolProps {
  count: number;
  seed: number;
  behaviour: FishBehaviour;
  /** centre + half-extent of the area the fish wander in when not feeding */
  center: [number, number, number];
  extent: [number, number, number];
  size: [number, number];
  /** instance tints (multiplied with the vertex colours) */
  palette: string[];
  cruise?: number;
}

interface FishAgent {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  wp: THREE.Vector3;
  quat: THREE.Quaternion;
  size: number;
  phase: number;
  amp: number;
  target: number; // pellet index or -1
  cooldown: number; // seconds of "swim away after a bite"
  offsetAng: number;
  offsetR: number;
  personality: number; // 0..1 — varies speed / turn rate so fish never sync
}

const UP = new THREE.Vector3(0, 1, 0);
const tmpV = new THREE.Vector3();
const tmpV2 = new THREE.Vector3();
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const rollQ = new THREE.Quaternion();
const scaleV = new THREE.Vector3();
const Z = new THREE.Vector3(0, 0, 1);

/** Nearest alive + edible + settled pellet to p, or -1. */
function nearestPellet(pool: PelletPool, p: THREE.Vector3, maxDist: number, requireSettled: boolean) {
  let best = -1, bd = maxDist * maxDist;
  for (let j = 0; j < pool.count; j++) {
    if (!pool.alive[j] || !pool.edible[j] || (requireSettled && !pool.settled[j])) continue;
    const dx = pool.pos[j * 3] - p.x, dy = pool.pos[j * 3 + 1] - p.y, dz = pool.pos[j * 3 + 2] - p.z;
    const d = dx * dx + dy * dy + dz * dz;
    if (d < bd) { bd = d; best = j; }
  }
  return best;
}

/**
 * FISH SCHOOL — lightweight steering simulation (seek + wander + separation)
 * on the CPU, rendered as one InstancedMesh. Behaviour switches with the
 * scroll story: fish rise to floating pellets, follow the sinking cloud, or
 * gather at the polyculture feeding tray.
 */
export function FishSchool({ count, seed, behaviour, center, extent, size, palette, cruise = 0.55 }: FishSchoolProps) {
  const geometry = useFishGeometry();
  const material = useFishMaterial();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { agents, phaseAttr, ampAttr } = useMemo(() => {
    const rand = mulberry32(seed);
    const rnd = (a: number, b: number) => a + (b - a) * rand();
    const agents: FishAgent[] = Array.from({ length: count }, () => {
      const pos = new THREE.Vector3(
        center[0] + rnd(-extent[0], extent[0]),
        center[1] + rnd(-extent[1], extent[1]),
        center[2] + rnd(-extent[2], extent[2])
      );
      const vel = new THREE.Vector3(rnd(-1, 1), 0, rnd(-1, 1)).normalize().multiplyScalar(cruise);
      return {
        pos,
        vel,
        wp: pos.clone(),
        quat: new THREE.Quaternion(),
        size: rnd(size[0], size[1]),
        phase: rnd(0, Math.PI * 2),
        amp: 1,
        target: -1,
        cooldown: 0,
        offsetAng: rnd(0, Math.PI * 2),
        offsetR: rnd(0.5, 1.5),
        personality: rand(),
      };
    });
    const phaseAttr = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    const ampAttr = new THREE.InstancedBufferAttribute(new Float32Array(count).fill(1), 1);
    phaseAttr.setUsage(THREE.DynamicDrawUsage);
    ampAttr.setUsage(THREE.DynamicDrawUsage);
    return { agents, phaseAttr, ampAttr };
  }, [count, seed, center, extent, size, cruise]);

  // Per-instance geometry clone so each school gets its own phase/amp buffers.
  const geo = useMemo(() => {
    const g = geometry.clone();
    g.setAttribute("aPhase", phaseAttr);
    g.setAttribute("aAmp", ampAttr);
    return g;
  }, [geometry, phaseAttr, ampAttr]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const c = new THREE.Color();
    const rand = mulberry32(seed + 7);
    for (let i = 0; i < count; i++) {
      c.set(palette[i % palette.length]).multiplyScalar(0.9 + rand() * 0.2);
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.frustumCulled = false; // agents roam; bounds would be stale
  }, [count, palette, seed]);

  useEffect(() => () => geo.dispose(), [geo]);

  const rand = useMemo(() => mulberry32(seed + 99), [seed]);

  useFrame((state, rawDt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(rawDt, 1 / 20);
    const t = state.clock.elapsedTime;

    // ---- which story beat drives this school right now? ------------------
    const f = beatLocal("floating");
    const s = beatLocal("sinking");
    const q = beatLocal("polyculture");
    let feeding = false;
    let pool: PelletPool | null = null;
    if (behaviour === "surface") {
      feeding = f > 0.3 && s < 0.4;
      pool = feed.floating;
    } else if (behaviour === "sinking") {
      feeding = feed.sinkActive;
      pool = feed.sinking;
    } else {
      feeding = q > 0.2;
      pool = feed.poly;
    }

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const pers = a.personality;
      let maxSpeed = cruise * (0.8 + pers * 0.4);
      let target: THREE.Vector3 | null = null;
      a.cooldown = Math.max(0, a.cooldown - dt);

      // ---- behaviour targets --------------------------------------------
      const isFeeder = i < Math.ceil(agents.length * 0.75);
      if (feeding && isFeeder && a.cooldown <= 0 && pool) {
        if (behaviour === "sinking" && i % 2 === 1) {
          // half the mid-water school shadows the descending pellet cloud
          const ang = a.offsetAng + t * 0.15;
          target = tmpV.set(
            feed.sinkCenter.x + Math.cos(ang) * (0.9 + a.offsetR),
            feed.sinkCenter.y + (pers - 0.5) * 1.2,
            feed.sinkCenter.z + Math.sin(ang) * (0.9 + a.offsetR)
          );
          maxSpeed *= 1.7;
        } else {
          if (a.target < 0 || !pool.alive[a.target]) {
            a.target = nearestPellet(pool, a.pos, behaviour === "bottom" ? 8 : 6, behaviour !== "sinking");
          }
          if (a.target >= 0) {
            const j = a.target;
            const lift = behaviour === "surface" ? -0.09 : behaviour === "bottom" ? 0.16 : 0;
            target = tmpV.set(pool.pos[j * 3], pool.pos[j * 3 + 1] + lift, pool.pos[j * 3 + 2]);
            maxSpeed *= behaviour === "bottom" ? 1.25 : 1.8;
            const canEat = behaviour !== "bottom" || q > 0.5;
            if (canEat && a.pos.distanceTo(target) < 0.17 + a.size * 0.08) {
              // bite!
              pool.alive[j] = 0;
              a.target = -1;
              a.cooldown = 1.2 + pers * 1.8;
              if (behaviour === "surface") addRipple(target.x, target.z, 1);
              a.wp.set(a.pos.x + (rand() - 0.5) * 3, a.pos.y - 0.8 - rand(), a.pos.z + (rand() - 0.5) * 3);
            }
          } else if (behaviour === "bottom") {
            // no pellets left in reach: patrol around the funnel mouth
            const ang = a.offsetAng + t * 0.2;
            target = tmpV.set(
              WORLD.net.x + Math.cos(ang) * (WORLD.netTopR + 0.4),
              WORLD.netBottomY + (pers - 0.3) * 1.6,
              WORLD.net.z + Math.sin(ang) * (WORLD.netTopR + 0.4)
            );
          }
        }
      }

      // ---- wander -------------------------------------------------------
      const wandering = !target;
      if (!target) {
        if (a.pos.distanceToSquared(a.wp) < 0.5 || rand() < dt * 0.08) {
          a.wp.set(
            center[0] + (rand() * 2 - 1) * extent[0],
            center[1] + (rand() * 2 - 1) * extent[1],
            center[2] + (rand() * 2 - 1) * extent[2]
          );
        }
        target = tmpV.copy(a.wp);
      }

      // ---- steering: seek (with arrival) + separation ----------------------
      const desired = tmpV2.subVectors(target, a.pos);
      const dist = desired.length();
      const arrive = Math.min(1, dist / 0.8);
      desired.multiplyScalar((maxSpeed * Math.max(0.25, arrive)) / Math.max(dist, 1e-4));
      for (let k = 0; k < agents.length; k++) {
        if (k === i) continue;
        const o = agents[k];
        const dx = a.pos.x - o.pos.x, dy = a.pos.y - o.pos.y, dz = a.pos.z - o.pos.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 0.36 && d2 > 1e-6) {
          const push = (0.36 - d2) * 2.2;
          desired.x += dx * push;
          desired.y += dy * push * 0.5;
          desired.z += dz * push;
        }
      }
      const turnRate = 1.6 + pers * 1.2;
      a.vel.lerp(desired, 1 - Math.exp(-dt * turnRate));
      // keep fish mostly level: limit pitch unless feeding at surface/bottom
      const sp = a.vel.length();
      const maxVy = sp * (wandering ? 0.35 : 0.8);
      a.vel.y = THREE.MathUtils.clamp(a.vel.y, -maxVy, maxVy);
      const minSpeed = cruise * 0.35;
      if (sp < minSpeed) a.vel.multiplyScalar(minSpeed / Math.max(sp, 1e-4));

      const prevDirX = a.vel.x, prevDirZ = a.vel.z;
      a.pos.addScaledVector(a.vel, dt);

      // ---- environment limits --------------------------------------------
      const ceiling = WORLD.surfaceY - 0.06 - a.size * 0.08;
      if (a.pos.y > ceiling) { a.pos.y = ceiling; a.vel.y = Math.min(0, a.vel.y); }
      const floor = terrainHeight(a.pos.x, a.pos.z) + 0.25 + a.size * 0.15;
      if (a.pos.y < floor) { a.pos.y = floor; a.vel.y = Math.max(0, a.vel.y); }

      // ---- orientation: face velocity, bank into turns --------------------
      const look = tmpV2.copy(a.pos).add(a.vel);
      tmpM.lookAt(look, a.pos, UP);
      tmpQ.setFromRotationMatrix(tmpM);
      const turn = (prevDirX * a.vel.z - prevDirZ * a.vel.x) / Math.max(sp * sp, 1e-3);
      rollQ.setFromAxisAngle(Z, THREE.MathUtils.clamp(turn * 8, -0.45, 0.45));
      tmpQ.multiply(rollQ);
      a.quat.slerp(tmpQ, 1 - Math.exp(-dt * 6));

      // ---- tail beat: frequency follows speed ------------------------------
      const speedN = sp / cruise;
      a.phase += dt * (4.5 + speedN * 5.5) * (0.85 + pers * 0.3);
      a.amp = THREE.MathUtils.lerp(a.amp, 0.55 + Math.min(speedN, 2.2) * 0.4, 1 - Math.exp(-dt * 3));
      phaseAttr.array[i] = a.phase;
      ampAttr.array[i] = a.amp;

      scaleV.setScalar(a.size);
      tmpM.compose(a.pos, a.quat, scaleV);
      mesh.setMatrixAt(i, tmpM);
    }
    mesh.instanceMatrix.needsUpdate = true;
    phaseAttr.needsUpdate = true;
    ampAttr.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, material, count]} />;
}
