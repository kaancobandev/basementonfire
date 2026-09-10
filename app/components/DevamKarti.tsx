'use client';

import Link from 'next/link';
import { ARTICLE_MAP } from '@/lib/articles';

export type DevamEdilen = { slug: string; percent: number };

/**
 * "Yarım kalan makaleye devam et" kartı — akışın içinde.
 *
 * ⚠ "~N dk kaldı" YAZILMIYOR. Mock'ta vardı ama sitede makalelerin kelime
 * sayısı/okuma süresi HİÇBİR YERDE tutulmuyor (ArticleMeta'da slug, title,
 * emoji, desc, category, topics var — hepsi bu) ve makale gövdeleri React
 * bileşeni olduğu için çalışma anında da sayılamıyor. Uydurma bir dakika
 * yazmaktansa yalnız ölçülen yüzde gösteriliyor.
 */
export default function DevamKarti({ ilerleme }: { ilerleme: DevamEdilen }) {
  const makale = ARTICLE_MAP[ilerleme.slug];
  // Slug kayıttan düşmüşse (makale kaldırıldıysa) kart hiç çizilmez.
  if (!makale) return null;

  const yuzde = Math.max(1, Math.min(99, Math.round(ilerleme.percent)));
  // Halkanın çevresi: r = 19 → 2πr ≈ 119,38
  const CEVRE = 119.38;

  return (
    <div style={{ maxWidth: 470, margin: '16px auto 0', padding: '0 8px' }}>
      <article style={{ position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '13px 15px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden style={{ position: 'absolute', inset: 0, rotate: '-90deg' }}>
              <circle cx="22" cy="22" r="19" fill="none" stroke="var(--color-border)" strokeWidth="5" />
              <circle
                cx="22" cy="22" r="19" fill="none" stroke="var(--color-primary)" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CEVRE}
                strokeDashoffset={CEVRE * (1 - yuzde / 100)}
                style={{ transition: 'stroke-dashoffset var(--bof-t-fill) var(--bof-ease-out)' }}
              />
            </svg>
            <b className="tnum" style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--color-text)' }}>{yuzde}</b>
          </span>

          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              {makale.category} · Yarım kaldı
            </span>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {makale.title}
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              %{yuzde} okundu
            </span>
          </span>

          <Link
            href={`/articles/${makale.slug}`}
            style={{
              flexShrink: 0, display: 'inline-flex', alignItems: 'center',
              padding: '9px 16px', borderRadius: 9999, textDecoration: 'none',
              background: 'var(--color-primary)', color: 'var(--color-on-primary)',
              fontWeight: 700, fontSize: '0.82rem',
              boxShadow: '0 4px 0 var(--bof-edge-primary)', marginBottom: 4,
              transition: 'transform var(--bof-t-press) ease-out, box-shadow var(--bof-t-press) ease-out',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--bof-edge-primary)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            Devam et
          </Link>
        </div>
      </article>
    </div>
  );
}
