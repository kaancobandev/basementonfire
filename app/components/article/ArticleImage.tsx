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
  src, alt, caption, credit, ratio = '16 / 9', priority = false, narrow = false,
  sizes = narrow ? '(max-width: 700px) 100vw, 360px' : '(max-width: 768px) 100vw, 720px',
  className = '',
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
  /**
   * Yan yana/ızgara kapsayıcıda (…-img-pair, …-img-grid, …-gallery-grid) duran
   * görsel. Bunlar masaüstünde ~245-360px basılır, tek başına duran görselin
   * 720px'i DEĞİL — ölçüldü: galeri hücresi 1280 ekranda 301px, ikili 351px.
   * `sizes` bunu söylemezse tarayıcı 720px'e göre seçim yapar ve dpr 1'de 768w
   * varyantı iner: gereken pikselin ~5 katı. (Ters yön TEHLİKELİ: geniş bir
   * görsele narrow demek bulanıklık üretir, o yüzden şüphedeysen dokunma.)
   * Mobilde hepsi tek sütuna çöktüğü için orada iki değer de aynı adımı seçer.
   * Eşik 700px: makalelerdeki @media (max-width: 700px) çökme kuralıyla aynı.
   */
  narrow?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  // Dikey görseller geniş prose kolonunda ekranı aşıyordu: 718px genişlikte
  // 1600/2400'lük bir portre 1077px, tonomura karesi (0,34) 2082px sürüyordu —
  // iki buçuk ekran. Yüksekliği ekranın %78'iyle sınırlıyoruz.
  //
  // Sınır max-HEIGHT değil max-WIDTH olarak yazılır: aspect-ratio kutusunda
  // max-height kutuyu DARALTMAZ, içeriği kırpar (overflow-hidden + object-cover
  // ile fotoğrafın altı üstü kesilirdi). Genişliği sınırlarsak oran korunur,
  // kutu bütün hâlde küçülür ve ortalanır.
  //
  // `vh`, `dvh` değil: dvh mobilde adres çubuğu gizlenince değişir, o da
  // kaydırırken görselin boyunun oynamasına yol açardı.
  const oran = (() => {
    const [g, y] = ratio.split('/').map(s => parseFloat(s.trim()));
    return y > 0 && g > 0 ? g / y : 16 / 9;
  })();

  return (
    <figure className={`my-8 ${className}`} style={{ maxWidth: `calc(78vh * ${oran.toFixed(3)})`, marginInline: 'auto' }}>
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
