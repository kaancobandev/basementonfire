'use client';

export default function ForgotPasswordForm() {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#111827',
    backgroundColor: '#fff',
  };

  return (
    <form
      method="POST"
      action="/api/auth/forgot-password"
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '4px',
          }}
        >
          E-posta adresin
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="ornek@mail.com"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
      </div>

      <button
        type="submit"
        style={{
          background: 'var(--color-primary)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '12px',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'background 0.15s',
          marginTop: '4px',
          fontFamily: 'inherit',
        }}
        onMouseOver={e => ((e.target as HTMLButtonElement).style.background = 'var(--color-primary-hover)')}
        onMouseOut={e => ((e.target as HTMLButtonElement).style.background = 'var(--color-primary)')}
      >
        Bağlantı Gönder
      </button>
    </form>
  );
}
