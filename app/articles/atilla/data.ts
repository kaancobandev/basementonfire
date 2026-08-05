// Atilla makalesinin TÜM metin + sayı kaynağı (client değil → JSON-LD'den de okunabilir).
//
// TEZ: Bozkırdan geldi, öldü, geriye efsanesi kaldı. Atilla arkasında bir
// imparatorluk bırakmadı — bir AD bıraktı, ve o adı sonraki bin yıl boyunca
// hanedanlar miras diye paylaşamadı. Batı Roma'yı da o yıkmadı: Roma 476'da
// kendi ordusunun subayının eliyle düştü, Atilla öleli 23 yıl olmuştu.
//
// ── ÜÇ KURAL (bu makaleye özel) ──────────────────────────────────────────
// 1. SIFAT DEĞİL, SAYI (seri geneli). "Vahşi/dâhi/acımasız" yazan cümle ya
//    sayıya çevrilir ya silinir.
// 2. "BARBAR" BİR TANIM DEĞİL, BİR KULAKTIR. Kelime Yunancadır ve "Yunanca
//    bilmeyen" demektir. Bu metinde Hunlar için ASLA betimleyici olarak
//    kullanılmaz; yalnızca Roma'nın kendi kategorisi olarak, tırnak içinde ve
//    sökülerek geçer. Roma'nın kayıtları bu kelimeyi çürüten malzemeyi zaten
//    kendisi veriyor (bkz. BARBAR.kanitlar).
// 3. TÜRK ÇERÇEVESİ BELGEYE DAYANIR, İDDİAYA DEĞİL. Hun DİLİ hakkında elimizde
//    üç kelime var; oradan hüküm kurulmaz. Bu yüzden Türk hattı dört ayaktan
//    kuruluyor: KURUM (kut, ikili teşkilat, kurultay), SOY (Xiongnu → 2025
//    aDNA), AD/UNVAN, ve MİRAS (Bulgar Dulo, Macar Árpád). Karşı görüş
//    (Maenchen-Helfen) susturulmaz, kaynakçada ve metinde durur.

/* ══════════════ Perde 0 · Cold open — tahta kadeh ══════════════ */

export const OTAG = {
  year: 449,
  place: 'Tuna’nın kuzeyi, Atilla’nın karargâhı',
  witness: 'Panionlu Priskos',
  role: 'Doğu Roma elçilik heyetinin kâtibi',
  // Priskos, Fragment 8 — birincil kaynaktan doğrulandı (2026-08-01).
  scene: [
    'Konuklara gümüş tabakta ağır bir sofra kuruldu.',
    'Kadehler altın ve gümüştü.',
    'Kağan ise tahta bir tabaktan yalnızca et yedi.',
    'Ve tahta bir kadehten içti.',
  ],
  dress:
    'Priskos giysisini de yazıyor: sade ve temiz, süs yok. Kılıcının kabzasında, ayakkabısının bağında, atının koşumunda altın ya da taş yok — oysa çevresindeki beyler altınla ve mücevherle donanmıştı.',
  punch:
    'Bu bir yoksulluk sahnesi değil. Sofrayı kuran da, kuralı koyan da o. Avrupa’nın en büyük altın akışını yöneten adam, masasında tek süssüz kişi olmayı SEÇİYOR.',
  thesis:
    'Ve bu adama "barbar" diyen kayıt, aynı sayfada onun sofrasındaki gümüşü, elçilik protokolünü ve iki dilde yazan kâtiplerini anlatıyor.',
} as const;

/* ══════════════ Perde 1 · Ondan öncekiler + Kavimler Göçü ══════════════ */

// Atilla 434'te boş bir sayfaya oturmadı: en az altı yüzyıllık bir bozkır
// devlet geleneğini ve hazır işleyen bir teşkilatı devraldı.
export const ONCEKILER = [
  {
    yil: 'MÖ 209',
    ad: 'Mete Han (Modu Chanyu)',
    ne: 'Asya Hun (Xiongnu) birliğini kuruyor. Orduyu ONLUK sisteme bağlıyor: on, yüz, bin, on bin. Bozkırın devlet aklı burada yazılıyor.',
    not: 'Bu teşkilat kalıbı sonraki bin yıl boyunca bozkırda tekrar tekrar karşımıza çıkacak.',
  },
  {
    yil: '~MS 313',
    ad: 'Sogd Mektupları',
    ne: 'Semerkantlı bir tüccar, Luoyang’ı basan halkı kendi dilinde "xwn" diye yazıyor. Çin kaynaklarındaki Xiongnu ile Batı’nın "Hun"u arasındaki en güçlü filolojik köprü bu mektup.',
    not: 'Bir tüccarın iş mektubu — propaganda değil, muhasebe.',
  },
  {
    yil: '~370',
    ad: 'İtil’in (Volga) geçilmesi',
    ne: 'Hun birlikleri İtil’i geçip Alanları, ardından Gotları vuruyor. Avrupa’nın haritası bu hamleyle yeniden çizilmeye başlıyor.',
    not: 'Jordanes bu hamlenin başında Balamir adında bir önder verir; adın tarihîliği tartışmalıdır, hamlenin kendisi tartışmalı değildir.',
  },
  {
    yil: '~400-410',
    ad: 'Uldin',
    ne: 'Roma kaynaklarında Tuna boyunda adı geçen ilk Hun önderi. Artık Roma’nın muhatabı olan bir güç var.',
    not: 'Bir önderin adının Roma kayıtlarına geçmesi kendi başına bilgidir: kayda geçen şey muhatap alınandır. Uldin’den önce Hunlar Roma metinlerinde isimsiz bir kalabalık.',
  },
  {
    yil: '~412-422',
    ad: 'Karaton',
    ne: 'Geçiş kuşağı. Hun gücü Tuna’nın kuzeyinde kalıcılaşıyor.',
    not: 'Hakkında elimizde neredeyse hiçbir şey yok — adı ve dönemi dışında. Bu boşluk bize kaynakların doğasını hatırlatıyor: Hunlar hakkında bildiklerimiz, Roma’nın onlarla ne zaman ilgilendiğine bağlı.',
  },
  {
    yil: '~422-434',
    ad: 'Rua (Rugila) — Atilla’nın amcası',
    ne: 'İlk düzenli haraç anlaşmalarını yapan ve Batı Roma’ya süvari kiralayan kağan. Genç Aetius’u bizzat ağırlayan da o.',
    not: 'Atilla’ya kalan şey bir ganimet yığını değil: işleyen bir dış politika.',
  },
  {
    yil: '?-öl. ~434 öncesi',
    ad: 'Muncuk (Mundzuk) — Atilla’nın babası',
    ne: 'Rua’nın kardeşi. Atilla ve Bleda’nın babası.',
    not: 'Kağan olmadan öldü ve kaynaklarda neredeyse yalnızca oğullarının babası olarak geçiyor. Yani Atilla’nın kutu babasından değil, amcası Rua’dan devraldığı hattan geliyor — bozkırda veraset babadan oğula bir otomatik akış değil.',
  },
] as const;

