import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Arcade liderlik tablosu — game_scores tablosu şemada baştan beri vardı
// (player_name + score, FK'sız → anonim-dostu) ama koddan hiç kullanılmıyordu;
// skorlar yalnız localStorage'a yazılıyordu. game_key kolonu migration ile
// eklenir (sql/features-2026-07-19.sql); kolon yokken uç defansif davranır.

const GAME_KEYS = new Set(['ast', 'gx', 'pf']);
// Hile karşıtı kaba tavan: üç oyunda da bu skorun üstü insan oyunuyla makul değil.
const MAX_SCORE = 999_999;

const getTopScores = unstable_cache(
  async (game: string) => {
    const { data, error } = await db
      .from('game_scores')
      .select('player_name, score')
      .eq('game_key', game)
      .order('score', { ascending: false })
      .limit(10);
    if (error) return null; // kolon/tablo yok → istemci panoyu gizler
    return (data ?? []) as { player_name: string; score: number }[];
  },
  ['game-scores-top-v1'],
  { revalidate: 60, tags: ['game-scores'] },
);

export async function GET(req: Request) {
  const game = new URL(req.url).searchParams.get('game') ?? '';
  if (!GAME_KEYS.has(game)) return json({ error: 'Geçersiz oyun' }, 400);
  const scores = await getTopScores(game);
  if (scores === null) return json({ available: false, scores: [] });
  return json({ available: true, scores });
}

export async function POST(req: Request) {
  let body: { game?: string; score?: number; name?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const game = String(body.game ?? '');
  if (!GAME_KEYS.has(game)) return json({ error: 'Geçersiz oyun' }, 400);

  const score = Number(body.score);
  if (!Number.isInteger(score) || score < 1 || score > MAX_SCORE) return json({ error: 'Geçersiz skor' }, 400);

  // Girişliyse isim HER ZAMAN kullanıcı adıdır (taklit engeli); anonimse rumuz.
  const { me } = await getMe();
  const rawName = me?.username ?? String(body.name ?? '').trim();
  const name = rawName.replace(/[^\p{L}\p{N}_ .-]/gu, '').slice(0, 20).trim();
  if (name.length < 2) return json({ error: 'Rumuz en az 2 karakter olmalı' }, 400);

  // Hafif flood freni: aynı isimden son 1 saatte 10+ kayıt → 429.
  const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const { count: recent } = await db
    .from('game_scores').select('id', { count: 'exact', head: true })
    .eq('player_name', name).gt('created_at', hourAgo);
  if ((recent ?? 0) >= 10) return json({ error: 'Çok sık skor gönderiyorsun, biraz bekle.' }, 429);

  const { error } = await db.from('game_scores').insert({ game_key: game, player_name: name, score });
  if (error) return json({ available: false, error: 'Skor tablosu henüz hazır değil.' }, 503);

  revalidateTag('game-scores'); // yeni skor panoda hemen görünsün
  return json({ ok: true });
}
