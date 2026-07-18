import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db, getMe, isAdmin } from '@/lib/supabase/server';
import ArticleView, { type ArticleRow } from '../../ArticleView';

// Sahip/admin önizlemesi — HER statüdeki makaleyi id ile gösterir.
// /makale/[slug] ISR olunca (yalnız onaylılar) kişiye özel önizleme buraya
// taşındı: bu rota bilerek force-dynamic (getMe + yetki kapısı her istekte).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Makale Önizleme', robots: { index: false, follow: false } };

export default async function ArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  // Makale ile getMe birbirinden bağımsız → paralel.
  const [{ data }, { me }] = await Promise.all([
    db
      .from('user_articles')
      .select('id, slug, title, summary, cover_url, category, doc, sources, status, created_at, updated_at, published_at, user_id, users!user_articles_user_id_fkey(username, display_name, avatar)')
      .eq('id', id)
      .maybeSingle(),
    getMe(),
  ]);
  const a = (data as any as ArticleRow) ?? null;
  if (!a) notFound();

  const isOwner = !!me && me.id === a.user_id;
  // Onaysiz makaleyi yalnizca sahibi veya admin onizleyebilir.
  if (!isOwner && !isAdmin(me as any)) notFound();

  return <ArticleView a={a} isOwner={isOwner} />;
}
