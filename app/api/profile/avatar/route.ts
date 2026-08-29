import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const PUBLIC_PREFIX = '/storage/v1/object/public/media/';
const MAX_GIF = 10 * 1024 * 1024;
const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Avatar commit. İki yol:
 *  1) { path }     — dosya tarayıcıdan doğrudan Supabase'e (imzalı URL ile) yüklenmiş;
 *                    burada yalnızca DB güncellenir (Netlify gövde limitine takılmaz).
 *  2) { giphyUrl } — GIPHY'den seçilen GIF; sunucu KÜÇÜK rendition'ı indirip kendi
 *                    storage'ımıza koyar (kalıcı + kendi CDN'imiz; her render'da
 *                    Giphy'ye gidilmez). SSRF koruması: yalnızca giphy.com host'ları.
 */
/** https + *.giphy.com mu? İSTEK ÖNCESİ ve YÖNLENDİRME SONRASI aynı kural.
 *  Tek fonksiyon: iki kontrolün ayrışması tam da kapatılan açığı geri getirirdi. */
function giphyHostuMu(ham: string): boolean {
  let u: URL;
  try { u = new URL(ham); } catch { return false; }
  return u.protocol === 'https:' && /(^|\.)giphy\.com$/i.test(u.hostname);
}

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş yapılmamış' }, 401);

  let body: { path?: string; giphyUrl?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const giphyUrl = (body.giphyUrl ?? '').trim();
  const path = (body.path ?? '').trim();

  let storedPath: string;
  let avatarUrl: string;

  if (giphyUrl) {
    // SSRF koruması: sadece https + *.giphy.com (kural giphyHostuMu'da, TEK yer).
    if (!giphyHostuMu(giphyUrl)) {
      return json({ error: 'Yalnızca GIPHY GIF\'leri kabul edilir.' }, 400);
    }

    let resp: Response;
    try {
      // ⏱ Zaman aşımı: hedefi saldırgan seçiyor — cevap vermeyen bir adres
      //    fonksiyonu asılı bırakırdı.
      resp = await fetch(giphyUrl, { signal: AbortSignal.timeout(8000) });
    } catch { return json({ error: 'GIF indirilemedi.' }, 502); }
    if (!resp.ok) return json({ error: 'GIF indirilemedi.' }, 502);

    /* 🚨 YÖNLENDİRME SONRASI TEKRAR DOĞRULA — 26.08.2026 denetimi.
       Host kontrolü isteğin BAŞINDA yapılıyordu, ama `fetch` yönlendirmeleri
       varsayılan olarak TAKİP EDER. Ölçüldü: yönlendirme zincirinin sonunda
       `resp.url` bambaşka bir adres gösteriyor. Yani giphy.com üzerinde açık
       yönlendirme bulan biri sunucuya İSTEDİĞİ adresi çektirebilirdi — iç ağ
       dahil (SSRF). Üstelik gelen baytlar avatar olarak SAKLANIP sonra
       görüntülenebildiği için bu 'kör' bir SSRF bile olmazdı.
       `content-type: image/*` şartı yaygın metadata uçlarını eliyordu ama
       garanti değil: SON adres de aynı kuraldan geçmeli. */
    if (!giphyHostuMu(resp.url)) {
      return json({ error: 'Yalnızca GIPHY GIF\'leri kabul edilir.' }, 400);
    }
    const ct = resp.headers.get('content-type') ?? '';
    if (!ct.startsWith('image/')) return json({ error: 'Geçersiz GIF.' }, 400);

    const buf = await resp.arrayBuffer();
    if (buf.byteLength === 0) return json({ error: 'Boş GIF.' }, 400);
    if (buf.byteLength > MAX_GIF) return json({ error: 'GIF çok büyük.' }, 400);

    storedPath = `avatars/${me.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.gif`;
    const { error: upErr } = await db.storage
      .from('media')
      .upload(storedPath, buf, { contentType: 'image/gif', upsert: true });
    if (upErr) return json({ error: 'GIF kaydedilemedi.' }, 500);
    avatarUrl = db.storage.from('media').getPublicUrl(storedPath).data.publicUrl;
  } else {
    // İmza route'u avatar yolunu "avatars/{me.id}-..." üretir → sahiplik doğrula.
    if (!path.startsWith(`avatars/${me.id}-`)) return json({ error: 'Geçersiz dosya yolu.' }, 400);
    storedPath = path;
    avatarUrl = db.storage.from('media').getPublicUrl(path).data.publicUrl;
  }

  const { error } = await db.from('users').update({ avatar: avatarUrl }).eq('id', me.id);
  if (error) return json({ error: 'Avatar kaydedilemedi.' }, 500);

  // Eski avatarı storage'dan temizle (varsa, yenisiyle aynı değilse)
  const old = me.avatar as string | null;
  if (old && old.includes(PUBLIC_PREFIX)) {
    const oldPath = old.split(PUBLIC_PREFIX)[1];
    if (oldPath && oldPath.startsWith('avatars/') && oldPath !== storedPath) {
      try { await db.storage.from('media').remove([oldPath]); } catch {}
    }
  }

  return json({ avatar_url: avatarUrl });
}
