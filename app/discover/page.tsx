import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db, logIfError } from '@/lib/supabase/server';
import { ARTICLES } from '@/lib/articles';
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
export const revalidate = 60;

// PAYLAŞILAN içerik (son kullanıcılar + son medya + topluluk makaleleri) —
// herkes için aynı, kişiye özel değil. ISR ile birlikte ikinci bir katman:
// sayfa 60 sn'de bir yeniden üretilirken bu sorgular da önbellekten gelir,
// ve tags:['feed'] sayesinde yeni içerik yayınlanınca ikisi birden tazelenir.
const getDiscoverContent = unstable_cache(
  async () => {
    const [{ data: users, error: usersErr }, { data: mediaRaw, error: mediaErr }, { data: uaRaw, error: uaErr }] = await Promise.all([
      // Silinmiş hesaplar (anonim künye) keşifte ÇIKMAZ.
      db.from('users').select('id, username, display_name, bio, avatar').eq('is_deleted', false).order('created_at', { ascending: false }).limit(20),
      db.from('quick_facts').select('id, media_url, media_type, caption, likes, users!quick_facts_user_id_fkey(username, display_name, is_private)').order('created_at', { ascending: false }).limit(24),
      db.from('user_articles').select('id, slug, title, summary, cover_url, category, users!user_articles_user_id_fkey(username, display_name)').eq('status', 'approved').order('published_at', { ascending: false }).limit(12),
    ]);
    logIfError('discover users', usersErr);
    logIfError('discover quick_facts', mediaErr);
    logIfError('discover user_articles', uaErr);
    // Gizli hesapların gönderi medyası Keşfet ızgarasında gösterilmez (is_private truthy=gizli).
    const media = ((mediaRaw ?? []) as any[]).filter((r) => !r.users?.is_private).slice(0, 12);
    return { users: users ?? [], mediaRaw: media, uaRaw: uaRaw ?? [] };
  },
  ['discover-content-v2'],
  { revalidate: 60, tags: ['feed'] },
);

export const metadata: Metadata = {
  title: 'Keşfet',
  description: 'Basements\'te kullanıcıları, gönderileri ve konuları keşfet; yeni insanlar ve içerikler bul.',
  alternates: { canonical: '/discover' },
  openGraph: {
    title: 'Keşfet · Basements',
    description: 'Kullanıcıları, gönderileri ve konuları keşfet.',
    url: '/discover',
    images: ['/opengraph-image'],
  },
};

export default async function DiscoverPage() {
  // Paylaşılan içerik önbellekten gelir (60sn); kişiye özel veri YOK → sayfa ISR.
  const { users, mediaRaw, uaRaw } = await getDiscoverContent();
  const media = (mediaRaw ?? []).map((m: any) => ({ ...m, username: m.users?.username ?? '', display_name: m.users?.display_name ?? '' }));
  const communityArticles = (uaRaw ?? []).map((a: any) => ({
    slug: a.slug, title: a.title, summary: a.summary ?? '', cover_url: a.cover_url ?? null,
    category: a.category ?? null, author: a.users?.display_name || a.users?.username || 'Kullanıcı', username: a.users?.username ?? '',
  }));

  // Makale listesi artik tek kaynaktan (lib/articles.ts). Sira ayni -> görünüm degismez.
  return (
    <DiscoverClient
      users={users ?? []}
      media={media}
      articles={ARTICLES}
      communityArticles={communityArticles}
    />
  );
}
