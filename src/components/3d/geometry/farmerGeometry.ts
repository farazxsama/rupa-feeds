import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Procedural seated farmer (cross-legged, shirt + dhoti + head wrap).
 * Farmer-local axes: origin on the deck under the pelvis, +z = the way he
 * faces, +x = his left, y up. Parts are merged per rigid body segment and
 * coloured with vertex colours so the whole figure shares one material.
 *
 * To use a rigged GLB instead, replace <Farmer/> and keep writing the palm
 * position to `feed.hand` — the pellets only depend on that.
 */
export const FARMER = {
  /** torso pivot (farmer-local) and joints relative to it */
  pelvis: new THREE.Vector3(0, 0.12, 0),
  shoulder: new THREE.Vector3(0.2, 0.46, 0), // mirror x for the right side
  neck: new THREE.Vector3(0, 0.585, 0.01),
  upperArm: 0.3,
  foreArm: 0.27,
  /** knuckle line, measured from the wrist along the hand */
  palm: 0.095,
};

const SKIN = "#9a6543";
const SHIRT = "#a89674";
const DHOTI = "#998969";
const WRAP = "#b7a784";
const HAIR = "#2b221b";

type V3 = [number, number, number];

function paint<T extends THREE.BufferGeometry>(g: T, hex: string) {
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

function ball(r: number, scale: V3, at: V3, hex: string, seg = 12) {
  const g = new THREE.SphereGeometry(r, seg, Math.max(6, seg - 4));
  g.scale(...scale);
  g.translate(...at);
  return paint(g, hex);
}

/** Capsule running from y = 0 (radius r0) down to y = -len (radius r1). */
function taperedCapsule(r0: number, r1: number, len: number) {
  const rm = Math.max(r0, r1);
  const g = new THREE.CapsuleGeometry(rm, len, 4, 10);
  const p = g.attributes.position as THREE.BufferAttribute;
  const hl = len / 2;
  for (let i = 0; i < p.count; i++) {
    let y = p.getY(i);
    const t = Math.min(1, Math.max(0, (y + hl) / len));
    const k = (r1 + (r0 - r1) * t) / rm;
    if (y > hl) y = hl + (y - hl) * k;
    else if (y < -hl) y = -hl + (y + hl) * k;
    p.setXYZ(i, p.getX(i) * k, y - hl, p.getZ(i) * k);
  }
  return g;
}

const DOWN = new THREE.Vector3(0, -1, 0);

/** Static limb from a to b. */
function limb(a: V3, b: V3, r0: number, r1: number, hex: string) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const g = taperedCapsule(r0, r1, dir.length());
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(DOWN, dir.normalize()));
  g.translate(va.x, va.y, va.z);
  return paint(g, hex);
}

function merge(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return g;
}

/** Hips + crossed legs under a draped dhoti. Farmer-local, static. */
export function createLowerBody() {
  return merge([
    ball(1, [0.2, 0.125, 0.16], [0, 0.115, -0.02], DHOTI),
    limb([0.1, 0.12, 0.02], [0.33, 0.1, 0.3], 0.092, 0.075, DHOTI),
    limb([-0.1, 0.12, 0.02], [-0.33, 0.1, 0.3], 0.092, 0.075, DHOTI),
    limb([0.33, 0.1, 0.3], [-0.07, 0.065, 0.39], 0.07, 0.05, DHOTI),
    limb([-0.33, 0.1, 0.3], [0.09, 0.07, 0.47], 0.07, 0.05, DHOTI),
    // cloth sagging across the lap
    ball(1, [0.27, 0.07, 0.2], [0, 0.085, 0.2], DHOTI),
    // feet
    ball(1, [0.04, 0.03, 0.085], [-0.13, 0.045, 0.4], SKIN, 8),
    ball(1, [0.04, 0.03, 0.085], [0.15, 0.05, 0.48], SKIN, 8),
  ]);
}

