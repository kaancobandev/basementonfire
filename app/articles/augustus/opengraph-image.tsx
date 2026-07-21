import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Augustus — Tacı Reddederek Kral Olan Adam · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Augustus',
    subtitle: 'Tacı reddederek kral olan adam',
    accent: '#c9a44e',
    gradient: 'linear-gradient(135deg, #0d0b13 0%, #2a1f4a 55%, #6d5ba6 100%)',
  });
}
