import { db, getMe } from '@/lib/supabase/server';
import { NextResponse, after } from 'next/server';
import { ARTICLES, ARTICLE_MAP, isArticleSlug } from '@/lib/articles';
import { CATEGORY_BADGE_KEYS, BADGE_MAP } from '@/lib/badges';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// "Okundu" işareti — makale sonuna ulaşan girişli kullanıcı için beacon
// (ArticleDiscussion'ın mevcut IntersectionObserver'ı tetikler). Tekrar okuma
// yeni satır üretmez (PK). Kategori tamamlanınca koleksiyon rozeti yazılır.
// article_reads tablosu yoksa (SQL çalışmadıysa) sessizce 503 → istemci umursamaz.
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isArticleSlug(slug)) return json({ error: 'Bilinmeyen makale' }, 404);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { error } = await db.from('article_reads').insert({ user_id: me.id, article_slug: slug });
  if (error && error.code !== '23505') return json({ available: false }, 503);

  // Koleksiyon kontrolü — yanıt sonrası (okuma beacon'ı bekletilmez).
  after(async () => {
    try {
      const category = ARTICLE_MAP[slug]?.category;
      const badgeKey = category ? CATEGORY_BADGE_KEYS[category] : null;
      if (!badgeKey || !BADGE_MAP[badgeKey]) return;

      const categorySlugs = ARTICLES.filter((a) => a.category === category).map((a) => a.slug);
      const { data: reads } = await db
        .from('article_reads').select('article_slug')
        .eq('user_id', me.id).in('article_slug', categorySlugs);
      const readCount = new Set((reads ?? []).map((r: any) => r.article_slug)).size;
      if (readCount < categorySlugs.length) return;

      const { data: owned } = await db
        .from('user_badges').select('badge_key')
        .eq('user_id', me.id).eq('badge_key', badgeKey).maybeSingle();
      if (!owned) await db.from('user_badges').insert({ user_id: me.id, badge_key: badgeKey });
    } catch { /* rozet best-effort */ }
  });

  return json({ ok: true });
}
