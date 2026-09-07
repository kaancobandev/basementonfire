import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Zihnini Yükleyebilir misin? — Tek Soru Sandığın Üç Ayrı Soru · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Zihnini Yükleyebilir misin?',
    subtitle: 'Haritalamak · çalıştırmak · “ben” olmak — üçü aynı soru değil',
    accent: '#818cf8',
    gradient: 'linear-gradient(135deg, #090a14 0%, #1e1b4b 55%, #4c1d95 100%)',
  });
}