export const GOC = {
  title: 'Kavimler Göçü',
  // KRİTİK ZAMANLAMA: bu zincir Atilla DOĞMADAN başlıyor.
  onemli:
    'Dikkat: bu zincirin tamamı Atilla doğmadan önce başladı. Avrupa’nın haritasını yeniden çizen göç onun eseri değil — o, bu göçün yarattığı dünyayı devraldı.',
  zincir: [
    { n: 1, yil: '~370', olay: 'Hun baskısı İtil’i aşıyor; Alanlar yerinden oluyor.' },
    { n: 2, yil: '376', olay: 'Gotlar Tuna’yı geçip Roma topraklarına sığınma talebiyle giriyor.' },
    { n: 3, yil: '378', olay: 'Edirne (Adrianopolis): Doğu Roma ordusu bozguna uğruyor, İmparator Valens ölüyor.' },
    { n: 4, yil: '5. yy başı', olay: 'Vandallar, Süevler, Burgundlar batıya doğru itiliyor; Ren aşılıyor.' },
    { n: 5, yil: '410', olay: 'Gotlar Roma şehrini yağmalıyor. Atilla henüz sahnede yok.' },
  ],
  punch:
    'Yani "Avrupa’yı Atilla altüst etti" cümlesi tarihi kırk yıl geç okuyor. Altüst oluş başlamıştı; Atilla onun içine doğdu.',
} as const;

/* ══════════════ Perde 2 · Kağan — bozkırda devlet nasıl işler ══════════════ */

export const KAGAN = {
  kut: {
    ad: 'Kut',
    tanim:
      'Yönetme yetkisi Gök’ten (Tanrı’dan) verilir. Kut soyla taşınır ama garanti değildir: başarısız olan kağanın kutunun kalktığına hükmedilir. Yani yetki hem kutsaldır hem sınanabilir.',
  },
  ikili: {
    ad: 'İkili teşkilat',
    tanim:
      'Devlet sağ/sol (doğu/batı) iki kanada bölünür ve çoğu zaman İKİ hükümdar tarafından birlikte yönetilir. Bu bir kriz düzeni değil, NORMAL düzendir — bozkırın geniş coğrafyasını tek merkezden yönetmenin çözümüdür.',
    sonuc:
      'Atilla ile Bleda’nın 434’te birlikte kağan olması bu yüzden bir tuhaflık değil, kuralın kendisidir.',
  },
  kurultay: {
    ad: 'Kurultay',
    tanim:
      'Boy beylerinin toplandığı meclis. Sefer kararı, bölüşüm ve veraset burada konuşulur. Kağan mutlak değildir; boyların rızasına dayanır.',
  },
  federasyon: {
    ad: 'Boy federasyonu',
    tanim:
      'Hun devleti tek bir halkın devleti değil, bir çekirdeğin etrafında toplanmış boylar birliğidir. Got, Gepid, Alan, Sarmat birlikleri kendi beyleriyle bu yapının içindedir.',
    aDNA:
      '2025’te PNAS’ta yayımlanan 370 antik genomluk çalışma tam da bu tabloyu veriyor: Karpat Havzası’ndaki bazı ELİT gömülerle Asya Hun (Xiongnu) elitleri arasında doğrudan soy bağı var — ama nüfusun tamamı için kitlesel bir göç yok, yüksek çeşitlilikte bir federasyon var. İki bulgu birlikte okunmalı: soyu bozkırdan gelen bir hanedan, çok halklı bir birliğin başında.',
  },
} as const;

// "Barbar" kelimesinin sökümü. Kanıtların HEPSİ Roma'nın kendi kayıtlarından.
export const BARBAR = {
  kelime:
    '"Barbar" Yunanca bir kelimedir ve aslen "Yunanca bilmeyen" demektir — anlaşılmayan konuşmanın kulağa "bar-bar" gelmesinden. Bir halkın niteliğini değil, dinleyenin nerede durduğunu anlatır.',
  kanitlar: [
    {
      baslik: 'İki dilde çalışan kalem',
      metin:
        'Atilla’nın maiyetinde Latince ve Yunanca yazan kâtipler vardı. Bunlardan biri Pannonialı Orestes’tir — adını aklınızda tutun, makalenin sonunda geri gelecek.',
      kaynak: 'Priskos',
    },
    {
      baslik: 'Yazılı antlaşma ve hukukî madde',
      metin:
        'Roma ile yapılan anlaşmalar metne bağlanıyordu ve içlerinde kaçakların iadesi gibi teknik maddeler vardı. Bu, sözlü bir ganimet pazarlığı değil; taraf, madde ve yaptırım içeren bir belgedir.',
      kaynak: 'Priskos, antlaşma şartları',
    },
    {
      baslik: 'Elçilik protokolü',
      metin:
        'Heyetler kabul ediliyor, oturma düzeni rütbeye göre kuruluyor, kadeh sırası bir törene bağlanıyordu. Priskos bu düzeni adım adım tarif ediyor.',
      kaynak: 'Priskos, Fragment 8',
    },
    {
      baslik: 'İşleyen maliye',
      metin:
        'Yıllık haraç, gecikme faizi mantığıyla hesaplanan birikmiş borç, tutarların yeniden pazarlığı. Bu bir muhasebedir.',
      kaynak: 'Margus ve Anatolius antlaşmaları',
    },
    {
      baslik: 'Ve en ağırı: bir Romalının tercihi',
      metin:
        'Priskos, karargâhta Yunanca konuşan bir tüccarla tartışıyor. Adam Roma’dan gelmiş ve geri dönmek istemiyor. Gerekçesi: Roma’da vergi ağır, mahkemede hâkim para istiyor, zengin cezadan kurtuluyor. Priskos Roma hukukunu savunuyor; adam hukuka değil, uygulayanlara itiraz ediyor.',
      kaynak: 'Priskos, Fragment 8 — Roma’nın kendi kâtibinin kaydı',
    },
  ],
  punch:
    'Bir düzene "barbar" diyebilmek için ondan kaçan Romalıyı da açıklamanız gerekir.',
} as const;

/* ══════════════ Perde 3 · İsim ══════════════ */

