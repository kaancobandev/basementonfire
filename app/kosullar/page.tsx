import type { Metadata } from 'next';
import LegalLayout, { h2, p, ul, linkStyle } from '@/app/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description: 'Basements kullanım koşulları — hesap, içerik kuralları, moderasyon ve sorumluluklar.',
  alternates: { canonical: '/kosullar' },
};

const MAIL = 'info@basementonfire.com';

export default function KosullarPage() {
  return (
    <LegalLayout
      title="Kullanım Koşulları"
      updated="14/07/2026"
      intro={
        <p style={{ ...p, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px' }}>
          Basements&apos;a kayıt olarak bu koşulları kabul etmiş olursun. Kişisel verilerinin nasıl işlendiği ayrı
          belgelerde: <a href="/aydinlatma" style={linkStyle}>KVKK Aydınlatma</a> ·{' '}
          <a href="/gizlilik" style={linkStyle}>Gizlilik ve Çerez</a>.
        </p>
      }
    >
      <h2 style={h2}>1. Taraflar ve Kabul</h2>
      <p style={p}>
        Bu koşullar, Basements (basementonfire.com — &quot;Basements&quot;, &quot;biz&quot;) ile siteyi kullanan sen
        (&quot;kullanıcı&quot;) arasındaki sözleşmedir. Hesap oluşturarak veya siteyi kullanarak bu koşulları kabul
        edersin. Kabul etmiyorsan siteyi kullanma.
      </p>

      <h2 style={h2}>2. Yaş Sınırı — 16+</h2>
      <p style={p}>
        Basements <strong>16 yaşından küçüklere yönelik değildir</strong>. Kayıt olabilmek için
        <strong> en az 16 yaşında olmalısın</strong> ve kayıt sırasında bunu beyan edersin. 16 yaşından küçük olduğun
        tespit edilirse hesabın kapatılır ve verilerin silinir.
      </p>

      <h2 style={h2}>3. Hesabın</h2>
      <ul style={ul}>
        <li>Kayıt sırasında <strong>doğru bilgi</strong> vermelisin (özellikle doğum tarihi).</li>
        <li>Şifreni gizli tutmak ve hesabının güvenliğini sağlamak senin sorumluluğunda.</li>
        <li>Hesabınla yapılan işlemlerden sen sorumlusun. Yetkisiz bir erişim fark edersen hemen bize bildir.</li>
        <li>Başkasının kimliğine bürünemez, sahte hesap açamazsın.</li>
      </ul>

      <h2 style={h2}>4. Paylaştığın İçerik</h2>
      <p style={p}>
        Paylaştığın gönderi, hikâye, yorum, makale ve mesajlar <strong>sana aittir</strong>. Mülkiyetini almıyoruz.
        Ancak hizmeti sunabilmemiz için bize, paylaştığın içeriği <strong>site üzerinde barındırmak, çoğaltmak,
        göstermek ve gerekli teknik dönüşümleri (yeniden boyutlandırma, sıkıştırma) yapmak</strong> üzere; dünya çapında,
        telifsiz, devredilebilir ve alt lisans verilebilir <strong>sınırlı bir kullanım lisansı</strong> vermiş olursun.
        Bu lisans yalnızca hizmetin işletilmesi amacıyla sınırlıdır; içeriğini silmen hâlinde (yedekler ve yasal
        yükümlülükler saklı kalmak üzere) sona erer.
      </p>
      <p style={p}>
        Paylaştığın içeriğin <strong>hukuka uygunluğundan ve hak ihlali içermemesinden sen sorumlusun</strong>. Sana ait
        olmayan veya izin almadığın içerikleri (telifli görsel, müzik, metin vb.) paylaşamazsın.
      </p>

      <h2 style={h2}>5. Yasak İçerik ve Davranışlar</h2>
      <p style={p}>Aşağıdakiler kesinlikle yasaktır:</p>
      <ul style={ul}>
        <li>Nefret söylemi, ırkçılık, ayrımcılık; şiddete teşvik veya tehdit.</li>
        <li>Taciz, zorbalık, hedef gösterme, ısrarlı rahatsız etme.</li>
        <li><strong>Çocukların istismarına ilişkin her türlü içerik</strong> (derhal kapatma + yasal bildirim).</li>
        <li>Pornografik / müstehcen içerik; rıza dışı mahrem görüntü paylaşımı.</li>
        <li>Başkasının kişisel verilerini izinsiz ifşa etmek (&quot;ifşa&quot;/doxing).</li>
        <li>Telif, marka veya diğer fikri mülkiyet haklarının ihlali.</li>
        <li>Spam, yanıltıcı bağlantı, dolandırıcılık, kimlik avı (phishing), zararlı yazılım.</li>
        <li>Otomatik botlarla toplu içerik üretmek, kazımak (scraping) veya sistemi manipüle etmek.</li>
        <li>Siteyi kullanan diğer kişilerin güvenliğini veya sistemin işleyişini tehlikeye atacak her türlü davranış.</li>
      </ul>

      <h2 style={h2}>6. Moderasyon ve Yaptırımlar</h2>
      <p style={p}>
        Kullanıcılar içerikleri <strong>şikâyet edebilir</strong>, birbirlerini <strong>engelleyebilir</strong>.
        Bu koşulları ihlal ettiğini değerlendirdiğimiz durumlarda; içeriği <strong>kaldırabilir</strong>, görünürlüğünü
        kısıtlayabilir, hesabını <strong>askıya alabilir veya kalıcı olarak kapatabiliriz</strong>. Ağır ihlallerde
        (özellikle çocuk istismarı, ciddi tehdit) önceden uyarı yapılmaksızın işlem yapılır ve gerektiğinde yetkili
        makamlara bildirilir.
      </p>
      <p style={p}>
        Bir karara itiraz etmek istersen <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a> adresine yazabilirsin.
      </p>

      <h2 style={h2}>7. Özel Mesajlar (DM)</h2>
      <p style={p}>
        Özel mesajlarını <strong>reklam amacıyla okumuyor, analiz etmiyor ve satmıyoruz</strong>. Ancak bir şikâyet,
        güvenlik incelemesi veya hukuki zorunluluk hâlinde ilgili içeriğe erişilebilir. Mesajlaştığın kişinin, mesajını
        kaydetmesini (ekran görüntüsü vb.) teknik olarak engelleyemeyiz — paylaştıklarına dikkat et.
      </p>

      <h2 style={h2}>8. Eşleştirme Özelliği</h2>
      <p style={p}>
        Eşleştirme özelliği <strong>isteğe bağlıdır</strong>. Kullanman hâlinde ilgi alanların ve kaydırma kararların
        işlenir (bkz. <a href="/acik-riza" style={linkStyle}>Açık Rıza Metni</a>). Eşleştiğin kişilerle yaptığın
        görüşmelerden ve buluşmalardan doğacak sonuçlardan Basements sorumlu değildir. Tanımadığın kişilerle iletişimde
        <strong> dikkatli ol</strong>.
      </p>

      <h2 style={h2}>9. Sitenin Kendi İçeriği</h2>
      <p style={p}>
        Basements&apos;ın yayımladığı makaleler, görseller, tasarım ve yazılım Basements&apos;a veya lisans verenlerine
        aittir. Kişisel ve ticari olmayan kullanım dışında, izinsiz çoğaltılamaz veya yeniden yayımlanamaz. Makalelerden
        <strong> kaynak göstererek ve bağlantı vererek</strong> alıntı yapabilirsin.
      </p>

      <h2 style={h2}>10. Üçüncü Taraf İçerikler</h2>
      <p style={p}>
        Site; Giphy (GIF), Spotify ve YouTube gibi üçüncü taraf içeriklerine yer verebilir veya bunlara bağlantı
        içerebilir. Bu içeriklerin sorumluluğu ilgili sağlayıcıya aittir ve kendi koşullarına tabidir.
      </p>

      <h2 style={h2}>11. Hizmetin Sunumu ve Sorumluluğun Sınırı</h2>
      <p style={p}>
        Basements ücretsiz olarak, <strong>&quot;olduğu gibi&quot;</strong> sunulur. Hizmetin kesintisiz veya hatasız
        olacağını taahhüt etmiyoruz; bakım, güncelleme veya teknik sorunlar nedeniyle geçici kesintiler olabilir.
        Özellikleri değiştirme, ekleme veya kaldırma hakkımız saklıdır. Kullanıcıların ürettiği içeriğin doğruluğundan
        Basements sorumlu değildir. Yürürlükteki hukukun izin verdiği azami ölçüde, dolaylı zararlardan sorumlu değiliz.
      </p>
      <p style={p}>
        <strong>Önemli:</strong> Sitedeki makale ve içerikler <strong>bilgilendirme amaçlıdır</strong>; tıbbi, hukuki
        veya finansal tavsiye yerine geçmez.
      </p>

      <h2 style={h2}>12. Hesabın Sonlandırılması</h2>
      <p style={p}>
        Hesabını dilediğin zaman kapatabilirsin. Kapatma talebini <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a>{' '}
        adresine iletebilirsin. Bu koşulların ihlali hâlinde hesabını askıya alabilir veya kapatabiliriz.
      </p>

      <h2 style={h2}>13. Değişiklikler</h2>
      <p style={p}>
        Bu koşullar güncellenebilir. Önemli değişikliklerde site üzerinden bilgilendirme yaparız. Değişiklikten sonra
        siteyi kullanmaya devam etmen, güncel koşulları kabul ettiğin anlamına gelir.
      </p>

      <h2 style={h2}>14. Uygulanacak Hukuk</h2>
      <p style={p}>
        Bu koşullara <strong>Türkiye Cumhuriyeti hukuku</strong> uygulanır. Uyuşmazlıklarda Türkiye mahkemeleri ve icra
        daireleri yetkilidir. Avrupa Birliği&apos;nde tüketici olarak sahip olduğun ve sözleşmeyle bertaraf edilemeyen
        haklar saklıdır.
      </p>

      <h2 style={h2}>15. İletişim</h2>
      <p style={p}>
        <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a>
      </p>
    </LegalLayout>
  );
}
