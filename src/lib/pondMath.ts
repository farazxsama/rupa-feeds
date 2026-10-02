import { WORLD } from "@/config/story";

/**
 * Shared math for the pond. Wave height is implemented twice (TS + GLSL) and
 * MUST stay in sync so floating pellets ride exactly on the rendered surface.
 */

// --- seeded random --------------------------------------------------------
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- value noise / fbm (CPU, used once to build terrain) ------------------
function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise2(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export function fbm(x: number, y: number, oct = 4) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * noise2(x * f, y * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return v;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const POND_CENTER = { x: 6, z: -6 };

/** Height of the pond floor / surrounding banks. */
export function terrainHeight(x: number, z: number) {
  const dx = x - POND_CENTER.x, dz = z - POND_CENTER.z;
  const r = Math.sqrt(dx * dx + dz * dz);
  const n = fbm(x * 0.08, z * 0.08);
  let floor = WORLD.floorY + (n - 0.5) * 1.1 + fbm(x * 0.6, z * 0.6, 2) * 0.12;
  // flatten a pad for the polyculture feeding tray
  const ndx = x - WORLD.net.x, ndz = z - WORLD.net.z;
  const nr = Math.sqrt(ndx * ndx + ndz * ndz);
  floor += ((WORLD.trayY - 0.18) - floor) * (1 - smooth(2.2, 4.5, nr));
  // banks rise to the shoreline then into gentle hills
  const bank = 0.5 + (fbm(x * 0.03 + 4, z * 0.03) - 0.4) * 5 * smooth(48, 90, r);
  return floor + (bank - floor) * smooth(30, 47, r);
}

// --- waves ----------------------------------------------------------------
// 8 directional waves on golden-angle headings with deep-water dispersion
// (ω = √(gk)) — irregular enough to avoid the "egg crate" look of few sines.
const W = Array.from({ length: 8 }, (_, i) => {
  const ang = i * 2.39996 + 0.4;
  const k = 0.32 * Math.pow(1.42, i);
  return {
    dx: Math.cos(ang),
    dz: Math.sin(ang),
    k,
    w: Math.sqrt(9.8 * k) * 0.55,
    a: 0.034 / Math.pow(k / 0.32, 0.8),
  };
});

export function waveHeight(x: number, z: number, t: number) {
  let h = 0;
  for (const q of W) h += q.a * Math.sin((q.dx * x + q.dz * z) * q.k + t * q.w);
  return h;
}

/** GLSL twin of waveHeight + analytic normal. */
export const WAVE_GLSL = /* glsl */ `
  vec3 pondWave(vec2 p, float t) {
    // returns (height, dh/dx, dh/dz)
    vec3 r = vec3(0.0);
    ${W.map(
      (q, i) => `
    {
      vec2 d${i} = vec2(${q.dx.toFixed(4)}, ${q.dz.toFixed(4)});
      float ph = dot(d${i}, p) * ${q.k.toFixed(3)} + t * ${q.w.toFixed(3)};
      r.x += ${q.a.toFixed(5)} * sin(ph);
      float c = ${(q.a * q.k).toFixed(5)} * cos(ph);
      r.y += c * d${i}.x;
      r.z += c * d${i}.y;
    }`
    ).join("")}
    return r;
  }
`;

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeIn = (t: number) => t * t;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export { smooth as smoothstep };
