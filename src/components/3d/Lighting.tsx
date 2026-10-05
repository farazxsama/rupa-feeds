import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/lib/storyStore";

/** Low, warm sun in front of the hero camera → glitter path on the water. */
export const SUN_DIR = new THREE.Vector3(0.35, 0.42, -0.84).normalize();

const SKY = new THREE.Color("#bcd3e3");
const GROUND = new THREE.Color("#46502f");
const SKY_UNDER = new THREE.Color("#8fc4d8");
const GROUND_UNDER = new THREE.Color("#12303f");

/**
 * Two lights total (sun + hemisphere). No real-time shadow maps: underwater
 * scattering makes them barely visible and they are the biggest GPU cost.
 * Light intensity is attenuated with camera depth (Beer–Lambert-ish).
 */
export function Lighting() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);

  useFrame(() => {
    const u = story.underwater;
    const depth = Math.max(0, -story.cameraY);
    const atten = Math.exp(-depth * 0.085);
    if (sun.current) sun.current.intensity = THREE.MathUtils.lerp(2.7, 2.2 * atten + 0.25, u);
    if (hemi.current) {
      hemi.current.intensity = THREE.MathUtils.lerp(1.0, 0.55 + 0.75 * atten, u);
      hemi.current.color.copy(SKY).lerp(SKY_UNDER, u);
      hemi.current.groundColor.copy(GROUND).lerp(GROUND_UNDER, u);
    }
  });

  return (
    <>
      <directionalLight ref={sun} position={SUN_DIR.clone().multiplyScalar(60).toArray()} color="#fff0d8" intensity={2.7} />
      <hemisphereLight ref={hemi} args={[SKY, GROUND, 1]} />
    </>
  );
}
