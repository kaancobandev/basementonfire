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

Hazır şablon (konu: `Basementonfire hesabını onayla`):

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

## ⚠️ Site URL — en sık yapılan hata burada

Authentication → **URL Configuration → Site URL** kutusunda **yalnızca** şu
olmalı, başka hiçbir karakter olmadan:

```
https://basementonfire.com
```

Parantez, açıklama, sondaki `/` — hiçbiri olmayacak.

**Neden bu kadar önemli:** şablondaki `{{ .SiteURL }}` bu kutunun değerini
aynen alır. Kutuya fazladan bir şey karışırsa bağlantının TAMAMI bozulur ve
kullanıcı "geçersiz url" uyarısı görür. Belirtisi şudur: mailin bağlantısında
`{{ .SiteURL }}` yazısı düz metin olarak görünür, ama `token_hash` doğru gelir.
O tabloyu görürsen şablonu değil, BU KUTUYU düzelt.

(2026-07-18'de tam olarak bu yaşandı: kutuya bu dokümandan kopyalanan bir
açıklama satırı yapışmıştı.)

**Redirect URLs** listesinde de `https://basementonfire.com/**` bulunmalı;
bu tüm yolları kapsar, ayrıca `/auth/confirm` eklemeye gerek yoktur.

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
Sender name:  Basementonfire
```

Aynı ekrandaki **Rate limit** değerini de yükselt.

**Test:** Yeni kayıtta gelen mailde gönderen
`Basementonfire <info@basementonfire.com>` görünmeli.

---

## Sonra istersen (acil değil)

- **DKIM** — Google Admin → Apps → Gmail → Authenticate email. Teslimatı
  biraz daha güçlendirir.
- **DMARC** — `_dmarc` adına TXT: `v=DMARC1; p=none;
  rua=mailto:info@basementonfire.com`. Hiçbir maili engellemez, sadece rapor
  toplar.
---

# Şifre sıfırlama şablonu

## ⛔ BAĞLANTIYA DOKUNMA

Kayıt onayında yaptığımız `token_hash` değişikliğini **buraya uygulama**.
`app/reset-password/page.tsx` üç akışı birden karşılıyor (hash hatası,
PKCE `?code=`, eski implicit hash) ve `{{ .ConfirmationURL }}` ile
**çalışıyor**. `token_hash`'e çevirirsen o sayfa bu biçimi tanımaz ve
çalışan bir akışı kırmış olursun.

Yalnızca **metni** Türkçeleştir. Konu: `Basementonfire şifreni sıfırla`

```html
<h2>Şifre sıfırlama</h2>

<p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla.
Bağlantı kısa süre sonra geçersiz olur.</p>

<p>
  <a href="{{ .ConfirmationURL }}"
     style="display:inline-block;padding:12px 22px;background:#5b2eef;
            color:#ffffff;border-radius:10px;font-weight:700;
            text-decoration:none">
    Şifremi sıfırla
  </a>
</p>

<p style="color:#666;font-size:13px">
  Bu isteği sen yapmadıysan bu e-postayı yok say; şifren değişmez.
</p>
```

# E-posta değiştirme şablonu

Uygulamada e-posta değiştirme özelliği **yok** (`updateUser` yalnızca şifre
için kullanılıyor). O şablon hiç tetiklenmiyor — dokunmaya gerek yok.

## Zaten gönderilmiş eski mailler?

Bir şey yapmana gerek yok. Eski bağlantıya tıklayan kişinin e-postası yine
onaylanır, sadece otomatik giriş olmaz — `/login`'den normal giriş yapabilir.
