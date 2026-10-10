import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/sections/Footer";
import { about } from "@/config/about";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us — Rupa Feeds",
  description: about.hero.body,
};

/**
 * ABOUT US — a plain static page (no 3D, no scroll animation). All copy and
 * image paths live in config/about.ts.
 */

/** Real image when a path is configured, otherwise a clearly-labelled placeholder block. */
function Picture({ src, label, className = "" }: { src: string | null; label: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={label} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      role="img"
      aria-label={`${label} (placeholder)`}
      className={`flex h-full w-full flex-col items-center justify-center gap-3 text-white/80 ${className}`}
      style={{ background: "linear-gradient(140deg, #0e7490 0%, #0c4a6e 55%, #082f49 100%)" }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
        <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
        <circle cx="8.5" cy="10" r="1.6" />
        <path d="M3.5 17l5-4.5 3.5 3 3-2.5 5.5 4.5" />
      </svg>
      <span className="eyebrow">{label} · placeholder</span>
    </div>
  );
}

function ValueIcon({ name }: { name: "trophy" | "handshake" | "bulb" }) {
  const common = { width: 32, height: 32, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (name === "trophy")
    return (
      <svg {...common} aria-hidden="true">
        <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
        <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" />
      </svg>
    );
  if (name === "handshake")
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 8l4-2 4 2 2-1 4-1 4 2v7l-3 1" />
        <path d="M3 8v7l3 1 5 4 7-4M11 8l-3 3a1.6 1.6 0 0 0 2.3 2.2L12 12l5 4" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden="true">
      <path d="M9 17h6M10 20h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" />
    </svg>
  );
}

/** One icon per "Why farmers choose" point, in the order they appear in config/about.ts. */
function WhyIcon({ index }: { index: number }) {
  const paths = [
    // quality: shield with a tick
    <path key="a" d="M12 3l7 2.5v5.6c0 4.3-2.8 7.6-7 9.4-4.2-1.800-7-5.100-7-9.400V5.500L12 3zM9 12l2.200 2.200L15.200 10" />,
    // balanced nutrition: lab flask
    <path key="b" d="M9.500 3h5M10.500 3v6L5.300 18a2 2 0 0 0 1.700 3h10a2 2 0 0 0 1.700-3L13.500 9V3M7.800 15h8.400" />,
    // feed conversion: rising chart
    <path key="c" d="M4 4v16h16M7.500 15.500l3.500-4 3 2.500 5-6.500M15.500 7.500H19V11" />,
    // immunity: heart with a pulse
    <path key="d" d="M12 20s-7-4.300-7-9.600A3.900 3.900 0 0 1 12 8a3.900 3.900 0 0 1 7 2.400C19 15.700 12 20 12 20zM7.500 12.500h2.300l1.200-2 1.800 3.500 1.200-1.500h2.500" />,
    // dealer network: people
    <path key="e" d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.500 19.500c0-3 2.500-5 5.500-5s5.500 2 5.500 5M16 10.500a2.500 2.500 0 1 0-1-4.800M16.500 14.600c2.300.4 4 2.200 4 4.900" />,
    // sustainable: leaf
    <path key="f" d="M5 19c0-8 5-13 14-14 0 9-4.500 14-11 14-1 0-2-.200-3-.500zM5 19c2.500-4.500 5.500-7.500 9.500-9.500" />,
  ];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[index % paths.length]}
    </svg>
  );
}

