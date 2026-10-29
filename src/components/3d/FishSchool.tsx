import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useFishGeometry, useFishMaterial } from "./Fish";
import { feed, addRipple, type PelletPool } from "./feedState";
import { beatLocal, story } from "@/lib/storyStore";
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
  /** unit swim direction — the fish only ever moves forward along it */
  heading: THREE.Vector3;
  speed: number;
  /** current turning speed (rad/s), eased so turns start and stop gently */
  angVel: number;
  /** signed yaw rate (rad/s, smoothed): drives body curve and banking */
  yawRate: number;
  yaw: number;
  wp: THREE.Vector3;
  /** seconds until the fish picks a new wander point even if it hasn't arrived */
  wpTimer: number;
  quat: THREE.Quaternion;
  size: number;
  phase: number;
  amp: number;
  target: number; // pellet index or -1
  cooldown: number; // seconds of "swim away after a bite"
  offsetAng: number;
  offsetR: number;
  personality: number; // 0..1 — varies speed / turn rate so fish never sync
  rhythm: number; // per-fish phase for speed / glide / bob variation
}

/** Every live school registers here so fish keep their distance across schools too. */
export const SCHOOLS = new Set<FishAgent[]>();

const UP = new THREE.Vector3(0, 1, 0);
const tmpV = new THREE.Vector3();
const desired = new THREE.Vector3();
const sep = new THREE.Vector3();
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const turnQ = new THREE.Quaternion();
const rollQ = new THREE.Quaternion();
const scaleV = new THREE.Vector3();
const renderPos = new THREE.Vector3();
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
 * FISH SCHOOL — lightweight steering simulation on the CPU, rendered as one
 * InstancedMesh. Each fish keeps a heading and a speed: it turns toward its
 * goal with an eased, capped turn rate (head leads, the body curves after it
 * in the swim shader) and speeds up / slows down gradually, so it never
 * slides sideways or reverses. Wander goals are picked ahead of the fish, and
 * fish keep their distance from every other fish in the pond.
 * Behaviour switches with the scroll story: surface fish rise to floating
 * pellets; schools whose feed is not in the scene simply roam.
 */
