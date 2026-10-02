/**
 * CENTRAL PRODUCT CONTENT
 * ------------------------------------------------------------------
 * All product copy lives here so the client can edit text, features and
 * imagery without touching any 3D or animation code.
 *
 * NOTE: Feature bullets are deliberately behavioural (where the feed sits in
 * the water) — no nutritional or scientific claims have been invented.
 * Replace / extend with client-approved copy only.
 *
 * `packagingTexture`: drop the real bag artwork (front face, ~1024x1400 JPG/PNG/WebP)
 * into /public/packaging and point to it here. When the file is missing the
 * 3D bag falls back to a clearly-labelled placeholder texture.
 */

export type ProductId = "floating" | "sinking" | "polyculture";

export interface Product {
  id: ProductId;
  name: string;
  /** Short label for the water zone this feed serves. */
  zone: string;
  tagline: string;
  description: string;
  cardDescription: string;
  features: string[];
  /** Optional chips rendered under the story panel (e.g. FISH + SHRIMP). */
  indicators?: string[];
  href: string;
  /** Real packaging artwork (front face). null => placeholder is generated. */
  packagingTexture: string | null;
  /** Accent used for the placeholder bag + small UI highlights. */
  accent: string;
}

export const products: Record<ProductId, Product> = {
  floating: {
    id: "floating",
    name: "Floating Feed",
    zone: "Water surface",
    tagline: "Stays on top. Feeding you can see.",
    description: "Designed to remain on the water surface for easy feeding observation.",
    cardDescription: "Pellets stay on the surface so you can watch your fish feed.",
    features: [
      "High visibility feeding",
      "Easy feeding observation",
      "Designed for surface-feeding fish",
      "Consistent pellet performance",
    ],
    href: "/products/floating-feed",
    packagingTexture: null, // e.g. "/packaging/floating-feed-front.jpg"
    accent: "#C8913A",
  },
  sinking: {
    id: "sinking",
    name: "Sinking Feed",
    zone: "Water column to bottom",
    tagline: "Goes where deeper feeders are.",
    description: "Designed to descend through the water column for deeper feeding zones.",
    cardDescription: "Pellets travel down through the water to reach deeper feeders.",
    features: [
      "Designed for deeper feeding",
      "Controlled sinking behaviour",
      "Suitable for bottom / deeper feeding fish",
    ],
    href: "/products/sinking-feed",
    packagingTexture: null, // e.g. "/packaging/sinking-feed-front.jpg"
    accent: "#3E7F6E",
  },
  polyculture: {
    id: "polyculture",
    name: "Polyculture Feed",
    zone: "Shared feeding zone",
    tagline: "One feed for a mixed pond.",
    description: "Designed for aquaculture environments where fish and shrimp are raised together.",
    cardDescription: "Made for ponds where fish and shrimp are raised together.",
    features: [
      "Made for mixed fish + shrimp ponds",
      "Works with dedicated feeding areas",
      "Reaches the bottom where shrimp feed",
    ],
    indicators: ["Fish", "Shrimp"],
    href: "/products/polyculture-feed",
    packagingTexture: null, // e.g. "/packaging/polyculture-feed-front.jpg"
    accent: "#8E6220",
  },
};

export const productList: Product[] = [products.floating, products.sinking, products.polyculture];
