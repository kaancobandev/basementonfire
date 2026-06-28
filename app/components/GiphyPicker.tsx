'use client';

import { useEffect, useRef, useState } from 'react';

interface GiphyGif { id: string; title?: string; images?: Record<string, { url?: string }> }

/**
 * Yeniden kullanılabilir GIF arama-seçici (GIPHY).
 * Performans: yalnızca açıkken veri çeker, arama debounce'lu (400ms), grid küçük
 * rendition (`fixed_width_downsampled`) + lazy <img>. Ağır olduğundan çağıran
 * tarafta `next/dynamic` (ssr:false) ile tembel yüklenmeli → ana bundle'a girmez.
 * onSelect, seçilen GIF'in küçük `fixed_width` rendition URL'ini döner.
 */
export default function GiphyPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [q, setQ] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(query: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/giphy?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setGifs(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }

  // Arama debounce'u (açıkken). Trending q='' ile gelir.
  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => load(q), 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q, open]);

  // Açılışta sıfırla
  useEffect(() => { if (open) setQ(''); }, [open]);

  // Escape ile kapat
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="GIF seç"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ width: '100%', maxWidth: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ padding: 12, borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="GIF ara…"
            aria-label="GIF ara"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
          />
          <button type="button" onClick={onClose} aria-label="Kapat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, minHeight: 160 }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Yükleniyor…</div>
          ) : gifs.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>GIF bulunamadı</div>
          ) : (
            gifs.map(g => {
              const preview = g.images?.fixed_width_downsampled?.url ?? g.images?.fixed_width?.url ?? g.images?.original?.url;
              const full = g.images?.fixed_width?.url ?? g.images?.original?.url;
              if (!preview || !full) return null;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onSelect(full)}
                  title={g.title}
                  style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--color-hover)', border: 'none', padding: 0 }}
                >
                  <img src={preview} alt={g.title ?? 'GIF'} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              );
            })
          )}
        </div>

        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.68rem', color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>
          GIPHY ile güçlendirilmiştir
        </div>
      </div>
    </div>
  );
}
