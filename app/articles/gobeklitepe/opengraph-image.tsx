import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Göbeklitepe — Tapınaktan Önce Tanrı · Basements';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Göbeklitepe',
    subtitle: 'Piramitlerden 7.000 yıl önce',
    accent: '#d9954a',
    gradient: 'linear-gradient(135deg, #0f0a06 0%, #3a2410 55%, #7c4a1e 100%)',
  });
}
