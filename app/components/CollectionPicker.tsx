'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export type CollectionRow = { id: number; name: string; count: number };

/**
 * "Kaydı koleksiyona ayır" sayfası — kaydedildikten hemen sonra (gönderi
 * yüzeylerinden) ya da Kaydedilenler sayfasından açılır. Tek bir kayıt EN FAZLA
 * BİR koleksiyona girer (bkz. sql/features-bookmark-collections.sql), o yüzden
 * liste tek seçimli.
 *
 * Uykuda-güvenli: koleksiyon tabloları henüz kurulmadıysa /api/collections
 * { available:false } döner ve burada tek satırlık bir not gösterilir — çağıran
 * yüzeylerin ayrıca bilmesi gerekmez.
 */
export default function CollectionPicker({ postId, open, currentCollectionId = null, onClose, onSaved }: {
  postId: number;
  open: boolean;
  currentCollectionId?: number | null;
  onClose: () => void;
  /** Seçim kaydedilince: yeni koleksiyon id'si ve adı (null = koleksiyonsuz). */
  onSaved?: (collectionId: number | null, name: string | null) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [selected, setSelected] = useState<number | null>(currentCollectionId);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setSelected(currentCollectionId); }, [currentCollectionId, open]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    fetch('/api/collections')
      .then(r => r.json())
      .then(d => { if (!alive) return; setAvailable(!!d.available); setRows(d.collections ?? []); })
      .catch(() => { if (alive) setAvailable(false); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [open]);

  // Escape ile kapan (lightbox/modal deseni).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function assign(collectionId: number | null, name: string | null) {
    if (busy) return;
    setBusy(true);
    const prev = selected;
    setSelected(collectionId);   // iyimser
    try {
      const res = await fetch(`/api/quick-facts/${postId}/bookmark`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json();
      if (!res.ok || d.available === false) { setSelected(prev); toast.error(d.error ?? 'Kaydedilemedi'); return; }
      onSaved?.(collectionId, name);
      toast.success(name ? `“${name}” koleksiyonuna eklendi` : 'Koleksiyondan çıkarıldı');
      onClose();
    } catch {
      setSelected(prev);
      toast.error('Bağlantı hatası');
    } finally {
      setBusy(false);
    }
  }

  async function createCollection() {
    const name = newName.replace(/\s+/g, ' ').trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json();
      if (!res.ok || d.available === false || !d.collection) { toast.error(d.error ?? 'Oluşturulamadı'); return; }
      setRows(prev => [...prev, d.collection]);
      setNewName('');
      // Yeni koleksiyon açmanın tek sebebi bu gönderiyi oraya koymak → doğrudan ata.
      setBusy(false);
      await assign(d.collection.id, d.collection.name);
      return;
    } catch {
      toast.error('Bağlantı hatası');
    } finally {
      setBusy(false);
    }
  }

  async function removeCollection(c: CollectionRow) {
    if (busy) return;
    if (!confirm(`“${c.name}” koleksiyonu silinsin mi?\nİçindeki ${c.count} kayıt SİLİNMEZ, “Tümü”ne döner.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/collections/${c.id}`, { method: 'DELETE' });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d.available === false) { toast.error(d.error ?? 'Silinemedi'); return; }
      setRows(prev => prev.filter(x => x.id !== c.id));
      if (selected === c.id) setSelected(null);
      toast.success('Koleksiyon silindi');
    } finally {
      setBusy(false);
    }
  }

  const rowBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
    padding: '11px 12px', borderRadius: 12, border: '1px solid var(--color-border)',
    background: 'transparent', color: 'var(--color-text)', fontFamily: 'inherit',
    fontSize: '0.9rem', fontWeight: 600, cursor: busy ? 'wait' : 'pointer',
  };
  const activeRow: React.CSSProperties = { borderColor: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      role="dialog" aria-modal="true" aria-label="Koleksiyon seç"
    >
      <div style={{ background: 'var(--color-surface)', borderRadius: 18, width: '100%', maxWidth: 380, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <strong style={{ fontSize: '0.98rem' }}>Koleksiyona ekle</strong>
          <button type="button" onClick={onClose} aria-label="Kapat"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          {loading && <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.86rem' }}>Yükleniyor…</p>}

          {!loading && !available && (
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.86rem', lineHeight: 1.5 }}>
              Koleksiyonlar bu sitede henüz açık değil. Gönderi kaydedildi, “Kaydedilenler” sayfasında duruyor.
            </p>
          )}

          {!loading && available && (
            <>
              {/* Koleksiyonsuz = "Tümü"de kalsın */}
              <button type="button" onClick={() => assign(null, null)} disabled={busy}
                style={{ ...rowBase, ...(selected === null ? activeRow : {}) }}>
                <span style={{ flex: 1 }}>Koleksiyonsuz</span>
                {selected === null && <Check />}
              </button>

              {rows.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button type="button" onClick={() => assign(c.id, c.name)} disabled={busy}
                    style={{ ...rowBase, ...(selected === c.id ? activeRow : {}) }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    <span className="tnum" style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.78rem' }}>{c.count}</span>
                    {selected === c.id && <Check />}
                  </button>
                  <button type="button" onClick={() => removeCollection(c)} disabled={busy} aria-label={`${c.name} koleksiyonunu sil`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 6, flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                  </button>
                </div>
              ))}

              {/* Yeni koleksiyon — açar açmaz bu gönderiyi içine koyar */}
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <input
                  ref={inputRef}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createCollection(); } }}
                  placeholder="Yeni koleksiyon adı"
                  maxLength={40}
                  style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none' }}
                />
                <button type="button" onClick={createCollection} disabled={busy || !newName.trim()}
                  style={{ border: 'none', borderRadius: 12, padding: '10px 14px', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit', cursor: (busy || !newName.trim()) ? 'not-allowed' : 'pointer', opacity: (busy || !newName.trim()) ? 0.5 : 1, flexShrink: 0 }}>
                  Oluştur
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
