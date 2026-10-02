"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

/**
 * PRODUCT BAG (feed sack)
 * ------------------------------------------------------------------
 * A pillow-shaped sack with a heat-sealed top. Pass the REAL packaging front
 * artwork as `texture` (THREE.Texture or an image URL). Until then a
 * placeholder canvas is supplied by the caller.
 *
 *   <ProductBag texture="/packaging/floating-feed-front.jpg" position={[0,0,0]} />
 *
 * Artwork should be ~1024×1408 (aspect 0.73) for the front face; the back
 * face reuses it (or pass `backTexture`).
 */
type GroupProps = ThreeElements["group"];

export interface ProductBagProps extends Omit<GroupProps, "children"> {
  texture: THREE.Texture | string | HTMLCanvasElement;
  backTexture?: THREE.Texture | string | HTMLCanvasElement;
  sideColor?: string;
}

function useTex(src: THREE.Texture | string | HTMLCanvasElement | undefined) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!src) return setTex(null);
    if (src instanceof THREE.Texture) return setTex(src);
    let disposed = false;
    let t: THREE.Texture;
    if (typeof src === "string") {
      t = new THREE.TextureLoader().load(src, () => !disposed && setTex(t));
    } else {
      t = new THREE.CanvasTexture(src);
      setTex(t);
    }
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return () => {
      disposed = true;
      t.dispose();
    };
  }, [src]);
  return tex;
}

export function createBagGeometry() {
  const g = new THREE.BoxGeometry(1, 1.38, 0.34, 20, 28, 6);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const nx = x / 0.5, ny = y / 0.69;
    // pillow: thickness falls off toward the edges
    const puff = (1 - nx * nx * 0.85) * (1 - Math.pow(Math.abs(ny), 4) * 0.9);
    let nz = z * Math.max(0.05, puff);
    // flattened, crimped seal at the top
    if (ny > 0.9) nz *= THREE.MathUtils.lerp(1, 0.08, (ny - 0.9) / 0.1);
    // slight waist from the filled sack
    const nxw = x * (1 - 0.04 * Math.cos(ny * Math.PI));
    p.setXYZ(i, nxw, y, nz);
  }
  g.computeVertexNormals();
  return g;
}

export function ProductBag({ texture, backTexture, sideColor = "#e9e3d6", ...group }: ProductBagProps) {
  const front = useTex(texture);
  const back = useTex(backTexture ?? texture);
  const geometry = useMemo(() => createBagGeometry(), []);
  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.75 });
    const f = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6, metalness: 0.0 });
    const b = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6 });
    // Box face order: +x, -x, +y, -y, +z (front), -z (back)
    return [side, side, side, side, f, b];
  }, [sideColor]);

  useEffect(() => {
    materials[4].map = front;
    materials[5].map = back;
    materials[4].needsUpdate = materials[5].needsUpdate = true;
  }, [front, back, materials]);

  useEffect(() => () => { geometry.dispose(); materials.forEach((m) => m.dispose()); }, [geometry, materials]);

  return (
    <group {...group}>
      <mesh geometry={geometry} material={materials} />
    </group>
  );
}