export const ISIM = {
  soru: 'Atilla ne demek?',
  okumalar: [
    {
      hat: 'Germen okuması',
      koken: 'Gotça atta ("baba") + küçültme eki -ila',
      anlam: '"Küçük baba" — bir saygı hitabı.',
      not: 'Bu okuma yaygındır. Dikkat çeken yanı şu: eğer doğruysa, dünyanın en çok bilinen adlarından biri onun kendi dilinde değil, TEBAASININ dilinde verilmiş bir unvandır.',
    },
    {
      hat: 'Türk okuması',
      koken: 'Atil / İtil — Volga’nın Türkçe adı',
      anlam: '"İtil’in adamı / İtil’den olan".',
      not: 'Németh Gyula ve Türk tarih yazımında Kafesoğlu hattı bu okumayı savunur. Hunların İtil’i geçerek tarih sahnesine çıktığı düşünülünce nehir adından unvan türemesi bozkır için olağan bir kalıptır.',
    },
    {
      hat: 'İkinci Türk okuması',
      koken: 'ata ("baba") kökü',
      anlam: 'Yine "baba" anlam alanı.',
      not: 'İlginç olan şu: Germen ve Türk okumaları farklı köklerden AYNI anlama çıkıyor. Adın hangi dilden geldiği tartışmalı; ne dediği konusunda kaynaklar şaşırtıcı biçimde hemfikir.',
    },
  ],
  // Sezar makalesindeki Caesar → Kaiser → Çar ağacının kardeşi.
  agac: [
    { dil: 'Kaynaklarda', ad: 'Attila', not: 'Yunanca ve Latince kayıtların yazımı.' },
    { dil: 'Türkçe', ad: 'Atilla', not: 'Türkiye’de yerleşik yazım.' },
    { dil: 'Almanca destan', ad: 'Etzel', not: 'Nibelungenlied’de saygın bir hükümdar.' },
    { dil: 'İskandinav', ad: 'Atli', not: 'Şiirsel Edda’da hain ve açgözlü.' },
    { dil: 'Macarca', ad: 'Attila', not: 'Bugün Macaristan’da yaygın bir erkek adı.' },
    { dil: 'Bulgar listesi', ad: 'Avitohol (?)', not: 'Nominalia’nın ilk adı; Atilla ile özdeşliği tartışmalı.' },
  ],
  kirbac: {
    baslik: '"Tanrı’nın Kırbacı" ne zaman çıktı?',
    metin:
      'Flagellum Dei — "Tanrı’nın Kırbacı" — Atilla’nın çağdaşı hiçbir kaynakta ona verilen bir ad değildir. Sonraki yüzyılların Hristiyan yorumudur: felaketi günahın cezası olarak okuyan bir çerçeve. Yani bu ad Atilla hakkında değil, ona bakanın teolojisi hakkında bilgi verir.',
  },
} as const;

/* ══════════════ Perde 4 · İki kağan, bir taht ══════════════ */

export const BLEDA = {
  baslangic: 434,
  bitis: 445,
  devir:
    '434’te Rua ölüyor. Yerine Atilla ve kardeşi Bleda BİRLİKTE geçiyor. Bu ikili teşkilatın olağan işleyişidir: iki kanat, iki kağan.',
  son: '445’te Bleda ölüyor ve Atilla tek başına kalıyor.',
  kirilma:
    'Buradaki asıl mesele bir kardeş kavgası hikâyesi değil. İkili kağanlık geniş coğrafyayı yönetmenin çözümüdür ama bir maliyeti vardır: iki meşru hükümdar demek, iki meşru veraset hattı demektir. Bu çatlak bozkır devletlerinde tekrar tekrar açılır — Göktürk’te de, sonra Osmanlı’da veraset meselesi olarak da.',
  punch:
    'Yani Bleda’nın ölümü kişisel bir öfke anı olarak da okunabilir, bir devlet yapısının bilinen kırılma noktası olarak da. Kaynaklar bu ikisi arasında bize seçme şansı bırakmıyor — çünkü tek bir kaynak konuşuyor.',
} as const;

export const BLEDA_SOURCES = [
  {
    name: 'Jordanes',
    role: '551 — olaydan ~106 yıl sonra, Got yanlısı',
    color: 'ember',
    text:
      'Getica doğrudan söyler: Bleda kardeşinin tuzağıyla öldü. Tek açık suçlama budur. Ama Jordanes olayı görmedi, kayıp bir metinden özetliyor ve Hun hanedanına sempatiyle bakmıyor.',
  },
  {
    name: 'Prosper Tiro',
    role: '~455 — çağdaş, Roma kilisesine yakın',
    color: 'bone',
    text:
      'Çağdaş kayıt Bleda’nın ortadan kalktığını bilir ama Jordanes’in kesinliğiyle konuşmaz. Çağdaş kalemin sessiz kaldığı yerde, yüz yıl sonraki kalemin bu kadar emin olması dikkat ister.',
  },
  {
    name: 'Bozkır teamülü',
    role: 'karşılaştırmalı çerçeve',
    color: 'iron',
    text:
      'İkili kağanlıkta kanatlardan birinin tasfiyesi bozkır tarihinde tek örnek değildir. Bu, olayın olduğunu kanıtlamaz; ama olayı bir canavarlık anı olmaktan çıkarıp bir yapı sorunu hâline getirir.',
  },
] as const;

// Hero objesinin ta kendisi. TON NOTU: bu bölüm kılıcı "sahte rekvizit" diye
// KÜÇÜLTMEZ. Kut'un görünür hâle geldiği an olarak anlatır.
export const KILIC = {
  hikaye:
    'Jordanes’in aktardığına göre bir çoban, otlakta yaralı bir düvenin izini sürerken toprakta bir kılıç bulur ve kağana getirir. Atilla onu Savaş Tanrısı’nın kılıcı ilan eder.',
  anlam:
    'Bozkır siyasetinde bu hamlenin adı vardır: kut, görünür bir nesneye bağlanır. Gök’ten gelen yetki artık elle tutulur, gösterilebilir, önünde yemin edilebilir bir şeydir. Hükümdarlık iddiası soyut olmaktan çıkıp maddeleşir.',
  viyana: {
    baslik: 'Peki bugün Viyana’da sergilenen "Atilla’nın Kılıcı"?',
    metin:
      'Kunsthistorisches Museum’un hazine dairesindeki sabre yüzyıllardır bu adla anılır. Ama yapım tekniği ve biçimi onu 10. yüzyıla tarihlendirir — yani Atilla’dan yaklaşık beş yüz yıl sonrasına. Objenin kendisi sahte değil; ona takılan ad sonradan takılmıştır.',
    ders:
      'Ve bu, makalenin son perdesinin habercisi: Atilla öldükten sonra adı öyle değerli bir mirasa dönüştü ki, sonraki hanedanlar ona ait olduğunu söyledikleri nesneler üzerinden hak iddia ettiler.',
  },
} as const;

/* ══════════════ Perde 5 · Haraç + Konstantinopolis ══════════════ */

