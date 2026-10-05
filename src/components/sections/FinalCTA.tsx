import { site } from "@/config/site";

export function FinalCTA() {
  const c = site.finalCta;
  return (
    <section aria-labelledby="cta-title" className="bg-mist px-4 pb-24 sm:px-6 lg:px-8">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-20"
        style={{ background: "radial-gradient(120% 140% at 50% 0%, #0e7490 0%, #0c4a6e 55%, #082f49 100%)" }}
      >
        <h2 id="cta-title" className="mx-auto max-w-3xl font-display text-3xl font-medium leading-tight text-white sm:text-5xl">
          {c.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{c.body}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href={c.button.href} className="btn-primary">
            {c.button.label}
          </a>
          <a href={c.secondary.href} className="btn-ghost">
            {c.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
