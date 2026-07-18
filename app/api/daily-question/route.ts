import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { earnedBadgeKeys, levelFromXp, BADGE_MAP } from '@/lib/badges';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Turkiye takvim tarihi (sabit UTC+3; TR 2016'dan beri yaz saati uygulamaz).
// "Bugun" 00:00 TR'de degisir; gunluk soru rotasyonu da buna bagli.
function istanbulDayParts() {
  const ms = Date.now() + 3 * 3600 * 1000;
  return {
    date: new Date(ms).toISOString().slice(0, 10),   // YYYY-MM-DD
    dayNumber: Math.floor(ms / 86400000),            // epoch-gun (rotasyon)
  };
}

function prevDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Bugunun sorusu deterministik: aktif sorular id'ye gore siralanir, gunluk
// indeks = dayNumber % adet -> herkese ayni soru, her gun doner.
//
// GUNDE BIR degisen KURESEL sonuc her istekte 2 SERI sorguyla yeniden
// hesaplaniyordu (feed'in en sicak yan yolu). Iki iyilestirme birden:
// (a) tek sorgu — tum aktif sorular cekilip JS'te secilir (tablo kucuk),
// (b) unstable_cache — dayNumber anahtara dahil (gun donunce otomatik yeni
//     girdi), 5 dk tazeleme "soru aktif/pasif edildi" durumunu da yakalar.
// Cache-hit'te 0 DB turu.
const getTodayQuestion = unstable_cache(
  async (dayNumber: number) => {
    const { data, error } = await db
      .from('quiz_questions')
      .select('id, question, options, correct_index, explanation, article_slug')
      .eq('active', true).order('id', { ascending: true });
    if (error || !data || !data.length) return null;
    return data[dayNumber % data.length] ?? null;
  },
  ['daily-question-v1'],
  { revalidate: 300 },
);

async function pickTodayQuestion() {
  return getTodayQuestion(istanbulDayParts().dayNumber);
}

export async function GET() {
  try {
    // Soru (kuresel, cache'li) ile getMe birbirinden bagimsiz -> paralel.
    const [q, { me }] = await Promise.all([pickTodayQuestion(), getMe()]);
    if (!q) return json({ available: false });
    const { date } = istanbulDayParts();
    const publicQ = { id: q.id, question: q.question, options: q.options, article_slug: q.article_slug };

    if (!me) return json({ available: true, date, loggedIn: false, answered: false, question: publicQ });

    const [{ data: ans }, { data: prog }] = await Promise.all([
      db.from('daily_answers').select('selected_index, is_correct').eq('user_id', me.id).eq('answer_date', date).maybeSingle(),
      db.from('user_progress').select('xp, current_streak, longest_streak, total_correct, total_answered').eq('user_id', me.id).maybeSingle(),
    ]);
    const progress = prog
      ? { ...prog, ...levelFromXp(prog.xp) }
      : { xp: 0, current_streak: 0, longest_streak: 0, total_correct: 0, total_answered: 0, ...levelFromXp(0) };

    if (ans) {
      // Cevaplanmis -> dogru cevap + aciklama artik guvenle gosterilebilir.
      return json({
        available: true, date, loggedIn: true, answered: true,
        question: { ...publicQ, correct_index: q.correct_index, explanation: q.explanation },
        result: { selectedIndex: ans.selected_index, isCorrect: ans.is_correct },
        progress,
      });
    }
    return json({ available: true, date, loggedIn: true, answered: false, question: publicQ, progress });
  } catch {
    // Tablolar yoksa (SQL henuz calismadiysa) widget sessizce gizlenir.
    return json({ available: false });
  }
}

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giris gerekli' }, 401);

  let body: { selectedIndex?: number };
  try { body = await req.json(); } catch { return json({ error: 'Gecersiz istek' }, 400); }
  const selectedIndex = Number(body.selectedIndex);
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 9) {
    return json({ error: 'Gecersiz secim' }, 400);
  }

  try {
    const q = await pickTodayQuestion();
    if (!q) return json({ error: 'Soru bulunamadi' }, 404);
    const optsLen = Array.isArray(q.options) ? q.options.length : 0;
    if (selectedIndex >= optsLen) return json({ error: 'Gecersiz secim' }, 400);
    const { date } = istanbulDayParts();
    const isCorrect = selectedIndex === q.correct_index;

    // Gunluk cevabi yaz. (user_id, answer_date) PK -> ikinci cevap 23505 verir
    // (idempotentlik guvencesi: tekrar odul verilmez).
    const { error: insErr } = await db.from('daily_answers').insert({
      user_id: me.id, answer_date: date, question_id: q.id, selected_index: selectedIndex, is_correct: isCorrect,
    });
    if (insErr) {
      if (insErr.code === '23505') {
        const [{ data: ans }, { data: prog }] = await Promise.all([
          db.from('daily_answers').select('selected_index, is_correct').eq('user_id', me.id).eq('answer_date', date).maybeSingle(),
          db.from('user_progress').select('xp, current_streak, longest_streak, total_correct, total_answered').eq('user_id', me.id).maybeSingle(),
        ]);
        return json({
          alreadyAnswered: true,
          correctIndex: q.correct_index, explanation: q.explanation, article_slug: q.article_slug,
          result: ans ? { selectedIndex: ans.selected_index, isCorrect: ans.is_correct } : null,
          progress: prog ? { ...prog, ...levelFromXp(prog.xp) } : null,
        });
      }
      return json({ error: insErr.message }, 500);
    }

    // Ilerleme: seri / XP / sayaclar
    const { data: cur } = await db.from('user_progress')
      .select('xp, current_streak, longest_streak, last_answer_date, total_correct, total_answered')
      .eq('user_id', me.id).maybeSingle();
    const prev = cur ?? { xp: 0, current_streak: 0, longest_streak: 0, last_answer_date: null, total_correct: 0, total_answered: 0 };

    const streak = prev.last_answer_date === prevDate(date) ? (prev.current_streak ?? 0) + 1 : 1;
    const longest = Math.max(prev.longest_streak ?? 0, streak);
    const base = isCorrect ? 10 : 3;                         // katilim + dogru bonusu
    const streakBonus = isCorrect ? Math.min(streak, 7) : 0; // seri buyudukce artar
    const xpGained = base + streakBonus;
    const xp = (prev.xp ?? 0) + xpGained;
    const totalCorrect = (prev.total_correct ?? 0) + (isCorrect ? 1 : 0);
    const totalAnswered = (prev.total_answered ?? 0) + 1;

    await db.from('user_progress').upsert({
      user_id: me.id, xp, current_streak: streak, longest_streak: longest,
      last_answer_date: date, total_correct: totalCorrect, total_answered: totalAnswered,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Rozetler: kazanilmasi gerekenlerden henuz kazanilmamislari ekle
    const shouldHave = earnedBadgeKeys({ xp, current_streak: streak, longest_streak: longest, total_correct: totalCorrect });
    let newBadges: { key: string; name: string; emoji: string }[] = [];
    if (shouldHave.length) {
      const { data: owned } = await db.from('user_badges').select('badge_key').eq('user_id', me.id);
      const ownedKeys = new Set((owned ?? []).map((b: any) => b.badge_key));
      const toAdd = shouldHave.filter(k => !ownedKeys.has(k));
      if (toAdd.length) {
        await db.from('user_badges').insert(toAdd.map(k => ({ user_id: me.id, badge_key: k })));
        newBadges = toAdd.map(k => ({ key: k, name: BADGE_MAP[k].name, emoji: BADGE_MAP[k].emoji }));
      }
    }

    return json({
      isCorrect, correctIndex: q.correct_index, explanation: q.explanation, article_slug: q.article_slug,
      xpGained,
      progress: { xp, current_streak: streak, longest_streak: longest, total_correct: totalCorrect, total_answered: totalAnswered, ...levelFromXp(xp) },
      newBadges,
    });
  } catch (e: any) {
    return json({ error: e?.message ?? 'Hata' }, 500);
  }
}
