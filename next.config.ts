import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
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
