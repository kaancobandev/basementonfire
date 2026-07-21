import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Radyoaktivite — Atomlar Sabırsız · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Radyoaktivite',
    subtitle: 'Atomlar sabırsız. İyi ki öyleler.',
    accent: '#a3e635',
    gradient: 'linear-gradient(135deg, #04120c 0%, #0d2818 55%, #3f6212 100%)',
  });
}
