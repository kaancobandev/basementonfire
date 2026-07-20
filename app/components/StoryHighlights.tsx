'use client';

// HİKAYE ÖNE ÇIKANLARI — profilde kalıcı vitrin. Süresi dolan hikayeler
// silinmediği için (sql/schema.sql stories) 24 saat sonra bile eski karelere
// referans verilebilir. Bu bileşen üç şeyi bir arada yapar: şerit (daireler),
// tam ekran görüntüleyici, ve (sahibiyse) arşivden yeni öne çıkan oluşturma.
//
// Tablolar sql/features-story-highlights-reply.sql çalıştırılana kadar YOKtur →
// sunucu boş liste döndürür, şerit hiç görünmez (özellik uykuda, kırılmaz).

import { useEffect, useRef, useState } from 'react';
import Img from './Img';

type Highlight = { id: number; title: string; cover_url: string | null; count: number };
type ArchiveStory = { id: number; media_url: string; media_type: string; created_at: string; active: boolean };
type ViewerStory = { id: number; mediaUrl: string; mediaType: string };

export default function StoryHighlights({ profileUserId, isOwner, initial }: {
  profileUserId: number; isOwner: boolean; initial: Highlight[];
}) {
  const [items, setItems] = useState<Highlight[]>(initial);
  const [editing, setEditing] = useState(false);

  // ── Görüntüleyici ──────────────────────────────────────────────────────────
  const [viewer, setViewer] = useState<{ title: string; stories: ViewerStory[] } | null>(null);
  const [vIdx, setVIdx] = useState(0);
  const vTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function openHighlight(id: number) {
    try {
      const r = await fetch(`/api/stories/highlights/${id}`);
      const d = await r.json();
      if (!r.ok || !d.stories?.length) return;
      setVIdx(0);
      setViewer({ title: d.title, stories: d.stories });
    } catch { /* sessiz */ }
  }
  function closeViewer() { if (vTimer.current) clearTimeout(vTimer.current); setViewer(null); }
  function advance(dir: 1 | -1) {
    setVIdx((i) => {
      const n = i + dir;
      if (n < 0) return 0;
      if (!viewer || n >= viewer.stories.length) { closeViewer(); return i; }
      return n;
    });
  }
  useEffect(() => {
    if (!viewer) return;
    const s = viewer.stories[vIdx];
    if (!s || s.mediaType === 'video') return; // video kendi 'ended'iyle ilerler
    if (vTimer.current) clearTimeout(vTimer.current);
    vTimer.current = setTimeout(() => advance(1), 5000);
    return () => { if (vTimer.current) clearTimeout(vTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, vIdx]);
  useEffect(() => {
    if (!viewer) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') advance(1);
      if (e.key === 'ArrowLeft') advance(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer]);

  async function refresh() {
    try {
      const r = await fetch(`/api/stories/highlights?userId=${profileUserId}`);
      const d = await r.json();
      setItems(d.highlights ?? []);
    } catch { /* sessiz */ }
  }
  async function remove(id: number) {
    if (!confirm('Bu öne çıkanı silmek istiyor musun?')) return;
    const r = await fetch(`/api/stories/highlights/${id}`, { method: 'DELETE' });
    if (r.ok) setItems((prev) => prev.filter((h) => h.id !== id));
  }

  // ── Oluşturma modalı ────────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);

  if (!items.length && !isOwner) return null; // gizli/uykuda: hiç yer kaplama

  const v = viewer?.stories[vIdx];

  return (
    <div style={{ padding: '4px 0 10px' }}>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '4px 2px', scrollbarWidth: 'none' }}>
        {isOwner && (
          <button type="button" onClick={() => setCreating(true)} style={circleBtn} aria-label="Yeni öne çıkan">
            <span style={{ ...circle, border: '2px dashed var(--color-border)', display: 'grid', placeItems: 'center', fontSize: '1.6rem', color: 'var(--color-text-muted)' }}>+</span>
            <span style={label}>Yeni</span>
          </button>
        )}
        {items.map((h) => (
          <div key={h.id} style={{ position: 'relative' }}>
            <button type="button" onClick={() => openHighlight(h.id)} style={circleBtn} aria-label={`${h.title} öne çıkanını gör`}>
              <span style={{ ...circle, border: '2px solid var(--color-border)', overflow: 'hidden' }}>
                {h.cover_url
                  ? <Img src={h.cover_url} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'var(--color-border)' }}>★</span>}
              </span>
              <span style={label}>{h.title}</span>
            </button>
            {isOwner && editing && (
              <button type="button" onClick={() => remove(h.id)} aria-label="Sil"
                style={{ position: 'absolute', top: -2, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'var(--color-danger)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}>×</button>
            )}
          </div>
        ))}
        {isOwner && items.length > 0 && (
          <button type="button" onClick={() => setEditing((e) => !e)} style={{ ...circleBtn, justifyContent: 'center' }}>
            <span style={{ ...circle, border: '2px solid transparent', display: 'grid', placeItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>{editing ? 'Bitti' : 'Düzenle'}</span>
          </button>
        )}
      </div>

      {/* ── Görüntüleyici ── */}
      {viewer && v && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 4, padding: '10px 12px 4px' }}>
            {viewer.stories.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 9999, background: i < vIdx ? '#fff' : 'rgba(255,255,255,0.3)', overflow: 'hidden', position: 'relative' }}>
                {i === vIdx && v.mediaType !== 'video' && <div style={{ position: 'absolute', inset: 0, background: '#fff', transformOrigin: 'left', animation: 'hl-progress 5s linear forwards' }} />}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 14px 8px', color: '#fff' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{viewer.title}</span>
            <button type="button" onClick={closeViewer} aria-label="Kapat" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            {v.mediaType === 'video'
              ? <video key={v.id} src={v.mediaUrl} autoPlay playsInline onEnded={() => advance(1)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <img key={v.id} src={v.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
            <button type="button" aria-label="Önceki" onClick={() => advance(-1)} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '35%', background: 'none', border: 'none', cursor: 'pointer' }} />
            <button type="button" aria-label="Sonraki" onClick={() => advance(1)} style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '45%', background: 'none', border: 'none', cursor: 'pointer' }} />
          </div>
          <style>{`@keyframes hl-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
        </div>
      )}

      {creating && <CreateHighlight onClose={() => setCreating(false)} onCreated={() => { setCreating(false); refresh(); }} />}
    </div>
  );
}

const circleBtn: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0, width: 72 };
const circle: React.CSSProperties = { width: 64, height: 64, borderRadius: '50%', display: 'block' };
const label: React.CSSProperties = { fontSize: '0.72rem', color: 'var(--color-text)', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

// ── Oluşturma modalı: arşivden hikaye seç + başlık ver ────────────────────────
function CreateHighlight({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [archive, setArchive] = useState<ArchiveStory[] | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/stories/archive').then((r) => r.json()).then((d) => setArchive(d.stories ?? [])).catch(() => setArchive([]));
  }, []);

  function toggle(id: number) {
    setPicked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  async function create() {
    if (busy || !title.trim() || !picked.size) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/stories/highlights', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), storyIds: [...picked] }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error ?? 'Oluşturulamadı'); return; }
      onCreated();
    } catch { setErr('Oluşturulamadı'); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 510, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 18, width: '100%', maxWidth: 460, maxHeight: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>Yeni Öne Çıkan</span>
          <button type="button" onClick={onClose} aria-label="Kapat" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık (ör. Gezi, En iyiler)" maxLength={40}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.9rem' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 12px' }}>
          {archive === null ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Arşiv yükleniyor…</p>
          ) : archive.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Henüz hiç hikaye paylaşmadın.</p>
          ) : (
            <>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: '0 0 8px' }}>Vitrine koymak istediğin hikayeleri seç:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {archive.map((s) => {
                  const on = picked.has(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggle(s.id)}
                      style={{ position: 'relative', aspectRatio: '9 / 16', borderRadius: 8, overflow: 'hidden', border: on ? '3px solid var(--color-primary)' : '1px solid var(--color-border)', cursor: 'pointer', padding: 0, background: 'var(--color-border)' }}>
                      {s.media_type === 'video'
                        ? <video src={s.media_url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <img src={s.media_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      {on && <span style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.75rem' }}>✓</span>}
                      {!s.active && <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: '0.6rem', color: '#fff', background: 'rgba(0,0,0,0.55)', padding: '1px 5px', borderRadius: 4 }}>arşiv</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {err && <p style={{ color: 'var(--color-danger)', fontSize: '0.82rem', margin: 0, padding: '0 16px 6px' }}>{err}</p>}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={create} disabled={busy || !title.trim() || !picked.size}
            style={{ width: '100%', padding: 12, border: 'none', borderRadius: 9999, background: 'var(--color-primary)', color: '#fff', fontWeight: 700, cursor: busy || !title.trim() || !picked.size ? 'default' : 'pointer', opacity: busy || !title.trim() || !picked.size ? 0.5 : 1 }}>
            {busy ? 'Oluşturuluyor…' : `Oluştur${picked.size ? ` (${picked.size})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
