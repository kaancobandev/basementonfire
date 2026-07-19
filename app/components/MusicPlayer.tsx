'use client';

// CAM MÜZİK ÇALAR
//
// Bağımlılık YOK: kaynak bileşen lucide-react + clsx + tailwind-merge istiyordu,
// üçü de projede yok ve tek bir bileşen için üç paket bundle'a bedava yük olur.
// İkonlar elle çizildi (sitenin geri kalanıyla aynı stil), sınıf birleştirme
// tek satırlık `cx`.
//
// TASARIM: bu sıfırdan bir kimlik değil, oturmuş bir sisteme giren bir parça.
// Renk sitenin kendi tokenlerinden gelir (elektrik indigo → magenta spark
// gradyanı çal düğmesinde, amber seviye göstergesinde). Cesaret TEK yerde:
// marka gradyanlı çal diski + amber okuma çubuğu. Gerisi sessiz.
//
// Web Audio / AnalyserNode ile gerçek dalga formu BİLEREK yapılmadı: ses
// Supabase depolamasından (farklı köken) geliyor; MediaElementSource'a
// bağlamak CORS başlıkları tam değilse sesi tamamen susturabilir. Görsel
// kazanç, çalmama riskine değmez.

import { useCallback, useMemo, useRef, useState } from 'react';
import { useMediaDock } from './MediaDock';

export type MusicTrack = {
  title: string;
  artist: string;
  /** Ses dosyası adresi (aynı kaynak ya da CORS açık olmalı). */
  src: string;
  artwork?: string;
};

type Repeat = 'off' | 'all' | 'one';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
const VOL_KEY = 'bsmnt:muzik-ses';

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

