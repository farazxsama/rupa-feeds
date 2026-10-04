/**
 * Site-wide copy & navigation. Edit freely — no layout logic depends on
 * the exact wording.
 */
export const site = {
  brand: "Rupa Feeds",
  /**
   * Real logo: place it at /public/brand/logo.svg and set this path.
   * While null, a typographic wordmark placeholder is rendered.
   */
  logoSrc: null as string | null,

  /**
   * Logo IMAGE shown beside "RUPA FEEDS" in the navbar and in the footer.
   * Replace this one path (e.g. "/brand/logo.png") — it is used in both places.
   */
  logoImage: "/img/rupa-logo.png",

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
      label: "Products",
      href: "/products",
      /** Hover dropdown (desktop) / expandable submenu (mobile). Paths match config/products.ts. */
      children: [
        { label: "Floating Feed", href: "/products/floating-feed" },
        { label: "Sinking Feed", href: "/products/sinking-feed" },
        { label: "Polyculture Feed", href: "/products/polyculture-feed" },
      ],
    },
    { label: "Gallery", href: "/gallery" },
    { label: "Our Branches", href: "/branches" },
  ] as { label: string; href: string; children?: { label: string; href: string }[] }[],
  navCta: { label: "Contact Us", href: "/contact" },

  hero: {
    eyebrow: "Rupa Feeds",
    title: "Nutrition That Moves With Your Pond",
    body: "Specialized fish feed designed for different feeding zones and aquaculture needs.",
    primaryCta: { label: "Explore Our Feeds", href: "#story-floating" },
    secondaryCta: { label: "Discover Rupa Feeds", href: "#why-rupa" },
    scrollHint: "Scroll to dive in",
  },

  dive: {
    title: "Below the surface",
    body: "Every pond has layers. Different fish feed at different depths — so the right feed has to reach the right zone.",
  },

  brandReturn: {
    title: "Feed With Purpose. Grow With Confidence.",
    body: "Three feeds. Three feeding zones. One partner for your pond.",
  },

  overview: {
    eyebrow: "Our feeds",
    title: "Choose the feed that fits your pond",
  },

  /** Placeholder "Why Rupa" points — replace with client-approved statements. */
  why: {
    eyebrow: "Why Rupa",
    title: "Built around how ponds actually feed",
    points: [
      {
        title: "Zone-based range",
        body: "Surface, deeper water and mixed fish + shrimp ponds each have a dedicated feed.",
      },
      {
        title: "Easy to observe",
        body: "Feeding behaviour you can see helps you judge quantities and timing.",
      },
      {
        title: "Farmer support",
        body: "Talk to our team about choosing the right feed for your pond. [Client to confirm]",
      },
    ],
  },

  finalCta: {
    title: "Discover the Right Feed for Your Aquaculture",
    body: "Tell us about your pond and we will help you choose between floating, sinking and polyculture feed.",
    button: { label: "Explore Products", href: "/products" },
    secondary: { label: "Contact Us", href: "/contact" },
  },

  footer: {
    note: "Prototype homepage — product copy, imagery and packaging are placeholders pending client assets.",
    contact: [
      { label: "Email", value: "hello@rupafeeds.example" },
      { label: "Phone", value: "+91 00000 00000" },
    ],
  },
};
