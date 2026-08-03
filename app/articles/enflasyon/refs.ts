// Kaynakça — DÜZ modül ('use client' YOK).
// page.tsx'teki articleJsonLd({ citation }) bunu okur; EnflasyonClient de aynı
// diziyi ArticleBibliography'ye verir. Client dosyasına taşınırsa sunucu
// tarafı onu istemci-referansı olarak görür ve .map() patlar.
import type { BibItem } from '@/app/components/ArticleBibliography';

export const refs: BibItem[] = [
  {
    title: 'Tüketici Fiyat Endeksi, Temmuz 2026',
    authors: 'TÜİK',
    year: '2026',
    source: 'Türkiye İstatistik Kurumu — Veri Portalı',
    url: 'https://veriportali.tuik.gov.tr/tr/press/58289',
  },
  {
    title: 'Tüketici Fiyat Endeksi Metodoloji Dokümanı 2026',
    authors: 'TÜİK',
    year: '2026',
    source: 'Türkiye İstatistik Kurumu',
    url: 'https://data.tuik.gov.tr/Kategori/GetKategori?p=Enflasyon-ve-Fiyat-106',
  },
  {
    title: '2026 Yılı Tüketici Fiyat Endeksindeki Güncellemeler ve Etkileri',
    source: 'TCMB Blog — Türkiye Cumhuriyet Merkez Bankası',
    year: '2026',
    url: 'https://tcmbblog.org/wps/wcm/connect/blog/tr/main+menu/analizler/2026+yili+tuketici+fiyat+endeksindeki+guncellemeler+ve+etkileri',
  },
  {
    title: 'TÜİK enflasyon sepetini güncelledi',
    source: 'Anadolu Ajansı',
    year: '2026',
    url: 'https://www.aa.com.tr/tr/ekonomi/tuik-enflasyon-sepetini-guncelledi/3818678',
  },
  {
    title: 'Ekim 2022 Enflasyon Verileri',
    source: 'T.C. Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı',
    year: '2022',
    url: 'https://www.sbb.gov.tr/ekim-2022-enflasyon-verileri/',
  },
  {
    title: "Osmanlı'da Enflasyon",
    source: 'Sarkaç — Bilim Akademisi',
    year: '2019',
    url: 'https://sarkac.org/2019/06/osmanlida-enflasyon/',
  },
  {
    title: 'Inflation in Ancient Rome',
    source: 'UNRV Roman History',
    url: 'https://www.unrv.com/economy/inflation.php',
  },
  {
    title: "Diocletian's Edict on Maximum Prices (Edictum de Pretiis Rerum Venalium, 301)",
    source: 'UNRV Roman History',
    url: 'https://www.unrv.com/economy/edict-on-maximum-prices.php',
  },
  {
    title: 'The Hungarian Pengő Hyperinflation, 1945–1946',
    source: 'Market Histories',
    url: 'https://www.markethistories.com/en/the-hungarian-pengo-hyperinflation-the-worst-monetary-collapse-in-history-1945-1946',
  },
];
