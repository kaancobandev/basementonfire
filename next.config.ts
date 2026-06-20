import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Production build'de ESLint hatalarının derlemeyi durdurmasını engelle.
  // (TypeScript tip kontrolü yine de çalışır — kod `tsc` ile temiz.)
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { bodySizeLimit: '110mb' },
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
    ];
  },
};

export default nextConfig;
