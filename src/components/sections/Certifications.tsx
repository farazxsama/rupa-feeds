import { about } from "@/config/about";

/**
 * Certifications — auto-scrolling strip of certificate cards (About page).
 * Content and logo paths come from config/about.ts (certifications); the
 * `cert-marquee` keyframes live in app/globals.css.
 */
const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function Certifications() {
  const { certifications } = about;
  return (
    <section aria-labelledby="cert-title" className="py-8 sm:py-10 bg-white">
      <div className={wrap}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="cert-title" className="font-display text-4xl font-medium text-ink sm:text-5xl">
            {certifications.title}
          </h2>
          <p className="mt-5 leading-relaxed text-black">{certifications.body}</p>
        </div>
        {/* continuous right-to-left loop: the track holds two identical copies and
            slides by exactly one copy (-50%), so the restart is seamless. Each copy
            repeats the certificates twice so it is always wider than the screen. */}
        <div className="group mt-12 overflow-hidden motion-reduce:overflow-x-auto">
          <div className="flex w-max animate-[cert-marquee_48s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className="flex">
                {[...certifications.items, ...certifications.items].map((c, i) => (
                  <li
                    key={`${c.name}-${i}`}
                    aria-hidden={copy === 0 && i >= certifications.items.length ? true : undefined}
                    className="w-[calc((100vw-2rem-1rem)/2+1rem)] flex-none pr-4 sm:w-[calc((min(100vw,80rem)-3rem-1.5rem)/2+1.5rem)] sm:pr-6 lg:w-[calc((min(100vw,80rem)-4rem-4.5rem)/4+1.5rem)]"
                  >
                    <div className="flex h-full flex-col items-center rounded-3xl border border-[#0504aa] bg-white p-6 text-center">
                      <div className="h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.image} alt={`${c.name} certificate`} className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-pond-300 bg-pond-100 text-[10px] font-semibold uppercase tracking-[0.16em] text-pond-700" style={{ borderRadius: "9999px" }}>
                            Logo
                          </div>
                        )}
                      </div>
                      <h3 className="mt-5 font-semibold text-ink">{c.name}</h3>
                      <p className="mt-1 text-sm text-black">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
