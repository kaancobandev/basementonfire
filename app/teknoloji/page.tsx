import type { Metadata } from 'next';
import Link from 'next/link';
import CorporateLayout, { Kutu, Sayilar, h2, h3, p, ul, table, th, td, linkStyle } from '@/app/components/CorporateLayout';
import { jsonLdScript } from '@/lib/seo';
import { ARTICLE_COUNT } from '@/lib/landing';

// ════════════════════════════════════════════════════════════════════════
// TEKNOLOJİ — sitenin nasıl çalıştığını anlatan sayfa.
//
// NEDEN VAR: Basementonfire dışarıdan bir içerik sitesi gibi görünüyor;
// asıl iş görünmeyen katmanda (render motoru + uyarlanabilir performans +
// ölçüm). Bu sayfa o katmanı görünür kılar. Aynı zamanda teknik değerlendirme
// yapan kurumlara verilecek "teknik doküman"ın kamuya açık özetidir.
//
// ⚠ SAYI GÜNCELLEME: KOD_METRIK içindeki değerler ELLE yazılmıştır çünkü
// build sırasında git/dosya sistemi okumuyoruz. Tarihi de yanına yazdık —
// güncellemeden değeri değiştirme, tarihi de değiştir. Ölçüm komutu:
//   git log --oneline | wc -l
//   git ls-files "*.ts" "*.tsx" | xargs wc -l | tail -1
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-static';

const title = 'Teknoloji';
const description =
  'Basementonfire nasıl çalışır: tarayıcıda çalışan simülasyon motoru, cihazın kendi kare süresini ölçen ' +
  'uyarlanabilir performans katmanı, çerezsiz ölçüm ve statik-önce yayın mimarisi.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/teknoloji' },
  openGraph: { title, description, url: '/teknoloji' },
};

const techJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Basementonfire teknoloji altyapısı',
  url: 'https://basementonfire.com/teknoloji',
  inLanguage: 'tr-TR',
  description,
  publisher: { '@type': 'Organization', name: 'Basementonfire', url: 'https://basementonfire.com' },
};

/** Ölçüm tarihi — sayılar bu tarihte alındı. */
const OLCUM_TARIHI = '29 Temmuz 2026';
const KOD_METRIK = { commit: '347', satir: '62.500+', dosya: '858' };

const YIGIN: { katman: string; teknoloji: string; neden: string }[] = [
  { katman: 'Arayüz', teknoloji: 'React 19 (Server Components), Next.js 15 App Router, TypeScript', neden: 'Sayfaların çoğu sunucuda üretilir; tarayıcıya inen JavaScript en aza iner.' },
  { katman: '3B / simülasyon', teknoloji: 'three.js, ogl, WebGL', neden: 'Ağır sahnelerde three.js, hafif sahnelerde daha küçük olan ogl — sahne başına seçilir.' },
  { katman: 'Animasyon', teknoloji: 'GSAP + ScrollTrigger', neden: 'Kaydırmaya bağlı zaman çizelgeleri ve sabitlenen (pin) bölümler.' },
  { katman: 'Veri', teknoloji: 'PostgreSQL (Supabase), satır düzeyi güvenlik (RLS)', neden: 'Yetki kontrolü uygulamada değil veritabanında; uygulama hatası veri sızdıramaz.' },
  { katman: 'Yayın', teknoloji: 'Netlify edge, ISR (artımlı statik yeniden üretim)', neden: 'Sayfalar kullanıcıya en yakın düğümden, önceden üretilmiş olarak gelir.' },
  { katman: 'Güvenlik', teknoloji: 'CSP + rapor uç noktası, sanitize-html, yalıtılmış (sandbox) iframe', neden: 'Kullanıcı içeriği ve kullanıcı yazılımı, sitenin geri kalanına erişemeyen bir kutuda çalışır.' },
];

