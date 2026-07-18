# E-posta ayarları

İki iş var. Birbirinden bağımsız, sırayla yapılabilir.

- **A. Onay bağlantısını düzelt** → kullanıcı onaylayınca giriş yapmış olsun
- **B. Gönderen adresi** → mailler `info@basementonfire.com` adresinden gitsin

---

# A. Onay bağlantısı

**Nerede:** Supabase → Authentication → Emails → Templates → *Confirm signup*

**Sorun:** Varsayılan `{{ .ConfirmationURL }}` bağlantısı, kullanıcıyı
`site.com/#access_token=...` gibi bir adrese atıyor. `#` işaretinden sonrası
tarayıcıda kalır, sunucuya hiç gitmez. Bu yüzden kullanıcı e-postasını
onaylıyor ama giriş yapmış olmuyor.

**Çözüm:** Şablondaki bağlantıyı bununla değiştir:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

Hazır şablon (konu: `Basements hesabını onayla`):

```html
<h2>Aramıza hoş geldin 👋</h2>

<p>Son bir adım kaldı: e-posta adresini onayla.</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup"
     style="display:inline-block;padding:12px 22px;background:#5b2eef;
            color:#ffffff;border-radius:10px;font-weight:700;
            text-decoration:none">
    E-postamı onayla
  </a>
</p>

<p style="color:#666;font-size:13px">
  Bu hesabı sen oluşturmadıysan bu e-postayı yok sayabilirsin.
</p>
```

**Kontrol:** Authentication → URL Configuration → Site URL
`https://basementonfire.com` olmalı. (`{{ .SiteURL }}` oradan gelir.)

**Test:** Yeni hesapla kayıt ol → maildeki butona tıkla → doğrudan akışa
girişli düşmelisin. Adres çubuğunda `#access_token=` görürsen şablon
kaydedilmemiş demektir.

---

# B. Gönderen adresi

Şu an mailler `noreply@mail.app.supabase.io` adresinden gidiyor. Supabase'in
kendi göndericisinin saatlik limiti çok düşük ve **limit dolunca mailler
sessizce gitmiyor** — hiçbir yerde hata da görünmüyor.

Postan zaten Google Workspace'te, yani yeni bir servise gerek yok.

### 1. DNS'e tek kayıt ekle

Alan adı DNS panelinde:

```
Tip:   TXT
Ad:    @
Değer: v=spf1 include:_spf.google.com ~all
```

Bu kayıt olmadan mailler spam'e düşer. Şu an bu kayıt **yok**.

### 2. Google'dan uygulama şifresi al

Google Hesabı → Güvenlik → Uygulama şifreleri → yeni şifre üret.
(2 Adımlı Doğrulama açık olmalı.)

Bu, hesap şifren değil; sadece SMTP için geçerli ayrı bir şifre.
Doğrudan Supabase'e yapıştır, başka yere yazma.

### 3. Supabase'e gir

Project Settings → Authentication → SMTP Settings → Enable Custom SMTP

```
Host:         smtp.gmail.com
Port:         587
Username:     info@basementonfire.com
Password:     (1. adımdaki uygulama şifresi)
Sender email: info@basementonfire.com
Sender name:  Basements
```

Aynı ekrandaki **Rate limit** değerini de yükselt.

**Test:** Yeni kayıtta gelen mailde gönderen
`Basements <info@basementonfire.com>` görünmeli.

---

## Sonra istersen (acil değil)

- **DKIM** — Google Admin → Apps → Gmail → Authenticate email. Teslimatı
  biraz daha güçlendirir.
- **DMARC** — `_dmarc` adına TXT: `v=DMARC1; p=none;
  rua=mailto:info@basementonfire.com`. Hiçbir maili engellemez, sadece rapor
  toplar.
- **Diğer şablonlar** — şifre sıfırlama ve e-posta değişikliği de aynı
  mantıkla çevrilebilir; bağlantıdaki `type=` değeri `recovery` ve
  `email_change` olur.

## Zaten gönderilmiş eski mailler?

Bir şey yapmana gerek yok. Eski bağlantıya tıklayan kişinin e-postası yine
onaylanır, sadece otomatik giriş olmaz — `/login`'den normal giriş yapabilir.
