import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Kuantum Dolanıklık: Mesaj Göndermeyen Bağ · Basementonfire';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Kuantum Dolanıklık',
    subtitle: 'Uyum gerçek, etki yok — ve cevaplar baştan yazılmamıştı',
    accent: '#f472b6',
    gradient: 'linear-gradient(135deg, #0b0710 0%, #3b0d2e 55%, #7c2d6b 100%)',
  });
}
