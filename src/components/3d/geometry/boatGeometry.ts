import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry32 } from "@/lib/pondMath";

/**
 * Procedural plank boat (double-ended country boat) + open feed sack.
 * Boat-local axes: x along the hull (bow at -x), y up with the waterline at
 * y = 0, z across the beam. Everything is one merged mesh sharing one wood
 * texture, so the boat costs a single draw call.
 */
export const HULL = {
  length: 4.6,
  halfBeam: 0.7,
  /** top of the planked platform the farmer sits on */
  deckY: 0.36,
  /** inner floor — sits above the highest wave so no water shows inside the hull */
  floorY: 0.15,
};

export const BAG = { width: 0.46, height: 0.66, depth: 0.2 };

const ROWS = 10; // plank rows in the wood texture
const HALF = HULL.length / 2;

const keelY = (s: number) => -0.16 + 0.3 * Math.abs(s) ** 3;
const sheerY = (s: number) => 0.44 + 0.26 * Math.abs(s) ** 2.2 + (s < 0 ? 0.16 * (-s) ** 3 : 0);
const planHalf = (s: number) => HULL.halfBeam * Math.pow(Math.max(0, 1 - Math.abs(s) ** 2.3), 0.72);

/** Half-width of the hull interior at boat-local (x, y). */
export function hullHalfWidth(x: number, y: number) {
  const s = x / HALF;
  if (Math.abs(s) >= 1) return 0;
  const yk = keelY(s);
  const t = Math.min(1, (y - yk) / (sheerY(s) - yk));
  if (t <= 0) return 0;
  const c = 1 - Math.pow(t, 1 / 1.25);
  return planHalf(s) * Math.sqrt(Math.max(0, 1 - c * c));
}

function tint(g: THREE.BufferGeometry, shade: number) {
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3).fill(shade);
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

/** A plank: box whose faces sample one row of the wood texture, grain along `grain`. */
function plank(w: number, h: number, d: number, row: number, grain: "x" | "z") {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const len = grain === "x" ? w : d;
  for (let i = 0; i < uv.count; i++) {
    const face = Math.floor(i / 4); // +x, -x, +y, -y, +z, -z
    let u = uv.getX(i), v = uv.getY(i);
    // make `u` run along the grain on the faces where BoxGeometry maps it across
    if (grain === "z" && (face === 2 || face === 3)) [u, v] = [v, u];
    uv.setXY(i, u * (len / 1.6) + row * 0.37, (row + 0.14 + 0.72 * v) / ROWS);
  }
  return g;
}

function hullShell() {
  const NS = 44, NV = 20;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NS; i++) {
    const s = -1 + (2 * i) / NS;
    const yk = keelY(s), H = sheerY(s) - yk, w = planHalf(s);
    for (let j = 0; j <= NV; j++) {
      const v = -1 + (2 * j) / NV; // port gunwale → keel → starboard gunwale
      const ang = (Math.abs(v) * Math.PI) / 2;
      pos.push(s * HALF, yk + H * Math.pow(1 - Math.cos(ang), 1.25), Math.sign(v) * w * Math.sin(ang));
      uv.push(((s + 1) / 2) * 3, (v + 1) / 2);
    }
  }
  for (let i = 0; i < NS; i++)
    for (let j = 0; j < NV; j++) {
      const a = i * (NV + 1) + j, b = a + NV + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b); // outward-facing
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return tint(g, 0.92);
}

