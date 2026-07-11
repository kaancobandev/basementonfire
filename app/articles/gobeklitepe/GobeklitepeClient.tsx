'use client';

// FAZ 1 — Göbeklitepe: Derin Zaman Ekseni (bağımsız prototip).
// Tek fikir: "12.000 yıl" sayısı okununca hissedilmez; kaydırarak kat edilince
// hissedilir. Tam makale (T-pilarlar, çevreler, "tapınak mı" tartışması) Faz 2.
// Palet: siyah-lacivert-elektrik mavisi. Fotoğraf yok; siluetler saf SVG.

import Link from 'next/link';
import ArticleBibliography from '@/app/components/ArticleBibliography';
import DeepTimeAxis from './axis';
import { ACCENT, NAVY } from './ui';
import { refs } from './refs';

export default function GobeklitepeClient() {
  return (
    <main className="main-content" style={{ background: NAVY, color: '#e6f2ff' }}>
      {/* üst çubuk */}
      <div className="gt-topbar">
        <Link href="/" aria-label="Ana sayfa" className="gt-back" style={{ color: ACCENT }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="gt-topbar-title">Göbeklitepe · Derin Zaman</span>
      </div>

      {/* hero */}
      <header className="gt-hero">
        <div className="gt-hero-eyebrow" style={{ color: ACCENT }}>DERİN ZAMAN EKSENİ</div>
        <h1 className="gt-hero-title">Göbeklitepe</h1>
        <p className="gt-hero-sub">
          “12.000 yıl önce” bir sayıdır; hiçbir şey hissettirmez. O yüzden okumayacaksın — <strong style={{ color: '#fff' }}>kaydıracaksın</strong>.
          Aşağı indikçe geriye, geçmişe gidiyorsun. Acele etme; asıl mesele yol.
        </p>
        <div className="gt-cue" aria-hidden>
          <span className="gt-cue-dot" />
          <span className="gt-cue-txt">KAYDIRARAK BAŞLA</span>
        </div>
      </header>

      {/* derin zaman ekseni */}
      <DeepTimeAxis />

      {/* kapanış notu */}
      <div className="gt-outro">
        <p className="gt-outro-note">
          Bu, tek bir fikri sınayan bir prototip: mesafe duygusu. Göbeklitepe’nin ne olduğu, kimlerin kazdığı ve o taşların
          ne anlattığı ise daha uzun bir hikâye — yakında.
        </p>
      </div>

      <ArticleBibliography items={refs} accent={ACCENT} />

      <style>{`
        .gt-topbar { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 12px;
          padding: 10px 18px; background: color-mix(in srgb, ${NAVY} 78%, transparent); backdrop-filter: blur(8px);
          border-bottom: 1px solid color-mix(in srgb, ${ACCENT} 14%, transparent); }
        .gt-back { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px;
          border: 1px solid color-mix(in srgb, ${ACCENT} 22%, transparent); background: color-mix(in srgb, ${ACCENT} 8%, transparent); }
        .gt-topbar-title { font-size: .78rem; font-weight: 600; letter-spacing: .04em; color: #a9c7e2; }

        .gt-hero { min-height: 88svh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 0 clamp(20px, 7vw, 48px); position: relative;
          background: radial-gradient(70% 50% at 50% 30%, color-mix(in srgb, ${ACCENT} 12%, transparent), transparent 72%); }
        .gt-hero-eyebrow { font-family: ui-monospace, monospace; font-size: .74rem; letter-spacing: .34em; margin-bottom: 20px; }
        .gt-hero-title { font-size: clamp(3rem, 15vw, 6.5rem); font-weight: 900; line-height: .95; letter-spacing: -.02em; color: #fff;
          margin: 0 0 22px; text-shadow: 0 0 44px color-mix(in srgb, ${ACCENT} 45%, transparent); }
        .gt-hero-sub { max-width: 540px; font-size: clamp(1rem, 3.4vw, 1.18rem); line-height: 1.6; color: #c1d8ee; margin: 0; }
        .gt-cue { position: absolute; bottom: 6svh; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .gt-cue-dot { width: 22px; height: 34px; border-radius: 12px; border: 2px solid color-mix(in srgb, ${ACCENT} 45%, transparent); position: relative; }
        .gt-cue-dot::after { content: ''; position: absolute; left: 50%; top: 7px; width: 3px; height: 7px; border-radius: 2px; background: ${ACCENT}; transform: translateX(-50%); animation: gt-cue 1.5s ease-in-out infinite; }
        .gt-cue-txt { font-size: .58rem; letter-spacing: .28em; color: color-mix(in srgb, ${ACCENT} 70%, white); }
        @keyframes gt-cue { 0%,100% { transform: translate(-50%, 0); opacity: 1; } 50% { transform: translate(-50%, 12px); opacity: .3; } }

        .gt-outro { max-width: 640px; margin: 0 auto; padding: 8svh clamp(20px, 6vw, 40px) 4svh; text-align: center; background: ${NAVY}; }
        .gt-outro-note { font-size: .98rem; line-height: 1.65; color: #9db9d4; margin: 0; }

        @media (prefers-reduced-motion: reduce) { .gt-cue-dot::after { animation: none; } }
      `}</style>
    </main>
  );
}
