// Periyodik tablo makalesinin TÜM anlatı içeriği. 'use client' YOK — düz modül.
// 118 elementin verisi burada DEĞİL, elements.ts'te (otomatik üretiliyor).
//
// ══ MAKALENİN TEZİ ══
// Periyodik tablo bir dolap değil, bir TAHMİN MAKİNESİDİR — ama arızalı çalışan
// bir makine. Aynı yöntem galyumu, skandiyumu ve germanyumu ısabet ettirdi ve
// hiç bulunamayan on dört hayalet element üretti; Lente'nin hükmü: isabet oranı
// %50'nin ALTINDA. Farkı yaratan şey nettir: komşuları ORTALAMAK (interpolasyon)
// tuttu, serinin dışına UZANMAK (ekstrapolasyon) hayalet doğurdu.
//
// ══ ÜÇ KURAL ══
// 1. Mendeleyev kahraman İLAN EDİLMEZ. Perde 2 faturayı tam olarak keser.
// 2. Her sayının kaynağı bellidir. "Yaklaşık", "birçok" gibi sıfat yok.
// 3. Bilim BİTMİŞ gösterilmez: 3. grup hâlâ karara bağlanmadı, Madelung kuralı
//    ilk ilkelerden türetilmiş değil, tablonun sonu bilinmiyor.

/* ══════════════ PERDE 1 · BAHİS ══════════════ */

export const KARLSRUHE = {
  yil: 1860,
  yer: 'Karlsruhe',
  olay:
    'Kimyacılar ilk kez uluslararası bir kongrede toplandı ve tek bir soruyu çözmeye çalıştı: bir atomun ağırlığını nasıl ölçeriz? Kongreden tutarlı bir atom ağırlıkları listesi çıktı.',
  yorum:
    'Salondaki genç Rus kimyager o listeyi cebine koyup ülkesine döndü. Dokuz yıl sonra aynı listeyi kartlara yazıp masaya dizecekti.',
} as const;

/** eka-silisyum (1871 TAHMİNİ) vs germanyum (1886 ÖLÇÜMÜ) — makalenin imza anı. */
export const EKA_SILISYUM = {
  tahminYil: 1871,
  olcumYil: 1886,
  kesfeden: 'Clemens Winkler',
  satirlar: [
    { ozellik: 'Atom ağırlığı', tahmin: '≈ 72', gercek: '72,59', tutti: true },
    { ozellik: 'Görünüm', tahmin: 'koyu gri metal', gercek: 'gri metal', tutti: true },
    { ozellik: 'Yoğunluk', tahmin: '5,5 g/cm³', gercek: '5,47 g/cm³', tutti: true },
    { ozellik: 'Erime noktası', tahmin: '"yüksek"', gercek: '958 °C', tutti: true },
    { ozellik: 'Özgül ısı', tahmin: '0,31 J/g·°C', gercek: '0,32 J/g·°C', tutti: true },
    { ozellik: 'Oksitin formülü', tahmin: 'EO₂', gercek: 'GeO₂', tutti: true },
    { ozellik: 'Oksitin yoğunluğu', tahmin: '4,7', gercek: '4,70 g/cm³', tutti: true },
    { ozellik: 'Klorürün formülü', tahmin: 'ECl₄', gercek: 'GeCl₄', tutti: true },
    { ozellik: 'Klorürün kaynama n.', tahmin: '< 100 °C', gercek: '86 °C', tutti: true },
    { ozellik: 'Klorürün yoğunluğu', tahmin: '1,9', gercek: '1,88', tutti: true },
    { ozellik: 'Saf elde ediliş', tahmin: 'K₂EF₆ + sodyum', gercek: 'K₂GeF₆ + sodyum', tutti: true },
    { ozellik: 'Sülfür', tahmin: 'ES₂, suda çözünmez', gercek: 'GeS₂, suda çözünmez', tutti: true },
  ],
  kapanis:
    'On iki satır, on iki isabet. Winkler elementi bulduğunda Mendeleyev’in on beş yıl önce yazdığı tarifi okuyordu.',
} as const;