/** Gunwale rail: a rectangular section swept along the sheer line of one side. */
function rail(side: 1 | -1) {
  const N = 44, hy = 0.028, hz = 0.034;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const corners = [[hy, -hz], [hy, hz], [-hy, hz], [-hy, -hz]];
  for (let f = 0; f < 4; f++) {
    const [y0, z0] = corners[f], [y1, z1] = corners[(f + 1) % 4];
    for (let i = 0; i <= N; i++) {
      const s = -1 + (2 * i) / N;
      const x = s * HALF, y = sheerY(s), z = side * planHalf(s);
      pos.push(x, y + y0, z + z0, x, y + y1, z + z1);
      uv.push((i / N) * 3, (f + 0.2) / ROWS, (i / N) * 3, (f + 0.8) / ROWS);
    }
    const base = f * (N + 1) * 2;
    for (let i = 0; i < N; i++) {
      const a = base + i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return tint(g, 0.78);
}

/** Flat inner floor following the hull outline at `HULL.floorY`. */
function floor() {
  const N = 30;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const x = (-0.95 + (1.9 * i) / N) * HALF;
    const w = hullHalfWidth(x, HULL.floorY);
    pos.push(x, HULL.floorY, -w, x, HULL.floorY, w);
    uv.push((i / N) * 3, 0.1, (i / N) * 3, 0.9);
  }
  for (let i = 0; i < N; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return tint(g, 0.62);
}

export function createBoatGeometry() {
  const r = mulberry32(61);
  const parts: THREE.BufferGeometry[] = [hullShell(), rail(1), rail(-1), floor()];

  // planked platform amidships (the farmer and the feed sack sit on it)
  const pw = 0.2;
  for (let x = -0.9; x < 1.05; x += pw) {
    const w = hullHalfWidth(x, HULL.deckY) - 0.012;
    const p = plank(pw - 0.012, 0.036, w * 2, Math.floor(r() * ROWS), "z");
    p.translate(x, HULL.deckY - 0.018 - r() * 0.004, 0);
    parts.push(tint(p, 0.8 + r() * 0.2));
  }
  // thwarts near bow and stern
  for (const x of [-1.5, 1.55]) {
    const y = sheerY(x / HALF) - 0.09;
    const p = plank(0.17, 0.032, hullHalfWidth(x, y) * 2, Math.floor(r() * ROWS), "z");
    p.translate(x, y, 0);
    parts.push(tint(p, 0.85));
  }
  // exposed frames (ribs) in the open ends
  for (const x of [-1.95, -1.2, 1.25, 1.95]) {
    const y = HULL.floorY + 0.02;
    const p = plank(0.05, 0.04, hullHalfWidth(x, y) * 2, Math.floor(r() * ROWS), "z");
    p.translate(x, y, 0);
    parts.push(tint(p, 0.7));
  }

  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Weathered plank texture (colour + reused as bump). Client-only (canvas). */
export function createWoodTexture() {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const r = mulberry32(17);
  const rowH = H / ROWS;
  for (let row = 0; row < ROWS; row++) {
    const y0 = row * rowH;
    const l = 30 + r() * 14;
    g.fillStyle = `hsl(${28 + r() * 10}, ${16 + r() * 12}%, ${l}%)`;
    g.fillRect(0, y0, W, rowH);
    // grain streaks along the plank
    for (let k = 0; k < 150; k++) {
      const y = y0 + r() * rowH, x = r() * W, len = 60 + r() * 380;
      g.globalAlpha = 0.05 + r() * 0.13;
      g.fillStyle = r() < 0.55 ? "#1c140c" : "#b9a98c";
      g.fillRect(x, y, len, 0.6 + r() * 1.6);
      if (x + len > W) g.fillRect(0, y, x + len - W, 0.6 + r() * 1.6); // wrap in u
    }
    // butt joints + nail heads
    g.globalAlpha = 0.55;
    g.fillStyle = "#120d08";
    const joint = r() * W;
    g.fillRect(joint, y0, 2, rowH);
    g.globalAlpha = 0.5;
    for (let x = (row % 2) * 64; x < W; x += 128) {
      g.beginPath();
      g.arc(x + 8, y0 + rowH * 0.25, 1.8, 0, Math.PI * 2);
      g.arc(x + 8, y0 + rowH * 0.75, 1.8, 0, Math.PI * 2);
      g.fill();
    }
    // seam between strakes
    g.globalAlpha = 0.85;
    g.fillStyle = "#0e0a06";
    g.fillRect(0, y0, W, 2.5);
    g.globalAlpha = 0.25;
    g.fillStyle = "#d8c8a8";
    g.fillRect(0, y0 + 3, W, 1.2);
    g.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * Open feed sack standing on its base (y = 0). Material groups follow
 * BoxGeometry order: +x, -x, +y (pellets showing in the open mouth), -y,
 * +z (front artwork), -z (back artwork).
 */
export function createOpenBagGeometry() {
  const { width: w, height: h, depth: d } = BAG;
  const g = new THREE.BoxGeometry(w, h, d, 14, 18, 6);
  const p = g.attributes.position as THREE.BufferAttribute;
  const topStart = g.groups[2].start, topEnd = topStart + g.groups[2].count;
  const idx = g.index!;
  const isTop = new Uint8Array(p.count);
  for (let i = topStart; i < topEnd; i++) isTop[idx.getX(i)] = 1;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const nx = x / (w / 2), ny = y / (h / 2), nz = z / (d / 2);
    // filled sack: fat in the middle, pinched at the side seams and the base
    const puff = (1 - nx * nx * 0.78) * (ny < 0 ? 1 - Math.pow(-ny, 4) * 0.8 : 1 - ny * ny * 0.12);
    const zz = z * Math.max(0.08, puff) * 1.25 + Math.sin(y * 31 + x * 17) * 0.003;
    const xx = x * (1 + 0.05 * Math.cos(ny * Math.PI * 0.5));
    if (isTop[i]) {
      // heap of pellets a little below the rim
      const heap = (1 - nx * nx) * (1 - nz * nz);
      p.setXYZ(i, xx * 0.97, h - 0.045 + heap * 0.035 + Math.sin(x * 90) * Math.cos(z * 110) * 0.006, zz * 0.95);
    } else {
      p.setXYZ(i, xx, y + h / 2, zz);
    }
  }
  g.computeVertexNormals();
  return g;
}
