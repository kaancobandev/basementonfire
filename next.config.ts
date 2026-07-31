import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Production build'de ESLint hatalarının derlemeyi durdurmasını engelle.
  // (TypeScript tip kontrolü yine de çalışır — kod `tsc` ile temiz.)
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { bodySizeLimit: '110mb' },
    // Ağır kütüphaneleri otomatik tree-shake et → ilk yüklemede daha küçük JS.
    optimizePackageImports: ['framer-motion', 'sonner', '@react-spring/web', '@formkit/auto-animate'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media2.giphy.com' },
      { protocol: 'https', hostname: 'media3.giphy.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Eski statik içerik sayfaları React route'lara taşındı → kalıcı yönlendirme.
  async redirects() {
    return [
      { source: '/icerik/ekonomi.html', destination: '/articles/ekonomi', permanent: true },
      { source: '/icerik/einstein-rosen-koprusu.html', destination: '/articles/einstein-rosen', permanent: true },
      { source: '/icerik/arcade-oyunlar.html', destination: '/articles/arcade', permanent: true },
      { source: '/icerik/tibbi-gercek.html', destination: '/articles/tibbi', permanent: true },

      // ── Eski Türkçe slug'lar (2026-07-31) ────────────────────────────────
      // Search Console "Tarandı — dizine eklenmedi" listesinde /roma-imparatorlugu/
      // çıktı; son tarama 17.02.2026, yani mevcut kod tabanından (Haziran 2026)
      // önce. Zincir şuydu: /roma-imparatorlugu/ → 308 → /roma-imparatorlugu → 404.
      //
      // Yalnız ilki DOĞRULANDI. Diğerleri aynı adlandırma desenini izleyen
      // muhtemel kardeşleri — hiç var olmadılarsa zaten 404 dönecekti, yani
      // eklemenin maliyeti yok, karşılığı ise eski bağlantının korunması.
      //
      // YENİ 404 GÖRÜRSEN: Search Console → Sayfalar → "Bulunamadı (404)"
      // listesine bak, eski adresleri buraya ekle.
      { source: '/roma-imparatorlugu', destination: '/articles/rome', permanent: true },
      { source: '/antik-yunan', destination: '/articles/greece', permanent: true },
      { source: '/kartaca', destination: '/articles/carthage', permanent: true },
      { source: '/turklerin-tarihi', destination: '/articles/turkler', permanent: true },
      { source: '/kara-delikler', destination: '/articles/black-hole', permanent: true },

      // Eski gönderi listesi sayfası — Search Console "Bulunamadı (404)"
      // listesinde çıktı (son tarama 07.07.2026). Karşılığı bugün akış.
      { source: '/postpage', destination: '/akis', permanent: true },
    ];
  },
};

export default nextConfig;
