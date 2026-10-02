import * as THREE from "three";
import { MeshBuilder } from "./MeshBuilder";

/**
 * PLACEHOLDER FISH MODEL (procedural, ~1.4k triangles)
 * A carp-type freshwater fish (rohu / catla silhouette), 1 unit long,
 * head pointing +Z. Replace with a Draco-compressed GLB later — see
 * `Fish.tsx` → `useFishGeometry()`.
 */
export function createFishGeometry() {
  const m = new MeshBuilder();
  const BODY_LEN = 0.78; // nose (z=+0.5) → peduncle (z=-0.28)
  const zAt = (t: number) => 0.5 - t * BODY_LEN;

  const H = (t: number) => {
    const core = 0.2 * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(t, 1), 0.7)), 0.85);
    const ped = 0.042 * THREE.MathUtils.smoothstep(t, 0.55, 1.0);
    return Math.max(core, ped) + 0.0001;
  };
  const W = (t: number) => H(t) * 0.46;
  const Yc = (t: number) => 0.018 * Math.sin(Math.PI * t);

  const back = new THREE.Color("#2f3a2e");
  const gold = new THREE.Color("#a99a6a");
  const silver = new THREE.Color("#b5bcb5");
  const belly = new THREE.Color("#e9e6da");
  const tmp = new THREE.Color();

  // ---- body -------------------------------------------------------------
  m.tube(
    30,
    18,
    (t) => {
      const h = H(t);
      return { c: [0, Yc(t), zAt(t)], rx: W(t), ry: h };
    },
    (t, a) => {
      const s = Math.sin(a);
      if (s > 0.25) tmp.copy(gold).lerp(back, THREE.MathUtils.smoothstep(s, 0.25, 0.92));
      else tmp.copy(silver).lerp(belly, THREE.MathUtils.smoothstep(-s, 0.05, 0.85));
      if (s > 0.0 && s < 0.35) tmp.lerp(silver, 0.55);
      // head slightly darker + gill line
      if (t < 0.2) tmp.multiplyScalar(0.86);
      if (Math.abs(t - 0.23) < 0.012) tmp.multiplyScalar(0.7);
      return tmp.clone();
    },
    (t) => t
  );

  // flatten the belly a touch (carp profile): squash lower half of ring
  for (let i = 0; i < m.pos.length; i += 3) {
    const y = m.pos[i + 1];
    if (y < 0) m.pos[i + 1] = y * 0.86;
  }

  const fin = new THREE.Color("#5b5146");
  const finRed = new THREE.Color("#7a5a4c");

  // ---- caudal (tail) fin: forked, subdivided so it bends smoothly ----------
  m.grid(6, 8, (u, v) => {
    const top = THREE.MathUtils.lerp(0.04, 0.2, u);
    const bot = THREE.MathUtils.lerp(-0.035, -0.17, u);
    const y = THREE.MathUtils.lerp(bot, top, v);
    const notch = 1 - 0.42 * Math.pow(1 - Math.abs(2 * v - 1), 1.4) * u;
    const z = -0.27 - u * 0.25 * notch;
    return { p: [0, y, z], c: tmp.copy(fin).lerp(finRed, u * 0.6).clone(), b: 1 + u * 0.35, part: 1 };
  });

  // ---- dorsal fin ---------------------------------------------------------
  m.grid(6, 3, (u, v) => {
    const t = 0.3 + u * 0.28;
    const baseY = Yc(t) + H(t) * 0.86 * 1;
    const height = 0.085 * (1 - u * 0.75) * (u < 0.1 ? u / 0.1 : 1);
    return { p: [0, baseY + v * height, zAt(t) - v * 0.04], c: fin.clone(), b: t, part: 1 };
  });

  // ---- anal + pelvic fins (small, underneath) -----------------------------
  const lowerFin = (t0: number, len: number, h: number) =>
    m.grid(3, 2, (u, v) => {
      const t = t0 + u * len;
      const baseY = Yc(t) - H(t) * 0.84;
      return { p: [0, baseY - v * h * (1 - u * 0.6), zAt(t) - v * 0.03], c: finRed.clone(), b: t, part: 1 };
    });
  lowerFin(0.72, 0.12, 0.05);
  lowerFin(0.5, 0.08, 0.045);

  // ---- pectoral fins (pair) ----------------------------------------------
  for (const side of [-1, 1]) {
    m.grid(3, 2, (u, v) => {
      const t = 0.26 + u * 0.1;
      const x = side * (W(0.26) * 0.85 + v * 0.06);
      const y = Yc(t) - H(0.26) * 0.45 - v * 0.03;
      return { p: [x, y, zAt(t) - v * 0.05], c: finRed.clone(), b: t, part: 1 };
    });
  }

  // ---- eyes -----------------------------------------------------------------
  const eye = new THREE.Color("#0b0b0a");
  const te = 0.085;
  for (const side of [-1, 1]) m.sphere(side * W(te) * 0.92, Yc(te) + H(te) * 0.22, zAt(te), 0.017, eye, te, 0);

  return m.build();
}
