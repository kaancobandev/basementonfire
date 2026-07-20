import type { Metadata } from 'next';
import CarouselStudio from '../components/CarouselStudio';

// Paylaşım stüdyosu — makale carousel'i + reel kapağı üretici. Yönetim aracı,
// arama motorundan gizli (paylaşım varlığı üretir, indekslenecek içerik değil).
export const metadata: Metadata = {
  title: 'Paylaşım Stüdyosu',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="main-content">
      <CarouselStudio />
    </main>
  );
}
