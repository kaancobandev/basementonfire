import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
export const refs: BibItem[] = [
  { title: "Satellite-sized planetesimals and lunar origin (Dev Çarpışma)", authors: "W. K. Hartmann & D. R. Davis", year: "1975", source: "Icarus 24, 504" },
  { title: "Simulations of a late lunar-forming impact", authors: "R. M. Canup", year: "2004", source: "Icarus 168, 433" },
  { title: "Moon-forming impactor as a source of Earth's basal mantle anomalies (Theia & LLSVP)", authors: "Q. Yuan ve ark.", year: "2023", source: "Nature 623, 95" },
  { title: "The World Magnetic Model (WMM)", source: "NOAA NCEI / British Geological Survey", url: "https://www.ncei.noaa.gov/products/world-magnetic-model" },
  { title: "Inside the Earth — structure & plate tectonics", source: "USGS", url: "https://www.usgs.gov/" },
  { title: "Structure of the Earth", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Structure_of_the_Earth" },
  { title: "Giant-impact hypothesis", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Giant-impact_hypothesis" },
];
