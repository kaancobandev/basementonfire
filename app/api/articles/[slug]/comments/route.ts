import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isArticleSlug } from '@/lib/articles';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Makaleye yorum ekle. content React metin dugumu olarak escape edilir (XSS yok);
// 1-500 karakter. article_slug yalniz bilinen makalelerle sinirli (spam engeli).
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isArticleSlug(slug)) return json({ error: 'Bilinmeyen makale' }, 404);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { content?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const content = (body.content ?? '').trim();
  if (!content) return json({ error: 'Boş yorum' }, 400);
  if (content.length > 500) return json({ error: 'En fazla 500 karakter' }, 400);

  // Hafif spam korumasi: son 60sn'de 8+ yorum -> 429.
  const minuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const { count: recent } = await db
    .from('article_comments').select('id', { count: 'exact', head: true })
    .eq('user_id', me.id).gt('created_at', minuteAgo);
  if ((recent ?? 0) >= 8) return json({ error: 'Çok hızlı yorum yapıyorsun, biraz bekle.' }, 429);

  const { data, error } = await db
    .from('article_comments')
    .insert({ article_slug: slug, user_id: me.id, content })
    .select('id, content, created_at')
    .single();
  if (error) return json({ error: 'Yorum eklenemedi' }, 500);

  return json({
    comment: { ...data, username: me.username, display_name: me.display_name, avatar: me.avatar ?? null, is_mine: true },
  });
}
