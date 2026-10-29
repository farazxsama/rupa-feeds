import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createShrimpGeometry } from "./geometry/shrimpGeometry";
import { patchPondMaterial } from "./pondMaterial";
import { SCHOOLS } from "./FishSchool";
import { story } from "@/lib/storyStore";
import { mulberry32, terrainHeight } from "@/lib/pondMath";

/**
 * SHRIMP — free-swimming agents in the lower half of the pond.
 * ------------------------------------------------------------------
 * Behaviour follows the reference footage (public/references/shrimp-swimming.mp4):
 *  - SWIM: steady head-first glide with a straight, level body. Propulsion
 *    comes from the swimmerets beating in a back-to-front wave under the
 *    abdomen — the body itself does not undulate like a fish.
 *  - HOVER: almost stationary in mid-water, often pitched steeply nose-up,
 *    slowly pivoting in place while the walking legs paddle.
 *  - REST: settles on the pond floor with the abdomen relaxed and curled.
 *  - Climbs and descents are steep diagonal glides (shrimp pitch much more
 *    than fish). The very long antennae trail backwards and lag behind turns.
 * Each shrimp runs its own state timer, speed and turning rate.
 *
 * GPU side: one InstancedMesh; per-instance attributes drive the swimmeret
 * stroke (aPhase), how hard it is swimming (aEffort), abdominal curl (aFlex)
 * and turn lag for the antennae (aBend). Geometry: geometry/shrimpGeometry.ts
 * (aBody 0 head → 1 tail; aPart 0 body, 1 legs / swimmerets, 2 antennae).
 */

const SHRIMP_GLSL = {
  header: /* glsl */ `
    attribute float aBody;
    attribute float aPart;
    attribute float aPhase;
    attribute float aEffort;
    attribute float aFlex;
    attribute float aBend;
  `,
  deform: /* glsl */ `
    // per-shrimp offset from its position, so antennae never sway in sync
    #ifdef USE_INSTANCING
      float sSeed = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 2.3;
    #else
      float sSeed = 0.0;
    #endif
    // abdomen: relaxed curl when idle, straight when swimming (tail fan follows)
    float abd = max(aBody - 0.4, 0.0);
    transformed.y -= aFlex * abd * abd * 0.22;
    transformed.z += aFlex * abd * abd * 0.05;
    if (aPart > 1.5) {
      // antennae: long whips trailing back, lagging behind turns, slow wave
      float tip = aBody * aBody;
      transformed.x += aBend * tip * 0.14;
      transformed.x += sin(uPondTime * 0.9 + sSeed + aBody * 3.5 + sign(position.x)) * 0.024 * tip;
      transformed.y += sin(uPondTime * 0.7 + sSeed * 1.3 + aBody * 2.6 + sign(position.x) * 2.0) * 0.018 * tip;
      transformed.y -= aEffort * 0.012 * tip;
    } else if (aPart > 0.5) {
      if (aBody > 0.42) {
        // swimmerets: power stroke travelling from tail to head (metachronal)
        float st = aPhase - aBody * 9.0;
        float k = 0.2 + aEffort;
        transformed.z -= sin(st) * 0.018 * k;
        transformed.y += cos(st) * 0.006 * k;
      } else {
        // walking legs: swept back a little while swimming, paddle slowly when hovering
        float reach = clamp(-position.y * 11.0, 0.0, 1.0);
        transformed.z -= aEffort * 0.022 * reach;
        transformed.z += sin(uPondTime * 2.2 + sSeed + position.z * 30.0 + sign(position.x) * 1.57) * 0.007 * reach * (1.0 - aEffort);
      }
    }
  `,
};

type Mode = "swim" | "hover" | "rest";

interface Agent {
  pos: THREE.Vector3;
  heading: THREE.Vector3; // unit, may pitch steeply
  speed: number;
  angVel: number;
  yaw: number;
  yawRate: number;
  mode: Mode;
  modeTime: number; // seconds left in the current mode
  wp: THREE.Vector3;
  hoverPitch: number;
  hoverYawDrift: number;
  size: number;
  phase: number;
  effort: number;
  flex: number;
  personality: number;
  rhythm: number;
  quat: THREE.Quaternion;
}

/** Where shrimp live: the deeper half of the pond the camera passes through. */
const AREA = { cx: 11.5, cz: -3, ex: 6.5, ez: 4.5, maxRise: 4.2 };
const MAX_PITCH = 1.2; // rad — shrimp pitch steeply (near-vertical hovering in the reference)

