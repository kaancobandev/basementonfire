'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupa } from '@/lib/supabase/client';

type State = 'loading' | 'invalid' | 'form' | 'success';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [invalidMsg, setInvalidMsg] = useState('Bu bağlantı geçersiz veya süresi dolmuş.');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      const supa = getSupa();

      // 1. Hash'te hata var mı? (/#error=access_denied&error_code=otp_expired...)
      const hash = new URLSearchParams(window.location.hash.slice(1));
      if (hash.get('error')) {
        const code = hash.get('error_code') ?? '';
        setInvalidMsg(
          code === 'otp_expired'
            ? 'Bu bağlantının süresi dolmuş. Lütfen yeni bir bağlantı iste.'
            : (hash.get('error_description')?.replace(/\+/g, ' ') ?? 'Geçersiz bağlantı.')
        );
        setState('invalid');
        return;
      }

      // 2. PKCE flow: URL'de ?code= var mı? (Supabase yeni varsayılan)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        // Kodu temizle (bir kez kullan)
        window.history.replaceState({}, '', '/reset-password');
        const { error: exchErr } = await supa.auth.exchangeCodeForSession(code);
        if (exchErr) {
          setInvalidMsg(
            exchErr.message.includes('expired') || exchErr.message.includes('invalid')
              ? 'Bu bağlantının süresi dolmuş. Lütfen yeni bir bağlantı iste.'
              : exchErr.message
          );
          setState('invalid');
          return;
        }
        setState('form');
        return;
      }

      // 3. Implicit flow (eski): hash'te access_token + type=recovery
      if (hash.get('access_token') && hash.get('type') === 'recovery') {
        await new Promise(r => setTimeout(r, 300));
        const { data: { session } } = await supa.auth.getSession();
        if (session) {
          setState('form');
          return;
        }
      }

      // 4. Doğrudan URL girişi — geçersiz
      setState('invalid');
    }

    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setSubmitting(true);
    const supa = getSupa();
    const { error: updateErr } = await supa.auth.updateUser({ password });

    if (updateErr) {
      setError(updateErr.message);
      setSubmitting(false);
      return;
    }

    setState('success');
    setTimeout(() => router.push('/'), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--color-border)',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-bg)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '4px',
  };

  return (
    <main
      className="main-content"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>
            Basements
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Yeni şifre belirle</div>
        </div>

        {/* Yükleniyor */}
        {state === 'loading' && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Doğrulanıyor…
          </div>
        )}

        {/* Geçersiz link */}
        {state === 'invalid' && (
          <div style={{ textAlign: 'center' }}>
            <div
              role="alert"
              style={{
                background: 'var(--color-danger-soft)',
                color: 'var(--color-danger)',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '20px',
              }}
            >
              {invalidMsg}
            </div>
            <a
              href="/forgot-password"
              style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Yeni bağlantı iste
            </a>
          </div>
        )}

        {/* Şifre formu */}
        {state === 'form' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div
                role="alert"
                style={{
                  background: 'var(--color-danger-soft)',
                  color: 'var(--color-danger)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>Yeni Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
                placeholder="En az 6 karakter"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>

            <div>
              <label style={labelStyle}>Şifre Tekrar</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                minLength={6}
                required
                placeholder="Şifreyi tekrar gir"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'var(--color-primary)',
                opacity: submitting ? 0.6 : 1,
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '12px',
                border: 'none',
                borderRadius: '10px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                marginTop: '4px',
                fontFamily: 'inherit',
              }}
              onMouseOver={e => { if (!submitting) (e.target as HTMLButtonElement).style.background = 'var(--color-primary-hover)'; }}
              onMouseOut={e => { if (!submitting) (e.target as HTMLButtonElement).style.background = 'var(--color-primary)'; }}
            >
              {submitting ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}

        {/* Başarı */}
        {state === 'success' && (
          <div
            role="status"
            style={{
              background: 'var(--color-success-soft)',
              color: 'var(--color-success)',
              padding: '16px',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            ✓ Şifren güncellendi!<br />Ana sayfaya yönlendiriliyorsun…
          </div>
        )}
      </div>
    </main>
  );
}
