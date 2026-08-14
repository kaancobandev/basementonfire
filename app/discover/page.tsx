import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db, logIfError } from '@/lib/supabase/server';
import { ARTICLES } from '@/lib/articles';
import { jsonLdScript } from '@/lib/seo';
import DiscoverClient from './DiscoverClient';

// ════════════════════════════════════════════════════════════════════════
// 2026-07-16: force-dynamic → ISR. Ölçüldü: eskiden `Cache-Status: Durable;
// fwd=bypass, Edge; fwd=miss` → her istek fonksiyon → 3,9 sn. Oysa sayfanın
// KİŞİYE ÖZEL tek verisi bir boolean'dı (isLoggedIn, yalnız takip butonunu
// gösteriyordu) ve paylaşılan içerik zaten 60 sn önbellekliydi.
//
// Artık HTML'in kendisi 60 sn önbellekli → ziyaretçi edge'den alır, fonksiyon
// çalışmaz. YENİ BAYATLIK YOK: getDiscoverContent zaten revalidate 60 idi;
// aynı 60 saniye sorgudan sayfanın tamamına genişledi. revalidateTag('feed')
// (gönderi/hikâye oluşturma) yine bu sayfayı tazeler → yeni içerik anında.
//
// Kaldırılanlar ve nereye gitti:
//  · getMe()      → isLoggedIn artık istemcide, .auth-in CSS'iyle (globals.css:349-351)
//  · searchParams → ?q= istemcide window.location.search'ten (DiscoverClient)
//    (useSearchParams KULLANILMADI: Next tüm client component'i Suspense'e alıp
//     istemciye kaydırırdı → 32 makale linki HTML'den çıkar, SEO yüzeyi ölürdü.)
// ════════════════════════════════════════════════════════════════════════
// ⚠ 60 → 3600 (2026-07-28). Sayfa ISR'dı ama pencere dardı ve bu ÖLÇÜLEBİLİR
// bir yavaşlıktı: canlıda `Durable; fwd=bypass` + **7,6 sn** görüldü. Sebep
// /feed'dekiyle aynı — `revalidate` aynı zamanda Netlify durable cache'inin
// TTL'idir; girdi bayatlayınca Netlify yeniden üretimi BEKLETİR.
//
// ⚠⚠ AŞAĞIDAKİ unstable_cache DA 3600 OLMALI: Next, sayfanın efektif
// revalidate'ini "sayfanınki + render sırasında okunan tüm cache'lerin"
// MİNİMUMU alır. Yalnız buradaki sayıyı büyütmek NO-OP olur (bu tuzağa /feed'de
// düşüldü; kontrol yolu `next build` route tablosuna bakmak).
//
// BAYATLIK RİSKİ DÜŞÜK: içerik üreten her rota revalidateTag('feed') çağırıyor
// ve bu cache `tags:['feed']` taşıyor → yeni gönderi/makale anında yansır.
// Pencere yalnız tag'siz değişenleri bağlar: beğeni sayıları, yeni üye listesi,
// gündem etiketleri.
export const revalidate = 3600;

