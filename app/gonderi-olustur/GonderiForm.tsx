'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { uploadToStorage } from '@/lib/upload';
import { AudioThumb } from '@/app/components/MediaCarousel';
import dynamic from 'next/dynamic';

const ImageCropper = dynamic(() => import('@/app/components/ImageCropper'), { ssr: false });

const MAX_MEDIA = 20;

interface Props {
  error: string | null;
}

type Item = { id: number; file: File; url: string; type: 'image' | 'video' | 'audio' };

export default function GonderiForm({ error: initialError }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const [items, setItems] = useState<Item[]>([]);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState(initialError ?? '');
  const [dragOver, setDragOver] = useState(false);
  const [shake, setShake] = useState(false);

  const slotsUsed = items.length + cropQueue.length;

  function addFiles(files: File[]) {
    if (!files.length) return;
    const room = MAX_MEDIA - slotsUsed;
    if (room <= 0) { setError(`En fazla ${MAX_MEDIA} medya ekleyebilirsin.`); return; }
    const accepted = files.slice(0, room);
    const toCrop: File[] = [];
    const ready: Item[] = [];
    for (const f of accepted) {
      // Statik görseller kırpma ekranına; GIF ve videolar doğrudan geçer.
      if (f.type.startsWith('image/') && f.type !== 'image/gif') {
        toCrop.push(f);
      } else {
        ready.push({ id: nextId.current++, file: f, url: URL.createObjectURL(f), type: f.type.startsWith('video/') ? 'video' : f.type.startsWith('audio/') ? 'audio' : 'image' });
      }
    }
    if (ready.length) setItems(prev => [...prev, ...ready]);
    if (toCrop.length) setCropQueue(prev => [...prev, ...toCrop]);
    if (files.length > room) setError(`En fazla ${MAX_MEDIA} medya — fazlası atlandı.`);
    else setError('');
  }

  function onCropped(f: File) {
    setItems(prev => [...prev, { id: nextId.current++, file: f, url: URL.createObjectURL(f), type: 'image' }]);
    setCropQueue(prev => prev.slice(1));
  }
  function skipCrop() {
    setCropQueue(prev => prev.slice(1));
  }

  function removeItem(id: number) {
    setItems(prev => {
      const it = prev.find(p => p.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return prev.filter(p => p.id !== id);
    });
  }

  function openPicker() {
    fileRef.current?.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('⚠ Önce en az bir fotoğraf veya video seçmelisin.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      dropzoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!caption.trim()) { setError('⚠ Açıklama boş olamaz.'); return; }

    setSubmitting(true);
    setProgress({ done: 0, total: items.length });
    try {
      const media: { path: string; mediaType: 'image' | 'video' | 'audio' }[] = [];
      for (let i = 0; i < items.length; i++) {
        const { path, mediaType } = await uploadToStorage(items[i].file, 'media');
        media.push({ path, mediaType });
        setProgress({ done: i + 1, total: items.length });
      }
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media, caption: caption.trim() }),
      });

      if (res.ok) {
        router.push('/akis?shared=1');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Bir hata oluştu.');
    } catch (err: any) {
      setError(err?.message ?? 'Bağlantı hatası. Tekrar dene.');
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }

  const charLen = caption.length;
  const charOver = charLen > 9900;

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Başlık */}
      <div className="feed-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
        <span>Yeni Gönderi</span>
      </div>

      {/* Form alanı */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 40px', gap: 16, maxWidth: 540, margin: '0 auto', width: '100%' }}>

        {error && (
          <div style={{ width: '100%', background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 12, fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Gizli dosya girişi (çoklu) */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,audio/*"
            hidden
            multiple
            onChange={e => { addFiles(Array.from(e.target.files ?? [])); if (fileRef.current) fileRef.current.value = ''; }}
          />

          {items.length === 0 ? (
            /* Boş durum: büyük bırakma alanı */
            <div
              ref={dropzoneRef}
              onClick={openPicker}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
              style={{
                width: '100%', aspectRatio: '1',
                border: `2px dashed ${dragOver ? '#6366f1' : shake ? '#ef4444' : '#c7d2fe'}`,
                borderRadius: 20,
                background: dragOver ? '#eef2ff' : shake ? '#fff0f0' : 'var(--color-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden',
                transition: 'border-color 0.15s, background 0.15s',
                animation: shake ? 'dropzone-shake 0.4s ease' : 'none',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 24, textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ marginBottom: 8 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0 }}>Fotoğraf veya video seç</p>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Tıkla veya sürükle bırak · en fazla {MAX_MEDIA}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4, margin: 0 }}>JPG · PNG · WEBP · GIF · MP4 · WEBM · MP3 · WAV · max 100 MB</p>
              </div>
            </div>
          ) : (
            /* Önizleme ızgarası */
            <div
              ref={dropzoneRef}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
              style={{ width: '100%', border: `2px dashed ${dragOver ? '#6366f1' : 'var(--color-border)'}`, borderRadius: 16, padding: 10, background: 'var(--color-surface)', transition: 'border-color 0.15s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{items.length} / {MAX_MEDIA} medya</span>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>İlk öğe kapak olur</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8 }}>
                {items.map((it, i) => (
                  <div key={it.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#000', border: i === 0 ? '2px solid #6366f1' : '1px solid var(--color-border)' }}>
                    {it.type === 'audio'
                      ? <AudioThumb />
                      : it.type === 'video'
                      ? <video src={it.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <img src={it.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                    {i === 0 && (
                      <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(99,102,241,0.9)', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: 6 }}>Kapak</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      aria-label="Kaldır"
                      style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
                {slotsUsed < MAX_MEDIA && (
                  <button
                    type="button"
                    onClick={openPicker}
                    aria-label="Ekle"
                    style={{ aspectRatio: '1', borderRadius: 10, border: '2px dashed #c7d2fe', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Açıklama */}
          <div style={{ width: '100%', position: 'relative' }}>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Açıklama yaz..."
              maxLength={10000}
              required
              style={{
                width: '100%', minHeight: 100,
                border: '1.5px solid var(--color-border)', borderRadius: 14,
                padding: '12px 14px 28px', fontSize: '0.95rem', fontFamily: 'inherit',
                resize: 'none', outline: 'none', background: 'var(--color-surface)',
                color: 'var(--color-text)', transition: 'border-color 0.15s', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
            <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: '0.75rem', color: charOver ? '#ef4444' : '#9ca3af', transition: 'color 0.15s' }}>
              {charLen} / 10000
            </span>
          </div>

          {/* Paylaş butonu */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
              fontWeight: 700, fontSize: '1rem', padding: 14, border: 'none', borderRadius: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s, transform 0.15s', opacity: submitting ? 0.7 : 1, fontFamily: 'inherit',
            }}
            onMouseOver={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.opacity = submitting ? '0.7' : '1'; }}
          >
            {submitting ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {progress ? `Yükleniyor ${progress.done}/${progress.total}` : 'Yükleniyor...'}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Paylaş
              </>
            )}
          </button>

        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dropzone-shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-6px); }
          80%     { transform: translateX(6px); }
        }
      `}</style>

      {cropQueue.length > 0 && (
        <ImageCropper
          key={`${cropQueue.length}-${items.length}`}
          file={cropQueue[0]}
          onCancel={skipCrop}
          onCropped={onCropped}
        />
      )}
    </main>
  );
}
