import { about } from "@/config/about";

/**
 * "What Our Customers Say" — shared by the Home and About pages.
 * Reviews come from config/about.ts (testimonials).
 */
function Stars() {
  return (
    <div className="flex gap-0.5 text-pond-500" aria-label="5 out of 5 stars" role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.8 4.9 17.5l1-5.7-4.1-4 5.7-.8L10 1.8z" />
        </svg>
      ))}
    </div>
  );
}

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function Testimonials() {
  const { testimonials } = about;
  return (
    <section aria-labelledby="reviews-title" className="bg-gradient-to-b from-white to-pond-100/70 py-20 sm:py-28">
      <div className={wrap}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="reviews-title" className="font-display text-4xl font-medium text-ink sm:text-5xl">
            {testimonials.title}
          </h2>
          <p className="mt-4 text-ink/70">{testimonials.body}</p>
        </div>
        <span aria-hidden="true" className="mx-auto mt-5 block h-1 w-16 rounded-full" style={{ background: "linear-gradient(90deg, #2f2ee0, #5b5af0)" }} />
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.items.map((t) => (
            <li key={t.name}>
              <figure className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white p-7 shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] transition duration-300 hover:-translate-y-1.5 hover:border-pond-300 hover:shadow-[0_36px_60px_-36px_rgba(2,2,80,0.5)] sm:p-8">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: "linear-gradient(90deg, #2f2ee0, #030378)" }} />
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_12px_22px_-12px_rgba(2,2,80,0.7)]"
                    style={{ background: "linear-gradient(140deg, #2f2ee0 0%, #030378 100%)" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 17v-4.500C4 8.900 6 6.600 9.500 6v2.300c-1.700.500-2.600 1.600-2.700 3.200H9.500V17H4zm10.500 0v-4.500c0-3.600 2-5.900 5.500-6.500v2.300c-1.700.500-2.600 1.600-2.700 3.200H20V17h-5.500z" />
                    </svg>
                  </span>
                  <Stars />
                </div>
                <blockquote className="mt-6 flex-1 text-[15px] leading-relaxed text-ink/80">{t.quote}</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-ink/10 pt-5">
                  <span
                    className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-display text-lg font-semibold text-white ring-4 ring-pond-100"
                    style={{ background: "linear-gradient(140deg, #0504aa 0%, #020250 100%)" }}
                    aria-hidden="true"
                  >
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{t.name}</span>
                    {t.place && (
                      <span className="mt-0.5 flex items-center gap-1 text-sm text-ink/60">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s7-6.200 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21z" />
                          <circle cx="12" cy="9.500" r="2.500" />
                        </svg>
                        {t.place}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