export const YONTEM = {
  baslik: 'Yöntem sihir değildi: ortalama almaktı',
  ornekler: [
    { ad: 'eka-bor', hesap: '½ (Ca + Ti) = ½ (40 + 48)', sonuc: '44', gercek: 'Skandiyum, 44,96 (1879)' },
    { ad: 'eka-alüminyum', hesap: '⅓ (Al + Zn + In) = ⅓ (27,3 + 65 + 113)', sonuc: '68,4 → "≈ 68"', gercek: 'Galyum, 69,72 (1875)' },
    { ad: 'eka-silisyum', hesap: '¼ (eka-Al + As + Si + Sn) = ¼ (68 + 75 + 28 + 118)', sonuc: '72,25 → "≈ 72"', gercek: 'Germanyum, 72,63 (1886)' },
  ],
  not:
    'Boş karenin komşularını topla, ortalamasını al. Tablonun düzeni doğruysa ortalama da doğru olur. Mendeleyev bunu atom hacmi için de yaptı ve orada da tutturdu.',
} as const;

export const LECOQ = {
  yil: 1875,
  olay:
    'Lecoq de Boisbaudran galyumu buldu ve yoğunluğunu 4,7 g/cm³ olarak yayımladı. Mendeleyev tabloya bakıp ona mektup yazdı: bu değer yanlış olmalı, yeniden ölç.',
  sonuc:
    'Lecoq örneğini saflaştırıp yeniden ölçtü. Yeni değer 5,9 çıktı — Mendeleyev’in tahmin ettiği 6,0’a neredeyse tam.',
  yorum:
    'Bir kimyager, elinde tutmadığı bir elementin yoğunluğunu, onu keşfeden adamdan daha doğru biliyordu. Tabloya güveniyordu.',
} as const;

/* ══════════════ PERDE 2 · FATURA ══════════════ */

/** Hiç bulunamayan tahminler — Lente 2019, Tablo 3. */
export const HAYALETLER = [
  { ad: 'Newtonyum (eter)', agirlik: '0,17', neden: 'Hidrojenden hafif olacaktı' },
  { ad: 'Koronyum', agirlik: '0,4', neden: 'Güneş tacındaki yeşil çizgiyi açıklayacaktı' },
  { ad: 'eka-seryum', agirlik: '54', neden: 'Nadir toprak boşluğu' },
  { ad: 'eka-molibden', agirlik: '140', neden: 'Nadir toprak boşluğu' },
  { ad: 'eka-niyobyum', agirlik: '146', neden: 'Nadir toprak boşluğu' },
  { ad: 'eka-kadmiyum', agirlik: '155', neden: 'Nadir toprak boşluğu' },
  { ad: 'eka-iyot', agirlik: '170', neden: 'Nadir toprak boşluğu' },
  { ad: 'eka-sezyum', agirlik: '175', neden: 'Nadir toprak boşluğu' },
] as const;

export const FATURA = {
  bulunan: 10,
  bulunamayan: 14,
  hukum: 'his success rate at the predictions was worse than 50%',
  kaynak: 'Gábor Lente, ChemTexts (2019)',
  kokNeden:
    'Hataların neredeyse tamamı tek bir yere bakıyor: Mendeleyev nadir toprak metallerini — bugünkü lantanitleri — sisteme yerleştiremedi. Sıra sıra boşluk açtı, hiçbiri dolmadı.',
} as const;

export const NEWTONYUM = {
  baslik: 'Neden hidrojenden hafif element aradı?',
  metin:
    'Mendeleyev, "bütün elementler aslında hidrojenden yapılmıştır" diyen Prout hipotezine şiddetle karşıydı. Onu çürütmenin yolu, hidrojenden daha hafif bir element göstermekti. 1902-1904 arasında yazdığı elli sayfalık bir makalede iki tane önerdi: newtonyum ve koronyum. İkisini de "sıfırıncı grup" soy gaz olarak konumlandırdı.',
  hesap:
    'Hesabı gizlemedi: soy gazların ağırlık oranlarını sıraladı (Xe:Kr = 1,56 · Kr:Ar = 2,15 · Ar:He = 9,5) ve seriyi ikinci derece bir parabolle geriye doğru uzattı. He:x = 23,6 çıktı, oradan x = 0,17.',
  ders:
    'Aynı adam, aynı tablo, aynı aritmetik. Fark yönde: komşuların ARASINI doldurmak (interpolasyon) tuttu, serinin DIŞINA uzanmak (ekstrapolasyon) hayalet üretti.',
  koronyumSon:
    'Koronyum’un açıklayacağı 531,68 nm’lik yeşil taç çizgisinin, 1939’da on üç kez iyonlaşmış demir olduğu gösterildi.',
} as const;

