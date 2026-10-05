import * as THREE from "three";
import { MeshBuilder } from "./MeshBuilder";

/**
 * PROCEDURAL SHRIMP MODEL (~2.5k triangles, one draw call per school)
 * Penaeid-style pond shrimp: smooth carapace with a serrated rostrum, six
 * overlapping abdominal plates with a dorsal hump, tail fan, jointed walking
 * legs, paddle swimmerets, long swept-back antennae and stalked eyes.
 * ~0.55 units long, head pointing +Z, legs on -Y.
 * aPart: 0 body, 1 legs / swimmerets, 2 antennae (animated separately in
 * Shrimp.tsx); aBody 0 head → 1 tail (and base → tip on the antennae).
 */

type V3 = [number, number, number];

const lerp = THREE.MathUtils.lerp;
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Thin four-sided limb along a polyline; A / B are the two cross-section axes. */
function limb(m: MeshBuilder, pts: V3[], r0: number, r1: number, c0: THREE.Color, c1: THREE.Color, bodyAt: (v: number) => number, part: number, A: V3, B: V3) {
  const start = m.vcount;
  const c = new THREE.Color();
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const v = i / (n - 1), r = lerp(r0, r1, v), [x, y, z] = pts[i];
    c.copy(c0).lerp(c1, v);
    for (const [ka, kb] of [[1, 0], [0, 1], [-1, 0], [0, -1]])
      m.vert(x + (A[0] * ka + B[0] * kb) * r, y + (A[1] * ka + B[1] * kb) * r, z + (A[2] * ka + B[2] * kb) * r, c.clone(), bodyAt(v), part);
  }
  for (let i = 0; i < n - 1; i++)
    for (let k = 0; k < 4; k++) {
      const a = start + i * 4 + k, b = start + i * 4 + ((k + 1) % 4);
      m.tri(a, a + 4, b);
      m.tri(b, a + 4, b + 4);
    }
}

