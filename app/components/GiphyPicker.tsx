'use client';

import { useEffect, useRef, useState } from 'react';

interface GiphyGif { id: string; title?: string; images?: Record<string, { url?: string }> }

/**
 * Yeniden kullanılabilir GIF arama-seçici (GIPHY).
 * Performans/ölçek: yalnızca açıkken veri çeker, arama debounce'lu (400ms), grid
 * küçük rendition (`fixed_width_downsampled`) + lazy <img>, sonuçlar SAYFALI
 * (sona yaklaşınca sonraki 24 yüklenir — "aradığım GIF listede yok" çözümü).
 * Ağır olduğundan çağıran tarafta `next/dynamic` (ssr:false) ile tembel yüklenmeli.
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
  const [loading, setLoading] = useState(false);     // ilk/yeni arama
  const [loadingMore, setLoadingMore] = useState(false);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const busyRef = useRef(false);                      // eşzamanlı istek koruması
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(query: string, append: boolean) {
    if (busyRef.current) return;
    busyRef.current = true;
    if (append) setLoadingMore(true);
    else { setLoading(true); offsetRef.current = 0; hasMoreRef.current = true; }
    try {
      const offset = append ? offsetRef.current : 0;
      const res = await fetch(`/api/giphy?q=${encodeURIComponent(query)}&offset=${offset}`);
      const data = await res.json();
      const list: GiphyGif[] = Array.isArray(data?.data) ? data.data : [];
      const total = data?.pagination?.total_count ?? 0;
      offsetRef.current = offset + list.length;
      hasMoreRef.current = list.length > 0 && offsetRef.current < total;
      setGifs(prev => (append ? [...prev, ...list] : list));
    } catch {
      if (!append) setGifs([]);
    } finally {
      busyRef.current = false;
      if (append) setLoadingMore(false); else setLoading(false);
    }
  }

  // Arama debounce'u (açıkken). Trending q='' ile gelir.
  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => load(q, false), 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (hasMoreRef.current && !busyRef.current && el.scrollHeight - el.scrollTop - el.clientHeight < 320) {
      load(q, true);
    }
  }

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
            placeholder="GIF ara (ipucu: İngilizce terimler daha çok sonuç verir)"
            aria-label="GIF ara"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
          />
          <button type="button" onClick={onClose} aria-label="Kapat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div onScroll={onScroll} style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, minHeight: 160, alignContent: 'start' }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Yükleniyor…</div>
          ) : gifs.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>GIF bulunamadı. Farklı bir terim dene.</div>
          ) : (
            <>
              {gifs.map((g, i) => {
                const preview = g.images?.fixed_width_downsampled?.url ?? g.images?.fixed_width?.url ?? g.images?.original?.url;
                const full = g.images?.fixed_width?.url ?? g.images?.original?.url;
                if (!preview || !full) return null;
                return (
                  <button
                    key={`${g.id}-${i}`}
                    type="button"
                    onClick={() => onSelect(full)}
                    title={g.title}
                    style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--color-hover)', border: 'none', padding: 0 }}
                  >
                    {/* Görsel akıştan çıkarıldı (absolute) → kare kutuyu aspect-ratio
                        belirler; img'in intrinsic boyutu satır yüksekliğini bozup
                        kaydırırken öğeleri üst üste bindiremez. */}
                    <img src={preview} alt={g.title ?? 'GIF'} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                );
              })}
              {loadingMore && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '0.8rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Daha fazla yükleniyor…</div>
              )}
            </>
          )}
        </div>

        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.68rem', color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>
          GIPHY ile güçlendirilmiştir
        </div>
      </div>
    </div>
  );
}
