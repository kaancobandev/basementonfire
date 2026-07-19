'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Img from '@/app/components/Img';
import MusicPlayer from '@/app/components/MusicPlayer';
import { splitMedia, type MediaItem } from '@/lib/types';
import { swipeTarget } from '@/lib/swipe';

// Lightbox medya sütunu artık her yüzeyde belirli yükseklikte → %100 ebeveyni doldurur
// (masaüstünde 90vh'lik sütun = eski görünüm; mobil dikey istifte doğru ölçü).
const containStyle: React.CSSProperties = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };
// Feed: tüm slaytların paylaştığı en–boy oranı. Saklanan boyut olmadığından ilk
// görsel yüklenince ölçülür; ölçülene dek 1:1 yer tutucu (mevcut kare görünümle
// aynı → ilk boyamada zıplama olmaz; gerçek 4:5 gönderiler yüklenince uzar).
const FEED_DEFAULT_RATIO = 1;   // 1:1 yer tutucu (ölçülene dek)
const FEED_MIN_RATIO = 0.8;     // 4:5 dikey (en dar) — Instagram sınırı
const FEED_MAX_RATIO = 1.91;    // 1.91:1 yatay (en geniş) — Instagram sınırı
// `display` BİLEREK burada değil, .mc-nav sınıfında: satır içi stil medya
// sorgusuyla ezilemez, dokunmatikte okları gizleyen kural CSS'te yaşıyor.
const navBtn = (side: 'left' | 'right'): React.CSSProperties => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  ...(side === 'left' ? { left: 8 } : { right: 8 }),
  width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '1.4rem', lineHeight: 1,
  alignItems: 'center', justifyContent: 'center', zIndex: 4, backdropFilter: 'blur(3px)',
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

/** Yalnızca ses içeren gönderi (görsel yok) için oynatıcı kartı.
 *  Tarayıcının çıplak <audio controls> arayüzü yerine kendi cam çalarımız:
 *  varsayılan denetimler her tarayıcıda farklı görünüyor ve sitenin diline
 *  hiç uymuyordu. Başlık gönderi açıklamasından gelir. */
