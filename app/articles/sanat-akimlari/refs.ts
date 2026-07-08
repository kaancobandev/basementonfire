import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
// Kullanıcının önerdiği kaynak listesinden.
export const refs: BibItem[] = [
  { title: "Sanatın Öyküsü (kolay, klasik başlangıç)", authors: "E. H. Gombrich", year: "1950", source: "Phaidon / Remzi" },
  { title: "Dünya Sanat Tarihi (daha eleştirel omurga)", authors: "Hugh Honour & John Fleming", year: "1982", source: "Laurence King" },
  { title: "The Shock of the New / Yeni Olanın Şoku (modernizm)", authors: "Robert Hughes", year: "1980", source: "BBC / Thames & Hudson" },
  { title: "Sanatın Toplumsal Tarihi", authors: "Arnold Hauser", year: "1951", source: "Routledge" },
  { title: "Görme Biçimleri (Ways of Seeing)", authors: "John Berger", year: "1972", source: "Penguin / BBC" },
  { title: "Art in Theory 1900–2000 (manifesto/belge derlemesi)", authors: "Charles Harrison & Paul Wood", year: "2003", source: "Blackwell" },
  { title: "Why Have There Been No Great Women Artists? (feminist yeniden okuma)", authors: "Linda Nochlin", year: "1971", source: "ARTnews" },
  { title: "Çağdaş Türk Sanatı", authors: "Sezer Tansuğ", year: "1986", source: "Remzi Kitabevi" },
  { title: "Art in China (Batı-dışı)", authors: "Craig Clunas", year: "1997", source: "Oxford University Press" },
];
