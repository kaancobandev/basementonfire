import type { Metadata } from 'next';
import Link from 'next/link';
import CorporateLayout, { Kutu, Sayilar, h2, p, ul, linkStyle } from '@/app/components/CorporateLayout';
import { jsonLdScript } from '@/lib/seo';
import { VERI_SORUMLUSU } from '@/lib/legal';
import { ARTICLE_COUNT, CATEGORY_COUNT, RULES } from '@/lib/landing';

// ════════════════════════════════════════════════════════════════════════
// HAKKIMIZDA — sitenin kurumsal kimlik sayfası.
//
// STATİK: auth/db okumaz → build'de üretilir, edge'den gelir.
//
// KURAL: bu sayfadaki her sayı TÜRETİLİR (lib/landing.ts, lib/articles.ts).
// Elle yazılan sayı 34. makalede yalan söyler ve sitenin kendi kuralını
// ("Sıfat değil, sayı") ilk çiğneyen sayfa hakkımızda olur.
//
// ⚠ DOLDURULACAK: KURUCU_NOTU altındaki kişisel biyografi cümlesi şu an
// yalnızca doğrulanabilir bilgiyi içeriyor (ad + rol). Eğitim/geçmiş eklemek
// istersen oraya yaz — uydurma bilgi KOYMA, bu sayfa referans gösteriliyor.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-static';

