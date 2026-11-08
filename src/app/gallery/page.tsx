import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/sections/Footer";
import { galleryPage, galleryImages } from "@/config/gallery";
import { GalleryGrid } from "@/components/sections/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery — Rupa Feeds",
  description: galleryPage.hero.body,
};

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export default function GalleryPage() {
  const { hero } = galleryPage;

  return (
    <>
      <Navbar />
      <main id="main" className="min-h-screen bg-mist">
        {/* 1. Gallery Introduction */}
        <section
          aria-labelledby="gallery-title"
          className="relative overflow-hidden pt-16 text-white"
          style={{ background: "radial-gradient(120% 140% at 15% 0%, #0504aa 0%, #030378 50%, #020250 100%)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-pond-300/15 blur-3xl"
          />
          <div className={`${wrap} relative py-16 sm:py-20 lg:py-24`}>
            <nav aria-label="Breadcrumb" className="text-sm text-white/65">
              <a href="/" className="transition-colors hover:text-white">
                Home
              </a>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span aria-current="page" className="text-white">
                Gallery
              </span>
            </nav>

            <p className="eyebrow mt-8 text-pond-300">{hero.eyebrow}</p>
            <h1
              id="gallery-title"
              className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              {hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              {hero.body}
            </p>
          </div>
        </section>

        {/* 2. Image Gallery */}
        <section aria-label="Photo Gallery" className="py-12 sm:py-16 lg:py-20">
          <div className={wrap}>
            <GalleryGrid images={galleryImages} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