/** Official brand glyphs (simple-icons, CC0) with each network's own colour. */
const SOCIAL: Record<string, { path: string; background: string }> = {
  Facebook: { background: "#1877F2", path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" },
  X: { background: "#000000", path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" },
  Instagram: { background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", path: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" },
  YouTube: { background: "#FF0000", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  WhatsApp: { background: "#25D366", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" },
};
const socialFor = (label: string) => SOCIAL[label.split(" ")[0]] ?? SOCIAL.Facebook;

function SocialIcon({ name }: { name: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={socialFor(name).path} />
    </svg>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-grain-500" aria-label="5 out of 5 stars" role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.8 4.9 17.5l1-5.7-4.1-4 5.7-.8L10 1.8z" />
        </svg>
      ))}
    </div>
  );
}

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export default function AboutPage() {
  const { hero, intro, why, purpose, journey, values, csr, certifications, testimonials } = about;

  return (
    <>
      <Navbar />
      <main id="main" className="bg-blue-100">
        {/* Hero */}
        <section
          aria-labelledby="about-title"
          className="relative overflow-hidden pt-16 text-white"
          style={{ background: "radial-gradient(120% 140% at 15% 0%, #0e7490 0%, #0c4a6e 50%, #082f49 100%)" }}
        >
          <div className={`${wrap} grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24`}>
            <div>
              <nav aria-label="Breadcrumb" className="text-sm text-white/65">
                <a href="/" className="hover:text-white">
                  Home
                </a>
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                <span aria-current="page" className="text-white">
                  About
                </span>
              </nav>
              <p className="eyebrow mt-8 text-grain-300">{hero.eyebrow}</p>
              <h1 id="about-title" className="mt-4 font-display text-[2.6rem] font-medium leading-[1.05] sm:text-6xl">
                {hero.title}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{hero.body}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="/products" className="btn-primary">
                  Explore Products
                </a>
                <a href={site.navCta.href} className="btn-ghost">
                  {site.navCta.label}
                </a>
              </div>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]">
              <Picture src={hero.image} label={hero.imageLabel} />
            </div>
          </div>
        </section>

        {/* About + why farmers choose us */}
        <section aria-labelledby="intro-title" className="py-20 sm:py-28">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16`}>
            <div>
              <p className="eyebrow text-pond-500">{intro.eyebrow}</p>
              <h2 id="intro-title" className="mt-4 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
                {intro.title}
              </h2>
              <div className="mt-7 space-y-5 text-base leading-relaxed text-ink/75 sm:text-[17px]">
                {intro.paragraphs.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
            <div className="lg:sticky lg:top-24">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_30px_60px_-40px_rgba(14,26,23,0.5)]">
                <Picture src={intro.image} label={intro.imageLabel} />
              </div>
            </div>
          </div>

          <div className={`${wrap} mt-16 sm:mt-20`}>
            <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)]">
              <div className="p-7 sm:p-10">
                <p className="eyebrow text-pond-500">The RUPA difference</p>
                <h3 className="mt-3 font-display text-2xl font-medium text-ink sm:text-3xl">{why.title}</h3>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {why.points.map((p, i) => (
                    <li
                      key={p}
                      className="group flex items-start gap-4 rounded-2xl border border-ink/10 bg-mist/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-pond-300 hover:bg-pond-100/60"
                    >
                      <span
                        className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-white shadow-[0_10px_20px_-10px_rgba(8,47,73,0.7)]"
                        style={{ background: "linear-gradient(140deg, #0891b2 0%, #0c4a6e 100%)" }}
                        aria-hidden="true"
                      >
                        <WhyIcon index={i} />
                      </span>
                      <span className="pt-1 text-[15px] font-medium leading-relaxed text-ink/85">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="grid gap-6 px-7 py-8 text-white sm:px-10 sm:py-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12"
                style={{ background: "radial-gradient(120% 160% at 0% 0%, #0e7490 0%, #0c4a6e 55%, #082f49 100%)" }}
              >
                <p className="leading-relaxed text-white/80">{why.closing}</p>
                <p className="flex gap-4 font-display text-xl font-medium leading-snug sm:text-2xl">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/10 text-grain-300" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="8.5" />
                      <circle cx="12" cy="12" r="4.5" />
                      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
                    </svg>
                  </span>
                  <span>{why.motto}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission + vision */}
        <section
          aria-label="Mission and vision"
          className="relative overflow-hidden bg-pond-950"
          style={{ background: "radial-gradient(90% 120% at 50% 0%, #0c4a6e 0%, #082f49 60%)" }}
        >
          {purpose.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={purpose.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          )}
          {/* soft light pools behind the cards */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-pond-500/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-grain-500/15 blur-3xl" />
          <div className={`${wrap} relative grid gap-6 py-20 sm:py-24 md:grid-cols-2`}>
            {[purpose.mission, purpose.vision].map((m, i) => (
              <article
                key={m.title}
                className="glass-panel group relative overflow-hidden p-8 transition duration-300 hover:-translate-y-1 hover:border-white/25 sm:p-10"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: i === 0 ? "linear-gradient(90deg, #e3be7a, #c8913a)" : "linear-gradient(90deg, #7dd3fc, #0891b2)" }}
                />
                <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[9rem] font-semibold leading-none text-white/[0.05]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden="true"
                  className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_16px_30px_-14px_rgba(0,0,0,0.7)]"
                  style={{
                    background: i === 0 ? "linear-gradient(140deg, #e3be7a 0%, #c8913a 100%)" : "linear-gradient(140deg, #7dd3fc 0%, #0891b2 100%)",
                    color: "#082f49",
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {i === 0 ? (
                      // mission: target hit by an arrow
                      <>
                        <circle cx="11" cy="13" r="7.5" />
                        <circle cx="11" cy="13" r="3.5" />
                        <path d="M11 13l8.500-8.500M16.500 4.500h3v3" />
                      </>
                    ) : (
                      // vision: eye
                      <>
                        <path d="M2.500 12s3.500-6.500 9.500-6.500 9.500 6.500 9.500 6.500-3.500 6.500-9.500 6.500S2.500 12 2.500 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </span>
                <p className="eyebrow relative mt-7 text-grain-300">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="relative mt-3 font-display text-3xl font-medium sm:text-4xl">{m.title}</h2>
                <p className="relative mt-4 text-base leading-relaxed text-white/85 sm:text-lg">{m.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Journey */}
        <section aria-labelledby="journey-title" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="journey-title" className="text-center font-display text-4xl font-medium text-ink sm:text-5xl">
              {journey.title}
            </h2>
            {journey.milestones.length > 0 ? (
              <ol className="mt-12 space-y-8 border-l border-pond-300 pl-7">
                {journey.milestones.map((m) => (
                  <li key={m.year + m.title} className="relative">
                    <span className="absolute -left-[34px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-pond-500" aria-hidden="true" />
                    <p className="eyebrow text-pond-500">{m.year}</p>
                    <h3 className="mt-1.5 text-lg font-semibold text-ink">{m.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink/70">{m.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-ink/20 px-6 py-8 text-center text-sm text-ink/55">
                {journey.emptyNote}
              </p>
            )}
          </div>
        </section>

        {/* Core values */}
        <section aria-labelledby="values-title" className="py-20 sm:py-28">
          <div className={wrap}>
            <h2 id="values-title" className="text-center font-display text-4xl font-medium text-ink sm:text-5xl">
              {values.title}
            </h2>
            <span aria-hidden="true" className="mx-auto mt-5 block h-1 w-16 rounded-full" style={{ background: "linear-gradient(90deg, #0891b2, #c8913a)" }} />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {values.items.map((v, i) => {
                const tone = [
                  "linear-gradient(140deg, #e3be7a 0%, #c8913a 100%)",
                  "linear-gradient(140deg, #0891b2 0%, #0c4a6e 100%)",
                  "linear-gradient(140deg, #7dd3fc 0%, #0891b2 100%)",
                ][i % 3];
                return (
                  <article
                    key={v.title}
                    className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_36px_60px_-36px_rgba(8,47,73,0.5)] sm:p-10"
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute right-4 -top-4 select-none font-display text-[7rem] font-semibold leading-none text-pond-900/[0.05]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="relative mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl shadow-[0_16px_28px_-14px_rgba(8,47,73,0.6)] ring-8 ring-pond-100/60"
                      style={{ background: tone, color: i === 1 ? "#ffffff" : "#082f49" }}
                    >
                      <ValueIcon name={v.icon} />
                    </span>
                    <h3 className="relative mt-7 font-display text-2xl font-medium text-ink">{v.title}</h3>
                    <p className="relative mt-3 text-[15px] leading-relaxed text-ink/70">{v.body}</p>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                      style={{ background: tone }}
                    />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* CSR / social */}
        <section aria-labelledby="csr-title" className="bg-white py-16 sm:py-20">
          <div className={`${wrap} text-center`}>
            <h2 id="csr-title" className="font-display text-3xl font-medium text-pond-900 sm:text-4xl">
              {csr.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink/70">{csr.body}</p>
            <ul className="mt-8 flex flex-wrap justify-center gap-4">
              {csr.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={l.label}
                    title={l.label}
                    style={{ background: socialFor(l.label).background }}
                    className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_24px_-10px_rgba(8,47,73,0.55)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_-12px_rgba(8,47,73,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pond-500 focus-visible:ring-offset-2"
                  >
                    <SocialIcon name={l.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Certifications */}
        <section aria-labelledby="cert-title" className="py-20 sm:py-28">
          <div className={wrap}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 id="cert-title" className="font-display text-4xl font-medium text-ink sm:text-5xl">
                {certifications.title}
              </h2>
              <p className="mt-5 leading-relaxed text-ink/70">{certifications.body}</p>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {certifications.items.map((c) => (
                <li key={c.name} className="flex flex-col items-center rounded-3xl border border-ink/10 bg-white p-6 text-center">
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
                  <p className="mt-1 text-sm text-ink/60">{c.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Testimonials */}
        <section aria-labelledby="reviews-title" className="bg-gradient-to-b from-white to-pond-100/70 py-20 sm:py-28">
          <div className={wrap}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="reviews-title" className="font-display text-4xl font-medium text-ink sm:text-5xl">
                {testimonials.title}
              </h2>
              <p className="mt-4 text-ink/70">{testimonials.body}</p>
            </div>
            <span aria-hidden="true" className="mx-auto mt-5 block h-1 w-16 rounded-full" style={{ background: "linear-gradient(90deg, #0891b2, #c8913a)" }} />
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.items.map((t) => (
                <li key={t.name}>
                  <figure className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white p-7 shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)] transition duration-300 hover:-translate-y-1.5 hover:border-pond-300 hover:shadow-[0_36px_60px_-36px_rgba(8,47,73,0.5)] sm:p-8">
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: "linear-gradient(90deg, #0891b2, #0c4a6e)" }} />
                    <div className="flex items-center justify-between">
                      <span
                        aria-hidden="true"
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_12px_22px_-12px_rgba(8,47,73,0.7)]"
                        style={{ background: "linear-gradient(140deg, #0891b2 0%, #0c4a6e 100%)" }}
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
                        style={{ background: "linear-gradient(140deg, #0e7490 0%, #082f49 100%)" }}
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
      </main>
      <Footer />
    </>
  );
}
