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
// ════════════════════════════════════════════════════════════════════════
// KÖK KART — ana sayfanın paylaşım görseli (app/opengraph-image.tsx).
//
// NEDEN SAYI YOK: "32 interaktif makale" yazmak cazipti ve build'de registry'den
// türetilebilirdi (ARTICLE_COUNT), ama scraper'lar kartı URL başına BİR KERE çekip
// haftalarca saklar → 3 ay önceki Instagram gönderisi, sen 180 makaledeyken hâlâ
// "32" gösterir ve BAŞKASININ gönderisini yeniden taratamazsın. Yani sayı,
// düzeltemeyeceğin bir yalan olarak donar. Onun yerine hiç eskimeyen şey yazıyor:
// sitenin ne YAPTIĞI.
//
// DÖRT FİİL UYDURMA DEĞİL — dördü de sitede çalışan gerçek modül (lib/landing.ts
// VERBS ile aynı kaynak fikir): Oyna = fatih kuşatma simülasyonu · Karar ver =
// sezar Rubicon · Ölç = radyoaktivite ölçer · Kuşkulan = augustus Res Gestae.
// Modül silinirse buradaki fiil de gitmeli, yoksa kart yalan söyler.
//
// PALET: marka gradyanı (globals.css --gradient-hero) + amber accent
// (--color-accent #ff9d0a). Amber seçildi çünkü hem marka tokeni hem de ateş
// logosuyla aynı aile; indigo zeminde tümleyen renk olarak patlıyor.
// (Eskisi #0f0e0d→#2a1840 idi: 2026-07-11 kimlik yenilemesinden ÖNCEki palet →
// linki paylaşan mor bir kart görüp bambaşka görünen bir siteye düşüyordu.)
const ROOT_GRADIENT = 'radial-gradient(120% 130% at 72% 25%, #3a1e9e 0%, #1e1440 55%, #120e26 100%)';
const ROOT_ACCENT = '#ff9d0a';

export async function rootOgImage() {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '72px 84px', background: ROOT_GRADIENT, color: '#ffffff',
          fontFamily: fonts.length ? 'Inter' : 'sans-serif',
        }}
      >
        {/* Üst şerit — 32 makale kartıyla BİREBİR aynı (aile benzerliği kasıtlı) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 14, height: 58, borderRadius: 6, background: ROOT_ACCENT }} />
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: 5, color: ROOT_ACCENT, fontWeight: 700 }}>BASEMENTS</div>
          {/* ── LOGO BİLEREK YOK. Hüküm geçerli ama SEBEP DEĞİŞTİ (2026-07-16) ──
              Eski gerekçe ("alfa kanalı yok") ARTIK GEÇERSİZ: logo RGBA ve gerçek
              şeffaflığı var. Gerçek engel KONTRAST:

              Ham logo ROOT_GRADIENT üzerinde ÖLÇÜLDÜ → ~1,05-1,40:1 = fiilen görünmez.
              Gradyanın üç durağı da koyu (#3a1e9e/#1e1440/#120e26), logonun gövdesi ise
              koyu kırmızı (rgb(95,11,16)). Üstelik radial odak `at 72% 25%` TAM sağ üst
              köşede, yani logonun geleceği yer gradyanın EN PARLAK yeri: rgb(51,27,133).

              ÖLÇÜLEREK ELENEN İKİ ÇÖZÜM — tekrar deneme:
              · `filter: drop-shadow()` ile glow: Satori'de tarayıcı gibi davranmaz,
                elemanın KUTUSUNA kırpılır (index.node.js:17100 → filter ile birlikte
                `clip-path: url(#satori_cp-…)`) → şekli saran glow değil, kare bir pus.
                Üstelik medyanı 1,40 → 1,20'ye DÜŞÜRÜYOR.
              · Büyütmek: 140px'te medyan 1,43:1 — piksel başına kontrast değişmez,
                sadece leke büyür.

              ÖLÇÜLEN TEK ETKİLİ ÇÖZÜM: açık "çip" — 104x104, borderRadius 24,
              rgba(255,255,255,0.92) zemin, içinde 76px logo → medyan 11,06:1,
              piksellerin %87'si ≥3:1. Yarım önlem işe yaramaz (beyaz %8 → 1,23:1;
              %14 → 1,47:1): ya tam çip ya hiç. Bu bir MARKA kararı, bekliyor.

              Kart logosuz da eksik değil: üstte amber şerit + "BASEMENTS" wordmark var.

              UYGULANIRSA İKİ TUZAK:
              · src olarak SADECE http(s) URL, `data:` URI veya ArrayBuffer kabul edilir
                (index.node.js:16042). fs.readFileSync bir Buffer döner ve DOĞRUDAN
                VERİLEMEZ ("First argument to DataView constructor must be an ArrayBuffer").
              · HTTP URL build'de çalışır (repo zaten Google Fonts'u böyle çekiyor) AMA
                kendi asset'in için tavuk-yumurta (ilk build'de henüz deploy değil → 404)
                ve fetch hatası SESSİZ: index.node.js:16085 `console.error` basıp kartı
                LOGOSUZ üretir, build yemyeşil kalır. → data URI kullan, 208px'e küçült
                (2048'i motora vermek kart başına ~208ms; 208px ~35ms, çıktı PNG aynı). */}
        </div>

        {/* Orta — makale kartında başlık+soru neredeyse, burada da o */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 116, fontWeight: 700, lineHeight: 1.04, letterSpacing: -3 }}>
            Okumak yetmez.
          </div>
          <div style={{ display: 'flex', fontSize: 44, marginTop: 22, color: ROOT_ACCENT, fontWeight: 700 }}>
            Oyna · Karar ver · Ölç · Kuşkulan
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 27, color: 'rgba(255,255,255,0.6)' }}>
          basementonfire.com · interaktif makale
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}

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
