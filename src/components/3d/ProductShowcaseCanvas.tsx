"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import type { Product } from "@/config/products";
import type { CardPointerState } from "@/components/ui/ProductCard";
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

function BagStage({
  product,
  index,
  pointerState,
}: {
  product: Product;
  index: number;
  pointerState?: CardPointerState;
}) {
  const group = useRef<THREE.Group>(null);
  const shadow = useShadowTexture();
  const texture = product.packagingTexture ?? placeholderPackagingCanvas(product);

  // Current interpolated rotation angles (0 = straight, facing forward)
  const currentRotY = useRef(0);
  const currentRotX = useRef(0);

  // Maximum rotation angle: ~18 degrees around Y (within the 15–20° range)
  // Subtle ~4 degrees pitch around X for 3D perspective
  const MAX_ROT_Y = (18 * Math.PI) / 180; // ~0.314 rad
  const MAX_ROT_X = (4 * Math.PI) / 180;  // ~0.070 rad

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + index * 1.7;
    if (group.current) {
      // Retain the existing gentle floating vertical bobbing
      group.current.position.y = Math.sin(t * 0.8) * 0.03;

      // When the card is hovered: rotate toward the cursor position.
      // Moving right (+x) rotates the bag right (+y); moving left (-x) rotates left (-y).
      // When centered or when cursor leaves (active = false): target is 0 (straight, facing forward).
      const targetY = pointerState?.active ? pointerState.x * MAX_ROT_Y : 0;
      const targetX = pointerState?.active ? pointerState.y * MAX_ROT_X : 0;

      // Smooth exponential interpolation (frame-rate independent damping)
      const k = 1 - Math.exp(-7.5 * Math.min(delta, 0.1));
      currentRotY.current = THREE.MathUtils.lerp(currentRotY.current, targetY, k);
      currentRotX.current = THREE.MathUtils.lerp(currentRotX.current, targetX, k);

      group.current.rotation.y = currentRotY.current;
      group.current.rotation.x = currentRotX.current;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.05, 2.7]} fov={34} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[2.5, 3, 4]} intensity={2} color="#fff8ee" />
      <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#cfe3da" />
      <group ref={group}>
        <ProductBag texture={texture} seed={index * 2.3} rotation={[0.04, 0, 0.02]} />
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
export default function ProductShowcaseCanvas({
  products,
  slots,
  pointerStates,
}: {
  products: Product[];
  slots: RefObject<HTMLDivElement | null>[];
  pointerStates?: CardPointerState[];
}) {
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
          <BagStage product={p} index={i} pointerState={pointerStates?.[i]} />
        </View>
      ))}
    </Canvas>
  );
}
