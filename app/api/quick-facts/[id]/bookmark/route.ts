import { db, getMe } from '@/lib/supabase/server';
import { canViewFact } from '@/lib/visibility';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * 🚨 GÖRÜNÜRLÜK KAPISI — 23.08.2026 güvenlik denetiminde bulundu (KRİTİK).
 *
 * Bu uç YALNIZCA "giriş yapmış mı" diye bakıyordu. `db` service-role olduğu
 * için RLS de korumuyor. Sonuç: herhangi bir üye, `quick_facts.id` ARDIŞIK
 * olduğu için 1..N döngüsüyle GİZLİ bir hesabın gönderilerini kaydedebiliyor,
 * sonra `/bookmarks` sayfasını açınca o gönderilerin media_url'i, caption'ı,
 * sahibinin @adı ve avatarı önüne geliyordu — takip isteği hiç onaylanmadan.
 *
 * Aynı içerik `/p/[id]` üzerinden ERİŞİLEMEZ (postData.ts kapıyı kuruyor),
 * yani bu gerçek bir baypastı, zaten açık olan veri değil.
 *
 * ⛔ Kapı YALNIZCA YAZMA yollarına konur. Silme serbest kalmalı: erişimini
 *    sonradan kaybeden kullanıcı (takipten çıkarıldı / engellendi) eski
 *    kaydını temizleyebilmeli, yoksa listesinde silemediği bir satır kalır.
 */
async function gorebilirMi(postId: number, meId: number) {
  return canViewFact(postId, meId);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ bookmarked: false });

  const { me } = await getMe();
  if (!me) return json({ bookmarked: false });

  const { data } = await db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle();
  return json({ bookmarked: !!data });
}

/**
 * Kaydin KOLEKSIYONUNU belirle (null = kategorisiz, "Tümü"de kalır).
 * POST'tan ayrı bir metot: POST saf aç/kapa kalsın istedik — koleksiyon
 * seçmek kaydı SİLMEMELİ. Gönderi henüz kayıtlı değilse bu istek onu kaydeder,
 * yani "kaydederken koleksiyona ayır" tek adımda çalışır.
 * Tablo/kolon yoksa (SQL çalışmadı) { available:false } döner → istemci sessiz.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { collectionId?: number | null };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const raw = body.collectionId;
  const collectionId = raw === null || raw === undefined ? null : Number(raw);
  if (collectionId !== null && !Number.isFinite(collectionId)) return json({ error: 'Geçersiz koleksiyon' }, 400);

  // SAHIPLIK: başkasının koleksiyonuna yazılamaz. (Kayıt satırı benim olsa da
  // collection_id başka kullanıcının koleksiyonunu gösterebilirdi.)
  if (collectionId !== null) {
    const { data: col, error } = await db
      .from('collections').select('id').eq('id', collectionId).eq('user_id', me.id).maybeSingle();
    if (error) return json({ available: false });
    if (!col) return json({ error: 'Koleksiyon bulunamadı' }, 404);
  }

  const { data: existing } = await db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle();

  // ⚠ Bu uç kayıt YOKSA onu OLUŞTURUYOR (yorumda yazdığı gibi "koleksiyona
  //   ayır" tek adımda çalışsın diye) → ikinci bir yazma kapısı. Kapı burada
  //   da olmazsa POST'u kapatmak işe yaramaz, saldırgan PUT'u kullanır.
  if (!existing && !(await gorebilirMi(postId, me.id)))
    return json({ error: 'Gönderi bulunamadı' }, 404);

  const { error } = existing
    ? await db.from('bookmarks').update({ collection_id: collectionId }).eq('id', existing.id)
    : await db.from('bookmarks').insert({ user_id: me.id, post_id: postId, collection_id: collectionId });
  if (error) return json({ available: false });

  return json({ available: true, bookmarked: true, collectionId });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: existing } = await db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle();

  // Silme ÖNCE gelir ve kapısızdır (yukarıdaki nota bak): erişimini kaybeden
  // kullanıcı eski kaydını temizleyebilmeli.
  if (existing) {
    await db.from('bookmarks').delete().eq('id', existing.id);
    return json({ bookmarked: false });
  }

  // 404 döndürüyoruz, 403 değil: "bu gönderi var ama göremiyorsun" demek,
  // gizli hesabın hangi id aralığında gönderisi olduğunu doğrulardı.
  if (!(await gorebilirMi(postId, me.id)))
    return json({ error: 'Gönderi bulunamadı' }, 404);

  await db.from('bookmarks').insert({ user_id: me.id, post_id: postId });
  return json({ bookmarked: true });
}
