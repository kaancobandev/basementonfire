import { db, getMe } from '@/lib/supabase/server';
import { MATCH_MIN_AGE, isAtLeast } from '@/lib/age';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

type MatchRow = {
  id: number;
  created_at: string;
  conversation_id: number | null;
  u1: { id: number; username: string; display_name: string; avatar: string } | null;
  u2: { id: number; username: string; display_name: string; avatar: string } | null;
};

// GET /api/match/matches — benim eslesmelerim (kutlama seridi + DM kisayolu icin).
export async function GET() {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  // 18+ KAPISI — doğrudan çağrılabilir.
  if (!isAtLeast(me.birthdate, MATCH_MIN_AGE))
    return json({ error: `Eşleştirme ${MATCH_MIN_AGE} yaş ve üzeri içindir.` }, 403);

  const { data, error } = await db
    .from('matches')
    .select('id, created_at, conversation_id, u1:user1_id(id, username, display_name, avatar), u2:user2_id(id, username, display_name, avatar)')
    .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`)
    .order('created_at', { ascending: false });

  // Defansif: tablo henuz yoksa bos liste don (UI sorunsuz calisir).
  if (error) return json({ matches: [] });

  const matches = ((data ?? []) as unknown as MatchRow[]).map((m) => {
    const other = m.u1?.id === me.id ? m.u2 : m.u1;
    return { id: m.id, conversationId: m.conversation_id, created_at: m.created_at, user: other };
  }).filter((m) => m.user);

  return json({ matches });
}
