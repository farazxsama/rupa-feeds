"use client";

import { forwardRef, useEffect, useState } from "react";
import type { Product } from "@/config/products";
import { placeholderPackagingCanvas } from "@/lib/placeholderPackaging";
import { ZoneIcon } from "./ProductInfo";

/**
 * Product card. The `stageRef` div is where the shared product canvas draws
 * the 3D bag (drei <View>). If 3D is unavailable a flat image is shown.
 */
export const ProductCard = forwardRef<HTMLDivElement, { product: Product; show3D: boolean }>(function ProductCard(
  { product, show3D },
  stageRef
) {
  const [img, setImg] = useState<string | null>(product.packagingTexture);
  useEffect(() => {
    if (!product.packagingTexture) setImg(placeholderPackagingCanvas(product).toDataURL("image/png"));
  }, [product]);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_30px_60px_-40px_rgba(14,26,23,0.45)]">
      <div
        ref={stageRef}
        className="relative aspect-[4/4.2] w-full overflow-hidden"
        style={{ background: "radial-gradient(80% 70% at 50% 40%, #f4efe4 0%, #e6dfd0 70%, #ddd4c2 100%)" }}
      >
        {!show3D && img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={`${product.name} packaging (placeholder)`} className="absolute left-1/2 top-1/2 h-[78%] -translate-x-1/2 -translate-y-1/2 rounded-md shadow-xl" />
        )}
        {show3D && <span className="sr-only">{product.name} packaging, 3D placeholder render</span>}
        <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/70 backdrop-blur">
          Placeholder pack
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-3 text-pond-700">
          <ZoneIcon id={product.id} className="text-pond-700" />
          <p className="eyebrow text-pond-500">{product.zone}</p>
        </div>
        <h3 className="mt-4 font-display text-2xl font-medium text-ink">{product.name}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink/70">{product.cardDescription}</p>
        <a href={product.href} className="btn-dark mt-6 self-start">
          Explore Product <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
});
