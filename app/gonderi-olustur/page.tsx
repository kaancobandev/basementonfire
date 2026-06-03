import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import GonderiForm from './GonderiForm';

export default async function GonderiOlusturPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { me } = await getMe();
  if (!me) redirect('/login');

  const { error } = await searchParams;

  return <GonderiForm error={error ?? null} />;
}
