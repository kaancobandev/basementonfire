'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Img from '@/app/components/Img';
import { splitMedia, type MediaItem } from '@/lib/types';

// Lightbox medya sütunu artık her yüzeyde belirli yükseklikte → %100 ebeveyni doldurur
// (masaüstünde 90vh'lik sütun = eski görünüm; mobil dikey istifte doğru ölçü).
const containStyle: React.CSSProperties = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };
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
function IconMuted() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}
function IconSound() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

const SOLO_EVENT = 'bsmnt:audio-solo';

/**
 * Gönderinin arka plan müziği. Görünür olunca otomatik (sessiz) çalar; sağ alttaki
 * butonla sesi açılır. Aynı anda tek ses çalar (başka bir gönderinin sesi açılınca
 * bu susturulur). Tarayıcı autoplay politikası gereği ilk oynatma sessizdir.
 */
function MusicLayer({ url, targetRef }: { url: string; targetRef: React.RefObject<HTMLDivElement | null> }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const id = useId();
  const [muted, setMuted] = useState(true);

  // `muted`'i imperatif uygula (React'in muted prop'u güvenilir değildir)
  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted; }, [muted]);

  // Görünürlüğe göre oynat/duraklat (mobil batarya + tek seferde gereksiz ses yok)
  useEffect(() => {
    const el = targetRef.current;
    const a = audioRef.current;
    if (!el || !a) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && e.intersectionRatio >= 0.5) a.play().catch(() => {}); else a.pause(); },
      { threshold: [0, 0.5, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [targetRef]);

  // Tek seferde tek ses: başka bir gönderinin sesi açılınca bunu sustur
  useEffect(() => {
    function onSolo(e: Event) { if ((e as CustomEvent).detail !== id) setMuted(true); }
    window.addEventListener(SOLO_EVENT, onSolo);
    return () => window.removeEventListener(SOLO_EVENT, onSolo);
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const a = audioRef.current;
    if (!a) return;
    const next = !a.muted; // DOM'un GERÇEK durumundan oku — hızlı tıklamada bayat closure'ı önler
    a.muted = next;
    setMuted(next);
    if (!next) {
      window.dispatchEvent(new CustomEvent(SOLO_EVENT, { detail: id }));
      a.play().catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src={url} loop playsInline preload="metadata" style={{ display: 'none' }} />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
        title={muted ? 'Sesi aç' : 'Sesi kapat'}
        style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 6, width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
      >
        {muted ? <IconMuted /> : <IconSound />}
      </button>
    </>
  );
}

/** Yalnızca ses içeren gönderi (görsel yok) için oynatıcı kartı. */
function AudioCard({ url, variant }: { url: string; variant: 'lightbox' | 'feed' }) {
  return (
    <div style={{
      width: '100%',
      ...(variant === 'feed' ? { aspectRatio: '16 / 9' } : { height: '100%' }),
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
 * Gönderi medyasını gösterir.
 *  - Görseller (resim/video) karusele girer; tek görselde mevcut görünüm korunur.
 *  - Ses dosyası slayt DEĞİLDİR; gönderinin arka plan müziği olur (sağ altta
 *    sustur/aç butonu, otomatik sessiz oynatma — Instagram tarzı).
 *  - Yalnızca ses içeren gönderide oynatıcı kartı gösterilir.
 */
export default function MediaCarousel({ media, sizes, background = '#000', variant = 'lightbox' }: {
  media: MediaItem[];
  sizes?: string;
  background?: string;
  variant?: 'lightbox' | 'feed';
}) {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { visuals, audio } = splitMedia(media);

  // Görsel yok → ses-only kart, yoksa null
  if (visuals.length === 0) {
    return audio ? <AudioCard url={audio} variant={variant} /> : null;
  }

  // TEK görsel
  if (visuals.length === 1) {
    const m = visuals[0];

    // Müzik yoksa → mevcut görünüm (drop-in, hiç değişmez)
    if (!audio) {
      const st = variant === 'feed' ? feedSingleStyle : containStyle;
      return m.type === 'video'
        ? <video src={m.url} controls playsInline style={st} />
        : <Img src={m.url} alt="" sizes={sizes} style={st} />;
    }

    // Tek görsel + müzik → sarmalayıcı + arka plan müziği (sağ alt sustur/aç)
    if (variant === 'feed') {
      // Feed: kare kapak (çoklu karuselle tutarlı, yükseklik çökmesi olmaz)
      const st: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
      return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden', background }}>
          {m.type === 'video'
            ? <video src={m.url} controls playsInline style={st} />
            : <Img src={m.url} alt="" sizes={sizes} style={st} />}
          <MusicLayer url={audio} targetRef={containerRef} />
        </div>
      );
    }
    return (
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {m.type === 'video'
          ? <video src={m.url} controls playsInline style={containStyle} />
          : <Img src={m.url} alt="" sizes={sizes} style={containStyle} />}
        <MusicLayer url={audio} targetRef={containerRef} />
      </div>
    );
  }

  // ÇOKLU görsel → karusel
  function go(i: number) {
    const t = trackRef.current; if (!t) return;
    const c = Math.max(0, Math.min(visuals.length - 1, i));
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
    : { position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background };
  const mediaStyle: React.CSSProperties = variant === 'feed'
    ? { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
    : { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mc-track"
        style={{ display: 'flex', width: '100%', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        {visuals.map((m, i) => (
          <div key={i} style={{ flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {m.type === 'video'
              ? <video src={m.url} controls playsInline style={mediaStyle} />
              : <Img src={m.url} alt="" sizes={sizes} style={mediaStyle} />}
          </div>
        ))}
      </div>

      {idx > 0 && <button type="button" aria-label="Önceki" onClick={() => go(idx - 1)} style={navBtn('left')}>‹</button>}
      {idx < visuals.length - 1 && <button type="button" aria-label="Sonraki" onClick={() => go(idx + 1)} style={navBtn('right')}>›</button>}

      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 9999, zIndex: 4 }}>
        {idx + 1}/{visuals.length}
      </div>
      <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, pointerEvents: 'none', zIndex: 4 }}>
        {visuals.map((_, i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'background 0.15s' }} />
        ))}
      </div>

      {audio && <MusicLayer url={audio} targetRef={containerRef} />}

      <style>{`.mc-track::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

/** Grid hücresinde "çoklu görsel" göstergesi (sağ üst, daima görünür). */
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

/** Gönderide arka plan müziği olduğunu belirten grid göstergesi (sol üst). */
export function MusicBadge() {
  return (
    <span style={{ position: 'absolute', top: 8, left: 8, color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))', display: 'flex', pointerEvents: 'none', zIndex: 2 }}>
      <NoteIcon size={16} />
    </span>
  );
}

/** Ses dosyası için grid/önizleme placeholder'ı (yalnızca ses içeren gönderi kapağı). */
export function AudioThumb() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg, #312e81, #4c1d95)', color: '#fff' }}>
      <NoteIcon size={30} />
      <span style={{ fontSize: '0.62rem', fontWeight: 700, opacity: 0.85, letterSpacing: 0.3 }}>SES</span>
    </div>
  );
}
