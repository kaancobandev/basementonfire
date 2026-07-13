import { db, getMe } from '@/lib/supabase/server';
import { archiveAndDeleteFact } from '@/lib/deleteFact';
import { NextResponse, after } from 'next/server';
import { submitToIndexNow, postUrl, profileUrl, isLiveRequest } from '@/lib/indexnow';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Kullanıcı kendi medya gönderisini siler. İçerik YOK EDİLMEZ: medya gizli
 * `deleted_media` arşivine + private `archive` bucket'ına taşınır (bkz lib/deleteFact).
 * Aynı silme mantığını admin moderasyon kuyruğu da kullanır (tek kaynak).
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factId = Number(id);
  if (!factId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  // select('*') → `media` kolonu varsa gelir, yoksa hata vermez (geriye dönük uyum)
  const { data: fact, error: fErr } = await db
    .from('quick_facts')
    .select('*')
    .eq('id', factId)
    .single();
  if (fErr || !fact) return json({ error: 'İçerik bulunamadı' }, 404);
  if (fact.user_id !== me.id) return json({ error: 'Bu içeriği silme yetkin yok' }, 403);

  const res = await archiveAndDeleteFact(fact);
  if (!res.ok) return json({ error: res.error ?? 'Silinemedi' }, 500);

  // Silinen gönderi sayfasını IndexNow'a bildir → motorlar yeniden tarar, 404 görüp
  // dizinden hızla düşürür. Profil ızgarası da değiştiği için onu da bildir.
  // Yalnızca gerçek üretim isteğinde ve gizli olmayan hesapta (içerik dizine girer).
  if (!me.is_private && isLiveRequest(req)) {
    after(() => submitToIndexNow([postUrl(factId), profileUrl(me.username)]));
  }

  return json({ ok: true });
}
