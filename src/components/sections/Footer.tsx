import { site } from "@/config/site";
import { productList } from "@/config/products";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SocialLinks } from "@/components/ui/SocialLinks";

export function Footer() {
  return (
    <footer className="bg-[#0504aa] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.logoImage} alt="" className="h-10 w-auto" />
            <BrandLogo />
          </div>
          <p className="mt-4 max-w-xs text-base leading-relaxed">{site.hero.body}</p>
        </div>
        <nav aria-label="Footer — company">
          <h2 className="eyebrow !text-[13px] text-white/50">Company</h2>
          <ul className="mt-4 space-y-2 text-base">
            {site.nav.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:underline underline-offset-4">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={site.navCta.href} className="hover:underline underline-offset-4">
                {site.navCta.label}
              </a>
            </li>
          </ul>
        </nav>
        <nav aria-label="Footer — products">
          <h2 className="eyebrow !text-[13px] text-white/50">Products</h2>
          <ul className="mt-4 space-y-2 text-base">
            {productList.map((p) => (
              <li key={p.id}>
                <a href={p.href} className="hover:underline underline-offset-4">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="eyebrow !text-[13px] text-white/50">Contact</h2>
          <ul className="mt-4 space-y-2 text-base">
            {site.footer.contact.map((c) => (
              <li key={c.label}>
                <span>{c.label}: </span>
                {c.value}
              </li>
            ))}
          </ul>
          <SocialLinks />
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-sm text-center text-white sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {site.brand}. {site.footer.note}
        </p>
      </div>
    </footer>
  );
}
