# Basementonfire — Proje Özeti

**Görüşme TELEFONDA olacağı için bu sayfa artık masaya bırakılmıyor —
görüşmeden hemen sonra e-postayla gönderilecek.** Bu onu daha da önemli
kılıyor: telefonda gösteremediğin her şeyin tek telafisi bu.

- PDF olarak gönder (Word/Markdown değil), üstünde logo ve `basementonfire.com`
- E-postaya site bağlantısını ve doğrudan bir makale bağlantısını da koy —
  jürinin simülasyonu kendi eliyle çalıştırması, anlattığın her şeyden değerli
- Görüşmede *"isterseniz özeti e-postayla göndereyim"* de ve **aynı gün gönder**

Tüm rakamlar dolduruldu ve koddan/faturalardan doğrulandı (30.07.2026).

---

## Basementonfire
**Bilimi ve tarihi, okunacak metin olmaktan çıkarıp çalıştırılacak bir şeye dönüştürüyoruz.**

`basementonfire.com` · info@basementonfire.com · Kaan Çoban

---

### Problem

Türkçe bilim ve tarih içeriği ya uzun bir duvar metni ya da bir video. İkisinde
de okuyucu izleyicidir — bir şeyi deneyemez, bir değişkeni değiştiremez, sonucu
kendi göremez. Öğrenmenin kalıcılığını belirleyen şey ise tam olarak budur.

Aynı içeriği sınıfta kullanmak isteyen öğretmenin elinde de araç yok: mevcut
kaynaklar ya İngilizce, ya statik, ya da kurulum gerektiriyor.

### Çözüm

Her makalenin anlattığı mekanizmayı, tarayıcıda çalışan bir simülasyona
dönüştüren bir yayın platformu. Kurulum yok, eklenti yok, güçlü bilgisayar
gerekmiyor. Kuşatmayı yönetiyorsun, deneyi çalıştırıyorsun, dozu hesaplıyorsun.

Bugün **33 uzun makale**, **6 konu başlığı**, tamamı Türkçe ve ücretsiz.

### Ar-Ge yönü — asıl teknik katkı

Bir fizik simülasyonunu ucuz bir telefonda akıcı çalıştırmak, içerik üretmekten
zor bir problemdir. Geliştirdiğimiz **uyarlanabilir render katmanı** bunu
tahminle değil ölçümle çözüyor:

**1 · Cihaz sınıflandırma** — sahne kurulmadan önce donanım sınıflanır:
işlemci çekirdeği, bellek, işaretleyici türü, ekran kısa kenarı. Sonuca göre
piksel oranı tavanı **1,0× / 1,5× / 1,75×** olarak belirlenir; geometri
yoğunluğu, parçacık sayısı ve pahalı materyal katmanları buna göre kurulur.

**2 · Kare süresi bekçisi** — sahne çalışırken cihazın kendi kare süresi ölçülür:

| Eşik | Değer | Ne olur |
|---|---|---|
| Isınma penceresi | **ilk 60 kare** | Sayılmaz — hidrasyon ve görsel çözme her cihazda yavaştır |
| Aykırı değer | **> 200 ms** | Atılır — çizim maliyeti değil (sekme kısıtlaması, çöp toplama) |
| Ölçüm penceresi | **90 kare** | Ortalama bu pencerede alınır |
| Birinci kademe | ortalama **> 26 ms** (< 38 fps) | Çözünürlük düşürülür |
| İkinci kademe | ortalama **> 30 ms** (< 33 fps) | Animasyon son karesinde dondurulur |

Isınma penceresi olmadan sağlam telefonlar da haksız yere kısıtlanıyordu;
eşik değerleri ölçümle bulundu.

Sonuç: hiçbir cihazda donma yaşanmaz ve karar, cihaz modeli listesiyle değil
**o cihazın kendi ölçümüyle** verilir. Bu yöntem tekrar kullanılabilir bir
modül olarak tasarlandı; bağımsız lisanslanabilir.

