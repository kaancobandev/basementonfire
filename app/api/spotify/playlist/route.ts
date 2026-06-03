import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

function parseSpotifyId(input: string): string | null {
  const s = input.trim();
  const urlMatch = s.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  const uriMatch = s.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  if (/^[a-zA-Z0-9]{22}$/.test(s)) return s;
  return null;
}

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const body = await req.json().catch(() => ({}));
  const playlistId = parseSpotifyId(body.url ?? '');
  if (!playlistId) return json({ error: 'Geçersiz Spotify URL ya da ID' }, 400);

  // Başlığı Spotify oEmbed'den çek
  let title = 'Spotify Playlist';
  try {
    const oembed = await fetch(
      `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (oembed.ok) {
      const d = await oembed.json() as { title?: string };
      if (d.title) title = d.title;
    }
  } catch {}

  const { data, error } = await db
    .from('spotify_playlists')
    .insert({ user_id: me.id, playlist_id: playlistId, title })
    .select('id, playlist_id, title, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return json({ error: 'Bu playlist zaten ekli' }, 409);
    return json({ error: error.message }, 500);
  }
  return json(data, 201);
}

export async function DELETE(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'Geçersiz id' }, 400);

  const { error } = await db
    .from('spotify_playlists')
    .delete()
    .eq('id', id)
    .eq('user_id', me.id);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
}
