import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { isArticleSlug } from '@/lib/articles';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Makale sonu mini-quiz → XP. quiz_questions.article_slug kolonu baştan beri
// vardı; makalelere gömülü quiz'ler ise hiçbir yere kaydedilmeyen "ölü
// etkileşim"di. Bu uç, makale okumayı günün sorusuyla AYNI ilerleme sistemine
// (user_progress.xp) bağlar. article_quiz_answers tablosu yoksa GET
// available:false döner → widget hiç görünmez (makaleler statik kalır).

// Sorular KÜRESEL (herkese aynı) → 5 dk önbellek; slug anahtara dahil.
// correct_index/explanation GET'te SIZDIRILMAZ — cevap sonrası POST'tan döner.
const getQuizQuestions = unstable_cache(
  async (slug: string) => {
    const { data, error } = await db
      .from('quiz_questions')
      .select('id, question, options')
      .eq('article_slug', slug)
      .eq('active', true)
      .order('id', { ascending: true })
      .limit(3);
    if (error) return null;
    return (data ?? []) as { id: number; question: string; options: string[] }[];
  },
  ['article-quiz-questions-v1'],
  { revalidate: 300 },
);

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isArticleSlug(slug)) return json({ available: false });
  try {
    const questions = await getQuizQuestions(slug);
    if (!questions || !questions.length) return json({ available: false });

    const { me } = await getMe();
    if (!me) return json({ available: true, loggedIn: false, questions });

    // Cevaplanmışlar: seçim + doğruluk + (artık güvenle gösterilebilir) doğru şık.
    const { data: answers, error: ansErr } = await db
      .from('article_quiz_answers')
      .select('question_id, selected_index, is_correct')
      .eq('user_id', me.id)
      .in('question_id', questions.map((q) => q.id));
    if (ansErr) return json({ available: false }); // tablo yok → uykuda

    const answeredIds = (answers ?? []).map((a: any) => a.question_id);
    let solutions = new Map<number, { correct_index: number; explanation: string | null }>();
    if (answeredIds.length) {
      const { data: sols } = await db
        .from('quiz_questions').select('id, correct_index, explanation')
        .in('id', answeredIds);
      solutions = new Map((sols ?? []).map((s: any) => [s.id, { correct_index: s.correct_index, explanation: s.explanation ?? null }]));
    }
    const ansMap = new Map((answers ?? []).map((a: any) => [a.question_id, a]));

    return json({
      available: true,
      loggedIn: true,
      questions: questions.map((q) => {
        const a: any = ansMap.get(q.id);
        const sol = solutions.get(q.id);
        return a && sol
          ? { ...q, answered: { selectedIndex: a.selected_index, isCorrect: a.is_correct, correctIndex: sol.correct_index, explanation: sol.explanation } }
          : q;
      }),
    });
  } catch {
    return json({ available: false });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isArticleSlug(slug)) return json({ error: 'Bilinmeyen makale' }, 404);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { questionId?: number; selectedIndex?: number };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const questionId = Number(body.questionId);
  const selectedIndex = Number(body.selectedIndex);
  if (!Number.isInteger(questionId) || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 9) {
    return json({ error: 'Geçersiz istek' }, 400);
  }

  try {
    // Soru BU makaleye ait ve aktif olmalı (başka slug'ın sorusuna cevap yazılamaz).
    const { data: q } = await db
      .from('quiz_questions')
      .select('id, options, correct_index, explanation')
      .eq('id', questionId).eq('article_slug', slug).eq('active', true)
      .maybeSingle();
    if (!q) return json({ error: 'Soru bulunamadı' }, 404);
    const optsLen = Array.isArray(q.options) ? q.options.length : 0;
    if (selectedIndex >= optsLen) return json({ error: 'Geçersiz seçim' }, 400);

    const isCorrect = selectedIndex === q.correct_index;

    // (user_id, question_id) PK → ikinci cevap 23505: tekrar XP verilmez.
    const { error: insErr } = await db.from('article_quiz_answers').insert({
      user_id: me.id, question_id: questionId, selected_index: selectedIndex, is_correct: isCorrect,
    });
    if (insErr) {
      if (insErr.code === '23505') {
        return json({ alreadyAnswered: true, correctIndex: q.correct_index, explanation: q.explanation ?? null });
      }
      return json({ available: false, error: 'Quiz henüz hazır değil.' }, 503);
    }

    // XP: doğru +5 (günün sorusundan küçük — seri/rozet mantığına DOKUNMAZ,
    // yalnız xp alanı güncellenir; rozetler kendi eşiklerinde kendiliğinden gelir).
    let xpGained = 0;
    if (isCorrect) {
      xpGained = 5;
      const { data: cur } = await db.from('user_progress').select('xp').eq('user_id', me.id).maybeSingle();
      await db.from('user_progress').upsert(
        { user_id: me.id, xp: (cur?.xp ?? 0) + xpGained, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    }

    return json({ isCorrect, correctIndex: q.correct_index, explanation: q.explanation ?? null, xpGained });
  } catch {
    return json({ available: false }, 503);
  }
}