// ⚠ SAYI UYARISI: 443 sonrası YILLIK haraç kaynaklarda çelişir. Yaygın anlatı
// 700'ün üçe katlanmasıyla 2.100 verir; bir kısım literatür 1.000-1.500 aralığını
// verir ve tutarı belirsiz sayar. Makale bunu GİZLEMEZ (bkz. dispute).
export const HARAC = {
  birim: 'Roma librası (~327 gram)',
  basamaklar: [
    { yil: '~422', tutar: 350, olay: 'Rua döneminde bağlanan yıllık ödeme.' },
    { yil: '435', tutar: 700, olay: 'Margus Antlaşması: tutar ikiye katlanıyor.' },
    { yil: '443', tutar: 2100, olay: 'Anatolius Antlaşması: yıllık ödeme yeniden yükseliyor, ayrıca 6.000 libre birikmiş borç isteniyor.' },
  ],
  birikmis: 6000,
  dispute:
    '443 sonrası yıllık tutar kaynaklarda tek değil: yaygın anlatı 700’ün üçe katlanmasıyla 2.100 libre verir, bir kısım literatür ise 1.000-1.500 aralığını verir ve tutarı belirsiz sayar. Birikmiş borcun 6.000 libre olduğu konusunda ise ayrılık yok. Bu makale 2.100’ü yaygın rakam olarak kullanır ve tartışmayı burada açık bırakır.',
  etki:
    'Priskos ödemenin Doğu Roma’nın üst tabakasında yarattığı tahribatı yazıyor: mülk satışları, karılarının mücevherini elden çıkaranlar, borcunu kapatamayınca kendini öldürenler.',
  strateji: {
    baslik: 'Neden şehri almadı?',
    metin:
      'Çünkü hedef şehir değil, AKIŞ. Konstantinopolis alınırsa bir kerelik ganimet olur; ayakta kalırsa her yıl ödeme yapar. Yıkmamak, yıkmaktan kârlıdır.',
  },
} as const;

export const SURLAR = {
  deprem: {
    yil: 447,
    kuleler: 57,
    tarihTartismasi:
      'Kaynaklar günde anlaşamıyor: 26 Ocak, 6 Kasım, 8 Kasım ve 8 Aralık tarihlerinin hepsi öne sürülmüştür. Yıkımın büyüklüğünde ise ayrılık yok — 57 kule ve surun uzun bölümleri çöktü.',
  },
  onarim: {
    gun: 60,
    sorumlu: 'Praetorian prefekt Constantinus',
    faktiyonlar:
      'Onarıma hipodrom faktiyonları — birbirinin amansız rakibi Maviler ve Yeşiller — insan gücüyle katıldı.',
    eklenen: 'Onarımda yalnız yıkılan yer örülmedi; dış sur ve hendek hattı da güçlendirildi.',
    kitabe:
      'İşi anlatan kitabe hâlâ okunabiliyor ve övündüğü şey duvarın kalınlığı değil, SÜRE: iki aydan kısa.',
  },
  katmanlar: [
    { ad: 'Hendek', ne: 'Önce su hendeği. Kuşatma kulesi ve koçbaşının duvara YAKLAŞMASINI engeller.' },
    { ad: 'Dış sur', ne: 'Alçak ilk hat. Saldırıyı burada tutup yavaşlatır.' },
    { ad: 'Teras (peribolos)', ne: 'İki sur arası açık şerit. Buraya giren saldırgan üstten iki taraftan da vurulur.' },
    { ad: 'İç sur', ne: 'Asıl duvar: kalın, yüksek ve kuleli. Kuşatmanın kırılması gereken hat.' },
  ],
  sonuc:
    'Atilla surların önüne geldi ve şehre yüklenmedi. Bu bir başarısızlık değil, bir hesap: kuşatma pahalıdır, uzundur ve akan haracı durdurur.',
  köprü:
    'Bu duvar tam bin yıl sonra aynı soruyla bir kez daha karşılaşacak. 453’te Atilla ölür; 1453’te şehir düşer. İlkinde duvar kazandı.',
} as const;

/* ══════════════ Perde 6 · Yüzük ══════════════ */

export const HONORIA = {
  yil: 450,
  kisi: 'Iusta Grata Honoria',
  kim: 'Batı Roma İmparatoru III. Valentinianus’un ablası',
  olay:
    'Honoria istemediği bir evliliğe zorlanıyor ve yüzüğünü Atilla’ya yolluyor — yardım isteyerek.',
  yorum:
    'Atilla bunu nişan sayıyor ve çeyiz olarak Batı Roma’nın yarısını istiyor.',
  ikiOkuma: [
    'Birinci okuma: yüzük gerçekten kıvılcımdı; bir kadının kaçma girişimi bir kıtayı savaşa sürükledi.',
    'İkinci okuma: Atilla zaten batıya bakıyordu ve yüzük ona hukukî kılıf sağladı. Bahane, sebep değil.',
  ],
  sonuc: 'Valentinianus reddediyor. 451’de Hun ordusu Galya’da.',
  karar: {
    soru: 'Sen III. Valentinianus’sun. Ablan düşmana yüzük yollamış. Ne yaparsın?',
    secenekler: [
      { id: 'ver', label: 'Talebi kabul et', sonuc: 'İmparatorluğun yarısını çeyiz olarak vermek tahtı zaten bitirir. Tarihte kimse bunu yapmadı.' },
      { id: 'oldur', label: 'Honoria’yı öldürt', sonuc: 'Kaynaklar onun öldürülmediğini, evlendirilip sahneden çekildiğini söyler. Ölüm, Atilla’ya "dul kaldım" diyemeyeceği bir gerekçe bırakırdı.' },
      { id: 'inkar', label: 'Nişanı topyekûn inkâr et', sonuc: 'Valentinianus’un yaptığı bu oldu: nişan diye bir şey yok, talep geçersiz. Atilla bunu savaş sebebi saydı.' },
      { id: 'oyala', label: 'Elçi gönderip oyala', sonuc: 'Zaman kazandırır ama Galya seferinin hazırlığı zaten yürüyordu. Oyalamak orduyu durdurmaz.' },
    ],
    gercek: 'inkar',
  },
} as const;

/* ══════════════ Perde 7 · Catalaunum — Aetius ══════════════ */

export const AETIUS = {
  ad: 'Flavius Aetius',
  unvan: 'Batı Roma’nın başkomutanı (magister militum)',
  gecmis:
    'Gençliğinde Hunların yanında rehin olarak yaşadı. Onların dilini, ordusunu ve iç siyasetini içeriden öğrendi. Sonra kendi iç savaşlarında Hun süvarisini KİRALADI ve bu sayede Roma’da yükseldi.',
  ironi:
    'Yani 451’de Atilla’nın karşısına çıkan adam, kariyerini Hun atlısıyla kurmuş ve Atilla’yı kişisel olarak tanıyan tek Romalı komutandı.',
} as const;

