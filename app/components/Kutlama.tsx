'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { celebrate } from '@/lib/confetti';
import { KUTLAMA_OLAYI, type KutlamaVerisi } from '@/app/components/kutlamaOlay';

/* Modalı açmanın tek yolu `kutlamaAc` olayı (bkz. kutlamaOlay.ts). Sebep:
   kutlamayı tetikleyen yerler (akıştaki Günün Sorusu, 38 makale sayfasındaki
   quiz) modala prop zinciriyle bağlanamayacak kadar uzak. Tetikleyici dosya
   AYRI, çünkü bu dosya react-dom/portal ve konfeti kütüphanesini getiriyor. */

export default function Kutlama() {
  /* KUYRUK: aynı cevapta hem seviye atlanıp hem rozet kazanılabilir. Tek
     slot olsaydı ikincisi birincinin ÜSTÜNE yazılır ve seviye atlama hiç
     görünmezdi. Kullanıcı kapattıkça sıradaki açılır. */
  const [kuyruk, setKuyruk] = useState<KutlamaVerisi[]>([]);
  const v = kuyruk[0] ?? null;
  const kapatRef = useRef<HTMLButtonElement>(null);
  const oncekiOdak = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dinle = (e: Event) => setKuyruk((k) => [...k, (e as CustomEvent<KutlamaVerisi>).detail]);
    window.addEventListener(KUTLAMA_OLAYI, dinle);
    return () => window.removeEventListener(KUTLAMA_OLAYI, dinle);
  }, []);

  // ⚠ Bağımlılık `v` DEĞİL `v?.baslik`: kuyruk dizisi her render'da yeni
  // referans üretebilir; nesneye bağlarsak konfeti tekrar tekrar patlar.
  useEffect(() => {
    if (!v) return;
    // Açılışta nerede olduğumuzu sakla, kapanışta ORAYA geri ver.
    oncekiOdak.current = document.activeElement as HTMLElement | null;
    kapatRef.current?.focus();
    // Konfeti için yeni kod YOK: lib/confetti.ts dinamik import ediyor,
    // SSR'da çalışmıyor ve hareketi azaltanda kendiliğinden sessiz.
    celebrate({ intensity: 'big' });

    const tus = (e: KeyboardEvent) => { if (e.key === 'Escape') setKuyruk((k) => k.slice(1)); };
    document.addEventListener('keydown', tus);
    return () => {
      document.removeEventListener('keydown', tus);
      oncekiOdak.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v?.kicker, v?.baslik]);

  if (!v || typeof document === 'undefined') return null;

  /* ⚠ Portal ŞART: makale sayfalarında GSAP pinlenmiş, transform almış atalar
     var ve transform'lu bir ata `position: fixed`i kendi kutusuna hapseder —
     perde tüm ekranı kaplamaz, ortalanmaz. */
  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setKuyruk((k) => k.slice(1)); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bof-kutlama-baslik"
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        display: 'grid', placeItems: 'center', padding: 16,
      }}
    >
      {/* Hareketi azaltanda modal GİZLENMEZ — yalnız hareketi söner.
          Kutlamanın kendisi bilgi taşıyor, süs değil. */}
      <div
        className="bof-kutlama"
        style={{
          background: 'var(--color-surface)', color: 'var(--color-text)',
          borderRadius: 20, width: '100%', maxWidth: 340, padding: '26px 22px 20px',
          textAlign: 'center', boxShadow: 'var(--shadow-xl)',
          border: '2px solid var(--color-border)',
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
          {v.kicker}
        </div>
        <div className="bof-kutlama-emoji" style={{ fontSize: '3.4rem', lineHeight: 1.1, margin: '10px 0 6px' }} aria-hidden>
          {v.emoji}
        </div>
        <h2 id="bof-kutlama-baslik" style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800 }}>{v.baslik}</h2>
        <p style={{ margin: '0 0 18px', fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>{v.aciklama}</p>
        <button
          ref={kapatRef}
          type="button"
          onClick={() => setKuyruk((k) => k.slice(1))}
          style={{
            background: 'var(--color-primary)', color: 'var(--color-on-primary)',
            border: 'none', borderRadius: 12, padding: '11px 28px',
            fontWeight: 700, fontFamily: 'inherit', fontSize: '0.92rem', cursor: 'pointer',
            boxShadow: '0 4px 0 var(--bof-edge-primary)', marginBottom: 4,
          }}
        >
          Devam et
        </button>
      </div>
    </div>,
    document.body,
  );
}
