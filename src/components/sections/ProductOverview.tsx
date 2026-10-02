"use client";

import dynamic from "next/dynamic";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { productList } from "@/config/products";
import { site } from "@/config/site";
import { hasWebGL } from "@/lib/quality";
import { ProductCard } from "@/components/ui/ProductCard";

const ProductShowcaseCanvas = dynamic(() => import("@/components/3d/ProductShowcaseCanvas"), { ssr: false });

/**
 * Normal page section after the story. The 3D bag renders are lazy: the
 * canvas mounts only while this section is near the viewport.
 */
export function ProductOverview() {
  const section = useRef<HTMLElement>(null);
  const slots = useMemo(() => productList.map(() => createRef<HTMLDivElement>()), []);
  const [near, setNear] = useState(false);
  const [can3D, setCan3D] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCan3D(hasWebGL() && !reduced);
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "150px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show3D = can3D && near;

  return (
    <section
      ref={section}
      id="products"
      aria-labelledby="overview-title"
      className="relative bg-gradient-to-b from-pond-950 via-[#173a31] to-mist pb-24 pt-24 sm:pt-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-grain-300">{site.overview.eyebrow}</p>
          <h2 id="overview-title" className="mt-4 font-display text-4xl font-medium leading-tight text-white sm:text-5xl">
            {site.overview.title}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {productList.map((p, i) => (
            <ProductCard key={p.id} ref={slots[i]} product={p} show3D={show3D} />
          ))}
        </div>
      </div>
      {show3D && <ProductShowcaseCanvas products={productList} slots={slots} />}
    </section>
  );
}