export default function TeknolojiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(techJsonLd) }} />

      <CorporateLayout
        title="Teknoloji"
        lede="Görünen kısım makaleler. Asıl iş, o makalelerin her cihazda çalışmasını sağlayan katmanda."
        updated="29/07/2026"
      >
        <p style={p}>
          Basementonfire&apos;ın çözdüğü teknik problem şu: <strong>bir fizik veya tarih
          simülasyonunu, kurulum istemeden, orta-düşük donanımlı bir telefonda akıcı
          çalıştırmak.</strong> Bu sayfa bunu nasıl yaptığımızı anlatıyor.
        </p>

        <Sayilar
          items={[
            { n: String(ARTICLE_COUNT), label: 'interaktif makale' },
            { n: KOD_METRIK.satir, label: 'satır TypeScript' },
            { n: KOD_METRIK.commit, label: 'commit' },
            { n: KOD_METRIK.dosya, label: 'kaynak dosya' },
          ]}
        />
        <p style={{ ...p, fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: -8 }}>
          Kod ölçümleri {OLCUM_TARIHI} itibarıyla.
        </p>

        {/* ══════════ 1 ══════════ */}
        <h2 style={h2}>1 · Simülasyon motoru</h2>
        <p style={p}>
          Makalelerdeki etkileşimli modüller hazır bir oyun motoruna değil, doğrudan WebGL
          üzerine kurulu. Her makale kendi sahnesini taşıyor: kuşatma simülasyonu, çift yarık
          deneyi, kamuflaj seçilimi, kuvvet laboratuvarı, bozunma zinciri, Möbius şeridi,
          dünyanın iç yapısı.
        </p>
        <ul style={ul}>
          <li>
            <strong>Sahne başına motor seçimi.</strong> Ağır geometri gereken sahnelerde three.js,
            tek nesnelik hafif sahnelerde çok daha küçük olan ogl kullanılıyor. Amaç, her makalenin
            yalnızca ihtiyacı kadar kod indirmesi.
          </li>
          <li>
            <strong>Tembel yükleme.</strong> Ağır modüller sayfayla birlikte inmiyor; ekrana
            yaklaştıklarında yükleniyor ve o ana kadar yerlerinde statik bir SVG önizleme duruyor.
          </li>
          <li>
            <strong>Ekran dışında durma.</strong> Uzun ömürlü çizim döngüleri, bölüm ekrandan
            çıkınca duruyor. Kaydırma akıcılığının asıl kaynağı bu.
          </li>
        </ul>

        {/* ══════════ 2 ══════════ */}
        <h2 style={h2}>2 · Uyarlanabilir performans katmanı</h2>
        <p style={p}>
          Asıl özgün kısım burası. Bir sahnenin zayıf bir telefonda kasıp kasmayacağını{' '}
          <strong>tahmin etmiyoruz — ölçüyoruz.</strong> İki katman var:
        </p>

        <h3 style={h3}>Katman 1 — cihaz sınıfı</h3>
        <p style={p}>
          Sahne kurulmadan önce cihaz kabaca sınıflanır: işlemci çekirdek sayısı, bellek,
          işaretleyici türü (dokunmatik mi) ve ekran kısa kenarı. Sonuca göre sahne <em>daha
          ucuz kurulur</em>: piksel oranı, geometri yoğunluğu, parçacık sayısı ve pahalı materyal
          katmanları buna göre belirlenir. Tarayıcı bu ipuçlarını vermiyorsa güvenli orta sınıfta
          kalınır.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Sınıf</th>
                <th style={th}>Koşul</th>
                <th style={th}>Piksel oranı tavanı</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={td}><strong>low</strong></td><td style={td}>≤4 çekirdek veya ≤4 GB bellek + dokunmatik/küçük ekran</td><td style={td}>1,0×</td></tr>
              <tr><td style={td}><strong>mid</strong></td><td style={td}>Zayıf donanım ama büyük ekran, ya da belirsiz</td><td style={td}>1,5×</td></tr>
              <tr><td style={td}><strong>high</strong></td><td style={td}>Güçlü donanım</td><td style={td}>1,75×</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ ...p, fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
          Retina ekranlarda bile 4× piksel boyamanın görsel karşılığı yok; tavan koymak tek başına
          kayda değer bir kazanç.
        </p>

        <h3 style={h3}>Katman 2 — kare süresi bekçisi</h3>
        <p style={p}>
          Sınıflandırma kaba bir tahmindir; gerçek karar sahne çalışırken veriliyor. Bekçi her
          karenin süresini ölçer ve iki kademeli müdahale eder:
        </p>
        <ul style={ul}>
          <li><strong>Isınma penceresi:</strong> ilk 60 kare <em>sayılmaz</em>. O kareler hidrasyon, görsel çözme ve animasyon kurulumuyla çakışır; her cihazda yavaştır. Ölçseydik sağlam telefonları da haksız yere kısıtlardık.</li>
          <li><strong>Aykırı değer ayıklama:</strong> 200 ms&apos;yi aşan kare aralıkları çizim maliyeti değildir (arka plan sekmesi, çöp toplama, kaydırma takılması) — ortalamaya katılmaz.</li>
          <li><strong>Birinci kademe:</strong> 90 karelik pencerede ortalama 26 ms&apos;yi aşarsa (≈38 fps altı) çözünürlük düşürülür.</li>
          <li><strong>İkinci kademe:</strong> hâlâ 30 ms&apos;yi aşıyorsa (≈33 fps altı) animasyon <em>dondurulur</em> — son kare ekranda kalır, sahne durağan bir görsele dönüşür.</li>
        </ul>
        <Kutu ton="vurgu">
          <p style={{ margin: 0 }}>
            Sonuç: hiçbir cihazda donma yaşanmaz. Zayıf telefon güzel bir durağan görsel görür,
            güçlü telefon tam simülasyonu çalıştırır — ve bu karar o cihazın kendi ölçümüyle verilir,
            cihaz modeli listesiyle değil.
          </p>
        </Kutu>

        {/* ══════════ 3 ══════════ */}
        <h2 style={h2}>3 · Ölçüm ve kanıt katmanı</h2>
        <p style={p}>
          Bir eğitim içeriğinin okunması yetmez, <em>kaldığının</em> ölçülmesi gerekir. Site bunun
          için dört sinyal topluyor: makale okuma ilerlemesi, makale sonu quiz cevapları, günün
          sorusu ve makale içi karar noktalarında verilen oylar. Bu veriler kişiye özel öğrenme
          yolunu kurmanın ve içeriğin hangi bölümünde okuyucunun kaybolduğunu görmenin temeli.
        </p>
        <p style={p}>
          Editöryel tarafta ise kaynak çelişkilerini gizlemek yerine yan yana gösteren ortak bir
          bileşen var: aynı olay için farklı kaynakların verdiği farklı sayılar aynı ekranda
          karşılaştırılıyor.
        </p>

        {/* ══════════ 4 ══════════ */}
        <h2 style={h2}>4 · Yayın mimarisi</h2>
        <p style={p}>
          Makalelerin tamamı <strong>statik</strong> üretilir: kök yerleşim oturum bilgisi okumaz,
          bu yüzden makale sayfaları derleme anında hazırlanıp kullanıcıya en yakın uç düğümden
          servis edilir. Dinamik yüzeyler (akış, keşfet) artımlı statik yeniden üretim (ISR) ile
          çalışır — sayfa önceden üretilmiş hâliyle anında gelir, arkada tazelenir.
        </p>
        <p style={p}>
          Girişli/çıkışsız ayrımı, statik sayfayı bozmadan, sunucuda oturum okumadan yapılıyor.
          Bunun ölçülen karşılığı, ağır bir sosyal akış sayfasının bile saniyenin altında açılması.
        </p>

        {/* ══════════ 5 ══════════ */}
        <h2 style={h2}>5 · Gizlilik-öncelikli ölçüm</h2>
        <ul style={ul}>
          <li><strong>Çerezsiz ziyaretçi sayacı.</strong> Kendi trafik ölçümümüz çerez yerleştirmez ve ham IP adresi saklamaz; tekil ziyaretçi geri döndürülemez bir özetle sayılır.</li>
          <li><strong>Onaya bağlı analitik.</strong> Üçüncü taraf analitik, onay verilene kadar çerezsiz ve kısıtlı modda çalışır (Consent Mode v2).</li>
          <li><strong>Veritabanı tarafında yetki.</strong> Erişim kuralları satır düzeyinde veritabanında tanımlı; gizli hesap içeriği listeleme yüzeylerinde ayrıca süzülür.</li>
          <li><strong>Kullanıcı yazılımı yalıtımı.</strong> Kullanıcıların kendi makalelerine gömdüğü etkileşimli içerik, sitenin geri kalanına erişemeyen yalıtılmış bir çerçevede çalışır.</li>
        </ul>

        {/* ══════════ Yığın ══════════ */}
        <h2 style={h2}>Teknoloji yığını</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Katman</th>
                <th style={th}>Teknoloji</th>
                <th style={th}>Neden</th>
              </tr>
            </thead>
            <tbody>
              {YIGIN.map((y) => (
                <tr key={y.katman}>
                  <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{y.katman}</td>
                  <td style={td}>{y.teknoloji}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>{y.neden}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={h2}>Açık kaynak</h2>
        <p style={p}>
          Bu site açık kaynak projelerin üzerine kurulu: React, Next.js, three.js, ogl, GSAP,
          PostgreSQL, Supabase ve daha fazlası. Emeği geçen herkese teşekkürler.
        </p>

        <p style={p}>
          Teknik ayrıntı, işbirliği veya kurumsal kullanım için{' '}
          <Link href="/iletisim" style={linkStyle}>iletişim sayfası →</Link>
        </p>
      </CorporateLayout>
    </>
  );
}
