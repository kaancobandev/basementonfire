'use client';

// CAM MÜZİK ÇALAR — ses gönderileri için.
//
// Kaynak bileşen iki bağımlılık istiyordu: `lucide-react` (ikonlar) ve
// `@/lib/utils`'ten `cn` (o da clsx + tailwind-merge). ÜÇÜ DE KURULMADI:
// proje zaten her yerde kendi satır içi SVG'lerini çiziyor (bkz. AppShell nav
// ikonları) ve tek bir bileşen için üç paket eklemek bundle'a bedava yük olur.
// İkonlar aşağıda elle çizildi, sınıf birleştirme tek satırlık `cx` ile yapıldı.
//
// Ayrıca kaynakta ilerleme çubuğu YALNIZCA onClick ile sarılabiliyordu; burada
// işaretçi sürükleme eklendi (dokunmatikte tıkla-ve-bırak çok hassas kaçıyor).

import { useCallback, useEffect, useRef, useState } from 'react';

export type MusicTrack = {
  title: string;
  artist: string;
  /** Ses dosyası adresi (aynı kaynak ya da CORS açık olmalı). */
  src: string;
  artwork?: string;
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

/* ── İkonlar: projenin geri kalanıyla aynı stil (stroke, currentColor) ── */
const Ico = ({ d, fill = false, size = 18 }: { d: string; fill?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
    fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const PlayIco = () => <Ico d="M6 4l14 8-14 8z" fill size={20} />;
const PauseIco = () => <Ico d="M8 4h3v16H8zM13 4h3v16h-3z" fill size={20} />;
const PrevIco = () => <Ico d="M18 5v14L8 12zM6 5v14" fill />;
const NextIco = () => <Ico d="M6 5v14l10-7zM18 5v14" fill />;

const EQ_BARS = [0, 1, 2, 3];

export default function MusicPlayer({
  tracks,
  startIndex = 0,
  loop = true,
  accentColor = '#a78bfa',
  className,
}: {
  tracks: MusicTrack[];
  startIndex?: number;
  loop?: boolean;
  accentColor?: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(() => Math.min(Math.max(startIndex, 0), Math.max(tracks.length - 1, 0)));
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  // Elle geçişten sonra çalmaya devam etsin; ilk yüklemede OTOMATİK BAŞLAMAZ
  // (tarayıcılar zaten engeller, üstelik akışta beklenmedik ses kötü deneyim).
  const keepPlaying = useRef(false);

  const track = tracks[index];

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    a.src = track.src;
    a.load();
    setTime(0);
    if (keepPlaying.current) a.play().catch(() => { /* engellendi — sessiz geç */ });
  }, [index, track?.src, track]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { keepPlaying.current = false; a.pause(); }
    else { keepPlaying.current = true; a.play().catch(() => {}); }
  }, [playing]);

  const step = useCallback((delta: number) => {
    if (tracks.length < 2) return;
    keepPlaying.current = true;
    setIndex(i => (i + delta + tracks.length) % tracks.length);
  }, [tracks.length]);

  const onEnded = useCallback(() => {
    if (!loop && index === tracks.length - 1) { keepPlaying.current = false; setPlaying(false); return; }
    if (tracks.length < 2) { keepPlaying.current = false; setPlaying(false); return; }
    step(1);
  }, [loop, index, tracks.length, step]);

  /* ── Sarma: tıklama + sürükleme (dokunmatikte tek tık çok hassas) ── */
  const seekTo = useCallback((clientX: number) => {
    const a = audioRef.current, bar = barRef.current;
    if (!a || !bar || !dur) return;
    const r = bar.getBoundingClientRect();
    a.currentTime = Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * dur;
  }, [dur]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) seekTo(e.clientX);
  };

  if (!tracks.length || !track) return null;
  const pct = dur > 0 ? (time / dur) * 100 : 0;

  return (
    <div className={cx('mp-root', className)}>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDur(e.currentTarget.duration)}
        onEnded={onEnded}
      />

      <div className="mp-bar">
        {/* Ekolayzır — çalarken canlanır, dururken kısılı kalır */}
        <div className="mp-eq" aria-hidden="true">
          {EQ_BARS.map(b => (
            <span key={b} style={{
              background: accentColor,
              animationDuration: `${0.9 + b * 0.18}s`,
              animationPlayState: playing ? 'running' : 'paused',
              transform: playing ? undefined : 'scaleY(0.28)',
            }} />
          ))}
        </div>

        <div className="mp-meta">
          <div className="mp-title" title={track.title}>{track.title}</div>
          <div className="mp-artist">{track.artist}</div>
        </div>

        <div className="mp-ctrl">
          {tracks.length > 1 && (
            <button type="button" onClick={() => step(-1)} aria-label="Önceki parça"><PrevIco /></button>
          )}
          <button type="button" onClick={toggle} aria-label={playing ? 'Duraklat' : 'Çal'} className="mp-play">
            {playing ? <PauseIco /> : <PlayIco />}
          </button>
          {tracks.length > 1 && (
            <button type="button" onClick={() => step(1)} aria-label="Sonraki parça"><NextIco /></button>
          )}
        </div>

        <div className="mp-time tnum">{fmt(time)} / {fmt(dur)}</div>

        <div
          ref={barRef}
          className="mp-seek"
          role="slider"
          tabIndex={0}
          aria-label="Konum"
          aria-valuemin={0}
          aria-valuemax={Math.round(dur) || 0}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${fmt(time)} / ${fmt(dur)}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={e => {
            const a = audioRef.current;
            if (!a || !dur) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); a.currentTime = Math.min(dur, time + 5); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); a.currentTime = Math.max(0, time - 5); }
          }}
        >
          <div className="mp-seek-track"><div className="mp-seek-fill" style={{ width: `${pct}%`, background: accentColor }} /></div>
        </div>
      </div>

      <style>{`
        .mp-root { width: 100%; max-width: 460px; color: #fff; }
        .mp-bar {
          position: relative; display: flex; align-items: center; gap: 12px;
          padding: 12px 16px 16px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(14px) saturate(160%);
          -webkit-backdrop-filter: blur(14px) saturate(160%);
        }
        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .mp-bar { background: rgba(30,27,60,0.86); }
        }
        .mp-eq { display: flex; align-items: flex-end; gap: 3px; height: 26px; flex-shrink: 0; }
        .mp-eq span {
          display: block; width: 3px; height: 100%; border-radius: 999px;
          transform-origin: bottom; animation-name: mp-eq;
          animation-timing-function: ease-in-out; animation-iteration-count: infinite;
        }
        @keyframes mp-eq { 0%,100% { transform: scaleY(0.28); } 50% { transform: scaleY(1); } }
        .mp-meta { min-width: 0; flex: 1; }
        .mp-title { font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mp-artist { font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.55); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mp-ctrl { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .mp-ctrl button {
          display: flex; align-items: center; justify-content: center;
          min-width: 40px; min-height: 40px; padding: 0;
          background: none; border: none; color: #fff; opacity: 0.85; cursor: pointer;
          border-radius: 999px; transition: opacity 0.15s, background 0.15s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mp-ctrl button:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .mp-ctrl button:active { transform: scale(0.88); transition-duration: 0.09s; }
        .mp-time { font-size: 0.66rem; color: rgba(255,255,255,0.5); flex-shrink: 0; }
        /* Dokunma hedefi 3px'lik çizgiden büyük olsun diye kap 16px yüksek. */
        .mp-seek { position: absolute; left: 0; right: 0; bottom: 0; height: 16px; display: flex; align-items: flex-end; cursor: pointer; touch-action: none; }
        .mp-seek-track { position: relative; width: 100%; height: 4px; background: rgba(255,255,255,0.18); border-radius: 0 0 16px 16px; overflow: hidden; }
        .mp-seek-fill { position: absolute; inset-block: 0; left: 0; }
        @media (max-width: 420px) { .mp-time { display: none; } }
        @media (prefers-reduced-motion: reduce) {
          .mp-eq span { animation: none; transform: scaleY(0.5); }
          .mp-ctrl button { transition: none; }
          .mp-ctrl button:active { transform: none; }
        }
      `}</style>
    </div>
  );
}
