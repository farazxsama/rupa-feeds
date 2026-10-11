import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/sections/Footer";
import { productDetails, getProductDetail } from "@/config/productDetails";
import { about } from "@/config/about";
import { site } from "@/config/site";

/**
 * PRODUCT DETAILS — one static template for every entry in
 * config/productDetails.ts (/products/floating-feeds, /products/sinking-feeds,
 * /products/poly-culture-feeds). Informational only: no cart or checkout.
 */
type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return productDetails.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = getProductDetail((await params).slug);
  if (!product) return {};
  return { title: `${product.name} — Rupa Feeds`, description: product.intro };
}

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const blueTile = { background: "linear-gradient(140deg, #0891b2 0%, #0c4a6e 100%)" };

/** Generic line icons, picked by position so every product gets the same visual rhythm. */
function Icon({ index, size = 24 }: { index: number; size?: number }) {
  const paths = [
    "M4 4v16h16M7.5 15.5l3.5-4 3 2.5 5-6.5M15.5 7.5H19V11", // growth chart
    "M12 3l7 2.5v5.6c0 4.3-2.8 7.6-7 9.4-4.2-1.8-7-5.1-7-9.4V5.5L12 3zM9 12l2.2 2.2L15.2 10", // shield tick
    "M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.700 12 20 12 20z", // heart
    "M5 19c0-8 5-13 14-14 0 9-4.5 14-11 14-1 0-2-.2-3-.5zM5 19c2.500-4.500 5.500-7.500 9.500-9.500", // leaf
    "M12 3.500s6 6.300 6 10.500a6 6 0 0 1-12 0c0-4.200 6-10.500 6-10.500z", // water drop
    "M9.500 3h5M10.500 3v6L5.300 18a2 2 0 0 0 1.700 3h10a2 2 0 0 0 1.700-3L13.500 9V3M7.800 15h8.400", // flask
    "M12 3v18M7 7.500h7.500a2.800 2.800 0 0 1 0 5.500H9.500a2.800 2.800 0 0 0 0 5.500H17", // returns
    "M4 12a8 8 0 0 1 14-5.300M20 12a8 8 0 0 1-14 5.300M18 3v4h-4M6 21v-4h4", // cycle
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[index % paths.length]} />
    </svg>
  );
}

function Tick() {
  return (
    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-pond-100 text-pond-700" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 6.5l2.3 2.3L9.500 3.500" />
      </svg>
    </span>
  );
}

