import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32, terrainHeight, POND_CENTER } from "@/lib/pondMath";
import { patchPondMaterial } from "./pondMaterial";
import { WORLD, CAMERA_KEYS } from "@/config/story";

/**
 * Instanced blade geometry shared by submerged plants (vallisneria-like
 * ribbons) and emergent shoreline reeds. Sway is done in the vertex shader;
 * the per-instance phase is derived from the instance's world position, so no
 * extra attribute is needed.
 */
function bladeGeometry(segments = 7) {
  const g = new THREE.PlaneGeometry(1, 1, 1, segments);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(p.count * 3);
  const base = new THREE.Color("#ffffff");
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    p.setX(i, p.getX(i) * (1 - y * 0.85)); // taper
    p.setZ(i, y * y * 0.18); // natural curve
    const shade = 0.45 + y * 0.55; // darker at the base
    col.set([base.r * shade, base.g * shade, base.b * shade], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

const SWAY = (amp: number, speed: number) => /* glsl */ `
  #ifdef USE_INSTANCING
    float iPh = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.37;
  #else
    float iPh = 0.0;
  #endif
  float h = position.y;
  transformed.x += (sin(uPondTime * ${speed.toFixed(2)} + iPh + h * 1.8) * ${amp.toFixed(3)} + sin(uPondTime * ${(speed * 2.1).toFixed(2)} + iPh * 2.0) * ${(amp * 0.2).toFixed(3)}) * h * h;
  transformed.z += cos(uPondTime * ${(speed * 0.8).toFixed(2)} + iPh) * ${(amp * 0.5).toFixed(3)} * h * h;
`;

interface Props {
  count: number;
  kind: "submerged" | "reeds";
}

export function AquaticPlants({ count, kind }: Props) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => bladeGeometry(kind === "reeds" ? 4 : 7), [kind]);
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide });
    return kind === "reeds"
      ? patchPondMaterial(m, { vertexDeform: SWAY(0.06, 1.2), caustics: false })
      : patchPondMaterial(m, { vertexDeform: SWAY(0.22, 0.75) });
  }, [kind]);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = mulberry32(kind === "reeds" ? 404 : 202);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const c = new THREE.Color();
    const palette =
      kind === "reeds"
        ? ["#6f7a3e", "#87894a", "#5c6a34", "#9a9658"]
        : ["#3f5a2c", "#4e6a33", "#36502a", "#5a6e35"];
    // keep plants out of the camera's path + feeding zones so nothing blocks the story
    const keepClear = CAMERA_KEYS.filter((k) => k.pos[1] < -3).map((k) => [k.pos[0], k.pos[2]]);

    let placed = 0, guard = 0;
    while (placed < count && guard++ < count * 30) {
      let x: number, z: number;
      if (kind === "reeds") {
        const ang = r() * Math.PI * 2;
        const rad = 41 + r() * 7;
        // clumps: modulate density around the shore
        if (Math.sin(ang * 9) + Math.sin(ang * 23) * 0.5 < -0.4 && r() < 0.8) continue;
        x = POND_CENTER.x + Math.cos(ang) * rad;
        z = POND_CENTER.z + Math.sin(ang) * rad;
      } else {
        // clusters on the bottom
        const cx = POND_CENTER.x + (Math.floor(r() * 12) - 6) * 4.1 + Math.sin(placed) * 2;
        const cz = POND_CENTER.z + (Math.floor(r() * 12) - 6) * 3.7 + Math.cos(placed) * 2;
        x = cx + (r() - 0.5) * 2.6;
        z = cz + (r() - 0.5) * 2.6;
        if (Math.hypot(x - WORLD.net.x, z - WORLD.net.z) < 3.4) continue;
        if (Math.hypot(x - WORLD.sinking.x, z - WORLD.sinking.z) < 2.0) continue;
        if (keepClear.some(([kx, kz]) => Math.hypot(x - kx, z - kz) < 2.6)) continue;
      }
      const y = terrainHeight(x, z);
      if (kind === "submerged" && y > -2.5) continue;
      if (kind === "reeds" && (y < -1.2 || y > 1.4)) continue;
      const h = kind === "reeds" ? 1.3 + r() * 1.6 : 0.7 + Math.pow(r(), 1.5) * 3.2;
      const w = kind === "reeds" ? 0.035 + r() * 0.03 : 0.05 + r() * 0.07;
      e.set((r() - 0.5) * 0.25, r() * Math.PI * 2, (r() - 0.5) * 0.25);
      q.setFromEuler(e);
      m4.compose(p.set(x, y - 0.05, z), q, s.set(w, h, w));
      mesh.setMatrixAt(placed, m4);
      c.set(palette[Math.floor(r() * palette.length)]).multiplyScalar(0.85 + r() * 0.3);
      mesh.setColorAt(placed, c);
      placed++;
    }
    mesh.count = placed;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count, kind]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  return <instancedMesh ref={ref} args={[geometry, material, count]} />;
}
