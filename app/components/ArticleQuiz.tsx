'use client';

import { useEffect, useRef, useState } from 'react';

type Q = {
  id: number;
  question: string;
  options: string[];
  answered?: { selectedIndex: number; isCorrect: boolean; correctIndex: number; explanation: string | null };
};
type State =
  | { phase: 'loading' }
  | { phase: 'hidden' }
  | { phase: 'ready'; loggedIn: boolean; questions: Q[] };

/**
 * Makale sonu mini-quiz — "Kendini test et". Sorusu olan makalede görünür
 * (quiz_questions.article_slug); doğru cevap +5 XP (günün sorusuyla aynı
 * ilerleme sistemi). DailyQuestion deseni: IntersectionObserver ile görünüre
 * yaklaşana kadar fetch YOK → makale sayfaları statik/hafif kalır.
 */
export default function ArticleQuiz({ slug }: { slug: string }) {
  const [st, setSt] = useState<State>({ phase: 'loading' });
  const [busyId, setBusyId] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/articles/${slug}/quiz`);
        const d = await r.json();
        if (!alive) return;
        if (!d.available || !d.questions?.length) { setSt({ phase: 'hidden' }); return; }
        setSt({ phase: 'ready', loggedIn: !!d.loggedIn, questions: d.questions });
      } catch {
        if (alive) setSt({ phase: 'hidden' });
      }
    })();
    return () => { alive = false; };
  }, [inView, slug]);

  async function answer(q: Q, idx: number) {
    if (st.phase !== 'ready' || q.answered || busyId !== null) return;
    if (!st.loggedIn) { window.location.href = '/login'; return; }
    setBusyId(q.id);
    try {
      const r = await fetch(`/api/articles/${slug}/quiz`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.id, selectedIndex: idx }),
      });
      if (r.status === 401) { window.location.href = '/login'; return; }
      const d = await r.json();
      if (typeof d.correctIndex === 'undefined') return;
      setSt(s => s.phase === 'ready' ? {
        ...s,
        questions: s.questions.map(x => x.id === q.id
          ? { ...x, answered: { selectedIndex: idx, isCorrect: idx === d.correctIndex, correctIndex: d.correctIndex, explanation: d.explanation ?? null } }
          : x),
      } : s);
    } catch { /* sessiz */ } finally {
      setBusyId(null);
    }
  }

  if (st.phase === 'hidden') return null;
  // Gözlemlenebilir gölcü: fetch tetiklenmeden önce DOM'da bir düğüm şart.
  if (st.phase === 'loading') return <div ref={rootRef} aria-hidden />;

  const solved = st.questions.filter(q => q.answered).length;
  const correct = st.questions.filter(q => q.answered?.isCorrect).length;

  return (
    <section className="aq" aria-label="Kendini test et" style={{ maxWidth: 720, margin: '28px auto 0', padding: '0 16px' }}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 15px', background: 'linear-gradient(90deg, rgba(16,185,129,0.14), rgba(79,70,229,0.10))', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🧠</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>Kendini test et</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
            {solved > 0 ? `${correct}/${solved} doğru` : `${st.questions.length} soru · doğrusu +5 XP`}
          </span>
        </div>

        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {st.questions.map((q, qi) => (
            <div key={q.id}>
              <p style={{ margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.45, color: 'var(--color-text)' }}>{qi + 1}. {q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {q.options.map((opt, i) => {
                  const a = q.answered;
                  const isCorrect = a && i === a.correctIndex;
                  const isWrongPick = a && i === a.selectedIndex && i !== a.correctIndex;
                  let border = '1px solid var(--color-border)';
                  let bg = 'transparent';
                  let color = 'var(--color-text)';
                  if (isCorrect) { border = '1.5px solid var(--color-success)'; bg = 'rgba(16,185,129,0.12)'; }
                  else if (isWrongPick) { border = '1.5px solid var(--color-danger)'; bg = 'rgba(239,68,68,0.10)'; }
                  else if (a) { color = 'var(--color-text-muted)'; }
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => answer(q, i)}
                      disabled={!!a || busyId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                        padding: '10px 12px', borderRadius: 10, border, background: bg, color,
                        fontSize: '0.86rem', fontFamily: 'inherit', fontWeight: 500,
                        cursor: a ? 'default' : 'pointer', width: '100%', transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, flexShrink: 0, borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.72rem', fontWeight: 800 }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {q.answered && (
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                  {q.answered.isCorrect ? '✅ Doğru! +5 XP' : '❌ Yanlış.'}{q.answered.explanation ? ` ${q.answered.explanation}` : ''}
                </p>
              )}
            </div>
          ))}
          {st.phase === 'ready' && !st.loggedIn && (
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Cevaplamak ve XP kazanmak için <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>giriş yap</a>.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
