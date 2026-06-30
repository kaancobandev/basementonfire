import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Dünya — Oluşumu, İç Yapısı ve Eşsiz Özellikleri · Basements';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Dünya',
    subtitle: 'Oluşumu, İç Yapısı ve Eşsiz Özellikleri',
    accent: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0c1a2e 0%, #0c4a6e 55%, #0891b2 100%)',
  });
}
