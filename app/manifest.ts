import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Basementonfire — Bilim, Tarih ve Kültür',
    short_name: 'Basementonfire',
    description: 'Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0e0d',
    theme_color: '#0f0e0d',
    lang: 'tr',
    // ⚠ Bu liste app/icon.png konvansiyonunu İZLEMEZ — bağımsız, doğrulanmayan
    // string'ler. Next manifest'i olduğu gibi geçirir (resolve-route-data.js:155
    // `resolveManifest(data) { return JSON.stringify(data) }`) → sıfır güvenlik ağı.
    // Logo değişirse BURAYI da elle güncelle, yoksa PWA ikonu sessizce 404 olur.
    //
    // 2026-07-16: '/icon.svg' + sizes:'any' + image/svg+xml → PNG'ye geçildi.
    // 'any' yalnız ÖLÇEKLENEBİLİR (SVG) semantiğidir; rasterda yalan olur.
    //
    // `purpose` BİLEREK yazılmadı (W3C varsayılanı 'any'). 'maskable' EKLEME:
    // maske şeffaflığı açar ve platform öngörülemez bir zemine basar — bu dosya
    // kenardan kenara opak DEĞİL (ölçüldü: ortalama alfa 63,86/255 = %25 kaplama,
    // tuvalin ~%74'ü tam şeffaf). Maskable istenirse AYRI dosya üretilmeli:
    // opak AÇIK zemin (#0f0e0d seçilirse işaret kaybolur, ölçüldü ~1,1:1).
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
