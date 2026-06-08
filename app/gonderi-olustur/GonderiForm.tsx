'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { uploadToStorage } from '@/lib/upload';
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
  const audioRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const [items, setItems] = useState<Item[]>([]);        // fotoğraf + video
  const [audioItems, setAudioItems] = useState<Item[]>([]); // ses dosyaları (ayrı alan)
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState(initialError ?? '');
  const [dragOver, setDragOver] = useState(false);
  const [shake, setShake] = useState(false);

  const total = items.length + audioItems.length + cropQueue.length;

  function mk(f: File, type: Item['type']): Item {
    return { id: nextId.current++, file: f, url: URL.createObjectURL(f), type };
  }

  // Tüm girişler buradan geçer; tür'e göre doğru alana (medya / ses) ayrılır.
  function addFiles(files: File[]) {
    if (!files.length) return;
    const room = MAX_MEDIA - total;
    if (room <= 0) { setError(`En fazla ${MAX_MEDIA} dosya ekleyebilirsin.`); return; }
    const accepted = files.slice(0, room);
    const toCrop: File[] = [];
    const readyMedia: Item[] = [];
    const readyAudio: Item[] = [];
    for (const f of accepted) {
      if (f.type.startsWith('audio/')) readyAudio.push(mk(f, 'audio'));
      else if (f.type.startsWith('image/') && f.type !== 'image/gif') toCrop.push(f); // kırpma ekranına
      else readyMedia.push(mk(f, f.type.startsWith('video/') ? 'video' : 'image'));    // gif + video
    }
    if (readyMedia.length) setItems(prev => [...prev, ...readyMedia]);
    if (readyAudio.length) {
      const keep = readyAudio[readyAudio.length - 1];                  // tek müzik: en yenisi kalır
      readyAudio.slice(0, -1).forEach(p => URL.revokeObjectURL(p.url));
      setAudioItems(prev => { prev.forEach(p => URL.revokeObjectURL(p.url)); return [keep]; });
    }
    if (toCrop.length) setCropQueue(prev => [...prev, ...toCrop]);
    setError(files.length > room ? `En fazla ${MAX_MEDIA} dosya — fazlası atlandı.` : '');
  }

  function onCropped(f: File) {
    setItems(prev => [...prev, mk(f, 'image')]);
    setCropQueue(prev => prev.slice(1));
  }
  function skipCrop() { setCropQueue(prev => prev.slice(1)); }

  function removeItem(id: number) {
    setItems(prev => { const it = prev.find(p => p.id === id); if (it) URL.revokeObjectURL(it.url); return prev.filter(p => p.id !== id); });
  }
  function removeAudio(id: number) {
    setAudioItems(prev => { const it = prev.find(p => p.id === id); if (it) URL.revokeObjectURL(it.url); return prev.filter(p => p.id !== id); });
  }

  function openPicker() { fileRef.current?.click(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (items.length === 0 && audioItems.length === 0) {
      setError('⚠ Önce en az bir dosya (fotoğraf, video veya ses) seçmelisin.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      dropzoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!caption.trim()) { setError('⚠ Açıklama boş olamaz.'); return; }

    // Önce fotoğraf/video (kapak), sonra ses dosyaları
    const all = [...items, ...audioItems];
    setSubmitting(true);
    setProgress({ done: 0, total: all.length });
    try {
      const media: { path: string; mediaType: 'image' | 'video' | 'audio' }[] = [];
      for (let i = 0; i < all.length; i++) {
        const { path, mediaType } = await uploadToStorage(all[i].file, 'media');
        media.push({ path, mediaType });
        setProgress({ done: i + 1, total: all.length });
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

          {/* Fotoğraf/video dosya girişi (çoklu) */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg"
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
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4, margin: 0 }}>JPG · PNG · WEBP · GIF · MP4 · WEBM · max 100 MB</p>
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
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{items.length} fotoğraf/video</span>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>İlk öğe kapak olur</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8 }}>
                {items.map((it, i) => (
                  <div key={it.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#000', border: i === 0 ? '2px solid #6366f1' : '1px solid var(--color-border)' }}>
                    {it.type === 'video'
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
                {total < MAX_MEDIA && (
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

          {/* Ses dosyası — kendi alanı */}
          <div style={{ width: '100%' }}>
            <input
              ref={audioRef}
              type="file"
              accept="audio/*"
              hidden
              multiple
              onChange={e => { addFiles(Array.from(e.target.files ?? [])); if (audioRef.current) audioRef.current.value = ''; }}
            />
            <button
              type="button"
              onClick={() => audioRef.current?.click()}
              disabled={total >= MAX_MEDIA}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                border: '1.5px dashed var(--color-border)', borderRadius: 14, padding: '12px 14px',
                background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'inherit',
                fontSize: '0.92rem', fontWeight: 700, cursor: total >= MAX_MEDIA ? 'not-allowed' : 'pointer',
                opacity: total >= MAX_MEDIA ? 0.5 : 1,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
              {audioItems.length ? 'Müziği değiştir' : 'Ses / müzik ekle'}
            </button>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '6px 2px 0' }}>Ses, fotoğraf/videonun arka planında çalar; izleyen sağ alttaki düğmeyle açar.</p>

            {audioItems.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {audioItems.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                    <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#312e81,#4c1d95)', color: '#fff' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.file.name}</div>
                      <audio src={a.url} controls style={{ width: '100%', height: 32, marginTop: 4 }} />
                    </div>
                    <button type="button" onClick={() => removeAudio(a.id)} aria-label="Kaldır" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.08)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
