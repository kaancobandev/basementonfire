import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// Site çalma listesi: yüklenen ses dosyasının KÜNYESİNİ kaydeder.
// Dosyanın kendisi tarayıcıdan doğrudan Storage'a gider (/api/storage/sign +
// lib/upload.ts) — Netlify fonksiyon gövde limiti aşılmasın diye. Burada
// yalnızca o yüklemenin sonucunu "commit" ediyoruz, gönderi akışıyla aynı desen.

const json = (data: object, status = 200) => NextResponse.json(data, { status });

const TITLE_MAX = 120;
const ARTIST_MAX = 80;

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const body = await req.json().catch(() => ({}));
  const rawPath = String(body.path ?? '').trim();
  const title = String(body.title ?? '').trim().slice(0, TITLE_MAX);
  const artist = String(body.artist ?? '').trim().slice(0, ARTIST_MAX) || null;
  const durRaw = Number(body.duration);
  const duration = Number.isFinite(durRaw) && durRaw > 0 ? Math.round(durRaw) : null;

  if (!title) return json({ error: 'Parça adı gerekli' }, 400);

  // Yol DOĞRULANIR: istemci serbest metin gönderip başkasının klasörünü ya da
  // depo dışındaki bir adresi kaydettiremesin. sign route'u medyayı
  // `<user_id>/<zaman>-<rastgele>.<uzantı>` deseniyle yazıyor → yalnız kendi
  // klasörü ve yalnız ses uzantıları kabul edilir.
  const ok = new RegExp(`^${me.id}/\\d+-[a-z0-9]+\\.(mp3|m4a|ogg|wav|weba)$`, 'i').test(rawPath);
  if (!ok) return json({ error: 'Geçersiz dosya yolu' }, 400);

  const { data: pub } = db.storage.from('media').getPublicUrl(rawPath);
  const src = pub?.publicUrl;
  if (!src) return json({ error: 'Dosya adresi çözülemedi' }, 500);

  const { data, error } = await db
    .from('music_tracks')
    .insert({ user_id: me.id, title, artist, src, storage_path: rawPath, duration })
    .select('id, title, artist, src, duration, created_at')
    .single();

  if (error) {
    // Tablo henüz oluşturulmadıysa (SQL çalıştırılmadı) anlaşılır mesaj dön.
    if (error.code === '42P01') return json({ error: 'Site çalma listesi henüz açılmadı.' }, 503);
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
  // Önce kaydı çek: storage yolunu öğrenmeden silersek dosya kovada yetim kalır.
  // ⚠ SAHİPLİK ŞARTI BURAYA DA UYGULANMALI — admin silerken bu select boş
  //   dönseydi dosya kovada kalırdı (satır gider, ses dosyası kalır).
  let sec = db.from('music_tracks').select('storage_path').eq('id', id);
  if (!isAdmin(me)) sec = sec.eq('user_id', me.id);
  const { data: row } = await sec.maybeSingle();

  let sil = db.from('music_tracks').delete().eq('id', id);
  if (!isAdmin(me)) sil = sil.eq('user_id', me.id);
  const { data: silinen, error } = await sil.select('id');
  if (!error && !(silinen ?? []).length) return json({ error: 'Parça bulunamadı' }, 404);

  if (error) return json({ error: error.message }, 500);

  // Dosyayı da temizle. Başarısız olursa kayıt yine de silinmiş olur —
  // yetim dosya, yetim kayıttan iyidir.
  if (row?.storage_path) {
    try { await db.storage.from('media').remove([row.storage_path]); } catch { /* yetim dosya kabul */ }
  }

  revalidateTag('muzik');
  return json({ success: true });
}
