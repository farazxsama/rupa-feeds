import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { WORLD } from "@/config/story";
import { patchPondMaterial, pondUniforms } from "./pondMaterial";

/**
 * POLYCULTURE FEEDING STRUCTURE (original design)
 * A practical pond feeding station:
 *   - a surface float marks the station and carries four ropes
 *   - a suspended nylon-mesh FUNNEL gathers feed dropped from above
 *   - feed settles onto a shallow mesh TRAY resting on the pond floor, where
 *     shrimp can walk on and fish can feed just above
 *   - four bamboo stakes hold the funnel in place
 * Mesh netting is a procedural, anti-aliased grid shader (no textures).
 */

function netMaterial(density: [number, number], color = "#25362b") {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { uDensity: { value: new THREE.Vector2(...density) }, uColor: { value: new THREE.Color(color) } },
    ]),
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vW;
      #include <fog_pars_vertex>
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec2 uDensity;
      uniform vec3 uColor;
      uniform float uPondTime;
      varying vec2 vUv;
      varying vec3 vW;
      #include <fog_pars_fragment>
      void main() {
        vec2 g = vUv * uDensity;
        // diamond mesh: rotate the grid 45°
        vec2 d = vec2(g.x + g.y, g.x - g.y) * 0.7071;
        vec2 f = abs(fract(d - 0.5) - 0.5) / fwidth(d);
        float line = 1.0 - min(min(f.x, f.y), 1.0);
        float a = line * 0.8 + 0.05;
        float lightUp = 0.75 + 0.25 * sin(vW.x * 0.6 + uPondTime * 0.5);
        gl_FragColor = vec4(uColor * lightUp, a);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
}

export function FeedingNet() {
  const { x: nx, z: nz } = WORLD.net;

  const assets = useMemo(() => {
    // funnel profile (slightly curved sides)
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      const r = THREE.MathUtils.lerp(WORLD.netBottomR, WORLD.netTopR, Math.pow(u, 0.85));
      const y = THREE.MathUtils.lerp(WORLD.netBottomY, WORLD.netTopY, u);
      pts.push(new THREE.Vector2(r, y));
    }
    const funnel = new THREE.LatheGeometry(pts, 56);
    const funnelMat = netMaterial([150, 22]);
    funnelMat.uniforms.uPondTime = pondUniforms.uPondTime;

    const trayBase = new THREE.CircleGeometry(WORLD.trayR, 48);
    trayBase.rotateX(-Math.PI / 2);
    const trayMat = netMaterial([70, 70], "#2b3a2c");
    trayMat.uniforms.uPondTime = pondUniforms.uPondTime;

    const frame = patchPondMaterial(new THREE.MeshStandardMaterial({ color: "#3a463c", roughness: 0.55, metalness: 0.05 }));
    const bamboo = patchPondMaterial(new THREE.MeshStandardMaterial({ color: "#7c7150", roughness: 0.7 }));
    const rope = patchPondMaterial(new THREE.MeshStandardMaterial({ color: "#a39a80", roughness: 0.9 }), { caustics: false });
    const float = new THREE.MeshStandardMaterial({ color: "#d9d2bf", roughness: 0.6 });
    const trayWall = patchPondMaterial(new THREE.MeshStandardMaterial({ color: "#2f3b31", roughness: 0.6, side: THREE.DoubleSide }));
    return { funnel, funnelMat, trayBase, trayMat, frame, bamboo, rope, float, trayWall };
  }, []);

  useEffect(
    () => () => {
      Object.values(assets).forEach((a) => (a as { dispose?: () => void }).dispose?.());
    },
    [assets]
  );

  // ropes from the funnel rim to the surface float
  const ropes = useMemo(() => {
    const top = new THREE.Vector3(nx, 0.05, nz);
    return [0, 1, 2, 3].map((k) => {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const bottom = new THREE.Vector3(nx + Math.cos(a) * WORLD.netTopR, WORLD.netTopY, nz + Math.sin(a) * WORLD.netTopR);
      const mid = bottom.clone().add(top).multiplyScalar(0.5);
      const len = bottom.distanceTo(top);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().sub(bottom).normalize());
      return { mid, len, q };
    });
  }, [nx, nz]);

  const stakeH = WORLD.netTopY + 0.6 - (WORLD.trayY - 0.6);
  const stakeY = (WORLD.netTopY + 0.6 + WORLD.trayY - 0.6) / 2;

  return (
    <group>
      {/* funnel mesh + rims */}
      <mesh geometry={assets.funnel} material={assets.funnelMat} position={[nx, 0, nz]} renderOrder={1} />
      <mesh position={[nx, WORLD.netTopY, nz]} rotation={[Math.PI / 2, 0, 0]} material={assets.frame}>
        <torusGeometry args={[WORLD.netTopR, 0.045, 8, 64]} />
      </mesh>
      <mesh position={[nx, WORLD.netBottomY, nz]} rotation={[Math.PI / 2, 0, 0]} material={assets.frame}>
        <torusGeometry args={[WORLD.netBottomR, 0.03, 6, 40]} />
      </mesh>

      {/* tray on the floor */}
      <mesh geometry={assets.trayBase} material={assets.trayMat} position={[nx, WORLD.trayY, nz]} renderOrder={1} />
      <mesh position={[nx, WORLD.trayY + 0.05, nz]} material={assets.trayWall}>
        <cylinderGeometry args={[WORLD.trayR, WORLD.trayR, 0.12, 48, 1, true]} />
      </mesh>
      <mesh position={[nx, WORLD.trayY + 0.11, nz]} rotation={[Math.PI / 2, 0, 0]} material={assets.frame}>
        <torusGeometry args={[WORLD.trayR, 0.03, 6, 64]} />
      </mesh>

      {/* bamboo stakes */}
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh
            key={k}
            position={[nx + Math.cos(a) * (WORLD.netTopR + 0.06), stakeY, nz + Math.sin(a) * (WORLD.netTopR + 0.06)]}
            rotation={[0, 0, (k % 2 ? 1 : -1) * 0.02]}
            material={assets.bamboo}
          >
            <cylinderGeometry args={[0.04, 0.05, stakeH, 7]} />
          </mesh>
        );
      })}

      {/* ropes + surface float */}
      {ropes.map((r, i) => (
        <mesh key={i} position={r.mid} quaternion={r.q} material={assets.rope}>
          <cylinderGeometry args={[0.012, 0.012, r.len, 4]} />
        </mesh>
      ))}
      <mesh position={[nx, 0.02, nz]} scale={[1, 0.55, 1]} material={assets.float}>
        <sphereGeometry args={[0.32, 20, 14]} />
      </mesh>
    </group>
  );
}
