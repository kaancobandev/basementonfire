import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Kullanıcının KENDİ hikaye arşivi — süresi dolmuş olanlar dahil hepsi.
 * Süresi dolan hikaye satırları silinmediği için (bkz. sql/schema.sql stories)
 * geçmiş erişilebilir; öne çıkanlara eklemek için buradaki listeden seçilir.
 * YALNIZ sahibine döner (başkasının arşivi kişiseldir).
 */
export async function GET() {
  const { me } = await getMe();
  if (!me) return NextResponse.json({ stories: [] });

  const { data } = await db
    .from('stories')
    .select('id, media_url, media_type, created_at, expires_at')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false })
    .limit(200);

  const now = Date.now();
  const stories = (data ?? []).map((s: any) => ({
    id: s.id, media_url: s.media_url, media_type: s.media_type,
    created_at: s.created_at,
    active: new Date(s.expires_at).getTime() > now, // hâlâ şeritte mi
  }));
  return NextResponse.json({ stories });
}