export const CATALAUNUM = {
  yil: 451,
  yer: 'Catalaunum Ovaları (Campus Mauriacus) — kesin yeri bugün bilinmiyor',
  taraflar: {
    roma: 'Aetius; müttefiki Vizigot kralı I. Theodoric',
    hun: 'Atilla; yanında Gepid, Ostrogot ve diğer boy birlikleri',
  },
  // Animasyonun faz listesi (sim-catalaunum.tsx bunu okur).
  fazlar: [
    { id: 1, ad: 'Diziliş', metin: 'İki ordu ovada karşılıklı diziliyor. Atilla merkeze kendi süvarisini, kanatlara boy birliklerini alıyor.' },
    { id: 2, ad: 'Sırt için yarış', metin: 'Muharebenin düğümü ovaya hâkim bir sırt. İki taraf da önce orayı tutmaya çalışıyor.' },
    { id: 3, ad: 'Vizigot kanadı', metin: 'Vizigotlar sırtı tutuyor ve yüksekten iniyor. Muharebenin ağırlık merkezi bu kanatta.' },
    { id: 4, ad: 'Theodoric’in ölümü', metin: 'Vizigot kralı I. Theodoric muharebede ölüyor. Ama ordusu dağılmıyor — tersine sertleşiyor.' },
    { id: 5, ad: 'Gece', metin: 'Karanlık iniyor, düzen bozuluyor, birlikler birbirini kaybediyor. Muharebe bir sonuca bağlanmadan kesiliyor.' },
    { id: 6, ad: 'Ordugâh', metin: 'Atilla arabalardan kurulu ordugâhına çekiliyor. Jordanes, yenilirse ateşe atılmak üzere eyerlerden bir yığın hazırlattığını yazar.' },
    { id: 7, ad: 'Aetius bırakıyor', metin: 'Aetius takip etmiyor. Çünkü Atilla tümüyle yok olursa Vizigotları dengeleyecek güç de kalmaz. Roma’nın çıkarı, Hunların ZAYIFLAMASI ama YOK OLMAMASI.' },
  ],
  // ⚠ 2026-08-05 DÜZELTİLDİ. Eski son cümle şuydu ve ÜÇ AYRI HATA taşıyordu:
  // "Ve ertesi yıl AYNI ordu İtalya'ya giriyor — yenilmiş bir ordunun
  //  yapamayacağı şey tam olarak budur."
  //   (a) "Aynı ordu" DEĞİL. Prosper Tiro (§1364) İtalya seferini birebir şöyle
  //       açar: "redintegratis viribus, quas in Gallia amiserat" — Galya'da
  //       KAYBETTİĞİ kuvvetleri yeniden tamamlayarak. Marcellinus da aynı fiili
  //       kullanıyor. Yani bir kış boyunca yeniden kurulmuş bir ordu.
  //   (b) Atilla ROMA'YA YÜRÜMEDİ. Apeninleri hiç geçmedi; Po ovasında durdu ve
  //       tek başına Aquileia önünde ~3 ay oyalandı.
  //   (c) Çıkarım geçersiz: "ertesi yıl sefere çıkabildi" olsa olsa ordunun
  //       İMHA EDİLMEDİĞİNİ kanıtlar — ki bu zaten ilk cümlede yazıyor —
  //       yenilgi almadığını değil.
  // İlk iki cümle KALDI çünkü çağdaş kaynakla birebir örtüşüyor (neutris
  // cedentibus / bellum nox intempesta diremit).
  sonuc:
    'Ne imha, ne bozgun: iki taraf da geri adım atmadı, gece muharebeyi kesti ve Atilla’nın ordugâhı hiç alınamadı. Ama Galya seferi burada bitti — Atilla Ren’in ötesine çekildi ve bir daha Galya’ya girmedi. Ertesi yıl İtalya’ya giren ordu aynı ordu değildi: bir kış boyunca yeniden kuruldu.',
  // Sonucun kaynak temeli — "kaynaklar belirsiz bırakıyor" izlenimi YANLIŞ olurdu.
  kaynakTemeli: {
    baslik: 'Peki kim kazandı?',
    metin:
      'Bu soruda kaynaklar sanıldığı kadar sessiz değil. Jordanes’ten ÖNCE ve ondan bağımsız üç kayıt Hunların yenildiğini yazıyor: Galya Kroniği (452 — olaydan bir yıl sonra, olayın geçtiği bölgede), Prosper Tiro (~455, Roma) ve Hydatius (~468, İspanya). Buna karşılık aynı kaynaklar bunun bir imha olmadığını da söylüyor. Maenchen-Helfen’in formülü bu ikisini birden tutuyor: “dar anlamda kararsız, ama Hunlar için kaybedilmiş bir muharebe.”',
    karsiGorus:
      'Azınlıkta kalan bir görüş daha var: Hyun Jin Kim muharebeyi Roma zaferi saymaz. Bu tez literatürde tartışılıyor ama eleştiriliyor da (Heinrich Härke, The Classical Review, 2014). Türkçe Vikipedi sonucu “tartışmalı” yazarken büyük ölçüde bu azınlık görüşüne dayanıyor; İngilizce muadili aynı tez için “ihtiyatla yaklaşılmalı” diyor.',
  },
  // "Sıfat değil sayı" panosu.
  sayi: {
    iddia: 165000,
    kaynak: 'Jordanes (bazı nüshalarda daha da yüksek)',
    itiraz:
      'Bu rakam sahada değil, masada üretilmiş bir sayıdır. Test etmek için sıfat değil aritmetik gerekir: bir orduyu yürüten şey cesaret değil tahıl, su ve yol genişliğidir.',
    varsayimlar: {
      tahilKisiGun: 1.3, // kg/gün/asker
      atYemGun: 7, // kg/gün/at (yem + arpa)
      suKisiGun: 4, // litre/gün/asker
      suAtGun: 30, // litre/gün/at
      atOrani: 0.5, // süvari ağırlıklı orduda kişi başına at
      kolonMetreKisi: 1.2, // sıkışık yürüyüş kolonunda kişi başına yol uzunluğu (m)
      siraBoyu: 6, // yan yana yürüyen asker
    },
  },
} as const;

/* ══════════════ Perde 8 · İtalya ve Papa ══════════════ */

export const ITALYA = {
  yil: 452,
  aquileia:
    'Aquileia kuşatılıyor ve alınıyor. Şehir bir daha eski önemine dönemeyecek. Kaçanların lagün adalarına sığınması, sonraki yüzyıllarda Venedik’in kuruluş anlatısına eklenecek — ama bu bağ çağdaş bir kayıt değil, sonradan kurulmuş bir efsanedir.',
  milano: {
    baslik: 'Milano’daki tablo',
    metin:
      'Anlatıya göre Atilla Milano’da bir saray tablosu görüyor: Roma imparatorları tahtta, ayaklarının dibinde ölü bozkır savaşçıları. Tabloyu yok ettirmiyor. Ressamı çağırtıp AYNI tabloyu tersine çizdiriyor: tahtta kendisi, ayaklarının dibinde altın boşaltan imparatorlar.',
    yorum:
      'Bu bir öfke değil, bir okuryazarlık. Adam imgenin ne işe yaradığını biliyor: tablo bir kayıt değil, bir iddiadır — ve iddia değiştirilebilir.',
  },
  mincio: {
    olay:
      'Mincio ırmağı kıyısında Papa I. Leo başkanlığındaki bir Roma heyeti Atilla’yla görüşüyor. Ardından Hun ordusu İtalya’dan çekiliyor.',
    soru: 'Peki neden çekildi?',
  },
} as const;

