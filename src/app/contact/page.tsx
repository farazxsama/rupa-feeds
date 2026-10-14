import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ContactForm } from "@/components/sections/ContactForm";
import { contact } from "@/config/contact";

export const metadata: Metadata = {
  title: "Contact Us — Rupa Feeds",
  description: contact.hero.body,
};

/** CONTACT — static page; all details live in config/contact.ts, the form in ContactForm.tsx. */

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const blueTile = { background: "linear-gradient(140deg, #2f2ee0 0%, #030378 100%)" };

function LineIcon({ d }: { d: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const ICON = {
  pin: "M12 21s7-6.2 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21zM12 12a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z",
  mail: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3.500 7.500l8.500 6 8.500-6",
  phone: "M5 4h4l1.500 4.500-2 1.500a11 11 0 0 0 5.500 5.500l1.500-2L20 15v4a1 1 0 0 1-1 1C10.700 20 4 13.300 4 5a1 1 0 0 1 1-1z",
  network: "M12 7a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5zM5 21a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5zM19 21a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5zM12 7v5M12 12l-5.500 4.500M12 12l5.500 4.500",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.500 2",
};

function InfoCard({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="flex h-full gap-4 rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] transition duration-200 hover:-translate-y-1 hover:border-pond-300">
      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-white shadow-[0_10px_20px_-10px_rgba(2,2,80,0.7)]" style={blueTile}>
        <LineIcon d={icon} />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
        <div className="mt-2 space-y-1 text-[15px] leading-relaxed text-ink/75">{children}</div>
      </div>
    </div>
  );
}

const linkCls = "break-words font-medium text-pond-900 underline-offset-4 hover:text-pond-700 hover:underline";

export default function ContactPage() {
  const { hero, address, emails, phones, form, dealers, hours, map } = contact;

  return (
    <>
      <Navbar />
      <main id="main" className="bg-mist">
        {/* 1. Hero */}
        <section
          aria-labelledby="contact-title"
          className="relative overflow-hidden pt-16 text-white"
          style={{ background: "radial-gradient(120% 140% at 15% 0%, #0504aa 0%, #030378 50%, #020250 100%)" }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-pond-300/15 blur-3xl" />
          <div className={`${wrap} relative pb-24 pt-16 sm:pb-28 sm:pt-20`}>
            <nav aria-label="Breadcrumb" className="text-sm text-white/65">
              <a href="/" className="hover:text-white">
                Home
              </a>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span aria-current="page" className="text-white">
                Contact
              </span>
            </nav>
            <p className="eyebrow mt-8 text-pond-300">{hero.eyebrow}</p>
            <h1 id="contact-title" className="mt-4 font-display text-[2.75rem] font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{hero.body}</p>
          </div>
        </section>

        {/* 2. Contact information */}
        <section aria-label="Contact information" className="relative -mt-10 pb-6 sm:-mt-12">
          <ul className={`${wrap} grid gap-5 md:grid-cols-3`}>
            <li>
              <InfoCard icon={ICON.pin} title={address.title}>
                <address className="not-italic">
                  {address.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              </InfoCard>
            </li>
            <li>
              <InfoCard icon={ICON.mail} title="Email Us">
                {emails.map((e) => (
                  <a key={e} href={`mailto:${e}`} className={`block ${linkCls}`}>
                    {e}
                  </a>
                ))}
              </InfoCard>
            </li>
            <li>
              <InfoCard icon={ICON.phone} title="Call Us">
                {phones.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} className={`block ${linkCls}`}>
                    {p.label}
                  </a>
                ))}
              </InfoCard>
            </li>
          </ul>
        </section>

        {/* 3. Form  +  4. Dealer network  +  5. Business hours */}
        <section className="py-16 sm:py-20">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start`}>
            <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] sm:p-10">
              <p className="eyebrow text-pond-500">Write to us</p>
              <h2 id="contact-form-title" className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
                {form.title}
              </h2>
              <p className="mt-3 text-ink/70">{form.body}</p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <div className="grid gap-6">
              <section
                aria-labelledby="dealers-title"
                className="relative overflow-hidden rounded-3xl p-7 text-white sm:p-8"
                style={{ background: "radial-gradient(120% 140% at 0% 0%, #0504aa 0%, #030378 55%, #020250 100%)" }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "linear-gradient(140deg, #c9c8fb 0%, #5b5af0 100%)", color: "#020250" }}>
                  <LineIcon d={ICON.network} />
                </span>
                <h2 id="dealers-title" className="mt-5 font-display text-2xl font-medium">
                  {dealers.title}
                </h2>
                <p className="mt-3 leading-relaxed text-white/85">{dealers.body}</p>
              </section>

              <section aria-labelledby="hours-title" className="rounded-3xl border border-ink/10 bg-white p-7 shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={blueTile}>
                  <LineIcon d={ICON.clock} />
                </span>
                <h2 id="hours-title" className="mt-5 font-display text-2xl font-medium text-ink">
                  {hours.title}
                </h2>
                <dl className="mt-4">
                  {hours.rows.map((r) => (
                    <div key={r.days} className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 last:border-0 last:pb-0">
                      <dt className="text-[15px] text-ink/70">{r.days}</dt>
                      <dd className="text-right text-[15px] font-semibold text-ink">{r.time}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </section>

        {/* 6. Location */}
        <section aria-labelledby="map-title" className="bg-white py-16 sm:py-24">
          <div className={wrap}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-pond-500">Find us</p>
                <h2 id="map-title" className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
                  {map.title}
                </h2>
              </div>
              <address className="text-[15px] not-italic leading-relaxed text-ink/70 sm:text-right">
                {address.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </div>
            <div className="mt-8 overflow-hidden rounded-3xl border border-ink/10 shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)]">
              <iframe
                src={map.embedSrc}
                title="Map showing the Rupa Feeds head office"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="block h-[340px] w-full border-0 sm:h-[440px]"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
