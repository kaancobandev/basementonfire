# Supabase e-posta şablonları (Türkçe)

Supabase Dashboard → **Authentication → Emails → Templates**

> ⚠️ **En kritik kısım şablonun metni değil, BAĞLANTININ BİÇİMİ.**
> Varsayılan `{{ .ConfirmationURL }}` token'ları URL **fragment**'ında
> (`#access_token=...`) getirir. Fragment sunucuya **hiç gitmez**; bu sitenin
> oturumu çerez tabanlı olduğu için kullanıcı e-postasını onaylar ama **giriş
> yapmış olmaz** — landing'e düşer, çıkış yapmış görünür. Ayrıca erişim ve
> yenileme token'ı URL'de durur (tarayıcı geçmişi + paylaşılan bağlantı riski).
>
> Aşağıdaki şablonlar bunun yerine `token_hash` kullanır; doğrulama
> `app/auth/confirm/route.ts` içinde **sunucuda** yapılır ve oturum doğrudan
> httpOnly çereze yazılır.

---

## 1. Confirm signup (Kayıt onayı)

**Subject:** `Basements hesabını onayla`

```html
<h2>Aramıza hoş geldin 👋</h2>

<p>Basements hesabını oluşturdun. Son bir adım kaldı: aşağıdaki bağlantıya
tıklayarak e-posta adresini onayla.</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup"
     style="display:inline-block;padding:12px 22px;background:#5b2eef;color:#ffffff;
            border-radius:10px;font-weight:700;text-decoration:none">
    E-postamı onayla
  </a>
</p>

<p style="color:#666;font-size:13px">
  Buton çalışmazsa bu adresi tarayıcına yapıştır:<br>
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
</p>

<p style="color:#666;font-size:13px">
  Bu hesabı sen oluşturmadıysan bu e-postayı yok sayabilirsin.
</p>
```

---

## 2. Reset password (Şifre sıfırlama)

**Subject:** `Basements şifreni sıfırla`

```html
<h2>Şifre sıfırlama</h2>

<p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla. Bağlantı kısa süre
sonra geçersiz olur.</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery"
     style="display:inline-block;padding:12px 22px;background:#5b2eef;color:#ffffff;
            border-radius:10px;font-weight:700;text-decoration:none">
    Şifremi sıfırla
  </a>
</p>

<p style="color:#666;font-size:13px">
  Bu isteği sen yapmadıysan bu e-postayı yok say; şifren değişmez.
</p>
```

> Not: `type=recovery` doğrulandıktan sonra kullanıcı girişli olur.
> Şifre değiştirme ekranına yönlendirmek istersen `app/auth/confirm/route.ts`
> içinde `type === 'recovery'` durumunda hedefi `/reset-password` yapman yeterli.

---

## 3. Change email (E-posta değişikliği)

**Subject:** `Yeni e-posta adresini onayla`

```html
<h2>E-posta adresi değişikliği</h2>

<p>Basements hesabının e-posta adresini değiştirmek istedin. Onaylamak için:</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change"
     style="display:inline-block;padding:12px 22px;background:#5b2eef;color:#ffffff;
            border-radius:10px;font-weight:700;text-decoration:none">
    Yeni adresimi onayla
  </a>
</p>
```

---

## Ayrıca kontrol edilecekler

- **Authentication → URL Configuration → Site URL** = `https://basementonfire.com`
  (`{{ .SiteURL }}` bundan gelir; yanlışsa bağlantılar localhost'a gider)
- **Redirect URLs** listesine `https://basementonfire.com/auth/confirm` ekli olmalı
- Gönderen adı/adresi: varsayılan `noreply@mail.app.supabase.io` görünür.
  Kendi alan adından göndermek için SMTP ayarlanmalı (ayrı iş).

## Zaten gönderilmiş eski bağlantılar ne olacak?

Bir şey yapman gerekmiyor. Eski biçimdeki bağlantıya tıklandığında Supabase
e-postayı **yine de onaylar** (doğrulama Supabase tarafında olur), yalnızca
kullanıcı bizim tarafta oturum açmış olmaz. O kullanıcılar `/login`'den normal
şekilde giriş yapabilir — artık "e-postanı onaylamadın" hatası almazlar.
