import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
export const refs: BibItem[] = [
  { title: "SI Broşürü (9. baskı): mol'ün 2019 yeniden tanımı — 6,02214076 × 10²³", authors: "BIPM", year: "2019", source: "Uluslararası Ölçü ve Tartılar Bürosu", url: "https://www.bipm.org/en/publications/si-brochure" },
  { title: "Masses des molécules des corps (eşit hacim–eşit molekül hipotezi)", authors: "Amedeo Avogadro", year: "1811", source: "Journal de Physique 73" },
  { title: "Sunto di un corso di filosofia chimica (Karlsruhe, atom kütleleri)", authors: "Stanislao Cannizzaro", year: "1858–1860", source: "Il Nuovo Cimento / Karlsruhe Kongresi" },
  { title: "Les Atomes (Brown hareketi ile Avogadro sayısı; 1926 Nobel)", authors: "Jean Perrin", year: "1913", source: "Félix Alcan" },
  { title: "The Avogadro Project — silikon-28 küresiyle atom sayımı", authors: "PTB / NMIJ / NIST konsorsiyumu", source: "Metrologia", url: "https://en.wikipedia.org/wiki/Avogadro_constant" },
  { title: "General Chemistry: Principles and Modern Applications (mol, stokiyometri)", authors: "Petrucci, Herring, Madura, Bissonnette", year: "2017", source: "Pearson (11. baskı)" },
  { title: "Mole (unit)", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mole_(unit)" },
  { title: "Avogadro constant", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Avogadro_constant" },
];
