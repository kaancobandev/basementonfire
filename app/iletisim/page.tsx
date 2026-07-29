import type { Metadata } from 'next';
import Link from 'next/link';
import CorporateLayout, { Kutu, h2, p, table, th, td, linkStyle } from '@/app/components/CorporateLayout';
import { VeriSorumlusu } from '@/app/components/LegalLayout';
import { jsonLdScript } from '@/lib/seo';
import { VERI_SORUMLUSU } from '@/lib/legal';

// ════════════════════════════════════════════════════════════════════════
// İLETİŞİM — tek kanal (e-posta), konuya göre ayrılmış konu başlıkları.
//
// TEK KAYNAK: adres/e-posta/kimlik lib/legal.ts'ten okunur. Buraya elle
// e-posta YAZMA — dört hukuki metinle çelişir ve KVKK başvuru kanalı ikiye
// bölünür.
//
// FİZİKSEL ADRES: bilinçli olarak yok (bkz. lib/legal.ts:25-33 gerekçesi).
// Şirketleştiğinde lib/legal.ts'e adres/MERSİS eklenir → burası ve dört
// hukuki metin AYNI ANDA güncellenir, kod değişikliği gerekmez.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-static';

const title = 'İletişim';
const description = 'Basementonfire iletişim kanalları: genel sorular, KVKK başvuruları, içerik hatası bildirimi, basın ve işbirliği.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/iletisim' },
  openGraph: { title, description, url: '/iletisim' },
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Basementonfire İletişim',
  url: 'https://basementonfire.com/iletisim',
  inLanguage: 'tr-TR',
  description,
  mainEntity: {
    '@type': 'Organization',
    name: 'Basementonfire',
    url: 'https://basementonfire.com',
    email: VERI_SORUMLUSU.eposta,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: VERI_SORUMLUSU.eposta,
        availableLanguage: ['Turkish', 'English'],
      },
    ],
  },
};

/** Konu başlığı → ne zaman kullanılır. E-posta konusuna yazılması istenen etiket. */
const KANALLAR: { konu: string; ne: string; sure: string }[] = [
  { konu: 'Genel', ne: 'Soru, öneri, geri bildirim.', sure: 'Birkaç iş günü' },
  { konu: 'Hata', ne: 'Makalede maddi hata, eksik atıf, bozuk sayfa veya çalışmayan simülasyon.', sure: 'Birkaç iş günü' },
  { konu: 'KVKK', ne: 'Kişisel verilerine ilişkin bilgi, düzeltme, silme veya itiraz talebi.', sure: 'En geç 30 gün (yasal süre)' },
  { konu: 'Telif', ne: 'Sitedeki bir görsel veya metin üzerinde hak sahibiysen ve kaldırılmasını/atıf düzeltilmesini istiyorsan.', sure: 'Öncelikli' },
  { konu: 'Basın', ne: 'Röportaj, alıntı, logo ve görsel talebi.', sure: 'Birkaç iş günü' },
  { konu: 'İşbirliği', ne: 'Kurumsal kullanım, eğitim kurumu lisansı, içerik ortaklığı.', sure: 'Birkaç iş günü' },
];

export default function IletisimPage() {
  const mail = VERI_SORUMLUSU.eposta;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(contactJsonLd) }} />

      <CorporateLayout
        title="İletişim"
        lede="Tek bir adres, konuya göre ayrılmış başlıklar. Yazdığın her e-posta okunur."
        updated="29/07/2026"
      >
        <Kutu ton="vurgu">
          <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
            <a href={`mailto:${mail}`} style={linkStyle}>{mail}</a>
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            E-postanın konu satırına aşağıdaki başlıklardan birini yazarsan daha hızlı dönüş alırsın.
          </p>
        </Kutu>

        <h2 style={h2}>Hangi konu, ne zaman</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Konu</th>
                <th style={th}>Ne için</th>
                <th style={th}>Yanıt süresi</th>
              </tr>
            </thead>
            <tbody>
              {KANALLAR.map((k) => (
                <tr key={k.konu}>
                  <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{k.konu}</td>
                  <td style={td}>{k.ne}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{k.sure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={h2}>Site içinden bildirim</h2>
        <p style={p}>
          Bir gönderi, yorum veya kullanıcı için şikayet oluşturmak istiyorsan e-posta beklemene
          gerek yok: ilgili içeriğin menüsündeki <strong>Şikayet et</strong> seçeneği bildirimi
          doğrudan moderasyon kuyruğuna düşürür. Bir kullanıcıyı engellemek için profilindeki
          menüyü kullanabilirsin.
        </p>

        <h2 style={h2}>Kimlik bilgileri</h2>
        <p style={p}>
          Aşağıdaki bilgiler KVKK m. 10 ve GDPR m. 13 kapsamında veri sorumlusunun kimliğidir.
          Dört hukuki metinde de aynı bilgi görünür.
        </p>
        <VeriSorumlusu />
        <p style={{ ...p, fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
          Fiziksel adres yayımlanmıyor: proje şu anda bir gerçek kişi tarafından yürütülüyor ve
          yayımlanacak tek adres ev adresi olurdu. KVKK veri sorumlusunun <em>kimliğini</em> ister,
          fiziksel adresi şart koşmaz; sistemde kayıtlı e-posta geçerli bir başvuru kanalıdır.
        </p>

        <h2 style={h2}>Hukuki metinler</h2>
        <p style={p}>
          <Link href="/gizlilik" style={linkStyle}>Gizlilik ve Çerez</Link> ·{' '}
          <Link href="/aydinlatma" style={linkStyle}>KVKK Aydınlatma</Link> ·{' '}
          <Link href="/acik-riza" style={linkStyle}>Açık Rıza</Link> ·{' '}
          <Link href="/kosullar" style={linkStyle}>Kullanım Koşulları</Link>
        </p>
      </CorporateLayout>
    </>
  );
}
