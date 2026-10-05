import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BOAT, FLOAT_FEED } from "@/config/story";
import { beatLocal, story } from "@/lib/storyStore";
import { feed } from "./feedState";
import { BAG } from "./geometry/boatGeometry";
import {
  FARMER,
  createLowerBody,
  createTorso,
  createHead,
  createUpperArm,
  createForeArm,
  createPalm,
  createFingers,
} from "./geometry/farmerGeometry";

/**
 * FARMER — seated in the boat, hand-casting the floating feed.
 * ------------------------------------------------------------------
 * The right arm is driven by scroll: the floating beat's progress is mapped
 * onto a keyframed hand path (rest → reach into the sack → scoop → draw back →
 * cast → follow through, repeated FLOAT_FEED.throws times). The wrist follows
 * that path and the shoulder/elbow are solved with two-bone IK each frame, so
 * the arm bends naturally while the torso only leans and twists into the
 * movement. The palm's world position is published to `feed.hand`; the
 * pellets (FloatingPellets.tsx) ride in it and leave from it.
 */

interface Pose {
  p: THREE.Vector3; // wrist, farmer-local
  dir: THREE.Vector3; // where the fingers point
  palm: THREE.Vector3; // palm normal
  curl: number; // 0 open hand … ~1.2 cupped
  lean: number; // torso pitch (forward +)
  twist: number; // torso yaw (right shoulder forward +)
  roll: number; // torso side-lean (toward his right +)
  headPitch: number;
  headYaw: number;
}
interface Key extends Pose {
  t: number;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function buildKeys(): Key[] {
  // sack mouth in farmer-local space (derived from the boat layout in config/story.ts)
  const f = BOAT.farmer, b = BOAT.bag;
  const dx = b.x - f.x, dz = b.z - 0.05 - f.z;
  const c = Math.cos(f.yaw), s = Math.sin(f.yaw);
  const M = v(dx * c - dz * s, BAG.height, dx * s + dz * c);
  const at = (x: number, y: number, z: number) => v(M.x + x, M.y + y, M.z + z);

  const pose = (p: THREE.Vector3, dir: THREE.Vector3, palm: THREE.Vector3, curl: number, lean: number, twist: number, roll: number, headPitch: number, headYaw: number): Pose => ({
    p, dir: dir.normalize(), palm: palm.normalize(), curl, lean, twist, roll, headPitch, headYaw,
  });
  // the sack stands beside his right hip: he scoops sideways, draws the hand
  // back above the sack, then casts forward over the gunwale
  const REST = pose(v(-0.3, 0.215, 0.22), v(0.05, -0.25, 1), v(0, -1, -0.2), 0.45, 0.07, 0, 0, 0.26, -0.1);
  const READY = pose(v(-0.34, 0.42, 0.26), v(0.1, -0.3, 0.9), v(0.9, 0.2, -0.1), 0.6, 0.1, -0.05, 0.03, 0.32, -0.35);
  const ABOVE = pose(at(0.07, 0.2, 0.03), v(-0.15, -1, 0.05), v(0.5, 0, 0.85), 0.25, 0.1, -0.18, 0.14, 0.5, -0.8);
  const IN = pose(at(0.06, 0.08, 0.03), v(-0.1, -1, 0.05), v(0.5, 0, 0.85), 0.75, 0.12, -0.2, 0.18, 0.55, -0.85);
  const LIFT = pose(at(0.1, 0.22, 0.05), v(0.15, 0.1, 0.95), v(0, 1, 0), 1.1, 0.08, -0.15, 0.08, 0.45, -0.7);
  const WINDUP = pose(v(-0.36, 0.76, -0.06), v(0.1, 0.15, 0.95), v(0, 1, -0.1), 1.15, 0.03, -0.3, 0, 0.3, -0.3);
  const RELEASE = pose(v(-0.12, 0.72, 0.72), v(0.1, 0.2, 0.95), v(0.35, 0.9, 0), 0.85, 0.4, 0.35, 0, 0.24, -0.05);
  const FOLLOW = pose(v(-0.04, 0.63, 0.74), v(0.15, -0.2, 0.95), v(0.9, 0.4, 0), 0.05, 0.42, 0.4, 0, 0.3, 0);

  const { throws, start, cycle, releaseAt } = FLOAT_FEED;
  const keys: Key[] = [{ t: -1, ...REST }, { t: start - 0.07, ...REST }, { t: start, ...READY }];
  for (let k = 0; k < throws; k++) {
    const t0 = start + k * cycle;
    const add = (u: number, ps: Pose) => keys.push({ t: t0 + u * cycle, ...ps });
    add(0.16, ABOVE);
    add(0.3, IN);
    add(0.46, LIFT);
    add(0.62, WINDUP);
    add(releaseAt, RELEASE);
    add(0.9, FOLLOW);
    add(1, READY);
  }
  const end = start + throws * cycle;
  keys.push({ t: end + 0.07, ...REST }, { t: 3, ...REST });
  return keys;
}

function catmull(a: number, b: number, c: number, d: number, u: number) {
  const u2 = u * u, u3 = u2 * u;
  return 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u3);
}

