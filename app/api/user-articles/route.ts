import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { slugify, LIMITS, ARTICLE_CATEGORIES } from '@/lib/userArticles';
import { normalizeDoc, normalizeSources, clampText, isAllowedMediaUrl } from '@/lib/articleSanitize';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Yeni kullanici makalesi olusturur — DAIMA status='pending' (onay kuyrugu).
 * Govde icindeki gorseller/kapak, kullanicinin kendi storage path'i olmak
 * zorundadir; prose sunucuda sanitize edilir; interaktif bloklar oldugu gibi
 * saklanir (render'da sandbox iframe izolasyonu uygular).
 */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const title = clampText(body.title, LIMITS.title);
  if (title.length < 3) return json({ error: 'Başlık en az 3 karakter olmalı.' }, 400);
  const summary = clampText(body.summary, LIMITS.summary);
  const category = ARTICLE_CATEGORIES.includes(body.category) ? body.category : null;

  // Yalnizca kullanicinin kendi yukledigi (me.id/ ile baslayan) path'ler kabul.
  const mediaUrl = (path: string): string | null =>
    path.startsWith(`${me.id}/`) ? db.storage.from('media').getPublicUrl(path).data.publicUrl : null;

  let cover_url: string | null = null;
  if (typeof body.coverPath === 'string' && body.coverPath) cover_url = mediaUrl(body.coverPath);
  else if (isAllowedMediaUrl(body.coverUrl)) cover_url = body.coverUrl;

  const doc = normalizeDoc(body.doc, mediaUrl);
  if (doc.length === 0) return json({ error: 'Makale boş olamaz — en az bir içerik bloğu ekle.' }, 400);
  const sources = normalizeSources(body.sources);

  if (JSON.stringify(doc).length > LIMITS.docBytes) return json({ error: 'Makale çok büyük.' }, 413);

  // Onay kuyrugunu doldurmayi sinirla.
  const { count } = await db.from('user_articles').select('*', { count: 'exact', head: true })
    .eq('user_id', me.id).eq('status', 'pending');
  if ((count ?? 0) >= LIMITS.pendingPerUser)
    return json({ error: `Aynı anda en fazla ${LIMITS.pendingPerUser} makalen incelemede olabilir.` }, 429);

  // Saatlik olusturma siniri (reddedilen satirlar pending'i bosaltinca dahi
  // sinirsiz buyuk-doc ekleme yapilmasin -> DB/queue bloat'ina karsi).
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count: recent } = await db.from('user_articles').select('*', { count: 'exact', head: true })
    .eq('user_id', me.id).gt('created_at', hourAgo);
  if ((recent ?? 0) >= 20)
    return json({ error: 'Çok sık makale gönderiyorsun, biraz bekle.' }, 429);

  // Benzersiz slug.
  const base = slugify(title);
  let slug = base;
  for (let i = 0; i < 6; i++) {
    const { data: ex } = await db.from('user_articles').select('id').eq('slug', slug).maybeSingle();
    if (!ex) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data, error } = await db.from('user_articles')
    .insert({ user_id: me.id, slug, title, summary, cover_url, category, doc, sources, status: 'pending' })
    .select('id, slug')
    .single();

  if (error || !data) return json({ error: 'Makale kaydedilemedi.' }, 500);
  return json({ ok: true, id: data.id, slug: data.slug, status: 'pending' }, 201);
}
