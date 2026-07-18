import type { Metadata } from 'next';
import BilgiKartiClient from './BilgiKartiClient';

// ESKİDEN force-dynamic'ti: getMe() yalnız anonimi /login'e atmak içindi ve
// BilgiKartiClient'a hiçbir prop geçmiyordu (HTML herkes için aynı). Auth
// kapısı middleware PROTECTED'a taşındı (aynı yönlendirme, sayfa kodu çalışmadan)
// + istemci zaten 401'de /login'e atıyor → sayfa statik, CDN'den döner.
export const metadata: Metadata = { title: 'Bilgi Kartı Paylaş', robots: { index: false } };

export default function BilgiKartiPage() {
  return <BilgiKartiClient />;
}
