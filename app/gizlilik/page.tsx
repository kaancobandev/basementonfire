import type { Metadata } from 'next';
import LegalLayout, { h2, p, ul, linkStyle } from '@/app/components/LegalLayout';
import ConsentReset from '@/app/components/ConsentReset';

export const metadata: Metadata = {
  title: 'Gizlilik ve Çerez Politikası',
  description: 'Basements gizlilik politikası: hangi verileri topluyoruz, neden, kimlerle paylaşıyoruz ve haklarınız.',
  alternates: { canonical: '/gizlilik' },
};

const MAIL = 'info@basementonfire.com';

export default function GizlilikPage() {
  return (
    <LegalLayout
      title="Gizlilik ve Çerez Politikası"
      updated="14/07/2026"
      intro={
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 14px', margin: '0 0 6px' }}>
          <p style={{ ...p, fontWeight: 700, margin: '0 0 6px' }}>Kısaca:</p>
          <ul style={{ ...ul, margin: 0 }}>
            <li>Hizmeti sunmak için <strong>gereken en az veriyi</strong> topluyoruz.</li>
            <li>Verilerini <strong>satmıyoruz</strong>, reklam için kullanmıyoruz.</li>
            <li>Özel mesajlarını <strong>reklam için okumuyoruz</strong>.</li>
            <li>Ziyaret sayacımız <strong>çerezsizdir ve IP adresini saklamaz</strong>.</li>
            <li>Google Analytics <strong>yalnızca onay verirsen</strong> çalışır.</li>
          </ul>
        </div>
      }
    >
      <h2 style={h2}>1. Veri Sorumlusu</h2>
      <p style={p}>
        Bu siteyi Basements (basementonfire.com) işletir. Gizlilikle ilgili her konu için:{' '}
        <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a>
      </p>
      <p style={p}>
        KVKK kapsamındaki ayrıntılı bilgilendirme (hukuki sebepler, aktarım, haklar) için:{' '}
        <a href="/aydinlatma" style={linkStyle}>KVKK Aydınlatma Metni</a>.
      </p>

      <h2 style={h2}>2. Hangi Verileri Topluyoruz?</h2>

      <p style={{ ...p, fontWeight: 700, marginBottom: 4 }}>Hesap açtığında (zorunlu)</p>
      <ul style={ul}>
        <li><strong>Kullanıcı adı</strong> ve <strong>e-posta</strong> — hesabın ve iletişim için.</li>
        <li><strong>Şifre</strong> — şifrelenmiş (hash) olarak saklanır; düz hâlini <strong>biz de göremeyiz</strong>.</li>
        <li><strong>Doğum tarihi</strong> — yalnızca <strong>16 yaş sınırını doğrulamak</strong> için. Profilinde ham hâliyle gösterilmez.</li>
      </ul>

      <p style={{ ...p, fontWeight: 700, marginBottom: 4 }}>Kullandıkça (hizmetin çalışması için)</p>
      <ul style={ul}>
        <li>Paylaştığın <strong>gönderi, hikâye, yorum, makale</strong>; beğeni, kaydetme, repost.</li>
        <li><strong>Özel mesajların (DM)</strong> — mesajlaşmanın çalışması için.</li>
        <li><strong>Takip, engelleme ve şikâyet</strong> kayıtları — güvenlik ve moderasyon için.</li>
        <li>Profil fotoğrafın (yüklemezsen otomatik bir avatar üretilir).</li>
      </ul>

      <p style={{ ...p, fontWeight: 700, marginBottom: 4 }}>Yalnızca sen istersen (opsiyonel)</p>
      <ul style={ul}>
        <li><strong>Cinsiyet, biyografi, ilgi alanları</strong> — boş bırakabilirsin.</li>
        <li><strong>Eşleştirme</strong> özelliğini kullanırsan: ilgi alanların, kaydırma kararların ve eşleşmelerin.</li>
      </ul>
      <p style={p}>
        Bunlar <a href="/acik-riza" style={linkStyle}>açık rızana</a> dayanır ve vermezsen site normal çalışır.
      </p>

      <p style={{ ...p, fontWeight: 700, marginBottom: 4 }}>Güvenlik ve istatistik</p>
      <ul style={ul}>
        <li>
          <strong>Giriş kayıtları:</strong> giriş tarihi, yöntemi ve yaklaşık konum (ülke/şehir).
          <strong> IP adresin saklanmaz.</strong> Amaç: hesabını korumak, yetkisiz erişimi fark etmek.
        </li>
        <li>
          <strong>Sayfa görüntüleme sayacı (kendi sistemimiz):</strong> hangi sayfa, hangi ülke.
          <strong> Çerez kullanmaz ve ham IP adresini saklamaz.</strong> Tekil ziyaretçiyi
          <em> her gün değişen</em> bir özet (hash) ile yaklaşık sayarız — ertesi gün eşleşmez, yani seni günler
          boyunca takip etmez. (Plausible tarzı, gizlilik dostu yöntem.)
        </li>
      </ul>

      <h2 style={h2}>3. Çerezler</h2>
      <p style={p}><strong>Zorunlu çerezler</strong> — sitenin çalışması için gereklidir, onay gerektirmez:</p>
      <ul style={ul}>
        <li>Oturum çerezi — giriş yaptığında oturumunu açık tutmak için.</li>
        <li>Çerez tercihini hatırlayan kayıt — aynı soruyu tekrar tekrar sormamak için.</li>
      </ul>

      <p style={p}><strong>Analitik çerezler (Google Analytics) — yalnızca onay verirsen:</strong></p>
      <ul style={ul}>
        <li><code>_ga</code>, <code>_ga_*</code> — ziyaretçileri ayırt etmek ve oturumları ölçmek (tipik süre ~2 yıl).</li>
      </ul>
      <p style={p}>
        Onay vermezsen bu çerezler <strong>hiç kurulmaz</strong> ve site temel işlevleriyle normal şekilde çalışmaya
        devam eder. Hukuki sebep: KVKK m. 5/1 ve GDPR m. 6/1(a) — <strong>açık rıza</strong>.
      </p>

      <h2 style={h2}>4. Kimlerle Paylaşıyoruz?</h2>
      <p style={p}>
        Kişisel verilerini <strong>satmıyoruz</strong>. Hizmetin çalışması için şu altyapı sağlayıcılarını kullanıyoruz
        (sunucuları yurt dışında olabilir):
      </p>
      <ul style={ul}>
        <li><strong>Supabase</strong> — veritabanı, giriş/kimlik doğrulama ve dosya depolama.</li>
        <li><strong>Netlify</strong> — barındırma, içerik dağıtımı (CDN) ve görsel optimizasyonu.</li>
        <li><strong>Google (Analytics)</strong> — yalnızca <strong>onay verirsen</strong>.</li>
        <li><strong>Giphy</strong> — yalnızca mesajda GIF ararsan, arama metnin iletilir.</li>
        <li><strong>Yetkili kamu kurumları</strong> — yalnızca hukuken zorunlu ve usulüne uygun talep hâlinde.</li>
      </ul>
      <p style={p}>
        Yurt dışına aktarım KVKK m. 9 uyarınca uygun güvenceler veya açık rıza çerçevesinde yapılır.
        Google&apos;ın politikası:{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          policies.google.com/privacy
        </a>
      </p>

      <h2 style={h2}>5. Ne Kadar Süre Saklıyoruz?</h2>
      <ul style={ul}>
        <li><strong>Hesabın, içeriğin ve mesajların:</strong> hesabını silene kadar.</li>
        <li><strong>Giriş kayıtları:</strong> en fazla 12 ay.</li>
        <li><strong>Sayfa görüntüleme istatistiği:</strong> en fazla 12 ay (toplu, kimliğinle ilişkilendirilmez).</li>
        <li><strong>Google Analytics çerezleri:</strong> ~2 yıl; onayını geri çekersen işleme durur.</li>
      </ul>

      <h2 style={h2}>6. Güvenlik</h2>
      <p style={p}>
        Şifreler hash&apos;lenerek saklanır, bağlantılar HTTPS ile şifrelenir ve verilere erişim yetkiyle sınırlıdır
        (KVKK m. 12 / GDPR m. 32). Hiçbir sistem %100 güvenli değildir; hesabını korumak için güçlü ve benzersiz bir
        şifre kullan.
      </p>

      <h2 style={h2}>7. Yaş Sınırı — 16+</h2>
      <p style={p}>
        Basements 16 yaşından küçüklere yönelik değildir ve <strong>16 yaşından küçükler üye olamaz</strong>. 16
        yaşından küçük birine ait bir hesap tespit edersek kapatır ve verilerini sileriz. Böyle bir durumu fark edersen{' '}
        <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a> adresine bildir.
      </p>

      <h2 style={h2}>8. Haklarınız</h2>
      <p style={p}>
        Verilerinin işlenip işlenmediğini <strong>öğrenme</strong>, bilgi <strong>talep etme</strong>,{' '}
        <strong>düzeltme</strong>, <strong>silme</strong>, işlemeye <strong>itiraz etme</strong> ve rızanı{' '}
        <strong>geri çekme</strong> haklarına sahipsin. AB&apos;de bulunuyorsan GDPR kapsamında ayrıca
        <strong> veri taşınabilirliği</strong> ve <strong>işlemeyi kısıtlama</strong> hakların da var.
      </p>
      <p style={p}>
        Talebini <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a> adresine ilet; en geç <strong>30 gün</strong>{' '}
        içinde yanıtlarız. Ayrıntılı liste:{' '}
        <a href="/aydinlatma" style={linkStyle}>KVKK Aydınlatma Metni, madde 7</a>. Memnun kalmazsan Kişisel Verileri
        Koruma Kurumu&apos;na (veya AB&apos;deki ilgili denetim otoritesine) şikâyette bulunabilirsin.
      </p>

      <h2 style={h2}>9. Çerez Onayını Geri Çekme</h2>
      <p style={p}>Çerez tercihini istediğin zaman sıfırlayabilir, tekrar sorulmasını sağlayabilirsin:</p>
      <ConsentReset />

      <h2 style={h2}>10. Değişiklikler</h2>
      <p style={p}>
        Bu politika zaman zaman güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır; önemli değişikliklerde
        site üzerinden bilgilendirme yaparız.
      </p>
    </LegalLayout>
  );
}
