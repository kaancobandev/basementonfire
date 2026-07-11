'use client';

// Göbeklitepe makalesinin fotoğraf figürleri.
//
// Görseller public/articles/gobeklitepe/ içinde string yolla durur → production'da
// Netlify Image CDN'den otomatik WebP + responsive srcSet alır (lib/img). Dosya
// henüz eklenmemişse figür KIRILMAZ: onError ile altyazılı bir yer-tutucu kutuya
// düşer. Böylece kullanıcı görselleri sırayla ekleyebilir, makale hep sağlam kalır.

import { useState } from 'react';
import Img from '@/app/components/Img';
import { ACCENT } from './ui';

export type Ratio = '16/9' | '4/3' | '3/4' | '1/1';

export function ArticleImage({
  src, alt, caption, ratio = '16/9', priority = false, sizes = '(max-width: 768px) 100vw, 760px',
}: {
  src: string; alt: string; caption?: string; ratio?: Ratio; priority?: boolean; sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="relative z-10 mx-auto my-8 max-w-3xl px-6">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30"
        style={{ aspectRatio: ratio }}
      >
        {!failed ? (
          <Img
            src={src}
            alt={alt}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          // Yer-tutucu: görsel eklenene kadar. Kasıtlı olarak sade + bilgi verici.
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: `color-mix(in srgb, ${ACCENT} 60%, transparent)` }}>
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
            </svg>
            <span className="font-mono text-[0.7rem] text-slate-500">
              görsel: <span style={{ color: `color-mix(in srgb, ${ACCENT} 80%, white)` }}>{src.split('/').pop()}</span>
            </span>
            {caption && <span className="max-w-xs text-xs leading-relaxed text-slate-500">{caption}</span>}
          </div>
        )}
      </div>
      {caption && !failed && (
        <figcaption className="mt-2 px-1 text-xs leading-relaxed text-slate-500">{caption}</figcaption>
      )}
    </figure>
  );
}
