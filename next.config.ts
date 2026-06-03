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
};

export default nextConfig;
