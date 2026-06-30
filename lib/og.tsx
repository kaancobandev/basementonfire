import { ImageResponse } from 'next/og';

// Makaleye özel OG (paylaşım) görseli üreticisi. Her makale klasöründeki
// opengraph-image.tsx bunu çağırır → her makale farklı, kimlikli bir kart alır.
// Türkçe karakterler (ü, ç, ş, ğ, İ, ı) için Inter fontu çalışma anında yüklenir;
// yükleme başarısızsa Satori'nin varsayılan fontuna düşer (kırılmaz).

export const OG_SIZE = { width: 1200, height: 630 };

type Font = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };

let fontsPromise: Promise<Font[]> | null = null;
function loadFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      try {
        // Eski User-Agent → Google Fonts ttf döner (Satori ttf'i sorunsuz okur).
        const ua = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)' };
        const grab = async (weight: 400 | 700): Promise<Font> => {
          const css = await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`, { headers: ua }).then((r) => r.text());
          const url = css.match(/src:\s*url\((.+?)\)\s*format/)?.[1];
          if (!url) throw new Error('font url yok');
          const data = await fetch(url).then((r) => r.arrayBuffer());
          return { name: 'Inter', data, weight, style: 'normal' };
        };
        return await Promise.all([grab(400), grab(700)]);
      } catch {
        return [];
      }
    })();
  }
  return fontsPromise;
}

export async function articleOgImage({ title, subtitle, accent, gradient }: { title: string; subtitle: string; accent: string; gradient: string }) {
  const fonts = await loadFonts();
  const titleSize = title.length > 16 ? 86 : 116;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '72px 84px', background: gradient, color: '#ffffff',
          fontFamily: fonts.length ? 'Inter' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 14, height: 58, borderRadius: 6, background: accent }} />
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: 5, color: accent, fontWeight: 700 }}>BASEMENTS</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: titleSize, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 42, marginTop: 20, color: 'rgba(255,255,255,0.84)' }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 27, color: 'rgba(255,255,255,0.6)' }}>basementonfire.com · interaktif makale</div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
