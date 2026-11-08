/**
 * GALLERY — content and image list for /gallery.
 * Images are stored in /public/img/gallery/ so they load fast and offline.
 * Replace any image in public/img/gallery/ or change paths below when real farm photos are ready.
 */

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
  colSpanDesktop: "md:col-span-1" | "md:col-span-2";
  row: 1 | 2 | 3;
}

export const galleryPage = {
  hero: {
    eyebrow: "Visual Journey",
    title: "Life in Aquaculture: Our Ponds, Feeds & Farmers",
    body: "Explore moments from our advanced feed manufacturing facilities, thriving pond ecosystems, hardworking farmers, and our daily commitment to aquaculture excellence.",
  },
};

export const galleryImages: GalleryImage[] = [
  // Row 1: Left wide (2 cols), Right 1 col
  {
    id: "g-1",
    title: "Vibrant Pond Ecosystem at Dusk",
    category: "Ecosystem",
    src: "/img/gallery/gallery-1.jpg",
    alt: "Scenic sunset light reflecting across freshwater aquaculture lands",
    colSpanDesktop: "md:col-span-2",
    row: 1,
  },
  {
    id: "g-2",
    title: "Field Inspection & Farm Trails",
    category: "Operations",
    src: "/img/gallery/gallery-2.jpg",
    alt: "Field technician visiting inland aquaculture ponds along countryside trails",
    colSpanDesktop: "md:col-span-1",
    row: 1,
  },

  // Row 2: 3 equal columns (1 col each)
  {
    id: "g-3",
    title: "Lakeside Rearing & Water Management",
    category: "Aquaculture",
    src: "/img/gallery/gallery-3.jpg",
    alt: "Lakeside aquaculture station with clear clean water bodies",
    colSpanDesktop: "md:col-span-1",
    row: 2,
  },
  {
    id: "g-4",
    title: "Precision Feed Production Pathways",
    category: "Manufacturing",
    src: "/img/gallery/gallery-4.jpg",
    alt: "Sunlight shining along transport roads connecting feed distribution centers",
    colSpanDesktop: "md:col-span-1",
    row: 2,
  },
  {
    id: "g-5",
    title: "Coastal Hatcheries & Brackish Water Farms",
    category: "Coastal Farming",
    src: "/img/gallery/gallery-5.jpg",
    alt: "Coastal water zones where specialized shrimp feeds are monitored",
    colSpanDesktop: "md:col-span-1",
    row: 2,
  },

  // Row 3: Left 1 col, Right wide (2 cols)
  {
    id: "g-6",
    title: "Natural Water Reservoirs & Mist",
    category: "Environment",
    src: "/img/gallery/gallery-6.jpg",
    alt: "Fresh mountain source waters feeding downstream pond channels",
    colSpanDesktop: "md:col-span-1",
    row: 3,
  },
  {
    id: "g-7",
    title: "Expansive Pond Landscapes at Horizon",
    category: "Growth & Harvest",
    src: "/img/gallery/gallery-7.jpg",
    alt: "Wide horizon panorama of Indian aquaculture farming grounds",
    colSpanDesktop: "md:col-span-2",
    row: 3,
  },
];

