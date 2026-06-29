import type { Metadata } from 'next';
import DogalSecilimV2Client from './DogalSecilimV2Client';

// Tasarım karşılaştırması (immersive önizleme). v1 ile aynı içeriği taşıdığından
// SEO için indekslenmez (canonical makale /articles/dogal-secilim).
export const metadata: Metadata = {
  title: 'Doğal Seçilim — İmmersive (önizleme)',
  robots: { index: false, follow: false },
  alternates: { canonical: '/articles/dogal-secilim' },
};

export default function Page() {
  return <DogalSecilimV2Client />;
}
