# Basementonfire — Proje Özeti

**Görüşme TELEFONDA olacağı için bu sayfa artık masaya bırakılmıyor —
görüşmeden hemen sonra e-postayla gönderilecek.** Bu onu daha da önemli
kılıyor: telefonda gösteremediğin her şeyin tek telafisi bu.

- PDF olarak gönder (Word/Markdown değil), üstünde logo ve `basementonfire.com`
- E-postaya site bağlantısını ve doğrudan bir makale bağlantısını da koy —
  jürinin simülasyonu kendi eliyle çalıştırması, anlattığın her şeyden değerli
- Görüşmede *"isterseniz özeti e-postayla göndereyim"* de ve **aynı gün gönder**

⟨…⟩ ile işaretli yerleri kendi rakamlarınla doldur; doldurulmamış tek bir alan
bile kalmasın.

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

1. **Cihaz sınıflandırma** — sahne kurulmadan önce donanım kabaca sınıflanır;
   piksel oranı, geometri yoğunluğu ve materyal katmanları buna göre belirlenir.
2. **Kare süresi bekçisi** — sahne çalışırken cihazın kendi kare süresi ölçülür.
   Isınma penceresi ve aykırı değerler ayıklanır. Yavaşlarsa çözünürlük düşer;
   hâlâ yavaşsa animasyon son karesinde dondurulur ve durağan bir görsele
   dönüşür.

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
| Kod tabanı | ⟨62.500+⟩ satır TypeScript, ⟨347⟩ commit, ⟨858⟩ dosya |
| Geliştirme süresi | ⟨…⟩ ay, tek kişi |
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

1. **Kurum lisansı (birincil)** — okul, kolej, dershane ve yayınevlerine yıllık
   lisans: sınıf içi kullanım, quiz atama, öğrenci ilerlemesi.
2. **Sipariş içerik** — üniversite, müze ve kurumlar için aynı formatta
   içerik üretimi. Her sipariş, motora kalıcı bir modül kazandırır.
3. **Motor lisansı (uzun vade)** — uyarlanabilir render katmanının diğer
   yayıncılara lisanslanması.

**1. yılın tek hedefi:** ⟨3–5⟩ pilot okul, en az ⟨1⟩ ödenen fatura.

### Neden BTM

- **Ar-Ge personeli istihdamı** — geliştirmenin tek kişiye bağımlılığını kırmak
- **Üniversite bağlantısı** — içerik doğrulaması için akademik hakemlik
- **Destek programlarına erişim** — TÜBİTAK ve KOSGEB çağrılarına uygun yapı
- **İlk kurumsal müşteriye ulaşım** — eğitim kurumlarıyla temas ağı

### Talep

⟨BTM ön kuluçka programına kabul / ofis tahsisi⟩ ve mentorluk desteği.

---

*Ek belgeler: teknoloji dokümanı `basementonfire.com/teknoloji` · gelir-gider
planı · fikri mülkiyet planı · canlı demo*
