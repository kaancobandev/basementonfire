import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { db, logIfError } from '@/lib/supabase/server';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import { tagFromParam } from '@/lib/caption';
import HashtagClient from './HashtagClient';

// ESKİDEN force-dynamic'ti — tek sebebi getMe()'nin ürettiği meId'ydi ve o da
// yalnız istemci-taraflı bir UI kararıydı (ReportButton). meId artık istemcide
// NavUserContext'ten geliyor → sayfa ISR. Sitemap'teki 2.000 etiket URL'inin
// her crawler ziyareti fonksiyon çalıştırıyordu; artık CDN'den dönüyor.
// (Path parametresi query değil → Netlify'ın "sorguyu yok sayar" tuzağına girmez.)
export const revalidate = 60;

// Build'de hiçbir etiket üretilmez (build DB'ye bağımlı kalmaz, 6 deploy/gün
// uzamaz); her etiket İLK istekte üretilip ISR ile saklanır. Bu tanım OLMADAN
// Next dinamik segmenti düz SSR sayıyor (ölçüldü: private,no-store dönüyordu) —
// boş dizi ISR makinesini açar (dynamicParams varsayılanı true).
export async function generateStaticParams(): Promise<{ tag: string }[]> {
  return [];
}

const SITE = 'https://basementonfire.com';

type HashtagPost = {
  id: number; user_id: number; media_url: string; media_type: string;
  caption: string; likes: number; created_at: string;
  display_name: string; username: string; avatar: string;
  is_private: boolean;
  media?: { url: string; type: 'image' | 'video' }[] | null;
};

// Etiket içeriği kişiye özel DEĞİL (meId yalnız istemci etkileşimleri için) →
// ana feed / keşfet / akış desenindeki gibi kısa süreli paylaşılan önbellek.
// 'feed' tag'i: yeni gönderi yüklenince revalidateTag('feed') bunu da tazeler.
// Not: unstable_cache anahtara argümanları (tag) otomatik dahil eder.
const getHashtagContent = unstable_cache(
  async (normalizedTag: string): Promise<{ posts: HashtagPost[]; related: { tag: string; count: number }[]; exists: boolean }> => {
    // hashtags tablosunda bu tag'i bul
    const { data: hashtagRow } = await db
      .from('hashtags')
      .select('id')
      .eq('tag', normalizedTag)
      .maybeSingle();

    let posts: HashtagPost[] = [];

    if (hashtagRow) {
      const { data: rows, error: rowsErr } = await db
        .from('post_hashtags')
        .select(`
          post:post_id(
            *,
            users!quick_facts_user_id_fkey(display_name, username, avatar, is_private)
          )
        `)
        .eq('hashtag_id', hashtagRow.id)
        .order('post_id', { ascending: false })
        .limit(60);
      logIfError('hashtag post_hashtags', rowsErr);

      posts = (rows ?? [])
        .map((r: any) => {
          const p = r.post;
          if (!p) return null;
          return {
            id:           p.id           as number,
            user_id:      p.user_id      as number,
            media_url:    p.media_url    as string,
            media_type:   p.media_type   as string,
            caption:      p.caption      as string,
            likes:        p.likes        as number,
            created_at:   p.created_at   as string,
            media:        (p.media ?? null) as { url: string; type: 'image' | 'video' }[] | null,
            display_name: (p.users?.display_name ?? '') as string,
            username:     (p.users?.username ?? '')     as string,
            avatar:       (p.users?.avatar ?? '')       as string,
            is_private:   Boolean(p.users?.is_private),
          };
        })
        .filter(Boolean) as HashtagPost[];

      // Gizli hesapların gönderileri küresel etiket listesinde GÖSTERİLMEZ
      // (is_private truthy = gizli, NULL = herkese açık) — /akis'teki filtrenin
      // aynısı. service-role RLS'i baypas ettiğinden bu elle filtre zorunlu.
      posts = posts.filter((p) => !p.is_private);
    }

    // İlgili etiketler: aynı gönderilerde bu etiketle birlikte geçen diğer hashtag'ler.
    // İç bağlantı kümesi oluşturur → konu otoritesi (topical authority) sinyali + keşif.
    let related: { tag: string; count: number }[] = [];
    if (hashtagRow && posts.length) {
      const postIds = posts.map((p) => p.id);
      const { data: co } = await db
        .from('post_hashtags')
        .select('hashtag_id')
        .in('post_id', postIds)
        .neq('hashtag_id', hashtagRow.id);
      const counts = new Map<number, number>();
      for (const r of (co ?? []) as { hashtag_id: number }[]) {
        counts.set(r.hashtag_id, (counts.get(r.hashtag_id) ?? 0) + 1);
      }
      const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([id]) => id);
      if (topIds.length) {
        const { data: tagRows } = await db.from('hashtags').select('id, tag').in('id', topIds);
        related = (tagRows ?? [])
          .map((t: any) => ({ tag: t.tag as string, count: counts.get(t.id) ?? 0 }))
          .sort((a, b) => b.count - a.count);
      }
    }

    // exists: etiket hashtags tablosunda HİÇ yok mu? Varsa ama gönderisi
    // kalmadıysa sayfa yine açılır (meşru boş koleksiyon); hiç yoksa 404.
    return { posts, related, exists: Boolean(hashtagRow) };
  },
  ['hashtag-content-v1'],
  { revalidate: 60, tags: ['feed'] },
);

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  // Aynı tuzak burada da vardı: çözülmemiş parametre başlığa ve canonical'a
  // "#k%c3%bclt%c3%bcr" olarak basılıyordu.
  const t = tagFromParam(tag);
  const title = `#${t}`;
  const description = `#${t} etiketli gönderiler — Basementonfire'te ${t} hakkındaki paylaşımları keşfet.`;
  const path = `/hashtag/${t}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', title: `#${t} · Basementonfire`, description, url: path, images: ['/opengraph-image'] },
    twitter: { card: 'summary_large_image', title: `#${t} · Basementonfire`, description },
  };
}

