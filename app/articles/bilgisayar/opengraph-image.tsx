import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Bilgisayar Nasıl Çalışır? Parçaların Tam Rehberi · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Bilgisayar',
    subtitle: 'Nasıl Çalışır? Parçaların Tam Rehberi',
    accent: '#22d3ee',
    gradient: 'linear-gradient(135deg, #0b1220 0%, #0e3a4a 55%, #4c1d95 100%)',
  });
}
