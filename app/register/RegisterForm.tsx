'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MIN_AGE } from '@/lib/age';

export default function RegisterForm() {
  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' as const, color: 'var(--color-text)', backgroundColor: 'var(--color-bg)' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' } as const;
  const linkStyle = { color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' } as const;

  // Gelecek tarih seçilmesin. Sunucuda ZATEN doğrulanıyor; bu sadece kolaylık.
  // SSR'da boş → hidrasyon uyuşmazlığı olmasın diye mount'tan sonra atanır.
  const [maxDate, setMaxDate] = useState('');
  useEffect(() => { setMaxDate(new Date().toISOString().slice(0, 10)); }, []);

  return (
    <form method="POST" action="/api/auth/register" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle} htmlFor="reg-username">Kullanıcı adı</label>
        <input id="reg-username" type="text" name="username" required autoComplete="username" placeholder="kullanici_adi"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="reg-email">E-posta</label>
        <input id="reg-email" type="email" name="email" required autoComplete="email" placeholder="ornek@mail.com"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="reg-password">Şifre</label>
        <input id="reg-password" type="password" name="password" required autoComplete="new-password" placeholder="En az 6 karakter"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Yaş kapısı — Basements 16+ */}
      <div>
        <label style={labelStyle} htmlFor="reg-birthdate">Doğum tarihi</label>
        <input id="reg-birthdate" type="date" name="birthdate" required autoComplete="bday"
          max={maxDate || undefined}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />
        <p style={{ margin: '5px 0 0', fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
          Basements <strong>{MIN_AGE} yaş ve üzeri</strong> içindir. Doğum tarihin yaşını doğrulamak için kullanılır,
          profilinde gösterilmez.
        </p>
      </div>

      {/* Koşul + gizlilik onayı */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--color-text)', cursor: 'pointer' }}>
        <input type="checkbox" name="terms" value="1" required
          style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
        />
        <span>
          <Link href="/kosullar" target="_blank" style={linkStyle}>Kullanım Koşulları</Link>&apos;nı ve{' '}
          <Link href="/gizlilik" target="_blank" style={linkStyle}>Gizlilik Politikası</Link>&apos;nı okudum, kabul ediyorum.
          {' '}({MIN_AGE} yaşından büyük olduğumu beyan ederim.)
        </span>
      </label>

      <button
        type="submit"
        style={{ background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: '1rem', padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '4px' }}
        onMouseOver={e => ((e.target as HTMLButtonElement).style.background = 'var(--color-primary-hover)')}
        onMouseOut={e => ((e.target as HTMLButtonElement).style.background = 'var(--color-primary)')}
      >
        Kayıt Ol
      </button>
    </form>
  );
}
