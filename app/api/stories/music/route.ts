import { db, getMe, logIfError } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Hikaye müzik seçicisinin listesi. /muzik sayfasındaki çalma listesinin
 * TAMAMI DEĞİL, yalnızca `story_approved` işaretli alt kümesi döner —
 * sebebi sql/features-story-music.sql başındaki telif notunda.
 *
 * Kolon henüz eklenmemişse (SQL çalıştırılmadıysa) boş liste döner ve seçici
 * kendini gizler; hikaye paylaşımı müziksiz çalışmaya devam eder.
 */
export async function GET() {
  const { me } = await getMe();
  if (!me) return NextResponse.json({ tracks: [] });

  const { data, error } = await db
    .from('music_tracks')
    .select('id, title, artist, src, duration')
    .eq('story_approved', true)
    .order('created_at', { ascending: false })
    .limit(100);

  // Kolon yoksa PostgREST 42703 döner — bu bir arıza değil, özellik uykuda.
  if (error && !/story_approved/.test(error.message)) logIfError('story music list', error);

  return NextResponse.json({ tracks: data ?? [] });
}
