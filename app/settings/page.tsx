import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');
  return <SettingsClient user={{ username: me.username, dm_privacy: me.dm_privacy, comment_privacy: me.comment_privacy, is_private: me.is_private }} />;
}
