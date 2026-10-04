import { site } from "@/config/site";
import { productList } from "@/config/products";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="bg-pond-950 text-white/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.logoImage} alt="" className="h-10 w-auto" />
            <BrandLogo />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{site.hero.body}</p>
        </div>
        <nav aria-label="Footer — company">
          <h2 className="eyebrow text-white/50">Company</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {site.nav.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={site.navCta.href} className="hover:text-white">
                {site.navCta.label}
              </a>
            </li>
          </ul>
        </nav>
        <nav aria-label="Footer — products">
          <h2 className="eyebrow text-white/50">Products</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {productList.map((p) => (
              <li key={p.id}>
                <a href={p.href} className="hover:text-white">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="eyebrow text-white/50">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {site.footer.contact.map((c) => (
              <li key={c.label}>
                <span className="text-white/50">{c.label}: </span>
                {c.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-white/50 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {site.brand}. {site.footer.note}
        </p>
      </div>
    </footer>
  );
}
