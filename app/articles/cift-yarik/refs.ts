import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
export const refs: BibItem[] = [
  { title: "The Feynman Lectures on Physics, Vol. III: Quantum Mechanics", authors: "Richard P. Feynman", year: "1965", source: "Addison-Wesley (Bölüm 1: Çift yarık)" },
  { title: "Experiments and Calculations Relative to Physical Optics (Bakerian Lecture)", authors: "Thomas Young", year: "1804", source: "Philosophical Transactions of the Royal Society" },
  { title: "Recherches sur la théorie des quanta (madde dalgaları tezi, λ = h/p)", authors: "Louis de Broglie", year: "1924", source: "Doktora tezi, Paris" },
  { title: "Diffraction of Electrons by a Crystal of Nickel", authors: "C. Davisson & L. H. Germer", year: "1927", source: "Physical Review 30, 705" },
  { title: "Demonstration of single-electron buildup of an interference pattern", authors: "A. Tonomura, J. Endo, T. Matsuda et al. (Hitachi)", year: "1989", source: "American Journal of Physics 57, 117" },
  { title: "Wave–particle duality of C60 molecules (buckyball girişimi)", authors: "M. Arndt, A. Zeilinger et al.", year: "1999", source: "Nature 401, 680" },
  { title: "Quantum superposition of molecules beyond 25 kDa (2000+ atom)", authors: "Y. Y. Fein, M. Arndt et al.", year: "2019", source: "Nature Physics 15, 1242" },
  { title: "Double-slit experiment", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Double-slit_experiment" },
  { title: "The most beautiful experiment (okur anketi)", authors: "Physics World", year: "2002", source: "Physics World, Eylül 2002" },
];
