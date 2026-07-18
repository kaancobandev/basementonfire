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

---

# Gönderen adresi: info@basementonfire.com (özel SMTP)

Varsayılan gönderici `noreply@mail.app.supabase.io`. Üretim için **uygun değil**:
Supabase'in yerleşik SMTP'si düşük saatlik limitle gelir ve limit dolunca
mailler **sessizce gitmez** — birkaç kişi arka arkaya kayıt olursa onay maili
hiç ulaşmaz ve hiçbir yerde hata görünmez.

**Ölçüldü (2026-07-18):** alan adının MX kaydı `smtp.google.com` → posta Google
Workspace'te. Ama **SPF kaydı YOK**, DMARC de yok (TXT'de yalnızca
`google-site-verification` var).

## Adım 1 — DNS (bunlar olmadan diğer adımlar boşa gider)

Alan adı DNS panelinde:

| Tip | Ad | Değer |
|-----|-----|-------|
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@basementonfire.com` |

DKIM ayrıca **Google Admin → Apps → Google Workspace → Gmail → Authenticate
email** üzerinden açılır; orada üretilen TXT kaydını (`google._domainkey`)
DNS'e eklemek gerekir.

DMARC'ı `p=none` ile başlat: yalnızca rapor toplar, hiçbir maili engellemez.
Raporlar temiz gelince `p=quarantine`'e çekilebilir.

## Adım 2 — Google'da uygulama şifresi

Google Hesabı → Güvenlik → 2 Adımlı Doğrulama (açık olmalı) → **Uygulama
şifreleri** → yeni şifre üret.

> Bu şifre normal hesap şifresi DEĞİLDİR ve yalnızca SMTP için geçerlidir.
> Doğrudan Supabase paneline yapıştırılır; başka hiçbir yere yazılmamalı.

## Adım 3 — Supabase SMTP ayarı

Supabase → **Project Settings → Authentication → SMTP Settings** → Enable
Custom SMTP:

| Alan | Değer |
|------|-------|
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | `info@basementonfire.com` |
| Password | (Adım 2'deki uygulama şifresi) |
| Sender email | `info@basementonfire.com` |
| Sender name | `Basements` |

Aynı ekrandaki **Rate limit** değerini de yükselt (varsayılan çok düşüktür).

Google Workspace günlük ~2.000 mesaja izin verir — bu ölçek için fazlasıyla yeter.

## Adım 4 — Doğrula

Yeni bir hesapla kayıt ol, gelen mailde şunlara bak:
- Gönderen `Basements <info@basementonfire.com>` görünüyor mu
- Gmail'de mesajı aç → ⋮ → **Orijinali göster** → `SPF: PASS`, `DKIM: PASS`
- Spam'e düşmüyor mu

## Alternatif: transactional servis

Hacim büyürse (veya Google throttle etmeye başlarsa) Resend / Brevo / Mailgun
gibi bir servis daha uygun olur: teslimat panosu, bounce yönetimi, daha yüksek
limit. Kurulum aynı yerden yapılır, yalnızca host/port/kullanıcı değişir.
Şu anki hacimde gerekli değil.

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
