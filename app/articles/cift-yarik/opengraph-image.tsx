import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Çift Yarık Deneyi: Gerçekliğin Kalbindeki Çatlak · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Çift Yarık Deneyi',
    subtitle: 'Gerçekliğin kalbindeki çatlak · Kuantumun tek gerçek gizemi',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, #0b0614 0%, #3b0764 55%, #0e7490 100%)',
  });
}
