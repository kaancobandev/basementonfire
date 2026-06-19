import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db, logIfError } from '@/lib/supabase/server';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import HashtagClient from './HashtagClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const t = tag.toLowerCase();
  const title = `#${t}`;
  const description = `#${t} etiketli gönderiler — Basements'te ${t} hakkındaki paylaşımları keşfet.`;
  const path = `/hashtag/${t}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', title: `#${t} · Basements`, description, url: path, images: ['/opengraph-image'] },
    twitter: { card: 'summary_large_image', title: `#${t} · Basements`, description },
  };
}

function avatarBg(u: string): string {
  const gs = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#ec4899,#8b5cf6)',
    'linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#10b981,#3b82f6)',
    'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#14b8a6,#06b6d4)',
    'linear-gradient(135deg,#3b82f6,#6366f1)', 'linear-gradient(135deg,#ef4444,#f97316)',
  ];
  let h = 0;
  for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return gs[Math.abs(h) % gs.length];
}

export default async function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const normalizedTag = tag.toLowerCase();

  if (!normalizedTag) redirect('/');

  // hashtags tablosunda bu tag'i bul
  const { data: hashtagRow } = await db
    .from('hashtags')
    .select('id')
    .eq('tag', normalizedTag)
    .maybeSingle();

  type Post = {
    id: number; media_url: string; media_type: string;
    caption: string; likes: number; created_at: string;
    display_name: string; username: string; avatarBg: string;
    media?: { url: string; type: 'image' | 'video' }[] | null;
  };

  let posts: Post[] = [];

  if (hashtagRow) {
    const { data: rows, error: rowsErr } = await db
      .from('post_hashtags')
      .select(`
        post:post_id(
          *,
          users!quick_facts_user_id_fkey(display_name, username)
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
          media_url:    p.media_url    as string,
          media_type:   p.media_type   as string,
          caption:      p.caption      as string,
          likes:        p.likes        as number,
          created_at:   p.created_at   as string,
          media:        (p.media ?? null) as { url: string; type: 'image' | 'video' }[] | null,
          display_name: (p.users?.display_name ?? '') as string,
          username:     (p.users?.username ?? '')     as string,
          avatarBg:     avatarBg(p.users?.username ?? 'a'),
        };
      })
      .filter(Boolean) as Post[];
  }

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Ana Sayfa', path: '/' },
    { name: `#${normalizedTag}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <HashtagClient tag={normalizedTag} posts={posts} />
    </>
  );
}
