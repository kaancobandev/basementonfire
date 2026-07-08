import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Sıfırdan Fizik — Temel Kavramlar · Basements';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Sıfırdan Fizik',
    subtitle: 'Kütle · Kuvvet · Newton · Momentum · Enerji — bolca interaktifle',
    accent: '#2563eb',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)',
  });
}
