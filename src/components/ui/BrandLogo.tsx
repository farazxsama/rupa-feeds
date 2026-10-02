import { site } from "@/config/site";

/**
 * Wordmark placeholder. When the client's logo file is available set
 * `site.logoSrc` and the real mark renders instead — no other changes needed.
 */
export function BrandLogo({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  if (site.logoSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={site.logoSrc} alt={site.brand} className={`h-8 w-auto ${className}`} />;
  }
  const color = tone === "light" ? "text-white" : "text-ink";
  return (
    <span className={`inline-flex items-baseline gap-2 ${color} ${className}`} aria-label={site.brand}>
      <span className="font-display text-xl font-semibold tracking-[0.08em]">RUPA</span>
      <span className="text-[11px] font-semibold tracking-brand opacity-80">FEEDS</span>
    </span>
  );
}
