'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { renderCaption } from '@/lib/caption';

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** true ise metin `lines` satırı geçince gizlenir + "devamını gör" çıkar */
  clamp?: boolean;
  /** gizleme eşiği (varsayılan 4 satır) */
  lines?: number;
  /** metinden önce satır içi içerik (ör. kullanıcı adı linki) — kırpma kutusunun içinde kalır */
  prefix?: React.ReactNode;
}

// SSR'da useLayoutEffect uyarısını önlemek için izomorfik sürüm
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * #hashtag → /hashtag/tag linki (altın renk)
 * @mention → /u/username linki (mavi renk)
 *
 * Kullanıcı HTML'i önce escape edilir, sadece kendi <a> taglarımız eklenir.
 */
export default function Caption({ text, className, style, clamp = false, lines = 4, prefix }: Props) {
  if (clamp) {
    return <ClampedCaption text={text} className={className} style={style} lines={lines} prefix={prefix} />;
  }
  // Klasik (kırpmasız) davranış
  return (
    <span className={className} style={style}>
      {prefix}{prefix ? ' ' : null}
      <span dangerouslySetInnerHTML={{ __html: renderCaption(text) }} />
    </span>
  );
}

function ClampedCaption({ text, className, style, lines, prefix }: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  lines: number;
  prefix?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return; // sadece kapalıyken ölç
    setOverflowing(el.scrollHeight - el.clientHeight > 1);
  }, [text, expanded, lines]);

  useEffect(() => {
    function onResize() {
      const el = ref.current;
      if (!el || expanded) return;
      setOverflowing(el.scrollHeight - el.clientHeight > 1);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [expanded]);

  return (
    <span className={className} style={style}>
      <span
        ref={ref}
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: expanded ? 'unset' : lines,
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {prefix}{prefix ? ' ' : null}
        <span dangerouslySetInnerHTML={{ __html: renderCaption(text) }} />
      </span>
      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'block',
            marginTop: 3,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.85em',
            fontFamily: 'inherit',
          }}
        >
          {expanded ? 'daha az göster' : '… devamını gör'}
        </button>
      )}
    </span>
  );
}