// PAYLAŞILAN içerik (son kullanıcılar + son medya + topluluk makaleleri) —
// herkes için aynı, kişiye özel değil. ISR ile birlikte ikinci bir katman:
// sayfa 60 sn'de bir yeniden üretilirken bu sorgular da önbellekten gelir,
// ve tags:['feed'] sayesinde yeni içerik yayınlanınca ikisi birden tazelenir.
const getDiscoverContent = unstable_cache(
  async () => {
    // ⚠ Gündem sorgusu da BURADA: aşağıdaki `Promise.all`'ın sonucuna hiçbir
    // bağımlılığı yok, yalnız dışarıda kaldığı için sıraya giriyordu ve yeniden
    // üretime kendi turunu ekliyordu. İçeri alındı — bedava paralellik.
    const [{ data: users, error: usersErr }, { data: mediaRaw, error: mediaErr }, { data: uaRaw, error: uaErr }, { data: recentFacts }] = await Promise.all([
      // Silinmiş hesaplar (anonim künye) keşifte ÇIKMAZ.
      db.from('users').select('id, username, display_name, bio, avatar').eq('is_deleted', false).order('created_at', { ascending: false }).limit(20),
      db.from('quick_facts').select('id, media_url, media_type, caption, likes, users!quick_facts_user_id_fkey(username, display_name, is_private)').order('created_at', { ascending: false }).limit(24),
      db.from('user_articles').select('id, slug, title, summary, cover_url, category, users!user_articles_user_id_fkey(username, display_name)').eq('status', 'approved').order('published_at', { ascending: false }).limit(12),
      // Gündem örneklemi — limit(500), yukarıdaki limit(24) ile AYNI ŞEY DEĞİL.
      db.from('quick_facts')
        .select('id, users!quick_facts_user_id_fkey(is_private)')
        .order('created_at', { ascending: false })
        .limit(500),
    ]);
    logIfError('discover users', usersErr);
    logIfError('discover quick_facts', mediaErr);
    logIfError('discover user_articles', uaErr);
    // Gizli hesapların gönderi medyası Keşfet ızgarasında gösterilmez (is_private truthy=gizli).
    const media = ((mediaRaw ?? []) as any[]).filter((r) => !r.users?.is_private).slice(0, 12);

    // Gündem: en güncel 500 herkese açık gönderinin en çok kullanılan etiketleri.
    // Sabit "son 7 gün" penceresi KULLANILMADI (denendi): bu ölçekte pencere çoğu
    // hafta boş kalıp bloğu gizliyordu; son-500 doğal olarak güncele ağırlık verir
    // ve etiket var olduğu sürece blok dolu kalır. post_hashtags'te created_at yok
    // → güncellik quick_facts sırasından gelir. Sorgular yalnız ISR yeniden
    // üretiminde koşar. Gizli hesapların gönderileri sayıma girmez (her küresel
    // yüzeyde elle is_private filtresi). Tablolar yoksa/boşsa blok sessizce gizlenir.
    let trending: { tag: string; count: number }[] = [];
    try {
      const publicIds = ((recentFacts ?? []) as any[]).filter((r) => !r.users?.is_private).map((r) => r.id);
      if (publicIds.length) {
        const { data: ph } = await db.from('post_hashtags').select('hashtag_id').in('post_id', publicIds);
        const countMap = new Map<number, number>();
        for (const r of (ph ?? []) as any[]) countMap.set(r.hashtag_id, (countMap.get(r.hashtag_id) ?? 0) + 1);
        const topIds = [...countMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
        if (topIds.length) {
          const { data: tags } = await db.from('hashtags').select('id, tag').in('id', topIds);
          trending = ((tags ?? []) as any[])
            .map((t) => ({ tag: t.tag as string, count: countMap.get(t.id) ?? 0 }))
            .sort((a, b) => b.count - a.count);
        }
      }
    } catch { /* gündem best-effort */ }

    return { users: users ?? [], mediaRaw: media, uaRaw: uaRaw ?? [], trending };
  },
  ['discover-content-v3'],
  // Sayfanın revalidate'iyle AYNI olmalı — yukarıdaki nota bak (min kazanır).
  { revalidate: 3600, tags: ['feed'] },
);

export const metadata: Metadata = {
  title: 'Keşfet',
  description: 'Basementonfire\'te kullanıcıları, gönderileri ve konuları keşfet; yeni insanlar ve içerikler bul.',
  alternates: { canonical: '/discover' },
  openGraph: {
    title: 'Keşfet · Basementonfire',
    description: 'Kullanıcıları, gönderileri ve konuları keşfet.',
    url: '/discover',
    images: ['/opengraph-image'],
  },
};

// Sitedeki TÜM kürate makaleleri Google'a tek listede bildirir.
// 2026-08-14'te app/page.tsx'ten BURAYA taşındı: ana sayfa akışa çevrildi ve
// 36 makale linki artık orada değil, burada. İşaretleme, linklerin fiilen
// bulunduğu sayfada durmalı — kategori sayfalarındaki ItemList'ler yalnız
// 3+ makalesi olan kategorileri kapsıyor, yani tek başlarına 36'yı toplamıyor.
// Görünmez: ekranda hiçbir şey göstermez, sayfa yerleşimini etkilemez.
const itemListJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Basementonfire makaleleri',
  numberOfItems: ARTICLES.length,
  itemListElement: ARTICLES.map((a, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://basementonfire.com/articles/${a.slug}`,
    name: a.title,
  })),
});

export default async function DiscoverPage() {
  // Paylaşılan içerik önbellekten gelir (60sn); kişiye özel veri YOK → sayfa ISR.
  const { users, mediaRaw, uaRaw, trending } = await getDiscoverContent();
  const media = (mediaRaw ?? []).map((m: any) => ({ ...m, username: m.users?.username ?? '', display_name: m.users?.display_name ?? '' }));
  const communityArticles = (uaRaw ?? []).map((a: any) => ({
    slug: a.slug, title: a.title, summary: a.summary ?? '', cover_url: a.cover_url ?? null,
    category: a.category ?? null, author: a.users?.display_name || a.users?.username || 'Kullanıcı', username: a.users?.username ?? '',
  }));

  // Makale listesi artik tek kaynaktan (lib/articles.ts). Sira ayni -> görünüm degismez.
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListJsonLd()) }} />
      <DiscoverClient
        users={users ?? []}
        media={media}
        articles={ARTICLES}
        communityArticles={communityArticles}
        trending={trending ?? []}
      />
    </>
  );
}
