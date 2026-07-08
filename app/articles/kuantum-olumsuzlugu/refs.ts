import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
export const refs: BibItem[] = [
  { title: "Die gegenwärtige Situation in der Quantenmechanik (Schrödinger'in kedisi)", authors: "Erwin Schrödinger", year: "1935", source: "Naturwissenschaften 23" },
  { title: "'Relative State' Formulation of Quantum Mechanics (Çok Dünyalı Yorum)", authors: "Hugh Everett III", year: "1957", source: "Reviews of Modern Physics 29, 454" },
  { title: "The Mystery of the Quantum World (kuantum intiharının ilk izi)", authors: "Euan J. Squires", year: "1986", source: "Adam Hilger" },
  { title: "Kuantum intiharı düşünce deneyi (bağımsız öneriler)", authors: "Hans Moravec (1987) & Bruno Marchal (1988)", year: "1987–88", source: "Mind Children / doktora tezi" },
  { title: "The Interpretation of Quantum Mechanics: Many Worlds or Many Words?", authors: "Max Tegmark", year: "1998", source: "Fortschritte der Physik 46, 855" },
  { title: "What is it like to be Schrödinger's cat?", authors: "Peter J. Lewis", year: "2000", source: "Analysis 60(1), 22" },
  { title: "How Many Lives Has Schrödinger's Cat?", authors: "David Lewis", year: "2001 (yayın 2004)", source: "Australasian Journal of Philosophy 82(1)" },
  { title: "Mobius (roman)", authors: "Adam Fawer", year: "2024", source: "çev. Algan Sezgintüredi · April Yayıncılık" },
  { title: "Quantum suicide and immortality", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Quantum_suicide_and_immortality" },
];
