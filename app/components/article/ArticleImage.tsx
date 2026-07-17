'use client';

// Immersive (/articles/*) makaleler için görsel bloğu.
// - `Img` ile Netlify Image CDN (otomatik WebP + responsive srcSet).
// - CLS yok: sabit `aspectRatio` kutusu → yer önceden ayrılır (oranı görselle
//   EŞLEŞTİR; object-cover eşleşen oranda kırpmaz).
// - Yüklenemezse zarif yer-tutucu (canlı sayfa boş kutu göstermez).
// - Bir ArticleSection'ın İÇİNE, düzyazı ile aralanarak konur (widget'lar gibi);
//   dış genişlik/padding'i bölüm sağlar.
//
// TEMA: renkler CSS değişkenlerinden okunur, varsayılanları slate (fatih'in
// hâli — dokunma). Kendi paleti olan makale (rome altın/sıcak, fizik-101 açık…)
// bir üst sarmalayıcıda ezer; soğuk slate sıcak zeminde yamalı durur:
//   <div style={{ '--ai-caption': 'var(--ro-muted)', '--ai-border': 'var(--ro-border)' }}>
//
// Kullanım:
//   <ArticleImage src="/articles/fatih/truva-mezar.webp" ratio="16 / 9"
//     alt="Truva harabelerinde bir mezar taşı, alacakaranlık"
//     caption="1462: sultan Akhilleus'un mezarı olduğuna inanılan yerde durur."
//     credit="Temsilî görsel · yapay zekâ" priority />

import { useState } from 'react';
import Img from '@/app/components/Img';

export default function ArticleImage({
  src, alt, caption, credit, ratio = '16 / 9',
  priority = false, sizes = '(max-width: 768px) 100vw, 720px', className = '',
}: {
  src: string;
  alt: string;
  caption?: React.ReactNode;
  /** Kaynak/telif satırı. Yapay zekâ görselleri için "Temsilî görsel · yapay zekâ" önerilir. */
  credit?: React.ReactNode;
  /** CSS aspect-ratio; görselin gerçek oranıyla eşleştir (ör. "16 / 9", "4 / 5", "1 / 1"). */
  ratio?: string;
  /** Ekranın üstündeki (ilk görünen) görsel için true → eager yükle. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={`my-8 ${className}`}>
      <div
        className="relative overflow-hidden rounded-2xl border bg-[var(--ai-fill,rgb(255_255_255/0.03))]"
        style={{ aspectRatio: ratio, borderColor: 'var(--ai-border, rgb(255 255 255 / 0.12))' }}
      >
        {failed ? (
          <div className="grid h-full w-full place-items-center p-4 text-center text-xs leading-relaxed text-[var(--ai-credit,#64748b)]">
            görsel yüklenemedi
            <br />
            <span className="font-mono">{src.split('/').pop()}</span>
          </div>
        ) : (
          <Img
            src={src}
            alt={alt}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
        <span aria-hidden className="pointer-events-none absolute bottom-1.5 right-2.5 select-none font-mono text-[0.55rem] tracking-wider text-[var(--ai-mark,rgb(255_255_255/0.25))]">
          basementonfire.com
        </span>
      </div>
      {(caption || credit) && (
        <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs leading-relaxed text-[var(--ai-caption,#94a3b8)]">
          {caption ? <span>{caption}</span> : <span />}
          {credit && <span className="shrink-0 italic text-[var(--ai-credit,#475569)]">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
