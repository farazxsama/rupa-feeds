import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/sections/Footer";
import { productDetails } from "@/config/productDetails";
import { about } from "@/config/about";
import { site } from "@/config/site";

/**
 * PRODUCTS — listing page for the three feeds. Cards and specs are read from
 * config/productDetails.ts (the same source as the detail pages); the range
 * copy below reuses wording from config/about.ts. Informational only.
 */
const range = {
  eyebrow: "Our products",
  title: "Feeds for every pond",
  body: "Scientifically formulated floating, sinking and polyculture feeds for faster growth, better FCR, improved immunity, and higher farmer profits.",
};

export const metadata: Metadata = {
  title: "Products — Rupa Feeds",
  description: range.body,
};

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const blueTile = { background: "linear-gradient(140deg, #0891b2 0%, #0c4a6e 100%)" };

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="bg-mist">
        {/* Hero */}
        <section
          aria-labelledby="products-title"
          className="relative overflow-hidden pt-16 text-white"
          style={{ background: "radial-gradient(120% 140% at 15% 0%, #0e7490 0%, #0c4a6e 50%, #082f49 100%)" }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-pond-300/15 blur-3xl" />
          <div className={`${wrap} relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16`}>
            <div>
              <nav aria-label="Breadcrumb" className="text-sm text-white/65">
                <a href="/" className="hover:text-white">
                  Home
                </a>
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                <span aria-current="page" className="text-white">
                  Products
                </span>
              </nav>
              <p className="eyebrow mt-8 text-grain-300">{range.eyebrow}</p>
              <h1 id="products-title" className="mt-4 font-display text-[2.75rem] font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
                {range.title}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{range.body}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#range" className="btn-primary">
                  View our feeds
                </a>
                <a href={site.navCta.href} className="btn-ghost">
                  {site.navCta.label}
                </a>
              </div>
            </div>
            {/* the three bags, side by side */}
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-8 rounded-[2.5rem] bg-pond-300/25 blur-2xl" />
              <ul className="relative grid grid-cols-3 items-end gap-3 sm:gap-4">
                {productDetails.map((p, i) => (
                  <li key={p.slug} className={i === 1 ? "pb-6 sm:pb-10" : ""}>
                    <a
                      href={`/products/${p.slug}`}
                      className="block overflow-hidden rounded-2xl border border-white/40 bg-white p-2.5 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:rounded-3xl sm:p-4"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.imageAlt} className="aspect-[3/4] w-full object-contain" />
                      <span className="mt-2 block text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-pond-900 sm:text-xs">{p.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Product cards */}
        <section id="range" aria-labelledby="range-title" className="scroll-mt-20 py-20 sm:py-28">
          <div className={wrap}>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-pond-500">The range</p>
              <h2 id="range-title" className="mt-4 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
                Three feeds, one standard of quality
              </h2>
              <span aria-hidden="true" className="mx-auto mt-5 block h-1 w-16 rounded-full" style={{ background: "linear-gradient(90deg, #0891b2, #c8913a)" }} />
            </div>

            <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {productDetails.map((p) => (
                <article
                  key={p.slug}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] transition duration-300 hover:-translate-y-1.5 hover:border-pond-300 hover:shadow-[0_40px_70px_-36px_rgba(8,47,73,0.5)]"
                >
                  <div className="relative overflow-hidden bg-white p-6">
                    <div aria-hidden="true" className="absolute inset-x-10 bottom-4 h-10 rounded-full bg-pond-900/15 blur-2xl" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.imageAlt} className="relative mx-auto aspect-square w-full max-w-[18rem] object-contain transition duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex flex-1 flex-col border-t border-ink/10 p-7">
                    <p className="eyebrow text-pond-500">{p.tagline}</p>
                    <h3 className="mt-3 font-display text-2xl font-medium text-ink">
                      <a href={`/products/${p.slug}`} className="hover:text-pond-700 focus-visible:underline focus-visible:outline-none">
                        {p.name}
                      </a>
                    </h3>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink/70">{p.intro}</p>
                    <dl className="mt-6 grid grid-cols-2 gap-2.5">
                      {p.specs.slice(0, 2).map((s) => (
                        <div key={s.label} className="rounded-xl bg-pond-100/60 px-3.5 py-2.5">
                          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-pond-700">{s.label}</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-ink">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <a href={`/products/${p.slug}`} className="btn-dark mt-7 self-start" aria-label={`View details of ${p.name}`}>
                      View Details <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* About the range */}
        <section aria-labelledby="about-range-title" className="bg-white py-20 sm:py-28">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16`}>
            <div>
              <p className="eyebrow text-pond-500">About the range</p>
              <h2 id="about-range-title" className="mt-4 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
                Made for different fish, growth stages and ponds
              </h2>
              <div className="mt-6 space-y-5 leading-relaxed text-ink/75">
                <p>{about.intro.paragraphs[1]}</p>
                <p>{about.why.closing}</p>
              </div>
              <p className="mt-7 rounded-2xl border-l-4 border-pond-500 bg-pond-100/60 px-5 py-4 font-display text-lg font-medium leading-snug text-pond-900">{about.why.motto}</p>
            </div>
            <ul className="grid content-start gap-3 sm:grid-cols-2">
              {about.why.points.map((pt) => (
                <li key={pt} className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-mist/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-pond-300 hover:bg-pond-100/60">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-white shadow-[0_10px_20px_-10px_rgba(8,47,73,0.7)]" style={blueTile} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 6.5l2.3 2.3L9.500 3.500" />
                    </svg>
                  </span>
                  <span className="pt-1.5 text-[15px] font-medium leading-relaxed text-ink/85">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* at-a-glance comparison */}
          <div className={`${wrap} mt-16`}>
            <div className="overflow-hidden rounded-3xl border border-ink/10">
              <div className="grid divide-y divide-ink/10 md:grid-cols-3 md:divide-x md:divide-y-0">
                {productDetails.map((p) => (
                  <div key={p.slug} className="bg-mist/50 p-7">
                    <h3 className="font-display text-xl font-medium text-pond-900">{p.name}</h3>
                    <dl className="mt-5 space-y-3">
                      {p.specs.map((s) => (
                        <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3 last:border-0 last:pb-0">
                          <dt className="text-sm text-ink/60">{s.label}</dt>
                          <dd className="text-right text-sm font-semibold text-ink">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section aria-labelledby="products-cta-title" className="bg-white px-4 pb-24 sm:px-6 lg:px-8">
          <div
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-20"
            style={{ background: "radial-gradient(120% 140% at 50% 0%, #0e7490 0%, #0c4a6e 55%, #082f49 100%)" }}
          >
            <h2 id="products-cta-title" className="mx-auto max-w-3xl font-display text-3xl font-medium leading-tight text-white sm:text-5xl">
              Not sure which feed fits your pond?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Tell us about your pond and our team will help you with feeding recommendations and dealer information.
            </p>
            <div className="mt-9 flex justify-center">
              <a href={site.navCta.href} className="btn-primary">
                {site.navCta.label}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