export default async function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  // tagFromParam: decode + kanonikleştir. Düz tag.toLowerCase() YAZMA — parametre
  // çözülmeden geliyor ve o hâlde küçültmek Türkçe etiketlerin hepsini 404 yapar
  // (bkz. lib/caption.ts'teki açıklama, 2026-07-24 ölçümü).
  const normalizedTag = tagFromParam(tag);

  if (!normalizedTag) redirect('/');

  const { posts, related, exists } = await getHashtagContent(normalizedTag);

  // Uydurulmuş etiket → 404. Aksi hâlde /hashtag/ sonrasına ne yazılırsa yazılsın
  // 200 dönen sonsuz sayıda boş sayfa üretilir ve Google hepsini indekslemeye
  // çalışır. Etiket gerçekten varsa, gönderisi kalmasa bile sayfa açık kalır.
  if (!exists) notFound();

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Ana Sayfa', path: '/' },
    { name: `#${normalizedTag}` },
  ]);

  // Hashtag sayfasını bir koleksiyon (gönderi listesi) olarak işaretle.
  // ItemList YALNIZCA herkese açık gönderileri içerir: gizli hesap gönderileri
  // /p/[id]'de noindex olduğundan yapılandırılmış veriye girmemeli (sitemap +
  // indexnow filtreleriyle tutarlı). Izgara mevcut /akis davranışıyla aynı kalır.
  const publicPosts = posts.filter((p) => !p.is_private);
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `#${normalizedTag}`,
    url: `${SITE}/hashtag/${normalizedTag}`,
    inLanguage: 'tr-TR',
    isPartOf: { '@type': 'WebSite', name: 'Basementonfire', url: SITE },
    ...(publicPosts.length
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: publicPosts.length,
            itemListElement: publicPosts.slice(0, 30).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE}/p/${p.id}`,
            })),
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionLd) }} />
      <HashtagClient tag={normalizedTag} posts={posts} related={related} />
    </>
  );
}
