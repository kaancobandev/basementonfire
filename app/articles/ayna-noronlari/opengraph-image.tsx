// Paylaşım kartı — REGISTRY'den kurulur, elle veri YOK.
//   başlık  → lib/articles.ts        soru → lib/questions.ts
//   gradyan → lib/article-gradients.ts (keşif kartıyla aynı)  accent → lib/og.tsx
// Soruyu değiştirmek istiyorsan lib/questions.ts'i düzenle, burayı değil.
import { articleOgFor, ogAltFor, OG_SIZE } from '@/lib/og';

export const alt = ogAltFor('ayna-noronlari');
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgFor('ayna-noronlari');
}
