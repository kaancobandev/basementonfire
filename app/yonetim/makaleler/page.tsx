import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db, getMe, isAdmin } from '@/lib/supabase/server';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Makale Yönetimi',
  robots: { index: false, follow: false },
};

export default async function MakaleYonetimPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');
  if (!isAdmin(me as any)) redirect('/');

  const { data } = await db
    .from('user_articles')
    .select('id, slug, title, summary, status, created_at, users!user_articles_user_id_fkey(username, display_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const items = (data ?? []).map((a: any) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    created_at: a.created_at,
    author: a.users?.display_name || a.users?.username || 'Kullanıcı',
    username: a.users?.username ?? '',
  }));

  return <AdminClient items={items} />;
}
