import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

function parseYouTube(input: string): { type: 'video' | 'playlist'; id: string } | null {
  const s = input.trim();
  const videoPatterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of videoPatterns) {
    const m = s.match(p);
    if (m) return { type: 'video', id: m[1] };
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return { type: 'video', id: s };
  const plMatch = s.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (plMatch) return { type: 'playlist', id: plMatch[1] };
  return null;
}

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const body = await req.json().catch(() => ({}));
  const parsed = parseYouTube(body.url ?? '');
  if (!parsed) return json({ error: 'Geçersiz YouTube URL veya ID' }, 400);

  let title = parsed.type === 'playlist' ? 'YouTube Playlist' : 'YouTube Video';
  if (parsed.type === 'video') {
    try {
      const r = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${parsed.id}&format=json`
      );
      if (r.ok) {
        const d = await r.json() as { title?: string };
        if (d.title) title = d.title;
      }
    } catch {}
  }

  const { data, error } = await db
    .from('youtube_items')
    .insert({ user_id: me.id, item_type: parsed.type, item_id: parsed.id, title })
    .select('id, item_type, item_id, title, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return json({ error: 'Bu içerik zaten ekli' }, 409);
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
  let sil = db.from('youtube_items').delete().eq('id', id);
  if (!isAdmin(me)) sil = sil.eq('user_id', me.id);
  const { data: silinen, error } = await sil.select('id');
  if (!error && !(silinen ?? []).length) return json({ error: 'Video bulunamadı' }, 404);

  if (error) return json({ error: error.message }, 500);
  revalidateTag('muzik');
  return json({ success: true });
}
