import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isArticleSlug } from '@/lib/articles';
import { limit, tooMany } from '@/lib/rateLimit';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Okuma İLERLEMESİ (0-99). Akıştaki "devam et" kartını besler.
 *
 * ⚠ "BİTTİ" BURASI DEĞİL: makalenin bitişini `../read` yazıyor (o hem
 * `article_reads` satırını atıyor hem koleksiyon rozetini tetikliyor). Bu uç
 * yalnızca "nereye kadar gelindi"yi tutuyor ve 100 KABUL ETMİYOR — iki ucun da
 * bitişi yazması, rozet eklemede yarış demek olurdu.
 *
 * Yazma `article_progress_kaydet` RPC'siyle: ilerleme GERİ GİTMEMELİ ve bunu
 * atomik yapan tek yer orası (sql/features-okuma-ilerlemesi.sql).
 */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isArticleSlug(slug)) return json({ error: 'Bilinmeyen makale' }, 404);

  const { me } = await getMe();
  // Anonim okurda ilerleme TUTULMAZ: satır user_id'ye bağlı. Sessiz 401,
  // istemci zaten girişli değilse hiç çağırmıyor.
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  /* Fren `beacon` kovasından — /api/hit ve /api/perf ile aynı kural, AMA aynı
     kovada değil: anahtar `beacon:<kimlik>` biçiminde ve burada kimlik
     kullanıcı id'si, orada IP. Yani okuma beacon'ı sayfa görüntüleme
     beacon'ının bütçesini yemiyor. Saatte 600 bu uç için fazlasıyla geniş:
     istemci en fazla 5 puanda bir ve 10 saniyede bir gönderiyor. */
  const fren = await limit('beacon', req.headers, me.id);
  if (!fren.ok) return tooMany('Çok sık kaydediliyor.', fren, 'beacon');

  let percent = 0;
  try {
    const govde = await req.json();
    const p = Number(govde?.percent);
    if (!Number.isFinite(p)) return json({ error: 'Geçersiz ilerleme' }, 400);
    percent = Math.round(p);
  } catch {
    return json({ error: 'Geçersiz gövde' }, 400);
  }
  // İstemciden gelen sayıya güvenilmez (beacon elle de atılabilir). RPC de
  // ayrıca kırpıyor, bu ilk savunma hattı.
  if (percent <= 0) return json({ ok: true, percent: 0 });
  percent = Math.min(99, percent);

  const { data, error } = await db.rpc('article_progress_kaydet', {
    p_user_id: me.id, p_slug: slug, p_percent: percent,
  });
  // Tablo/fonksiyon yoksa (göç çalışmadıysa) sessizce geç — okuma akışı
  // bundan etkilenmemeli.
  if (error) return json({ ok: false }, 503);

  return json({ ok: true, percent: data ?? percent });
}
