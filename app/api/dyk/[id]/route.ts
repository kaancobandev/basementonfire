import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Bilgi kartını yayından kaldır.
 *
 * 🚨 NEDEN VAR (26.08.2026 denetimi — MODERASYON BOŞLUĞU):
 * `/api/did-you-know` POST'u herhangi bir GİRİŞLİ üyeye açık, kart onaysız
 * yayına giriyor ve `revalidateTag('feed')` ile ANONİM ana sayfaya çıkıyor
 * (ölçüldü: çıkışlı `curl https://basementonfire.com/` gövdesinde kart metni).
 * Buna karşılık repo genelinde `did_you_know` üzerine TEK BİR update/delete
 * yoktu: ne sahibi ne yönetici kendi arayüzünden kaldırabiliyordu. Tek çare
 * Supabase SQL editöründen elle UPDATE'ti.
 *
 * Kart 140 karakter başlık + 1000 karakter gövde + kullanıcının yüklediği
 * GÖRSEL taşıyor. 5651/KVKK açısından "derhal kaldırma" yükümlülüğü olan bir
 * yüzeyde uygulama içi kaldırma yolunun hiç olmaması gerçek bir boşluk.
 *
 * ⚠ SİLMİYOR, `active = false` YAPIYOR — bilerek:
 *   · `getDidYouKnow` zaten `.eq('active', true)` süzüyor, yani kart anında
 *     akıştan düşer (lib/feedData.ts),
 *   · geri alınabilir: yanlış kaldırma veri kaybı olmaz,
 *   · `dyk_likes` gibi bağlı satırlar cascade ile uçmaz.
 *
 * ⛔ ŞİKAYET KUYRUĞUNA BAĞLAMADIM. `lib/reports.ts` REPORT_TARGET_TYPES'a 'dyk'
 *    eklemek YETMEZ: canlıda `reports_target_type_check` kısıtı beş türü
 *    sabitliyor (goc-dokum/schema.sql:1357) → insert 23514 ile patlardı. O iş
 *    SQL göçü + /yonetim/sikayetler dalı gerektiriyor, ayrı ele alınmalı.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dykId = Number(id);
  if (!Number.isInteger(dykId) || dykId < 1) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: kart } = await db
    .from('did_you_know').select('id, user_id').eq('id', dykId).maybeSingle();
  // Var olmayan kart ile yetkin olmayan kart AYNI yanıtı verir → id aralığı sızmaz.
  if (!kart) return json({ error: 'Kart bulunamadı' }, 404);
  if (kart.user_id !== me.id && !isAdmin(me)) return json({ error: 'Kart bulunamadı' }, 404);

  const { error } = await db.from('did_you_know').update({ active: false }).eq('id', dykId);
  if (error) return json({ error: 'Kaldırılamadı' }, 500);

  // Kart ana sayfada; önbellek tazelenmezse bir saat daha görünmeye devam eder.
  revalidateTag('feed');
  return json({ ok: true });
}
