import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/supabase/server';
import ArticleView, { type ArticleRow } from '../ArticleView';

// ESKİDEN force-dynamic'ti — tek sebebi sahibin onaysız makale önizlemesiydi
// (getMe + isOwner kapısı). Önizleme /makale/onizleme/[id] rotasına taşındı;
// bu rota artık YALNIZ onaylı makaleleri sunar ve ISR'dır: 1000+ makale
// hedefinde her görüntüleme fonksiyon yerine CDN'den döner. Onay/red/düzenleme
// API'ları revalidatePath ile bu önbelleği anında tazeler.
export const revalidate = 300;

// Build'de hiçbir makale üretilmez (build DB'ye bağımlı kalmaz); her makale
// İLK istekte üretilip ISR ile saklanır. Bu tanım OLMADAN Next dinamik
// segmenti düz SSR sayar (hashtag dönüşümünde ölçüldü) — boş dizi ISR'ı açar.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}

// cache(): generateMetadata + sayfa gövdesi aynı istekte ikisi de load() çağırır;
// sarmadan önce koca `doc` jsonb'li satır her istekte İKİ KEZ iniyordu
// (getPost/getProfileUser ile aynı desen).
const load = cache(async (slug: string): Promise<ArticleRow | null> => {
  const { data } = await db
    .from('user_articles')
    .select('id, slug, title, summary, cover_url, category, doc, sources, status, created_at, updated_at, published_at, user_id, users!user_articles_user_id_fkey(username, display_name, avatar)')
    .eq('slug', slug)
    .maybeSingle();
  return (data as any) ?? null;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await load(slug);
  // Onaysız makale bu rotada YOK sayılır (sahip önizlemesi /makale/onizleme/[id]).
  if (!a || a.status !== 'approved') return { title: 'Makale bulunamadı', robots: { index: false, follow: false } };
  const path = `/makale/${a.slug}`;
  const description = (a.summary || a.title).slice(0, 160);
  return {
    title: a.title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'article', title: `${a.title} · Basementonfire`, description, url: path, images: a.cover_url ? [a.cover_url] : ['/opengraph-image'] },
    twitter: { card: 'summary_large_image', title: `${a.title} · Basementonfire`, description },
  };
}

export default async function UserArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await load(slug);
  if (!a || a.status !== 'approved') notFound();
  return <ArticleView a={a} />;
}
