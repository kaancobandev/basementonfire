import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Kuantum Ölümsüzlüğü: Kendi Ölümünü Neden Hiç Deneyimlemeyebilirsin · Basements';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Kuantum Ölümsüzlüğü',
    subtitle: 'Dışarıdan ölürsün, içeriden asla · fizik, felsefe ve bir roman',
    accent: '#2dd4bf',
    gradient: 'linear-gradient(135deg, #0a0f1e 0%, #1e1b4b 55%, #0f766e 100%)',
  });
}
