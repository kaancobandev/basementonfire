'use client';

import { useEffect, useState } from 'react';

/**
 * Gönderi anketi — makale karar noktalarıyla AYNI oy altyapısı
 * (article_poll_votes, poll_key='post-<id>'): çerezsiz anonim oy, çift oy
 * koruması PK'da. Seçenek metinleri sunucudan gelir; oy olarak indeks gider.
 *
 * Sayımlar SSR'da basılmaz (feed'in paylaşılan önbelleği kişiselleşmesin) —
 * kart görününce istemciden çekilir.
 */
export default function PostPoll({ postId, options }: { postId: number; options: string[] }) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [total, setTotal] = useState(0);
  const [mine, setMine] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState(true);

  const pollKey = `post-${postId}`;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/article-poll/${pollKey}`);
        const d = await r.json();
        if (!alive) return;
        if (!d.available) { setAvailable(false); return; }
        setCounts(d.counts ?? {});
        setTotal(d.total ?? 0);
        setMine(d.mine ?? null);
      } catch { if (alive) setAvailable(false); }
    })();
    return () => { alive = false; };
  }, [pollKey]);

  async function vote(idx: number) {
    if (busy || mine !== null) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/article-poll/${pollKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: String(idx) }),
      });
      const d = await r.json();
      if (!d.available) { setAvailable(false); return; }
      setCounts(d.counts ?? {});
      setTotal(d.total ?? 0);
      setMine(d.mine ?? String(idx));
    } catch { /* sessiz */ } finally {
      setBusy(false);
    }
  }

  if (!available) return null;
  const voted = mine !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
      {options.map((opt, i) => {
        const n = counts?.[String(i)] ?? 0;
        const pct = total > 0 ? Math.round((n / total) * 100) : 0;
        const isMine = mine === String(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => vote(i)}
            disabled={voted || busy}
            style={{
              position: 'relative', overflow: 'hidden', textAlign: 'left',
              padding: '9px 12px', borderRadius: 10,
              border: isMine ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: 'transparent', color: 'var(--color-text)',
              fontFamily: 'inherit', fontSize: '0.86rem', fontWeight: isMine ? 700 : 500,
              cursor: voted ? 'default' : 'pointer', width: '100%',
            }}
          >
            {/* Oy verildikten sonra dolgu çubuğu (yüzde) arka planda */}
            {voted && (
              <span aria-hidden style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: isMine ? 'color-mix(in srgb, var(--color-primary) 18%, transparent)' : 'var(--color-hover)', transition: 'width 0.35s ease' }} />
            )}
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, minWidth: 0 }}>{opt}</span>
              {voted && <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>%{pct}</span>}
              {isMine && <span aria-label="senin oyun">✓</span>}
            </span>
          </button>
        );
      })}
      <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
        {total} oy{voted ? '' : ' · oyunu kullan'}
      </span>
    </div>
  );
}
