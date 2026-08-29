import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

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
  revalidateTag('muzik');
  return json(data, 201);
}

export async function DELETE(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'Geçersiz id' }, 400);


/* 🚨 YÖNETİCİ KALDIRAMIYORDU — 26.08.2026 denetimi.
   /muzik SİTE GENELİ bir liste: kimin eklediğine bakılmaksızın herkese (anonim
   ziyaretçiye de) gösteriliyor. Ama silme koşulu `eq('user_id', me.id)` idi ve
   üç uçta da `isAdmin` geçişi YOKTU (ölçüldü: 0). Yani biri kötü bir içerik
   eklerse yöneticinin uygulama içinde hiçbir çaresi yoktu.

   ⚠ İKİNCİ HATA, aynı satırda: `delete().eq(...)` hiçbir satır eşleşmese bile
     HATA DÖNDÜRMEZ. Başkasının içeriğini silmeye çalışan `{success:true}`
     alıyordu — hiçbir şey silinmemişken. `.select()` ekleyip gerçekten satır
     dönüp dönmediğine bakıyoruz; dönmediyse 404.
   404 (403 değil): var olmayan id ile yetkisiz id AYNI yanıtı verir. */
  let sil = db.from('spotify_playlists').delete().eq('id', id);
  if (!isAdmin(me)) sil = sil.eq('user_id', me.id);
  const { data: silinen, error } = await sil.select('id');
  if (!error && !(silinen ?? []).length) return json({ error: 'Liste bulunamadı' }, 404);

  if (error) return json({ error: error.message }, 500);
  revalidateTag('muzik');
  return json({ success: true });
}