const UP = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const desired = new THREE.Vector3();
const sep = new THREE.Vector3();
const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const turnQ = new THREE.Quaternion();
const rollQ = new THREE.Quaternion();
const tmpM = new THREE.Matrix4();
const scaleV = new THREE.Vector3();

const ground = (x: number, z: number) => terrainHeight(x, z);
/** Re-express a direction with its pitch limited to ±max (keeps the yaw). */
const clampPitch = (v: THREE.Vector3, max: number) => {
  const h = Math.hypot(v.x, v.z);
  const p = THREE.MathUtils.clamp(Math.atan2(v.y, Math.max(h, 1e-5)), -max, max);
  const yaw = Math.atan2(v.x, v.z);
  return v.set(Math.sin(yaw) * Math.cos(p), Math.sin(p), Math.cos(yaw) * Math.cos(p));
};

export function Shrimp({ count, seed = 11 }: { count: number; seed?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const baseGeo = useMemo(() => createShrimpGeometry(), []);
  const material = useMemo(
    () =>
      patchPondMaterial(
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0, envMapIntensity: 0.6, side: THREE.DoubleSide }),
        { vertexHeader: SHRIMP_GLSL.header, vertexDeform: SHRIMP_GLSL.deform }
      ),
    []
  );
  const rand = useMemo(() => mulberry32(seed), [seed]);

  const { agents, attrs, geo } = useMemo(() => {
    const r = mulberry32(seed + 1);
    const modes: Mode[] = ["swim", "hover", "rest"];
    const agents: Agent[] = Array.from({ length: count }, () => {
      const x = AREA.cx + (r() * 2 - 1) * AREA.ex;
      const z = AREA.cz + (r() * 2 - 1) * AREA.ez;
      const mode = modes[Math.floor(r() * 3)];
      const size = 0.8 + r() * 0.3;
      const y = ground(x, z) + (mode === "rest" ? 0.09 * size : 0.4 + r() * r() * AREA.maxRise);
      const yaw = r() * Math.PI * 2;
      const heading = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      return {
        pos: new THREE.Vector3(x, y, z),
        heading,
        speed: 0,
        angVel: 0,
        yaw,
        yawRate: 0,
        mode,
        modeTime: 1 + r() * 6,
        wp: new THREE.Vector3(x, y, z),
        hoverPitch: 0,
        hoverYawDrift: 0,
        size,
        phase: r() * 10,
        effort: 0,
        flex: 0.3,
        personality: r(),
        rhythm: r() * 100,
        quat: new THREE.Quaternion().setFromUnitVectors(Z, heading),
      };
    });
    const dyn = (fill: number) => {
      const a = new THREE.InstancedBufferAttribute(new Float32Array(count).fill(fill), 1);
      a.setUsage(THREE.DynamicDrawUsage);
      return a;
    };
    const attrs = { phase: dyn(0), effort: dyn(0), flex: dyn(0.3), bend: dyn(0) };
    const geo = baseGeo.clone();
    geo.setAttribute("aPhase", attrs.phase);
    geo.setAttribute("aEffort", attrs.effort);
    geo.setAttribute("aFlex", attrs.flex);
    geo.setAttribute("aBend", attrs.bend);
    return { agents, attrs, geo };
  }, [count, seed, baseGeo]);

  useEffect(() => {
    if (meshRef.current) meshRef.current.frustumCulled = false;
    return () => {
      geo.dispose();
      baseGeo.dispose();
      material.dispose();
    };
  }, [geo, baseGeo, material]);

  useFrame((state, rawDt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(rawDt, 1 / 20);
    const t = state.clock.elapsedTime;
    const calm = story.reducedMotion;

    /** Next destination: anywhere in the area, mostly low in the water column. */
    const pickWaypoint = (a: Agent) => {
      const ang = Math.atan2(a.heading.x, a.heading.z) + (rand() * 2 - 1) * 2.0;
      const dist = 1.2 + rand() * 3.2;
      const x = THREE.MathUtils.clamp(a.pos.x + Math.sin(ang) * dist, AREA.cx - AREA.ex, AREA.cx + AREA.ex);
      const z = THREE.MathUtils.clamp(a.pos.z + Math.cos(ang) * dist, AREA.cz - AREA.ez, AREA.cz + AREA.ez);
      const rise = rand() < 0.3 ? 0.15 + rand() * 0.25 : 0.35 + rand() * rand() * AREA.maxRise;
      a.wp.set(x, ground(x, z) + rise, z);
    };
    const enter = (a: Agent, mode: Mode) => {
      a.mode = mode;
      if (mode === "swim") {
        pickWaypoint(a);
        a.modeTime = 6 + rand() * 8;
      } else if (mode === "hover") {
        // reference: hovering shrimp often tilt steeply nose-up, or level off
        a.hoverPitch = rand() < 0.45 ? 0.6 + rand() * 0.55 : (rand() - 0.5) * 0.4;
        a.hoverYawDrift = (rand() - 0.5) * 0.5;
        a.modeTime = 2 + rand() * 4.5;
      } else {
        a.modeTime = 4 + rand() * 7;
      }
    };

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const pers = a.personality;
      const floor = ground(a.pos.x, a.pos.z);
      const restY = floor + 0.09 * a.size;
      a.modeTime -= dt;

      // ---- state machine ------------------------------------------------
      if (a.mode === "swim") {
        if (a.pos.distanceToSquared(a.wp) < 0.12 || a.modeTime <= 0) {
          const nearFloor = a.pos.y - floor < 0.5;
          const roll = rand();
          enter(a, nearFloor && roll < 0.4 ? "rest" : roll < 0.75 ? "hover" : "swim");
        }
      } else if (a.modeTime <= 0) {
        enter(a, rand() < 0.8 ? "swim" : a.mode === "rest" ? "hover" : "rest");
      }

      // ---- desired direction + target speed per mode ---------------------
      let targetSpeed = 0;
      let maxTurn = 0.6 + pers * 0.5;
      let effortTarget = 0;
      let flexTarget = 0.3;
      if (a.mode === "swim") {
        desired.subVectors(a.wp, a.pos);
        const dist = desired.length();
        desired.multiplyScalar(1 / Math.max(dist, 1e-4));
        const cruise = 0.16 + pers * 0.12;
        targetSpeed = cruise * (1 + 0.15 * Math.sin(t * 0.4 + a.rhythm)) * Math.min(1, 0.35 + dist / 0.8);
        effortTarget = 0.55 + 0.45 * Math.min(1, a.speed / 0.28);
        flexTarget = 0.05;
        if (a.pos.y < floor + 0.22) desired.y += 0.8; // lift off rather than scrape the floor
        clampPitch(desired, 0.75);
      } else if (a.mode === "hover") {
        const yaw = Math.atan2(a.heading.x, a.heading.z) + a.hoverYawDrift;
        desired.set(Math.sin(yaw) * Math.cos(a.hoverPitch), Math.sin(a.hoverPitch), Math.cos(yaw) * Math.cos(a.hoverPitch));
        targetSpeed = 0.012 + 0.01 * Math.sin(t * 0.7 + a.rhythm);
        maxTurn = 0.45 + pers * 0.3;
        effortTarget = 0.22;
        flexTarget = 0.3;
      } else {
        // rest: drift down to the floor and settle almost level
        const yaw = Math.atan2(a.heading.x, a.heading.z);
        const above = a.pos.y - restY > 0.03;
        desired.set(Math.sin(yaw), above ? -0.35 : 0.06, Math.cos(yaw));
        targetSpeed = above ? 0.05 : 0;
        maxTurn = 0.4;
        effortTarget = above ? 0.15 : 0.03;
        flexTarget = 0.55;
      }

      // ---- spacing: other shrimp and passing fish ------------------------
      sep.set(0, 0, 0);
      for (let k = 0; k < agents.length; k++) {
        const o = agents[k];
        if (o === a) continue;
        const dx = a.pos.x - o.pos.x, dy = a.pos.y - o.pos.y, dz = a.pos.z - o.pos.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        const rr = (a.size + o.size) * 0.3;
        if (d2 < rr * rr && d2 > 1e-6) {
          const d = Math.sqrt(d2);
          const w = (1 - d / rr) ** 2 * 2;
          sep.x += (dx / d) * w;
          sep.y += (dy / d) * w * 0.4;
          sep.z += (dz / d) * w;
        }
      }
      for (const school of SCHOOLS) {
        for (const o of school) {
          const dx = a.pos.x - o.pos.x, dy = a.pos.y - o.pos.y, dz = a.pos.z - o.pos.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          const rr = 0.3 + o.size * 0.45;
          if (d2 < rr * rr && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const w = (1 - d / rr) ** 2 * 2;
            sep.x += (dx / d) * w;
            sep.y += (dy / d) * w * 0.4;
            sep.z += (dz / d) * w;
          }
        }
      }
      if (sep.lengthSq() > 1e-6) {
        desired.addScaledVector(sep, 1);
        targetSpeed = Math.max(targetSpeed, 0.08 * Math.min(1, sep.length())); // ease out of the way
      }
      if (desired.lengthSq() < 1e-6) desired.copy(a.heading);
      clampPitch(desired.normalize(), MAX_PITCH);

      // ---- eased turning (pivots in place when hovering) ------------------
      const angle = a.heading.angleTo(desired);
      a.angVel += (Math.min(angle * 1.3, maxTurn) - a.angVel) * (1 - Math.exp(-dt * 2));
      const step = Math.min(angle, a.angVel * dt);
      if (angle > 1e-4) {
        turnQ.setFromUnitVectors(a.heading, desired);
        tmpQ.identity().slerp(turnQ, step / angle);
        a.heading.applyQuaternion(tmpQ).normalize();
        clampPitch(a.heading, MAX_PITCH);
      }

      // ---- gentle acceleration, forward only ------------------------------
      a.speed += (targetSpeed - a.speed) * (1 - Math.exp(-dt * (targetSpeed > a.speed ? 1.6 : 1.1)));
      a.pos.addScaledVector(a.heading, a.speed * dt);
      if (!calm && a.mode === "hover") a.pos.y += Math.sin(t * 0.9 + a.rhythm) * 0.01 * dt; // slow drift
      a.pos.x = THREE.MathUtils.clamp(a.pos.x, AREA.cx - AREA.ex - 1, AREA.cx + AREA.ex + 1);
      a.pos.z = THREE.MathUtils.clamp(a.pos.z, AREA.cz - AREA.ez - 1, AREA.cz + AREA.ez + 1);
      const minY = ground(a.pos.x, a.pos.z) + 0.09 * a.size;
      if (a.pos.y < minY) {
        a.pos.y = minY;
        if (a.heading.y < 0 && a.mode !== "rest") clampPitch(a.heading.setY(0.15), MAX_PITCH);
      }
      a.pos.y = Math.min(a.pos.y, -0.8);

      // ---- orientation ----------------------------------------------------
      const yaw = Math.atan2(a.heading.x, a.heading.z);
      let dYaw = yaw - a.yaw;
      dYaw = Math.atan2(Math.sin(dYaw), Math.cos(dYaw));
      a.yaw = yaw;
      a.yawRate += (dYaw / Math.max(dt, 1e-4) - a.yawRate) * (1 - Math.exp(-dt * 3));
      tmpM.lookAt(tmpV.copy(a.pos).add(a.heading), a.pos, UP);
      tmpQ.setFromRotationMatrix(tmpM);
      rollQ.setFromAxisAngle(Z, THREE.MathUtils.clamp(-a.yawRate * 0.25, -0.25, 0.25));
      tmpQ.multiply(rollQ);
      a.quat.slerp(tmpQ, 1 - Math.exp(-dt * 5));

      // ---- appendages -------------------------------------------------------
      a.effort += (effortTarget - a.effort) * (1 - Math.exp(-dt * 2.5));
      a.flex += (flexTarget - a.flex) * (1 - Math.exp(-dt * 1.5));
      // swimmerets beat ~1 Hz when idle, ~4 Hz at full swim
      a.phase = (a.phase + dt * (6 + 20 * a.effort) * (0.9 + pers * 0.2)) % (Math.PI * 2000);
      attrs.phase.array[i] = a.phase;
      attrs.effort.array[i] = a.effort;
      attrs.flex.array[i] = a.flex;
      attrs.bend.array[i] = THREE.MathUtils.clamp(a.yawRate * 0.8, -1, 1);

      scaleV.setScalar(a.size);
      tmpM.compose(a.pos, a.quat, scaleV);
      mesh.setMatrixAt(i, tmpM);
    }
    mesh.instanceMatrix.needsUpdate = true;
    for (const attr of Object.values(attrs)) attr.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, material, count]} />;
}
