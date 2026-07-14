import type { Metadata } from 'next';
import LegalLayout, { h2, p, ul, linkStyle } from '@/app/components/LegalLayout';
import ConsentReset from '@/app/components/ConsentReset';

export const metadata: Metadata = {
  title: 'Açık Rıza Metni',
  description: 'Basements açık rıza metni — yalnızca rızaya bağlı (opsiyonel) veri işleme faaliyetleri.',
  alternates: { canonical: '/acik-riza' },
};

const MAIL = 'info@basementonfire.com';

const box: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  borderRadius: 12,
  padding: '12px 14px',
  margin: '0 0 12px',
};

export default function AcikRizaPage() {
  return (
    <LegalLayout
      title="Açık Rıza Metni"
      updated="14/07/2026"
      intro={
        <p style={{ ...p, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px' }}>
          Bu belge, <strong>yalnızca rızana bağlı olan</strong> (yani vermezsen de siteyi kullanabileceğin) veri işleme
          faaliyetlerini anlatır. Bilgilendirme metni ayrıdır:{' '}
          <a href="/aydinlatma" style={linkStyle}>KVKK Aydınlatma Metni</a>.
        </p>
      }
    >
      <h2 style={h2}>Önce en önemlisi: Hiçbiri zorunlu değil</h2>
      <p style={p}>
        Aşağıdaki üç başlığın <strong>hiçbirine rıza vermek zorunda değilsin</strong>. Rıza vermemen hâlinde
        Basements&apos;ı normal şekilde kullanmaya devam edersin: okur, gönderi paylaşır, yorum yapar, mesajlaşırsın.
        Hesabını açmak ve hizmeti almak <strong>bu rızalara bağlanmamıştır</strong> (KVKK m. 4 ve GDPR m. 7/4).
      </p>

      {/* 1 */}
      <div style={box}>
        <h2 style={{ ...h2, margin: '0 0 6px' }}>1. Analitik çerezler (Google Analytics)</h2>
        <p style={p}>
          <strong>Ne oluyor?</strong> Rıza verirsen, siteyi nasıl kullandığını anlamak için Google Analytics (GA4)
          çerezleri kurulur: ziyaret ettiğin sayfalar, cihaz/tarayıcı türü, yaklaşık konum (ülke/şehir) ve siteye
          nereden geldiğin.
        </p>
        <p style={p}>
          <strong>Neden?</strong> Hangi içeriğin işe yaradığını görüp siteyi geliştirmek için. Sana reklam göstermek
          <strong> için kullanılmaz ve satılmaz</strong>.
        </p>
        <p style={p}>
          <strong>Vermezsen?</strong> Çerez hiç kurulmaz. Site aynen çalışır. (Zaten çerezsiz, IP saklamayan temel
          bir sayaç kullanıyoruz — o meşru menfaate dayanır, rıza gerektirmez; bkz. Aydınlatma Metni.)
        </p>
        <p style={{ ...p, margin: '10px 0 4px' }}><strong>Rızanı buradan geri çekebilir / tercihini değiştirebilirsin:</strong></p>
        <ConsentReset />
      </div>

      {/* 2 */}
      <div style={box}>
        <h2 style={{ ...h2, margin: '0 0 6px' }}>2. Opsiyonel profil bilgileri (cinsiyet, biyografi, ilgi alanları)</h2>
        <p style={p}>
          <strong>Ne oluyor?</strong> Profil düzenleme ekranında bu alanları doldurursan işlenir ve profilinde
          görünür. Cinsiyet bilgisi ayrıca profil fotoğrafı yüklemediysen sana uygun bir <em>üretilmiş avatar</em>
          seçmek için kullanılır.
        </p>
        <p style={p}>
          <strong>Rıza nasıl veriliyor?</strong> Bu alanları <strong>doldurman</strong>, ilgili işleme için açık rıza
          anlamına gelir. <strong>Boş bırakabilir</strong> veya sonradan silebilirsin — profil düzenlemeden alanı
          boşaltman rızanı geri çekmek demektir.
        </p>
      </div>

      {/* 3 */}
      <div style={box}>
        <h2 style={{ ...h2, margin: '0 0 6px' }}>3. Eşleştirme özelliği</h2>
        <p style={p}>
          <strong>Ne oluyor?</strong> Eşleştirme (&quot;Eşleşme&quot;) özelliğini kullanırsan; ilgi alanların,
          kaydırma (beğen/geç) kararların ve eşleşmelerin işlenir. Eşleşme olduğunda karşılıklı bir mesajlaşma açılır.
        </p>
        <p style={p}>
          <strong>Dikkat — hassas veri uyarısı:</strong> Eşleştirme tercihlerin, bazı durumlarda
          <strong> cinsel yönelim gibi özel nitelikli bir kişisel veriyi</strong> ima edebilir (KVKK m. 6 / GDPR m. 9).
          Bu nedenle eşleştirme özelliği tamamen <strong>isteğe bağlıdır</strong> ve yalnızca sen kullanmayı seçersen
          bu veriler işlenir.
        </p>
        <p style={p}>
          <strong>Vermezsen / geri çekersen?</strong> Özelliği hiç kullanmayabilirsin. Kullandıysan, eşleştirme
          verilerinin silinmesini <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a> adresinden talep edebilirsin.
        </p>
      </div>

      <h2 style={h2}>Rızanı geri çekmek</h2>
      <p style={p}>
        Verdiğin rızayı <strong>dilediğin zaman, gerekçesiz</strong> geri çekebilirsin. Geri çekme
        <strong> geçmişe etkili değildir</strong>: geri çekene kadar yapılmış işlemeler hukuka uygun kalır, ancak
        geri çektiğin andan itibaren ilgili işleme durur.
      </p>
      <ul style={ul}>
        <li><strong>Çerez rızası:</strong> yukarıdaki butonla (veya <a href="/gizlilik" style={linkStyle}>Gizlilik sayfasından</a>).</li>
        <li><strong>Opsiyonel profil bilgileri:</strong> profil düzenlemeden alanı boşalt.</li>
        <li><strong>Eşleştirme:</strong> <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a> adresine yaz.</li>
      </ul>

      <h2 style={h2}>Beyan</h2>
      <p style={p}>
        Yukarıdaki açıklamaları okudum ve anladım. İlgili alanları doldurarak / çerez bandında &quot;Kabul et&quot;
        seçeneğini işaretleyerek / eşleştirme özelliğini kullanarak, <strong>o başlığa özgü</strong> kişisel verilerimin
        bu metinde belirtilen amaçlarla işlenmesine <strong>özgür irademle açık rıza</strong> vermiş olurum.
      </p>
    </LegalLayout>
  );
}
