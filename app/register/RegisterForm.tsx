'use client';

export default function RegisterForm() {
  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' } as const;

  return (
    <form method="POST" action="/api/auth/register" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Kullanıcı adı</label>
        <input type="text" name="username" required autoComplete="username" placeholder="kullanici_adi"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
      </div>
      <div>
        <label style={labelStyle}>E-posta</label>
        <input type="email" name="email" required autoComplete="email" placeholder="ornek@mail.com"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
      </div>
      <div>
        <label style={labelStyle}>Şifre</label>
        <input type="password" name="password" required autoComplete="new-password" placeholder="En az 6 karakter"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
      </div>
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
