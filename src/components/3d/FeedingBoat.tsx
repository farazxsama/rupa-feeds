import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BOAT } from "@/config/story";
import { story } from "@/lib/storyStore";
import { waveHeight } from "@/lib/pondMath";
import { patchPondMaterial } from "./pondMaterial";
import { HULL, createBoatGeometry, createOpenBagGeometry, createWoodTexture } from "./geometry/boatGeometry";
import { Farmer } from "./Farmer";

/**
 * Open Rupa floating-feed sack standing on the boat's platform. The front and
 * back faces carry the packaging artwork from BOAT.bagTexture (cropped with
 * BOAT.bagCrop); until it has loaded the sack is plain woven white.
 */
function FeedSack() {
  const geometry = useMemo(() => createOpenBagGeometry(), []);
  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: "#efebe2", roughness: 0.82, side: THREE.DoubleSide });
    const art = new THREE.MeshStandardMaterial({ color: "#f4f1ea", roughness: 0.7 });
    const pellets = new THREE.MeshStandardMaterial({ color: "#7b5229", roughness: 1 });
    // BoxGeometry groups: +x, -x, +y (open mouth), -y, +z, -z
    return { side, art, pellets, list: [side, side, pellets, side, art, art] };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const [l, t, r, b] = BOAT.bagCrop;
    const tex = new THREE.TextureLoader().load(BOAT.bagTexture, () => {
      if (cancelled) return;
      materials.art.map = tex;
      materials.art.color.set("#ffffff");
      materials.art.needsUpdate = true;
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.repeat.set(r - l, b - t);
    tex.offset.set(l, 1 - b);
    return () => {
      cancelled = true;
      tex.dispose();
    };
  }, [materials]);

  useEffect(
    () => () => {
      geometry.dispose();
      materials.side.dispose();
      materials.art.dispose();
      materials.pellets.dispose();
    },
    [geometry, materials]
  );

  return (
    <mesh
      geometry={geometry}
      material={materials.list}
      position={[BOAT.bag.x, HULL.deckY, BOAT.bag.z]}
      rotation={[-0.1, BOAT.bag.yaw, 0, "YXZ"]}
    />
  );
}

/**
 * FEEDING BOAT — wooden boat, farmer and feed sack for the floating-feed
 * story. The boat rides the same wave function as the water surface.
 */
export function FeedingBoat() {
  const group = useRef<THREE.Group>(null);
  const wood = useMemo(() => createWoodTexture(), []);
  const geometry = useMemo(() => createBoatGeometry(), []);
  const material = useMemo(
    () =>
      patchPondMaterial(
        new THREE.MeshStandardMaterial({ map: wood, bumpMap: wood, bumpScale: 1.2, vertexColors: true, roughness: 0.93, side: THREE.DoubleSide })
      ),
    [wood]
  );
  useEffect(() => () => { wood.dispose(); geometry.dispose(); material.dispose(); }, [wood, geometry, material]);

  useFrame((state) => {
    const g = group.current;
    if (!g || story.reducedMotion) return;
    const t = state.clock.elapsedTime;
    g.position.y = waveHeight(BOAT.x, BOAT.z, t) * 0.5;
    g.rotation.set(Math.sin(t * 0.53 + 1) * 0.008, BOAT.yaw, Math.sin(t * 0.7) * 0.012);
  });

  return (
    <group ref={group} position={[BOAT.x, 0, BOAT.z]} rotation={[0, BOAT.yaw, 0]}>
      <mesh geometry={geometry} material={material} />
      <FeedSack />
      <group position={[BOAT.farmer.x, HULL.deckY, BOAT.farmer.z]} rotation={[0, BOAT.farmer.yaw, 0]}>
        <Farmer />
      </group>
    </group>
  );
}
