import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Kimyada Mol Kavramı — Kapsamlı Rehber · Basements';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Mol Kavramı',
    subtitle: '1 mol = 6,022 × 10²³ tane · gramla tanecik arasındaki köprü',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #1a1206 0%, #78350f 55%, #f59e0b 100%)',
  });
}
