# Basementonfire — Gelir/Gider Planı ve İş Modeli

**Hazırlanma tarihi:** 29 Temmuz 2026
**Durum:** BTM (Bilgiyi Ticarileştirme Merkezi) başvurusu — şirket henüz kurulmadı
**Para birimi:** TL (aksi belirtilmedikçe)

> **BU BELGE BİR ŞABLONDUR.** İçindeki tutarlar sıra-büyüklüğü tahminidir ve
> senin gerçek rakamlarınla değiştirilmelidir. Değiştirilmesi gereken her hücre
> `⟨…⟩` ile işaretli. Jüriye **uydurma kesinlik** sunmak, "bilmiyorum" demekten
> daha kötüdür — bir rakamı savunamıyorsan aralık ver ve varsayımını söyle.

---

## 1. Tek cümlelik iş modeli

Ücretsiz ve üyeliksiz interaktif içerikle kitle kuruyoruz; geliri o kitleden
değil, **aynı içeriği kurum içinde kullanmak isteyen eğitim kurumlarından ve
yayıncılardan** alıyoruz.

Bu ayrım önemli: ücretsiz katman pazarlama gideri değil, **ürünün kendisidir**.
B2B müşterisi satın almadan önce ürünün tamamını çalışır hâlde görür.

---

## 2. Gelir akışları

Dört akış var. İlk yıl hedefi 1 ve 3; 2 ve 4 ölçek geldikçe açılır.

### Akış 1 — Kurum lisansı (birincil)

Okul, kolej, dershane ve kurumsal eğitim birimleri için yıllık lisans.
Satılan şey içerik değil, **öğretmenin kullanabildiği sınıf aracı**: simülasyonu
projeksiyona yansıtma, sınıf bazlı quiz atama, öğrenci ilerlemesini görme.

| Paket | Kime | Yıllık liste fiyatı | Not |
|---|---|---|---|
| Sınıf | Tek şube / tek öğretmen | ⟨…⟩ TL | Giriş paketi, kredi kartıyla self-servis |
| Okul | Tek kampüs | ⟨…⟩ TL | Öğrenci sayısına göre kademeli |
| Kurum | Çok kampüslü grup / yayınevi | Teklife bağlı | Yıllık sözleşme, fatura |

**Varsayımlar (değiştir):**
- Ortalama sözleşme büyüklüğü (ACV): ⟨…⟩ TL
- Yenileme oranı: ⟨%…⟩ — ilk yıl için %70 varsaymak temkinli ve savunulabilir
- Satış döngüsü: eğitim kurumlarında **bütçe takvimine bağlıdır** — sözleşmeler
  ağırlıklı olarak Haziran–Eylül arasında imzalanır. Nakit akışı planı bunu
  varsaymalı; yıla eşit yayılmış gelir varsayan bir tablo gerçekçi değildir.

### Akış 2 — Bireysel destek / premium

Reklamsız deneyim, çevrimdışı okuma, kişisel ilerleme raporu, erken erişim.
Aylık ⟨…⟩ TL. **Ana gelir kalemi olarak planlanmıyor**; ücretsiz katmanı
bozmayacak şekilde konumlandırılıyor. Türkiye'de bireysel abonelik dönüşümü
düşüktür; buradan gelen geliri planın belkemiği yapmak hatadır.

### Akış 3 — Sponsorlu / sipariş içerik

Bir kurumun (üniversite, müze, vakıf, teknoloji şirketi) konusunu aynı
interaktif formatta üretmek. Proje başına ⟨…⟩ TL.

Bunun stratejik değeri gelirinden büyük: **hizmet işi, ürünün Ar-Ge'sini
finanse eder.** Her sipariş iş, simülasyon motoruna yeni bir modül kazandırır
ve o modül üründe kalır.

### Akış 4 — Motor lisansı (uzun vade)

