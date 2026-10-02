import * as THREE from "three";

/**
 * Minimal procedural mesh builder used for the placeholder animal models.
 * Every vertex carries: position, normal (computed), color, aBody (0 = head →
 * 1 = tail; drives swim deformation) and aPart (0 body, 1 legs/fins, 2 antennae).
 *
 * When final GLB models arrive, keep the same two custom attributes (or bake
 * them from UVs) and the swim shaders keep working.
 */
export class MeshBuilder {
  pos: number[] = [];
  col: number[] = [];
  body: number[] = [];
  part: number[] = [];
  idx: number[] = [];

  get vcount() {
    return this.pos.length / 3;
  }

  vert(x: number, y: number, z: number, c: THREE.Color, b: number, p = 0) {
    this.pos.push(x, y, z);
    this.col.push(c.r, c.g, c.b);
    this.body.push(b);
    this.part.push(p);
    return this.vcount - 1;
  }

  tri(a: number, b: number, c: number) {
    this.idx.push(a, b, c);
  }

  /** grid of (cols+1)*(rows+1) vertices produced by fn(u, v) */
  grid(
    cols: number,
    rows: number,
    fn: (u: number, v: number) => { p: [number, number, number]; c: THREE.Color; b: number; part?: number }
  ) {
    const start = this.vcount;
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= cols; i++) {
        const r = fn(i / cols, j / rows);
        this.vert(r.p[0], r.p[1], r.p[2], r.c, r.b, r.part ?? 0);
      }
    const w = cols + 1;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const a = start + j * w + i;
        this.tri(a, a + 1, a + w);
        this.tri(a + 1, a + w + 1, a + w);
      }
  }

  /** closed ring tube; ring(i) gives the ring centre/radii for station t */
  tube(
    stations: number,
    seg: number,
    ring: (t: number) => { c: [number, number, number]; rx: number; ry: number },
    color: (t: number, a: number) => THREE.Color,
    bodyAt: (t: number) => number,
    part = 0
  ) {
    const start = this.vcount;
    for (let s = 0; s <= stations; s++) {
      const t = s / stations;
      const r = ring(t);
      for (let k = 0; k <= seg; k++) {
        const a = (k / seg) * Math.PI * 2;
        this.vert(r.c[0] + Math.cos(a) * r.rx, r.c[1] + Math.sin(a) * r.ry, r.c[2], color(t, a), bodyAt(t), part);
      }
    }
    const w = seg + 1;
    for (let s = 0; s < stations; s++)
      for (let k = 0; k < seg; k++) {
        const a = start + s * w + k;
        this.tri(a, a + w, a + 1);
        this.tri(a + 1, a + w, a + w + 1);
      }
  }

  sphere(cx: number, cy: number, cz: number, r: number, c: THREE.Color, b: number, part = 0) {
    const g = new THREE.SphereGeometry(r, 8, 6);
    const p = g.attributes.position;
    const start = this.vcount;
    for (let i = 0; i < p.count; i++) this.vert(cx + p.getX(i), cy + p.getY(i), cz + p.getZ(i), c, b, part);
    const ix = g.index!;
    for (let i = 0; i < ix.count; i += 3) this.tri(start + ix.getX(i), start + ix.getX(i + 1), start + ix.getX(i + 2));
    g.dispose();
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute("aBody", new THREE.Float32BufferAttribute(this.body, 1));
    g.setAttribute("aPart", new THREE.Float32BufferAttribute(this.part, 1));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }
}
