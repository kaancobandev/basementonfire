import { articleOgImage, OG_SIZE } from '@/lib/og';
import { QUESTIONS } from '@/lib/questions';

export const alt = 'Kanuni Sultan Süleyman — Kanunu Yazan Adamın Kendi Kanununa Yenilmesi · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Kanuni',
    subtitle: QUESTIONS.kanuni,
    accent: '#2fb8ae',
    gradient: 'linear-gradient(135deg, #070c1e 0%, #16224d 52%, #1f6f77 100%)',
  });
}