Uyarlanabilir simülasyon/render katmanının başka yayıncılara lisanslanması.
3. yıldan önce planlanmıyor, ama **fikri mülkiyet stratejisini bugünden
belirler** (bkz. `fikri-mulkiyet-plani.md`) — motoru ayrı bir bileşen olarak
tutmak, sonradan ayırmaya çalışmaktan çok ucuzdur.

### Akış 5 — Destek ve hibeler (gelir değil, sermaye)

Bunlar satış değildir ama nakit akışının gerçek parçasıdır ve BTM jürisi
duymayı bekler:

| Kaynak | Ne için | Ne zaman |
|---|---|---|
| TÜBİTAK 1512 (BiGG) | Girişimcilik destek programı, sermaye desteği | Şirket kurulmadan başvurulur |
| KOSGEB Ar-Ge ve İnovasyon | Ar-Ge projesi giderleri, personel | Şirket kurulduktan sonra |
| TÜBİTAK 1507 (KOBİ Ar-Ge) | Ar-Ge projesi | KOBİ statüsünden sonra |
| 4691 muafiyetleri | Teknopark'a geçilirse gelir/kurumlar vergisi ve SGK işveren payı istisnası | Teknopark tenancy sonrası |

⚠ Program adları ve koşulları değişir. Başvurmadan önce ilgili kurumun güncel
çağrı metnini teyit et; mülakatta "başvuracağım" demeden önce uygunluk
kriterini okumuş ol — jüri en çok bu noktada açık yakalar.

---

## 3. Gider yapısı

### 3.1 Bugünkü giderler (şirket yok, BTM ön kuluçka)

Bu aşamada yapı **kasıtlı olarak neredeyse sıfır maliyetli**. Bu bir zayıflık
değil, anlatılacak bir güçtür: ürün, dış sermaye olmadan bu noktaya geldi.

| Kalem | Aylık | Yıllık | Not |
|---|---|---|---|
| Alan adı | — | ⟨…⟩ | Yıllık yenileme |
| Barındırma (Netlify) | ⟨…⟩ | ⟨…⟩ | Ücretsiz katman yetiyorsa 0 yaz |
| Veritabanı (Supabase) | ⟨…⟩ | ⟨…⟩ | Ücretsiz katman yetiyorsa 0 yaz |
| Kurumsal e-posta | ⟨…⟩ | ⟨…⟩ | info@basementonfire.com |
| Yapay zekâ / geliştirme araçları | ⟨…⟩ | ⟨…⟩ | |
| Görsel/medya üretim araçları | ⟨…⟩ | ⟨…⟩ | |
| **TOPLAM** | **⟨…⟩** | **⟨…⟩** | |

**Görünmeyen en büyük gider: kurucunun zamanı.** Planda bunu 0 TL göstermek
yaygın ama zayıf bir tercihtir. Kendine piyasa değerinde bir maaş yaz ve
"bu maaş şu an ödenmiyor, bu kadarı özkaynak katkısıdır" de. Jüri bu cümleyi
olgunluk işareti sayar.

### 3.2 Şirket kurulduktan sonra eklenen sabit giderler

| Kalem | Sıklık | Tahmin | Not |
|---|---|---|---|
| Şirket kuruluş (limited) | Bir kez | ⟨…⟩ | Noter, ticaret sicil, imza sirküleri |
| Mali müşavir | Aylık | ⟨…⟩ | Sabit gider, pazarlık edilebilir |
| Damga vergisi, harçlar | Değişken | ⟨…⟩ | |
| Marka tescili | Bir kez (10 yıl) | ⟨…⟩ | Bkz. `fikri-mulkiyet-plani.md` |
| Ofis (BTM/teknopark) | Aylık | ⟨…⟩ | Ön kuluçkada genelde ücretsiz/sembolik |
| Ar-Ge personeli (1. işe alım) | Aylık | ⟨…⟩ | Brüt + SGK işveren payı |

