'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { REASON_LABEL, TARGET_LABEL, type ReportTargetType } from '@/lib/reports';

export type ResolvedTarget = {
  kind: ReportTargetType;
  preview: string;
  href: string | null;
  author?: string | null;
  authorName?: string | null;
  missing?: boolean;
};

export type QueueItem = {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  note: string | null;
  created_at: string;
  reporter: { username: string; display_name: string } | null;
  target: ResolvedTarget;
};

const BADGE_BG: Record<ReportTargetType, string> = {
  post: '#6366f1', comment: '#0ea5e9', user: '#f59e0b', article: '#10b981', article_comment: '#8b5cf6',
};

// Admin olarak doğrudan silinebilen içerik türleri (kullanıcı/makale hariç).
const DELETABLE = new Set<ReportTargetType>(['post', 'comment', 'article_comment']);

export default function ReportsClient({ items: initial }: { items: QueueItem[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const fmt = (iso: string) => (mounted ? new Date(iso).toLocaleString('tr-TR') : iso.slice(0, 10));

  async function moderate(id: number, action: 'reviewed' | 'dismissed') {
    setBusy(id);
    try {
      const res = await fetch(`/api/reports/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast(d.error ?? 'İşlem başarısız'); return; }
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast(action === 'reviewed' ? 'İncelendi olarak işaretlendi' : 'Şikayet yoksayıldı');
    } finally {
      setBusy(null);
    }
  }

  async function removeContent(id: number) {
    if (!confirm('Bu içerik kalıcı olarak silinsin mi? İşlem geri alınamaz.')) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/reports/${id}/remove-content`, { method: 'POST' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast(d.error ?? 'İçerik silinemedi'); return; }
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast('İçerik silindi ve şikayet kapatıldı');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '18px 16px 64px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 48 }}>
          <p style={{ fontWeight: 700, margin: '0 0 6px' }}>Açık şikayet yok 🎉</p>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>Yeni şikayetler burada görünecek.</p>
        </div>
      )}

      {items.map((r) => (
        <div key={r.id} style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ background: BADGE_BG[r.targetType] ?? '#64748b', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: 999 }}>
              {TARGET_LABEL[r.targetType] ?? r.targetType}
            </span>
            <span style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: 999 }}>
              {REASON_LABEL[r.reason] ?? r.reason}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{fmt(r.created_at)}</span>
          </div>

          {/* Şikayet edilen içerik */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px', background: 'var(--color-bg)', marginBottom: 10 }}>
            {r.target.missing ? (
              <span style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>İçerik silinmiş veya bulunamadı (#{r.targetId}).</span>
            ) : (
              <>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', margin: 0, overflowWrap: 'anywhere' }}>{r.target.preview || '—'}</p>
                {r.target.author && r.targetType !== 'user' && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    içerik sahibi: <Link href={`/u/${r.target.author}`} style={{ color: 'var(--color-primary)' }}>@{r.target.author}</Link>
                  </p>
                )}
              </>
            )}
          </div>

          {r.note && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', margin: '0 0 10px', paddingLeft: 10, borderLeft: '3px solid var(--color-border)' }}>
              “{r.note}”
            </p>
          )}

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
            Şikayet eden:{' '}
            {r.reporter
              ? <Link href={`/u/${r.reporter.username}`} style={{ color: 'var(--color-primary)' }}>{r.reporter.display_name}</Link>
              : <span>bilinmiyor</span>}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {r.target.href && (
              <Link href={r.target.href} target="_blank" style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--color-border)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>👁 İçeriği gör</Link>
            )}
            {DELETABLE.has(r.targetType) && !r.target.missing && (
              <button type="button" disabled={busy === r.id} onClick={() => removeContent(r.id)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>🗑 İçeriği sil</button>
            )}
            <button type="button" disabled={busy === r.id} onClick={() => moderate(r.id, 'reviewed')} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>✓ İncelendi</button>
            <button type="button" disabled={busy === r.id} onClick={() => moderate(r.id, 'dismissed')} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>✕ Yoksay</button>
          </div>
        </div>
      ))}
    </div>
  );
}