function AudioCard({ url, variant, caption }: { url: string; variant: 'lightbox' | 'feed'; caption?: string }) {
  const title = (caption ?? '').trim().split('\n')[0].slice(0, 60) || 'Ses kaydı';
  return (
    <div style={{
      width: '100%',
      ...(variant === 'feed' ? { aspectRatio: '16 / 9' } : { height: '100%' }),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
      background: 'linear-gradient(135deg, #312e81, #4c1d95)', color: '#fff', padding: 24, boxSizing: 'border-box',
    }}>
      <NoteIcon size={40} />
      <MusicPlayer tracks={[{ title, artist: 'Basements', src: url }]} loop={false} />
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
export default function MediaCarousel({ media, sizes, background = '#000', variant = 'lightbox', caption: captionRaw, priority = false }: {
  media: MediaItem[];
  sizes?: string;
  background?: string;
  variant?: 'lightbox' | 'feed';
  /** Gönderi açıklaması — görsel alt metni + video title/aria-label (erişilebilirlik + SEO). */
  caption?: string;
  /** LCP adayı (sayfanın ilk büyük medyası): ilk görsel eager + fetchpriority=high.
   *  false ise feed görselleri lazy iner → ekran altındaki kartlar açılışta indirilmez. */
  priority?: boolean;
}) {
  // Boş/undefined → alt='' kalır ama title/aria-label hiç eklenmez (geçersiz "undefined" önlenir).
  const caption = captionRaw || undefined;
  const [idx, setIdx] = useState(0);
  // Feed en–boy oranı: ilk görselden ölçülür (SSR'da saklı boyut yok).
  // null = henüz ölçülmedi → 1:1 yer tutucu.
  const [feedRatio, setFeedRatio] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Dokunmatik sürükleme durumu — aşağıdaki onTouch* işleyicileri kullanır.
  // BURADA tanımlı olmalı (diğer hook'larla birlikte): aşağıdaki tek-görsel
  // dalı erken `return` ediyor, oraya konsaydı koşullu hook çağrısı olur ve
  // tek/çok görselli gönderiler arasında geçişte React patlardı.
  const drag = useRef({ x: 0, scroll: 0, from: 0, active: false });
  // Sürükleme sırasında taşınan iç sarmalayıcı (transform hedefi) + oturma
  // animasyonunun iki kez bitmesini önleyen bayrak.
  const innerRef = useRef<HTMLDivElement>(null);
  const settling = useRef(false);
  // Geçişten sonra CSS yapışmasını geri açan zamanlayıcı (aynı sebeple burada).
  const snapBack = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (snapBack.current) clearTimeout(snapBack.current); }, []);

  const { visuals, audio } = splitMedia(media);

  // CLS önlemi: ilk görselin w/h boyutu KAYITLIYSA oran SSR'da hesaplanır ve ilk
  // boyamadan itibaren doğrudur → kutu hiç zıplamaz, tarayıcı ölçmez.
  const first = visuals[0];
  const knownRatio = variant === 'feed' && first && first.w && first.h
    ? Math.min(FEED_MAX_RATIO, Math.max(FEED_MIN_RATIO, first.w / first.h))
    : null;

  // Feed en–boy oranı FALLBACK yolu (w/h'si olmayan eski kayıtlar): ilk görselden
  // ölçülür. Ölçülen oran [0.8 .. 1.91]'e kısıtlanır; tüm slaytlar bu tek oranı
  // paylaşır (object-fit:cover doldurur) — Instagram gibi. Yalnız ilk ölçüm sabitlenir.
  const feedAspect = String(knownRatio ?? feedRatio ?? FEED_DEFAULT_RATIO);
  const measureFeedRatio = (w: number, h: number) => {
    if (knownRatio !== null) return; // oran zaten kayıttan geldi, ölçme
    if (!w || !h) return;
    const r = Math.min(FEED_MAX_RATIO, Math.max(FEED_MIN_RATIO, w / h));
    setFeedRatio(prev => (prev === null ? r : prev));
  };
  const onFeedImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) =>
    measureFeedRatio(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight);
  const onFeedVideoMeta = (e: React.SyntheticEvent<HTMLVideoElement>) =>
    measureFeedRatio(e.currentTarget.videoWidth, e.currentTarget.videoHeight);

  // Önbellekteki (zaten yüklenmiş) ilk görselin onLoad'u hydration listener eklenmeden
  // ateşlenip kaçabilir (SSR yarışı) → mount'ta complete ise oranı hemen ölç.
  // prev===null kilidi (measureFeedRatio) onLoad ile çift ölçümü zaten engeller.
  useEffect(() => {
    if (variant !== 'feed') return;
    const el = containerRef.current?.querySelector('img, video');
    if (el instanceof HTMLImageElement) {
      if (el.complete && el.naturalWidth) measureFeedRatio(el.naturalWidth, el.naturalHeight);
    } else if (el instanceof HTMLVideoElement) {
      if (el.readyState >= 1 && el.videoWidth) measureFeedRatio(el.videoWidth, el.videoHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Görsel yok → ses-only kart, yoksa null
  if (visuals.length === 0) {
    return audio ? <AudioCard url={audio} variant={variant} caption={captionRaw} /> : null;
  }

  // TEK görsel
  if (visuals.length === 1) {
    const m = visuals[0];

    // Feed: paylaşılan (ölçülen) oran — kare zorlaması yok; object-fit:cover doldurur.
    // İlk görsel yüklenince oran gerçek değere oturur (eski gönderilerde de çalışır).
    if (variant === 'feed') {
      const st: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
      return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', aspectRatio: feedAspect, maxHeight: '100%', overflow: 'hidden', background }}>
          {m.type === 'video'
            ? <video src={m.url} controls playsInline title={caption} aria-label={caption} onLoadedMetadata={onFeedVideoMeta} style={st} />
            : <Img src={m.url} alt={caption || ''} sizes={sizes} onLoad={onFeedImgLoad} loading={priority ? undefined : 'lazy'} fetchPriority={priority ? 'high' : undefined} style={st} />}
          {audio && <MusicLayer url={audio} targetRef={containerRef} />}
        </div>
      );
    }

    // Lightbox — müzik yoksa mevcut görünüm (drop-in, hiç değişmez)
    if (!audio) {
      return m.type === 'video'
        ? <video src={m.url} controls playsInline title={caption} aria-label={caption} style={containStyle} />
        : <Img src={m.url} alt={caption || ''} sizes={sizes} style={containStyle} />;
    }

    // Lightbox + müzik → sarmalayıcı + arka plan müziği (sağ alt sustur/aç)
    return (
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {m.type === 'video'
          ? <video src={m.url} controls playsInline title={caption} aria-label={caption} style={containStyle} />
          : <Img src={m.url} alt={caption || ''} sizes={sizes} style={containStyle} />}
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
    const t = trackRef.current; if (!t || !t.clientWidth) return;
    // PARMAK EKRANDAYKEN durum GÜNCELLENMEZ.
    // Neden: onTouchMove her karede scrollLeft yazıyor, bu da onScroll'u
    // tetikliyordu. Kaydırma yarıyı geçtiği an Math.round bir sonraki indekse
    // dönüyor ve setIdx çağrılıyordu → sürüklemenin TAM ORTASINDA React
    // yeniden render + ok butonlarının DOM'dan eklenip çıkarılması (ikisi de
    // `idx`e bağlı). Sonuç: her kaydırmada aynı noktada hissedilen takılma.
    // Doğru indeksi zaten onTouchEnd'de go() yazıyor; sürüklerken gerekmiyor.
    if (drag.current.active) return;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    if (i !== idx) setIdx(i);
  }

  // ── BİR KAYDIRMA = BİR GÖRSEL (dokunmatik) ────────────────────────────────
  // Önce yalnız CSS ile denendi (`scroll-snap-stop: always`) ama telefonda
  // YETMEDİ — tek savurmada hâlâ 2 görsel atlıyordu (iOS Safari'de bu
  // özelliğin bilinen güvenilirlik sorunları var). O yüzden hareketi tarayıcının
  // momentumuna bırakmıyoruz, parmağı biz takip edip biz bırakıyoruz.
  //
  // Track'te `touchAction: 'pan-y'` var: tarayıcı YATAY savurmayı hiç
  // başlatmıyor (dolayısıyla savaşacağımız momentum da yok), dikey sayfa
  // kaydırma ise normal çalışmaya devam ediyor. Masaüstü trackpad/fare
  // kaydırması etkilenmiyor — o hâlâ native scroll + snap ile yürüyor.
  function onTouchStart(e: React.TouchEvent) {
    // clientWidth 0 iken (henuz yerlesmemis kapsayici) bolme NaN uretirdi.
    const t = trackRef.current; if (!t || !t.clientWidth) return;
    // CSS yapışmasını GEÇİCİ kapat. Neden: onTouchMove'da scrollLeft'i doğrudan
    // yazıyoruz; `scroll-snap-type: mandatory` her yazmayı "kaydırma bitti"
    // sayıp ANINDA en yakın noktaya yapışıyor ve bırakınca çalıştırdığımız
    // yumuşak geçişi eziyordu → hızlı kaydırmada görsel keskin/animasyonsuz
    // atlıyordu. Masaüstü trackpad'i için yapışma gerekli, o yüzden siliyoruz
    // değil, geçişten sonra geri açıyoruz.
    t.style.scrollSnapType = 'none';

    // Önceki oturma animasyonu hâlâ sürüyorsa onu kes ve konumu kesinleştir;
    // aksi hâlde yeni sürükleme yarım kalmış bir transform üstüne binerdi.
    const inner = innerRef.current;
    if (inner) {
      if (settling.current) {
        if (snapBack.current) clearTimeout(snapBack.current);
        inner.style.transition = '';
        inner.style.transform = '';
        settling.current = false;
      }
      // GPU katmanına al: sürükleme boyunca yeniden boyama olmasın.
      inner.style.willChange = 'transform';
    }

    drag.current = {
      x: e.touches[0].clientX,
      scroll: t.scrollLeft,
      from: Math.round(t.scrollLeft / t.clientWidth),
      active: true,
    };
  }

  // SÜRÜKLEME `scrollLeft` İLE DEĞİL `transform` İLE YAPILIYOR.
  // Önce scrollLeft yazılıyordu; kullanıcı her kaydırmada yolun ortasında
  // takılma bildirdi. İki aday ölçümle elendi: (a) görsel indirme/decode değil
  // — takılma ÖNBELLEKTEKİ görselde de her seferinde oluyor, (b) tarayıcının
  // yatay/dikey yön kararı değil — o hareketin BAŞINDA olurdu, bu ortasında.
  // Geriye kalan: scrollLeft yazmak ana iş parçacığında kaydırma + yeniden
  // boyama demek; komşu görsel görünür alana girdiğinde raster maliyeti
  // biniyordu. translate3d ise GPU'da bileşikleniyor, boyama yok.
  function onTouchMove(e: React.TouchEvent) {
    const inner = innerRef.current;
    const t = trackRef.current;
    if (!inner || !t || !drag.current.active) return;
    const dx = e.touches[0].clientX - drag.current.x;
    // Parmağı takip et ama EN FAZLA bir slayt.
    const max = t.clientWidth;
    const clamped = Math.max(-max, Math.min(max, dx));
    inner.style.transform = `translate3d(${clamped}px,0,0)`;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const t = trackRef.current;
    const inner = innerRef.current;
    if (!t || !inner || !drag.current.active) return;
    drag.current.active = false;

    const w = t.clientWidth;
    const dx = e.changedTouches[0].clientX - drag.current.x;
    // Karar saf fonksiyonda (lib/swipe.ts) — orada testi var: parmak ne kadar
    // sürüklenirse sürüklensin hedef en fazla 1 slayt uzaklaşır.
    const target = swipeTarget(drag.current.from, dx, w, visuals.length);
    const step = target - drag.current.from;   // -1 | 0 | 1

    // Kalan mesafeyi transform ile yumuşat, sonra GERÇEK konuma sessizce geç.
    settling.current = true;
    inner.style.transition = 'transform 260ms cubic-bezier(.22,.61,.36,1)';
    inner.style.transform = `translate3d(${-step * w}px,0,0)`;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      inner.removeEventListener('transitionend', finish);
      // Aynı karede: animasyonu kaldır + gerçek scroll konumuna otur.
      // Sıra önemli — transform sıfırlanmadan scrollLeft yazılırsa görüntü zıplar.
      inner.style.transition = '';
      inner.style.transform = '';
      t.scrollLeft = target * w;
      setIdx(target);
      t.style.scrollSnapType = 'x mandatory';  // masaüstü trackpad'i için geri aç
      settling.current = false;
    };
    inner.addEventListener('transitionend', finish);
    // Emniyet: transitionend gelmezse (sekme arkaya alınırsa vb.) yine otur.
    if (snapBack.current) clearTimeout(snapBack.current);
    snapBack.current = setTimeout(finish, 400);
  }

  const containerStyle: React.CSSProperties = variant === 'feed'
    ? { position: 'relative', width: '100%', aspectRatio: feedAspect, maxHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background, overflow: 'hidden' }
    : { position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background };
  const mediaStyle: React.CSSProperties = variant === 'feed'
    ? { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
    : { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        className="mc-track"
        style={{
          display: 'flex', width: '100%', height: '100%', overflowX: 'auto',
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
          // pan-y: yatay savurmayı tarayıcı BAŞLATMAZ (yukarıdaki nota bak),
          // dikey sayfa kaydırma normal çalışır.
          touchAction: 'pan-y',
        }}
      >
        {/* İÇ SARMALAYICI — sürüklerken transform BUNA uygulanır.
            Track'in kendisi kaydırma kapsayıcısı olduğu için ona transform
            veremeyiz; slaytları bir kat içine alıp onu taşıyoruz. Sürükleme
            bitince transform sıfırlanır ve gerçek scrollLeft'e oturulur, yani
            masaüstündeki native kaydırma + yapışma aynen çalışmaya devam eder. */}
        {/* Genişlik n×%100, slaytlar (100/n)% → her slayt tam olarak track
            genişliği kadar olur ve track'in kaydırılabilir alanı n×track olur.
            Slaytlara düz `flex: 0 0 100%` verilseydi bu %100 artık INNER'ı
            işaret ederdi; inner de %100 olduğundan kaydırılacak alan hiç
            oluşmaz ve kaydırma komple kırılırdı. */}
        {/* flexShrink: 0 ŞART — inner, track'in (display:flex) çocuğu olduğu
            için varsayılan flex-shrink:1 onu kapsayıcıya sığdırmak üzere geri
            büzüyor ve genişlik %700 yerine %100'e düşüyordu (ölçüldü: 2100
            yerine 300px, slaytlar 300 yerine 43px). */}
        <div ref={innerRef} style={{ display: 'flex', flex: '0 0 auto', width: `${visuals.length * 100}%`, height: '100%' }}>
        {visuals.map((m, i) => (
          // scrollSnapStop: 'always' → masaüstü trackpad kaydırmasında bir
          // savurmanın birkaç slayt atlamasını engeller. (Dokunmatikte artık
          // hareketi tamamen biz yönetiyoruz, orada bu özelliğe bel bağlamıyoruz
          // — telefonda yeterli olmadığı ölçüldü.)
          <div key={i} style={{ flex: `0 0 ${100 / visuals.length}%`, width: `${100 / visuals.length}%`, height: '100%', scrollSnapAlign: 'center', scrollSnapStop: 'always', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {m.type === 'video'
              ? <video src={m.url} controls playsInline title={caption} aria-label={caption} onLoadedMetadata={variant === 'feed' && i === 0 ? onFeedVideoMeta : undefined} style={mediaStyle} />
              // KOMŞU SLAYT ÖNCEDEN YÜKLENİR (|i - idx| <= 1).
              // Neden: yatay kaydırma kapsayıcısında tarayıcı `loading="lazy"`
              // görseli ancak belirgin şekilde görünür olunca yüklemeye
              // başlıyor → kaydırmanın ORTASINDA ağ+decode maliyeti biniyor ve
              // parmak altında takılma hissediliyordu.
              // `idx` değişince bu prop 'lazy' → undefined olur; bir görselin
              // loading niteliğini eager'a çevirmek tarayıcıda yüklemeyi
              // BAŞLATIR, yani sonraki slayt sen ona varmadan hazır olur.
              // Hepsini birden eager yapmıyoruz: 8 görselli gönderide akışta
              // gereksiz indirme olurdu (ilk slaytın priority mantığı korundu).
              : <Img src={m.url} alt={caption || ''} sizes={sizes} onLoad={variant === 'feed' && i === 0 ? onFeedImgLoad : undefined} loading={variant === 'feed' && !(priority && i === 0) && Math.abs(i - idx) > 1 ? 'lazy' : undefined} fetchPriority={priority && i === 0 ? 'high' : undefined} style={mediaStyle} />}
          </div>
        ))}
        </div>
      </div>

      {idx > 0 && <button type="button" className="mc-nav" aria-label="Önceki" onClick={() => go(idx - 1)} style={navBtn('left')}>‹</button>}
      {idx < visuals.length - 1 && <button type="button" className="mc-nav" aria-label="Sonraki" onClick={() => go(idx + 1)} style={navBtn('right')}>›</button>}

      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 9999, zIndex: 4 }}>
        {idx + 1}/{visuals.length}
      </div>
      <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, pointerEvents: 'none', zIndex: 4 }}>
        {visuals.map((_, i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'background 0.15s' }} />
        ))}
      </div>

      {audio && <MusicLayer url={audio} targetRef={containerRef} />}

      {/* Ok düğmeleri dokunmatikte GİZLİ: parmakla kaydırma zaten var (bkz.
          onTouchStart/Move/End), oklar ise medyanın üstünü kapatıyor.
          Ölçüt genişlik DEĞİL, giriş türü: `max-width` yazsaydık 700px'ten
          geniş tabletlerde oklar kalırdı — oysa orada da parmak var. Tersi de
          doğru: dar pencereli masaüstünde fare var ve çoğu farede yatay
          tekerlek yok, orada oklar TEK gezinme yolu, o yüzden kalıyorlar. */}
      <style>{`.mc-track::-webkit-scrollbar{display:none}
.mc-nav{display:flex}
@media (hover:none) and (pointer:coarse){.mc-nav{display:none}}`}</style>
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
