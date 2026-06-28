'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { buildEmbedSrcDoc, clampHeight, LIMITS } from '@/lib/userArticles';

/**
 * Kullanici makalesindeki INTERAKTIF blogu calistirir.
 * GUVENLIK: `sandbox="allow-scripts"` (allow-same-origin YOK) -> iframe opak
 * kokende calisir, ana sayfanin DOM'una / cerezlerine / Supabase oturumuna
 * erisemez. Icerik buildEmbedSrcDoc ile uretilir (siki CSP + curated CDN).
 * Yukseklik, iframe icindeki (bizim enjekte ettigimiz) script'in postMessage
 * ile bildirdigi degerden ayarlanir; ana taraf yalnizca dogru contentWindow'dan
 * gelen bir SAYIYI kabul eder ve sinirlar.
 */
export default function ArticleEmbed({
  block,
}: {
  block: { html?: string; css?: string; js?: string; libs?: string[]; height?: number; caption?: string };
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState<number>(clampHeight(block.height));
  const srcDoc = useMemo(
    () => buildEmbedSrcDoc(block),
    [block.html, block.css, block.js, (block.libs ?? []).join(',')],
  );

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (!ref.current || e.source !== ref.current.contentWindow) return;
      const d = e.data as { __baEmbed?: number; h?: number } | null;
      if (d && d.__baEmbed === 1 && typeof d.h === 'number' && d.h > 0) {
        setH(Math.min(LIMITS.embedHeightMax, Math.max(LIMITS.embedHeightMin, Math.ceil(d.h) + 2)));
      }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <figure style={{ margin: '22px 0' }}>
      <iframe
        ref={ref}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        loading="lazy"
        referrerPolicy="no-referrer"
        title={block.caption || 'İnteraktif içerik'}
        style={{ width: '100%', height: h, border: '1px solid var(--color-border)', borderRadius: 14, background: '#06070f', display: 'block' }}
      />
      {block.caption ? (
        <figcaption style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 7 }}>
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
