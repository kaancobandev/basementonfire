import { db, getMe } from '@/lib/supabase/server';
import { markConversationRead } from '@/lib/dm';
import { imzaHaritasi, adresSec, IMZA } from '@/lib/storyMedia';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const convId = Number(id);
  if (!convId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: conv } = await db.from('conversations').select('id, user1_id, user2_id').eq('id', convId).single();
  if (!conv || (conv.user1_id !== me.id && conv.user2_id !== me.id)) return json({ error: 'Erişim reddedildi' }, 403);

  // Limitsizdi → uzun bir sohbeti açmak TÜM geçmişi (her satırda gönderen
  // embed'iyle) taşıyordu. En YENİ 500 mesajı çekip ters çeviriyoruz; artan
  // sıralamayla limit koymak en ESKİ 500'ü verirdi (yanlış uç).
  // TODO: 500'ü aşan sohbetler için cursor'lı sayfalama (yukarı kaydırınca yükle).
  // story embed'i yalnız sql/features-story-highlights-reply.sql çalıştırıldıysa
  // vardır (messages.story_id). Önce zenginini dene; kolon/ilişki yoksa sade
  // select'e düş → mevcut DM yüklemesi ASLA kırılmaz, yalnız "hikayeye yanıt"
  // rozeti düşer.
  // İki opsiyonel parça, İKİ AYRI göçe bağlı ve BAĞIMSIZ:
  //  • media_url/media_type kolonları  → sql/features-dm-media.sql
  //  • story_id + stories embed'i      → sql/features-story-highlights-reply.sql
  // Bu yüzden düz ikili "zengin→sade" düşüşü yetmez (biri eksikse diğerini de
  // düşürürdü). Kademeli dene, HANGİ parça eksikse SADECE onu çıkar; böylece
  // örn. story CANLI ama media SQL beklerken hikaye-yanıt rozeti KAYBOLMAZ.
  const BASE = 'id, content, sender_id, is_read, created_at, users:sender_id(id, username, display_name, avatar)';
  // `media_path` ŞART: DM eki artık private `dm` kovasında, `media_url` boş.
  const MEDIA = `${BASE}, media_path, media_url, media_type`;
  // ⚠ `media_path` DE SEÇİLİYOR: hikâye medyası artık private `stories` kovasında
  //   ve `media_url` yeni satırlarda BOŞ. Yalnız media_url seçilirse bu önizleme
  //   sessizce kırık görsel gösterir (23.08.2026'da tam bu şekilde kırıldı).
  const withStory = (b: string) => `${b}, story_id, story:stories!messages_story_id_fkey(media_path, media_url, media_type)`;
  const isStoryErr = (m: string) => /story_id|messages_story_id_fkey|stories/i.test(m);
  const isMediaErr = (m: string) => /media_path|media_url|media_type/i.test(m);
  const run = (sel: string) => db.from('messages').select(sel)
    .eq('conversation_id', convId).order('created_at', { ascending: false }).limit(500) as any;

  let mediaEnabled = true;
  let sel: { data: any[] | null; error: { message: string } | null } = await run(withStory(MEDIA));
  if (sel.error && isStoryErr(sel.error.message)) sel = await run(MEDIA);         // story yok → media'yı koru
  if (sel.error && isMediaErr(sel.error.message)) { mediaEnabled = false; sel = await run(withStory(BASE)); } // media yok → story'yi koru
  if (sel.error && isStoryErr(sel.error.message)) sel = await run(BASE);          // ikisi de yok → çıplak
  const messages = sel.data;

  await markConversationRead(convId, me.id);

  // ERKEN UYARI — sayfalama henüz yok. 500'e dayanan bir sohbette eski mesajlar
  // arayüzde GÖRÜNMEZ olur (yukarı kaydırınca yükleme yok). Şu an en uzun sohbet
  // bu sınırın çok altında, o yüzden sayfalama yazmak erken optimizasyon olurdu;
  // ama sessizce veri kaybı gibi görünmesin diye eşiğe yaklaşınca log düşüyoruz.
  // Bu satır fonksiyon loglarında görülürse: cursor'lı sayfalama zamanı gelmiştir.
  if ((messages?.length ?? 0) >= 400) {
    console.warn(`[dm] sohbet ${convId}: ${messages?.length} mesaj — 500 sınırına yaklaşıldı, sayfalama gerekiyor`);
  }

  /* Hikâye yanıtı önizlemesi: private kovadaki yolu İMZALA ve `media_path`i
     istemciye GÖNDERME (yol dışarı çıkmasın — lib/storyMedia.ts'teki kuralın
     aynısı). Yol yoksa eski public `media_url`e düşülür. */
  const sirali = (messages ?? []).reverse();

  /* DM eki: private `dm` kovasındaki yolu İMZALA, `media_path`i istemciye GÖNDERME.
     Bu rota zaten katılımcı kapısından geçiyor (yukarıdaki 403), yani imza yalnız
     konuşmanın taraflarına verilir — public adresin hiç sorulmayan sorusu buydu. */
  const dmYollari = sirali
    .map((m: any) => m?.media_path)
    .filter((y: any): y is string => typeof y === 'string' && !!y);
  if (dmYollari.length) {
    const dmHarita = await imzaHaritasi(dmYollari, IMZA.ISTEK, 'dm');
    for (const m of sirali as any[]) {
      if (!m?.media_path) continue;
      m.media_url = adresSec(m.media_path, m.media_url, dmHarita);
      delete m.media_path;
    }
  }
  const yollar = sirali
    .map((m: any) => m?.story?.media_path)
    .filter((y: any): y is string => typeof y === 'string' && !!y);
  if (yollar.length) {
    const harita = await imzaHaritasi(yollar, IMZA.ISTEK);
    for (const m of sirali as any[]) {
      if (!m?.story) continue;
      const { media_path, ...kalan } = m.story;
      m.story = { ...kalan, media_url: adresSec(media_path, m.story.media_url, harita) };
    }
  }

  return json({ messages: sirali, mediaEnabled });
}
