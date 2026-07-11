import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
// Çok-ajanlı araştırma turunda erişilebilirlik için URL'ler kontrol edildi.
export const refs: BibItem[] = [
  { title: 'Göbekli Tepe — The First 20 Years of Research', authors: 'Göbekli Tepe Kazı Projesi (DAI)', year: '2016', source: 'Tepe Telegrams — Alman Arkeoloji Enstitüsü resmî blogu', url: 'https://www.dainst.blog/the-tepe-telegrams/2016/06/02/gobekli-tepe-the-first-20-years-of-research/' },
  { title: 'Gobekli Tepe: The World’s First Temple?', authors: 'Andrew Curry', year: '2008', source: 'Smithsonian Magazine', url: 'https://www.smithsonianmag.com/history/gobekli-tepe-the-worlds-first-temple-83613665/' },
  { title: 'Sie bauten die ersten Tempel (İlk tapınakları onlar inşa etti)', authors: 'Klaus Schmidt', year: '2006', source: 'C. H. Beck, München' },
  { title: 'Establishing a Radiocarbon Sequence for Göbekli Tepe', authors: 'O. Dietrich, J. Notroff, K. Schmidt ve ark.', year: '2013', source: 'Antiquity 87(336), 674', url: 'https://www.researchgate.net/publication/257961716_Establishing_a_Radiocarbon_Sequence_for_Gobekli_Tepe_State_of_Research_and_New_Data' },
  { title: 'So Fair a House: Göbekli Tepe and the Identification of Temples in the PPN Near East', authors: 'E. B. Banning', year: '2011', source: 'Current Anthropology 52(5), 619', url: 'https://www.journals.uchicago.edu/doi/10.1086/661207' },
  { title: 'Modified Human Crania from Göbekli Tepe Provide Evidence for a New Form of Neolithic Skull Cult', authors: 'J. Gresky, J. Haelm, L. Clare', year: '2017', source: 'Science Advances 3(6), e1700564', url: 'https://www.science.org/doi/10.1126/sciadv.1700564' },
  { title: 'Animals in the Symbolic World of Pre-Pottery Neolithic Göbekli Tepe', authors: 'J. Peters & K. Schmidt', year: '2004', source: 'Anthropozoologica 39(1), 179' },
  { title: 'More than a Vulture: A Response to Sweatman and Tsikritsis (kuyruklu yıldız hipotezinin çürütülmesi)', authors: 'J. Notroff, O. Dietrich ve ark.', year: '2017', source: 'Tepe Telegrams (DAI)', url: 'https://www.dainst.blog/the-tepe-telegrams/2017/07/03/more-than-a-vulture-a-response-to-sweatman-and-tsikritsis/' },
  { title: 'How Did They Do It? Making and Moving Monoliths at Göbekli Tepe', authors: 'Göbekli Tepe Kazı Projesi (DAI)', year: '2016', source: 'Tepe Telegrams', url: 'https://www.dainst.blog/the-tepe-telegrams/2016/05/03/how-did-they-do-it-making-and-moving-monoliths-at-gobekli-tepe/' },
  { title: 'Göbekli Tepe — Dünya Mirası Listesi No. 1572', authors: 'UNESCO Dünya Mirası Merkezi', year: '2018', source: 'whc.unesco.org', url: 'https://whc.unesco.org/en/list/1572' },
  { title: 'Karahantepe (Taş Tepeler projesi)', authors: 'T.C. Kültür ve Turizm Bakanlığı', year: '2024', source: 'tastepeler.org', url: 'https://tastepeler.org/en/yerlesmeler/karahantepe' },
  { title: 'Göbekli Tepe', authors: 'Encyclopædia Britannica', source: 'britannica.com', url: 'https://www.britannica.com/place/Gobekli-Tepe' },
];
