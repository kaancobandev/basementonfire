import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import { factMediaList } from '@/lib/types';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import { getPost, getPostDetail } from './postData';
import PostDetailClient from './PostDetailClient';

export const dynamic = 'force-dynamic';

const SITE = 'https://basementonfire.com';

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
  const description = cap ? cap.slice(0, 160) : `${name} (@${u.username}) kullanıcısının Basementonfire gönderisi.`;
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
    openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path, images: [cover] },
    twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description, images: [cover] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) notFound();

  // getMe ile gönderi sorgusu bağımsız → paralel. getPost React cache()'li olduğu
  // için getPostDetail içindeki ikinci çağrı bedava (sorgu tekrarlanmaz).
  const [{ me }] = await Promise.all([getMe(), getPost(postId)]);
  const detail = await getPostDetail(postId, me?.id ?? null);
  if (!detail) notFound();

  const { post, u, comments, commentLikesEnabled, initialLiked, initialBookmarked, initialReposted, postProp } = detail;
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

  // Kırıntı navigasyonu: Ana Sayfa → @kullanıcı → Gönderi (gizli hesapta noindex olduğundan atlanır)
  const breadcrumbLd = !u.is_private ? breadcrumbJsonLd([
    { name: 'Ana Sayfa', path: '/' },
    { name: u.display_name || `@${u.username}`, path: `/u/${u.username}` },
    { name: 'Gönderi' },
  ]) : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />}
      {breadcrumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />}
      <PostDetailClient
        post={postProp}
        initialComments={comments}
        commentLikesEnabled={commentLikesEnabled}
        initialLiked={initialLiked}
        initialBookmarked={initialBookmarked}
        initialReposted={initialReposted}
        currentUser={me ? { id: me.id, username: me.username, display_name: me.display_name } : null}
      />
    </>
  );
}