/** Wrist on a Catmull-Rom path through the keys; everything else eased key to key. */
function samplePose(keys: Key[], t: number, out: Pose) {
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].t) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)];
  const u = THREE.MathUtils.clamp((t - k1.t) / Math.max(1e-5, k2.t - k1.t), 0, 1);
  out.p.set(catmull(k0.p.x, k1.p.x, k2.p.x, k3.p.x, u), catmull(k0.p.y, k1.p.y, k2.p.y, k3.p.y, u), catmull(k0.p.z, k1.p.z, k2.p.z, k3.p.z, u));
  const e = u * u * (3 - 2 * u);
  out.dir.copy(k1.dir).lerp(k2.dir, e).normalize();
  out.palm.copy(k1.palm).lerp(k2.palm, e).normalize();
  out.curl = k1.curl + (k2.curl - k1.curl) * e;
  out.lean = k1.lean + (k2.lean - k1.lean) * e;
  out.twist = k1.twist + (k2.twist - k1.twist) * e;
  out.roll = k1.roll + (k2.roll - k1.roll) * e;
  out.headPitch = k1.headPitch + (k2.headPitch - k1.headPitch) * e;
  out.headYaw = k1.headYaw + (k2.headYaw - k1.headYaw) * e;
}

const DOWN = new THREE.Vector3(0, -1, 0);
const tA = new THREE.Vector3();
const tB = new THREE.Vector3();
const tC = new THREE.Vector3();
const elbow = new THREE.Vector3();
const wrist = new THREE.Vector3();
const basis = new THREE.Matrix4();

interface Arm {
  upper: THREE.Mesh | null;
  fore: THREE.Mesh | null;
  hand: THREE.Group | null;
  fingers: THREE.Mesh | null;
}

/** Two-bone IK: place shoulder→elbow→wrist and orient the hand. */
function poseArm(arm: Arm, shoulder: THREE.Vector3, target: THREE.Vector3, hint: THREE.Vector3, dir: THREE.Vector3, palm: THREE.Vector3, curl: number) {
  const { upper, fore, hand, fingers } = arm;
  if (!upper || !fore || !hand || !fingers) return;
  const a = FARMER.upperArm, b = FARMER.foreArm;
  const reach = tA.subVectors(target, shoulder);
  const d = THREE.MathUtils.clamp(reach.length(), 0.08, a + b - 0.004);
  reach.normalize();
  const along = (a * a - b * b + d * d) / (2 * d);
  const out = Math.sqrt(Math.max(0, a * a - along * along));
  const perp = tB.copy(hint).addScaledVector(reach, -hint.dot(reach)).normalize();
  elbow.copy(shoulder).addScaledVector(reach, along).addScaledVector(perp, out);
  wrist.copy(shoulder).addScaledVector(reach, d);

  upper.position.copy(shoulder);
  upper.quaternion.setFromUnitVectors(DOWN, tC.subVectors(elbow, shoulder).normalize());
  fore.position.copy(elbow);
  fore.quaternion.setFromUnitVectors(DOWN, tC.subVectors(wrist, elbow).normalize());

  // hand frame: -Y along the fingers, +Z out of the palm
  const y = tA.copy(dir).negate();
  const z = tB.copy(palm).addScaledVector(y, -palm.dot(y)).normalize();
  const x = tC.crossVectors(y, z);
  hand.position.copy(wrist);
  hand.quaternion.setFromRotationMatrix(basis.makeBasis(x, y, z));
  fingers.rotation.x = -curl;
}

