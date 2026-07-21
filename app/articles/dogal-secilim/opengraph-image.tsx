import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Doğal Seçilim — Evrimin Motoru · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Doğal Seçilim',
    subtitle: 'Evrimin Motoru',
    accent: '#34d399',
    gradient: 'linear-gradient(135deg, #04120c 0%, #065f46 55%, #65a30d 100%)',
  });
}