export const TELLUR = {
  baslik: 'Ve sıralama ilkesinin kendisi yanlıştı',
  metin:
    'Mendeleyev 1869 makalesinde şunu yazdı: bazı atom ağırlıkları düzeltilmeli, tellür 128 değil 123-126 olmalı. Çünkü tabloda tellür iyottan önce gelmeliydi ve ağırlığı buna izin vermiyordu.',
  gercek: 'Tellürün gerçek atom ağırlığı 127,60. Ölçüm doğruydu.',
  cozum:
    'Yanlış olan sıralama ilkesiydi. 1913’te Henry Moseley, X-ışını çizgilerinin frekansının tek bir tam sayıya bağlandığını gösterdi: atom numarası. Elementler ağırlığa göre değil, PROTON SAYISINA göre sıralanıyordu. Argon-potasyum, kobalt-nikel ve tellür-iyot ters çiftleri aynı anda çözüldü.',
  denge:
    'Aynı Mendeleyev, tabloya dayanarak bilinen elementlerin ağırlıklarını da düzeltti ve haklı çıktı: indiyum 75,6’dan 113’e, berilyum 13,5’ten 9’a. 1871 tablosunda itriyum, indiyum, seryum ve toryumun ağırlıkları doğrudur.',
} as const;

export const NOBEL = {
  metin:
    '1906’da Nobel Kimya komitesi Mendeleyev’i dörde bir oyla önerdi. Akademinin kimya bölümü oyu Henri Moissan’a çevirdi. Mendeleyev 2 Şubat 1907’de öldü; Moissan on sekiz gün sonra. Mendeleyev Nobel almadı.',
} as const;

/* ══════════════ PERDE 3 · HÂLÂ BİTMEDİ ══════════════ */

export const SEKIL = {
  baslik: 'Tablonun şekli neden böyle?',
  kok:
    'Tek bir kısıt her şeyi belirliyor: bir elektronun açısal momentum sayısı ℓ, baş kuantum sayısı n’den küçük olmak zorunda (ℓ ≤ n−1). n = 1 için yalnız ℓ = 0 var — yani 1p orbitali YOKTUR.',
  sonuc: 'İlk satırın sadece hidrojen ve helyumdan oluşmasının sebebi bu. Şeklin kendisi kuantum mekaniğinin görünür hâli.',
  bloklar: 'Blok genişlikleri orbital kapasiteleridir: s = 2, p = 6, d = 10, f = 14. Periyot uzunlukları buradan çıkar: 2, 8, 8, 18, 18, 32, 32.',
  lantanit:
    'Lantanitlerin aşağı sarkması ise tamamen TİPOGRAFİK. f-bloğu aslında 2. ve 3. grupların arasına oturur; tabloyu 32 sütun yerine 18 sütunda basabilmek için alta indiriliyor. Charles Janet’nin "sol-adım" tablosunda böyle bir sarkma yok.',
} as const;

export const MADELUNG = {
  baslik: 'Ama kural türetilmiş değil',
  metin:
    'Doldurma sırasını Madelung (n+ℓ) kuralı verir: artan n+ℓ sırasına göre, eşitlikte küçük n önce. Kural işe yarıyor. Sorun şu ki bu kural ilk ilkelerden TÜRETİLMİŞ değil — ampirik bir gözlem, ve yaklaşık yirmi istisnası var.',
  istisnalar: ['Krom', 'Bakır', 'Niyobyum', 'Molibden', 'Rutenyum', 'Rodyum', 'Paladyum', 'Gümüş', 'Platin', 'Altın'],
  hukum:
    '"Tablo kuantum mekaniğinden çıkar" cümlesi bu yüzden tam doğru değil. Tablo hâlâ tam olarak açıklanmış DEĞİL.',
} as const;

