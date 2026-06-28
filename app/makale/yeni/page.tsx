import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db, getMe } from '@/lib/supabase/server';
import ArticleEditor from './ArticleEditor';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Makale Yaz',
  robots: { index: false, follow: false },
};

export default async function MakaleYeniPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { me } = await getMe();
  if (!me) redirect('/login');

  const { id } = await searchParams;
  let initial: any = null;
  if (id && Number.isFinite(Number(id))) {
    const { data } = await db
      .from('user_articles')
      .select('id, slug, title, summary, cover_url, category, doc, sources, status, user_id')
      .eq('id', Number(id))
      .maybeSingle();
    if (data && data.user_id === me.id) initial = data; // yalnizca kendi makaleni duzenle
  }

  return <ArticleEditor initial={initial} />;
}
