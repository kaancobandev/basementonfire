import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

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
  const rawImg = (body.imageUrl ?? '').trim();
  const imageUrl = /^https?:\/\//i.test(rawImg) ? rawImg.slice(0, 500) : null;

  // Hafif spam korumasi: bilgi kartlari HERKESIN feed'ine serpistirildigi icin
  // akis postlarindan daha gorunur. Son 1 saatte 10+ kart -> reddet (flood engeli).
  const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const { count: recentCount } = await db
    .from('did_you_know').select('id', { count: 'exact', head: true })
    .eq('user_id', me.id).gt('created_at', hourAgo);
  if ((recentCount ?? 0) >= 10) {
    return json({ error: 'Çok fazla bilgi kartı paylaştın, biraz sonra tekrar dene.' }, 429);
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
