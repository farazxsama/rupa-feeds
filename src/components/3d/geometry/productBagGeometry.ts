import * as THREE from "three";

/**
 * 3D FEED SACK built from its packaging image.
 * ------------------------------------------------------------------
 * The bag outline is traced from the image itself (transparent or near-white
 * background = outside), then a grid is fitted inside that outline row by row.
 * Each vertex keeps the x / y of its image pixel, so seen from the front the
 * artwork is not stretched and the silhouette matches the photo; only z changes:
 *  - front + back: filled-sack bulge, flat heat-sealed bands at top and bottom,
 *    soft wrinkles that fade toward the seams
 *  - a folded side gusset joins them around the outline, printed with the
 *    artwork's edge colours
 * One indexed mesh per bag (about 12k triangles).
 */
const ROWS = 72;
const COLS = 40;
const HEIGHT = 1.38; // world units, same as the previous bag
const DEPTH = 0.15; // bulge of each face at the centre
const SIDE = 0.042; // half thickness at the side folds
const SEAL = 0.007; // half thickness at the sealed ends

type Source = HTMLImageElement | HTMLCanvasElement;
interface Outline {
  /** per output row: image-space [0..1] left / right edge and v (0 = top) */
  rows: { l: number; r: number; v: number }[];
  aspect: number; // image width / height
}

/** Fills notches narrower than `w` rows (white print touching the bag's edge). */
function closeEdge(a: Float32Array, w: number, grow: (x: number, y: number) => number, shrink: (x: number, y: number) => number) {
  const run = (src: Float32Array, f: (x: number, y: number) => number) => {
    const out = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) {
      let v = src[i];
      for (let k = Math.max(0, i - w); k <= Math.min(src.length - 1, i + w); k++) v = f(v, src[k]);
      out[i] = v;
    }
    return out;
  };
  return run(run(a, grow), shrink);
}