const title = 'Hakkımızda';
const description =
  `Basementonfire nedir, neden var, nasıl çalışır? ${ARTICLE_COUNT} interaktif Türkçe makale, ` +
  `${CATEGORY_COUNT} konu başlığı ve arkasındaki yayın ilkeleri.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/hakkimizda' },
  openGraph: { title, description, url: '/hakkimizda' },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Basementonfire Hakkında',
  url: 'https://basementonfire.com/hakkimizda',
  inLanguage: 'tr-TR',
  description,
  mainEntity: {
    '@type': 'Organization',
    name: 'Basementonfire',
    url: 'https://basementonfire.com',
    email: VERI_SORUMLUSU.eposta,
    founder: { '@type': 'Person', name: VERI_SORUMLUSU.unvan },
  },
};

export default function HakkimizdaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(aboutJsonLd) }} />

      <CorporateLayout
        title="Hakkımızda"
        lede="Bilimi, tarihi ve kültürü okunacak metin olmaktan çıkarıp çalıştırılacak bir şeye dönüştürüyoruz."
        updated="29/07/2026"
      >
        <p style={p}>
          Türkçede bilim ve tarih içeriği ya uzun bir duvar metni ya da bir video. İkisinde de
          okuyucu izleyicidir: bir şeyi <em>deneyemez</em>. Basementonfire bunu değiştirmek için
          kuruldu. Her makale, konusunun içindeki mekanizmayı tarayıcıda çalıştırılabilir hâle
          getiriyor — simülasyonu sen başlatıyorsun, değişkeni sen değiştiriyorsun, sonucu sen
          görüyorsun.
        </p>

        <Sayilar
          items={[
            { n: String(ARTICLE_COUNT), label: 'uzun interaktif makale' },
            { n: String(CATEGORY_COUNT), label: 'konu başlığı' },
            { n: '0 ₺', label: 'okumak için ücret' },
            { n: 'Üyeliksiz', label: 'okumak için hesap gerekmez' },
          ]}
        />

        <h2 style={h2}>Üç kural</h2>
        <p style={p}>
          Bir eğitim yayınının değeri iddialarında değil, iddialarını nasıl sınırladığındadır.
          Sitedeki her makale şu üç kurala tabidir ve üçü de sayfada <strong>doğrulanabilir</strong>:
        </p>
        <ul style={ul}>
          {/* Tek kaynak lib/landing.ts — ana sayfadaki manifesto ile aynı metin.
              İki yerde ayrı yazılsaydı zamanla ayrışır, marka kendi kuralını çiğnerdi. */}
          {RULES.map((r) => (
            <li key={r.claim} style={{ marginBottom: 6 }}>
              <strong>{r.claim}</strong> {r.proof}
            </li>
          ))}
        </ul>

        <h2 style={h2}>Ne yapıyoruz</h2>
        <ul style={ul}>
          <li>
            <strong>İnteraktif makaleler.</strong> Kuşatma simülasyonundan çift yarık deneyine,
            radyoaktivite hesaplayıcısından kuvvet laboratuvarına — konunun mekanizması
            oynanabilir bir modüle dönüşüyor. <Link href="/" style={linkStyle}>Örnekleri gör →</Link>
          </li>
          <li>
            <strong>Kaynakça zorunluluğu.</strong> Her makale kaynakçayla biter. Kaynaklar
            çelişiyorsa çelişki gizlenmez; sürümler yan yana konur, karar okuyucuya bırakılır.
          </li>
          <li>
            <strong>Topluluk katmanı.</strong> Okuyucular kendi içeriklerini paylaşabiliyor,
            tartışabiliyor ve kendi makalelerini yazıp yayımlayabiliyor.
          </li>
          <li>
            <strong>Ölçülen öğrenme.</strong> Quiz, okuma ilerlemesi ve günün sorusu, okumanın
            ne kadarının kaldığını görünür kılıyor.
          </li>
        </ul>

        <h2 style={h2}>Nasıl çalışıyor</h2>
        <p style={p}>
          Simülasyonlar tarayıcıda çalışır; kurulum, eklenti veya güçlü bir bilgisayar gerekmez.
          Zayıf telefonlarda sahnelerin kasmaması için cihazın kendi kare süresini ölçen bir
          performans katmanı yazdık — karar tahminle değil ölçümle veriliyor.{' '}
          <Link href="/teknoloji" style={linkStyle}>Teknik ayrıntılar →</Link>
        </p>

        <h2 style={h2}>Gizlilik duruşumuz</h2>
        <Kutu>
          <p style={{ ...p, margin: 0 }}>
            Ziyaretçi sayacımız <strong>çerez kullanmaz ve ham IP adresi saklamaz</strong>.
            Reklam izleyicisi yerleştirmiyoruz; analitik, onay verilene kadar çerezsiz ve
            kısıtlı modda çalışır. Hesabını tek tıkla silebilir, verilerini indirebilirsin.
            Ayrıntılar: <Link href="/gizlilik" style={linkStyle}>Gizlilik</Link>,{' '}
            <Link href="/aydinlatma" style={linkStyle}>KVKK Aydınlatma</Link>,{' '}
            <Link href="/acik-riza" style={linkStyle}>Açık Rıza</Link>.
          </p>
        </Kutu>

        <h2 style={h2}>Kim yapıyor</h2>
        {/* ⚠ Yalnızca doğrulanabilir bilgi. Biyografi eklemek istersen buraya yaz. */}
        <p style={p}>
          Basementonfire&apos;ı <strong>{VERI_SORUMLUSU.unvan}</strong> kuruyor ve geliştiriyor.
          Tasarım, yazılım, içerik ve editöryel denetim şu an tek elden yürütülüyor. Kaynak
          doğrulaması gereken konularda alan uzmanlarına danışıyoruz.
        </p>
        <p style={p}>
          Katkı vermek, hata bildirmek veya işbirliği önermek istersen{' '}
          <Link href="/iletisim" style={linkStyle}>iletişim sayfasından</Link> yazabilirsin.
        </p>

        <h2 style={h2}>Hata bulursan</h2>
        <p style={p}>
          Bir makalede maddi hata, eksik atıf veya telif sorunu görürsen{' '}
          <a href={`mailto:${VERI_SORUMLUSU.eposta}`} style={linkStyle}>{VERI_SORUMLUSU.eposta}</a>{' '}
          adresine yaz. Doğrulanan hatalar düzeltilir ve düzeltme makalede belirtilir.
        </p>
      </CorporateLayout>
    </>
  );
}
