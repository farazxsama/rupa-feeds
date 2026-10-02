"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import type { Product } from "@/config/products";
import { placeholderPackagingCanvas } from "@/lib/placeholderPackaging";
import { ProductBag } from "./ProductBag";

/** Soft ground shadow (radial gradient texture) — cheaper than shadow maps. */
function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(40,32,20,0.45)");
    grd.addColorStop(1, "rgba(40,32,20,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

function BagStage({ product, index }: { product: Product; index: number }) {
  const group = useRef<THREE.Group>(null);
  const shadow = useShadowTexture();
  const texture = product.packagingTexture ?? placeholderPackagingCanvas(product);
  useFrame((state) => {
    const t = state.clock.elapsedTime + index * 1.7;
    if (group.current) {
      group.current.rotation.y = -0.35 + Math.sin(t * 0.4) * 0.22;
      group.current.position.y = Math.sin(t * 0.8) * 0.03;
    }
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.05, 2.7]} fov={34} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[2.5, 3, 4]} intensity={2.2} color="#fff4e2" />
      <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#cfe3da" />
      <group ref={group}>
        <ProductBag texture={texture} rotation={[0.04, 0, 0.02]} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
        <planeGeometry args={[1.8, 0.9]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
    </>
  );
}

/**
 * ONE canvas renders all three product bags into their card slots via drei
 * <View> (scissor rendering) — three 3D renders for the cost of one WebGL context.
 */
export default function ProductShowcaseCanvas({ products, slots }: { products: Product[]; slots: RefObject<HTMLDivElement | null>[] }) {
  return (
    <Canvas
      className="!pointer-events-none !fixed !inset-0 !z-10"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.05, 2.6], fov: 35 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      {products.map((p, i) => (
        <View key={p.id} track={slots[i] as RefObject<HTMLElement>}>
          <BagStage product={p} index={i} />
        </View>
      ))}
    </Canvas>
  );
}
