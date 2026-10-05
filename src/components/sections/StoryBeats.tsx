import type { CSSProperties, ReactNode } from "react";
import { BEATS, type BeatId } from "@/config/story";
import { products } from "@/config/products";
import { site } from "@/config/site";
import { ProductInfo } from "@/components/ui/ProductInfo";

/**
 * Story beat sections. Each is a tall scroll "track" whose content panel is
 * sticky-centred; GSAP fades the panel in/out (see useStoryScroll). Heights
 * come from config/story.ts so copy and camera timing can be tuned separately.
 */
function Beat({ id, children, className = "", label }: { id: BeatId; children: ReactNode; className?: string; label: string }) {
  const b = BEATS.find((x) => x.id === id)!;
  return (
    <section
      id={`story-${id}`}
      data-beat={id}
      aria-label={label}
      className="relative h-[var(--beat-m)] md:h-[var(--beat-d)]"
      style={{ "--beat-d": `${b.vh}vh`, "--beat-m": `${b.mobileVh}vh` } as CSSProperties}
    >
      <div className={`sticky top-0 flex h-[100vh] w-full px-4 pb-6 pt-20 sm:px-6 lg:px-12 ${className}`}>{children}</div>
    </section>
  );
}

export function HeroSection() {
  const h = site.hero;
  return (
    <Beat id="hero" label="Introduction" className="items-end pb-16 sm:pb-20 md:items-center md:pb-6">
      <div data-panel className="pointer-events-auto mx-auto w-full max-w-7xl">
        {/* <div className="max-w-2xl text-white">
          <p className="eyebrow text-white/80 text-shadow-soft">{h.eyebrow}</p>
          <h1 className="mt-4 font-display text-[2.6rem] font-medium leading-[1.04] tracking-[-0.01em] text-shadow-soft sm:text-6xl lg:text-7xl">
            {h.title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/90 text-shadow-soft sm:text-lg">{h.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={h.primaryCta.href} className="btn-primary">
              {h.primaryCta.label}
            </a>
            <a href={h.secondaryCta.href} className="btn-ghost backdrop-blur-sm">
              {h.secondaryCta.label}
            </a>
          </div>
        </div> */}
        <p className="mt-14 hidden items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-white/70 md:flex">
          <span className="animate-scroll-hint inline-block h-8 w-px bg-white/70" aria-hidden="true" />
          {h.scrollHint}
        </p>
      </div>
    </Beat>
  );
}

export function FloatingFeedSection() {
  return (
    <Beat id="floating" label="Floating feed" className="items-end md:items-center">
      <div data-panel className="pointer-events-auto mx-auto w-full max-w-7xl">
        <ProductInfo product={products.floating} index={1} />
      </div>
    </Beat>
  );
}

export function UnderwaterTransition() {
  return (
    <Beat id="dive" label="Diving below the surface" className="items-center justify-center">
      <div data-panel className="pointer-events-auto max-w-xl text-center text-white">
        <p className="eyebrow text-grain-300">Below the surface</p>
        <p className="mt-4 font-display text-3xl font-medium leading-snug text-shadow-soft sm:text-4xl">{site.dive.body}</p>
      </div>
    </Beat>
  );
}

export function SinkingFeedSection() {
  return (
    <Beat id="sinking" label="Sinking feed" className="items-end md:items-center">
      <div data-panel className="pointer-events-auto mx-auto w-full max-w-7xl">
        <ProductInfo product={products.sinking} index={2} align="right" />
      </div>
    </Beat>
  );
}

export function PolycultureFeedSection() {
  return (
    <Beat id="polyculture" label="Polyculture feed" className="items-end md:items-center">
      <div data-panel className="pointer-events-auto mx-auto w-full max-w-7xl">
        <ProductInfo product={products.polyculture} index={3} />
      </div>
    </Beat>
  );
}

export function BrandReturnSection() {
  return (
    <Beat id="brand" label="Rupa Feeds" className="items-center justify-center">
      <div data-panel className="pointer-events-auto max-w-3xl text-center text-white">
        <p className="font-display text-sm font-semibold tracking-brand text-white/85">RUPA FEEDS</p>
        <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-shadow-soft sm:text-6xl">{site.brandReturn.title}</h2>
        <p className="mx-auto mt-5 max-w-md text-base text-white/85 text-shadow-soft sm:text-lg">{site.brandReturn.body}</p>
      </div>
    </Beat>
  );
}
