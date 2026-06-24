import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getMe } from '@/lib/supabase/server';
import BilgiKartiClient from './BilgiKartiClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Bilgi Kartı Paylaş', robots: { index: false } };

export default async function BilgiKartiPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');
  return <BilgiKartiClient />;
}