export const GRUP3 = {
  baslik: 'IUPAC hâlâ karar veremedi',
  soru: '3. grubun altına lantan mı yazılacak, lutesyum mu?',
  metin:
    'Tartışma 1948’de başladı, 1982’de genişledi, 1988’de IUPAC raporu Sc-Y-Lu-Lr biçimini destekledi. 2015’te Eric Scerri başkanlığında bir IUPAC projesi kuruldu.',
  // Alıntı okura TÜRKÇE gösterilir; özgün İngilizce cümle hemen altında durur,
  // çünkü bu bir kurum belgesinden birebir alıntı ve çeviri okurun eline
  // kaynağı doğrulama imkânı bırakmalı.
  alinti: '3. grubun Sc, Y, La ve Ac’den mi yoksa Sc, Y, Lu ve Lr’den mi oluştuğuna karar vermenin nesnel bir yolu yok.',
  alintiOrijinal: 'there is no objective means to adjudicate between group 3 consisting of Sc, Y, La and Ac or as Sc, Y, Lu and Lr',
  alintiKaynak: 'IUPAC geçici raporu, 2021 · İngilizce özgün metinden çevrildi',
  uzlasi:
    'Rapor uzlaşı olarak Sc-Y-Lu-Lr’yi öneriyor: atom numarası dizisini bozmayan, d bloğunu iki eşitsiz parçaya ayırmayan ve blok genişliklerini kuantumun dayattığı 2/6/10/14’te tutan tek biçim bu.',
  turkiye:
    'Bu yazıdaki tablo geleneksel biçimi kullanıyor — 3. grupta lantan ve aktinyum duruyor. Sebebi yerel: Türkiye Kimya Derneği’nin resmî Türkçe tablosu da böyle basılıyor. Yani okuduğun tablo, hâlâ sürmekte olan bir tartışmanın bir tarafında duruyor.',
} as const;

export const OGANESSON = {
  baslik: 'Ne soy, ne gaz',
  uretilen: 3,
  yariOmur: '0,7 milisaniye',
  metin:
    'Bugüne kadar toplam üç atom oganesson üretildi ve her biri bir milisaniyeden kısa yaşadı. Tabloda soy gazların altında duruyor ama teorik hesaplar oda sıcaklığında KATI olacağını söylüyor — ve bir yarı iletken.',
  derin:
    'Daha da tuhafı: bu kadar ağır bir çekirdekte spin-yörünge ayrılması elektron kabuklarını bulanıklaştırıyor, elektron yoğunluğu atoma neredeyse düzgün dağılıyor. 118’de "kabuk" kavramının kendisi erimeye başlıyor — yani tablonun dayandığı fikir, tablonun sonunda çalışmayı bırakıyor.',
} as const;

export const YARIS = {
  baslik: '119 nerede?',
  riken: {
    yer: 'RIKEN Nishina Merkezi, Japonya',
    demet: 'Vanadyum-51',
    hedef: 'Küryum-248',
    siddet: 'saniyede 6 trilyondan fazla atom',
    tekerlek: 'hedef tekerleği dakikada ~2000 devir, 500-1000 °C',
    beklenti: 'istenen çarpışma yaklaşık 200 günde bir gerçekleşiyor',
  },
  berkeley: {
    yer: 'Lawrence Berkeley, ABD',
    sonuc: '22 günde 2 atom livermoryum-290 (2024)',
    onem: 'Kalsiyum-48 dışında bir demetle süperağır üretilebildiğinin ilk kanıtı',
    zorluk: 'Element 120, element 116’dan 10-20 kat daha zor; tek bir atom için yaklaşık 220 gün demet süresi',
  },
} as const;

export const SON = {
  baslik: 'Tablonun bir sonu var mı?',
  naif: 'Basit Dirac hesabı Z > 137’de çöker — "feynmanyum" sınırı. Ama bu, çekirdeği noktasal saymaktan gelen bir yanılgı.',
  gercek:
    'Çekirdeğin gerçek boyutu hesaba katıldığında sınır Z = 168-172 civarına çıkıyor. Pekka Pyykkö, Dirac-Fock hesaplarıyla Z ≤ 172’ye kadar uzanan bir tablo önerdi: 54 element daha, ve içinde bugün var olmayan bir "g bloğu".',
  ada: 'Kararlılık adası Z = 114-126 ve N = 184-196 aralığında bekleniyor. Henüz kıyısına varılmadı.',
} as const;

/* ══════════════ RELATİVİTE — günlük hayatta ══════════════ */

export const RELATIVITE = {
  baslik: 'Arabanın aküsünün 10 voltu Einstein’dan geliyor',
  altin: 'Altının sarı olması relativistik bir etki: ağır çekirdeğin yanında hızlanan elektronlar 6s yörüngesini kararlaştırıyor, uyarım enerjisi mordan görünür bölgeye iniyor ve altın maviyi yutuyor. Gümüş bunu yapmaz, o yüzden gümüş renksizdir.',
  civa: 'Cıvanın oda sıcaklığında sıvı olması aynı köke dayanıyor.',
  aku:
    'Ve en somutu: kurşun-asit akünün hücre başına 2,1 voltunun 1,7-1,8 voltu relativistik etkilerden geliyor. Yani 12 voltluk araba aküsünün yaklaşık 10 voltunu özel görelilik taşıyor.',
  kaynak: 'Ahuja ve ark., Physical Review Letters 106, 018301 (2011)',
} as const;

