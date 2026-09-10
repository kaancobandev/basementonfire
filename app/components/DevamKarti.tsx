'use client';

import Link from 'next/link';
import { ARTICLE_MAP } from '@/lib/articles';

export type DevamEdilen = { slug: string; percent: number };

/**
 * "Yarım kalan makaleye devam et" kartı — akışın içinde.
 *
 * ⚠ KENDİ SARMALAYICISI YOK. Kart akış listesinin İÇİNDE render ediliyor ve o
 * liste zaten `maxWidth: 470` + `gap: 24`. İlk sürümde buraya bir kez daha
 * `maxWidth` ve `padding: 0 8px` konmuştu; sonuç kartın komşularından 16px DAR
 * kalmasıydı ve tek satırlık yüksekliğiyle birlikte "kısa/garip" görünüyordu
 * (kullanıcı bildirdi, ölçüldü). Artık doğrudan kardeş.
 *
 * ⚠ "~N dk kaldı" YAZILMIYOR. Sitede makalelerin kelime sayısı/okuma süresi
 * HİÇBİR YERDE tutulmuyor (ArticleMeta: slug, title, emoji, desc, category,
 * topics) ve gövdeler React bileşeni olduğu için çalışma anında da sayılamıyor.
 * Uydurma bir dakika yerine yalnız ölçülen yüzde gösteriliyor.
 */
export default function DevamKarti({ ilerleme }: { ilerleme: DevamEdilen }) {
  const makale = ARTICLE_MAP[ilerleme.slug];
  // Slug kayıttan düşmüşse (makale kaldırıldıysa) kart hiç çizilmez.
  if (!makale) return null;

  const yuzde = Math.max(1, Math.min(99, Math.round(ilerleme.percent)));
  // Halkanın çevresi: r = 22 → 2πr ≈ 138,23
  const CEVRE = 138.23;

  return (
    <article style={{ position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '16px 18px' }}>
      {/* Köşe süsü makalenin KENDİ emojisi (ArticleMeta.emoji) — uydurma değil. */}
      <span
        aria-hidden
        style={{
          position: 'absolute', right: -8, top: -8, width: 38, height: 38, borderRadius: 12,
          display: 'grid', placeItems: 'center', fontSize: 18,
          background: 'var(--color-surface)', border: '2px solid var(--color-border)',
          boxShadow: '0 3px 0 var(--bof-edge-neutral)', rotate: '-6deg',
        }}
      >
        {makale.emoji}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ position: 'relative', width: 52, height: 52, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden style={{ position: 'absolute', inset: 0, rotate: '-90deg' }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="var(--color-border)" strokeWidth="5" />
            <circle
              cx="26" cy="26" r="22" fill="none" stroke="var(--color-primary)" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CEVRE}
              strokeDashoffset={CEVRE * (1 - yuzde / 100)}
              style={{ transition: 'stroke-dashoffset var(--bof-t-fill) var(--bof-ease-out)' }}
            />
          </svg>
          <b className="tnum" style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-text)' }}>{yuzde}</b>
        </span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            {makale.category} · Yarım kaldı
          </span>
          {/* Başlık iki satıra kadar SARABİLİR — sert kırpma yerine. Kart tek
              satırlık bir şerit gibi durmasın diye de yükseklik buradan geliyor. */}
          <span style={{
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            fontWeight: 700, fontSize: '1rem', lineHeight: 1.35, color: 'var(--color-text)', margin: '2px 0 3px',
          }}>
            {makale.title}
          </span>
          <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            %{yuzde} okundu
          </span>
        </span>

        <Link
          href={`/articles/${makale.slug}`}
          className="bof-devam-btn"
          style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center',
            padding: '10px 18px', borderRadius: 9999, textDecoration: 'none',
            background: 'var(--color-primary)', color: 'var(--color-on-primary)',
            fontWeight: 700, fontSize: '0.85rem',
          }}
        >
          Devam et
        </Link>
      </div>
    </article>
  );
}
