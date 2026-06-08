'use client';

import { useRef, useState } from 'react';
import Img from '@/app/components/Img';
import type { MediaItem } from '@/lib/types';

const containStyle: React.CSSProperties = { maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' };
const feedSingleStyle: React.CSSProperties = { width: '100%', maxHeight: 600, objectFit: 'cover', display: 'block' };
const navBtn = (side: 'left' | 'right'): React.CSSProperties => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  ...(side === 'left' ? { left: 8 } : { right: 8 }),
  width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '1.4rem', lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, backdropFilter: 'blur(3px)',
});

function NoteIcon({ size = 44 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

/** Karusel/detay içinde ses dosyası oynatıcısı. */
function AudioCard({ url, variant }: { url: string; variant: 'lightbox' | 'feed' }) {
  return (
    <div style={{
      width: '100%',
      ...(variant === 'feed' ? { aspectRatio: '16 / 9' } : { height: '100%', minHeight: '40vh' }),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
      background: 'linear-gradient(135deg, #312e81, #4c1d95)', color: '#fff', padding: 24, boxSizing: 'border-box',
    }}>
      <NoteIcon size={48} />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio src={url} controls style={{ width: '100%', maxWidth: 440 }} />
    </div>
  );
}

/**
 * Gönderi medyasını gösterir. Tek öğede mevcut görünümü birebir korur (ekstra
 * sarmalayıcı yok → eski tekli gönderilerin yerleşimi değişmez). Çoklu öğede
 * kaydırmalı (scroll-snap) karusel: ok butonları, nokta göstergesi ve sayaç.
 * Görseller resim, videolar <video>, ses dosyaları oynatıcı kartı olarak gelir.
 */
export default function MediaCarousel({ media, sizes, background = '#000', variant = 'lightbox' }: {
  media: MediaItem[];
  sizes?: string;
  background?: string;
  variant?: 'lightbox' | 'feed';
}) {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!media.length) return null;

  // Tek medya → mevcut görünüm (drop-in)
  if (media.length === 1) {
    const m = media[0];
    if (m.type === 'audio') return <AudioCard url={m.url} variant={variant} />;
    const st = variant === 'feed' ? feedSingleStyle : containStyle;
    return m.type === 'video'
      ? <video src={m.url} controls playsInline style={st} />
      : <Img src={m.url} alt="" sizes={sizes} style={st} />;
  }

  function go(i: number) {
    const t = trackRef.current; if (!t) return;
    const c = Math.max(0, Math.min(media.length - 1, i));
    t.scrollTo({ left: t.clientWidth * c, behavior: 'smooth' });
    setIdx(c);
  }
  function onScroll() {
    const t = trackRef.current; if (!t) return;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    if (i !== idx) setIdx(i);
  }

  const containerStyle: React.CSSProperties = variant === 'feed'
    ? { position: 'relative', width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background, overflow: 'hidden' }
    : { position: 'relative', width: '100%', height: '100%', minHeight: '50vh', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background };
  const mediaStyle: React.CSSProperties = variant === 'feed'
    ? { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
    : { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };

  return (
    <div style={containerStyle}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mc-track"
        style={{ display: 'flex', width: '100%', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        {media.map((m, i) => (
          <div key={i} style={{ flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {m.type === 'audio'
              ? <AudioCard url={m.url} variant={variant} />
              : m.type === 'video'
              ? <video src={m.url} controls playsInline style={mediaStyle} />
              : <Img src={m.url} alt="" sizes={sizes} style={mediaStyle} />}
          </div>
        ))}
      </div>

      {idx > 0 && <button type="button" aria-label="Önceki" onClick={() => go(idx - 1)} style={navBtn('left')}>‹</button>}
      {idx < media.length - 1 && <button type="button" aria-label="Sonraki" onClick={() => go(idx + 1)} style={navBtn('right')}>›</button>}

      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 9999, zIndex: 4 }}>
        {idx + 1}/{media.length}
      </div>
      <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, pointerEvents: 'none', zIndex: 4 }}>
        {media.map((_, i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'background 0.15s' }} />
        ))}
      </div>

      <style>{`.mc-track::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

/** Grid hücresinde "çoklu medya" göstergesi (sağ üst, daima görünür). */
export function MultiBadge() {
  return (
    <span style={{ position: 'absolute', top: 8, right: 8, color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))', display: 'flex', pointerEvents: 'none', zIndex: 2 }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M4 16V6a2 2 0 0 1 2-2h10" />
      </svg>
    </span>
  );
}

/** Ses dosyası için grid/önizleme placeholder'ı (kapak görseli yok). */
export function AudioThumb() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg, #312e81, #4c1d95)', color: '#fff' }}>
      <NoteIcon size={30} />
      <span style={{ fontSize: '0.62rem', fontWeight: 700, opacity: 0.85, letterSpacing: 0.3 }}>SES</span>
    </div>
  );
}