export const ITALYA_SOURCES = [
  {
    name: 'Prosper Tiro',
    role: '~455 — çağdaş, Roma kilisesine yakın',
    color: 'bone',
    text:
      'En erken kayıt görüşmeyi merkeze koyar: Leo gitti, konuştu, ordu döndü. Bu metin sonraki bin yılın anlatısının kaynağıdır. Ama yazarı, sonucu Roma kilisesinin başarısı olarak kaydetmekte açık bir menfaati olan bir kalemdir.',
  },
  {
    name: 'Hydatius',
    role: '~468 — çağdaş kayıt',
    color: 'ember',
    text:
      'Aynı yıl İtalya’da kıtlık ve salgın olduğunu yazar. Bir ordu için bu, düşmandan daha tehlikeli bir şeydir: yiyeceğin bittiği ve hastalığın yayıldığı bir yarımadada kalmak, kazanılmış bir seferi imha edebilir.',
  },
  {
    name: 'Askerî durum',
    role: 'modern değerlendirme',
    color: 'iron',
    text:
      'Aynı sırada Doğu Roma İmparatoru Marcianus Tuna’nın ötesine, Hun topraklarına kuvvet gönderiyordu. Yani Atilla İtalya’da ilerlerken arkasında kendi yurdu tehdit altındaydı. Geri dönmek bir teslimiyet değil, bir öncelik sıralamasıdır.',
  },
  {
    name: 'Raffaello',
    role: '1514 — Batı’nın sonradan verdiği cevap',
    color: 'gold',
    text:
      'Vatikan’daki fresk sahneyi kesin bir cevaba bağlar: gökte Aziz Petrus ve Pavlus kılıçla belirir, Atilla ürker. Ama bu bir kaynak değil, bir taraftır: olaydan ~1060 yıl sonra, papalığın kendi zaferini anlatmak için kendi sarayının duvarına yapıldı. Batı’da “Atilla” denince akla gelen görüntü budur; Türk hafızasında bu sahne hiç yoktur. Nitekim “Tanrı’nın Kırbacı” adı da (Perde 3) ona çağdaşları tarafından değil, sonraki yüzyılların Hristiyan yorumu tarafından takıldı. Yani bu fresk Atilla hakkında değil, ona bakan hakkında bilgi verir.',
  },
] as const;

export const ITALYA_ANKET = {
  soru: 'Sence Atilla İtalya’dan neden döndü?',
  secenekler: [
    { id: 'papa', label: 'Papa I. Leo’nun görüşmesi' },
    { id: 'salgin', label: 'Kıtlık ve salgın' },
    { id: 'marcianus', label: 'Marcianus’un arkadan saldırısı' },
    { id: 'hepsi', label: 'Üçü birden' },
  ],
  not: 'Oyunu verdikten sonra dört kaynağı yan yana göreceksin. Cevabı sana söylemiyoruz — kaynakları gösterip kararı sana bırakıyoruz.',
} as const;

/* ══════════════ Perde 9 · Otağ — 453 ══════════════ */

export const OLUM = {
  yil: 453,
  gelin: 'İldiko',
  sahne:
    'Düğün gecesi. Sabah kapı açılmıyor. İçeri girildiğinde Atilla ölü bulunuyor, yanında ağlayan gelin var. Görünür bir yara yok.',
  girisMetni:
    'Şimdi otağa sen giriyorsun. Elinde dört ihtimal var ve her birinin arkasında gerçek bir kaynak duruyor. Hangisi olduğunu sana söylemeyeceğiz — çünkü kaynaklar da söylemiyor.',
  secenekler: [
    {
      id: 'dogal',
      label: 'Kendi öldü',
      ozet: 'Aşırı içki, burun kanaması, kanın boğazda birikmesi.',
      kaynak: 'Priskos (Jordanes üzerinden)',
      delil:
        'Elimizdeki en erken anlatı bu: yarasız bir ölüm, kanama ve boğulma. Modern tıp bu tabloyu tanıdık buluyor — uzun süreli ağır içiciliğe bağlı yemek borusu varis kanaması, tam olarak böyle görünür: dışarıdan hiçbir iz, içeride ölümcül kanama.',
      guc: 'En erken kaynak + tıbben tutarlı tablo.',
      zaaf: 'Anlatı Hun tarafının resmî açıklaması olabilir: bir suikast, ordunun dağılmaması için gizlenecek ilk şeydir.',
    },
    {
      id: 'ildico',
      label: 'İldiko öldürdü',
      ozet: '"Bir kadının eliyle" ölüm.',
      kaynak: 'Marcellinus Comes (~518-534)',
      delil:
        'Doğu Roma sarayına yakın bu kronik, ölümü doğrudan bir kadının eline bağlar. Ve dikkat çekici olan şu: hem İskandinav Edda’sında hem Alman destanında Atilla’nın ölümü bir kadınla ilişkilendirilir. Bu ya ortak bir gerçeği yankılıyor, ya da destan tarihe geri sızmış.',
      guc: 'Bağımsız bir kayıt + iki ayrı destan geleneğinde aynı motif.',
      zaaf: 'Olaydan ~70 yıl sonra, düşman başkentinde yazıldı. Ve "kadın eliyle ölen hükümdar" antik edebiyatın en sevdiği kalıplardan biridir.',
    },
    {
      id: 'komplo',
      label: 'Doğu Roma tertibi',
      ozet: 'Konstantinopolis’in suikast girişimi ilk değildi.',
      kaynak: 'Priskos — 449 Chrysaphius komplosu (BELGELİ)',
      delil:
        'Bu, spekülasyon değil: 449’da saray başmabeyincisi Chrysaphius, Atilla’nın adamı Edeco’yu altınla satın alıp kağanı öldürtmeyi planladı. Plan Atilla tarafından ortaya çıkarıldı ve elçilik heyeti rezil edildi. Yani Konstantinopolis’in hem niyeti hem yöntemi kayıtlıdır.',
      guc: 'Aynı hedefe yönelik önceki bir girişim BELGELİ.',
      zaaf: '453 için tek bir kanıt yok. Bir kere denemiş olmak, ikinci kez yapmış olmayı kanıtlamaz.',
    },
    {
      id: 'ic',
      label: 'İç muhalefet',
      ozet: 'Kendi çevresinden biri.',
      kaynak: 'Doğrudan kaynak yok — yapısal çıkarım',
      delil:
        'Ölümünden hemen sonra oğulları taht için birbirine girdi ve tebaa boylar ayaklandı. Yani ortada mirasa hazır ve merkezden memnun olmayan taraflar vardı.',
      guc: 'Ölümün ardından açığa çıkan çıkar haritası bunu mümkün kılıyor.',
      zaaf: 'Hiçbir kaynak bunu söylemiyor. Sonuçtan geriye doğru sebep üretmek, tarihçiliğin en bilinen tuzağıdır.',
    },
  ],
  kapanis:
    'Bir seçim yaptın. Şunu bil: elimizdeki bütün bilgiyle, o otakta ne olduğu bilinmiyor ve muhtemelen hiç bilinmeyecek. Bu bir eksiklik değil — kaynakların sana söyleyebileceğinin sınırı.',
} as const;

