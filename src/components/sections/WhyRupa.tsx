import { site } from "@/config/site";
import { PondDiagram } from "@/components/ui/PondDiagram";

export function WhyRupa() {
  const w = site.why;
  return (
    <section id="why-rupa" aria-labelledby="why-title" className="bg-mist py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-8">
        <div>
          <p className="eyebrow text-pond-500">{w.eyebrow}</p>
          <h2 id="why-title" className="mt-4 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
            {w.title}
          </h2>
          <ol className="mt-10 space-y-8">
            {w.points.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[auto_1fr] gap-5">
                <span className="font-display text-2xl text-grain-700" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink/70">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <figure className="overflow-hidden rounded-3xl border border-ink/10 bg-pond-950 shadow-[0_30px_60px_-40px_rgba(14,26,23,0.5)]">
          <PondDiagram className="block h-auto w-full" />
          <figcaption className="border-t border-white/10 px-6 py-4 text-sm text-white/75">
            Three feeding zones in one pond — surface, water column and a shared bottom feeding area.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