Üzerine bir **ölçüm katmanı** kurulu: okuma ilerlemesi, makale sonu quiz,
karar noktası oyları. Bunlar kişiselleştirilmiş öğrenme yolunun ve okuyucunun
nerede kaybolduğunu görmenin temeli.

### Mevcut durum — kanıt

| | |
|---|---|
| Yayındaki makale | 33, 6 konu başlığında |
| Kod tabanı | 64.100 satır TypeScript, 368 commit, 888 dosya |
| Zaman çizelgesi | Alan adı 2024 · aktif geliştirme Eylül 2025 · mevcut kod tabanı Haziran 2026'dan beri, tek kişi |
| Dış sermaye | Yok — bugüne kadar tamamı özkaynak |
| Arama görünürlüğü | Bu ay açıldı; son 10 günde gösterim 0 → günde ~15 |

⚠ **Toplam ziyaretçi / üye sayısı YAZMA.** Rakamlar henüz küçük ve tek başına
yazılınca projeyi olduğundan zayıf gösterir. Yukarıdaki gibi *eğilim* yaz.
Sorulursa dürüst cevapla — ama sayfada kendiliğinden durmasın.

Platform KVKK ve GDPR uyumlu olarak inşa edildi: çerezsiz ziyaretçi sayacı,
ham IP saklamayan ölçüm, veri indirme ve hesap silme, dört ayrı hukuki metin.

### Ticarileşme

**Ücretsiz katman pazarlama gideri değil, ürünün kendisi.** Gelir, okuyucudan
değil kurumdan geliyor:

1. **Kurum lisansı (birincil)** — **dershane zincirleri ve yayınevlerine** yıllık
   lisans. Dershane en hızlı karar veren kanal; yayınevinin ise dağıtımı çözülmüş
   ve bu içeriği kendisi üretemiyor. *(Kuruma özel araçlar henüz yazılmadı —
   ihtiyaç, süren görüşmelerde belirlenecek.)*
2. **Sipariş içerik** — **TÜBİTAK popüler bilim yayınları** gibi kurumlar için
   aynı formatta içerik üretimi. Her sipariş, motora kalıcı bir modül kazandırır.

3. **Motor lisansı (uzun vade)** — uyarlanabilir render katmanının diğer
   yayıncılara lisanslanması.

⚠ Devlet okulu hedeflenmiyor: dijital içerik alım kararı okul müdüründe değil,
MEB düzeyinde.

**1. yılın hedefi:** 3 pilot kurum, 2'sini ücretli lisansa çevirmek. Bu, ürünü
ayakta tutan altyapı maliyetini (yıllık 18.104 ₺) karşılar. Geliştirme araçları
dahil tam başabaş 2. yılın hedefi.

### Neden BTM

- **Ar-Ge personeli istihdamı** — geliştirmenin tek kişiye bağımlılığını kırmak
- **Üniversite bağlantısı** — içerik doğrulaması için akademik hakemlik
- **Destek programlarına erişim** — TÜBİTAK ve KOSGEB çağrılarına uygun yapı
- **İlk kurumsal müşteriye ulaşım** — eğitim kurumlarıyla temas ağı

### Talep

BTM ön kuluçka programına kabul. Beklentimiz üç başlıkta:

1. **Ar-Ge personeli istihdamını mümkün kılan yapı** — proje bugün tek kişiye
   bağımlı ve en büyük riski bu
2. **Akademik hakemlik bağlantısı** — içeriğin bilimsel denetimi hem kaliteyi
   hem kurumsal satışı güçlendiriyor
3. **İlk kurumsal müşteriye erişim** — eğitim kurumları ve yayıncılarla temas ağı

---

*Ek belgeler: teknoloji dokümanı `basementonfire.com/teknoloji` · gelir-gider
planı · fikri mülkiyet planı · canlı demo*
