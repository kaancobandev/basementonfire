import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
export const refs: BibItem[] = [
  { title: "Philosophiæ Naturalis Principia Mathematica (üç hareket yasası)", authors: "Isaac Newton", year: "1687", source: "Royal Society" },
  { title: "The Feynman Lectures on Physics, Vol. I — Mekanik", authors: "Richard P. Feynman", year: "1963", source: "Addison-Wesley" },
  { title: "Fundamentals of Physics (temel mekanik kavramları)", authors: "Halliday, Resnick & Walker", year: "2013", source: "Wiley (10. baskı)" },
  { title: "Physics for Scientists and Engineers", authors: "Raymond A. Serway & John W. Jewett", year: "2018", source: "Cengage (10. baskı)" },
  { title: "SI Broşürü — newton (N), joule (J), watt (W) birim tanımları", authors: "BIPM", year: "2019", source: "Uluslararası Ölçü ve Tartılar Bürosu", url: "https://www.bipm.org/en/publications/si-brochure" },
  { title: "Newton's laws of motion", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion" },
  { title: "Momentum", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Momentum" },
  { title: "Force / Kuvvet", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Force" },
];
