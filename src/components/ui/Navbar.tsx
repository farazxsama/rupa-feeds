"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { BrandLogo } from "./BrandLogo";

/**
 * Transparent over the 3D pond, gains a soft blurred backing once the user
 * scrolls so links stay readable over any frame.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled || open ? "border-b border-white/10 bg-pond-950/70 backdrop-blur-md" : "border-b border-transparent bg-gradient-to-b from-black/25 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <a href="/" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
          <BrandLogo />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                aria-current={l.href === "/" ? "page" : undefined}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:underline aria-[current=page]:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={site.navCta.href} className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">
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

      <div id="mobile-menu" hidden={!open} className="border-t border-white/10 px-4 pb-6 pt-2 md:hidden">
        <ul className="flex flex-col">
          {site.nav.map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setOpen(false)} className="block py-3 text-base font-medium text-white/90">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={site.navCta.href} className="btn-primary mt-3 w-full">
          {site.navCta.label}
        </a>
      </div>
    </header>
  );
}
