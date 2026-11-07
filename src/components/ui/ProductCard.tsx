"use client";

import { forwardRef, useEffect, useState } from "react";
import type { Product } from "@/config/products";
import { placeholderPackagingCanvas } from "@/lib/placeholderPackaging";
import { ZoneIcon } from "./ProductInfo";

export interface CardPointerState {
  x: number;
  y: number;
  active: boolean;
}

/**
 * Product card. The `stageRef` div is where the shared product canvas draws
 * the 3D bag (drei <View>). If 3D is unavailable a flat image is shown.
 * Cursor movement across the card is tracked in `pointerState` without React renders.
 */
export const ProductCard = forwardRef<
  HTMLDivElement,
  { product: Product; show3D: boolean; pointerState?: CardPointerState }
>(function ProductCard({ product, show3D, pointerState }, stageRef) {
  const [img, setImg] = useState<string | null>(product.packagingTexture);
  useEffect(() => {
    if (!product.packagingTexture) setImg(placeholderPackagingCanvas(product).toDataURL("image/png"));
  }, [product]);

  return (
    <article
      onPointerMove={(e) => {
        if (!pointerState || e.pointerType === "touch") return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          pointerState.x = Math.max(-1, Math.min(1, nx));
          pointerState.y = Math.max(-1, Math.min(1, ny));
          pointerState.active = true;
        }
      }}
      onPointerLeave={(e) => {
        if (!pointerState || e.pointerType === "touch") return;
        pointerState.x = 0;
        pointerState.y = 0;
        pointerState.active = false;
      }}
      onPointerCancel={() => {
        if (!pointerState) return;
        pointerState.x = 0;
        pointerState.y = 0;
        pointerState.active = false;
      }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_30px_60px_-40px_rgba(14,26,23,0.45)]"
    >
      <div
        ref={stageRef}
        className="relative aspect-[4/4.2] w-full overflow-hidden"
        style={{ background: "radial-gradient(80% 70% at 50% 40%, #f4efe4 0%, #e6dfd0 70%, #ddd4c2 100%)" }}
      >
        {!show3D && img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={`${product.name} packaging`} className="absolute left-1/2 top-1/2 h-[92%] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />
        )}
        {show3D && <span className="sr-only">{product.name} packaging, 3D render</span>}
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-3 text-pond-700">
          <ZoneIcon id={product.id} className="text-pond-700" />
          <p className="eyebrow text-pond-500">{product.zone}</p>
        </div>
        <h3 className="mt-4 font-display text-2xl font-medium text-ink">{product.name}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-black">{product.cardDescription}</p>
        <a href={product.href} className="btn-dark mt-6 self-start">
          Explore Product <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
});
