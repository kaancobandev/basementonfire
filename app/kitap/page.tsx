import type { Metadata } from 'next';
import { ARTICLES } from '@/lib/articles';
import KitapClient from './KitapClient';

// ════════════════════════════════════════════════════════════════════════
// /kitap — 32 makalenin KİTAP görünümlü kataloğu (kategoriler = bölümler).
//
// Bu sayfa mevcut siteye DOKUNMAZ: kendi dosyaları dışında hiçbir bileşen,
// stil ya da rota değişmedi. Site kabuğu (sidebar + mobil dock) yalnız bu
// rota açıkken KitapClient'in kendi <style> bloğuyla gizlenir — globals.css
// ve AppShell.tsx olduğu gibi duruyor.
//
// Yerel önizleme amaçlı: noindex + sitemap'e EKLENMEDİ (sitemap izin
// listesiyle çalışıyor, bkz. [[sitemap-saglik-kurali]]).
// ════════════════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  title: 'Kitap',
  description: '32 makalenin kategorilere ayrılmış kitap görünümü.',
  robots: { index: false, follow: false },
};

export default function KitapPage() {
  return <KitapClient articles={ARTICLES} />;
}
