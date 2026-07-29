import type { Metadata } from 'next';
import Link from 'next/link';
import CorporateLayout, { Kutu, h2, h3, p, ul, table, th, td, linkStyle } from '@/app/components/CorporateLayout';
import { jsonLdScript } from '@/lib/seo';
import { VERI_SORUMLUSU } from '@/lib/legal';
import { SOSYAL, SOSYAL_URLLER } from '@/lib/social';
import { ARTICLE_COUNT, CATEGORY_COUNT } from '@/lib/landing';

// ════════════════════════════════════════════════════════════════════════
// BASIN / MEDYA KİTİ — gazeteci, blog yazarı veya kurum "bize görsel ve
// tanım gönderin" dediğinde vereceğimiz tek bağlantı.
//
// ⚠ MARKA ADI: "Basements" DEĞİL "Basementonfire". Tek kelime, tek büyük harf.
// Bu sayfanın ilk bölümü tam olarak bu yanlışı önlemek için var — yanlış yazım
// bir kez basılırsa arama sonuçlarında kalıcı olur.
//
// GÖRSEL DOSYALARI: public/brand/ ve public/icons/ altında. Yeni varlık
// eklersen VARLIKLAR dizisine ekle — bağlantı elle yazılmaz, dizi tek kaynak.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-static';

const title = 'Basın Kiti';
const description = 'Basementonfire logo, marka renkleri, hazır tanım metinleri ve künye bilgileri — basın ve içerik üreticileri için.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/basin' },
  openGraph: { title, description, url: '/basin' },
};

const pressJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Basementonfire Basın Kiti',
  url: 'https://basementonfire.com/basin',
  inLanguage: 'tr-TR',
  description,
  about: {
    '@type': 'Organization',
    name: 'Basementonfire',
    url: 'https://basementonfire.com',
    email: VERI_SORUMLUSU.eposta,
    sameAs: SOSYAL_URLLER,
  },
};

const VARLIKLAR: { ad: string; dosya: string; boyut: string; not: string }[] = [
  { ad: 'Yatay logo — açık zemin', dosya: '/brand/yatay-acik-zemin.png', boyut: '1948×496 PNG', not: 'Beyaz/açık zeminde varsayılan kullanım. En sık ihtiyaç duyulan sürüm.' },
  { ad: 'Yatay logo — koyu zemin', dosya: '/brand/yatay-koyu-zemin.png', boyut: '1948×496 PNG', not: 'Koyu zeminde; yazı beyaz, zemin şeffaf.' },
  { ad: 'Yatay logo — tek renk', dosya: '/brand/yatay-tek-renk.png', boyut: '1948×496 PNG', not: 'Tek renkle basılacak yerler: sponsor duvarı, kaşe, düşük kaliteli baskı.' },
  { ad: 'Amblem — 2048 px', dosya: '/brand/logo_basement_2048x2048.png', boyut: '2048×2048 PNG', not: 'Yazısız yıldız. Baskı ve büyük ekran için ana sürüm.' },
  { ad: 'Amblem — 512 px', dosya: '/brand/logo-512.png', boyut: '512×512 PNG', not: 'Web, sunum ve sosyal medya profil görseli.' },
  { ad: 'Uygulama ikonu — 512 px', dosya: '/icons/icon-512.png', boyut: '512×512 PNG', not: 'Uygulama listesi ve mağaza görselleri.' },
  { ad: 'Uygulama ikonu — 192 px', dosya: '/icons/icon-192.png', boyut: '192×192 PNG', not: 'Küçük boy kullanım.' },
];

/**
 * Ekran görüntüleri. `onizleme` = sayfada gösterilen küçük JPEG (720 px),
 * `dosya` = indirilen tam çözünürlük PNG (2x retina).
 * Sayfaya tam boy PNG GÖMME — altısı birden ~6 MB eder.
 */
