'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

type Item = { id: number; slug: string; title: string; summary: string; created_at: string; author: string; username: string };

export default function AdminClient({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<number | null>(null);
  // Tarih yereli/saat dilimi server ile client'ta farkli olabilir -> hydration
  // uyusmazligi (React #418). Server'da ISO'nun gun kismini bas, mount sonrasi
  // yerellestir; ilk client render server ile AYNI olsun.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const fmt = (iso: string) => (mounted ? new Date(iso).toLocaleString('tr-TR') : iso.slice(0, 10));

  async function moderate(id: number, action: 'approve' | 'reject') {
    let reason = '';
    if (action === 'reject') {
      reason = window.prompt('Reddetme nedeni (kullanıcıya gösterilir, isteğe bağlı):') ?? '';
    }
    setBusy(id);
    try {
      const res = await fetch(`/api/user-articles/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast(d.error ?? 'İşlem başarısız'); return; }
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast(action === 'approve' ? 'Onaylandı ve yayına girdi ✅' : 'Reddedildi');
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>Makale Yönetimi · İnceleme Kuyruğu</span>
        <span style={{ display: 'flex', gap: 14 }}>
          <Link href="/yonetim/sikayetler" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>Şikayetler →</Link>
          <Link href="/yonetim/istatistik" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>İstatistik →</Link>
        </span>
      </div>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '18px 16px 64px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 48 }}>
            <p style={{ fontWeight: 700, margin: '0 0 6px' }}>İncelenecek makale yok 🎉</p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Yeni gönderiler burada görünecek.</p>
          </div>
        )}
        {items.map((a) => (
          <div key={a.id} style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, background: 'var(--color-surface)' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>{a.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 8px' }}>
              <Link href={`/u/${a.username}`} style={{ color: 'var(--color-primary)' }}>{a.author}</Link>
              {' · '}{fmt(a.created_at)}
            </div>
            {a.summary && <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', margin: '0 0 12px' }}>{a.summary}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Kuyruktakiler 'pending' — ana rota (ISR, yalnız onaylılar) 404
                  verir; admin önizlemesi dinamik önizleme rotasından. */}
              <Link href={`/makale/onizleme/${a.id}`} target="_blank" style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--color-border)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>👁 Önizle</Link>
              <button type="button" disabled={busy === a.id} onClick={() => moderate(a.id, 'approve')} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>✓ Onayla</button>
              <button type="button" disabled={busy === a.id} onClick={() => moderate(a.id, 'reject')} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>✕ Reddet</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
