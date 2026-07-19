'use client';

// GLOBAL MEDYA DOCK'U — sağ altta, gezinmede ÖLMEZ.
//
// NEDEN BURADA: <audio> ya da <iframe> bir sayfa bileşeninin içindeyken, o
// sayfadan çıkınca React ağacı söker ve çalma durur. Bu sağlayıcı AppShell'de
// mount edilir; AppShell kök düzende {children}'ı sardığı için istemci-taraflı
// gezinmede yeniden mount EDİLMEZ → tek bir ses öğesi ve tek bir gömülü çerçeve
// tüm oturum boyunca yaşar.
//
// ÜÇ KAYNAK, EŞİT DEĞİL — dürüst olmak gerekirse:
//  · Site parçaları (kendi <audio>'muz) → tam denetim (çal/duraklat/sar/ileri).
//  · YouTube → çerçeve yaşar; çal/duraklat `enablejsapi=1` + postMessage ile.
//  · Spotify → çerçeve yaşar ama Spotify standart gömme için dışarıya güvenilir
//    bir denetim API'si VERMEZ. Bu yüzden onu küçültüp köşeye sabitliyoruz;
//    denetim Spotify'ın kendi arayüzünden yapılır. Sahte düğme koymuyoruz.

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import type { MusicTrack } from './MusicPlayer';

type Embed = { provider: 'youtube' | 'spotify'; src: string; title: string };
type Media =
  | { kind: 'audio'; tracks: MusicTrack[]; index: number }
  | { kind: 'embed'; embed: Embed }
  | null;

type Repeat = 'off' | 'all' | 'one';

type Ctx = {
  media: Media;
  playing: boolean;
  time: number;
  dur: number;
  buffered: number;
  loading: boolean;
  error: string;
  vol: number;
  muted: boolean;
  repeat: Repeat;
  shuffle: boolean;
  index: number;
  tracks: MusicTrack[];
  setVol: (v: number) => void;
  setMuted: (m: boolean | ((p: boolean) => boolean)) => void;
  setRepeat: (r: Repeat | ((p: Repeat) => Repeat)) => void;
  setShuffle: (s: boolean | ((p: boolean) => boolean)) => void;
  jump: (i: number) => void;
  /** Bir çalma listesini dock'a devret ve çalmaya başla. */
  playTracks: (tracks: MusicTrack[], index?: number) => void;
  /** Gömülü içeriği (YouTube/Spotify) dock'a devret. */
  playEmbed: (embed: Embed) => void;
  toggle: () => void;
  seek: (sec: number) => void;
  step: (delta: number) => void;
  close: () => void;
  /** Bu parça listesi şu an dock'ta mı? (sayfa içi görünümün durumu yansıtması için) */
  isCurrent: (tracks: MusicTrack[]) => boolean;
};

const MediaCtx = createContext<Ctx | null>(null);
export const useMediaDock = () => useContext(MediaCtx);

const VOL_KEY = 'bsmnt:muzik-ses';
const key = (t: MusicTrack[]) => t.map(x => x.src).join('|');

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

