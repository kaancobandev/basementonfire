'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Aynı anda tek ses çalsın diye yayınlanan olay. Gönderinin arka plan müziği
 * (MediaCarousel/MusicLayer) ile videolar bu olayı PAYLAŞIR: biri sesi açınca
 * diğerleri susar.
 */
export const AUDIO_SOLO_EVENT = 'bsmnt:audio-solo';

/**
 * KAPAK KARESİ.
 * Kayıtlarda ayrı bir poster görseli yok; `poster` verilmeyen bir <video>
 * oynatılana kadar SİYAH kutu olarak duruyordu (ızgarada `preload="none"`
 * olanlarda her zaman, diğerlerinde tarayıcıya göre). `#t=` medya parçası
 * tarayıcıya "metadata'yı al ve bu ana atla" der → ilk kare boyanır ve kapak
 * görseli gibi görünür. 0 değil 0.001: tam 0 bazı tarayıcılarda "arama yapma"
 * demek ve kare boyanmıyor.
 *
 * blob:/data: URL'lerine EKLEMİYORUZ — nesne aramasını bozma riski var;
 * orada kareyi aşağıdaki imperatif seekToFirstFrame boyar.
 */
export function firstFrameSrc(url: string): string {
  if (!url || url.includes('#') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${url}#t=0.001`;
}

/** `#t=` parçasını yok sayan tarayıcılar için ikinci kapı: metadata gelince ilk kareye atla. */
export function seekToFirstFrame(v: HTMLVideoElement | null) {
  if (!v || !v.paused || v.currentTime > 0) return;
  try { v.currentTime = 0.001; } catch { /* aranabilir değilse olduğu gibi kalsın */ }
}

export function IconMuted() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}
export function IconSound() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/** Izgara hücresinde video kapağı — tek bir <video> döner (drop-in: çağıranın
 *  mevcut style/className'i aynen geçer, hücre CSS'i değişmez). */
export function VideoThumb({ src, style, className }: {
  src: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <video
      src={firstFrameSrc(src)}
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={e => seekToFirstFrame(e.currentTarget)}
      className={className}
      style={style}
    />
  );
}

/** Izgara hücresinde "bu bir video" göstergesi (sol alt — MusicBadge sol üstte,
 *  MultiBadge sağ üstte olduğu için orası boş). */
export function PlayBadge() {
  return (
    <span aria-hidden style={{ position: 'absolute', bottom: 8, left: 8, color: '#fff', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))', display: 'flex', pointerEvents: 'none', zIndex: 2 }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

/**
 * Akış/lightbox video oynatıcısı — Instagram davranışı.
 *
 * Neden tarayıcının `controls` arayüzü DEĞİL: her tarayıcıda farklı görünüyor
 * (Chrome'un gri çubuğu sitenin diline hiç uymuyordu) ve `title` ile birlikte
 * imleç videonun üstüne gelince gönderi açıklamasını balon olarak gösteriyordu.
 * Buradaki oynatıcı: görünürken sessiz otomatik oynar, tıklayınca durur/devam
 * eder, sağ altta sesi aç/kapat, altta ince ilerleme çubuğu. Erişilebilirlik
 * `aria-label` ile korunur — `title` KULLANILMAZ (balon metnin kaynağı oydu).
 */
export default function FeedVideo({ src, ariaLabel, variant, onLoadedMetadata }: {
  src: string;
  /** Gönderi açıklaması — yalnız aria-label olarak kullanılır (balon YOK). */
  ariaLabel?: string;
  variant: 'feed' | 'lightbox';
  /** Feed en–boy oranı ölçümü için MediaCarousel'in kancası. */
  onLoadedMetadata?: React.ReactEventHandler<HTMLVideoElement>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const soloId = useId();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  // Kullanıcı ELLE duraklattıysa görünürlük geri geldiğinde kendiliğinden başlatma.
  const userPaused = useRef(false);

  // `muted`'i imperatif uygula — React'in muted prop'u güvenilir değil
  // (MusicLayer'da da aynı not). Otomatik oynatma politikası gereği ilk
  // oynatmanın sessiz olması ŞART, o yüzden bu efekt IntersectionObserver
  // efektinden ÖNCE tanımlı.
  useEffect(() => { if (vidRef.current) vidRef.current.muted = muted; }, [muted]);

  // Görünürken oynat, çıkınca duraklat. Eşik yüksek (0.55) çünkü akışta aynı
  // anda tek video oynasın istiyoruz — yoksa ekrandaki her kart ağ+pil harcar.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = vidRef.current;
        if (!v) return;
        if (e.isIntersecting && e.intersectionRatio >= 0.55) {
          if (!userPaused.current) v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: [0, 0.55, 1] },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  // Başka bir yerde ses açılınca sus (tek seferde tek ses)
  useEffect(() => {
    function onSolo(e: Event) { if ((e as CustomEvent).detail !== soloId) setMuted(true); }
    window.addEventListener(AUDIO_SOLO_EVENT, onSolo);
    return () => window.removeEventListener(AUDIO_SOLO_EVENT, onSolo);
  }, [soloId]);

  function togglePlay() {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}); }
    else { userPaused.current = true; v.pause(); }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const v = vidRef.current;
    if (!v) return;
    const next = !v.muted; // DOM'un GERÇEK durumundan oku — hızlı tıklamada bayat closure'ı önler
    v.muted = next;
    setMuted(next);
    if (!next) {
      window.dispatchEvent(new CustomEvent(AUDIO_SOLO_EVENT, { detail: soloId }));
      userPaused.current = false;
      v.play().catch(() => {});
    }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <video
        ref={vidRef}
        src={firstFrameSrc(src)}
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={ariaLabel}
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={e => {
          const v = e.currentTarget;
          setPct(v.duration > 0 ? (v.currentTime / v.duration) * 100 : 0);
        }}
        onLoadedMetadata={e => { seekToFirstFrame(e.currentTarget); onLoadedMetadata?.(e); }}
        style={{ width: '100%', height: '100%', objectFit: variant === 'feed' ? 'cover' : 'contain', display: 'block', cursor: 'pointer', background: '#000' }}
      />

      {/* Duraklatınca ortada oynat düğmesi (Instagram'daki gibi) */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Oynat"
          style={{ position: 'absolute', inset: 0, margin: 'auto', width: 62, height: 62, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.42)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(2px)', zIndex: 5 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
        style={{ position: 'absolute', bottom: 12, right: 10, zIndex: 6, width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
      >
        {muted ? <IconMuted /> : <IconSound />}
      </button>

      {/* İlerleme çubuğu — BİLEREK tıklanamaz (pointerEvents:none): karusel
          slaytları parmakla sürükleniyor, çubuk üstünde ayrıca sarma jesti
          olsaydı iki hareket çakışırdı. Instagram akışında da göstergedir. */}
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,0.22)', pointerEvents: 'none', zIndex: 5 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(255,255,255,0.95)' }} />
      </div>
    </div>
  );
}
