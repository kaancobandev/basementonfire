import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { LIMITS, ARTICLE_CATEGORIES } from '@/lib/userArticles';
import { normalizeDoc, normalizeSources, clampText, isAllowedMediaUrl } from '@/lib/articleSanitize';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Kendi makaleni duzenle. Her duzenleme makaleyi TEKRAR 'pending' yapar
 * (yeniden inceleme) — yayindaki bir makale duzenlenince onaya geri doner.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return json({ error: 'Geçersiz id' }, 400);

  const { data: existing } = await db.from('user_articles').select('id, user_id, updated_at').eq('id', id).maybeSingle();
  if (!existing) return json({ error: 'Makale bulunamadı' }, 404);
  if (existing.user_id !== me.id) return json({ error: 'Yetkin yok' }, 403);
  // Sik tekrarli (scriptlenmis) buyuk yazimlari engelle — basit debounce.
  if (existing.updated_at && Date.now() - new Date(existing.updated_at).getTime() < 5000)
    return json({ error: 'Çok hızlı düzenliyorsun, birkaç saniye bekle.' }, 429);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const title = clampText(body.title, LIMITS.title);
  if (title.length < 3) return json({ error: 'Başlık en az 3 karakter olmalı.' }, 400);
  const summary = clampText(body.summary, LIMITS.summary);
  const category = ARTICLE_CATEGORIES.includes(body.category) ? body.category : null;

  const mediaUrl = (path: string): string | null =>
    path.startsWith(`${me.id}/`) ? db.storage.from('media').getPublicUrl(path).data.publicUrl : null;

  let cover_url: string | null = null;
  if (typeof body.coverPath === 'string' && body.coverPath) cover_url = mediaUrl(body.coverPath);
  else if (isAllowedMediaUrl(body.coverUrl)) cover_url = body.coverUrl;

  const doc = normalizeDoc(body.doc, mediaUrl);
  if (doc.length === 0) return json({ error: 'Makale boş olamaz.' }, 400);
  const sources = normalizeSources(body.sources);
  if (JSON.stringify(doc).length > LIMITS.docBytes) return json({ error: 'Makale çok büyük.' }, 413);

  // NOT: published_at KORUNUR (null'lanmaz) -> bir kez yayinlanan makalenin ozgun
  // yayin tarihi duzenlemede kaybolmaz. Duzenleme status'u tekrar 'pending' yapar
  // (yeniden inceleme); onaylaninca moderate route published_at'i (doluysa) korur.
  const { error } = await db.from('user_articles')
    .update({ title, summary, cover_url, category, doc, sources, status: 'pending', reject_reason: null, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return json({ error: 'Güncellenemedi.' }, 500);

  revalidateTag('feed'); // yayindaydiysa Keşfet'ten dussun (tekrar onaya kadar)
  return json({ ok: true, status: 'pending' });
}

/** Kendi makaleni (veya admin herhangi birini) sil. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return json({ error: 'Geçersiz id' }, 400);

  const { data: existing } = await db.from('user_articles').select('id, user_id, status').eq('id', id).maybeSingle();
  if (!existing) return json({ error: 'Makale bulunamadı' }, 404);
  if (existing.user_id !== me.id && !isAdmin(me as any)) return json({ error: 'Yetkin yok' }, 403);

  const { error } = await db.from('user_articles').delete().eq('id', id);
  if (error) return json({ error: 'Silinemedi.' }, 500);
  if (existing.status === 'approved') revalidateTag('feed');
  return json({ ok: true });
}
