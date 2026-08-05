import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clampText } from '@/lib/articleSanitize';
import { submitToIndexNow, articleUrl, isLiveRequest } from '@/lib/indexnow';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Onay kuyrugu — yalnizca admin.
 * action: 'approve' | 'reject'            -> makalenin kendisi (ilk yayin)
 *         'approve_edit' | 'reject_edit'  -> YAYINDAKI makaleye onerilen duzenleme
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  if (!isAdmin(me as any)) return json({ error: 'Yetkin yok' }, 403);

  const id = Number((await params).id);
  if (!Number.isFinite(id)) return json({ error: 'Geçersiz id' }, 400);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const { data: existing } = await db.from('user_articles')
    .select('id, slug, status, published_at, pending_edit')
    .eq('id', id).maybeSingle();
  if (!existing) return json({ error: 'Makale bulunamadı' }, 404);

  // ── Yayindaki makaleye onerilen duzenlemenin onayi ──
  if (body.action === 'approve_edit' || body.action === 'reject_edit') {
    const oneri = existing.pending_edit as any;
    // Iki admin ayni kuyrugu acip pes pese basarsa ikincisi bos oneri
    // uygulamasin — sessiz veri kaybi olurdu.
    if (!oneri) return json({ error: 'Bekleyen düzenleme yok (başka bir yönetici işlemiş olabilir).' }, 409);

    if (body.action === 'reject_edit') {
      const reason = clampText(body.reason, 300);
      const { error } = await db.from('user_articles')
        .update({ pending_edit: null, pending_at: null, pending_reject_reason: reason || null })
        .eq('id', id);
      if (error) return json({ error: 'Reddedilemedi.' }, 500);
      // Canli makale hic degismedi -> revalidate GEREKMEZ.
      return json({ ok: true, edit: 'rejected' });
    }

    // approve_edit: onerilen surum canli alanlarin uzerine gecer.
    // Onemli: slug DEGISMEZ (duzenleme slug tasimaz) -> yayindaki adres,
    // gelen baglantilar ve arama motoru kaydi korunur.
    const { error } = await db.from('user_articles')
      .update({
        title: oneri.title,
        summary: oneri.summary,
        cover_url: oneri.cover_url ?? null,
        category: oneri.category ?? null,
        doc: oneri.doc,
        sources: oneri.sources,
        updated_at: new Date().toISOString(),
        pending_edit: null,
        pending_at: null,
        pending_reject_reason: null,
      })
      .eq('id', id);
    if (error) return json({ error: 'Onaylanamadı.' }, 500);
    revalidateTag('feed'); // baslik/ozet/kapak degismis olabilir -> listeler tazelensin
    if (existing.slug) revalidatePath(`/makale/${existing.slug}`);
    return json({ ok: true, edit: 'approved' });
  }

  if (body.action === 'approve') {
    const patch: Record<string, unknown> = { status: 'approved', reject_reason: null };
    if (!existing.published_at) patch.published_at = new Date().toISOString();
    const { error } = await db.from('user_articles').update(patch).eq('id', id);
    if (error) return json({ error: 'Onaylanamadı.' }, 500);
    revalidateTag('feed'); // Keşfet/feed onbellegini tazele -> makale gorunur olsun
    // /makale/[slug] artik ISR: onaydan ONCE istenmisse 404 onbellege girmis
    // olabilir — purge et ki makale aninda erisilebilir olsun.
    if (existing.slug) revalidatePath(`/makale/${existing.slug}`);
    // Yayına giren makaleyi arama motorlarına ANINDA bildir (yalnız canlı üretimde).
    if (existing.slug && isLiveRequest(req)) await submitToIndexNow(articleUrl(existing.slug));
    return json({ ok: true, status: 'approved' });
  }

  if (body.action === 'reject') {
    const reason = clampText(body.reason, 300);
    // Makalenin kendisi reddediliyorsa bekleyen duzenlemesi de dusmeli; yoksa
    // yayindan kaldirilmis bir makalenin duzenlemesi kuyrukta asili kalirdi.
    const { error } = await db.from('user_articles')
      .update({ status: 'rejected', reject_reason: reason || null, pending_edit: null, pending_at: null })
      .eq('id', id);
    if (error) return json({ error: 'Reddedilemedi.' }, 500);
    if (existing.status === 'approved') revalidateTag('feed');
    // Yayindaydiysa ISR'daki kopyasi dusmeli (rota artik 404 vermeli).
    if (existing.slug) revalidatePath(`/makale/${existing.slug}`);
    return json({ ok: true, status: 'rejected' });
  }

  return json({ error: 'Geçersiz işlem' }, 400);
}
