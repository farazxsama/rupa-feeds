import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { WAVE_GLSL } from "@/lib/pondMath";
import { pondUniforms } from "./pondMaterial";
import { SUN_DIR } from "./Lighting";

/**
 * WATER SURFACE — single custom shader, two personalities:
 *  - seen from ABOVE (front face): Fresnel blend of pond-green body colour and
 *    an analytic sky reflection, dark shoreline reflection band, sun glitter.
 *  - seen from BELOW (back face): Snell's window (bright disc overhead) with
 *    total-internal-reflection teal outside it.
 * No render targets / planar reflections → cheap enough for mobile.
 */
export function WaterSurface({ segments }: { segments: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, segments, segments);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [segments]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uSunDir: { value: SUN_DIR.clone() },
            uSunColor: { value: new THREE.Color("#fff1d6") },
            uDeep: { value: new THREE.Color("#0b2f4a") },
            uShallow: { value: new THREE.Color("#1f6585") },
            uSkyZenith: { value: new THREE.Color("#4f86bd") },
            uSkyHorizon: { value: new THREE.Color("#c8d8df") },
            uShore: { value: new THREE.Color("#26331f") },
            uUnderTIR: { value: new THREE.Color("#1f6f8f") },
          },
        ]),
        vertexShader: /* glsl */ `
          uniform float uPondTime;
          varying vec3 vWorld;
          varying vec3 vNormalW;
          #include <fog_pars_vertex>
          ${WAVE_GLSL}
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            // fade wave amplitude with distance → no shimmering/aliasing at the horizon
            float fade = 1.0 - smoothstep(35.0, 110.0, length(wp.xz - cameraPosition.xz));
            vec3 w = pondWave(wp.xz, uPondTime) * fade;
            wp.y += w.x;
            vNormalW = normalize(vec3(-w.y, 1.0, -w.z));
            vWorld = wp.xyz;
            vec4 mvPosition = viewMatrix * wp;
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }`,
        fragmentShader: /* glsl */ `
          uniform float uPondTime;
          uniform vec3 uSunDir, uSunColor, uDeep, uShallow, uSkyZenith, uSkyHorizon, uShore, uUnderTIR;
          varying vec3 vWorld;
          varying vec3 vNormalW;
          #include <fog_pars_fragment>

          void main() {
            vec3 toCam = cameraPosition - vWorld;
            float dist = length(toCam);
            vec3 V = toCam / dist;
            vec3 N = normalize(vNormalW);

            // fragment-level micro ripples (fade out with distance)
            vec2 p = vWorld.xz;
            float t = uPondTime;
            float detail = 1.0 - smoothstep(4.0, 30.0, dist);
            // golden-angle capillary ripples: no repeating grid
            vec2 mr = vec2(0.0);
            for (int i = 0; i < 6; i++) {
              float fi = float(i);
              float ang = fi * 2.39996 + 1.1;
              vec2 dir = vec2(cos(ang), sin(ang));
              float k = 3.2 * pow(1.37, fi);
              float ph = dot(dir, p) * k + t * sqrt(9.8 * k) * 0.5;
              mr += dir * cos(ph) * (0.05 / pow(1.3, fi));
            }
            mr *= detail;
            N = normalize(N + vec3(mr.x, 0.0, mr.y));

            vec3 col;
            float alpha;
            if (gl_FrontFacing) {
              float ndv = max(dot(N, V), 0.0);
              float fres = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
              vec3 R = reflect(-V, N);
              float h = clamp(R.y, 0.0, 1.0);
              vec3 sky = mix(uSkyHorizon, uSkyZenith, pow(h, 0.55));
              // reflection of the tree-lined banks just above the horizon
              sky = mix(sky, uShore, (1.0 - smoothstep(0.015, 0.11, R.y)) * 0.85);
              vec3 body = mix(uDeep, uShallow, 0.35 * ndv);
              float sd = max(dot(R, normalize(uSunDir)), 0.0);
              float spec = pow(sd, 900.0) * 9.0 + pow(sd, 90.0) * 0.35;
              col = mix(body, sky, fres) + uSunColor * spec;
              // looking straight down you see into the water; at grazing angles it's a mirror
              alpha = mix(0.6, 0.97, fres);
              alpha = max(alpha, smoothstep(20.0, 70.0, dist));
            } else {
              // underside: Snell's window (~48.6° half-angle)
              vec3 Nu = -N;
              float ndv = max(dot(Nu, V), 0.0);
              float win = smoothstep(0.6, 0.72, ndv);
              vec3 dirUp = -V;
              float sunGlow = pow(max(dot(dirUp, normalize(uSunDir)), 0.0), 24.0);
              vec3 through = mix(uSkyHorizon, uSkyZenith * 1.1, 0.4) * 1.05 + uSunColor * sunGlow * 1.6;
              // bright rim at the edge of the window
              float rim = smoothstep(0.55, 0.64, ndv) * (1.0 - smoothstep(0.64, 0.74, ndv));
              col = mix(uUnderTIR, through, win) + rim * 0.25;
              alpha = 0.98;
            }
            gl_FragColor = vec4(col, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            #include <fog_fragment>
          }`,
      }),
    []
  );

  // share the global clock uniform
  useMemo(() => {
    material.uniforms.uPondTime = pondUniforms.uPondTime;
  }, [material]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  return <mesh geometry={geometry} material={material} renderOrder={2} />;
}