export function traceBagOutline(img: Source): Outline {
  const iw = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const ih = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  const W = Math.min(iw, 400), H = Math.round((ih / iw) * W);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  const inside = (x: number, y: number) => {
    const k = (y * W + x) * 4;
    return d[k + 3] > 120 && !(d[k] > 238 && d[k + 1] > 238 && d[k + 2] > 238);
  };

  const left = new Float32Array(H).fill(W), right = new Float32Array(H).fill(-1);
  let widest = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!inside(x, y)) continue;
      if (left[y] === W) left[y] = x;
      right[y] = x;
    }
    widest = Math.max(widest, right[y] - left[y]);
  }
  let top = 0, bottom = H - 1;
  while (top < H - 1 && right[top] - left[top] < widest * 0.2) top++;
  while (bottom > top && right[bottom] - left[bottom] < widest * 0.2) bottom--;

  top += 2; // stay off the anti-aliased top and bottom rims too
  bottom -= 2;
  const span = bottom - top + 1;
  const notch = Math.max(1, Math.round(span * 0.04));
  const L = closeEdge(left.slice(top, bottom + 1), notch, Math.min, Math.max);
  const R = closeEdge(right.slice(top, bottom + 1), notch, Math.max, Math.min);

  const inset = 1.5; // stay off the anti-aliased rim so no background bleeds in
  const rows: Outline["rows"] = [];
  for (let i = 0; i <= ROWS; i++) {
    const f = (i / ROWS) * (span - 1);
    const a = Math.floor(f), b = Math.min(span - 1, a + 1), u = f - a;
    rows.push({
      l: (L[a] + (L[b] - L[a]) * u + inset) / W,
      r: (R[a] + (R[b] - R[a]) * u + 1 - inset) / W,
      v: (top + f + 0.5) / H,
    });
  }
  return { rows, aspect: iw / ih };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createProductBagGeometry(img: Source, seed = 0) {
  const { rows, aspect } = traceBagOutline(img);
  const vTop = rows[0].v, vBottom = rows[ROWS].v;
  const scale = HEIGHT / (vBottom - vTop); // world units per image height
  const uMid = (Math.min(...rows.map((r) => r.l)) + Math.max(...rows.map((r) => r.r))) / 2;
  const vMid = (vTop + vBottom) / 2;
  const X = (u: number) => (u - uMid) * aspect * scale;
  const Y = (v: number) => (vMid - v) * scale;

  /** 0 at the sealed bands → 1 through the filled body. */
  const fill = (t: number) => smooth(0, 0.11, t) * (1 - smooth(0.92, 1, t));
  const edgeZ = (t: number) => SEAL + (SIDE - SEAL) * fill(t);
  const surfaceZ = (s: number, t: number, side: number) => {
    const across = Math.pow(Math.sin(Math.PI * s), 0.6);
    const body = across * fill(t);
    const x = s * 6.3 + seed, y = t * 8.7;
    // long soft creases plus finer puckering; fuller near the bottom where feed settles
    const wrinkle =
      0.007 * Math.sin(x * 1.7 + y * 2.3 + side) +
      0.005 * Math.sin(x * 3.1 - y * 1.9 + seed * 2.0) +
      0.0025 * Math.sin(x * 7.3 + y * 5.1) * Math.sin(y * 9.1 - x * 2.0);
    return edgeZ(t) + DEPTH * body * (0.86 + 0.24 * t) + wrinkle * body;
  };

  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const face = (side: 1 | -1) => {
    const base = pos.length / 3;
    for (let j = 0; j <= ROWS; j++) {
      const row = rows[j], t = j / ROWS;
      for (let i = 0; i <= COLS; i++) {
        const s = i / COLS;
        const u = row.l + (row.r - row.l) * s;
        pos.push(X(u), Y(row.v), side * surfaceZ(s, t, side));
        // the back mirrors u so its print still reads correctly from behind
        uv.push(side > 0 ? u : row.l + row.r - u, 1 - row.v);
      }
    }
    const w = COLS + 1;
    for (let j = 0; j < ROWS; j++)
      for (let i = 0; i < COLS; i++) {
        const a = base + j * w + i, b = a + 1, c = a + w, d = c + 1;
        if (side > 0) idx.push(a, c, b, b, c, d);
        else idx.push(a, b, c, b, d, c);
      }
  };
  face(1);
  face(-1);

  // side gusset: front edge → folded inward → back edge, walking round the outline
  const loop: { u: number; v: number; t: number; dir: number }[] = [];
  for (let j = 0; j <= ROWS; j++) loop.push({ u: rows[j].l, v: rows[j].v, t: j / ROWS, dir: 1 });
  for (let i = 1; i <= COLS; i++) {
    const r = rows[ROWS];
    loop.push({ u: r.l + (r.r - r.l) * (i / COLS), v: r.v, t: 1, dir: 0 });
  }
  for (let j = ROWS - 1; j >= 0; j--) loop.push({ u: rows[j].r, v: rows[j].v, t: j / ROWS, dir: -1 });
  for (let i = COLS - 1; i > 0; i--) {
    const r = rows[0];
    loop.push({ u: r.l + (r.r - r.l) * (i / COLS), v: r.v, t: 0, dir: 0 });
  }
  const base = pos.length / 3;
  loop.forEach((p) => {
    const x = X(p.u), y = Y(p.v), z = edgeZ(p.t), tuck = p.dir * 0.03 * fill(p.t);
    const uIn = p.u + p.dir * 0.004; // sample just inside the print
    pos.push(x, y, z, x + tuck, y, 0, x, y, -z);
    uv.push(uIn, 1 - p.v, uIn, 1 - p.v, uIn, 1 - p.v);
  });
  for (let k = 0; k < loop.length; k++) {
    const a = base + k * 3, b = base + ((k + 1) % loop.length) * 3;
    idx.push(a, a + 1, b, b, a + 1, b + 1, a + 1, a + 2, b + 1, b + 1, a + 2, b + 2);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Fine woven-polypropylene grain (bump map), shared by every bag. Client-only. */
let weave: THREE.CanvasTexture | null = null;
export function getBagWeaveTexture() {
  if (weave) return weave;
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < S; i += 4) {
    g.fillStyle = "#9a9a9a";
    g.fillRect(0, i, S, 2);
    g.fillStyle = i % 8 ? "#6a6a6a" : "#747474";
    g.fillRect(i, 0, 2, S);
  }
  weave = new THREE.CanvasTexture(c);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(14, 14);
  weave.anisotropy = 4;
  return weave;
}
