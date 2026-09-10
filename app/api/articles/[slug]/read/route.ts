import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
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

  /* İlerleme de 100'e çekilir. ⚠ ŞART: akıştaki "devam et" kartı satırları
     TEK koşulla süzüyor (percent < 100). Burası yazılmasaydı, okur makaleyi
     bitirdikten sonra bile yarım kalmış ilerleme satırı kartta asılı kalır ve
     kart kullanıcıyı bitirdiği makaleye geri çağırırdı.
     Hata YUTULUR: "okundu" işareti yukarıda zaten yazıldı, göç çalışmamış
     olsa bile okuma akışı bundan etkilenmemeli. */
  await db.rpc('article_progress_kaydet', { p_user_id: me.id, p_slug: slug, p_percent: 100 });

  /* Koleksiyon kontrolü YANIT İÇİNDE (eskiden `after()` ile yanıttan SONRAydı).
     Sebep: `after()` rozeti yazıyordu ama yanıt yalnız {ok:true} olduğu için
     istemci rozeti KAZANDIĞINI hiç öğrenemiyordu — kategoriyi tamamlayan okur
     kutlamayı ancak bir sonraki sayfa yüklemesinde, sessizce görüyordu.
     ⚠ Bunun okura MALİYETİ YOK: beacon fire-and-forget çağrılıyor
     (ArticleDiscussion.tsx:66, yanıt okunmadan atılıyordu) ve `after()` de
     fonksiyonu zaten ayakta tutuyordu. Yani aynı iş, aynı süre — tek fark
     sonucun artık dönüyor olması.
     Yaygın durum TEK ek sorgu: kategori en fazla ~8 slug. */
  let newBadge: { key: string; name: string; emoji: string } | null = null;
  try {
    const category = ARTICLE_MAP[slug]?.category;
    const badgeKey = category ? CATEGORY_BADGE_KEYS[category] : null;
    if (badgeKey && BADGE_MAP[badgeKey]) {
      const categorySlugs = ARTICLES.filter((a) => a.category === category).map((a) => a.slug);
      const { data: reads } = await db
        .from('article_reads').select('article_slug')
        .eq('user_id', me.id).in('article_slug', categorySlugs);
      const readCount = new Set(((reads ?? []) as { article_slug: string }[]).map((r) => r.article_slug)).size;
      if (readCount >= categorySlugs.length) {
        const { data: owned } = await db
          .from('user_badges').select('badge_key')
          .eq('user_id', me.id).eq('badge_key', badgeKey).maybeSingle();
        // Rozet YALNIZ ilk kez yazıldığında bildirilir; her yeniden okumada
        // kutlama açılsaydı kutlama anlamını yitirirdi.
        if (!owned) {
          await db.from('user_badges').insert({ user_id: me.id, badge_key: badgeKey });
          newBadge = { key: badgeKey, name: BADGE_MAP[badgeKey].name, emoji: BADGE_MAP[badgeKey].emoji };
        }
      }
    }
  } catch { /* rozet best-effort — okuma işareti yine de yazıldı */ }

  return json({ ok: true, newBadge });
}
