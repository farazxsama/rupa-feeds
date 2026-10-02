import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { feed } from "./feedState";
import { pondUniforms } from "./pondMaterial";

const MAX = 32;
const LIFE = 2.6; // seconds

/**
 * Expanding rings where pellets land / fish take feed. Time-based (not
 * scroll-based) so they keep playing out naturally when the user stops.
 */
export function SurfaceRipples() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const ageAttr = useMemo(() => new THREE.InstancedBufferAttribute(new Float32Array(MAX).fill(1), 1), []);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    g.setAttribute("aAge", ageAttr);
    return g;
  }, [ageAttr]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uUnder: pondUniforms.uPondUnder },
        vertexShader: /* glsl */ `
          attribute float aAge;
          varying float vAge;
          varying vec2 vUv;
          void main() {
            vAge = aAge; vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uUnder;
          varying float vAge;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            // two concentric soft rings
            float ring = smoothstep(0.08, 0.0, abs(d - 0.92)) + 0.6 * smoothstep(0.07, 0.0, abs(d - 0.62));
            float a = ring * (1.0 - vAge) * (1.0 - vAge) * 0.55 * (1.0 - uUnder * 0.7);
            if (a < 0.002) discard;
            gl_FragColor = vec4(vec3(0.92, 0.96, 0.95), a);
          }`,
      }),
    []
  );
  const m = useMemo(() => new THREE.Matrix4(), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const now = feed.clock;
    // drop expired
    while (feed.ripples.length && now - feed.ripples[0].t0 > LIFE) feed.ripples.shift();
    for (let i = 0; i < MAX; i++) {
      const r = feed.ripples[i];
      if (!r) {
        ageAttr.array[i] = 1;
        m.makeScale(0, 0, 0);
      } else {
        const age = Math.min(1, (now - r.t0) / LIFE);
        ageAttr.array[i] = age;
        const sc = (0.15 + Math.sqrt(age) * 1.3) * r.s;
        m.makeScale(sc, 1, sc).setPosition(r.x, 0.03, r.z);
      }
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    ageAttr.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, MAX]} frustumCulled={false} renderOrder={3} />;
}