const I = ({ d, fill, size = 18 }: { d: string; fill?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
    fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

export function MediaDockProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [media, setMedia] = useState<Media>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [open, setOpen] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vol, setVol] = useState(1);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>('all');
  const [shuffle, setShuffle] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  // GİZLE ≠ KAPAT: gizlemek yalnız paneli saklar, çalma sürer ve küçük bir
  // düğme geri getirir. Kapatmak sesi durdurup dock'u tamamen kaldırır.
  const [hidden, setHidden] = useState(false);

  const tracks = media?.kind === 'audio' ? media.tracks : [];
  const track = media?.kind === 'audio' ? media.tracks[media.index] : null;

  // Kaynak değişince yükle ve çal. Gömülü içerik açılırsa ses susar (tek kaynak).
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!track) { a.pause(); a.removeAttribute('src'); a.load(); return; }
    setError(''); setLoading(true); setBuffered(0); setTime(0);
    a.src = track.src;
    a.load();
    a.play().catch(() => { /* engellendi */ });
  }, [track?.src]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Kayıtlı ses düzeyi */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VOL_KEY);
      const v = raw === null ? NaN : Number(raw);
      if (Number.isFinite(v) && v >= 0 && v <= 1) setVol(v);
    } catch { /* depolama kapalı */ }
  }, []);
  useEffect(() => {
    const a = audioRef.current;
    if (a) { a.volume = vol; a.muted = muted; }
    try { localStorage.setItem(VOL_KEY, String(vol)); } catch { /* yok say */ }
  }, [vol, muted]);

  /* Karıştırma sırası: yalnız karıştırma AÇILDIĞINDA üretilir; her render'da
     yenilenirse "sonraki" her seferinde başka yere giderdi. */
  useEffect(() => {
    if (!shuffle || media?.kind !== 'audio') { setOrder([]); return; }
    const cur = media.index;
    const rest = media.tracks.map((_, i) => i).filter(i => i !== cur);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    setOrder([cur, ...rest]);
  }, [shuffle, media?.kind === 'audio' ? media.tracks.length : 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const jump = useCallback((i: number) => {
    setMedia(m => (m?.kind === 'audio'
      ? { ...m, index: ((i % m.tracks.length) + m.tracks.length) % m.tracks.length }
      : m));
  }, []);

  const playTracks = useCallback((t: MusicTrack[], index = 0) => {
    if (!t.length) return;
    setOpen(true); setHidden(false);   // yeni parça başlatınca panel geri gelsin
    setMedia({ kind: 'audio', tracks: t, index: Math.min(Math.max(index, 0), t.length - 1) });
  }, []);

  const playEmbed = useCallback((embed: Embed) => {
    setOpen(true); setHidden(false);
    setMedia({ kind: 'embed', embed });
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setMedia(null);
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (media?.kind === 'audio' && a) { a.paused ? a.play().catch(() => {}) : a.pause(); return; }
    if (media?.kind === 'embed' && media.embed.provider === 'youtube') {
      // enablejsapi=1 ile YouTube postMessage komutlarını kabul eder.
      const cmd = playing ? 'pauseVideo' : 'playVideo';
      frameRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: cmd, args: '' }), '*',
      );
      setPlaying(p => !p);
    }
    // Spotify: dışarıdan denetim yok — kullanıcı çerçevenin kendi düğmesini kullanır.
  }, [media, playing]);

  const seek = useCallback((sec: number) => {
    const a = audioRef.current;
    if (a && Number.isFinite(sec)) a.currentTime = sec;
  }, []);

  const step = useCallback((delta: number) => {
    setMedia(m => {
      if (m?.kind !== 'audio' || m.tracks.length < 2) return m;
      // Karıştırma açıksa sıradaki, listedeki komşu değil KARIŞIK sıradakidir.
      if (shuffle && order.length) {
        const pos = order.indexOf(m.index);
        const np = pos + delta;
        if (np < 0 || np >= order.length) {
          if (repeat !== 'all') return m;
          return { ...m, index: order[(np + order.length) % order.length] };
        }
        return { ...m, index: order[np] };
      }
      const next = m.index + delta;
      if ((next < 0 || next >= m.tracks.length) && repeat !== 'all') return m;
      return { ...m, index: ((next % m.tracks.length) + m.tracks.length) % m.tracks.length };
    });
  }, [shuffle, order, repeat]);

  const isCurrent = useCallback(
    (t: MusicTrack[]) => media?.kind === 'audio' && key(media.tracks) === key(t),
    [media],
  );

  /* Kilit ekranı / bildirim denetimleri */
  useEffect(() => {
    const ms = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined;
    if (!ms) return;
    if (!track) { ms.metadata = null; return; }
    ms.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: 'Basements' });
    const set = (k: MediaSessionAction, fn: (() => void) | null) => {
      try { ms.setActionHandler(k, fn); } catch { /* desteklenmiyor */ }
    };
    set('play', () => audioRef.current?.play().catch(() => {}));
    set('pause', () => audioRef.current?.pause());
    set('previoustrack', tracks.length > 1 ? () => step(-1) : null);
    set('nexttrack', tracks.length > 1 ? () => step(1) : null);
  }, [track, tracks.length, step]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaSession) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
  }, [playing]);

  const ctx = useMemo<Ctx>(() => ({
    media, playing, time, dur, buffered, loading, error, vol, muted, repeat, shuffle,
    index: media?.kind === 'audio' ? media.index : 0,
    tracks,
    setVol, setMuted, setRepeat, setShuffle, jump,
    playTracks, playEmbed, toggle, seek, step, close, isCurrent,
  }), [media, playing, time, dur, buffered, loading, error, vol, muted, repeat, shuffle,
    tracks, jump, playTracks, playEmbed, toggle, seek, step, close, isCurrent]);

  const pct = dur > 0 ? (time / dur) * 100 : 0;
  const embed = media?.kind === 'embed' ? media.embed : null;

  return (
    <MediaCtx.Provider value={ctx}>
      {children}

      {/* Ses öğesi HER ZAMAN monte — kaynak yokken sessizdir. Sökülürse çalma ölür. */}
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDur(e.currentTarget.duration)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onProgress={e => { const b = e.currentTarget.buffered; if (b.length) setBuffered(b.end(b.length - 1)); }}
        onError={() => { setLoading(false); setError('Bu parça yüklenemedi.'); }}
        onEnded={() => {
          const a = audioRef.current;
          if (repeat === 'one' && a) { a.currentTime = 0; a.play().catch(() => {}); return; }
          if (tracks.length > 1) { step(1); return; }
          if (repeat === 'all' && a) { a.currentTime = 0; a.play().catch(() => {}); return; }
          setPlaying(false);
        }}
      />

      {media && hidden && (
        <button
          type="button" className="mdock-peek" onClick={() => setHidden(false)}
          aria-label={playing ? 'Çaları göster (çalıyor)' : 'Çaları göster'}
        >
          <I d="M9 18V5l12-2v13" size={16} />
          <span className="mdock-peek-dot" data-on={playing ? '1' : '0'} aria-hidden="true" />
        </button>
      )}

      {media && !hidden && (
        <aside className={`mdock${open ? '' : ' is-min'}`} aria-label="Çalan medya">
          <div className="mdock-head">
            <span className="mdock-dot" data-on={playing ? '1' : '0'} aria-hidden="true" />
            <span className="mdock-title">
              {media.kind === 'audio' ? track?.title : embed?.title}
            </span>
            <button type="button" onClick={() => setOpen(o => !o)} aria-label={open ? 'Küçült' : 'Büyüt'} aria-expanded={open}>
              <I d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
            </button>
            <button type="button" onClick={() => setHidden(true)} aria-label="Çaları gizle">
              <I d="M4 12h16" />
            </button>
            <button type="button" onClick={close} aria-label="Kapat"><I d="M18 6L6 18M6 6l12 12" /></button>
          </div>

          {open && embed && (
            <div className={`mdock-frame ${embed.provider}`}>
              <iframe
                ref={frameRef}
                src={embed.src}
                title={embed.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          {media.kind === 'audio' && (
            <div className="mdock-audio">
              <div className="mdock-ctrl">
                {tracks.length > 1 && (
                  <button type="button" onClick={() => step(-1)} aria-label="Önceki parça">
                    <I d="M18 5v14L8.5 12zM6.5 5v14" fill />
                  </button>
                )}
                <button type="button" onClick={toggle} aria-label={playing ? 'Duraklat' : 'Çal'} className="mdock-play">
                  {playing ? <I d="M8 4h3.2v16H8zM12.8 4H16v16h-3.2z" fill size={20} />
                    : <I d="M7 4l13 8-13 8z" fill size={20} />}
                </button>
                {tracks.length > 1 && (
                  <button type="button" onClick={() => step(1)} aria-label="Sonraki parça">
                    <I d="M6 5v14l9.5-7zM17.5 5v14" fill />
                  </button>
                )}
              </div>
              <div className="mdock-meta">
                <span className="mdock-artist">{track?.artist}</span>
                <span className="mdock-time tnum">{fmt(time)} / {fmt(dur)}</span>
              </div>
              <div
                className="mdock-seek" role="slider" tabIndex={0} aria-label="Konum"
                aria-valuemin={0} aria-valuemax={Math.round(dur) || 0} aria-valuenow={Math.round(time)}
                onPointerDown={e => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  const r = e.currentTarget.getBoundingClientRect();
                  seek(Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * dur);
                }}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight') { e.preventDefault(); seek(Math.min(dur, time + 5)); }
                  if (e.key === 'ArrowLeft') { e.preventDefault(); seek(Math.max(0, time - 5)); }
                }}
              >
                <div className="mdock-seek-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </aside>
      )}

      <style>{`
        .mdock {
          position: fixed; right: 12px; z-index: 120;
          /* Mobilde alt dock'un üstünde dur — ölçü tek kaynaktan (globals.css). */
          bottom: calc(var(--nav-space, 0px) + 12px);
          width: min(330px, calc(100vw - 24px));
          border-radius: 16px; overflow: hidden; color: #fff;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(24,20,52,0.72);
          backdrop-filter: blur(18px) saturate(170%);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          box-shadow: 0 12px 36px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          .mdock { background: rgba(24,20,52,0.96); }
        }
        @media (min-width: 700px) { .mdock { bottom: 16px; right: 16px; } }

        /* Gizliyken kalan minik düğme — dokunma hedefi 44px, görsel olarak küçük. */
        .mdock-peek {
          position: fixed; right: 12px; z-index: 120;
          bottom: calc(var(--nav-space, 0px) + 12px);
          display: flex; align-items: center; justify-content: center; gap: 0;
          width: 44px; height: 44px; padding: 0; border-radius: 999px; cursor: pointer;
          color: #fff; border: 1px solid rgba(255,255,255,0.18);
          background: rgba(24,20,52,0.72);
          backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
          box-shadow: 0 8px 24px rgba(0,0,0,0.38);
          transition: transform 0.26s cubic-bezier(0.34,1.56,0.64,1), background 0.15s;
        }
        .mdock-peek:hover { background: rgba(34,28,68,0.85); }
        .mdock-peek:active { transform: scale(0.9); transition-duration: 0.09s; }
        @media (min-width: 700px) { .mdock-peek { bottom: 16px; right: 16px; } }
        .mdock-peek-dot {
          position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
        }
        .mdock-peek-dot[data-on="1"] {
          background: var(--color-accent, #ff9d0a); box-shadow: 0 0 7px var(--color-accent, #ff9d0a);
        }

        .mdock-head { display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 12px; }
        .mdock-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.3); flex-shrink: 0; }
        .mdock-dot[data-on="1"] { background: var(--color-accent, #ff9d0a); box-shadow: 0 0 8px var(--color-accent, #ff9d0a); }
        .mdock-title { flex: 1; min-width: 0; font-size: 0.78rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mdock-head button, .mdock-ctrl button {
          display: flex; align-items: center; justify-content: center;
          min-width: 34px; min-height: 34px; padding: 0; flex-shrink: 0;
          background: none; border: none; color: #fff; opacity: 0.72; cursor: pointer; border-radius: 999px;
          transition: opacity 0.15s, background 0.15s, transform 0.26s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mdock-head button:hover, .mdock-ctrl button:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .mdock-head button:active, .mdock-ctrl button:active { transform: scale(0.88); transition-duration: 0.09s; }

        .mdock-frame { position: relative; width: 100%; background: #000; }
        .mdock-frame.youtube { aspect-ratio: 16 / 9; }
        .mdock-frame.spotify { height: 152px; }
        .mdock-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; display: block; }
        .mdock-frame.spotify iframe { position: static; height: 152px; }

        .mdock-audio { position: relative; padding: 2px 10px 12px; }
        .mdock-ctrl { display: flex; align-items: center; justify-content: center; gap: 4px; }
        .mdock-play {
          min-width: 42px !important; min-height: 42px !important; opacity: 1 !important;
          background: linear-gradient(135deg, var(--color-primary, #5b2eef), var(--color-spark, #f5288e)) !important;
          box-shadow: 0 3px 12px rgba(91,46,239,0.45);
        }
        .mdock-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; }
        .mdock-artist { font-size: 0.68rem; color: rgba(255,255,255,0.55); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mdock-time { font-size: 0.66rem; color: rgba(255,255,255,0.45); flex-shrink: 0; }
        .mdock-seek { margin-top: 8px; height: 14px; display: flex; align-items: center; cursor: pointer; touch-action: none; }
        .mdock-seek::before { content: ''; position: absolute; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.16); }
        .mdock-seek-fill { position: relative; height: 4px; background: linear-gradient(90deg, var(--color-primary, #5b2eef), var(--color-spark, #f5288e)); }

        .mdock.is-min .mdock-head { padding: 6px 6px 6px 12px; }

        @media (prefers-reduced-motion: reduce) {
          .mdock-head button, .mdock-ctrl button { transition: none; }
          .mdock-head button:active, .mdock-ctrl button:active { transform: none; }
        }
      `}</style>
    </MediaCtx.Provider>
  );
}
