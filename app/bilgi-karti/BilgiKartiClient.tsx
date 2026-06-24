'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mevcut makaleler — "ilgili makale" alaninda datalist olarak onerilir.
const ARTICLE_SLUGS = ['doppler', 'endosimbiyoz', 'bakteriyofaj', 'kaligrafi', 'black-hole', 'carthage', 'ekonomi', 'einstein-rosen', 'arcade', 'tibbi'];

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 6px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' };

export default function BilgiKartiClient() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/did-you-know', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, sourceLabel, sourceUrl, articleSlug }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(d.error ?? 'Paylaşılamadı'); setSubmitting(false); return; }
      toast.success('Bilgi kartın paylaşıldı 💡');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Bağlantı hatası');
      setSubmitting(false);
    }
  }

  return (
    <main className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/" style={{ display: 'flex', color: 'var(--color-text)', textDecoration: 'none' }} aria-label="Geri">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>💡 Bilgi Kartı Paylaş</h1>
      </div>

      <form onSubmit={submit} style={{ maxWidth: 560, margin: '0 auto', padding: '18px 18px 60px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.55, color: 'var(--color-text-muted)' }}>
          Kısa, ilginç bir bilgi paylaş — akışta &ldquo;Bunu biliyor muydun?&rdquo; kartı olarak görünür. İstersen bir kaynak ve ilgili makale ekle.
        </p>

        <div>
          <label style={labelStyle} htmlFor="dyk-title">Başlık <span style={{ color: '#ef4444' }}>*</span></label>
          <input id="dyk-title" style={inputStyle} value={title} maxLength={140} onChange={e => setTitle(e.target.value)} placeholder="Örn: Bir ambulansın sireni aslında hiç değişmez" />
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 3 }}>{title.length}/140</div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="dyk-body">Bilgi <span style={{ color: '#ef4444' }}>*</span></label>
          <textarea id="dyk-body" style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.5 }} value={body} maxLength={1000} onChange={e => setBody(e.target.value)} placeholder="Açıklamayı buraya yaz…" />
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 3 }}>{body.length}/1000</div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={labelStyle} htmlFor="dyk-srclabel">Kaynak adı</label>
            <input id="dyk-srclabel" style={inputStyle} value={sourceLabel} maxLength={80} onChange={e => setSourceLabel(e.target.value)} placeholder="Örn: Doppler Etkisi" />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={labelStyle} htmlFor="dyk-srcurl">Kaynak bağlantısı</label>
            <input id="dyk-srcurl" style={inputStyle} value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://… (opsiyonel)" inputMode="url" />
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="dyk-slug">İlgili makale (site içi)</label>
          <input id="dyk-slug" list="dyk-articles" style={inputStyle} value={articleSlug} onChange={e => setArticleSlug(e.target.value)} placeholder="Örn: doppler — /articles/<slug>" />
          <datalist id="dyk-articles">{ARTICLE_SLUGS.map(s => <option key={s} value={s} />)}</datalist>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 3 }}>Karttaki &ldquo;Devamını oku&rdquo; bu makaleye gider.</div>
        </div>

        <button type="submit" disabled={!canSubmit} style={{ marginTop: 4, padding: '12px 18px', borderRadius: 9999, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: '0.95rem', fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5, fontFamily: 'inherit' }}>
          {submitting ? 'Paylaşılıyor…' : 'Paylaş'}
        </button>
      </form>
    </main>
  );
}