export function createShrimpGeometry() {
  const m = new MeshBuilder();
  const CARA_END = 0.4; // carapace | abdomen split along the spine
  const SEGMENTS = 6;

  // spine: straight carapace, humped third abdominal segment, tail curling down
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.022, 0.24),
    new THREE.Vector3(0, 0.04, 0.13),
    new THREE.Vector3(0, 0.04, 0.02),
    new THREE.Vector3(0, 0.046, -0.07),
    new THREE.Vector3(0, 0.022, -0.16),
    new THREE.Vector3(0, -0.028, -0.24),
    new THREE.Vector3(0, -0.085, -0.29),
  ]);
  const segPhase = (t: number) => (((t - CARA_END) / (1 - CARA_END)) * SEGMENTS) % 1;

  const baseRadius = (t: number) => {
    if (t < 0.08) return lerp(0.016, 0.045, Math.sqrt(t / 0.08));
    if (t < CARA_END) return 0.045 + Math.sin(((t - 0.08) / (CARA_END - 0.08)) * Math.PI) * 0.004;
    return lerp(0.046, 0.013, Math.pow((t - CARA_END) / (1 - CARA_END), 1.25));
  };
  // each abdominal plate is widest at its front edge and tucks under the next one
  const radius = (t: number) => (t <= CARA_END ? baseRadius(t) : baseRadius(t) * (1.05 - 0.08 * segPhase(t)));

  // translucent grey-olive shell, darker along the back, pale underside
  const dorsal = new THREE.Color("#4f574f");
  const flank = new THREE.Color("#7d8377");
  const belly = new THREE.Color("#a7a595");
  const caraWarm = new THREE.Color("#857f69");
  const edge = new THREE.Color("#33362f");
  const rust = new THREE.Color("#7a4634");
  const tmp = new THREE.Color();

  m.tube(
    48,
    14,
    (t) => {
      const p = spine.getPoint(t);
      const r = radius(t);
      return { c: [p.x, p.y, p.z], rx: r * 0.8, ry: r * 1.15 };
    },
    (t, a) => {
      const up = Math.sin(a);
      tmp.copy(flank).lerp(dorsal, THREE.MathUtils.smoothstep(up, 0.15, 0.95));
      if (up < -0.25) tmp.lerp(belly, Math.min(1, (-up - 0.25) * 1.3));
      if (t < CARA_END) tmp.lerp(caraWarm, 0.35);
      else if (segPhase(t) > 0.84) tmp.lerp(edge, 0.55); // dark rear margin of each plate
      if (t > 0.9) tmp.lerp(rust, (t - 0.9) * 4);
      // fine pigment speckle
      tmp.multiplyScalar(0.9 + hash(Math.floor(t * 140), Math.floor(a * 9)) * 0.2);
      return tmp.clone();
    },
    (t) => t
  );

  // rostrum: thin serrated blade
  const rostrum = new THREE.Color("#6b5f4c");
  m.grid(6, 1, (u, v) => {
    const tooth = Math.round(u * 6) % 2 === 1 ? 0.006 : 0;
    return {
      p: [0, 0.038 + u * 0.022 + v * (0.015 * (1 - u) + tooth * (1 - u)), 0.232 + u * 0.115],
      c: tmp.copy(rostrum).lerp(rust, u * 0.6).clone(),
      b: 0,
      part: 0,
    };
  });

  // antennal scales (flat blades beside the rostrum)
  const scale = new THREE.Color("#8f8f7e");
  for (const side of [-1, 1])
    m.grid(1, 3, (u, v) => ({
      p: [side * (0.02 + v * 0.012 + (u - 0.5) * 0.016 * Math.sin(Math.PI * (0.2 + v * 0.75))), 0.03 + v * 0.008, 0.232 + v * 0.07],
      c: scale.clone(),
      b: 0,
      part: 0,
    }));

  // tail fan: pointed telson + two leaf-shaped uropods per side, rust-tipped
  const fan = new THREE.Color("#6f7468");
  const tail = spine.getPoint(1);
  for (const ang of [-0.78, -0.36, 0, 0.36, 0.78]) {
    const telson = ang === 0;
    const len = telson ? 0.082 : 0.1 - Math.abs(ang) * 0.015;
    const dirX = Math.sin(ang), dirZ = -Math.cos(ang);
    m.grid(2, 4, (u, v) => {
      const width = telson ? 0.012 * (1 - v) : 0.03 * Math.pow(Math.sin(Math.PI * (0.12 + v * 0.8)), 0.8);
      const off = (u - 0.5) * width;
      return {
        p: [tail.x + dirX * len * v - off * dirZ, tail.y - v * 0.03 - Math.abs(u - 0.5) * 0.004, tail.z + dirZ * len * v * 0.92 + off * dirX],
        c: tmp.copy(fan).lerp(rust, Math.pow(v, 1.6) * 0.85).clone(),
        b: 1,
        part: 0,
      };
    });
  }

  // walking legs: five jointed pairs under the carapace
  const legTop = new THREE.Color("#a59d88");
  const legTip = new THREE.Color("#b9825c");
  const X: V3 = [1, 0, 0], Y: V3 = [0, 1, 0], Z: V3 = [0, 0, 1];
  for (let i = 0; i < 5; i++) {
    const t = 0.14 + i * 0.055;
    const base = spine.getPoint(t), r = radius(t);
    for (const side of [-1, 1]) {
      const hipX = side * r * 0.5, hipY = base.y - r * 0.95;
      limb(
        m,
        [
          [hipX, hipY, base.z],
          [hipX + side * 0.034, hipY - 0.026, base.z + 0.01],
          [hipX + side * 0.05, -0.068, base.z + 0.018 - i * 0.004],
          [hipX + side * 0.046, -0.088, base.z + 0.027 - i * 0.004],
        ],
        0.0046,
        0.0018,
        legTop,
        legTip,
        () => t,
        1,
        X,
        Z
      );
    }
  }

  // swimmerets: five pairs of small paddles under the abdomen
  const pleoTop = new THREE.Color("#b08f72");
  const pleoTip = new THREE.Color("#c9865a");
  for (let j = 0; j < 5; j++) {
    const t = 0.47 + j * 0.085;
    const base = spine.getPoint(t), r = radius(t);
    const len = 0.044 * (1 - j * 0.12);
    for (const side of [-1, 1])
      m.grid(1, 3, (u, v) => ({
        p: [side * (r * 0.42 + v * 0.012), base.y - r * 1.02 - v * len, base.z - v * 0.028 + (u - 0.5) * 0.015 * (0.5 + v * 0.7)],
        c: tmp.copy(pleoTop).lerp(pleoTip, v).clone(),
        b: t,
        part: 1,
      }));
  }

  // antennae: long whips sweeping back past the tail
  const antBase = new THREE.Color("#8a4a36");
  const antTip = new THREE.Color("#b36a50");
  for (const side of [-1, 1]) {
    const pts: V3[] = [];
    for (let k = 0; k <= 16; k++) {
      const v = k / 16;
      pts.push([side * (0.018 + v * 0.14), 0.045 + Math.sin(v * Math.PI) * 0.07 - v * 0.02, 0.27 + Math.sin(v * 1.3) * 0.1 - v * v * 0.62]);
    }
    limb(m, pts, 0.003, 0.0011, antBase, antTip, (v) => v, 2, Y, X);
    // short forked antennules pointing forward
    for (const fork of [0, 1]) {
      const short: V3[] = [];
      for (let k = 0; k <= 5; k++) {
        const v = k / 5;
        short.push([side * (0.012 + v * (fork ? 0.03 : 0.008)), 0.04 + v * (fork ? 0.05 : 0.022), 0.25 + v * (fork ? 0.085 : 0.1)]);
      }
      limb(m, short, 0.0024, 0.001, legTop, antTip, (v) => v * 0.35, 2, Y, X);
    }
  }

  // stalked eyes
  const eye = new THREE.Color("#0c0b0a");
  for (const side of [-1, 1]) {
    limb(m, [[side * 0.022, 0.04, 0.214], [side * 0.038, 0.051, 0.226]], 0.006, 0.006, flank, flank, () => 0, 0, Y, Z);
    m.sphere(side * 0.042, 0.054, 0.229, 0.0135, eye, 0, 0);
  }

  return m.build();
}
