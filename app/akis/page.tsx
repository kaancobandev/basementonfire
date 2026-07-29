import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db, logIfError } from '@/lib/supabase/server';
import { flattenFacts, type QuickFact } from '@/lib/types';
import AkisClient from './AkisClient';

// ESKİDEN force-dynamic'ti — tek sebebi getMe()'ydi ve ürettiği currentUser
// prop'u AkisClient'ta HİÇ kullanılmıyordu (ölü prop). İçerik zaten paylaşımlı
// (aşağıdaki unstable_cache) → sayfa ISR: her ziyaretçi fonksiyon yerine
// CDN'den alır, 30sn'de bir arka planda tazelenir.
// ⚠ 30 → 3600 (2026-07-29). `revalidate` aynı zamanda Netlify durable cache'inin
// TTL'idir: girdi bayatlayınca Netlify yeniden üretimi BEKLETİR ve o an gelen
// ziyaretçi saniyeler öder (/discover'da tam bu yüzden 7,6 sn ölçüldü).
//
// ⚠⚠ AŞAĞIDAKİ unstable_cache DA 3600 OLMALI — Next efektif revalidate'i
// "sayfanınki + render'da okunan tüm cache'lerin" MİNİMUMU alır; yalnız buradaki
// sayıyı büyütmek NO-OP olur (/feed'de bu tuzağa düşüldü). Kontrol: `next build`
// route tablosunda /akis `1h` yazmalı.
//
// PAYLAŞIM AKIŞI ETKİLENMEZ: gönderi yükleyen rota (api/upload) revalidateTag('feed')
// çağırıyor ve bu cache `tags:['feed']` taşıyor → /gonderi-olustur sonrası buraya
// yönlenen kullanıcı gönderisini ANINDA görür. Pencere yalnız tag'siz değişenleri
// (beğeni/yorum sayıları) bağlar.
export const revalidate = 3600;

// İlk sayfa feed'i PAYLAŞILAN (en yeni gönderiler, kişiye özel değil) → 30sn
// önbellek. Kendi yeni gönderini akış istemcisi zaten optimistik gösterir;
// önbellek yalnızca başkalarının görünümünü en fazla 30sn geciktirir.
const getInitialFeed = unstable_cache(
  async (limit: number) => {
    const { data, error } = await db
      .from('quick_facts')
      .select('*, users!quick_facts_user_id_fkey(display_name, username, is_private)')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit * 2); // gizli-hesap filtresinden sonra sayfa dolsun diye tampon
    logIfError('akis quick_facts', error);
    // Gizli hesapların gönderileri küresel akışta gösterilmez (is_private truthy=gizli).
    return (data ?? []).filter((r: any) => !r.users?.is_private).slice(0, limit);
  },
  ['akis-initial-feed-v1', 'limit-13'],
  // Sayfanın revalidate'iyle AYNI olmalı — yukarıdaki nota bak (min kazanır).
  { revalidate: 3600, tags: ['feed'] },
);

export const metadata: Metadata = {
  title: 'Akış',
  description: 'Basementonfire topluluğunun en yeni fotoğraf, video ve ses paylaşımları — akışı keşfet.',
  alternates: { canonical: '/akis' },
  openGraph: {
    title: 'Akış · Basementonfire',
    description: 'Basementonfire topluluğunun en yeni fotoğraf, video ve ses paylaşımları.',
    url: '/akis',
    images: ['/opengraph-image'],
  },
};

export default async function AkisPage() {
  const PAGE_SIZE = 12;
  const raw = await getInitialFeed(PAGE_SIZE + 1);

  const allFetched: QuickFact[] = flattenFacts(raw ?? []);
  const hasMore = allFetched.length > PAGE_SIZE;
  const posts: QuickFact[] = hasMore ? allFetched.slice(0, PAGE_SIZE) : allFetched;
  const initialNextCursor = hasMore ? posts[posts.length - 1].id : null;

  return (
    <AkisClient
      initialPosts={posts}
      initialNextCursor={initialNextCursor}
      initialHasMore={hasMore}
    />
  );
}
