"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import type { QualitySettings } from "@/lib/quality";
import { story } from "@/lib/storyStore";
import { WORLD } from "@/config/story";
import { Lighting, SUN_DIR } from "./Lighting";
import { WaterSurface } from "./WaterSurface";
import { UnderwaterEnvironment } from "./UnderwaterEnvironment";
import { PondFloor } from "./PondFloor";
import { PondBanks } from "./PondBanks";
import { AquaticPlants } from "./AquaticPlants";
import { FeedingNet } from "./FeedingNet";
import { FishSchool } from "./FishSchool";
import { Shrimp } from "./Shrimp";
import { FloatingPellets } from "./FloatingPellets";
import { SinkingPellets } from "./SinkingPellets";
import { PolyculturePellets } from "./PolyculturePellets";
import { SurfaceRipples } from "./SurfaceRipples";
import { CameraController } from "./CameraController";


/**
 * Art-directed sky dome (gradient + sun glow) instead of a physical sky:
 * colours are matched to the water reflection + haze so the horizon blends.
 */
function SkyMaterial() {
  return (
    <shaderMaterial
      side={THREE.BackSide}
      depthWrite={false}
      fog={false}
      uniforms={{
        uZenith: { value: new THREE.Color("#4a82bd") },
        uHorizon: { value: new THREE.Color("#c8d8df") },
        uGround: { value: new THREE.Color("#7b8a74") },
        uSun: { value: SUN_DIR.clone() },
      }}
      vertexShader={`varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
      fragmentShader={`
        uniform vec3 uZenith, uHorizon, uGround, uSun;
        varying vec3 vDir;
        void main(){
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 col = h > 0.0 ? mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.42)) : mix(uHorizon, uGround, clamp(-h * 6.0, 0.0, 1.0));
          float s = max(dot(d, normalize(uSun)), 0.0);
          col += vec3(1.0, 0.92, 0.78) * (pow(s, 900.0) * 6.0 + pow(s, 12.0) * 0.28);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`}
    />
  );
}

/** Sky dome only drawn while the camera is above water. */
function SkyDome() {
  const ref = useRef<THREE.Mesh>(null);
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.visible = story.underwater < 0.5;
    ref.current.position.copy(camera.position);
  });
  return (
    <mesh ref={ref} scale={900} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
      <SkyMaterial />
    </mesh>
  );
}

/** Signals readiness after a few rendered frames (shaders compiled, no flash). */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current > 3) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

function ContextLossGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    const h = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    el.addEventListener("webglcontextlost", h);
    return () => el.removeEventListener("webglcontextlost", h);
  }, [gl, onLost]);
  return null;
}

/** Fish groups for the three feeding zones. */
function Animals({ q }: { q: QualitySettings }) {
  return (
    <>
      {/* surface feeders around the floating-feed area */}
      <FishSchool
        behaviour="surface"
        count={q.fish.surface}
        seed={1}
        center={[WORLD.floating.x, -1.6, WORLD.floating.z]}
        extent={[4.5, 1.2, 3.5]}
        size={[0.7, 1.0]}
        palette={["#ffffff", "#f1ead6", "#e4e8e2"]}
        cruise={0.55}
      />
      {/* mid-water fish around the sinking column */}
      <FishSchool
        behaviour="sinking"
        count={q.fish.mid}
        seed={2}
        center={[WORLD.sinking.x, -5.5, WORLD.sinking.z]}
        extent={[4.5, 3.8, 3.5]}
        size={[0.65, 0.95]}
        palette={["#e9eef0", "#d6dccf", "#f3efe6"]}
        cruise={0.6}
      />
      {/* bottom feeders (darker, bronze carp tones) near the feeding station */}
      <FishSchool
        behaviour="bottom"
        count={q.fish.bottom}
        seed={3}
        center={[WORLD.net.x - 1, -11.2, WORLD.net.z + 0.5]}
        extent={[5, 1.2, 4]}
        size={[0.75, 1.05]}
        palette={["#c9b48a", "#b59f78", "#d8c9a4"]}
        cruise={0.5}
      />
      <Shrimp count={q.shrimp} />
    </>
  );
}

interface PondSceneProps {
  quality: QualitySettings;
  active: boolean;
  onReady: () => void;
  onContextLost: () => void;
}

/**
 * POND SCENE — the single, continuous 3D world behind the homepage story.
 * Everything lives in one coordinate system (surface y=0) so the camera can
 * travel through it without scene switches.
 */
export default function PondScene({ quality, active, onReady, onContextLost }: PondSceneProps) {
  const [dpr, setDpr] = useState<number>(quality.dpr[1]);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: quality.antialias, powerPreference: "high-performance", stencil: false, alpha: false }}
      camera={{ fov: 42, near: 0.05, far: 1500, position: [-10, 5.8, 21] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
      aria-hidden="true"
    >
      {/* drop resolution automatically if the device can't hold frame rate */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(quality.dpr[0], d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(quality.dpr[1], d + 0.25))}
      />
      <ContextLossGuard onLost={onContextLost} />
      <CameraController />
      <Lighting />
      <Suspense fallback={null}>
        <SkyDome />
        {/* sky-only environment map (rendered once) for fish sheen + bag reflections */}
        <Environment resolution={64} frames={1}>
          <mesh scale={50}>
            <sphereGeometry args={[1, 32, 16]} />
            <SkyMaterial />
          </mesh>
        </Environment>
        <UnderwaterEnvironment rays={quality.rays} particles={quality.particles} bubbles={quality.bubbles} />
        <PondFloor segments={quality.terrainSegments} />
        <PondBanks reeds={quality.reeds} trees={quality.trees} />
        <AquaticPlants kind="submerged" count={quality.plants} />
        <FeedingNet />
        <Animals q={quality} />
        <FloatingPellets count={quality.pellets.floating} />
        <SinkingPellets count={quality.pellets.sinking} />
        <PolyculturePellets count={quality.pellets.poly} />
        <WaterSurface segments={quality.waterSegments} />
        <SurfaceRipples />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
