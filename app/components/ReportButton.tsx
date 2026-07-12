'use client';

import { useEffect, useRef, useState } from 'react';
import ReportModal from './ReportModal';
import type { ReportTargetType } from '@/lib/reports';

// Tek satırlık şikayet kontrolü — her gönderi kartına / yoruma düşürülebilir.
//   variant="menu"   → yuvarlak "..." kebap; açılır menüde "Şikayet et".
//   variant="inline" → küçük bayrak/"Şikayet" metin butonu (yorum satırları için).
// canReport=false ise HİÇBİR ŞEY render etmez (kendi içeriğin / çıkış yapılmış).
export default function ReportButton({
  targetType, targetId, subtitle, variant = 'menu', canReport = true, size = 34,
}: {
  targetType: ReportTargetType;
  targetId: number;
  subtitle?: string;
  variant?: 'menu' | 'inline';
  canReport?: boolean;
  size?: number;
}) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!canReport) return null;

  if (variant === 'inline') {
    return (
      <>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setModal(true); }}
          title="Şikayet et"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          Şikayet
        </button>
        {modal && <ReportModal targetType={targetType} targetId={targetId} subtitle={subtitle} onClose={() => setModal(false)} />}
      </>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label="Daha fazla"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ width: size, height: size, borderRadius: '9999px', border: 'none', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button>
      {open && (
        <div role="menu" style={{ position: 'absolute', right: 0, top: size + 4, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', minWidth: 150, zIndex: 40, overflow: 'hidden' }}>
          <button
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setOpen(false); setModal(true); }}
            style={{ width: '100%', textAlign: 'left', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-danger)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            Şikayet et
          </button>
        </div>
      )}
      {modal && <ReportModal targetType={targetType} targetId={targetId} subtitle={subtitle} onClose={() => setModal(false)} />}
    </div>
  );
}
