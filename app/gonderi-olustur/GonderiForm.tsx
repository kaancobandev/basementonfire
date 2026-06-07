'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { uploadToStorage } from '@/lib/upload';
import dynamic from 'next/dynamic';

const ImageCropper = dynamic(() => import('@/app/components/ImageCropper'), { ssr: false });

interface Props {
  error: string | null;
}

export default function GonderiForm({ error: initialError }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError ?? '');
  const [dragOver, setDragOver] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  function applyFile(f: File) {
    // Statik görselleri kırpma ekranına al; GIF ve videolar doğrudan geçer.
    if (f.type.startsWith('image/') && f.type !== 'image/gif') {
      setCropFile(f);
      setError('');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError('');
  }

  function clearFile(e?: React.MouseEvent) {
    e?.stopPropagation();
    setFile(null);
    setPreviewUrl('');
    if (fileRef.current) fileRef.current.value = '';
  }

  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('⚠ Önce bir fotoğraf veya video seçmelisin.');
      // Dropzone'u salla
      setShake(true);
      setTimeout(() => setShake(false), 500);
      dropzoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!caption.trim()) { setError('⚠ Açıklama boş olamaz.'); return; }

    setSubmitting(true);
    try {
      const { path, mediaType } = await uploadToStorage(file, 'media');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, caption: caption.trim(), mediaType }),
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
    }
  }

  const isVideo = file?.type.startsWith('video/') ?? false;
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

        {/* Hata mesajı */}
        {error && (
          <div style={{ width: '100%', background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 12, fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Dropzone */}
          <div
            ref={dropzoneRef}
            onClick={() => !file && fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) applyFile(f);
            }}
            style={{
              width: '100%',
              aspectRatio: '1',
              border: `2px dashed ${dragOver ? '#6366f1' : shake ? '#ef4444' : '#c7d2fe'}`,
              borderRadius: 20,
              background: dragOver ? '#eef2ff' : shake ? '#fff0f0' : 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: file ? 'default' : 'pointer',
              overflow: 'hidden',
              transition: 'border-color 0.15s, background 0.15s',
              position: 'relative',
              animation: shake ? 'dropzone-shake 0.4s ease' : 'none',
            }}
          >
            {/* Dosya seçme input (gizli) */}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg"
              hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
            />

            {/* Placeholder */}
            {!file && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 24, textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ marginBottom: 8 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0 }}>Fotoğraf veya video seç</p>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Tıkla veya sürükle bırak</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4, margin: 0 }}>JPG · PNG · WEBP · GIF · MP4 · WEBM · max 100 MB</p>
              </div>
            )}

            {/* Önizleme */}
            {file && previewUrl && (
              <>
                {isVideo ? (
                  <video
                    src={previewUrl}
                    muted
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="önizleme"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}

                {/* Kaldır butonu */}
                <button
                  type="button"
                  onClick={clearFile}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.55)',
                    border: 'none',
                    color: '#fff',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.8)')}
                  onMouseOut={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.55)')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>

                {/* Dosya adı etiketi */}
                <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '3px 10px', fontSize: '0.72rem', color: '#fff', backdropFilter: 'blur(4px)', maxWidth: 'calc(100% - 60px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
              </>
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
                width: '100%',
                minHeight: 100,
                border: '1.5px solid var(--color-border)',
                borderRadius: 14,
                padding: '12px 14px 28px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
            <span style={{
              position: 'absolute',
              bottom: 10,
              right: 12,
              fontSize: '0.75rem',
              color: charOver ? '#ef4444' : '#9ca3af',
              transition: 'color 0.15s',
            }}>
              {charLen} / 10000
            </span>
          </div>

          {/* Paylaş butonu — disabled YOK, hata submit'te gösterilir */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              padding: 14,
              border: 'none',
              borderRadius: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s, transform 0.15s',
              opacity: submitting ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
            onMouseOver={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.opacity = submitting ? '0.7' : '1'; }}
          >
            {submitting ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Yükleniyor...
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

      {cropFile && (
        <ImageCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onCropped={f => {
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
            setCropFile(null);
            setError('');
          }}
        />
      )}
    </main>
  );
}