/* ══════════════ TÜRKİYE ══════════════ */

export const TURKIYE = {
  bor: {
    baslik: 'Bor',
    metin: 'Dünya bor rezervinin yaklaşık %73’ü Türkiye’de — kabaca 3,3 milyar ton. Eti Maden küresel bor pazarının yaklaşık %61’ini elinde tutuyor.',
    ironi: 'Küçük bir ironi: Mendeleyev’in en temiz isabeti "eka-bor"du — yani boron’un bir alt komşusu. Skandiyum çıktı.',
  },
  lantanit: {
    baslik: 'Lantanitler',
    metin: 'Eskişehir Beylikova sahası 694 milyon ton olarak açıklandı. Yani 3. grup tartışmasının tam ortasındaki blok, coğrafi olarak da buralarda.',
  },
  kitap: {
    baslik: 'Tablodan yirmi bir yıl önce',
    metin: 'İlk Osmanlı Türkçesi kimya kitabı, Derviş Paşa’nın "Usûl-i Kimya"sı, 1847-48’de İstanbul’da basıldı — Mendeleyev’in tablosundan yaklaşık yirmi bir yıl önce. 1871’de Kırımlı Aziz Bey, kimya sembollerinin Latin harfleri yerine Osmanlı harfleriyle yazılmasını önerdi ve bütün denklemleri öyle yazdı.',
  },
  // NOT: burada bir `yok` bloğu vardı ("Tabloda Türkiye'ye adanmış element yok…").
  // 2026-08-10'da kullanıcı isteğiyle kaldırıldı. Geri istenirse git geçmişinde.
} as const;

/* ══════════════ KARAR DÜĞÜMLERİ (anket) ══════════════ */
// ⚠ Seçenek id'leri lib/polls.ts ile BİREBİR aynı olmalı. Uyuşmazlık sessizce
// "oy gitmedi" olarak görünür, hata vermez.

export const BOSLUK_KARARI = {
  pollKey: 'periyodik-bosluk',
  yil: 1869,
  soru: 'Elindeki tablo tellürü iyottan sonraya atıyor. Ne yaparsın?',
  olay:
    'Atom ağırlığına göre sıralarsan tellür (128) iyottan (127) sonra gelir. Ama kimyasal davranışları bunun tersini söylüyor: tellür selenyumun altına, iyot bromun altına oturmalı. Ölçüm mü yanlış, tablo mu?',
  secenekler: [
    { id: 'olcum', label: 'Ölçüm yanlıştır — tellür daha hafif olmalı' },
    { id: 'sirala', label: 'Ağırlığa uy, tabloyu boz' },
    { id: 'bosluk', label: 'Aralarına bulunmamış bir element koy' },
    { id: 'baska', label: 'Sıralama ilkesi ağırlık olmayabilir' },
  ],
  gercek: 'olcum',
  sonuc:
    'Mendeleyev ölçümün yanlış olduğunu söyledi ve yanıldı — tellür gerçekten 127,60. Doğru cevap dördüncü şıktı: sıralama ilkesi ağırlık değil, proton sayısıydı. Ama bunu söyleyebilmek için Moseley’i ve 1913’ü beklemek gerekiyordu.',
} as const;

export const ADLANDIRMA_KARARI = {
  pollKey: 'periyodik-adlandirma',
  yil: 1997,
  soru: '104, 105 ve 106 numaralı elementleri kim adlandırmalı?',
  olay:
    'Soğuk Savaş boyunca Amerikan ve Sovyet laboratuvarları aynı elementleri keşfettiklerini iddia etti ve birbirinden farklı adlar verdi. "Transfermiyum savaşları" otuz yıl sürdü.',
  secenekler: [
    { id: 'ilk', label: 'İlk yayımlayan laboratuvar' },
    { id: 'dogrulanan', label: 'Sonucu bağımsız doğrulanan taraf' },
    { id: 'iupac', label: 'Uluslararası bir komite karar versin' },
    { id: 'paylas', label: 'Adlar paylaştırılsın' },
  ],
  gercek: 'iupac',
  sonuc:
    'IUPAC 1997’de bir uzlaşı listesi yayımladı ve tartışma kapandı: 104 rutherfordiyum, 105 dubniyum, 106 seaborgiyum. Seaborgiyum, hayattaki bir bilim insanının adını taşıyan ilk element oldu.',
} as const;

/* ══════════════ ORTAK ══════════════ */

