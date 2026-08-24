import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { limit, tooMany } from '@/lib/rateLimit';
import { isAllowedMediaUrl } from '@/lib/articleSanitize';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giris gerekli' }, 401);

  let body: { title?: string; body?: string; sourceUrl?: string; sourceLabel?: string; articleSlug?: string; imageUrl?: string };
  try { body = await req.json(); } catch { return json({ error: 'Gecersiz istek' }, 400); }

  const title = (body.title ?? '').trim();
  const text = (body.body ?? '').trim();
  if (!title || !text) return json({ error: 'Baslik ve metin gerekli' }, 400);
  if (title.length > 140) return json({ error: 'Baslik en fazla 140 karakter' }, 400);
  if (text.length > 1000) return json({ error: 'Metin en fazla 1000 karakter' }, 400);

  const trimOrNull = (s?: string, max = 300) => { const v = (s ?? '').trim(); return v ? v.slice(0, max) : null; };
  // Kaynak URL'i SADECE http(s) kabul et -> javascript: gibi tehlikeli href'leri engelle (XSS).
  const rawUrl = (body.sourceUrl ?? '').trim();
  const sourceUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl.slice(0, 500) : null;
  // Makale slug'i: yalniz harf/rakam/tire (path enjeksiyonu engellenir).
  const slug = (body.articleSlug ?? '').trim().replace(/[^a-z0-9-]/gi, '').slice(0, 80) || null;
  // Gorsel URL'i de http(s) ile sinirli.
  /* 🚨 YALNIZ KENDİ DEPOLAMAMIZ — 23.08.2026 güvenlik denetimi.
     Önceki kural `/^https?:\/\//` idi, yani HERHANGİ bir dış adres kabul
     ediliyordu. Bilgi kartları onay beklemeden yayına giriyor ve `/` ISR
     önbelleği `revalidateTag('feed')` ile anında düştüğü için kart ANONİM
     ziyaretçilere de servis edilen ANA SAYFAYA çıkıyor. Sonuç: herhangi bir
     üye `imageUrl` olarak kendi sunucusunu verip ana sayfayı açan HER
     ziyaretçinin (girişsizler dâhil) IP'sini, User-Agent'ını ve Referer'ını
     kendi sunucusuna düşürebiliyordu — bir izleme pikseli. Üstelik görselin
     içeriği DB'ye hiç dokunmadan sonradan değiştirilebilirdi (moderasyonun
     göremeyeceği içerik takası).
     `lib/img.ts` supabase.co dışını Netlify Image CDN'e sokmadığı için
     tarayıcıya ORİJİNAL adres veriliyordu, yani proxy koruması da yoktu.
     Artık makale gövdesiyle AYNI tek kaynak süzgeci: yalnızca kendi public
     media yolumuz. İstemci görseli /api/storage/sign ile yüklemek zorunda. */
  const rawImg = (body.imageUrl ?? '').trim();
  const imageUrl = isAllowedMediaUrl(rawImg) ? rawImg : null;

  // Spam freni → lib/rateLimit.ts (token bucket). Hiz eskisiyle AYNI: saatte 10.
  // Bilgi kartlari HERKESIN feed'ine serpistirildigi icin akis postlarindan daha
  // gorunur; tavan bu yuzden gonderiden daha sikidir.
  const gate = await limit('dyk', req.headers, me.id);
  if (!gate.ok) {
    return tooMany('Çok fazla bilgi kartı paylaştın, biraz sonra tekrar dene.', gate, 'dyk');
  }

  const { data, error } = await db.from('did_you_know').insert({
    user_id: me.id,
    title,
    body: text,
    source_url: sourceUrl,
    source_label: trimOrNull(body.sourceLabel, 80),
    article_slug: slug,
    image_url: imageUrl,
  }).select('id').single();

  if (error) return json({ error: error.message }, 500);
  revalidateTag('feed'); // yeni bilgi karti feed'de hemen gorunur
  return json({ id: data.id }, 201);
}
