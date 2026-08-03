// Kaynakça — DÜZ modül ('use client' YOK). page.tsx'teki articleJsonLd citation'ı
// bunu okur; Client de aynı diziyi ArticleBibliography'ye verir.
import type { BibItem } from '@/app/components/ArticleBibliography';

export const refs: BibItem[] = [
  {
    title: 'Where Mendeleev was wrong: predicted elements that have never been found',
    authors: 'Gábor Lente', year: '2019', source: 'ChemTexts 5:17 (açık erişim)',
    url: 'https://doi.org/10.1007/s40828-019-0092-5',
  },
  {
    title: 'How Mendeleev issued his predictions',
    authors: 'Campbell & Pulkkinen', year: '2020', source: 'Foundations of Chemistry',
    url: 'https://discovery.ucl.ac.uk/id/eprint/10101909/',
  },
  {
    title: 'Provisional Report on Discussions on Group 3 of the Periodic Table',
    authors: 'Eric Scerri', year: '2021', source: 'Chemistry International 43(1), 31–34',
    url: 'https://doi.org/10.1515/ci-2021-0115',
  },
  {
    title: 'Oganesson: A Noble Gas Element That Is Neither Noble Nor a Gas',
    authors: 'Smits, Düllmann, Indelicato, Nazarewicz, Schwerdtfeger', year: '2020',
    source: 'Angewandte Chemie International Edition',
    url: 'https://doi.org/10.1002/anie.202011976',
  },
  {
    title: 'Relativity and the Lead-Acid Battery',
    authors: 'Ahuja, Blomqvist, Larsson, Pyykkö, Zaleski-Ejgierd', year: '2011',
    source: 'Physical Review Letters 106, 018301',
    url: 'https://doi.org/10.1103/PhysRevLett.106.018301',
  },
  {
    title: 'A suggested periodic table up to Z ≤ 172, based on Dirac–Fock calculations',
    authors: 'Pekka Pyykkö', year: '2011', source: 'Physical Chemistry Chemical Physics 13, 161',
    url: 'https://doi.org/10.1039/C0CP01575J',
  },
  {
    title: 'Observation of the heaviest nuclide produced with a 50Ti beam (livermoryum-290)',
    year: '2024', source: 'Physical Review Letters 133, 172502',
    url: 'https://doi.org/10.1103/PhysRevLett.133.172502',
  },
  {
    title: 'Periodic Table of Elements (veri kaynağı)',
    source: 'PubChem — NCBI / U.S. National Library of Medicine · kamu malı',
    url: 'https://pubchem.ncbi.nlm.nih.gov/periodic-table/',
  },
  {
    title: 'On the Relation of the Properties to the Atomic Weights of the Elements',
    authors: 'D. Mendelejeff', year: '1869', source: 'Zeitschrift für Chemie 12, 405–406 (İngilizce çeviri)',
    url: 'https://web.lemoyne.edu/~giunta/ea/mendeleevann.html',
  },
  {
    title: 'IUPAC Periodic Table of the Elements — güncel adlandırma',
    source: 'International Union of Pure and Applied Chemistry',
    url: 'https://iupac.org/what-we-do/periodic-table-of-elements/',
  },
];
