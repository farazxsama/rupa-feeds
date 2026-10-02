import type { Product } from "@/config/products";

/**
 * Story panel for one product. Pure HTML so the message is readable by
 * screen readers / search engines and survives with WebGL disabled.
 */
export function ProductInfo({ product, index, align = "left" }: { product: Product; index: number; align?: "left" | "right" }) {
  const headingId = `story-${product.id}-title`;
  return (
    <article
      aria-labelledby={headingId}
      className={`glass-panel w-full max-w-[26rem] p-6 sm:p-8 ${align === "right" ? "md:ml-auto" : ""}`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow text-grain-300">
          {String(index).padStart(2, "0")} — {product.zone}
        </p>
        <ZoneIcon id={product.id} />
      </div>
      <h2 id={headingId} className="mt-4 font-display text-3xl font-medium leading-tight sm:text-4xl">
        {product.name}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-white/85">{product.description}</p>

      {product.indicators && (
        <div className="mt-5 flex items-center gap-2" aria-label={product.indicators.join(" and ")}>
          {product.indicators.map((ind, i) => (
            <span key={ind} className="contents">
              {i > 0 && <span className="text-lg text-grain-300" aria-hidden="true">+</span>}
              <span className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                {ind}
              </span>
            </span>
          ))}
        </div>
      )}

      <ul className="mt-5 hidden space-y-2.5 text-sm text-white/80 sm:block">
        {product.features.map((f) => (
          <li key={f} className="flex gap-3">
            <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-grain-300" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>

      <a
        href={product.href}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
      >
        Explore {product.name}
        <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

/** Small diagram showing which water zone the feed serves. */
export function ZoneIcon({ id, className = "" }: { id: Product["id"]; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`h-9 w-9 flex-none ${className}`} aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="9" fill="none" stroke="currentColor" strokeOpacity="0.3" />
      <path d="M6 12c3-2 5 2 8 0s5 2 8 0 5 2 8 0 4 2 4 0" fill="none" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.3" />
      <path d="M5 33h30" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.3" />
      {id === "floating" && [12, 18, 24, 29].map((x) => <circle key={x} cx={x} cy="11.5" r="1.7" fill="#E3BE7A" />)}
      {id === "sinking" &&
        [
          [20, 16],
          [17, 21],
          [22, 25],
          [19, 30],
        ].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill="#E3BE7A" />)}
      {id === "polyculture" && (
        <>
          <path d="M12 18l6 9h4l6-9" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.1" />
          <circle cx="18" cy="31" r="1.5" fill="#E3BE7A" />
          <circle cx="22" cy="31" r="1.5" fill="#E3BE7A" />
        </>
      )}
    </svg>
  );
}
