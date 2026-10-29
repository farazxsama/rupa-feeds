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
 *   aBend  – body curve while turning (+ = turning toward +X); the head
 *            leads and the rest of the body follows the curved path
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
    attribute float aBend;
  `,
  deform: /* glsl */ `
    float bw = smoothstep(0.12, 1.3, aBody);
    float wv = sin(aPhase - aBody * 5.2);
    // travelling body wave: amplitude grows toward the tail (carangiform swimming)
    transformed.x += wv * bw * bw * 0.12 * aAmp;
    // small counter-yaw of the head so the body doesn't look pinned
    transformed.x += sin(aPhase + 1.2) * 0.012 * aAmp * (1.0 - bw);
    // turning: the body arcs behind the head (stronger toward the tail)
    transformed.x += aBend * aBody * aBody * 0.085;
    // pectoral fins flap from their root (|x| ≈ 0.074); more when cruising slowly
    float pect = max(abs(position.x) - 0.074, 0.0);
    if (aPart > 0.5 && aBody < 0.45 && pect > 0.0) {
      float finAmp = clamp(1.35 - aAmp * 0.55, 0.45, 1.1);
      transformed.y += sin(aPhase * 0.42 + sign(position.x) * 0.9) * pect * 0.95 * finAmp;
      transformed.z += cos(aPhase * 0.42 + sign(position.x) * 0.9) * pect * 0.35 * finAmp;
    }
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
