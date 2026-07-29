import type { Metadata } from 'next';
import Link from 'next/link';
import CorporateLayout, { Kutu, h2, p, linkStyle } from '@/app/components/CorporateLayout';
import { jsonLdScript } from '@/lib/seo';
import { VERI_SORUMLUSU } from '@/lib/legal';
import { ARTICLE_COUNT } from '@/lib/landing';

// ════════════════════════════════════════════════════════════════════════
// YOL HARİTASI — projenin bir plana sahip olduğunu gösteren sayfa.
//
// ⚠ TARİH YAZMA. Üç kova var, takvim yok. Sebep: kamuya verilen tarihli söz
// tutulmadığında güven, hiç söz vermemekten daha çok zarar görür. "Ne zaman"
// yerine "hangi sırada" iletiliyor.
//
// ⚠ SÖZ VERME KURALI: "Üzerinde çalışıyoruz" kovasına yalnızca KODU YAZILMIŞ
// veya başlamış işler girer. Fikir aşamasındakiler "Değerlendiriyoruz"a gider —
// oradaki maddeler açıkça söz DEĞİLDİR ve sayfada öyle yazıyor.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-static';

const title = 'Yol Haritası';
const description = 'Basementonfire\'da şu an ne var, ne üzerinde çalışıyoruz, neyi değerlendiriyoruz.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/yol-haritasi' },
  openGraph: { title, description, url: '/yol-haritasi' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Basementonfire Yol Haritası',
  url: 'https://basementonfire.com/yol-haritasi',
  inLanguage: 'tr-TR',
  description,
};

type Madde = { baslik: string; aciklama: string };

/** Yayında — bugün kullanılabilen, doğrulanabilir özellikler. */
const YAYINDA: Madde[] = [
  { baslik: `${ARTICLE_COUNT} interaktif makale`, aciklama: 'Her biri tarayıcıda çalışan simülasyon modülleri ve kaynakça içeriyor.' },
  { baslik: 'Ölçülen okuma', aciklama: 'Okuma ilerlemesi, makale sonu quiz ve günün sorusu.' },
  { baslik: 'Okuma listesi ve koleksiyonlar', aciklama: 'Makale ve gönderileri kaydet, kendi koleksiyonlarına ayır.' },
  { baslik: 'Topluluk', aciklama: 'Gönderi, yorum, hikaye, mesajlaşma, bildirim ve lig sıralaması.' },
  { baslik: 'Kullanıcı makaleleri', aciklama: 'Kendi makaleni yaz ve yayımla — etkileşimli içerik dahil.' },
  { baslik: 'Gizlilik ve hesap kontrolü', aciklama: 'Çerezsiz ziyaretçi sayacı, gizli hesap, engelleme, veri indirme ve hesap silme.' },
];

/** Üzerinde çalışıyoruz — kodu başlamış ya da yazılmış işler. */
const CALISIYORUZ: Madde[] = [
  { baslik: 'Yeni makaleler', aciklama: 'Yayın programı sürüyor; her yeni makale kendi simülasyon modülüyle geliyor.' },
  { baslik: 'İngilizce erişim', aciklama: 'Platformun İngilizce tanıtımı yayında. İçeriğin çevirisi ayrı ve büyük bir iş — planlanıyor.' },
  { baslik: 'Erişilebilirlik iyileştirmeleri', aciklama: 'Klavye gezinimi, kontrast ve hareket azaltma tercihleri.' },
];

/** Değerlendiriyoruz — SÖZ DEĞİL. Bu ayrım sayfada açıkça yazıyor. */
const DEGERLENDIRIYORUZ: Madde[] = [
  { baslik: 'Eğitim kurumları için sınıf aracı', aciklama: 'Öğretmenin simülasyonu derste kullanabilmesi, sınıfa quiz ataması, ilerleme görmesi.' },
  { baslik: 'Mobil uygulama', aciklama: 'Şu an site mobilde tam çalışıyor; ayrı uygulamanın ek değer üretip üretmediği inceleniyor.' },
  { baslik: 'İçerik çevirisi', aciklama: 'Makalelerin başka dillere çevrilmesi — ölçek gerektiren bir iş.' },
];

function Bolum({ etiket, renk, maddeler, not }: { etiket: string; renk: string; maddeler: Madde[]; not?: string }) {
  return (
    <>
      <h2 style={h2}>
        <span
          aria-hidden
          style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 999, background: renk, marginRight: 9, verticalAlign: 'middle' }}
        />
        {etiket}
      </h2>
      {not && <p style={{ ...p, fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>{not}</p>}
      <div style={{ display: 'grid', gap: 8, margin: '0 0 6px' }}>
        {maddeler.map((m) => (
          <div key={m.baslik} style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 12, padding: '11px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.baslik}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{m.aciklama}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function YolHaritasiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <CorporateLayout
        title="Yol Haritası"
        lede="Ne var, ne geliyor, neyi düşünüyoruz. Tarih vermiyoruz — tutulmayan tarih, hiç verilmemiş tarihten kötüdür."
        updated="29/07/2026"
      >
        <Bolum etiket="Yayında" renk="var(--color-success)" maddeler={YAYINDA} />

        <Bolum
          etiket="Üzerinde çalışıyoruz"
          renk="var(--color-accent)"
          maddeler={CALISIYORUZ}
          not="Başlamış işler. Sıralama değişebilir."
        />

        <Bolum
          etiket="Değerlendiriyoruz"
          renk="var(--color-text-muted)"
          maddeler={DEGERLENDIRIYORUZ}
          not="Bunlar söz değildir. Yapılıp yapılmayacağına henüz karar verilmedi; burada olmaları yalnızca üzerinde düşündüğümüz anlamına gelir."
        />

        <Kutu>
          <p style={{ margin: 0 }}>
            Görmek istediğin bir şey mi var, ya da burada olmaması gereken bir şey mi görüyorsun?{' '}
            <a href={`mailto:${VERI_SORUMLUSU.eposta}`} style={linkStyle}>{VERI_SORUMLUSU.eposta}</a>{' '}
            adresine yaz — okuyucudan gelen istekler bu listeyi gerçekten değiştiriyor.{' '}
            <Link href="/iletisim" style={linkStyle}>İletişim →</Link>
          </p>
        </Kutu>
      </CorporateLayout>
    </>
  );
}