const EKRANLAR: { ad: string; dosya: string; onizleme: string; boyut: string; not: string }[] = [
  { ad: 'Ana sayfa', dosya: '/brand/basin/01-ana-sayfa.png', onizleme: '/brand/basin/onizleme/01-ana-sayfa.jpg', boyut: '2880×1800', not: 'Açılış ekranı — soru odaklı giriş.' },
  { ad: 'Makale açılışı', dosya: '/brand/basin/02-makale-hero.png', onizleme: '/brand/basin/onizleme/02-makale-hero.jpg', boyut: '2880×1800', not: 'Radyoaktivite makalesinin WebGL açılışı.' },
  { ad: 'Simülasyon — koyu', dosya: '/brand/basin/03-simulasyon.png', onizleme: '/brand/basin/onizleme/03-simulasyon.jpg', boyut: '2880×1800', not: '“Sen ne kadar radyoaktifsin?” — canlı hesaplayıcı.' },
  { ad: 'Simülasyon — açık', dosya: '/brand/basin/06-simulasyon-2.png', onizleme: '/brand/basin/onizleme/06-simulasyon-2.jpg', boyut: '2880×1800', not: 'Momentum ve çarpışma simülatörü.' },
  { ad: 'Mobil', dosya: '/brand/basin/04-mobil.png', onizleme: '/brand/basin/onizleme/04-mobil.jpg', boyut: '780×1688', not: 'Telefonda ana sayfa.' },
  { ad: 'İçerik listesi', dosya: '/brand/basin/05-kesfet.png', onizleme: '/brand/basin/onizleme/05-kesfet.jpg', boyut: '2880×1800', not: 'Tüm makaleler, konuya göre dağılımıyla.' },
];

const RENKLER: { ad: string; hex: string; not: string }[] = [
  { ad: 'Elektrik indigo', hex: '#5B2EEF', not: 'Ana marka rengi. Beyaz metinle 6,8:1 kontrast (WCAG AA).' },
  { ad: 'Magenta', hex: '#F5288E', not: 'Vurgu ve gradyan. Metin rengi olarak kullanma.' },
  { ad: 'Parlak amber', hex: '#FF9D0A', not: 'İkincil vurgu.' },
  { ad: 'Mürekkep', hex: '#0F1419', not: 'Koyu zemin ve metin.' },
];

