/**
 * PRODUCT DETAIL PAGES — content for /products/[slug]
 * ------------------------------------------------------------------
 * One entry per product; the page template (app/products/[slug]/page.tsx)
 * renders the same sections for each. All facts, figures, species lists and
 * benefit wording come from the previous website's product pages
 * (rupafeeds.shop/product-details). Do not add nutritional values, species
 * or claims here unless the client supplies them.
 */

export interface ProductDetail {
  slug: string;
  /** Short name used in headings, breadcrumbs and related-product cards. */
  name: string;
  image: string;
  imageAlt: string;
  tagline: string;
  intro: string;
  /** Short line used on the related-product cards of the other pages. */
  cardDescription: string;
  /** Headline figures shown beside the hero. */
  specs: { label: string; value: string }[];
  overview: { title: string; paragraphs: string[] };
  /** Optional formulations of the same feed (floating feed has two). */
  variants?: { title: string; items: { name: string; summary: string; points: string[] }[] };
  benefits: { title: string; items: { title: string; body?: string }[] };
  how: { title: string; intro: string; steps: { title: string; body: string }[] };
  species: { title: string; intro: string; list: string[]; note: string };
  why: { title: string; body: string; points: string[] };
}

export const productDetails: ProductDetail[] = [
  {
    slug: "floating-feeds",
    name: "Floating Feed",
    image: "/img/products/floating-bag.png",
    imageAlt: "RUPA Premium Floating Fish Feed bag",
    tagline: "Best Feed – Best Growth",
    intro:
      "A premium-quality floating aqua feed, specially formulated to provide balanced nutrition for healthy fish growth and improved farm performance.",
    cardDescription: "Premium floating fish feed that stays on the surface so feeding is easy to monitor.",
    specs: [
      { label: "Formulations", value: "28/5 · 24/4" },
      { label: "Protein", value: "28% / 24%" },
      { label: "Fat", value: "5% / 4%" },
      { label: "Feed type", value: "Floating pellet" },
    ],
    overview: {
      title: "Premium floating feed for freshwater fish farming",
      paragraphs: [
        "RUPA FEEDS Floating Fish Feed is a premium-quality floating aqua feed specially formulated to provide balanced nutrition for healthy fish growth and improved farm performance. It helps fish achieve faster weight gain, better feed conversion, and enhanced immunity.",
        "Most fish farmers prefer RUPA FEEDS because of its consistent quality, superior floating stability, and excellent growth results. Every pellet is designed to stay afloat longer, allowing farmers to monitor feeding activity and reduce feed wastage.",
      ],
    },
    variants: {
      title: "Available formulations",
      items: [
        {
          name: "RUPA FEEDS 28/5 Floating Feed",
          summary: "28% Protein and 5% Fat for faster weight gain, better feed conversion, and enhanced immunity.",
          points: [
            "28% Protein for faster growth",
            "5% Fat for higher energy and better weight gain",
            "Improves Feed Conversion Ratio (FCR)",
            "Suitable for freshwater fish farming",
          ],
        },
        {
          name: "RUPA FEEDS 24/4 Floating Feed",
          summary: "24% Protein and 4% Fat for balanced nutrition, healthy fish development, and maximum farm productivity.",
          points: [
            "24% Protein formula for faster and uniform growth",
            "4% Fat content for energy and better weight gain",
            "High digestibility for better Feed Conversion Ratio (FCR)",
            "Helps reduce feed wastage and improve water quality",
          ],
        },
      ],
    },
    benefits: {
      title: "Key benefits",
      items: [
        { title: "Faster growth performance" },
        { title: "Better weight gain" },
        { title: "Healthy fish development" },
        { title: "Improved feed efficiency" },
        { title: "Reduced feed waste" },
        { title: "Strong immune support" },
        { title: "Higher farm profitability" },
        { title: "Easy feeding management" },
      ],
    },
    how: {
      title: "How floating feed works",
      intro:
        "RUPA FEEDS Floating Feed is designed to float on the water surface, allowing fish to consume feed efficiently while enabling farmers to monitor feeding activity.",
      steps: [
        { title: "Stays on the surface", body: "Every pellet is designed to stay afloat longer, with superior floating stability." },
        { title: "Fish feed at the top", body: "Fish consume the feed efficiently from the water surface." },
        { title: "You see the feeding", body: "Farmers can monitor feeding activity and feed intake, which helps reduce feed wastage." },
      ],
    },
    species: {
      title: "Suitable species and applications",
      intro: "RUPA FEEDS 24/4 Floating Feed is suitable for a variety of freshwater fish species, including:",
      list: ["Rohu (Labeo rohita)", "Catla (Catla catla)", "Mrigal (Cirrhinus mrigala)", "Common Carp", "Grass Carp", "Silver Carp", "Tilapia", "Pangasius (Pangas Fish)", "Mixed Carp Culture"],
      note: "These species readily consume floating feed, helping farmers monitor feed intake and maintain efficient pond management.",
    },
    why: {
      title: "Why farmers trust RUPA FEEDS",
      body: "For years, RUPA FEEDS has been committed to delivering quality fish nutrition. Farmers choose RUPA FEEDS because of its consistent quality, reliable performance, and proven results in fish farming.",
      points: ["Consistent quality", "Reliable performance", "Quality nutrition for aquaculture success", "Designed for better growth, better health, and better profits"],
    },
  },

  {
    slug: "sinking-feeds",
    name: "Sinking Feed",
    image: "/img/products/sinking-bag.jpeg",
    imageAlt: "RUPA Sinking Fish Feed bag",
    tagline: "High performance feed for better fish growth",
    intro:
      "A scientifically formulated, high-quality sinking feed designed to provide balanced nutrition for freshwater fish farming.",
    cardDescription: "28% protein sinking feed for fish that feed in the middle and bottom layers of the pond.",
    specs: [
      { label: "Protein", value: "28%" },
      { label: "Feed type", value: "Sinking pellet" },
      { label: "Feeding zone", value: "Middle and bottom layers" },
      { label: "Farming", value: "Freshwater fish" },
    ],
    overview: {
      title: "Balanced nutrition that reaches deeper feeders",
      paragraphs: [
        "RUPA FEEDS Sinking Fish Feed is a scientifically formulated high-quality sinking feed designed to provide balanced nutrition for freshwater fish farming. With 28% Protein, this feed supports faster growth, better feed conversion ratio (FCR), stronger immunity, and improved farm profitability.",
        "Manufactured using premium-quality ingredients, RUPA FEEDS delivers the essential nutrients required for healthy fish development throughout the culture period.",
      ],
    },
    benefits: {
      title: "Key benefits",
      items: [
        { title: "Faster growth rate", body: "The high-quality protein and energy-rich ingredients help fish achieve their growth potential quickly." },
        { title: "Better feed utilization", body: "The carefully balanced formula improves feed efficiency, helping farmers get more fish growth from every kilogram of feed." },
        { title: "Reduced feed wastage", body: "The sinking pellets reach the feeding zone of bottom-feeding fish, ensuring better consumption and less wastage." },
        { title: "Improved fish health", body: "Enriched nutrients support stronger immunity and help fish remain healthy throughout the culture cycle." },
        { title: "Higher farm profitability", body: "Better growth, improved survival rates, and efficient feed utilization contribute to higher production and profits." },
        { title: "Uniform growth", body: "Balanced nutrition with essential vitamins and minerals promotes uniform growth across the pond." },
      ],
    },
    how: {
      title: "How sinking feed works",
      intro:
        "The sinking pellets gradually settle in the water, making them ideal for fish species that naturally feed in the middle and bottom layers of ponds.",
      steps: [
        { title: "Pellets settle gradually", body: "After feeding, the pellets gradually settle down through the water." },
        { title: "Reaches the feeding zone", body: "The feed reaches the middle and bottom layers, where these fish naturally feed." },
        { title: "Better consumption", body: "Feed arriving where the fish are ensures better consumption and less wastage." },
      ],
    },
    species: {
      title: "Suitable species and applications",
      intro: "RUPA FEEDS Sinking Feed is specially recommended for:",
      list: ["Rohu", "Catla", "Mrigal", "Common Carp", "Grass Carp", "Silver Carp", "Tilapia", "Pangasius", "White Fish", "Freshwater Mixed Culture Fish"],
      note: "These species naturally consume feed from the middle and bottom layers of ponds, making RUPA FEEDS Sinking Fish Feed an ideal choice for efficient feeding and better growth.",
    },
    why: {
      title: "Why farmers trust RUPA FEEDS",
      body: "RUPA FEEDS has become a trusted name among fish farmers because of its commitment to quality, consistency, and performance. Our goal is to provide the best fish feed, helping farmers achieve maximum growth, better survival rates, and higher yields.",
      points: ["High protein formula (28%)", "Premium-quality ingredients", "High digestibility", "Cost-effective feeding solution for farmers"],
    },
  },

  {
    slug: "poly-culture-feeds",
    name: "Polyculture Feed",
    image: "/img/products/polyculture-bag.png",
    imageAlt: "RUPA Poly Culture Feed bag",
    tagline: "Premium nutrition for better growth and higher yield",
    intro:
      "A specially formulated premium-quality feed designed for modern polyculture fish farming systems.",
    cardDescription: "30–32% protein feed formulated for modern polyculture farming systems.",
    specs: [
      { label: "Protein", value: "30–32%" },
      { label: "Feed sizes", value: "1.2 · 1.6 · 1.8 mm" },
      { label: "Packing", value: "25 kg bag" },
      { label: "Farming", value: "Polyculture systems" },
    ],
    overview: {
      title: "Advanced nutrition for polyculture farming",
      paragraphs: [
        "RUPA Poly Culture Feed is a specially formulated premium-quality feed designed for modern polyculture fish farming systems. With 30–32% high-quality protein, this feed supports faster growth, better feed conversion, improved health, and enhanced survival rates of cultured fish and shrimp species.",
        "Manufactured with carefully selected ingredients and strict quality standards, RUPA Poly Culture Feed provides balanced nutrition for maximum farm productivity and profitability.",
      ],
    },
    benefits: {
      title: "Key benefits",
      items: [
        { title: "Better feed efficiency" },
        { title: "Faster growth performance" },
        { title: "Improved fish health" },
        { title: "Enhanced survival rate" },
        { title: "Reduced feed wastage" },
        { title: "Better water stability" },
        { title: "Higher harvest yield" },
        { title: "Increased farm profitability" },
      ],
    },
    how: {
      title: "How polyculture feed works",
      intro:
        "One balanced 30–32% protein formulation, offered in three pellet sizes designed to meet the nutritional requirements of different growth stages in polyculture farming.",
      steps: [
        { title: "Pick the size for the stage", body: "Available in 1.2 mm, 1.6 mm and 1.8 mm feed sizes for different growth stages." },
        { title: "Balanced protein formula", body: "The 30–32% protein formulation supports faster growth, better muscle development and improved survival rate." },
        { title: "Easy feeding management", body: "The 25 kg packing ensures easy handling, storage, transportation, and efficient feeding management." },
      ],
    },
    species: {
      title: "Suitable species and applications",
      intro: "RUPA Poly Culture Feed is ideal for:",
      list: ["Rohu", "Catla", "Mrigal", "Common Carp", "Grass Carp", "Silver Carp", "Pangasius", "Tilapia", "Mixed Fish Culture Systems"],
      note: "The feed is formulated for polyculture systems and supports the growth, health and survival of cultured fish and shrimp species.",
    },
    why: {
      title: "Why farmers trust RUPA FEEDS",
      body: "Farmers choose RUPA Feeds because of its commitment to quality nutrition, consistent performance, and reliable results. RUPA Poly Culture Feed is produced under strict quality control standards and backed by quality certifications.",
      points: ["Premium quality ingredients", "Scientifically formulated nutrition", "Consistent pellet quality", "Strict quality control standards"],
    },
  },
];

export const getProductDetail = (slug: string) => productDetails.find((p) => p.slug === slug);
