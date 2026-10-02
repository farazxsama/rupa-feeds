import { useMemo } from "react";
import * as THREE from "three";
import { createFishGeometry } from "./geometry/fishGeometry";
import { patchPondMaterial } from "./pondMaterial";

/**
 * FISH MODEL + SWIM MATERIAL
 * ------------------------------------------------------------------
 * The swim motion is a GPU vertex wave (no skeleton) so a whole school is a
 * single InstancedMesh draw call. Per-instance attributes:
 *   aPhase – accumulated tail-beat phase (CPU advances it by swim speed)
 *   aAmp   – beat amplitude (bigger when accelerating / feeding)
 *
 * TO USE A REAL GLB: load it with `useGLTF('/models/rohu.glb', true)` (Draco),
 * take its mesh geometry, orient head to +Z, scale to 1 unit long, and add an
 * `aBody` attribute (0 head → 1 tail, e.g. derived from position.z) plus
 * `aPart` (0). Then return it from useFishGeometry — nothing else changes.
 */

export const FISH_SWIM_GLSL = {
  header: /* glsl */ `
    attribute float aBody;
    attribute float aPart;
    attribute float aPhase;
    attribute float aAmp;
  `,
  deform: /* glsl */ `
    float bw = smoothstep(0.12, 1.3, aBody);
    float wv = sin(aPhase - aBody * 5.2);
    // travelling body wave: amplitude grows toward the tail (carangiform swimming)
    transformed.x += wv * bw * bw * 0.12 * aAmp;
    // small counter-yaw of the head so the body doesn't look pinned
    transformed.x += sin(aPhase + 1.2) * 0.012 * aAmp * (1.0 - bw);
    // pectoral fins paddle gently
    if (aPart > 0.5 && aBody < 0.45) transformed.y += sin(aPhase * 0.6 + position.x * 25.0) * 0.008;
  `,
};

export function useFishGeometry() {
  return useMemo(() => createFishGeometry(), []);
}

export function useFishMaterial() {
  return useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.36,
      metalness: 0.32,
      side: THREE.DoubleSide,
      envMapIntensity: 1.1,
    });
    return patchPondMaterial(m, { vertexHeader: FISH_SWIM_GLSL.header, vertexDeform: FISH_SWIM_GLSL.deform });
  }, []);
}
