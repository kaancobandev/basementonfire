import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; hem widgets.tsx (Client) hem page.tsx
// (Server, JSON-LD citation) buradan import eder. Tek kaynak.
export const refs: BibItem[] = [
  { title: "Philosophiæ Naturalis Principia Mathematica", authors: "Isaac Newton", year: "1687", source: "Londra (Royal Society)" },
  { title: "Never at Rest: A Biography of Isaac Newton", authors: "Richard S. Westfall", year: "1980", source: "Cambridge University Press" },
  { title: "Newton, the Man", authors: "John Maynard Keynes", year: "1946", source: "Royal Society Newton Tercentenary" },
  { title: "Memoirs of Sir Isaac Newton's Life (elma hikâyesi)", authors: "William Stukeley", year: "1752", source: "Royal Society MS/142" },
  { title: "Isaac Newton", source: "Stanford Encyclopedia of Philosophy", url: "https://plato.stanford.edu/entries/newton/" },
  { title: "Isaac Newton", source: "Wikipedia", url: "https://tr.wikipedia.org/wiki/Isaac_Newton" },
  { title: "South Sea Bubble (1720)", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/South_Sea_Bubble" },
];
