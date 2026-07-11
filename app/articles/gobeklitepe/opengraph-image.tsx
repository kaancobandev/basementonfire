import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Göbeklitepe — Derin Zaman Ekseni · Basements';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Göbeklitepe',
    subtitle: 'Piramitler bize ondan daha yakın',
    accent: '#4cc3ff',
    gradient: 'linear-gradient(135deg, #04060f 0%, #0c1630 55%, #123a63 100%)',
  });
}