export function FishSchool({ count, seed, behaviour, center, extent, size, palette, cruise = 0.55 }: FishSchoolProps) {
  const geometry = useFishGeometry();
  const material = useFishMaterial();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { agents, phaseAttr, ampAttr, bendAttr } = useMemo(() => {
    const rand = mulberry32(seed);
    const rnd = (a: number, b: number) => a + (b - a) * rand();
    const agents: FishAgent[] = Array.from({ length: count }, () => {
      const pos = new THREE.Vector3(
        center[0] + rnd(-extent[0], extent[0]),
        center[1] + rnd(-extent[1], extent[1]),
        center[2] + rnd(-extent[2], extent[2])
      );
      const yaw = rnd(0, Math.PI * 2);
      const heading = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      return {
        pos,
        heading,
        speed: cruise * rnd(0.6, 0.9),
        angVel: 0,
        yawRate: 0,
        yaw,
        wp: pos.clone().addScaledVector(heading, 2),
        wpTimer: rnd(2, 8),
        quat: new THREE.Quaternion().setFromUnitVectors(Z, heading),
        size: rnd(size[0], size[1]),
        phase: rnd(0, Math.PI * 2),
        amp: 1,
        target: -1,
        cooldown: 0,
        offsetAng: rnd(0, Math.PI * 2),
        offsetR: rnd(0.5, 1.5),
        personality: rand(),
        rhythm: rnd(0, 100),
      };
    });
    const dyn = (fill: number) => {
      const a = new THREE.InstancedBufferAttribute(new Float32Array(count).fill(fill), 1);
      a.setUsage(THREE.DynamicDrawUsage);
      return a;
    };
    return { agents, phaseAttr: dyn(0), ampAttr: dyn(1), bendAttr: dyn(0) };
  }, [count, seed, center, extent, size, cruise]);

  useEffect(() => {
    SCHOOLS.add(agents);
    return () => void SCHOOLS.delete(agents);
  }, [agents]);

  // Per-instance geometry clone so each school gets its own phase/amp/bend buffers.
  const geo = useMemo(() => {
    const g = geometry.clone();
    g.setAttribute("aPhase", phaseAttr);
    g.setAttribute("aAmp", ampAttr);
    g.setAttribute("aBend", bendAttr);
    return g;
  }, [geometry, phaseAttr, ampAttr, bendAttr]);

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
    const calm = story.reducedMotion;

    /** New wander goal ahead of the fish (within ±~100°), kept inside the school's area. */
    const pickWaypoint = (a: FishAgent) => {
      const yaw = Math.atan2(a.heading.x, a.heading.z) + (rand() * 2 - 1) * 1.75;
      const dist = 2.2 + rand() * 3.5;
      a.wp.set(
        THREE.MathUtils.clamp(a.pos.x + Math.sin(yaw) * dist, center[0] - extent[0], center[0] + extent[0]),
        center[1] + (rand() * 2 - 1) * extent[1],
        THREE.MathUtils.clamp(a.pos.z + Math.cos(yaw) * dist, center[2] - extent[2], center[2] + extent[2])
      );
      a.wpTimer = 5 + rand() * 9;
    };

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
    // feed groups that are not in the scene leave their pool empty → keep roaming naturally
    if (pool && pool.count === 0) feeding = false;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const pers = a.personality;
      a.cooldown = Math.max(0, a.cooldown - dt);
      a.wpTimer -= dt;

      // ---- goal: pellet, sinking cloud or wander point ------------------
      let goal: THREE.Vector3 | null = null;
      let urgency = 0; // 0 relaxed … 1 chasing food
      const isFeeder = i < Math.ceil(agents.length * 0.75);
      if (feeding && isFeeder && a.cooldown <= 0 && pool) {
        if (behaviour === "sinking" && i % 2 === 1) {
          // half the mid-water school shadows the descending pellet cloud
          const ang = a.offsetAng + t * 0.15;
          goal = tmpV.set(
            feed.sinkCenter.x + Math.cos(ang) * (0.9 + a.offsetR),
            feed.sinkCenter.y + (pers - 0.5) * 1.2,
            feed.sinkCenter.z + Math.sin(ang) * (0.9 + a.offsetR)
          );
          urgency = 0.7;
        } else {
          if (a.target < 0 || !pool.alive[a.target]) {
            a.target = nearestPellet(pool, a.pos, behaviour === "bottom" ? 8 : 6, behaviour !== "sinking");
          }
          if (a.target >= 0) {
            const j = a.target;
            const lift = behaviour === "surface" ? -0.09 : behaviour === "bottom" ? 0.16 : 0;
            goal = tmpV.set(pool.pos[j * 3], pool.pos[j * 3 + 1] + lift, pool.pos[j * 3 + 2]);
            urgency = 1;
            const canEat = behaviour !== "bottom" || q > 0.5;
            if (canEat && a.pos.distanceTo(goal) < 0.17 + a.size * 0.08) {
              // bite, then drift away and down before coming back
              pool.alive[j] = 0;
              a.target = -1;
              a.cooldown = 1.2 + pers * 1.8;
              if (behaviour === "surface") addRipple(goal.x, goal.z, 1);
              a.wp.set(a.pos.x + (rand() - 0.5) * 3, a.pos.y - 0.8 - rand(), a.pos.z + (rand() - 0.5) * 3);
              a.wpTimer = 4 + rand() * 3;
              goal = null;
              urgency = 0;
            }
          } else if (behaviour === "bottom") {
            // no pellets left in reach: patrol around the funnel mouth
            const ang = a.offsetAng + t * 0.2;
            goal = tmpV.set(
              WORLD.net.x + Math.cos(ang) * (WORLD.netTopR + 0.4),
              WORLD.netBottomY + (pers - 0.3) * 1.6,
              WORLD.net.z + Math.sin(ang) * (WORLD.netTopR + 0.4)
            );
            urgency = 0.4;
          }
        }
      }
      if (!goal) {
        if (a.pos.distanceToSquared(a.wp) < 0.8 || a.wpTimer <= 0) pickWaypoint(a);
        goal = tmpV.copy(a.wp);
      }

      // ---- desired direction: goal + spacing + soft surface / floor ------
      desired.subVectors(goal, a.pos);
      const goalDist = desired.length();
      desired.multiplyScalar(1 / Math.max(goalDist, 1e-4));

      sep.set(0, 0, 0);
      for (const school of SCHOOLS) {
        for (let k = 0; k < school.length; k++) {
          const o = school[k];
          if (o === a) continue;
          const dx = a.pos.x - o.pos.x, dy = a.pos.y - o.pos.y, dz = a.pos.z - o.pos.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          const rr = (a.size + o.size) * 0.62;
          if (d2 < rr * rr && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const w = (1 - d / rr) ** 2 * 2.4;
            sep.x += (dx / d) * w;
            sep.y += (dy / d) * w * 0.5;
            sep.z += (dz / d) * w;
          }
        }
      }
      desired.addScaledVector(sep, 1 - urgency * 0.5);

      const ceiling = WORLD.surfaceY - 0.06 - a.size * 0.08;
      const floor = terrainHeight(a.pos.x, a.pos.z) + 0.25 + a.size * 0.15;
      if (urgency < 1) {
        if (a.pos.y > ceiling - 0.45) desired.y -= (a.pos.y - (ceiling - 0.45)) * 2.5;
        if (a.pos.y < floor + 0.55) desired.y += (floor + 0.55 - a.pos.y) * 2.5;
      }
      // keep fish mostly level: limit pitch unless chasing food
      const maxPitch = urgency > 0.5 ? 0.75 : 0.32;
      const horiz = Math.max(Math.hypot(desired.x, desired.z), 0.3);
      desired.y = THREE.MathUtils.clamp(desired.y, -maxPitch * horiz, maxPitch * horiz);
      if (desired.lengthSq() < 1e-6) desired.copy(a.heading);
      desired.normalize();

      // ---- turn: eased angular velocity, capped per fish ------------------
      const angle = a.heading.angleTo(desired);
      const maxTurn = (0.75 + pers * 0.65) * (1 + urgency * 0.9);
      const wantTurn = Math.min(angle * 1.4, maxTurn);
      a.angVel += (wantTurn - a.angVel) * (1 - Math.exp(-dt * (2.2 + urgency * 2)));
      const step = Math.min(angle, a.angVel * dt);
      if (angle > 1e-4) {
        turnQ.setFromUnitVectors(a.heading, desired);
        tmpQ.identity().slerp(turnQ, step / angle);
        a.heading.applyQuaternion(tmpQ).normalize();
      }

      // ---- speed: slow rhythmic variation, short glides, gentle accel ------
      const r = a.rhythm;
      const glide = urgency < 0.5 && Math.sin(t * (0.21 + pers * 0.12) + r) > 0.72;
      let targetSpeed = cruise * (0.78 + pers * 0.4) * (1 + 0.22 * Math.sin(t * (0.17 + pers * 0.09) + r * 1.7));
      targetSpeed *= 1 - 0.3 * Math.min(1, angle / 1.4); // ease off in tight turns
      if (glide) targetSpeed *= 0.62;
      if (urgency > 0) targetSpeed *= 1 + urgency * (behaviour === "bottom" ? 0.35 : 0.85);
      if (urgency === 1 && goalDist < 0.9) targetSpeed *= 0.55 + 0.45 * (goalDist / 0.9); // slow on arrival
      const prevSpeed = a.speed;
      a.speed += (targetSpeed - a.speed) * (1 - Math.exp(-dt * (glide ? 0.7 : 1.3)));
      const accel = (a.speed - prevSpeed) / Math.max(dt, 1e-4);

      a.pos.addScaledVector(a.heading, a.speed * dt);

      // ---- hard limits (surface / pond floor) -----------------------------
      if (a.pos.y > ceiling) {
        a.pos.y = ceiling;
        if (a.heading.y > 0) a.heading.setY(0).normalize();
      }
      const floorNow = terrainHeight(a.pos.x, a.pos.z) + 0.25 + a.size * 0.15;
      if (a.pos.y < floorNow) {
        a.pos.y = floorNow;
        if (a.heading.y < 0) a.heading.setY(0).normalize();
      }

      // ---- orientation: face the heading, bank into turns -----------------
      const yaw = Math.atan2(a.heading.x, a.heading.z);
      let dYaw = yaw - a.yaw;
      dYaw = Math.atan2(Math.sin(dYaw), Math.cos(dYaw));
      a.yaw = yaw;
      a.yawRate += (dYaw / Math.max(dt, 1e-4) - a.yawRate) * (1 - Math.exp(-dt * 4));
      tmpM.lookAt(tmpV.copy(a.pos).add(a.heading), a.pos, UP);
      tmpQ.setFromRotationMatrix(tmpM);
      rollQ.setFromAxisAngle(Z, THREE.MathUtils.clamp(-a.yawRate * 0.35, -0.38, 0.38));
      tmpQ.multiply(rollQ);
      a.quat.slerp(tmpQ, 1 - Math.exp(-dt * 7));

      // ---- tail beat follows speed; quieter while gliding ------------------
      const speedN = a.speed / cruise;
      a.phase += dt * (3.6 + speedN * 5.2) * (0.85 + pers * 0.3) * (glide ? 0.55 : 1);
      const ampTarget = (glide ? 0.3 : 0.5 + Math.min(speedN, 2.2) * 0.36) + THREE.MathUtils.clamp(accel / cruise, 0, 1) * 0.35;
      a.amp = THREE.MathUtils.lerp(a.amp, ampTarget, 1 - Math.exp(-dt * 2.5));
      phaseAttr.array[i] = a.phase;
      ampAttr.array[i] = a.amp;
      // body curve: head leads the turn, the tail follows
      bendAttr.array[i] = THREE.MathUtils.clamp(a.yawRate * 0.9, -1, 1);

      // gentle buoyancy bob (render only, so steering stays smooth)
      renderPos.copy(a.pos);
      if (!calm) renderPos.y += Math.sin(t * (0.55 + pers * 0.35) + r) * 0.035 * a.size;
      scaleV.setScalar(a.size);
      tmpM.compose(renderPos, a.quat, scaleV);
      mesh.setMatrixAt(i, tmpM);
    }
    mesh.instanceMatrix.needsUpdate = true;
    phaseAttr.needsUpdate = true;
    ampAttr.needsUpdate = true;
    bendAttr.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, material, count]} />;
}