/** Loose shirt, shoulders and neck. Relative to the pelvis pivot. */
export function createTorso() {
  const trunk = new THREE.CapsuleGeometry(0.15, 0.26, 6, 14);
  const p = trunk.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), t = (y + 0.28) / 0.56;
    const chest = THREE.MathUtils.smoothstep(t, 0.2, 0.85);
    const z = p.getZ(i);
    // broader at the shoulders, a little belly in front, flat back
    p.setXYZ(i, p.getX(i) * (1.02 + 0.3 * chest), y + 0.25, z * (z > 0 ? 0.86 + 0.1 * (1 - chest) : 0.72));
  }
  trunk.computeVertexNormals();
  const s = FARMER.shoulder;
  return merge([
    paint(trunk, SHIRT),
    ball(0.078, [1, 0.9, 0.95], [s.x - 0.01, s.y, 0], SHIRT, 10),
    ball(0.078, [1, 0.9, 0.95], [-s.x + 0.01, s.y, 0], SHIRT, 10),
    limb([0, 0.5, 0.005], [0, 0.6, 0.012], 0.05, 0.046, SKIN),
  ]);
}

/** Head with a wrapped cloth turban. Relative to the neck pivot. */
export function createHead() {
  const wrap = new THREE.TorusGeometry(0.094, 0.04, 8, 18);
  wrap.rotateX(Math.PI / 2 - 0.22);
  wrap.translate(0, 0.165, -0.005);
  const wrap2 = new THREE.TorusGeometry(0.08, 0.038, 8, 16);
  wrap2.rotateX(Math.PI / 2 + 0.2);
  wrap2.rotateZ(0.25);
  wrap2.translate(0, 0.2, -0.005);
  return merge([
    ball(0.1, [0.9, 1.1, 0.98], [0, 0.1, 0.012], SKIN, 16), // skull
    ball(0.075, [0.86, 0.9, 0.9], [0, 0.052, 0.03], SKIN, 12), // jaw
    ball(0.018, [0.85, 1.4, 1], [0, 0.088, 0.108], SKIN, 8), // nose
    ball(0.025, [0.4, 1, 0.7], [0.09, 0.092, 0.005], SKIN, 8), // ears
    ball(0.025, [0.4, 1, 0.7], [-0.09, 0.092, 0.005], SKIN, 8),
    ball(0.026, [1.3, 0.3, 0.45], [0, 0.06, 0.094], HAIR, 8), // moustache
    ball(0.02, [1.1, 0.2, 0.4], [0.037, 0.124, 0.09], HAIR, 8), // brows
    ball(0.02, [1.1, 0.2, 0.4], [-0.037, 0.124, 0.09], HAIR, 8),
    ball(0.1, [0.95, 0.72, 1.0], [0, 0.185, -0.005], WRAP, 12), // crown of the wrap
    paint(wrap, WRAP),
    paint(wrap2, WRAP),
    limb([-0.085, 0.15, -0.06], [-0.11, 0.0, -0.09], 0.032, 0.02, WRAP), // loose end
  ]);
}

/** Arm segments hang from their joint along -Y so they can be aimed with one quaternion. */
export function createUpperArm() {
  return paint(taperedCapsule(0.058, 0.047, FARMER.upperArm), SHIRT); // sleeve to the elbow
}
export function createForeArm() {
  return paint(taperedCapsule(0.042, 0.031, FARMER.foreArm), SKIN);
}

/** Palm + thumb. Wrist at the origin, fingers toward -Y, palm facing +Z. `side` = +1 left, -1 right. */
export function createPalm(side: 1 | -1) {
  return merge([
    ball(1, [0.042, 0.052, 0.017], [0, -0.05, 0], SKIN, 10),
    limb([side * -0.03, -0.035, 0.008], [side * -0.058, -0.085, 0.022], 0.013, 0.01, SKIN),
  ]);
}

/** Four fingers as one pad hinged at the knuckles (origin), pointing -Y. */
export function createFingers() {
  return merge([ball(1, [0.039, 0.045, 0.013], [0, -0.04, 0], SKIN, 10)]);
}
