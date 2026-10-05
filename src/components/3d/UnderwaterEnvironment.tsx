import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/lib/storyStore";
import { mulberry32 } from "@/lib/pondMath";
import { pondUniforms } from "./pondMaterial";
import { feed } from "./feedState";
import { SUN_DIR } from "./Lighting";

/**
 * UNDERWATER ATMOSPHERE
 *  - Atmosphere: fog colour/density, background, env intensity — all blended
 *    by `story.underwater` and camera depth, so the dive is continuous.
 *  - LightRays: additive soft shafts hanging from the surface.
 *  - Particles: suspended matter in an infinite wrap-around volume.
 *  - Bubbles: rising columns + a burst as the camera breaks the surface.
 */

const ABOVE_FOG = new THREE.Color("#c6d5da");
const SHALLOW = new THREE.Color("#2b7fa0");
const DEEP = new THREE.Color("#0a3350");
const BRIGHT_TINT = new THREE.Color("#12405c");

function Atmosphere() {
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => new THREE.FogExp2(ABOVE_FOG.clone(), 0.007), []);
  const bg = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame((state) => {
    const camY = state.camera.position.y;
    // smooth blend across the waterline (± a few cm of wave height)
    const u = THREE.MathUtils.smoothstep(-camY, -0.12, 0.12);
    story.underwater = u;
    story.cameraY = camY;
    pondUniforms.uPondUnder.value = u;
    pondUniforms.uPondTime.value = state.clock.elapsedTime;
    feed.clock = state.clock.elapsedTime;

    const depthN = THREE.MathUtils.clamp(-camY / 12, 0, 1);
    tmp.copy(SHALLOW).lerp(DEEP, Math.pow(depthN, 0.8));
    fog.color.copy(ABOVE_FOG).lerp(tmp, u);
    fog.density = THREE.MathUtils.lerp(0.0085, THREE.MathUtils.lerp(0.058, 0.082, depthN), u);
    pondUniforms.uPondTint.value.copy(BRIGHT_TINT);
    pondUniforms.uCausticStrength.value = THREE.MathUtils.lerp(0.35, 0.7, u);

    if (u > 0.5) {
      bg.copy(fog.color);
      scene.background = bg;
    } else {
      scene.background = null;
    }
    // reflections from the sky env-map are mostly lost underwater
    (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = THREE.MathUtils.lerp(1, 0.3, u);
  });
  return null;
}