export const DEFIN = {
  ad: 'Strava',
  tanim: 'Hun cenaze töreni: ordunun atlarıyla mezarın çevresinde dönüşü, yas ve ardından ziyafet.',
  tabutlar: [
    { sira: 1, madde: 'Demir', anlam: 'Boyun eğdirdiği halkları ve savaşı temsil eder.' },
    { sira: 2, madde: 'Gümüş', anlam: 'Roma’dan aldığı haracı temsil eder.' },
    { sira: 3, madde: 'Altın', anlam: 'Kağanlığı temsil eder.' },
  ],
  gomu:
    'Jordanes’e göre gömü gece yapıldı ve yeri gizlendi: işi yapanlar da işin ardından öldürüldü, yer kimsede kalmasın diye.',
  bugun: 'Mezar hiçbir zaman bulunamadı.',
  punch:
    'Ve bu, hikâyenin sonu değil — başlangıcı. Çünkü yeri bilinmeyen bir mezar, herkesin sahip çıkabileceği bir mezardır.',
} as const;

/* ══════════════ Perde 10 · Efsane ══════════════ */

export const EFSANE = {
  giris:
    'Atilla öldüğünde imparatorluğu on altı yıl içinde dağıldı. Adı ise dağılmadı. Dört ayrı gelenek onu sahiplendi ve dördü de aynı adamı bambaşka çizdi.',
  gelenekler: [
    {
      ad: 'Şiirsel Edda',
      nerede: 'İskandinavya · Codex Regius (~1270), şiirler daha eski',
      eser: 'Atlakviða ve Atlamál',
      portre: 'Atli açgözlü ve haindir. Altın için misafirlerini tuzağa düşürür ve sonunda Guðrún’un intikamıyla ölür.',
      renk: 'iron',
    },
    {
      ad: 'Nibelungenlied',
      nerede: 'Almanya · ~1200',
      eser: 'Nibelungen Destanı',
      portre: 'Etzel cömert, ölçülü ve saygın bir hükümdardır. Sarayı sığınılacak yerdir; felaketin sorumlusu o değildir.',
      renk: 'gold',
    },
    {
      ad: 'Bulgar Hanları Nominaliası',
      nerede: 'Bulgar hanedan listesi',
      eser: 'Nominalia',
      portre:
        'Liste Dulo hanedanını Avitohol ve İrnik’le başlatır. İrnik’in, Priskos’un da adını verdiği Ernak — Atilla’nın en küçük oğlu — olduğu yaygın kabul görür. Avitohol’ün Atilla olduğu ise tartışmalıdır.',
      renk: 'ember',
    },
    {
      ad: 'Macar kroniği',
      nerede: 'Macaristan · ~1283',
      eser: 'Kézai Simon, Gesta Hunnorum et Hungarorum',
      portre:
        'Kronik Árpád hanedanının soyunu doğrudan Atilla’ya bağlar. Hun-Macar sürekliliği anlatısı buradan doğar ve Macar kraliyet meşruiyetinin parçası olur.',
      renk: 'garnet',
    },
  ],
  // Aynı sahnenin dört gelenekte nasıl değiştiğini gösteren karşılaştırma.
  // ⚠ BU LİSTE YUKARIDAKİ SEKMELERLE AYNI DÖRTLÜ DEĞİL — ve olmamalı.
  // Sekmeler dört GELENEĞİ gösteriyor (Roma, İskandinav, Alman, Bulgar/Macar);
  // bu liste ise ölüm sahnesini anlatan dört METNİ. İkisi kesişiyor ama örtüşmüyor:
  // Priskos/Jordanes ve Marcellinus çağdaş Roma kaydı, gelenek değil; Bulgar ve
  // Macar kayıtları ise ölüm hakkında hiçbir şey söylemiyor. Okur iki dörtlüyü
  // aynı sanıp kopukluk hissediyordu → ayrım artık `tur` alanıyla EKRANDA yazıyor.
  // `gelenek` = sekme indeksi (kayıtlarda null). DÖRT satırın hepsinde bulunmalı,
  // yoksa `as const` union üretir ve erişim derlenmez.
  ayniSahne: {
    baslik: 'Ölüm sahnesi: kayıt mı, destan mı?',
    satirlar: [
      { kim: 'Priskos / Jordanes', ne: 'Kanama. Yara yok. Kaza.', tur: 'kayıt', gelenek: null as number | null },
      { kim: 'Marcellinus Comes', ne: 'Bir kadının eli. Cinayet.', tur: 'kayıt', gelenek: null as number | null },
      { kim: 'Şiirsel Edda', ne: 'Guðrún intikam alır. Hak edilmiş son.', tur: 'destan', gelenek: 0 as number | null },
      { kim: 'Nibelungenlied', ne: 'Etzel felaketin sorumlusu değil; ardında yas var.', tur: 'destan', gelenek: 1 as number | null },
    ],
    bosluk:
      'Bulgar Nominaliası ve Macar kroniği bu listede yok — çünkü ikisi de Atilla’nın NASIL öldüğüyle değil, KİMİN atası olduğuyla ilgilenir. Bir geleneğin sustuğu yer de veridir.',
  },
  punch:
    'Dikkat: bu dört gelenek onun hakkında anlaşamıyor ama biri bile onu unutmuyor. Bir hükümdarın gerçek mirası bazen bıraktığı devlet değil, adını bırakmadığı yer olur.',
} as const;

/* ══════════════ Perde 11 · Yıkmadığı Roma ══════════════ */

export const SONRASI = {
  dagilma: [
    { yil: 453, olay: 'Atilla ölüyor. Oğulları Ellac, Dengizich ve Ernak mirası paylaşamıyor.' },
    { yil: 454, olay: 'Nedao: tebaa boylar — başlarında Gepid kralı Ardaric — ayaklanıyor. Ellac muharebede ölüyor.' },
    { yil: 469, olay: 'Dengizich’in başı Konstantinopolis’te teşhir ediliyor. Avrupa’daki Hun siyasî birliği bitmiştir.' },
  ],
  omur: 16,
  roma: {
    yil: 476,
    olay:
      'Batı Roma İmparatorluğu sona eriyor. Ama bunu yapan Atilla değil: son imparator Romulus Augustulus’u tahttan indiren, Roma ordusunun kendi subayı Odoacer.',
    tebaa:
      'Odoacer’in askerleri arasında Herul, Skir ve Rugi birlikleri vardı — yani bir kuşak önce Hun birliğinin içindeki boylar.',
    orestes: {
      baslik: 'Ve makalenin en tuhaf gerçeği',
      metin:
        'Odoacer’in devirdiği son imparator Romulus Augustulus’un babası Orestes’ti. Aynı Orestes, yıllar önce Atilla’nın otağında Latince yazan kâtiptir — Priskos onunla 449’da bizzat karşılaşmıştı.',
      punch:
        'Yani Batı Roma’nın son imparatorunu tahta çıkaran adam, gençliğinde Atilla’nın kalemiydi.',
    },
  },
  kapanis: [
    'Roma’yı yıkan adam olarak anılıyor. Yıkmadı — Roma o öldükten 23 yıl sonra, kendi subayının eliyle düştü.',
    'Bir kanunnâme bırakmadı. Bir başkent bırakmadı. Sikke bastırmadı, yazı bırakmadı, mezarı bile bulunamadı.',
    'Ama Bulgar hanları soylarını ona bağladı. Macar kralları ondan miras iddia etti. Alman destanı onu ağırladı, İskandinav şiiri ondan korktu, Türk hafızası onu sakladı — ve Viyana’da beş yüz yıl genç bir kılıç hâlâ onun adını taşıyor.',
    'Bozkırdan geldi. Öldü. Geriye efsanesi kaldı.',
  ],
} as const;

