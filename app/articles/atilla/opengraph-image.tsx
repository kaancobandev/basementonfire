import { articleOgImage, OG_SIZE } from '@/lib/og';
import { QUESTIONS } from '@/lib/questions';

export const alt = 'Atilla — Bozkırdan Gelen Kağan · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Atilla',
    subtitle: QUESTIONS.atilla,
    accent: '#e2622b',
    // Bozkır gecesi: yanık toprak → garnet → kor. Kanuni'nin kobalt/turkuaz
    // kartından ve Fatih'in mavisinden ilk bakışta ayrılsın diye sıcak taraf.
    gradient: 'linear-gradient(135deg, #0a0706 0%, #4a1520 50%, #e2622b 100%)',
  });
}