// ---------------------------------------------------------------------------
function LightRays({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: pondUniforms.uPondTime, uUnder: pondUniforms.uPondUnder, uCam: { value: new THREE.Vector3() } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vW;
          void main() {
            vUv = uv;
            vec4 w = modelMatrix * vec4(position, 1.0);
            vW = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime, uUnder;
          varying vec2 vUv;
          varying vec3 vW;
          void main() {
            float edge = smoothstep(0.0, 0.4, vUv.x) * smoothstep(1.0, 0.6, vUv.x);
            float along = pow(vUv.y, 1.6);
            float flick = 0.7 + 0.3 * sin(uTime * 0.6 + vW.x * 0.9 + vUv.y * 2.5);
            float d = length(cameraPosition - vW);
            float near = smoothstep(0.6, 2.5, d) * (1.0 - smoothstep(10.0, 22.0, d));
            float a = edge * along * flick * near * uUnder * 0.075;
            gl_FragColor = vec4(vec3(0.84, 0.95, 1.0) * a, 1.0);
          }`,
      }),
    []
  );
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 22, 1, 1);
    g.translate(0, -11, 0); // top edge at the surface
    return g;
  }, []);
  const rays = useMemo(() => {
    const r = mulberry32(5);
    return Array.from({ length: count }, () => ({
      ox: (r() - 0.5) * 20,
      oz: (r() - 0.5) * 18 - 3,
      w: 0.8 + r() * 2.4,
      ph: r() * 10,
    }));
  }, [count]);

  useEffect(() => () => { material.dispose(); geometry.dispose(); }, [material, geometry]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.visible = story.underwater > 0.01;
    if (!g.visible) return;
    // rays drift with the viewer so there are always some in frame
    g.position.x += (camera.position.x - g.position.x) * 0.02;
    g.position.z += (camera.position.z - g.position.z) * 0.02;
    const t = state.clock.elapsedTime;
    g.children.forEach((c, i) => {
      const ray = rays[i];
      c.position.set(ray.ox + Math.sin(t * 0.05 + ray.ph) * 0.6, 0, ray.oz);
      const wx = g.position.x + c.position.x, wz = g.position.z + c.position.z;
      c.rotation.set(0, Math.atan2(camera.position.x - wx, camera.position.z - wz), 0);
      // slant toward the sun direction
      c.rotateZ(-SUN_DIR.x * 0.35);
      c.rotateX(SUN_DIR.z * 0.2);
    });
  });

  return (
    <group ref={group}>
      {rays.map((r, i) => (
        <mesh key={i} geometry={geometry} material={material} scale={[r.w, 1, 1]} renderOrder={4} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
function Particles({ count }: { count: number }) {
  const B = 16;
  const geometry = useMemo(() => {
    const r = mulberry32(77);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = r() * B;
      pos[i * 3 + 1] = r() * B;
      pos[i * 3 + 2] = r() * B;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: pondUniforms.uPondTime,
          uUnder: pondUniforms.uPondUnder,
          uPR: { value: 1 },
        },
        vertexShader: /* glsl */ `
          uniform float uTime, uUnder, uPR;
          attribute float aSeed;
          varying float vA;
          const float B = ${B.toFixed(1)};
          void main() {
            vec3 drift = vec3(sin(uTime * 0.07 + aSeed * 40.0) * 0.6, uTime * 0.03 * (aSeed - 0.3), cos(uTime * 0.05 + aSeed * 30.0) * 0.6);
            vec3 p = mod(position + drift - cameraPosition + 0.5 * B, B) - 0.5 * B + cameraPosition;
            vec4 mv = viewMatrix * vec4(p, 1.0);
            float depth = clamp(-p.y / 13.0, 0.0, 1.0);
            float d = -mv.z;
            vA = uUnder * step(0.05, -p.y) * (0.35 + 0.65 * depth) * smoothstep(0.3, 1.2, d) * (1.0 - smoothstep(5.0, 8.0, d));
            gl_PointSize = (0.6 + aSeed * 1.6) * uPR * 26.0 / max(d, 0.1);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.1, d) * vA * 0.55;
            if (a < 0.003) discard;
            gl_FragColor = vec4(0.75, 0.86, 0.9, a);
          }`,
      }),
    []
  );
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    material.uniforms.uPR.value = gl.getPixelRatio();
  }, [gl, material]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
}

// ---------------------------------------------------------------------------
const BUBBLE_FRAG = /* glsl */ `
  varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float rim = smoothstep(0.5, 0.42, d) - smoothstep(0.4, 0.22, d) * 0.8;
    float hi = smoothstep(0.14, 0.0, length(c - vec2(-0.14, -0.14)));
    float a = (rim * 0.7 + hi) * vA;
    if (a < 0.003) discard;
    gl_FragColor = vec4(0.9, 0.98, 0.96, a);
  }`;

function Bubbles({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const r = mulberry32(88);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // bubbles rise in loose columns (vents in the silt / plant clusters)
      const col = Math.floor(r() * 9);
      pos[i * 3] = col * 1.37 + (r() - 0.5) * 0.25;
      pos[i * 3 + 1] = r();
      pos[i * 3 + 2] = ((col * 7) % 9) * 1.41 + (r() - 0.5) * 0.25;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: pondUniforms.uPondTime, uUnder: pondUniforms.uPondUnder, uPR: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uTime, uUnder, uPR;
          attribute float aSeed;
          varying float vA;
          const float B = 12.6;
          void main() {
            vec3 p = position;
            p.xz = mod(p.xz - cameraPosition.xz + 0.5 * B, B) - 0.5 * B + cameraPosition.xz;
            float speed = 0.35 + aSeed * 0.5;
            float y = mod(p.y * 13.0 + uTime * speed, 13.0);
            p.y = -13.0 + y;
            p.x += sin(uTime * 3.0 + aSeed * 50.0) * 0.04;
            p.z += cos(uTime * 2.6 + aSeed * 40.0) * 0.04;
            vec4 mv = viewMatrix * vec4(p, 1.0);
            float d = -mv.z;
            vA = uUnder * step(p.y, -0.05) * smoothstep(0.3, 1.0, d) * (1.0 - smoothstep(7.0, 11.0, d)) * 0.8;
            gl_PointSize = (2.0 + aSeed * 4.0) * uPR * 10.0 / max(d, 0.1);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: BUBBLE_FRAG,
      }),
    []
  );
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    material.uniforms.uPR.value = gl.getPixelRatio();
  }, [gl, material]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
}

/** Burst of bubbles trailing the camera as it breaks through the surface. */
function DiveBurst() {
  const N = 90;
  const last = useRef(0);
  const geometry = useMemo(() => {
    const r = mulberry32(99);
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (r() - 0.5) * 2.4;
      pos[i * 3 + 1] = -r() * 1.8 - 0.2;
      pos[i * 3 + 2] = -r() * 2.5 - 0.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uAge: { value: 10 }, uOrigin: { value: new THREE.Vector3() }, uPR: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uAge, uPR;
          uniform vec3 uOrigin;
          varying float vA;
          void main() {
            vec3 p = uOrigin + position;
            float k = fract(sin(dot(position.xz, vec2(12.9, 78.2))) * 43758.5);
            p.y += uAge * (0.9 + k * 1.4);
            p.x += sin(uAge * 4.0 + k * 30.0) * 0.05;
            vec4 mv = viewMatrix * vec4(p, 1.0);
            float d = -mv.z;
            vA = (1.0 - smoothstep(0.5, 2.6, uAge)) * step(p.y, -0.03) * step(0.0, uAge);
            gl_PointSize = (3.0 + k * 7.0) * uPR * 10.0 / max(d, 0.1);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: BUBBLE_FRAG,
      }),
    []
  );
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const fwd = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    material.uniforms.uPR.value = gl.getPixelRatio();
  }, [gl, material]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((_, dt) => {
    const u = story.underwater;
    // trigger on crossing the waterline going DOWN
    if (u > 0.5 && last.current <= 0.5) {
      camera.getWorldDirection(fwd);
      material.uniforms.uOrigin.value.copy(camera.position).addScaledVector(fwd, 2.2);
      material.uniforms.uAge.value = 0;
    }
    last.current = u;
    material.uniforms.uAge.value += Math.min(dt, 0.05);
  });
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={6} />;
}

export function UnderwaterEnvironment({ rays, particles, bubbles }: { rays: number; particles: number; bubbles: number }) {
  return (
    <>
      <Atmosphere />
      <LightRays count={rays} />
      <Particles count={particles} />
      <Bubbles count={bubbles} />
      <DiveBurst />
    </>
  );
}