const HINT_R = new THREE.Vector3(-0.7, -0.6, -0.35).normalize();
const HINT_L = new THREE.Vector3(0.7, -0.6, -0.35).normalize();
const L_WRIST = new THREE.Vector3(0.3, 0.215, 0.22);
const L_DIR = new THREE.Vector3(-0.05, -0.25, 1).normalize();
const L_PALM = new THREE.Vector3(0, -1, -0.2).normalize();
const PALM_CENTRE = new THREE.Vector3(0, -0.075, 0.035);

export function Farmer() {
  const geo = useMemo(
    () => ({
      lower: createLowerBody(),
      torso: createTorso(),
      head: createHead(),
      upper: createUpperArm(),
      fore: createForeArm(),
      palmR: createPalm(-1),
      palmL: createPalm(1),
      fingers: createFingers(),
    }),
    []
  );
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, metalness: 0 }), []);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      material.dispose();
    },
    [geo, material]
  );

  const keys = useMemo(buildKeys, []);
  const pose = useMemo<Pose>(() => ({ p: v(0, 0, 0), dir: v(0, 0, 1), palm: v(0, 1, 0), curl: 0, lean: 0, twist: 0, roll: 0, headPitch: 0, headYaw: 0 }), []);
  const shoulder = useMemo(() => new THREE.Vector3(), []);

  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const right = useRef<Arm>({ upper: null, fore: null, hand: null, fingers: null });
  const left = useRef<Arm>({ upper: null, fore: null, hand: null, fingers: null });

  useFrame((state) => {
    const tr = torso.current;
    if (!tr || !head.current) return;
    samplePose(keys, beatLocal("floating"), pose);
    const breathe = story.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.1) * 0.008;

    tr.rotation.set(pose.lean + breathe, pose.twist, pose.roll, "YXZ");
    tr.updateMatrix();
    head.current.rotation.set(pose.headPitch, pose.headYaw - pose.twist * 0.6, 0, "YXZ");

    shoulder.copy(FARMER.shoulder).setX(-FARMER.shoulder.x).applyMatrix4(tr.matrix);
    poseArm(right.current, shoulder, pose.p, HINT_R, pose.dir, pose.palm, pose.curl);
    shoulder.copy(FARMER.shoulder).applyMatrix4(tr.matrix);
    poseArm(left.current, shoulder, L_WRIST, HINT_L, L_DIR, L_PALM, 0.45);

    const hand = right.current.hand;
    if (hand) {
      hand.updateWorldMatrix(true, false);
      feed.hand.copy(PALM_CENTRE).applyMatrix4(hand.matrixWorld);
    }
  });

  const arm = (ref: typeof right, palm: THREE.BufferGeometry) => (
    <>
      <mesh ref={(m) => { ref.current.upper = m; }} geometry={geo.upper} material={material} />
      <mesh ref={(m) => { ref.current.fore = m; }} geometry={geo.fore} material={material} />
      <group ref={(g) => { ref.current.hand = g; }}>
        <mesh geometry={palm} material={material} />
        <mesh ref={(m) => { ref.current.fingers = m; }} geometry={geo.fingers} material={material} position={[0, -FARMER.palm, 0]} />
      </group>
    </>
  );

  return (
    <>
      <mesh geometry={geo.lower} material={material} />
      <group ref={torso} position={FARMER.pelvis}>
        <mesh geometry={geo.torso} material={material} />
        <group ref={head} position={FARMER.neck}>
          <mesh geometry={geo.head} material={material} />
        </group>
      </group>
      {arm(right, geo.palmR)}
      {arm(left, geo.palmL)}
    </>
  );
}
