import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
export const refs: BibItem[] = [
  { title: 'On the Origin of Species by Means of Natural Selection', authors: 'Charles Darwin', year: '1859', source: 'John Murray, Londra' },
  { title: 'On the Tendency of Species to form Varieties (Darwin–Wallace ortak bildirisi)', authors: 'C. Darwin & A. R. Wallace', year: '1858', source: 'J. Proc. Linnean Society (Zoology) 3, 45' },
  { title: '40 Years of Evolution: Darwin’s Finches on Daphne Major Island', authors: 'P. R. Grant & B. R. Grant', year: '2014', source: 'Princeton University Press' },
  { title: 'The industrial melanism mutation in British peppered moths is a transposable element', authors: 'A. E. van’t Hof ve ark.', year: '2016', source: 'Nature 534, 102' },
  { title: 'Understanding Evolution — Natural selection', source: 'UC Berkeley', url: 'https://evolution.berkeley.edu/evolution-101/mechanisms-the-processes-of-evolution/natural-selection/' },
  { title: 'Natural selection', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Natural_selection' },
];
