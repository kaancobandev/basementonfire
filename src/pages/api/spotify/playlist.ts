import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';

function parseSpotifyId(input: string): string | null {
  const s = input.trim();
  const urlMatch = s.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  const uriMatch = s.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  if (/^[a-zA-Z0-9]{22}$/.test(s)) return s;
  return null;
}

function json(data: object, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getAuthUser(request: Request) {
  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return null;
  const { data: me } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
  return me ?? null;
}

export const POST: APIRoute = async ({ request }) => {
  const me = await getAuthUser(request);
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const body = await request.json().catch(() => ({}));
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
  } catch (_) {}

  const { data, error } = await supabase
    .from('spotify_playlists')
    .insert({ user_id: me.id, playlist_id: playlistId, title })
    .select('id, playlist_id, title, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return json({ error: 'Bu playlist zaten ekli' }, 409);
    return json({ error: error.message }, 500);
  }
  return json(data, 201);
};

export const DELETE: APIRoute = async ({ request }) => {
  const me = await getAuthUser(request);
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'Geçersiz id' }, 400);

  const { error } = await supabase
    .from('spotify_playlists')
    .delete()
    .eq('id', id)
    .eq('user_id', me.id);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
