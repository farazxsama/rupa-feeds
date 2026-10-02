import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_KEYS } from "@/config/story";
import { story, beatGlobal } from "@/lib/storyStore";

/**
 * SCROLL-DRIVEN CAMERA
 * ------------------------------------------------------------------
 * 1. GSAP ScrollTrigger (scrub) writes a smoothed `story.progress`.
 * 2. Keyframes from config/story.ts are converted to global progress using
 *    the measured beat ranges (rebuilt whenever ranges change).
 * 3. Position + look target are sampled on a Catmull-Rom spline through the
 *    keys (C1-continuous → no corners / jumps between beats).
 * 4. A frame-rate independent critically-damped follow removes any residual
 *    jitter from trackpads / fast flicks.
 * 5. A tiny "breathing" drift keeps the frame alive when scrolling stops
 *    (disabled for reduced motion).
 */

interface Key {
  t: number;
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

function catmull(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, u: number, out: THREE.Vector3) {
  const u2 = u * u, u3 = u2 * u;
  return out.set(
    0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
    0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
    0.5 * (2 * p1.z + (-p0.z + p2.z) * u + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * u2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * u3)
  );
}

export function sampleCameraPath(keys: Key[], p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  if (p <= keys[0].t) {
    outPos.copy(keys[0].pos);
    outLook.copy(keys[0].look);
    return;
  }
  const last = keys[keys.length - 1];
  if (p >= last.t) {
    outPos.copy(last.pos);
    outLook.copy(last.look);
    return;
  }
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].t) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)];
  let u = (p - k1.t) / Math.max(1e-6, k2.t - k1.t);
  // soft ease inside each segment keeps velocity gentle near story beats
  u = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
  catmull(k0.pos, k1.pos, k2.pos, k3.pos, u, outPos);
  catmull(k0.look, k1.look, k2.look, k3.look, u, outLook);
}

export function CameraController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const keys = useRef<Key[]>([]);
  const version = useRef(-1);
  const cur = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), init: false });
  const target = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() });

  // Portrait screens need a wider lens to keep the story readable.
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    camera.fov = aspect < 0.8 ? 62 : aspect < 1.2 ? 52 : 42;
    camera.near = 0.05;
    camera.far = 1500;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame((state, dt) => {
    if (version.current !== story.version || keys.current.length === 0) {
      keys.current = CAMERA_KEYS.map((k) => ({
        t: beatGlobal(k.beat, k.at),
        pos: new THREE.Vector3(...k.pos),
        look: new THREE.Vector3(...k.look),
      })).sort((a, b) => a.t - b.t);
      version.current = story.version;
    }

    const tg = target.current;
    sampleCameraPath(keys.current, story.progress, tg.pos, tg.look);

    const c = cur.current;
    if (!c.init) {
      c.pos.copy(tg.pos);
      c.look.copy(tg.look);
      c.init = true;
    }
    // exponential smoothing — frame-rate independent
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * (story.reducedMotion ? 12 : 4));
    c.pos.lerp(tg.pos, k);
    c.look.lerp(tg.look, k);

    camera.position.copy(c.pos);
    if (!story.reducedMotion) {
      const t = state.clock.elapsedTime;
      const under = story.underwater;
      // a slow hand-held / buoyancy drift (a little stronger underwater)
      const amp = 0.03 + under * 0.06;
      camera.position.x += Math.sin(t * 0.31) * amp;
      camera.position.y += Math.sin(t * 0.47 + 1.3) * amp * 0.6;
      camera.position.z += Math.cos(t * 0.23) * amp;
    }
    camera.lookAt(c.look);
    story.cameraY = camera.position.y;
  });

  return null;
}
