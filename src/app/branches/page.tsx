import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/sections/Footer";
import { branches, branchesPage } from "@/config/branches";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Our Branches — Rupa Feeds",
  description: branchesPage.hero.body,
};

/** BRANCHES — static page; every branch detail lives in config/branches.ts. */

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const ICON = {
  pin: "M12 21s7-6.2 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21zM12 12a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z",
  phone: "M5 4h4l1.500 4.500-2 1.500a11 11 0 0 0 5.500 5.500l1.500-2L20 15v4a1 1 0 0 1-1 1C10.700 20 4 13.300 4 5a1 1 0 0 1 1-1z",
  mail: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3.500 7.500l8.500 6 8.500-6",
};

function Row({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3.5">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-pond-100 text-pond-700" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/50">{label}</dt>
        <dd className="mt-0.5 text-[15px] leading-relaxed text-ink/80">{children}</dd>
      </div>
    </div>
  );
}

const linkCls = "break-words font-medium text-pond-900 underline-offset-4 hover:text-pond-700 hover:underline";

export default function BranchesPage() {
  const { hero, cta } = branchesPage;

  return (
    <>
      <Navbar />
      <main id="main" className="bg-mist">
        {/* Hero */}
        <section
          aria-labelledby="branches-title"
          className="relative overflow-hidden pt-16 text-white"
          style={{ background: "radial-gradient(120% 140% at 15% 0%, #0e7490 0%, #0c4a6e 50%, #082f49 100%)" }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-pond-300/15 blur-3xl" />
          <div className={`${wrap} relative py-16 sm:py-20`}>
            <nav aria-label="Breadcrumb" className="text-sm text-white/65">
              <a href="/" className="hover:text-white">
                Home
              </a>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span aria-current="page" className="text-white">
                Our Branches
              </span>
            </nav>
            <p className="eyebrow mt-8 text-grain-300">{hero.eyebrow}</p>
            <h1 id="branches-title" className="mt-4 max-w-3xl font-display text-[2.5rem] font-semibold leading-[1.06] sm:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{hero.body}</p>
            <ul className="mt-9 flex flex-wrap gap-2.5">
              {branches.map((b, i) => (
                <li key={b.name}>
                  <a
                    href={`#branch-${i + 1}`}
                    className="inline-flex rounded-full border border-white/25 bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    {b.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Branch cards */}
        <section aria-labelledby="branch-list-title" className="py-20 sm:py-24">
          <div className={wrap}>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-pond-500">Branch network</p>
              <h2 id="branch-list-title" className="mt-4 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
                Our {branches.length} branches
              </h2>
              <span aria-hidden="true" className="mx-auto mt-5 block h-1 w-16 rounded-full" style={{ background: "linear-gradient(90deg, #0891b2, #c8913a)" }} />
            </div>

            <ul className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {branches.map((b, i) => (
                <li key={b.name} id={`branch-${i + 1}`} className="scroll-mt-24">
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-pond-300 hover:shadow-[0_36px_60px_-36px_rgba(8,47,73,0.5)]">
                    <iframe
                      src={b.mapSrc}
                      title={`Map of the ${b.name} branch`}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="block h-56 w-full border-0"
                    />
                    <div className="flex flex-1 flex-col border-t border-ink/10 p-7">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-sm font-semibold text-white"
                          style={{ background: "linear-gradient(140deg, #0891b2 0%, #0c4a6e 100%)" }}
                          aria-hidden="true"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-2xl font-medium text-ink">{b.name}</h3>
                      </div>
                      <dl className="mt-6 space-y-4">
                        <Row icon={ICON.pin} label="Address">
                          <address className="not-italic">{b.address}</address>
                        </Row>
                        <Row icon={ICON.phone} label="Phone">
                          <a href={`tel:${b.phone.tel}`} className={linkCls}>
                            {b.phone.label}
                          </a>
                        </Row>
                        <Row icon={ICON.mail} label="Email">
                          <a href={`mailto:${b.email}`} className={linkCls}>
                            {b.email}
                          </a>
                        </Row>
                      </dl>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact CTA */}
        <section aria-labelledby="branches-cta-title" className="px-4 pb-24 sm:px-6 lg:px-8">
          <div
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-20"
            style={{ background: "radial-gradient(120% 140% at 50% 0%, #0e7490 0%, #0c4a6e 55%, #082f49 100%)" }}
          >
            <h2 id="branches-cta-title" className="mx-auto max-w-3xl font-display text-3xl font-medium leading-tight text-white sm:text-5xl">
              {cta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{cta.body}</p>
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
