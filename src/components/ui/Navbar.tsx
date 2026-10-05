"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";

/**
 * Transparent over the 3D pond; turns solid brand blue (#0303AB) once the
 * user scrolls. The Contact Us button inverts with it.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const solid = scrolled || open;

  const contactCls = solid
    ? "bg-white text-blue-600 hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-blue-600"
    : "bg-white text-blue-600 hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-blue-600";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ${solid ? "border-white/10 bg-blue-600" : "border-white/10 bg-blue-600"
        }`}
    >
      {/* soft top scrim keeps links readable over the hero while the bar is transparent */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 to-transparent transition-opacity duration-500 ${solid ? "opacity-0" : "opacity-100"
          }`}
      />
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main">
        <a
          href="/"
          className="flex flex-none items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label={site.brand}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.logoImage} alt="" className="h-12 w-auto" />
          <span className="font-display text-2xl font-semibold uppercase tracking-normal text-white">RUPA FEEDS</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((l) => (
            <li key={l.label} className={l.children ? "group relative" : undefined}>
              <a
                href={l.href}
                aria-current={l.href === "/" ? "page" : undefined}
                aria-haspopup={l.children ? "menu" : undefined}
                className="inline-flex items-center gap-1 py-2 text-md font-medium text-white/85 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:underline aria-[current=page]:text-white"
              >
                {l.label}
                {l.children && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                    aria-hidden="true"
                  >
                    <path d="M2 3.5l3 3 3-3" />
                  </svg>
                )}
              </a>
              {l.children && (
                // pt-3 is an invisible bridge so the menu stays open while the cursor crosses the gap
                <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="overflow-hidden rounded-xl border border-white/15 bg-[#0303AB] p-1.5 shadow-[0_20px_40px_-16px_rgba(0,0,40,0.55)]">
                    {l.children.map((c) => (
                      <li key={c.label}>
                        <a
                          href={c.href}
                          className="block rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none"
                        >
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={site.navCta.href}
            className={`btn !px-5 !py-2.5 hidden duration-500 sm:inline-flex ${contactCls}`}
          >
            {site.navCta.label}
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" hidden={!open} className="relative border-t border-white/10 px-4 pb-6 pt-2 md:hidden">
        <ul className="flex flex-col">
          {site.nav.map((l) => (
            <li key={l.label}>
              {l.children ? (
                <>
                  <button
                    type="button"
                    aria-expanded={productsOpen}
                    aria-controls="mobile-products"
                    onClick={() => setProductsOpen((o) => !o)}
                    className="flex w-full items-center justify-between py-3 text-left text-base font-medium text-white/90"
                  >
                    {l.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className={`transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path d="M2 3.5l3 3 3-3" />
                    </svg>
                  </button>
                  <ul id="mobile-products" hidden={!productsOpen} className="mb-1 ml-3 border-l border-white/20 pl-4">
                    <li>
                      <a href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-sm text-white/80">
                        All products
                      </a>
                    </li>
                    {l.children.map((c) => (
                      <li key={c.label}>
                        <a href={c.href} onClick={() => setOpen(false)} className="block py-2.5 text-sm text-white/80">
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <a href={l.href} onClick={() => setOpen(false)} className="block py-3 text-base font-medium text-white/90">
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>
        <a href={site.navCta.href} className="btn mt-3 w-full bg-white text-[#0303AB] hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-[#0303AB]">
          {site.navCta.label}
        </a>
      </div>
    </header>
  );
}
