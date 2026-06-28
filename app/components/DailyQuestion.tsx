'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

type Q = {
  id: number;
  question: string;
  options: string[];
  article_slug: string | null;
  correct_index?: number;
  explanation?: string | null;
};
type Progress = {
  xp: number; current_streak: number; longest_streak: number;
  total_correct: number; total_answered: number;
  level: number; intoLevel: number; perLevel: number;
};
type State =
  | { phase: 'loading' }
  | { phase: 'hidden' }
  | { phase: 'ready'; q: Q; loggedIn: boolean; progress: Progress | null }
  | { phase: 'answered'; q: Q; selectedIndex: number; correctIndex: number; explanation: string | null; articleSlug: string | null; progress: Progress | null };

function ProgressChips({ p }: { p: Progress | null }) {
  if (!p) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
      <span title="Seri" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', fontWeight: 800, color: p.current_streak > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>🔥 {p.current_streak}</span>
      <span title="Seviye" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-primary)' }}>⭐ Lv{p.level}</span>
    </div>
  );
}

export default function DailyQuestion() {
  const [st, setSt] = useState<State>({ phase: 'loading' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/daily-question');
        const d = await res.json();
        if (!alive) return;
        if (!d.available) { setSt({ phase: 'hidden' }); return; }
        if (d.answered) {
          setSt({
            phase: 'answered', q: d.question,
            selectedIndex: d.result?.selectedIndex ?? -1,
            correctIndex: d.question.correct_index ?? -1,
            explanation: d.question.explanation ?? null,
            articleSlug: d.question.article_slug ?? null,
            progress: d.progress ?? null,
          });
        } else {
          setSt({ phase: 'ready', q: d.question, loggedIn: !!d.loggedIn, progress: d.progress ?? null });
        }
      } catch {
        if (alive) setSt({ phase: 'hidden' });
      }
    })();
    return () => { alive = false; };
  }, []);

  async function answer(idx: number) {
    if (st.phase !== 'ready' || submitting) return;
    if (!st.loggedIn) { window.location.href = '/login'; return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIndex: idx }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json();
      if (!res.ok && !d.alreadyAnswered) { toast.error(d.error ?? 'Bir hata oluştu'); setSubmitting(false); return; }
      const correctIndex = d.correctIndex ?? -1;
      setSt({
        phase: 'answered', q: st.q, selectedIndex: idx, correctIndex,
        explanation: d.explanation ?? null,
        articleSlug: d.article_slug ?? st.q.article_slug,
        progress: d.progress ?? st.progress,
      });
      if (d.alreadyAnswered) { /* sessiz: zaten bugun cevaplanmis */ }
      else if (d.isCorrect) toast.success(`Doğru! +${d.xpGained ?? 0} XP`);
      else toast('Yanlış — yarın yeni soru!', { icon: '📅' });
      for (const b of (d.newBadges ?? [])) toast.success(`${b.emoji} Yeni rozet: ${b.name}`);
    } catch {
      toast.error('Bağlantı hatası');
    } finally {
      setSubmitting(false);
    }
  }

  if (st.phase === 'loading' || st.phase === 'hidden') return null;

  const answered = st.phase === 'answered';
  const q = st.q;
  const progress = st.progress;

  return (
    <div style={{ maxWidth: 470, margin: '16px auto 0', padding: '0 8px' }}>
      <article style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
        {/* Baslik */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 15px', background: 'linear-gradient(90deg, rgba(16,185,129,0.14), rgba(79,70,229,0.10))', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🧠</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)' }}>Günün Sorusu</span>
          <ProgressChips p={progress} />
        </div>

        <div style={{ padding: '14px 16px 16px' }}>
          <p style={{ margin: '0 0 14px', fontSize: '0.96rem', fontWeight: 700, lineHeight: 1.45, color: 'var(--color-text)' }}>{q.question}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, i) => {
              const isCorrect = answered && i === st.correctIndex;
              const isWrongPick = answered && i === st.selectedIndex && i !== st.correctIndex;
              let border = '1px solid var(--color-border)';
              let bg = 'transparent';
              let color = 'var(--color-text)';
              if (isCorrect) { border = '1.5px solid var(--color-success)'; bg = 'rgba(16,185,129,0.12)'; }
              else if (isWrongPick) { border = '1.5px solid var(--color-danger)'; bg = 'rgba(239,68,68,0.10)'; }
              else if (answered) { color = 'var(--color-text-muted)'; }
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={answered || submitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left',
                    padding: '11px 13px', borderRadius: 11, border, background: bg, color,
                    fontSize: '0.88rem', fontFamily: 'inherit', fontWeight: 500,
                    cursor: answered ? 'default' : 'pointer', transition: 'border-color 0.15s, background 0.15s', width: '100%',
                  }}
                >
                  <span style={{
                    display: 'grid', placeItems: 'center', width: 24, height: 24, flexShrink: 0, borderRadius: 7,
                    fontSize: '0.74rem', fontWeight: 800,
                    background: isCorrect ? 'var(--color-success)' : isWrongPick ? 'var(--color-danger)' : 'var(--color-primary-soft)',
                    color: (isCorrect || isWrongPick) ? '#fff' : 'var(--color-primary)',
                  }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                  {isCorrect && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>✓</span>}
                </button>
              );
            })}
          </div>

          {st.phase === 'ready' && !st.loggedIn && (
            <p style={{ margin: '12px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Cevaplamak, XP ve seri biriktirmek için <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>giriş yap</Link>.
            </p>
          )}

          {answered && (
            <div style={{ marginTop: 13 }}>
              {st.explanation && (
                <p style={{ margin: '0 0 10px', fontSize: '0.84rem', lineHeight: 1.55, color: 'var(--color-text-muted)' }}>{st.explanation}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                {st.articleSlug && (
                  <Link href={`/articles/${st.articleSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
                    Konuyu oku →
                  </Link>
                )}
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: st.articleSlug ? 0 : 'auto' }}>Yarın yeni bir soru 🔁</span>
              </div>

              {progress && (
                <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--color-text-muted)', marginBottom: 5 }}>
                    <span>Seviye {progress.level}</span>
                    <span>{progress.intoLevel} / {progress.perLevel} XP</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 9999, background: 'var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((progress.intoLevel / progress.perLevel) * 100)}%`, background: 'linear-gradient(90deg,var(--color-success),var(--color-primary))', borderRadius: 9999 }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
