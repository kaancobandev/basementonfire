import type { Metadata } from 'next';
import LegalLayout, { VeriSorumlusu, h2, h3, p, ul, table, th, td, linkStyle } from '@/app/components/LegalLayout';
import { VERI_SORUMLUSU } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu m. 10 uyarınca Basementonfire aydınlatma metni.',
  alternates: { canonical: '/aydinlatma' },
};

const MAIL = VERI_SORUMLUSU.eposta; // tek kaynak: lib/legal.ts

export default function AydinlatmaPage() {
  return (
    <LegalLayout
      title="KVKK Aydınlatma Metni"
      updated="14/07/2026"
      intro={
        <p style={{ ...p, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px' }}>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun (&quot;KVKK&quot;) 10. maddesi uyarınca
          <strong> seni bilgilendirmek</strong> içindir. Onay istemez. Rıza gerektiren işlemler ayrı bir belgede:{' '}
          <a href="/acik-riza" style={linkStyle}>Açık Rıza Metni</a>.
        </p>
      }
    >
      <h2 style={h2}>1. Veri Sorumlusu</h2>
      <p style={p}>
        KVKK m. 10 uyarınca veri sorumlusunun kimliği aşağıdadır. &quot;Basementonfire&quot; bir site/marka adıdır;
        <strong> veri sorumlusu aşağıdaki gerçek kişidir</strong>.
      </p>
      <VeriSorumlusu />
      <p style={p}>
        Her türlü soru, talep ve başvurunu bu e-posta adresine iletebilirsin (bkz. madde 8).
      </p>

      <h2 style={h2}>2. İşlenen Kişisel Veriler, Amaçlar ve Hukuki Sebepler</h2>
      <p style={p}>
        Aşağıdaki tablo, hangi veriyi neden işlediğimizi ve hangi hukuki sebebe dayandığımızı gösterir.
        <strong> Yalnızca hizmeti sunmak için gerekli olanı topluyoruz</strong> (KVKK m. 4 — veri minimizasyonu).
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Veri</th>
              <th style={th}>Neden</th>
              <th style={th}>Hukuki sebep (KVKK)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>Kullanıcı adı, görünen ad, e-posta</td>
              <td style={td}>Hesabın oluşturulması, girişi, kurtarılması ve seninle iletişim</td>
              <td style={td}>m. 5/2-c — sözleşmenin kurulması ve ifası</td>
            </tr>
            <tr>
              <td style={td}>Şifre</td>
              <td style={td}>Hesap güvenliği. Şifren <strong>şifrelenmiş (hash) olarak</strong> saklanır; düz hâlini biz de göremeyiz.</td>
              <td style={td}>m. 5/2-c ve m. 12 — veri güvenliği</td>
            </tr>
            <tr>
              <td style={td}>Doğum tarihi</td>
              <td style={td}>
                <strong>Yaş sınırlarının doğrulanması</strong> ve çocukların korunması: siteye kayıt için <strong>16+</strong>,
                eşleştirme özelliği için ayrıca <strong>18+</strong>.
              </td>
              <td style={td}>m. 5/2-f — meşru menfaat (çocuk koruması)</td>
            </tr>
            <tr>
              <td style={td}>Profil fotoğrafı / üretilen avatar</td>
              <td style={td}>Profilinin görüntülenmesi</td>
              <td style={td}>m. 5/2-c — sözleşmenin ifası</td>
            </tr>
            <tr>
              <td style={td}>Gönderi, hikâye, yorum, makale, beğeni, kaydetme</td>
              <td style={td}>Paylaştığın içeriğin yayımlanması ve gösterilmesi</td>
              <td style={td}>m. 5/2-c — sözleşmenin ifası</td>
            </tr>
            <tr>
              <td style={td}>Özel mesaj (DM) içerikleri</td>
              <td style={td}>Mesajlaşma özelliğinin çalışması. <strong>Mesajlarını reklam için okumuyor, satmıyoruz.</strong></td>
              <td style={td}>m. 5/2-c — sözleşmenin ifası</td>
            </tr>
            <tr>
              <td style={td}>Takip, engelleme ve şikâyet kayıtları</td>
              <td style={td}>Güvenlik, kötüye kullanımın önlenmesi ve içerik moderasyonu</td>
              <td style={td}>m. 5/2-f — meşru menfaat</td>
            </tr>
            <tr>
              <td style={td}>Cinsiyet, biyografi, ilgi alanları <em>(opsiyonel)</em></td>
              <td style={td}>Profilini zenginleştirmen ve eşleştirme özelliği. <strong>Boş bırakabilirsin.</strong></td>
              <td style={td}>m. 5/1 — <a href="/acik-riza" style={linkStyle}>açık rıza</a></td>
            </tr>
            <tr>
              <td style={td}>Eşleştirme kararları ve eşleşmeler <em>(opsiyonel, 18+)</em></td>
              <td style={td}>
                Eşleştirme özelliğini kullanırsan çalışması için. Bu özellik yalnızca <strong>18 yaşından
                büyüklere</strong> açıktır; 18 altındaki kullanıcılar ne kullanabilir ne de aday olarak gösterilir.
              </td>
              <td style={td}>m. 5/1 — <a href="/acik-riza" style={linkStyle}>açık rıza</a></td>
            </tr>
            <tr>
              <td style={td}>Giriş kayıtları (tarih, yöntem, ülke/şehir)</td>
              <td style={td}>Hesap güvenliği ve yetkisiz erişimin tespiti. <strong>IP adresin saklanmaz.</strong></td>
              <td style={td}>m. 5/2-f — meşru menfaat (güvenlik)</td>
            </tr>
            <tr>
              <td style={td}>Sayfa görüntüleme istatistiği (sayfa yolu, ülke)</td>
              <td style={td}>
                Hangi içeriğin ilgi çektiğini anlamak. <strong>Çerez kullanılmaz, ham IP adresin saklanmaz</strong>;
                tekil ziyaretçi <em>günlük olarak değişen</em> bir özet (hash) ile yaklaşık sayılır — ertesi gün eşleşmez,
                yani seni günler boyunca takip etmez.
              </td>
              <td style={td}>m. 5/2-f — meşru menfaat</td>
            </tr>
            <tr>
              <td style={td}>Google Analytics çerezleri</td>
              <td style={td}>Detaylı ziyaret istatistiği. <strong>Sadece onay verirsen</strong> çalışır; reddedersen hiç kurulmaz.</td>
              <td style={td}>m. 5/1 — <a href="/acik-riza" style={linkStyle}>açık rıza</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={h2}>3. Toplama Yöntemi</h2>
      <p style={p}>
        Kişisel verilerin <strong>tamamen elektronik ortamda</strong>, doğrudan senden toplanır: kayıt formu, profil
        düzenleme, ürettiğin içerik ve kullandığın özellikler aracılığıyla; ayrıca güvenlik ve istatistik amacıyla
        otomatik sistemlerle (yukarıdaki tabloda belirtilen sınırlar içinde).
      </p>

      <h2 style={h2}>4. Kimlere Aktarılıyor? (KVKK m. 8 ve m. 9)</h2>
      <p style={p}>
        Kişisel verilerini <strong>satmıyoruz</strong> ve reklam amacıyla üçüncü taraflarla paylaşmıyoruz. Hizmetin
        çalışabilmesi için aşağıdaki <strong>altyapı sağlayıcılarını</strong> kullanıyoruz; bu sağlayıcıların sunucuları
        yurt dışında bulunabilir:
      </p>
      <ul style={ul}>
        <li><strong>Supabase</strong> — veritabanı, kimlik doğrulama ve dosya depolama (hesabın, içeriğin, mesajların burada tutulur).</li>
        <li><strong>Netlify</strong> — sitenin barındırılması, içerik dağıtımı (CDN) ve görsel optimizasyonu.</li>
        <li><strong>Google (Analytics)</strong> — yalnızca <strong>açık rıza verirsen</strong>.</li>
        <li><strong>Giphy</strong> — yalnızca mesajda GIF ararsan, arama metnin Giphy&apos;ye iletilir.</li>
        <li><strong>Yetkili kamu kurum ve kuruluşları</strong> — yalnızca hukuken zorunlu ve usulüne uygun talep hâlinde.</li>
      </ul>
      <p style={p}>
        Yurt dışına aktarım, KVKK m. 9 (7499 sayılı Kanun ile değişik) uyarınca <strong>uygun güvenceler</strong>
        (standart sözleşme vb.) veya açık rızan çerçevesinde yapılır.
      </p>

      <h2 style={h2}>5. Saklama Süreleri</h2>
      <ul style={ul}>
        <li><strong>Hesap bilgilerin, içeriğin ve mesajların:</strong> hesabını silene kadar. Hesabını sildiğinde bu veriler silinir.</li>
        <li><strong>Giriş kayıtları:</strong> güvenlik amacıyla en fazla 12 ay.</li>
        <li><strong>Sayfa görüntüleme istatistiği:</strong> en fazla 12 ay (toplu istatistik; kimliğinle ilişkilendirilmez).</li>
        <li><strong>Google Analytics çerezleri:</strong> tipik olarak ~2 yıl; onayını geri çektiğinde işleme durur.</li>
        <li>Hukuken saklamamız gereken bir durum varsa (örn. yasal talep), ilgili süre boyunca sınırlı olarak saklanabilir.</li>
      </ul>

      <h2 style={h2}>6. Yaş Sınırları (16+ / eşleştirme 18+)</h2>
      <p style={p}>
        Basementonfire <strong>16 yaşından küçüklere yönelik değildir</strong> ve 16 yaşından küçükler üye olamaz. Kayıt
        sırasında yaşını doğruluyoruz. 16 yaşından küçük birinin hesabı olduğunu tespit edersek hesabı kapatır ve
        verilerini sileriz. Böyle bir durumu fark edersen{' '}
        <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a> adresine bildir.
      </p>
      <p style={p}>
        <strong>Eşleştirme özelliği ayrıca 18+&apos;dır.</strong> Tanımadığın kişilerle özel mesajlaşma açtığı için,
        bu özellik 18 yaşından küçüklere <strong>hem gösterilmez hem de onları başkalarına aday olarak göstermez</strong>.
      </p>

      <h2 style={h2}>7. KVKK m. 11 Kapsamındaki Haklarınız</h2>
      <p style={p}>Veri sorumlusuna başvurarak şunları talep etme hakkın var:</p>
      <ul style={ul}>
        <li>Kişisel verinin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>Şartları oluşmuşsa <strong>silinmesini veya yok edilmesini</strong> isteme,</li>
        <li>Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
        <li>Münhasıran otomatik sistemlerle analiz sonucu aleyhine bir sonuç çıkmasına itiraz etme,</li>
        <li>Kanuna aykırı işleme sebebiyle zarara uğrarsan zararın giderilmesini talep etme.</li>
      </ul>
      <p style={p}>
        Ayrıca <strong>rıza verdiğin işlemler için rızanı istediğin zaman geri çekebilirsin</strong> (bkz.{' '}
        <a href="/acik-riza" style={linkStyle}>Açık Rıza Metni</a>). AB&apos;de bulunuyorsan GDPR kapsamında
        erişim, düzeltme, silme, işlemeyi kısıtlama, veri taşınabilirliği ve itiraz haklarına da sahipsin.
      </p>

      <h2 style={h2}>8. Başvuru</h2>
      <p style={p}>
        Taleplerini <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a> adresine iletebilirsin. Başvurunu en geç
        <strong> 30 gün</strong> içinde sonuçlandırırız. Sonuçtan memnun kalmazsan Kişisel Verileri Koruma Kurumu&apos;na
        (KVKK) şikâyette bulunabilirsin.
      </p>

      <h2 style={h2}>9. Değişiklikler</h2>
      <p style={p}>Bu metin güncellenebilir; güncel sürüm her zaman bu sayfada yayımlanır.</p>

      <h3 style={h3}>İlgili belgeler</h3>
      <p style={p}>
        <a href="/gizlilik" style={linkStyle}>Gizlilik ve Çerez Politikası</a> ·{' '}
        <a href="/acik-riza" style={linkStyle}>Açık Rıza Metni</a> ·{' '}
        <a href="/kosullar" style={linkStyle}>Kullanım Koşulları</a>
      </p>
    </LegalLayout>
  );
}