function SectionHeading({ eyebrow, title, id, center = false, light = false }: { eyebrow: string; title: string; id: string; center?: boolean; light?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className={`eyebrow ${light ? "text-grain-300" : "text-pond-500"}`}>{eyebrow}</p>
      <h2 id={id} className={`mt-4 font-display text-3xl font-medium leading-tight sm:text-4xl lg:text-[2.75rem] ${light ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
    </div>
  );
}

export default async function ProductPage({ params }: Params) {
  const product = getProductDetail((await params).slug);
  if (!product) notFound();
  const related = productDetails.filter((p) => p.slug !== product.slug);
  const { overview, variants, benefits, how, species, why } = product;
  const detailedBenefits = benefits.items.some((b) => b.body);

  return (
    <>
      <Navbar />
      <main id="main" className="bg-mist">
        {/* 1. Hero */}
        <section
          aria-labelledby="product-title"
          className="relative overflow-hidden pt-16 text-white"
          style={{ background: "radial-gradient(120% 140% at 15% 0%, #0e7490 0%, #0c4a6e 50%, #082f49 100%)" }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-pond-300/15 blur-3xl" />
          <div className={`${wrap} relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16`}>
            <div>
              <nav aria-label="Breadcrumb" className="text-sm text-white/65">
                <a href="/" className="hover:text-white">
                  Home
                </a>
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                <a href="/products" className="hover:text-white">
                  Products
                </a>
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                <span aria-current="page" className="text-white">
                  {product.name}
                </span>
              </nav>
              <p className="eyebrow mt-8 text-grain-300">{product.tagline}</p>
              <h1 id="product-title" className="mt-4 font-display text-[2.75rem] font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
                {product.name}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{product.intro}</p>
              <dl className="mt-9 grid max-w-xl grid-cols-2 gap-3">
                {product.specs.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3.5 backdrop-blur-sm">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{s.label}</dt>
                    <dd className="mt-1 font-display text-lg font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href={site.navCta.href} className="btn-primary">
                  {site.navCta.label}
                </a>
                <a href="#overview" className="btn-ghost">
                  Product details
                </a>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div aria-hidden="true" className="absolute inset-6 rounded-[2.5rem] bg-pond-300/25 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.65)] sm:p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.imageAlt} className="mx-auto aspect-square w-full object-contain" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Overview */}
        <section id="overview" aria-labelledby="overview-title" className="scroll-mt-20 py-20 sm:py-28">
          <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16`}>
            <SectionHeading id="overview-title" eyebrow="Product overview" title={overview.title} />
            <div className="space-y-5 text-base leading-relaxed text-ink/75 sm:text-[17px]">
              {overview.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </div>

          {variants && (
            <div className={`${wrap} mt-14`}>
              <h3 className="font-display text-2xl font-medium text-ink">{variants.title}</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {variants.items.map((v) => (
                  <article key={v.name} className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-7 shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] sm:p-8">
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: "linear-gradient(90deg, #0891b2, #0c4a6e)" }} />
                    <h4 className="font-display text-xl font-medium text-pond-900">{v.name}</h4>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{v.summary}</p>
                    <ul className="mt-5 space-y-3">
                      {v.points.map((pt) => (
                        <li key={pt} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
                          <Tick />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. Key benefits */}
        <section aria-labelledby="benefits-title" className="bg-white py-20 sm:py-28">
          <div className={wrap}>
            <SectionHeading id="benefits-title" eyebrow={product.name} title={benefits.title} center />
            <ul className={`mt-12 grid gap-5 sm:grid-cols-2 ${detailedBenefits ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
              {benefits.items.map((b, i) => (
                <li
                  key={b.title}
                  className={`rounded-3xl border border-ink/10 bg-mist/60 p-6 transition duration-200 hover:-translate-y-1 hover:border-pond-300 hover:bg-pond-100/50 ${
                    detailedBenefits ? "sm:p-7" : "flex items-center gap-4"
                  }`}
                >
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-white shadow-[0_10px_20px_-10px_rgba(8,47,73,0.7)]" style={blueTile}>
                    <Icon index={i} />
                  </span>
                  <div className={detailedBenefits ? "mt-5" : ""}>
                    <h3 className={detailedBenefits ? "font-display text-xl font-medium text-ink" : "text-[15px] font-semibold leading-snug text-ink"}>{b.title}</h3>
                    {b.body && <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{b.body}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. How it works */}
        <section
          aria-labelledby="how-title"
          className="relative overflow-hidden py-20 sm:py-28"
          style={{ background: "radial-gradient(90% 120% at 50% 0%, #0c4a6e 0%, #082f49 60%)" }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-pond-500/20 blur-3xl" />
          <div className={`${wrap} relative`}>
            <div className="mx-auto max-w-3xl text-center">
              <SectionHeading id="how-title" eyebrow="How it works" title={how.title} center light />
              <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">{how.intro}</p>
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {how.steps.map((s, i) => (
                <li key={s.title} className="glass-panel relative overflow-hidden p-7 sm:p-8">
                  <span aria-hidden="true" className="pointer-events-none absolute right-4 -top-3 select-none font-display text-[6rem] font-semibold leading-none text-white/[0.06]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="relative flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-semibold"
                    style={{ background: "linear-gradient(140deg, #e3be7a 0%, #c8913a 100%)", color: "#082f49" }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <h3 className="relative mt-6 font-display text-xl font-medium">{s.title}</h3>
                  <p className="relative mt-3 text-[15px] leading-relaxed text-white/80">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5. Species and applications */}
        <section aria-labelledby="species-title" className="py-20 sm:py-28">
          <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16`}>
            <div>
              <SectionHeading id="species-title" eyebrow="Where it fits" title={species.title} />
              <p className="mt-6 leading-relaxed text-ink/75">{species.intro}</p>
              <div className="mt-8 max-w-sm overflow-hidden rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.imageAlt} className="mx-auto aspect-square w-full object-contain" />
              </div>
            </div>
            <div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {species.list.map((name) => (
                  <li key={name} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3.5 text-[15px] font-medium text-ink/85">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-pond-100 text-pond-700" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12c3-4.500 6.500-6 10-6 3 0 5.500 2 8 6-2.500 4-5 6-8 6-3.500 0-7-1.500-10-6zM3 12l-1.500-3.500M3 12l-1.500 3.500" />
                        <circle cx="16" cy="11" r="0.800" fill="currentColor" />
                      </svg>
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-2xl border-l-4 border-pond-500 bg-pond-100/60 px-5 py-4 text-[15px] leading-relaxed text-ink/75">{species.note}</p>
            </div>
          </div>
        </section>

        {/* 6. Why choose Rupa Feeds */}
        <section aria-labelledby="why-title" className="bg-white py-20 sm:py-28">
          <div className={wrap}>
            <div className="overflow-hidden rounded-3xl border border-ink/10 bg-mist/60">
              <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
                <div>
                  <SectionHeading id="why-title" eyebrow="Why choose Rupa Feeds" title={why.title} />
                  <p className="mt-6 leading-relaxed text-ink/75">{why.body}</p>
                </div>
                <ul className="grid content-start gap-3">
                  {why.points.map((pt, i) => (
                    <li key={pt} className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-4">
                      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl text-white" style={blueTile} aria-hidden="true">
                        <Icon index={i + 1} size={22} />
                      </span>
                      <span className="text-[15px] font-medium leading-snug text-ink/85">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-ink/10 bg-white px-7 py-6 sm:px-10">
                <p className="eyebrow text-pond-500">{about.certifications.title}</p>
                <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
                  {about.certifications.items.map((c) => (
                    <li key={c.name} className="flex items-center gap-3">
                      {c.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt="" className="h-11 w-11 flex-none object-contain" />
                      )}
                      <span className="text-sm font-semibold text-ink/80">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Related products */}
        <section aria-labelledby="related-title" className="py-20 sm:py-28">
          <div className={wrap}>
            <SectionHeading id="related-title" eyebrow="Related products" title="Explore our other feeds" center />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {related.map((r) => (
                <article
                  key={r.slug}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_36px_60px_-36px_rgba(8,47,73,0.5)] sm:flex-row"
                >
                  <div className="flex flex-none items-center justify-center bg-white p-6 sm:w-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.image} alt={r.imageAlt} className="h-44 w-44 object-contain" />
                  </div>
                  <div className="flex flex-1 flex-col border-t border-ink/10 p-7 sm:border-l sm:border-t-0">
                    <p className="eyebrow text-pond-500">{r.tagline}</p>
                    <h3 className="mt-3 font-display text-2xl font-medium text-ink">{r.name}</h3>
                    <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink/70">{r.cardDescription}</p>
                    <a href={`/products/${r.slug}`} className="btn-dark mt-6 self-start">
                      View {r.name} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Contact CTA */}
        <section aria-labelledby="contact-cta-title" className="px-4 pb-24 sm:px-6 lg:px-8">
          <div
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-20"
            style={{ background: "radial-gradient(120% 140% at 50% 0%, #0e7490 0%, #0c4a6e 55%, #082f49 100%)" }}
          >
            <h2 id="contact-cta-title" className="mx-auto max-w-3xl font-display text-3xl font-medium leading-tight text-white sm:text-5xl">
              Talk to us about {product.name}
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
