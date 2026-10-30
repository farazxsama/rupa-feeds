"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { createProductBagGeometry, getBagWeaveTexture } from "./geometry/productBagGeometry";

/**
 * PRODUCT BAG — a real 3D feed sack generated from its packaging image.
 * Pass an image URL (or canvas); the mesh is traced from that image's outline
 * and the image is the print, so swapping the file updates shape and artwork.
 * The material skips tone mapping so the print keeps its true colours.
 *
 *   <ProductBag texture="/img/products/floating-bag.png" />
 */
type GroupProps = ThreeElements["group"];

export interface ProductBagProps extends Omit<GroupProps, "children"> {
  texture: string | HTMLCanvasElement;
  /** varies the wrinkles so no two bags look identical */
  seed?: number;
}

type Built = { geometry: THREE.BufferGeometry; material: THREE.MeshStandardMaterial };

export function ProductBag({ texture, seed = 0, ...group }: ProductBagProps) {
  const [bag, setBag] = useState<Built | null>(null);

  useEffect(() => {
    let disposed = false;
    let built: Built | null = null;
    const build = (map: THREE.Texture, source: HTMLImageElement | HTMLCanvasElement) => {
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 8;
      map.needsUpdate = true;
      built = {
        geometry: createProductBagGeometry(source, seed),
        material: new THREE.MeshStandardMaterial({
          map,
          bumpMap: getBagWeaveTexture(),
          bumpScale: 0.1,
          alphaTest: 0.5, // transparent image pixels never print as a dark rim
          roughness: 0.58,
          metalness: 0,
          side: THREE.DoubleSide,
          toneMapped: false,
        }),
      };
      setBag(built);
    };
    let map: THREE.Texture;
    if (typeof texture === "string") {
      map = new THREE.TextureLoader().load(texture, (t) => {
        if (!disposed) build(t, t.image as HTMLImageElement);
      });
    } else {
      map = new THREE.CanvasTexture(texture);
      build(map, texture);
    }
    return () => {
      disposed = true;
      map.dispose();
      if (built) {
        built.geometry.dispose();
        built.material.dispose();
      }
    };
  }, [texture, seed]);

  if (!bag) return null;
  return (
    <group {...group}>
      <mesh geometry={bag.geometry} material={bag.material} />
    </group>
  );
}
