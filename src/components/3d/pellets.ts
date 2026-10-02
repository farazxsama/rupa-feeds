import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { patchPondMaterial } from "./pondMaterial";
import { mulberry32 } from "@/lib/pondMath";

/**
 * Shared pellet geometry/material. Pellets are scaled up ~2x versus real
 * life so they read clearly on screen — this is a storytelling choice.
 */
export function usePelletAssets() {
  const geometry = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.026, 0.026, 2, 7);
    g.rotateZ(Math.PI / 2); // lie on their side
    return g;
  }, []);
  const material = useMemo(
    () =>
      patchPondMaterial(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7, metalness: 0, emissive: "#3a2410", emissiveIntensity: 0.35 }), {
        caustics: true,
      }),
    []
  );
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return { geometry, material };
}

/** Warm, slightly varied extruded-feed colours. */
export function applyPelletColors(mesh: THREE.InstancedMesh, count: number, seed: number, base = "#8a5a2b") {
  const rand = mulberry32(seed);
  const c = new THREE.Color();
  const b = new THREE.Color(base);
  for (let i = 0; i < count; i++) {
    c.copy(b).offsetHSL((rand() - 0.5) * 0.02, (rand() - 0.5) * 0.1, (rand() - 0.5) * 0.08);
    mesh.setColorAt(i, c);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.frustumCulled = false;
}

export const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);