/* ── İkonlar: projenin geri kalanıyla aynı dil (currentColor, 2px stroke) ── */
const I = ({ d, fill, size = 18 }: { d: string; fill?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
    fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const PlayI = ({ size = 22 }) => <I d="M7 4l13 8-13 8z" fill size={size} />;
const PauseI = ({ size = 22 }) => <I d="M8 4h3.2v16H8zM12.8 4H16v16h-3.2z" fill size={size} />;
const PrevI = () => <I d="M18 5v14L8.5 12zM6.5 5v14" fill />;
const NextI = () => <I d="M6 5v14l9.5-7zM17.5 5v14" fill />;
const ShuffleI = () => <I d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />;
const RepeatI = () => <I d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />;
const VolI = () => <I d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7M19 5a9 9 0 010 14" />;
const MuteI = () => <I d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" />;
const ListI = () => <I d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;

const EQ_BARS = [0, 1, 2, 3, 4];

export default function MusicPlayer({
  tracks,
  startIndex = 0,
  loop = true,
  className,
}: {
  tracks: MusicTrack[];
  startIndex?: number;
  /** false ise liste sonunda durur (tek parçalı ses gönderilerinde böyle). */
  loop?: boolean;
  className?: string;
}) {
  // ARTIK KENDİ <audio>'SU YOK. Ses öğesi global MediaDock'ta yaşar (kök
  // düzende monte, gezinmede sökülmez) → sayfa değişince müzik kesilmez.
  // Bu bileşen o durumun BÜYÜK GÖRÜNÜMÜ: aynı arayüz, tek kaynak.
  const dock = useMediaDock();
  const barRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [listOpen, setListOpen] = useState(false);

  const multi = tracks.length > 1;
  // Dock başka bir şey çalıyorsa bu görünüm boşta durur (yanlış durum göstermez).
  const mine = !!dock?.isCurrent(tracks);

  const index = mine ? dock!.index : Math.min(Math.max(startIndex, 0), Math.max(tracks.length - 1, 0));
  const track = tracks[index];
  const playing = mine ? dock!.playing : false;
  const time = mine ? dock!.time : 0;
  const dur = mine ? dock!.dur : 0;
  const buffered = mine ? dock!.buffered : 0;
  const loading = mine ? dock!.loading : false;
  const error = mine ? dock!.error : '';
  const vol = dock?.vol ?? 1;
  const muted = dock?.muted ?? false;
  const repeat = dock?.repeat ?? (loop ? 'all' : 'off');
  const shuffle = dock?.shuffle ?? false;

  const toggle = useCallback(() => {
    if (!dock) return;
    // Bu liste dock'ta değilse önce devret; zaten oradaysa yalnız çal/duraklat.
    if (!dock.isCurrent(tracks)) dock.playTracks(tracks, index);
    else dock.toggle();
  }, [dock, tracks, index]);

  const step = useCallback((delta: number) => {
    if (!dock) return;
    if (!dock.isCurrent(tracks)) { dock.playTracks(tracks, index + delta); return; }
    dock.step(delta);
  }, [dock, tracks, index]);

  const jump = useCallback((to: number) => {
    if (!dock) return;
    if (!dock.isCurrent(tracks)) dock.playTracks(tracks, to);
    else dock.jump(to);
  }, [dock, tracks]);

  const seekTo = useCallback((clientX: number) => {
    const bar = barRef.current;
    if (!dock || !bar || !dur) return;
    const r = bar.getBoundingClientRect();
    dock.seek(Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * dur);
  }, [dock, dur]);

  /* Boşluk tuşu: çal/duraklat (çalar odaktayken) */
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      const t = e.target as HTMLElement;
      if (t.tagName === 'BUTTON' || t.tagName === 'INPUT') return;
      e.preventDefault(); toggle();
    }
  };

  const pct = dur > 0 ? (time / dur) * 100 : 0;
  const bufPct = dur > 0 ? (buffered / dur) * 100 : 0;
  const sirada = useMemo(() => tracks.map((_, i) => i), [tracks]);

  if (!tracks.length || !track) return null;

  return (
    <div ref={rootRef} className={cx('mp-root', className)} onKeyDown={onKey}>
{/* <audio> BURADA DEĞİL: global MediaDock'ta (bkz. yukarıdaki not). */}

      <div className={cx('mp-bar', playing && 'is-playing')}>
        {/* Seviye göstergesi — çalarken canlanır. Amber: sitenin sıcak aksanı. */}
        <div className="mp-eq" aria-hidden="true">
          {EQ_BARS.map(b => (
            <span key={b} style={{
              animationDuration: `${0.82 + b * 0.15}s`,
              animationPlayState: playing ? 'running' : 'paused',
              transform: playing ? undefined : 'scaleY(0.22)',
            }} />
          ))}
        </div>

        <div className="mp-meta">
          <div className="mp-title" title={track.title}>{track.title}</div>
          <div className="mp-sub">
            {error ? <span className="mp-err">{error}</span>
              : loading ? 'yükleniyor…'
              : <>{track.artist}{multi && <span className="mp-count"> · {index + 1}/{tracks.length}</span>}</>}
          </div>
        </div>

        <div className="mp-ctrl">
          {multi && <button type="button" onClick={() => step(-1)} aria-label="Önceki parça"><PrevI /></button>}
          <button type="button" onClick={toggle} aria-label={playing ? 'Duraklat' : 'Çal'} className="mp-play">
            {playing ? <PauseI /> : <PlayI />}
          </button>
          {multi && <button type="button" onClick={() => step(1)} aria-label="Sonraki parça"><NextI /></button>}
        </div>

        <div className="mp-side">
          <span className="mp-time tnum">{fmt(time)}<span className="mp-dim"> / {fmt(dur)}</span></span>

          <div className="mp-vol">
            <button type="button" onClick={() => dock?.setMuted(m => !m)} aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}>
              {muted || vol === 0 ? <MuteI /> : <VolI />}
            </button>
            <input
              type="range" min={0} max={1} step={0.01} value={muted ? 0 : vol}
              onChange={e => { dock?.setVol(+e.target.value); if (+e.target.value > 0) dock?.setMuted(false); }}
              aria-label="Ses düzeyi" className="mp-vol-range"
            />
          </div>

          {multi && (
            <>
              <button type="button" onClick={() => dock?.setShuffle(v => !v)} aria-label="Karıştır"
                aria-pressed={shuffle} className={cx('mp-tog', shuffle && 'on')}><ShuffleI /></button>
              <button type="button" aria-label={`Tekrar: ${repeat === 'off' ? 'kapalı' : repeat === 'all' ? 'liste' : 'tek parça'}`}
                onClick={() => dock?.setRepeat(r => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))}
                className={cx('mp-tog', repeat !== 'off' && 'on')}>
                <RepeatI />{repeat === 'one' && <b className="mp-one">1</b>}
              </button>
              <button type="button" onClick={() => setListOpen(o => !o)} aria-label="Parça listesi"
                aria-expanded={listOpen} className={cx('mp-tog', listOpen && 'on')}><ListI /></button>
            </>
          )}
        </div>

        {/* Sarma çubuğu — arkada yüklenen kısım (ghost), önde konum */}
        <div
          ref={barRef} className="mp-seek" role="slider" tabIndex={0}
          aria-label="Konum" aria-valuemin={0} aria-valuemax={Math.round(dur) || 0}
          aria-valuenow={Math.round(time)} aria-valuetext={`${fmt(time)} / ${fmt(dur)}`}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); seekTo(e.clientX); }}
          onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) seekTo(e.clientX); }}
          onKeyDown={e => {
            if (!dock || !dur) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); dock.seek(Math.min(dur, time + 5)); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); dock.seek(Math.max(0, time - 5)); }
          }}
        >
          <div className="mp-seek-track">
            <div className="mp-seek-buf" style={{ width: `${bufPct}%` }} />
            <div className="mp-seek-fill" style={{ width: `${pct}%` }} />
            <div className="mp-seek-knob" style={{ left: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Sıra — hangi parçanın çaldığı görünür, tıklayınca oraya atlar */}
      {multi && listOpen && (
        <ol className="mp-list">
          {sirada.map(i => (
            <li key={i}>
              <button type="button" onClick={() => jump(i)} className={cx(i === index && 'on')}>
                <span className="mp-list-n tnum">{i === index && playing ? '▸' : String(i + 1).padStart(2, '0')}</span>
                <span className="mp-list-t">{tracks[i].title}</span>
                <span className="mp-list-a">{tracks[i].artist}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      <style>{`
        .mp-root { width: 100%; max-width: 560px; color: #fff; }
        .mp-bar {
          position: relative; display: flex; align-items: center; gap: 14px;
          padding: 14px 16px 18px; border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(18px) saturate(170%);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          box-shadow: 0 10px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22);
          overflow: hidden;
        }
        /* Çalarken camın üstünden geçen çok hafif parıltı: "ses var" sinyali.
           Durunca durur — süs değil, durum göstergesi. */
        .mp-bar::after {
          content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0;
          background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.13) 50%, transparent 60%);
          transform: translateX(-60%);
        }
        .mp-bar.is-playing::after { opacity: 1; animation: mp-sheen 5.5s ease-in-out infinite; }
        @keyframes mp-sheen { 0% { transform: translateX(-60%); } 100% { transform: translateX(160%); } }
        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .mp-bar { background: rgba(28,24,64,0.9); }
        }

        .mp-eq { display: flex; align-items: flex-end; gap: 3px; height: 28px; flex-shrink: 0; }
        .mp-eq span {
          display: block; width: 3px; height: 100%; border-radius: 999px;
          background: linear-gradient(to top, var(--color-accent, #ff9d0a), #ffd08a);
          transform-origin: bottom; animation-name: mp-eq;
          animation-timing-function: ease-in-out; animation-iteration-count: infinite;
        }
        @keyframes mp-eq { 0%,100% { transform: scaleY(0.22); } 50% { transform: scaleY(1); } }

        .mp-meta { min-width: 0; flex: 1; }
        .mp-title { font-size: 0.9rem; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mp-sub { font-size: 0.7rem; color: rgba(255,255,255,0.58); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        .mp-count { color: rgba(255,255,255,0.4); }
        .mp-err { color: #ffb4b4; }

        .mp-ctrl { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .mp-ctrl button, .mp-side button {
          display: flex; align-items: center; justify-content: center;
          min-width: 40px; min-height: 40px; padding: 0;
          background: none; border: none; color: #fff; opacity: 0.82; cursor: pointer;
          border-radius: 999px;
          transition: opacity 0.15s, background 0.15s, transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mp-ctrl button:hover, .mp-side button:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .mp-ctrl button:active, .mp-side button:active { transform: scale(0.88); transition-duration: 0.09s; }
        /* İMZA: marka gradyanlı çal diski (elektrik indigo → magenta spark). */
        .mp-play {
          min-width: 48px !important; min-height: 48px !important;
          background: linear-gradient(135deg, var(--color-primary, #5b2eef), var(--color-spark, #f5288e)) !important;
          opacity: 1 !important; box-shadow: 0 4px 16px rgba(91,46,239,0.45);
        }
        .mp-play:hover { filter: brightness(1.08); }

        .mp-side { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .mp-time { font-size: 0.68rem; color: rgba(255,255,255,0.72); margin-right: 4px; white-space: nowrap; }
        .mp-dim { color: rgba(255,255,255,0.38); }
        .mp-tog { position: relative; }
        .mp-tog.on { color: var(--color-accent, #ff9d0a); opacity: 1; }
        .mp-one { position: absolute; right: 5px; bottom: 5px; font-size: 0.52rem; font-weight: 800; }

        .mp-vol { display: flex; align-items: center; }
        .mp-vol-range {
          width: 0; opacity: 0; padding: 0; margin: 0;
          transition: width 0.22s ease, opacity 0.22s ease, margin 0.22s ease;
          accent-color: var(--color-accent, #ff9d0a);
          height: 24px; cursor: pointer;
        }
        /* Ses çubuğu yer kaplamasın: ancak üstüne gelince ya da odakta açılır.
           Dokunmatikte hover yok → orada da açık dursun. */
        .mp-vol:hover .mp-vol-range, .mp-vol-range:focus-visible { width: 68px; opacity: 1; margin-left: 4px; }
        @media (hover: none) { .mp-vol-range { width: 56px; opacity: 1; margin-left: 4px; } }

        .mp-seek { position: absolute; left: 0; right: 0; bottom: 0; height: 18px; display: flex; align-items: flex-end; cursor: pointer; touch-action: none; }
        .mp-seek-track { position: relative; width: 100%; height: 4px; background: rgba(255,255,255,0.16); }
        .mp-seek-buf { position: absolute; inset-block: 0; left: 0; background: rgba(255,255,255,0.22); }
        .mp-seek-fill { position: absolute; inset-block: 0; left: 0; background: linear-gradient(90deg, var(--color-primary, #5b2eef), var(--color-spark, #f5288e)); }
        .mp-seek-knob {
          position: absolute; top: 50%; width: 10px; height: 10px; margin-left: -5px;
          border-radius: 50%; background: #fff; transform: translateY(-50%) scale(0);
          transition: transform 0.16s ease; box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        .mp-seek:hover .mp-seek-knob, .mp-seek:focus-visible .mp-seek-knob { transform: translateY(-50%) scale(1); }

        .mp-list { list-style: none; margin: 8px 0 0; padding: 6px; max-height: 232px; overflow-y: auto;
          border-radius: 14px; border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(18px) saturate(170%); -webkit-backdrop-filter: blur(18px) saturate(170%); }
        .mp-list button {
          display: flex; align-items: baseline; gap: 10px; width: 100%; text-align: left;
          padding: 9px 10px; min-height: 40px; border: none; border-radius: 10px;
          background: none; color: rgba(255,255,255,0.78); cursor: pointer; font-family: inherit;
          transition: background 0.14s, color 0.14s;
        }
        .mp-list button:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .mp-list button.on { color: #fff; background: rgba(255,255,255,0.11); }
        .mp-list-n { font-size: 0.66rem; color: rgba(255,255,255,0.4); width: 16px; flex-shrink: 0; }
        .mp-list button.on .mp-list-n { color: var(--color-accent, #ff9d0a); }
        .mp-list-t { font-size: 0.82rem; font-weight: 600; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mp-list-a { font-size: 0.68rem; color: rgba(255,255,255,0.42); flex-shrink: 0; max-width: 34%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Dar ekranda önce süre, sonra karıştır/tekrar düşer — çal/ileri/geri kalır. */
        @media (max-width: 560px) { .mp-time { display: none; } }
        @media (max-width: 440px) { .mp-side .mp-tog:not(:last-child) { display: none; } }
        @media (max-width: 360px) { .mp-vol { display: none; } }

        @media (prefers-reduced-motion: reduce) {
          .mp-eq span { animation: none; transform: scaleY(0.5); }
          .mp-bar.is-playing::after { animation: none; opacity: 0; }
          .mp-ctrl button, .mp-side button, .mp-seek-knob { transition: none; }
          .mp-ctrl button:active, .mp-side button:active { transform: none; }
        }
      `}</style>
    </div>
  );
}
