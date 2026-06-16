import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db, getMe } from '@/lib/supabase/server';
import { factMediaList } from '@/lib/types';
import PostDetailClient from './PostDetailClient';

export const dynamic = 'force-dynamic';

const SITE = 'https://basementonfire.com';

async function getPost(id: number) {
  const { data } = await db
    .from('quick_facts')
    .select('*, users!quick_facts_user_id_fkey(username, display_name, avatar, is_private)')
    .eq('id', id)
    .single();
  return data as any;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return { title: 'Gönderi', robots: { index: false, follow: false } };

  const post = await getPost(postId);
  if (!post) return { title: 'Gönderi bulunamadı', robots: { index: false, follow: false } };

  const u = post.users || {};
  const name = u.display_name || u.username || 'Kullanıcı';
  const cap = String(post.caption || '').replace(/\s+/g, ' ').trim();
  const title = cap ? `${name}: ${cap.slice(0, 70)}` : `${name} (@${u.username}) gönderisi`;
  const description = cap ? cap.slice(0, 160) : `${name} (@${u.username}) kullanıcısının Basements gönderisi.`;
  const path = `/p/${postId}`;
  const cover = factMediaList(post).find((m) => m.type === 'image')?.url || '/opengraph-image';

  // Gizli hesabın gönderisi arama motorlarına gösterilmez
  if (u.is_private) {
    return { title, description, alternates: { canonical: path }, robots: { index: false, follow: false } };
  }
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'article', title: `${title} · Basements`, description, url: path, images: [cover] },
    twitter: { card: 'summary_large_image', title: `${title} · Basements`, description, images: [cover] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) notFound();

  const post = await getPost(postId);
  if (!post) notFound();

  const { me } = await getMe();

  // Yorumlar sunucuda çekilir → ilk HTML'de görünür (krawler + SEO için UGC)
  const { data: rawComments } = await db
    .from('comments')
    .select('id, content, created_at, parent_id, user_id, users(username, display_name, avatar)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  const comments = (rawComments ?? []).map((c: any) => ({
    id: c.id, content: c.content, created_at: c.created_at, parent_id: c.parent_id, user_id: c.user_id,
    username: c.users?.username ?? '', display_name: c.users?.display_name ?? '', avatar: c.users?.avatar ?? null,
  }));

  // Beğeni/kaydetme durumu sunucuda (yüklemede yanıp sönmeyi önler)
  let initialLiked = false;
  let initialBookmarked = false;
  if (me) {
    const [lk, bm] = await Promise.all([
      db.from('fact_likes').select('fact_id').eq('user_id', me.id).eq('fact_id', postId).maybeSingle(),
      db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle(),
    ]);
    initialLiked = !!lk.data;
    initialBookmarked = !!bm.data;
  }

  const u = post.users || {};
  const cap = String(post.caption || '').replace(/\s+/g, ' ').trim();
  const cover = factMediaList(post).find((m) => m.type === 'image')?.url;
  const jsonLd = !u.is_private ? {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    url: `${SITE}/p/${postId}`,
    datePublished: post.created_at,
    ...(cap ? { headline: cap.slice(0, 110), articleBody: cap } : {}),
    inLanguage: 'tr-TR',
    author: {
      '@type': 'Person',
      name: u.display_name || u.username,
      alternateName: `@${u.username}`,
      url: `${SITE}/u/${u.username}`,
    },
    ...(cover ? { image: cover } : {}),
    interactionStatistic: [
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: post.likes ?? 0 },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: comments.length },
    ],
  } : null;

  const postProp = {
    id: post.id,
    caption: post.caption ?? '',
    media_url: post.media_url,
    media_type: post.media_type,
    media: post.media ?? null,
    likes: post.likes ?? 0,
    created_at: post.created_at,
    username: u.username ?? '',
    display_name: u.display_name ?? '',
    avatar: u.avatar ?? null,
  };

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <PostDetailClient
        post={postProp}
        initialComments={comments}
        initialLiked={initialLiked}
        initialBookmarked={initialBookmarked}
        currentUser={me ? { id: me.id, username: me.username, display_name: me.display_name } : null}
      />
    </>
  );
}
