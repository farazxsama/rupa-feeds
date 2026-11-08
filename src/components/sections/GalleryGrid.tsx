"use client";

import { useEffect, useState, useCallback } from "react";
import type { GalleryImage } from "@/config/gallery";

interface GalleryGridProps {
  images: GalleryImage[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Close lightbox on Escape, navigate with Arrow keys
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") setSelectedIndex((prev) => (prev! + 1) % images.length);
      if (e.key === "ArrowLeft") setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length);
    },
    [selectedIndex, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, handleKeyDown]);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      {/* 3-Row Asymmetric Bento Grid matching user's reference design */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
        {images.map((item, index) => {
          // Row 1 & Row 3 have taller matching height; Row 2 has slightly more square/compact height
          const heightCls =
            item.row === 2
              ? "h-[240px] sm:h-[300px] md:h-[320px] lg:h-[360px]"
              : "h-[260px] sm:h-[340px] md:h-[390px] lg:h-[440px]";

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`View photo: ${item.title}`}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedIndex(index);
                }
              }}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-pond-950/10 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:rounded-3xl ${item.colSpanDesktop} ${heightCls}`}
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                loading={index < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Ambient dark gradient vignette on hover */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              {/* Expand icon pill (top right) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/90 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </div>

              {/* Caption & Category metadata (slides up smoothly on hover) */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="mb-2 inline-block rounded-full bg-pond-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-pond-300 backdrop-blur-sm">
                  {item.category}
                </span>
                <h3 className="font-display text-base font-semibold leading-snug sm:text-lg">
                  {item.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-6 md:p-8"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Modal Content container */}
          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center overflow-hidden rounded-2xl bg-pond-950/80 shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with counter & close button */}
            <div className="flex w-full items-center justify-between border-b border-white/10 px-5 py-3 text-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {selectedIndex + 1} / {images.length} · {selectedImage.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close photo preview"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Active Image */}
            <div className="relative flex max-h-[72vh] w-full items-center justify-center overflow-hidden bg-black/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />

              {/* Prev Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white/90 backdrop-blur transition hover:bg-black/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Previous photo"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex + 1) % images.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white/90 backdrop-blur transition hover:bg-black/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Next photo"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="w-full border-t border-white/10 px-5 py-4 text-white">
              <h2 className="font-display text-lg font-semibold">{selectedImage.title}</h2>
              <p className="mt-1 text-sm text-white/70">{selectedImage.alt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

