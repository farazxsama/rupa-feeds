import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { fbm, mulberry32, terrainHeight, POND_CENTER } from "@/lib/pondMath";
import { patchPondMaterial } from "./pondMaterial";
import { WORLD } from "@/config/story";

/**
 * POND FLOOR + BANKS (one terrain mesh)
 * Silt/mud below the waterline, wet mud at the shoreline, grass above.
 * Vertex colours only (no textures to download). Caustics come from the
 * shared pond material patch.
 */
export function PondFloor({ segments }: { segments: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(300, 300, segments, segments);
    g.rotateX(-Math.PI / 2);
    g.translate(POND_CENTER.x, 0, POND_CENTER.z);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const silt = new THREE.Color("#5b5340");
    const siltDark = new THREE.Color("#3c3a2b");
    const algae = new THREE.Color("#46502f");
    const wet = new THREE.Color("#3a3226");
    const grass = new THREE.Color("#5b6d38");
    const grassDry = new THREE.Color("#8a8656");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const y = terrainHeight(x, z);
      pos.setY(i, y);
      const n = fbm(x * 0.21, z * 0.21, 3);
      const n2 = fbm(x * 0.9 + 3, z * 0.9, 2);
      if (y < -0.4) {
        c.copy(silt).lerp(siltDark, n).lerp(algae, Math.max(0, n2 - 0.45) * 1.2);
      } else if (y < 0.5) {
        c.copy(wet).lerp(silt, THREE.MathUtils.clamp((0.5 - y) * 0.5, 0, 1) * n);
      } else {
        c.copy(grass).lerp(grassDry, THREE.MathUtils.smoothstep(n, 0.45, 0.8)).multiplyScalar(0.85 + n2 * 0.25);
      }
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [segments]);

  const material = useMemo(
    () => patchPondMaterial(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 })),
    []
  );

  // scattered stones / clods on the bottom
  const rocks = useMemo(() => {
    const r = mulberry32(3);
    const g = new THREE.IcosahedronGeometry(1, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i);
      v.multiplyScalar(0.75 + fbm(v.x * 2 + 9, v.z * 2 + v.y, 2) * 0.5);
      v.y *= 0.55;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    const items: { pos: THREE.Vector3; s: number; rot: number }[] = [];
    while (items.length < 46) {
      const x = POND_CENTER.x + (r() - 0.5) * 50, z = POND_CENTER.z + (r() - 0.5) * 50;
      if (Math.hypot(x - WORLD.net.x, z - WORLD.net.z) < 3) continue;
      const y = terrainHeight(x, z);
      if (y > -1) continue;
      items.push({ pos: new THREE.Vector3(x, y, z), s: 0.08 + Math.pow(r(), 2) * 0.4, rot: r() * 6 });
    }
    return { g, items };
  }, []);
  const rockMat = useMemo(
    () => patchPondMaterial(new THREE.MeshStandardMaterial({ color: "#5f594a", roughness: 0.9 })),
    []
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      rocks.g.dispose();
      rockMat.dispose();
    },
    [geometry, material, rocks, rockMat]
  );

  return (
    <>
      <mesh geometry={geometry} material={material} />
      <instancedMesh
        args={[rocks.g, rockMat, rocks.items.length]}
        ref={(m) => {
          if (!m) return;
          const mat = new THREE.Matrix4();
          rocks.items.forEach((it, i) => {
            mat.compose(it.pos, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, it.rot, 0)), new THREE.Vector3().setScalar(it.s));
            m.setMatrixAt(i, mat);
          });
          m.instanceMatrix.needsUpdate = true;
          m.computeBoundingSphere();
        }}
      />
    </>
  );
}