export const NUMBERS = [
  { v: '118', l: 'onaylı element' },
  { v: '%50', l: 'altında isabet oranı' },
  { v: '14', l: 'hiç bulunamayan tahmin' },
  { v: '3', l: 'üretilen oganesson atomu' },
] as const;

export const timeline = [
  { year: '1860', title: 'Karlsruhe', text: 'İlk uluslararası kimya kongresi tutarlı bir atom ağırlıkları listesi üretir.' },
  { year: '1869', title: 'Kartlar masada', text: 'Mendeleyev elementleri ağırlığa göre dizer ve boş kareler bırakır.' },
  { year: '1871', title: 'Bahis', text: 'eka-bor, eka-alüminyum ve eka-silisyumun özelliklerini önceden yazar.' },
  { year: '1875', title: 'Galyum', text: 'Lecoq de Boisbaudran bulur; yoğunluk tartışması Mendeleyev’i haklı çıkarır.' },
  { year: '1879', title: 'Skandiyum', text: 'Nilson bulur, Cleve bunun eka-bor olduğunu teşhis eder.' },
  { year: '1886', title: 'Germanyum', text: 'Winkler bulur. On iki özellikte tahminle ölçüm çakışır.' },
  { year: '1902', title: 'Newtonyum', text: 'Mendeleyev hidrojenden hafif iki element önerir. İkisi de yoktur.' },
  { year: '1913', title: 'Moseley', text: 'Sıralama ilkesi ağırlıktan atom numarasına geçer. Ters çiftler çözülür.' },
  { year: '1936', title: 'Madelung', text: 'Doldurma sırası bir kurala bağlanır — ampirik olarak.' },
  { year: '1997', title: 'IUPAC uzlaşısı', text: 'Transfermiyum savaşları biter; 104-106 adlarını alır.' },
  { year: '2016', title: '118 tamamlandı', text: 'Nihonyum, moskovyum, tennessin ve oganesson adlarını alır.' },
  { year: '2021', title: 'Hâlâ açık', text: 'IUPAC 3. grup için "objektif bir hakem yok" der.' },
  // ⚠ `as const` YOK — HorizontalTimeline mutable dizi istiyor. quizQs ile aynı kural.
];

export const quizQs = [
  {
    text: 'Mendeleyev’in yaptığı tahminlerin isabet oranı neydi?',
    opts: ['Neredeyse tamamı tuttu', '%50’nin altında', 'Tam olarak yarısı', 'Hiçbiri tutmadı'],
    a: 1,
    exp: 'On tahmini karşılığını buldu, on dördü hiç bulunamadı. Lente (2019) bunu "%50’den kötü" diye özetliyor.',
  },
  {
    text: 'Periyodik tablonun ilk satırında neden sadece iki element var?',
    opts: ['Hidrojen ve helyum en hafifleri olduğu için', '1p orbitali diye bir şey olmadığı için', 'Tarihsel bir gelenek', 'Yer kazanmak için'],
    a: 1,
    exp: 'ℓ ≤ n−1 kısıtı yüzünden n = 1 için yalnız s orbitali vardır. Şekil bir tercih değil, bir sonuç.',
  },
  {
    text: 'Lantanitlerin tablonun altında ayrı durmasının sebebi nedir?',
    opts: ['Kimyasal olarak farklı oldukları için', 'Sadece sayfaya sığdırmak için', 'Radyoaktif oldukları için', 'Sonradan keşfedildikleri için'],
    a: 1,
    exp: 'Tamamen tipografik. f bloğu aslında 2. ve 3. grubun arasına oturur; 32 sütunu 18 sütuna indirmek için alta basılıyor.',
  },
  {
    text: 'IUPAC 3. grubun altına ne yazılacağına karar verdi mi?',
    opts: ['Evet, lantan', 'Evet, lutesyum', 'Hayır, tartışma sürüyor', 'Grup 3 diye bir şey yok'],
    a: 2,
    exp: '2021 geçici raporu birebir "objektif bir hakem yok" diyor. Uzlaşı olarak Lu öneriliyor ama karar bağlanmadı.',
  },
  {
    text: 'Oganesson (118) hakkında hangisi doğru?',
    opts: ['Kararlı bir soy gazdır', 'Oda sıcaklığında katı olması bekleniyor', 'Doğada bulunur', 'En bol soy gazdır'],
    a: 1,
    exp: 'Üç atom üretildi, yarı ömrü 0,7 ms. Teorik hesaplar katı ve yarı iletken olduğunu söylüyor — ne soy ne gaz.',
  },
];