⚠ 2026 fiyatları enflasyona bağlı hızlı değişiyor. Her kalemi **teklif alarak**
doldur; internetten bulunan geçen yılın rakamı mülakatta yanlış çıkar.

---

## 4. Üç yıllık iskelet

Rakamlar değil, **hangi yılda neyin kanıtlanacağı** önemli. Jüriye satılan budur.

### Yıl 1 — Kanıt yılı

**Hedef:** "Bu ürünü bir kurum gerçekten kullanır mı?" sorusunu yanıtlamak.

- Ücretsiz kitleyi büyütmeye devam (içerik + arama trafiği)
- ⟨3–5⟩ pilot okulla **ücretsiz** pilot; karşılığında kullanım verisi ve referans mektubu
- Pilotlardan ⟨1–2⟩'sini ücretli lisansa çevirmek
- Sipariş içerik: ⟨1–2⟩ proje
- Şirket kuruluşu + marka tescili
- **Başarı ölçütü:** ilk ödenen fatura. Tutarı önemsiz, varlığı belirleyici.

### Yıl 2 — Tekrarlanabilirlik yılı

**Hedef:** "Bu satış tekrarlanabiliyor mu?"

- ⟨…⟩ ücretli kurum
- Yenileme oranını ölçebilecek kadar uzun geçmiş
- İlk Ar-Ge personeli
- Hibe/destek programlarından en az biri sonuçlanmış
- **Başarı ölçütü:** başabaş noktasına yaklaşmak, satışın kurucuya bağımlılığının azalması

### Yıl 3 — Ölçek yılı

**Hedef:** "Kurucu olmadan da büyüyor mu?"

- Çok kampüslü / yayınevi ölçeğinde ilk sözleşme
- Motor lisansı ilk görüşmeleri
- Ekip ⟨…⟩ kişi

---

## 5. Başabaş hesabı

Aylık sabit gider **G**, ortalama yıllık kurum lisansı **L** ise başabaş için
gereken müşteri sayısı:

```
Gereken kurum sayısı = (G × 12) / L
```

Bu tek satırı mülakatta **ezbere** söyleyebilmen gerekiyor. Jürinin en sevdiği
soru "kaç müşteriyle kâra geçersin?" ve doğru cevap bir sayı değil, bu formül
artı senin varsayımın.

**Örnek (kendi rakamlarınla değiştir):** aylık gider ⟨…⟩ TL, ortalama lisans
⟨…⟩ TL ise başabaş ≈ ⟨…⟩ kurum.

---

## 6. Bu planın en zayıf üç noktası

Bunları jüri sormadan sen söyle. Kendi zaafını bilen kurucu, zaafı olmadığını
iddia eden kurucudan yüksek puan alır.

1. **Tek kişilik ekip.** Yazılım, içerik, tasarım ve satış aynı kişide. Çözüm:
   1. yılda içerik veya satış tarafından biri için işe alım; hangisinin önce
   geleceğine ilk pilotların sonucu karar verir.
2. **Kanıtlanmış ödeme yok.** Bugüne kadar ürün için para ödeyen kimse yok.
   Bunu gizlemek yerine 1. yılın tek hedefi olarak koy.
3. **Eğitim kurumlarına satış yavaştır.** Bütçe döngüsü yıllık, karar verici
   çoklu. Çözüm: öğretmen düzeyinde ücretsiz kullanımı yaymak, satın alma
   kararını yukarıdan değil aşağıdan tetiklemek.

---

## 7. Mülakatta söylenecek üç sayı

Beş dakikada üç sayı akılda kalır. Şunları seç ve ezberle:

1. **Bugünkü aylık gider** — ne kadar az sermaye yaktığını gösterir
2. **Başabaş için gereken kurum sayısı** — modeli anladığını gösterir
3. **1. yıl sonundaki tek hedef** (ilk ödenen fatura) — odaklandığını gösterir
