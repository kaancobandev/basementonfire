import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Isaac Newton: Bilimi Yeniden Kuran Adam · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Isaac Newton',
    subtitle: 'Bilimi Yeniden Kuran Adam',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #b45309 100%)',
  });
}
