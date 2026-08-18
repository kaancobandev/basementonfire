# Auth ayarları — eski projeden alınan envanter

**Bu ayarlar `pg_dump` çıktısında YOKTUR.** Postgres'te değil, platform
yapılandırmasında dururlar. Yeni projede ELLE yeniden kurulacaklar.

Taşınmazsa mevcut kullanıcılar etkilenmez; **yeni kayıt ve şifre sıfırlama**
kırılır — yani en geç fark edilen arıza türü.

Kaynak: eski proje paneli, 15.08.2026.

---

## 1. URL Configuration

| Alan | Değer |
|---|---|
| Site URL | `https://basementonfire.com` |
| Redirect URL 1 | `https://basementonfire.com/**` |
| Redirect URL 2 | `https://basementonfire.com/auth/confirm` |

`Site URL` yalnız yönlendirme için değil: e-posta şablonlarında `{{ .SiteURL }}`
değişkeni olarak da kullanılıyor (aşağıdaki üç Türkçe şablon buna bağlı).

---

## 2. E-posta şablonları

Altı şablonun **üçü özelleştirilmiş (Türkçe)**, üçü Supabase varsayılanı.
Varsayılan olanlar yeni projede zaten doğru gelir; **yalnız üç tanesi taşınacak**.

### 2a. Confirm signup — ÖZEL, TAŞINACAK
Konu: `Basementonfire hesabını onayla`

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

> ⚠ `token_hash` deseni ZORUNLU — `{{ .ConfirmationURL }}` ile değiştirilirse
> `app/auth/confirm/route.ts` token'ı bulamaz ve onay akışı kırılır.

### 2b. Change email address — ÖZEL, TAŞINACAK
Konu: `Confirm Email Change`

```html
<h2>E-posta adresi değişikliği</h2>

<p>Basementonfire hesabının e-posta adresini değiştirmek istedin. Onaylamak için:</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change"
     style="display:inline-block;padding:12px 22px;background:#5b2eef;color:#ffffff;
            border-radius:10px;font-weight:700;text-decoration:none">
    Yeni adresimi onayla
  </a>
</p>
```

### 2c. Reset password — ÖZEL, TAŞINACAK
Konu: `Basementonfire şifreni sıfırla`

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

> Bu şablon `token_hash` DEĞİL `{{ .ConfirmationURL }}` kullanıyor — kayıt
> şablonundan farklı ve bu DOĞRU; `app/reset-password/page.tsx` bu akışa göre
> yazılmış. Birbirine benzetip "tutarlı olsun" diye değiştirme.

### 2d–2f. Varsayılan kalanlar — taşınmasına gerek yok
`Invite user`, `Magic link or OTP`, `Reauthentication` — üçü de İngilizce
Supabase varsayılanı, değiştirilmemiş.

---

## 3. SMTP ayarları

| Alan | Değer |
|---|---|
| Enable custom SMTP | **AÇIK** |
| Sender email | `info@basementonfire.com` |
| Sender name | `Basementonfire` |
| Host | `smtp.gmail.com` |
| Port | `587` |
| Minimum interval per user | `60` saniye |
| Username | `info@basementonfire.com` |
| Password | **PANELDEN OKUNAMIYOR** |

> ⚠⚠ **PAROLA GERİ ALINAMIYOR.** Panel açıkça yazıyor: *"For security reasons,
> this password cannot be viewed once saved."* Bu bir Gmail **uygulama parolası**.
> Kesimden ÖNCE elinde olduğundan emin ol; yoksa Google hesabından yeni bir
> uygulama parolası üret. Bu olmadan yeni projede SMTP kurulamaz ve **hiçbir auth
> e-postası gitmez** — kayıt onayı, şifre sıfırlama, e-posta değişikliği.
>
> Panelin kendi uyarısı da duruyor: Gmail SMTP işlemsel e-posta için tasarlanmadı,
> teslimat etkilenebilir. Bu göçün konusu değil, ama not düşülsün.

---

## 4. Sign In / Providers

| Ayar | Değer |
|---|---|
| Allow new users to sign up | **AÇIK** |
| Allow manual linking | kapalı |
| Allow anonymous sign-ins | kapalı |
| Confirm email | **AÇIK** |

**Auth Providers:** yalnız `Email` **Enabled**. Diğerlerinin tamamı disabled
(Phone, SAML, Web3, Apple, Azure, Bitbucket, Discord, Facebook, Figma, …).

> Üçüncü taraf sağlayıcı KULLANILMIYOR — bu iyi haber: Supabase'in bölge
> değiştirme dokümanındaki "client id/secret çiftlerini elle yeniden girin"
> uyarısı bu proje için geçersiz.

---

## Kesim günü kontrol listesi

- [ ] Site URL girildi
- [ ] İki redirect URL girildi
- [ ] Confirm signup şablonu yapıştırıldı (`token_hash` deseni korundu)
- [ ] Change email şablonu yapıştırıldı
- [ ] Reset password şablonu yapıştırıldı
- [ ] SMTP açıldı, parola girildi
- [ ] Confirm email AÇIK
- [ ] Allow new users to sign up AÇIK
- [ ] Test: yeni kayıt → onay e-postası geldi mi
- [ ] Test: şifre sıfırlama → e-posta geldi mi
