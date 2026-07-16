import { ImageResponse } from 'next/og';
import { ARTICLE_MAP } from './articles';
import { gradientFor } from './article-gradients';
import { questionFor } from './questions';

// Makaleye özel OG (paylaşım) görseli üreticisi. Her makale klasöründeki
// opengraph-image.tsx bunu çağırır → her makale farklı, kimlikli bir kart alır.
// Türkçe karakterler (ü, ç, ş, ğ, İ, ı) için Inter fontu çalışma anında yüklenir;
// yükleme başarısızsa Satori'nin varsayılan fontuna düşer (kırılmaz).
//
// İKİ GİRİŞ VAR:
//  · articleOgImage({...})  — elle kurulmuş kart. 13 makale böyle (özel gradyan/
//    accent'leri jenerikten daha iyi, o yüzden DOKUNULMADI).
//  · articleOgFor('slug')   — registry'den kurar (2026-07-16'da eklendi). Başlık
//    lib/articles.ts'ten, soru lib/questions.ts'ten, gradyan lib/article-gradients.ts'ten
//    → yeni makale eklerken kart kendiliğinden doğru olur, elle senkron yok.

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

// ════════════════════════════════════════════════════════════════════════
// KART ACCENT'İ — kartın marka şeridi + "BASEMENTS" yazısının rengi.
//
// Neden burada ve neden lib/article-gradients.ts'te DEĞİL: accent bağlama göre
// değişir, makalenin sabit bir özelliği değil. Aynı makalenin landing hero'sundaki
// accent'i farklı (ör. fatih: burada #4d7cff, lib/landing.ts HERO_DECK'te #8fa9ff)
// çünkü zeminler farklı. Tek "doğru" accent yok → tek registry de olamaz.
//
// KURAL: değer makalenin KENDİ gradyanının açık ucundan türetilir, sonra o koyu
// zeminde okunacak kadar açılır. Marka paletinden (indigo/magenta/amber) DEĞİL —
// makale editöryel renkleri kasıtlıdır, tokene bağlanmaz ([[design-token-system]]).
const OG_ACCENTS: Record<string, string> = {
  'black-hole': '#a78bfa',
  turkler: '#fbbf24',
  rome: '#fb923c',
  greece: '#7dd3fc',
  carthage: '#5eead4',
  ekonomi: '#6ee7b7',
  'einstein-rosen': '#67e8f9',
  arcade: '#f9a8d4',
  tibbi: '#93c5fd',
  internet: '#7fd4f0',
  pirus: '#fca5a5',
  takyon: '#a5b4fc',
  tardigrad: '#7ef0c0',
  bagirsak: '#ff9ab0',
  bakteriyofaj: '#86efac',
  endosimbiyoz: '#fdba74',
  kaligrafi: '#fcd34d',
  doppler: '#fca5a5',
  'ayna-noronlari': '#c4b5fd',
};

const FALLBACK_ACCENT = '#c7b3ff';

/**
 * Makalenin kartını REGISTRY'den kurar — elle senkron gerektirmez.
 *   başlık  → lib/articles.ts (ARTICLE_MAP)
 *   soru    → lib/questions.ts (yoksa registry'nin desc'ine düşer)
 *   gradyan → lib/article-gradients.ts (keşif kartıyla AYNI → paylaşılan kart
 *             ile sitede görülen kart aynı kimliği taşır)
 * Bilinmeyen slug'da atmaz: kart yine üretilir, jenerik kimlikle.
 */
/**
 * Kartın alt metni (og:image:alt) — ekran okuyucu ve görselin yüklenmediği
 * istemciler için. Başlık + soru: kartın üstünde YAZAN neyse o.
 */
export function ogAltFor(slug: string): string {
  const a = ARTICLE_MAP[slug];
  const q = questionFor(slug);
  const title = a?.title ?? 'Basements';
  return q ? `${title} — ${q} · Basements` : `${title} · Basements`;
}

export function articleOgFor(slug: string) {
  const a = ARTICLE_MAP[slug];
  return articleOgImage({
    title: a?.title ?? 'Basements',
    // Soru yoksa desc'e düşmek BİLİNÇLİ: kart hiç basılmamaktan iyidir. Ama desc
    // sıfat taşıyabilir ("en gizemli yapılar") → uzun vadede her makalenin
    // lib/questions.ts'te bir sorusu olmalı.
    subtitle: questionFor(slug) ?? a?.desc ?? '',
    accent: OG_ACCENTS[slug] ?? FALLBACK_ACCENT,
    gradient: gradientFor(slug),
  });
}
