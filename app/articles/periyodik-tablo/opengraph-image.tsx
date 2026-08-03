// Paylaşım kartı — REGISTRY'den kurulur, elle veri YOK.
//   başlık  → lib/articles.ts          soru   → lib/questions.ts
//   gradyan → lib/article-gradients.ts  accent → lib/og.tsx (OG_ACCENTS)
import { articleOgFor, ogAltFor, OG_SIZE } from '@/lib/og';

export const alt = ogAltFor('periyodik-tablo');
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgFor('periyodik-tablo');
}
