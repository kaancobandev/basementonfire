import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Fatih Sultan Mehmed — Bir Fikrin Ele Geçirdiği Adam · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Fatih',
    subtitle: 'Bir fikir bir insanı ne kadar ele geçirebilir?',
    accent: '#4d7cff',
    gradient: 'linear-gradient(135deg, #0a0d17 0%, #16224d 55%, #3a56b0 100%)',
  });
}
