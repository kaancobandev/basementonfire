import { ImageResponse } from 'next/og';

// Paylaşım önizleme görseli (og:image + twitter:image) — tüm sayfalar için varsayılan.
export const alt = 'Basements — Bilim, Tarih ve Kültür';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0e0d 0%, #1b1733 60%, #2a1840 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 132, fontWeight: 800, letterSpacing: -3 }}>Basements</div>
        <div style={{ display: 'flex', fontSize: 40, marginTop: 18, color: '#c7b3ff', letterSpacing: 2 }}>
          BILIM &middot; TARIH &middot; KULTUR
        </div>
        <div style={{ display: 'flex', fontSize: 26, marginTop: 44, color: '#8b909b' }}>basementonfire.com</div>
      </div>
    ),
    { ...size },
  );
}
