/**
 * ABOUT US PAGE CONTENT
 * ------------------------------------------------------------------
 * Text is carried over from the previous website's About page
 * (rupafeeds.shop/about). Edit here; the page layout reads from this file.
 *
 * Images: every `image` is null for now, which renders a labelled
 * placeholder block. Drop the real file into /public/img/about/ and set the
 * path (e.g. "/img/about/harvest.jpg") — nothing else needs to change.
 */
export const about = {
  hero: {
    eyebrow: "About us",
    title: "About Rupa Feeds",
    body: "A fast-growing aquaculture nutrition company committed to delivering high-quality fish feed solutions that help farmers achieve higher productivity and profitability.",
    image: null as string | null,
    imageLabel: "Hero image",
  },

  intro: {
    eyebrow: "Who we are",
    title: "Nutrition built for Indian aquaculture",
    paragraphs: [
      "Established with a vision to support the Indian aquaculture industry, we specialize in scientifically formulated floating and sinking fish feeds designed to promote faster growth, superior feed conversion, stronger immunity, and sustainable farming practices.",
      "At RUPA FEEDS, we combine modern nutritional science, quality raw materials, and advanced manufacturing processes to produce feeds that meet the specific requirements of different fish species and growth stages. Every product is carefully developed to provide balanced nutrition, ensuring optimal growth performance and healthier aquatic animals.",
      "Our commitment extends beyond feed manufacturing. We work closely with fish farmers, dealers, and aquaculture professionals by providing technical guidance, feeding recommendations, and farm management support. This farmer-first approach has helped us build long-term relationships and trust across the industry.",
    ],
    image: null as string | null,
    imageLabel: "Farm / harvest photo",
  },

  why: {
    title: "Why farmers choose RUPA FEEDS",
    points: [
      "Premium quality ingredients and strict quality control",
      "Scientifically balanced nutrition for better growth",
      "Improved Feed Conversion Ratio (FCR)",
      "Enhanced immunity and survival rates",
      "Reliable dealer network and customer support",
      "Sustainable and farmer-focused solutions",
    ],
    closing:
      "Today, RUPA FEEDS continues to expand its presence across India, helping farmers maximize productivity while contributing to the growth of the aquaculture sector.",
    motto: "Our mission is simple: Deliver Superior Nutrition for Better Growth, Better Harvests, and Better Profits.",
  },

  purpose: {
    /** Optional background photo behind the two cards. */
    image: null as string | null,
    mission: {
      title: "Our Mission",
      body: "To empower fish farmers with high-quality nutrition that ensures healthy fish growth and maximum returns.",
    },
    vision: {
      title: "Our Vision",
      body: "To become India's most trusted aquaculture feed brand through innovation, quality, and customer satisfaction.",
    },
  },

  /**
   * The previous site had this heading with no entries under it. Add
   * { year, title, body } items here and the timeline renders automatically.
   */
  journey: {
    title: "Our Journey",
    milestones: [] as { year: string; title: string; body: string }[],
    emptyNote: "Company milestones will be added here.",
  },

  values: {
    title: "Our Core Values",
    items: [
      {
        icon: "trophy",
        title: "Quality First",
        body: "We never compromise on the quality of our feed formulations and manufacturing processes.",
      },
      {
        icon: "handshake",
        title: "Farmer Partnership",
        body: "Building long-term relationships with farmers through trust and on-site support.",
      },
      {
        icon: "bulb",
        title: "Innovation",
        body: "Continuously improving our products through research and empirical studies.",
      },
    ] as { icon: "trophy" | "handshake" | "bulb"; title: string; body: string }[],
  },

  /** On the previous site this section only carried the social links. */
  csr: {
    title: "Corporate Social Responsibility",
    body: "Follow our work with farmers and the aquaculture community.",
    links: [
      { label: "Facebook", href: "https://www.facebook.com/Rupafeeds/" },
      { label: "X (Twitter)", href: "https://x.com/RUPA_PELLETS" },
      { label: "Instagram", href: "https://www.instagram.com/rupa_feeds/?hl=en" },
      { label: "YouTube", href: "https://www.youtube.com/@RUPAFEEDS" },
      { label: "WhatsApp", href: "https://wa.me/919440431234" },
    ],
  },

  certifications: {
    title: "Certifications",
    body: "RUPA FEEDS is a trusted manufacturer of premium fish feed and aquaculture nutrition solutions. Scientifically formulated floating, sinking and polyculture feeds for faster growth, better FCR, improved immunity, and higher farmer profits.",
    items: [
      { name: "GMP Certified", detail: "Good Manufacturing Practice", image: '/img/certified/gmp.jpg' },
      { name: "HACCP Certified", detail: "Hazard Analysis and Critical Control Points", image: '/img/certified/haccp.jpg' },
      { name: "ISO 9001:2015", detail: "Certified company", image: '/img/certified/iso.jpg' },
      { name: "Halal India", detail: "Halal certified", image: '/img/certified/halal.png' },
    ] as { name: string; detail: string; image: string | null }[],
  },

  testimonials: {
    title: "What Our Customers Say",
    body: "Read testimonials from satisfied customers.",
    items: [
      {
        name: "Ravi Kumar",
        place: "Secunderabad",
        quote:
          "Since switching to RUPA FEEDS Floating Fish Feed, fish growth has been consistent and feed conversion has improved. The floating pellets reduce wastage and help me monitor feeding easily.",
      },
      {
        name: "Suresh Reddy",
        place: "Hyderabad",
        quote:
          "Very good quality fish feed. My fish actively consume the feed, and water quality remains better compared to many other feeds.",
      },
      {
        name: "Mahesh",
        place: "Hyderabad",
        quote:
          "RUPA FEEDS 28% Protein, 5% Fat Floating Feed gives excellent results. Growth rate and fish health have improved significantly.",
      },
      {
        name: "Prasad Rao",
        place: "",
        quote: "Reliable quality in every bag. The feed floats well and helps reduce feed loss, which saves money for farmers.",
      },
      {
        name: "Ramesh",
        place: "",
        quote:
          "I have been using RUPA FEEDS for several culture cycles. Consistent quality and good customer support make it my preferred choice.",
      },
      {
        name: "Srinivas Yadav",
        place: "",
        quote: "Excellent floating fish feed with balanced nutrition. Fish show healthy growth and good weight gain.",
      },
    ],
  },
};