/* ══════════════ Ortak sayılar + zaman çizelgesi + quiz ══════════════ */

export const NUMBERS = {
  kagan: 434, // birlikte kağan
  tek: 445, // tek başına
  olum: 453,
  imparatorlukSonu: 469,
  romaSonu: 476,
  kuleler: 57,
  onarimGun: 60,
  haracZirve: 2100,
  birikmis: 6000,
  genom: 370, // 2025 PNAS çalışması
  binYil: 1000, // 453 → 1453
} as const;

export const timeline = [
  { year: 'MÖ 209', title: 'Mete Han', text: 'Asya Hun birliği ve onluk teşkilat kuruluyor.' },
  { year: '~370', title: 'İtil geçiliyor', text: 'Hun baskısı Avrupa’da göç zincirini başlatıyor.' },
  { year: '378', title: 'Edirne', text: 'Doğu Roma ordusu bozuluyor, İmparator Valens ölüyor.' },
  { year: '434', title: 'İki kağan', text: 'Rua ölüyor; Atilla ve Bleda birlikte tahta geçiyor.' },
  { year: '435', title: 'Margus', text: 'Yıllık haraç 700 libreye çıkıyor.' },
  { year: '443', title: 'Anatolius', text: '6.000 libre birikmiş borç; yıllık ödeme yeniden yükseliyor.' },
  { year: '445', title: 'Bleda', text: 'Bleda ölüyor; Atilla tek başına kağan.' },
  { year: '447', title: 'Surlar', text: 'Deprem 57 kuleyi yıkıyor; sur 60 günde onarılıyor.' },
  { year: '449', title: 'Priskos', text: 'Elçilik heyeti otağa geliyor. Tek görgü tanığı kaydı.' },
  { year: '450', title: 'Yüzük', text: 'Honoria’nın yüzüğü Batı’ya açılan kapı oluyor.' },
  { year: '451', title: 'Catalaunum', text: 'Aetius’la karşı karşıya. Ne imha, ne bozgun.' },
  { year: '452', title: 'İtalya', text: 'Aquileia alınıyor; Mincio’dan sonra ordu dönüyor.' },
  { year: '453', title: 'Otağ', text: 'Atilla ölü bulunuyor. Mezarı hiç bulunamadı.' },
  { year: '469', title: 'Son', text: 'Hun siyasî birliği bitiyor.' },
  { year: '476', title: 'Roma', text: 'Batı Roma kendi subayının eliyle düşüyor.' },
];

// ⚠ `as const` KOYMA — ArticleQuiz `QuizQuestion[]` bekler, readonly tuple değil.
export const quizQs = [
  {
    text: 'Priskos’un 449’da otağda gördüğü sofrada Atilla neyden yiyip içiyordu?',
    opts: ['Altın kadeh ve gümüş tabak', 'Tahta kadeh ve tahta tabak', 'Cam kadeh', 'Kaynaklar bundan hiç söz etmez'],
    a: 1,
    exp: 'Konuklara altın ve gümüş verilmişti; kağan tahtadan yedi ve içti. Süssüzlük bir yoksulluk değil, bir tercihti.',
  },
  {
    text: 'Kavimler Göçü ne zaman başladı?',
    opts: ['Atilla tahta çıktıktan sonra', 'Catalaunum’dan sonra', 'Atilla doğmadan önce', '476’da Roma yıkılınca'],
    a: 2,
    exp: 'Zincir ~370’te İtil’in geçilmesiyle başladı, 378’de Edirne’yle hızlandı. Atilla bu göçün yarattığı dünyayı devraldı.',
  },
  {
    text: 'Atilla ve Bleda’nın 434’te BİRLİKTE kağan olması ne anlama gelir?',
    opts: [
      'Bir veraset krizi yaşandığını',
      'İkili teşkilatın olağan işleyişini',
      'Roma’nın dayattığı bir düzeni',
      'Kurultayın toplanamadığını',
    ],
    a: 1,
    exp: 'Bozkır devletinde sağ/sol kanat ve iki hükümdar normal düzendir. Geniş coğrafyayı tek merkezden yönetmenin çözümüdür.',
  },
  {
    text: '447’de surların önüne gelen Atilla neden Konstantinopolis’i kuşatmadı?',
    opts: [
      'Ordusu yetersizdi',
      'Şehri almak bir kerelik ganimet, ayakta bırakmak her yıl haraç demekti',
      'Papa onu ikna etti',
      'Kış bastırdı'],
    a: 1,
    exp: 'Hedef şehir değil akıştı. Yıkmamak yıkmaktan kârlıydı — ayrıca sur 60 günde onarılmış, hendek ve dış hat güçlendirilmişti.',
  },
  {
    text: 'Jordanes’in Catalaunum için verdiği 165.000 ölü sayısı neden şüpheyle karşılanır?',
    opts: [
      'Jordanes muharebeye katılmadığı için',
      'Lojistik imkânsız olduğu için: o kadar insanın tahılı, suyu ve yol genişliği tutmuyor',
      'Roma kaynakları hep abartır',
      'Sayı sonradan eklendiği için',
    ],
    a: 1,
    exp: 'Bir orduyu yürüten şey tahıl, su ve yoldur. Sayıyı sıfatla değil aritmetikle sınarsınız — makaledeki hesaplayıcı tam da bunu yapıyor.',
  },
  {
    text: 'Batı Roma İmparatorluğu’nu kim sona erdirdi?',
    opts: ['Atilla, 452’de', 'Odoacer, 476’da', 'Aetius, 454’te', 'Vizigotlar, 410’da'],
    a: 1,
    exp: 'Atilla öleli 23 yıl olmuştu. Son imparatoru tahttan indiren, Roma ordusunun kendi subayı Odoacer’di.',
  },
  {
    text: 'Bulgar Hanları Nominaliası’ndaki "İrnik" kimle özdeşleştirilir?',
    opts: ['Atilla’nın kardeşi Bleda', 'Atilla’nın oğlu Ernak', 'Amcası Rua', 'Gepid kralı Ardaric'],
    a: 1,
    exp: 'Priskos’un da adını verdiği Ernak, Atilla’nın en küçük oğlu. Bulgar hanedan listesi soyunu Dulo üzerinden buraya bağlar.',
  },
  {
    text: '"Tanrı’nın Kırbacı" adı ne zaman ortaya çıktı?',
    opts: [
      'Atilla’nın kendi kullandığı unvandı',
      'Priskos otağda duymuştu',
      'Sonraki yüzyılların Hristiyan yorumudur',
      'Kurultayda verilmişti',
    ],
    a: 2,
    exp: 'Çağdaş hiçbir kaynak ona böyle demez. Bu ad Atilla hakkında değil, ona bakanın teolojisi hakkında bilgi verir.',
  },
];