export default function BasinPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(pressJsonLd) }} />

      <CorporateLayout
        title="Basın Kiti"
        lede="Logo, renkler, hazır tanım metinleri ve künye. İzin istemene gerek yok — aşağıdaki kurallara uyduğun sürece serbest."
        updated="29/07/2026"
      >
        {/* ══════════ Yazım ══════════ */}
        <h2 style={h2}>Marka adının doğru yazımı</h2>
        <Kutu ton="vurgu">
          <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Basementonfire</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem' }}>
            Tek kelime. Yalnızca ilk harf büyük. Araya boşluk, tire veya büyük harf girmez.
          </p>
        </Kutu>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr><th style={th}>Doğru</th><th style={th}>Yanlış</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...td, color: 'var(--color-success)', fontWeight: 700 }}>Basementonfire</td>
                <td style={{ ...td, color: 'var(--color-danger)' }}>Basements · Basement On Fire · BasementOnFire · Basement-on-fire · BASEMENTONFIRE</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ ...p, fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Not: <strong>basements.com</strong> bizim sitemiz değil, ilgisiz bir başka sitedir.
          Tek alan adımız <strong>{VERI_SORUMLUSU.alanAdi}</strong>.
        </p>

        {/* ══════════ Boilerplate ══════════ */}
        <h2 style={h2}>Hazır tanım metinleri</h2>
        <p style={p}>Aşağıdakileri olduğu gibi kullanabilirsin.</p>

        <h3 style={h3}>Tek cümle</h3>
        <Kutu>
          Basementonfire, bilim, tarih ve kültür konularını tarayıcıda çalıştırılabilir
          simülasyonlara dönüştüren Türkçe bir yayın ve topluluk platformudur.
        </Kutu>

        <h3 style={h3}>Kısa (≈40 kelime)</h3>
        <Kutu>
          Basementonfire, bilimi ve tarihi okunacak metin olmaktan çıkarıp denenecek bir şeye
          dönüştüren Türkçe bir platformdur. {ARTICLE_COUNT} uzun makalenin her biri konusunun
          mekanizmasını tarayıcıda çalışan bir simülasyona çeviriyor: kuşatmayı sen yönetiyor,
          deneyi sen çalıştırıyor, sonucu sen görüyorsun. Okumak ücretsiz ve üyeliksiz.
        </Kutu>

        <h3 style={h3}>Uzun (≈90 kelime)</h3>
        <Kutu>
          Basementonfire, bilim, tarih ve kültür içeriğini etkileşimli hâle getiren Türkçe bir
          yayın ve topluluk platformudur. {CATEGORY_COUNT} konu başlığında {ARTICLE_COUNT} uzun
          makale bulunuyor; her makale, anlattığı mekanizmayı tarayıcıda çalışan bir simülasyona
          dönüştürüyor — kurulum, eklenti veya güçlü bir bilgisayar gerekmiyor. Sahneler,
          cihazın kendi kare süresini ölçen bir performans katmanı sayesinde zayıf telefonlarda
          da takılmıyor. Her makale kaynakçayla bitiyor; kaynaklar çelişiyorsa çelişki gizlenmiyor,
          sürümler yan yana gösteriliyor. Okumak ücretsiz ve üyelik gerektirmiyor. Kayıtlı
          kullanıcılar tartışabiliyor ve kendi makalelerini yayımlayabiliyor.
        </Kutu>

        {/* ══════════ Varlıklar ══════════ */}
        <h2 style={h2}>Logo ve görseller</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr><th style={th}>Varlık</th><th style={th}>Biçim</th><th style={th}>Not</th></tr>
            </thead>
            <tbody>
              {VARLIKLAR.map((v) => (
                <tr key={v.dosya}>
                  <td style={td}>
                    <a href={v.dosya} download style={linkStyle}>{v.ad} ↓</a>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{v.boyut}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>{v.not}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 style={h3}>Yatay logo oranları</h3>
        <p style={p}>
          Yatay kilitte yıldızın yüksekliği <strong>H</strong> ise, yazının büyük harf yüksekliği
          yaklaşık <strong>0,42H</strong>, aradaki boşluk <strong>0,35H</strong>&apos;dir. Boşluk
          bilerek geniş: yıldızın uçları ince ve aralarında çok boşluk var, sıkıştırıldığında yazıyla
          karışıyor. <strong>Asgari genişlik 160 px</strong> — altında uçlar kaybolur, o boyutlarda
          yatay kilit yerine yalnız amblemi kullan.
        </p>

        <h3 style={h3}>Logo kullanım kuralları</h3>
        <ul style={ul}>
          <li>Logonun oranını değiştirme, döndürme, gölge veya efekt ekleme.</li>
          <li>Etrafında logonun kısa kenarının en az <strong>%25&apos;i</strong> kadar boşluk bırak.</li>
          <li>Karmaşık fotoğraf üzerine değil, düz bir zemine yerleştir.</li>
          <li>Logonun renklerini değiştirme; koyu zeminde de aynı dosya kullanılabilir.</li>
          <li><strong>16 px altında kullanma.</strong> Logonun kontrastını uçları taşıyor; çok küçük boyutta uçlar kaybolur.</li>
        </ul>

        {/* ══════════ Ekran görüntüleri ══════════ */}
        <h2 style={h2}>Ekran görüntüleri</h2>
        <p style={p}>
          Hepsi gerçek siteden, 2x çözünürlükte alındı; üzerinde rötuş yok. Görsele tıkla, tam boy
          PNG inisin.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14,
            margin: '0 0 14px',
          }}
        >
          {EKRANLAR.map((e) => (
            <a
              key={e.dosya}
              href={e.dosya}
              download
              style={{
                display: 'block', textDecoration: 'none', color: 'inherit',
                border: '1px solid var(--color-border)', borderRadius: 12,
                overflow: 'hidden', background: 'var(--color-surface)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* Sabit yükseklik + üstten kırp: mobil görsel (720×1558) yoksa
                  hücreyi üç katına çıkarıp ızgarayı dağıtıyor. Üstten kırpmak
                  ekranın en tanıtıcı kısmını korur. */}
              <img
                src={e.onizleme}
                alt={`${e.ad} ekran görüntüsü`}
                loading="lazy"
                style={{
                  display: 'block', width: '100%', height: 168,
                  objectFit: 'cover', objectPosition: 'top',
                  borderBottom: '1px solid var(--color-border)',
                }}
              />
              <div style={{ padding: '9px 11px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{e.ad} ↓</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{e.not}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 3, fontFamily: 'ui-monospace, monospace' }}>
                  {e.boyut} PNG
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* ══════════ Renkler ══════════ */}
        <h2 style={h2}>Marka renkleri</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr><th style={th} /><th style={th}>Renk</th><th style={th}>Kod</th><th style={th}>Not</th></tr>
            </thead>
            <tbody>
              {RENKLER.map((r) => (
                <tr key={r.hex}>
                  <td style={{ ...td, width: 44 }}>
                    <span
                      aria-hidden
                      style={{
                        display: 'block', width: 28, height: 28, borderRadius: 7,
                        background: r.hex, border: '1px solid var(--color-border)',
                      }}
                    />
                  </td>
                  <td style={{ ...td, fontWeight: 700 }}>{r.ad}</td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap' }}>{r.hex}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>{r.not}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={h2}>Tipografi</h2>
        <p style={p}>
          Başlıklar <strong>Bricolage Grotesque</strong>, gövde metni <strong>DM Sans</strong>.
          İkisi de Google Fonts üzerinden açık lisanslıdır.
        </p>

        {/* ══════════ Künye ══════════ */}
        <h2 style={h2}>Künye</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <tbody>
              <tr><td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>Marka</td><td style={td}>{VERI_SORUMLUSU.marka}</td></tr>
              <tr><td style={{ ...td, fontWeight: 700 }}>Alan adı</td><td style={td}>{VERI_SORUMLUSU.alanAdi}</td></tr>
              <tr><td style={{ ...td, fontWeight: 700 }}>Kurucu</td><td style={td}>{VERI_SORUMLUSU.unvan}</td></tr>
              <tr><td style={{ ...td, fontWeight: 700 }}>Dil</td><td style={td}>Türkçe</td></tr>
              <tr><td style={{ ...td, fontWeight: 700 }}>İçerik</td><td style={td}>{ARTICLE_COUNT} interaktif makale, {CATEGORY_COUNT} konu başlığı</td></tr>
              <tr><td style={{ ...td, fontWeight: 700 }}>İletişim</td><td style={td}><a href={`mailto:${VERI_SORUMLUSU.eposta}`} style={linkStyle}>{VERI_SORUMLUSU.eposta}</a></td></tr>
              {SOSYAL.map((s) => (
                <tr key={s.url}>
                  <td style={{ ...td, fontWeight: 700 }}>{s.ad}</td>
                  <td style={td}>
                    <a href={s.url} target="_blank" rel="me noopener noreferrer" style={linkStyle}>{s.kullaniciAdi}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...p, fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
          Yukarıdakiler tek resmi hesaplarımızdır. Başka bir platformda &quot;Basementonfire&quot; adıyla
          gördüğün bir hesap bize ait değildir; bildirirsen seviniriz.
        </p>

        {/* ══════════ İçerik kullanımı ══════════ */}
        <h2 style={h2}>İçerik alıntılama</h2>
        <ul style={ul}>
          <li>Makalelerden alıntı yapabilirsin; kaynak olarak <strong>Basementonfire</strong> ve makalenin bağlantısını belirt.</li>
          <li>Makalelerdeki görsellerin telif durumu makaleden makaleye değişir — her makalenin sonundaki kaynakçada belirtilir. Görsel kullanmadan önce oraya bak.</li>
          <li>Ekran görüntüsü alıp yayımlamak serbesttir.</li>
          <li>Makale metnini olduğu gibi başka bir sitede yeniden yayımlamak için önce yaz.</li>
        </ul>

        <p style={p}>
          Burada olmayan bir görsel, veri veya röportaj için{' '}
          <a href={`mailto:${VERI_SORUMLUSU.eposta}`} style={linkStyle}>{VERI_SORUMLUSU.eposta}</a>{' '}
          adresine &quot;Basın&quot; konusuyla yaz.{' '}
          <Link href="/iletisim" style={linkStyle}>İletişim sayfası →</Link>
        </p>
      </CorporateLayout>
    </>
  );
}
