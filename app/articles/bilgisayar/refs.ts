import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
export const refs: BibItem[] = [
  { title: "Code: The Hidden Language of Computer Hardware and Software", authors: "Charles Petzold", year: "2022", source: "Microsoft Press (2. baskı)" },
  { title: "How Computers Work: The Evolution of Technology", authors: "Ron White & Tim Downs", year: "2014", source: "Que Publishing" },
  { title: "But How Do It Know? — The Basic Principles of Computers", authors: "J. Clark Scott", year: "2009", source: "John C. Scott" },
  { title: "Crash Course Computer Science", authors: "Carrie Anne Philbin / PBS", source: "YouTube", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo" },
  { title: "Central processing unit", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Central_processing_unit" },
  { title: "Dynamic random-access memory (DRAM)", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Dynamic_random-access_memory" },
  { title: "Liquid-crystal display (LCD)", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Liquid-crystal_display" },
];
