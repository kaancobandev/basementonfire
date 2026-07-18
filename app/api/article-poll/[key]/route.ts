import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { db, getMe } from '@/lib/supabase/server';
import { clientIp } from '@/lib/geo';
import { POLLS, isPollKey, isPollChoice, postIdFromPollKey } from '@/lib/polls';

// Makale içi karar noktası oylaması (ilk kullanan: /articles/sezar → Rubicon).
// Giriş GEREKTİRMEZ: okur bir seçim yapar, dağılımı görür.
//
// Tablo (sql/features-article-poll.sql) henüz çalıştırılmadıysa her iki uç da
// { available: false } döner → karar noktası çalışmaya devam eder, sadece
// "okurların %68'i" çubuğu gizlenir. Yarı-uykuda, kırılmadan.

export const dynamic = 'force-dynamic';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Anonim okuru çerezsiz ayırt eden anahtar — page_views ile AYNI yöntem:
 * ham IP saklanmaz, hash Istanbul gününe göre DÖNER (ertesi gün eşleşmez),
 * service-key ile tuzlanır → geri döndürülemez, kalıcı kimlik değil.
 * Sonuç: pratikte "bir okur, bir oy"; teoride ertesi gün yeniden oy verilebilir
 * (bu, sosyal-kanıt çubuğu için kabul edilebilir; kalıcı bir parmak izi tutmaktan
 * çok daha iyi bir takas).
 */
function voterHash(req: NextRequest, pollKey: string): string {
  const ua = req.headers.get('user-agent') || '';
  const ip = clientIp(req.headers);
  const salt = process.env.SUPABASE_SERVICE_KEY || 'basements-salt';
  const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
  return crypto.createHash('sha256').update(`${ip}|${ua}|${day}|${pollKey}|${salt}`).digest('hex').slice(0, 32);
}

/**
 * Bu anahtarın geçerli seçenekleri. İki kaynak:
 *  - makale karar noktaları → lib/polls.ts registry'si (kodda sabit),
 *  - kullanıcı anketleri ('post-<id>') → post_polls tablosu; oy olarak İNDEKS
 *    saklandığından seçenekler '0'..'n-1'dir (metin DB'ye oy olarak girmez).
 * Her iki durumda da istemciden gelen serbest metin asla doğrulamayı geçemez.
 */
async function pollChoices(pollKey: string): Promise<readonly string[] | null> {
  if (isPollKey(pollKey)) return POLLS[pollKey];
  const postId = postIdFromPollKey(pollKey);
  if (postId === null) return null;
  const { data, error } = await db.from('post_polls').select('options').eq('post_id', postId).maybeSingle();
  if (error || !data || !Array.isArray(data.options)) return null;
  return data.options.map((_: unknown, i: number) => String(i));
}

/** Seçenek başına sayım. Seçenekler doğrulanmış kümeden gelir → istemci veriyle oynayamaz. */
async function tally(pollKey: string, choices: readonly string[]): Promise<{ counts: Record<string, number>; total: number }> {
  const rows = await Promise.all(
    choices.map(async (c) => {
      const { count, error } = await db
        .from('article_poll_votes')
        .select('choice', { count: 'exact', head: true })
        .eq('poll_key', pollKey)
        .eq('choice', c);
      // Tablo yoksa head:true count bazı supabase-js sürümlerinde hatayı yutup
      // count=null döndürüyor → null'ı da başarısızlık say (çağıran catch → available:false).
      if (error || count === null) throw error ?? new Error('poll table missing');
      return [c, count] as const;
    }),
  );
  const counts = Object.fromEntries(rows);
  return { counts, total: rows.reduce((s, [, n]) => s + n, 0) };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const choices = await pollChoices(key);
  if (!choices) return json({ available: false });
  try {
    // `mine` gerçek (head'siz) bir select → tablo yoksa hatayı GÜVENİLİR yüzeye
    // çıkarır (head:true count'un aksine); tally de null count'a karşı korumalı.
    const [{ counts, total }, { data: mine, error: mineErr }] = await Promise.all([
      tally(key, choices),
      db
        .from('article_poll_votes')
        .select('choice')
        .eq('poll_key', key)
        .eq('voter_hash', voterHash(req, key))
        .maybeSingle(),
    ]);
    if (mineErr) return json({ available: false });
    return json({ available: true, counts, total, mine: mine?.choice ?? null });
  } catch {
    return json({ available: false });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const choices = await pollChoices(key);
  if (!choices) return json({ available: false });

  let choice = '';
  try {
    const body = await req.json();
    choice = String(body?.choice ?? '');
  } catch {
    return json({ error: 'Geçersiz istek' }, 400);
  }
  // Makale registry'sinde isPollChoice, kullanıcı anketinde indeks kümesi.
  const valid = isPollKey(key) ? isPollChoice(key, choice) : choices.includes(choice);
  if (!valid) return json({ error: 'Geçersiz seçim' }, 400);

  try {
    const hash = voterHash(req, key);
    // Üyeyse oyu kime ait olduğunu da yaz (hesap silinirse null'a düşer);
    // üye değilse anonim kalır. Giriş ZORUNLU değil — akışı bölmek yazının
    // en kritik anını (uçurumun kenarı) mahvederdi.
    const { me } = await getMe();

    const { error } = await db.from('article_poll_votes').insert({
      poll_key: key,
      voter_hash: hash,
      choice,
      user_id: me?.id ?? null,
    });

    // 23505 = composite PK ihlali → bu okur zaten oy vermiş. Hata değil:
    // oyu değiştirmeyiz; KAYITLI seçimini (yeni gönderdiğini değil) döndürürüz.
    if (error && error.code !== '23505') return json({ available: false });

    let mine = choice;
    if (error) {
      const { data: prev } = await db
        .from('article_poll_votes')
        .select('choice')
        .eq('poll_key', key)
        .eq('voter_hash', hash)
        .maybeSingle();
      mine = prev?.choice ?? choice;
    }

    const { counts, total } = await tally(key, choices);
    return json({ available: true, counts, total, mine, alreadyVoted: !!error });
  } catch {
    return json({ available: false });
  }
}
