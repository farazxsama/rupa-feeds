import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { POND_CENTER } from "@/lib/pondMath";
import { AquaticPlants } from "./AquaticPlants";

/**
 * Distant tree line / shrub band as a ring with a procedural canopy edge.
 * At 50–130 m behind haze, a well-shaped silhouette reads far more like a real
 * landscape than individual low-poly trees, and costs a single draw call.
 */
function TreeLine({ radius, height, base, color, seed, density = 1 }: { radius: number; height: number; base: number; color: string; seed: number; density?: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        fog: true,
        side: THREE.DoubleSide,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          { uColor: { value: new THREE.Color(color) }, uSeed: { value: seed }, uDensity: { value: density } },
        ]),
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          #include <fog_pars_vertex>
          void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uSeed, uDensity;
          varying vec2 vUv;
          #include <fog_pars_fragment>
          float h1(float n) { return fract(sin(n * 91.345 + uSeed) * 47453.5453); }
          float vnoise(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
          float h2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }
          void main() {
            float x = vUv.x * 900.0 * uDensity;
            // canopy edge: groves (low freq) + crowns (mid) + leaf clumps (high)
            // canopy edge: groves (low freq) + two staggered layers of
            // irregular crowns (max-blended) + leaf-clump jitter
            float grove = smoothstep(0.2, 0.8, vnoise(x * 0.011)) * 0.7 + vnoise(x * 0.043) * 0.3;
            float crowns = 0.0;
            for (int L = 0; L < 2; L++) {
              float sz = L == 0 ? 7.0 : 4.3;
              float xs = x / sz + float(L) * 0.37;
              float cell = floor(xs);
              float cx = fract(xs) - 0.5 + (h1(cell + 3.0) - 0.5) * 0.3;
              float rr = 0.3 + 0.28 * h1(cell + float(L) * 17.0);
              float dome = sqrt(max(0.0, rr * rr - cx * cx)) / rr;
              crowns = max(crowns, dome * (0.35 + 0.65 * h1(cell + 7.0 + float(L) * 5.0)) * (L == 0 ? 1.0 : 0.7));
            }
            float edge = 0.16 + grove * (0.3 + crowns * 0.5) + vnoise(x * 1.1) * 0.05 + vnoise(x * 4.3) * 0.025;
            if (vUv.y > edge) discard;
            float shade = 0.65 + 0.35 * smoothstep(0.0, edge, vUv.y) + (h2(floor(vec2(x * 0.8, vUv.y * 60.0))) - 0.5) * 0.18;
            gl_FragColor = vec4(uColor * shade, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            #include <fog_fragment>
          }`,
      }),
    [color, seed, density]
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh position={[POND_CENTER.x, base + height / 2, POND_CENTER.z]} material={material}>
      <cylinderGeometry args={[radius, radius, height, 160, 1, true]} />
    </mesh>
  );
}

export function PondBanks({ reeds, trees }: { reeds: number; trees: number }) {
  return (
    <>
      <AquaticPlants kind="reeds" count={reeds} />
      {/* far groves, nearer tree line, shrubs on the embankment */}
      <TreeLine radius={150} height={26} base={-1} color="#56664d" seed={3} density={1.3} />
      {trees > 0 && <TreeLine radius={95} height={18} base={-0.5} color="#33452b" seed={7} />}
      <TreeLine radius={53} height={2.6} base={0.1} color="#45562f" seed={11} density={1.6} />
    </>
  );
}
