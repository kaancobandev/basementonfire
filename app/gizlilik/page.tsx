import type { Metadata } from 'next';
import Link from 'next/link';
import ConsentReset from '@/app/components/ConsentReset';

export const metadata: Metadata = {
  title: 'Gizlilik ve Çerez Politikası',
  description: 'Basements gizlilik politikası, KVKK aydınlatma metni ve çerez kullanımı hakkında bilgi.',
  alternates: { canonical: '/gizlilik' },
};

const h2: React.CSSProperties = { fontSize: '1.12rem', fontWeight: 700, margin: '26px 0 6px' };
const p: React.CSSProperties = { margin: '0 0 10px', fontSize: '0.92rem' };

export default function GizlilikPage() {
  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '26px 18px 64px', color: 'var(--color-text)', lineHeight: 1.7 }}>
        <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>← Ana sayfa</Link>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '14px 0 4px' }}>Gizlilik ve Çerez Politikası</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Son güncelleme: [TARİH GİR]</p>

        <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', margin: '16px 0' }}>
          ⚠️ Bu bir <strong>taslaktır</strong>. <code>[...]</code> ile işaretli yerleri kendi bilgilerinle doldur ve
          yayımlamadan önce bir KVKK/hukuk uzmanına danışman önerilir.
        </div>

        <h2 style={h2}>1. Veri Sorumlusu</h2>
        <p style={p}>
          Bu web sitesini ([İŞLETME / KİŞİ ADI], "Basements") işletmektedir. Gizlilikle ilgili her konuda bize{' '}
          <strong>[İLETİŞİM E-POSTASI GİR]</strong> adresinden ulaşabilirsin.
        </p>

        <h2 style={h2}>2. Hangi Verileri, Neden Topluyoruz?</h2>
        <p style={p}>
          Siteyi ziyaret ettiğinde, <strong>yalnızca açık rızan (onayın) halinde</strong>, Google Analytics (GA4)
          aracılığıyla istatistiksel veriler toplanır:
        </p>
        <ul style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: '0.92rem' }}>
          <li>Kısaltılmış IP adresi ve yaklaşık konum (ülke/şehir düzeyinde)</li>
          <li>Cihaz, işletim sistemi ve tarayıcı türü</li>
          <li>Ziyaret ettiğin sayfalar, tıklamalar ve sitede geçirilen süre</li>
          <li>Siteye nereden geldiğin (yönlendiren bağlantı)</li>
        </ul>
        <p style={p}>
          Amaç: Siteyi <strong>iyileştirmek, hangi içeriklerin ilgi çektiğini anlamak ve performansı ölçmek</strong>.
          Bu veriler kimliğini doğrudan belirlemek için kullanılmaz ve sana reklam göstermek için satılmaz.
        </p>

        <h2 style={h2}>3. Hukuki Sebep</h2>
        <p style={p}>
          Analitik çerezler KVKK m. 5/1 ve GDPR m. 6/1(a) uyarınca <strong>açık rızana</strong> dayanır. Onay
          vermezsen bu çerezler çalışmaz ve site temel işlevleriyle normal şekilde kullanılmaya devam eder.
        </p>

        <h2 style={h2}>4. Çerezler</h2>
        <p style={p}>Onay verdiğinde kullanılan başlıca çerezler:</p>
        <ul style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: '0.92rem' }}>
          <li><code>_ga</code>, <code>_ga_*</code> — Google Analytics; ziyaretçileri ayırt etmek ve oturumları ölçmek için (tipik süre: ~2 yıl).</li>
        </ul>
        <p style={p}>Onayını sayfanın altındaki butonla istediğin zaman geri çekebilirsin (bkz. madde 7).</p>

        <h2 style={h2}>5. Üçüncü Taraflar ve Yurt Dışı Aktarım</h2>
        <p style={p}>
          Analitik hizmeti <strong>Google</strong> tarafından sağlanır; veriler Google sunucularında (yurt dışı dahil)
          işlenebilir. Google'ın gizlilik politikası:{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            policies.google.com/privacy
          </a>.
        </p>

        <h2 style={h2}>6. KVKK Kapsamındaki Haklarınız (m. 11)</h2>
        <p style={p}>
          Kişisel verilerinle ilgili olarak; işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini/silinmesini
          isteme ve işlemeye itiraz etme haklarına sahipsin. Talebini <strong>[İLETİŞİM E-POSTASI GİR]</strong> adresine
          iletebilirsin.
        </p>

        <h2 style={h2}>7. Onayı Geri Çekme / Tercihi Değiştirme</h2>
        <p style={p}>Çerez tercihini istediğin zaman sıfırlayabilir, tekrar sorulmasını sağlayabilirsin:</p>
        <ConsentReset />

        <h2 style={h2}>8. Değişiklikler</h2>
        <p style={p}>
          Bu politika zaman zaman güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır.
        </p>
      </div>
    </main>
  );
}
