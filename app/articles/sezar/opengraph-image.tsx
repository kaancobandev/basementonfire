import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Julius Caesar — Kendisini Öldürenleri Affeden Adam · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Julius Caesar',
    subtitle: 'Kendisini öldürenleri affeden adam',
    accent: '#e11d48',
    gradient: 'linear-gradient(135deg, #0d0709 0%, #4c0519 58%, #9f1239 100%)',
  });
}
