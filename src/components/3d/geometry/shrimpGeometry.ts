import * as THREE from "three";
import { MeshBuilder } from "./MeshBuilder";

/**
 * PLACEHOLDER SHRIMP MODEL (procedural, ~1k triangles)
 * Freshwater prawn silhouette, ~0.55 units long, head pointing +Z, legs on -Y.
 * aPart: 0 body, 1 legs / swimmerets, 2 antennae (animated separately).
 */
export function createShrimpGeometry() {
  const m = new MeshBuilder();

  // spine: carapace straight, abdomen arcs downward (natural resting curl)
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, 0.24),
    new THREE.Vector3(0, 0.035, 0.12),
    new THREE.Vector3(0, 0.03, 0.0),
    new THREE.Vector3(0, 0.01, -0.12),
    new THREE.Vector3(0, -0.03, -0.22),
    new THREE.Vector3(0, -0.08, -0.29),
  ]);

  const radius = (t: number) => {
    if (t < 0.06) return 0.012 + t * 0.4;
    if (t < 0.42) return 0.046;
    return THREE.MathUtils.lerp(0.046, 0.016, (t - 0.42) / 0.58);
  };

  const shell = new THREE.Color("#a49882");
  const cara = new THREE.Color("#8c9186");
  const band = new THREE.Color("#5f5545");
  const tmp = new THREE.Color();

  m.tube(
    34,
    12,
    (t) => {
      const p = spine.getPoint(t);
      const r = radius(t);
      return { c: [p.x, p.y, p.z], rx: r * 0.9, ry: r * 1.12 };
    },
    (t, a) => {
      tmp.copy(t < 0.42 ? cara : shell);
      // segment bands on the abdomen
      if (t > 0.42 && ((t - 0.42) * 6 / 0.55) % 1 < 0.14) tmp.lerp(band, 0.7);
      // lighter, translucent-looking underside
      if (Math.sin(a) < -0.3) tmp.lerp(new THREE.Color("#d2c8b6"), 0.45);
      return tmp.clone();
    },
    (t) => t
  );

  // rostrum (pointed beak)
  m.grid(4, 1, (u, v) => ({
    p: [0, 0.03 + u * 0.03 + v * 0.012 * (1 - u), 0.24 + u * 0.12],
    c: cara.clone(),
    b: 0,
    part: 0,
  }));

  // tail fan: telson + 4 uropods
  const fan = new THREE.Color("#7c6a55");
  const tail = spine.getPoint(1);
  for (const ang of [-0.65, -0.25, 0, 0.25, 0.65]) {
    m.grid(3, 2, (u, v) => {
      const len = ang === 0 ? 0.1 : 0.09;
      const spread = (v - 0.5) * 0.035 * (0.3 + u);
      const dirX = Math.sin(ang), dirZ = -Math.cos(ang);
      return {
        p: [tail.x + dirX * len * u + spread * -dirZ, tail.y - u * 0.035, tail.z + dirZ * len * u * 0.9 + spread * dirX],
        c: tmp.copy(fan).lerp(band, u * 0.5).clone(),
        b: 1,
        part: 0,
      };
    });
  }

  // walking legs (5 pairs) + swimmerets (5 pairs) — thin quads
  const leg = new THREE.Color("#b6a993");
  for (let i = 0; i < 10; i++) {
    const walking = i < 5;
    const t = walking ? 0.12 + i * 0.06 : 0.48 + (i - 5) * 0.08;
    const base = spine.getPoint(t);
    const r = radius(t);
    for (const side of [-1, 1]) {
      m.grid(1, 3, (u, v) => {
        const reach = walking ? 0.1 : 0.05;
        const x = side * (r * 0.7 + v * reach * 0.55);
        const y = base.y - r * 0.9 - v * reach * (walking ? 0.8 : 0.6);
        return { p: [x + (u - 0.5) * 0.006, y, base.z + (walking ? v * 0.02 : 0)], c: leg.clone(), b: t, part: 1 };
      });
    }
  }

  // antennae: long thin strips sweeping backward over the body
  const ant = new THREE.Color("#8b7d68");
  for (const side of [-1, 1]) {
    m.grid(1, 14, (u, v) => {
      const x = side * (0.02 + v * 0.16);
      const y = 0.05 + Math.sin(v * Math.PI) * 0.05;
      const z = 0.26 + Math.sin(v * 1.2) * 0.12 - v * v * 0.6;
      return { p: [x + (u - 0.5) * 0.004, y, z], c: ant.clone(), b: v, part: 2 };
    });
  }

  // stalked eyes
  const eye = new THREE.Color("#121110");
  for (const side of [-1, 1]) m.sphere(side * 0.034, 0.05, 0.215, 0.013, eye, 0, 0);

  return m.build();
}
