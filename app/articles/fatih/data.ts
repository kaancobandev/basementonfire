// Fatih makalesinin TÜM yapısal verisi. Düz modül ('use client' YOK) → sunucu ve
// istemci aynı diziyi kullanır. Tez: OBSESYON. Fatih'i bir bayrak değil bir VAKA
// olarak anlat; kahraman da canavar da deme. Kural: SIFAT DEĞİL, SAYI. Yorumu okur
// yapar. Not: string değerleri backtick (template literal) ile yazıldı → içindeki
// düz kesme (') ve tırnak (") kaçış gerektirmez (Türkçe ekler: Konstantinopolis'i).

/* ══════════════════ PERDE 0 — Cold open: Truva ══════════════════ */

export const TROY = {
  year: 1462,
  place: `Truva harabeleri`,
  question: `Bir fikir bir insanı ne kadar ele geçirebilir?`,
  close: `İlyada'da Akhilleus bir seçim yapar: uzun ve sıradan bir hayat mı, kısa ve hatırlanan bir hayat mı? Kısa olanı seçer. Fatih o kitabı okumuştu.`,
} as const;

/* ══════════════════ PERDE 1 — Bölünmüş saray ══════════════════ */

export const COURT = {
  setup: `Ağustos 1444. Murad II tahtı bırakıyor ve yerine on iki yaşındaki oğlunu oturtuyor. Avrupa haçlı ordusu topluyor, saray ikiye bölünüyor. Terazinin iki kefesi:`,
  left: {
    key: `halil`,
    name: `Çandarlı Halil Paşa`,
    title: `Vezîriâzam · temkin`,
    stance: `Bizans'a dokunmayalım`,
    args: [
      `Devlet daha yeni Varna'yı, Kosova'yı gördü; hazine ve ordu bir kuşatmayı kaldırmaz.`,
      `Konstantinopolis 1123 yıldır ayakta; yirmiden fazla kuşatma gördü, biri hariç hepsini kırdı.`,
      `Şehri sıkıştırmak Batı'yı yeni bir haçlı seferinde birleştirir. Riski kazancından büyük.`,
    ],
  },
  right: {
    key: `zaganos`,
    name: `Zağanos & Şihabeddin Paşa`,
    title: `Genç sultanın adamları · risk`,
    stance: `Şehir alınmalı`,
    args: [
      `Şehir devletin tam ortasında bir yabancı ada; Rumeli ile Anadolu'yu ikiye bölüyor.`,
      `Bizans elindeki Osmanlı şehzadelerini bir koz gibi kullanıyor, sürekli taht kavgası körüklüyor.`,
      `Barut ve top değişti; 1123 yıllık matematik artık geçerli değil. Fırsat şimdi.`,
    ],
  },
  verdict: `1446'da terazi sola yattı: Halil Paşa yeniçerileri ayaklandırdı, Murad'ı geri çağırdı, çocuğu tahttan indirdi. 1453'te, fetihten üç gün sonra, aynı Halil Paşa idam edildi.`,
} as const;

export const MANISA = {
  dethronedAge: 14,
  years: 6,
  ciriaco: `Manisa'da altı yıl. Kendini hâlâ meşru sultan sayıyor ve okuyor: sarayında İtalyan hümanist Ancona'lı Ciriaco var; Yunan filozoflarını, Roma tarihini, İskender'i, Sezar'ı okuyor. Altı yıl boyunca bir çocuk, bir şehre bakıp duruyor.`,
} as const;

/* ══════════════════ PERDE 2 — Boğazkesen ══════════════════ */

export const BOSPHORUS = {
  name: `Boğazkesen`,
  altName: `Rumeli Hisarı`,
  start: `Nisan 1452`,
  end: `Ağustos 1452`,
  months: [`Nisan`, `Mayıs`, `Haziran`, `Temmuz`, `Ağustos`],
  buildDays: `4,5 ay`,
  narrowestPoint: `Boğaz'ın en dar noktası`,
  facingKm: 0.66,
  shipsPassed: 0,
  gun: `Kalenin toplarına "menzili boğazı geçen top" densin diye Boğazkesen adı verildi; karşı kıyıda dedesi Yıldırım'ın Anadolu Hisarı zaten duruyordu. İki kale arasından geçen her buğday gemisi artık iki ateş hattının arasından geçmek zorunda.`,
  protest: `Bizans elçileri protesto için geldiğinde kimse "savaş" demedi. Sadece bir bina yapıldı. Şehrin gıdası dışarıdan, Karadeniz'den geliyordu; kuşatma başlamadan aylar önce, bir kaleyle başladı.`,
  layers: [
    { key: `temel`, label: `Temeller`, at: 0.12 },
    { key: `kule-guney`, label: `Halil Paşa Kulesi`, at: 0.34 },
    { key: `kule-kuzey`, label: `Saruca Paşa Kulesi`, at: 0.56 },
    { key: `kule-deniz`, label: `Zağanos Paşa Kulesi`, at: 0.74 },
    { key: `surlar`, label: `Ara surlar + toplar`, at: 0.92 },
  ],
} as const;

/* ══════════════════ PERDE 3 — Bir matematik problemi ══════════════════ */

export const WALLS = {
  standingYears: 1123,
  lengthKm: 5.7,
  layers: 3,
  siegesSeen: `20+`,
  lost: 1,
  lostYear: 1204,
  name: `Teodosius Surları`,
  detail: `Üç katman: hendek, dış sur, iç sur. Sırayla aşman gerekiyor ve her katman bir öncekinden yüksek. Merdivenle aşamazsın; açlıkla düşüremezsin, çünkü deniz açık.`,
} as const;

export const URBAN = {
  name: `Urban`,
  origin: `Macar ya da Transilvanyalı dökümcü`,
  firstWent: `Önce Bizans imparatoruna gitti; imparator ödeyemedi.`,
  sultanPaid: `Sonra Edirne'ye gitti. Sultan istediğini sordu; Urban söyledi. Sultan dört katını verdi.`,
} as const;

// Perde 3 sayı tablosu — "sıfat değil, sayı". Son satır (atış/gün) hikâyenin kalbi.
export const CANNON: { label: string; value: string; key?: boolean }[] = [
  { label: `Namlu boyu`, value: `~8,2 m` },
  { label: `Cidar kalınlığı`, value: `~20 cm` },
  { label: `Gülle ağırlığı`, value: `~540 kg` },
  { label: `Menzil`, value: `1,6–1,9 km` },
  { label: `Döküm süresi`, value: `3 ay` },
  { label: `Edirne → Konstantinopolis`, value: `230 km` },
  { label: `Taşıma ekibi`, value: `60–90 öküz · 200–400 adam` },
  { label: `Atış hızı`, value: `günde 3–7`, key: true },
];

export const RACE = {
  point: `Namlu ısınıyor, çatlıyor, soğutulması gerekiyor. Yani: gündüz top duvarı deliyor, gece savunmacılar toprak, moloz ve kütükle deliği dolduruyor. Haftalarca. Ve haftalarca savunmacılar kazanıyor.`,
  thesis: `Bu bir kuşatma değil. Bu bir yarış — top ile kürek arasında.`,
} as const;

// Oynanabilir kuşatma simülasyonunun modeli (sim-siege.tsx). Model KASITLI: hangi
// ayarı seçersen seç sur DÜŞMEZ (denge değeri hep > 0). Tez bu: topu gece onarımı
// dengeliyordu; kuşatmayı top bitirmedi. "Üretken başarısızlık."
export const SIEGE = {
  days: 54,
  shots: { min: 3, max: 7, default: 5, step: 1, label: `Atış / gün` },
  crew: { min: 500, max: 3000, default: 1500, step: 250, label: `Onarım ekibi` },
  eqFloor: 18,
  eqCeil: 82,
  crewDivisor: 300,
  closer: `Sen de düşüremedin. Fatih de düşüremedi. Kuşatmayı top bitirmedi.`,
  next: `Peki ne bitirdi?`,
} as const;

/* ══════════════════ PERDE 4 — Gemiler karadan ══════════════════ */

export const NIGHT = {
  date: `22 Nisan 1453`,
  chain: `Haliç'in ağzına gerilmiş kalın, demir, şamandıralı zincir. Donanma giremiyor.`,
  aprilTwenty: `20 Nisan'da savunma bir zafer kazandı: dört gemi Osmanlı donanmasını yararak zincirin ardına geçti. Şehirde çanlar çaldı.`,
  distanceM: 1500,
  fromHour: 21,
  toHour: 28,
  ships: 30,
  ridge: `Galata'nın sırtından geçen bir kızak yolu: yağlanmış kütükler, öküzler, insan gücü.`,
  after: `Zincir hâlâ yerindeydi. Anlamı kalmamıştı. Şimdi savunma, zaten yetmeyen 7.000 adamı bir cephe daha uzatarak bölmek zorundaydı.`,
  chainDead: `Zincir yerinde. İşlevi yok.`,
  stages: [
    { key: `plan`, at: 0.0, title: `21:00 — Karar`, text: `Zincir kırılamıyor. Sultan zinciri kırmaktan vazgeçip aşmaya karar veriyor: gemiler suda değil, karada gidecek.` },
    { key: `yol`, at: 0.28, title: `22:00 — Kızak yolu`, text: `Boğaz'dan Haliç'e, Galata'nın arkasından bir güzergâh döşeniyor. Kütükler yağlanıyor, tekerlekli kızaklar hazırlanıyor.` },
    { key: `tepe`, at: 0.58, title: `01:00 — Tepe`, text: `Gemiler öküz ve insan gücüyle yokuş yukarı çekiliyor. Yelkenler açık, davullar çalıyor — hem moral hem gürültü perdesi.` },
    { key: `inis`, at: 0.82, title: `03:00 — İniş`, text: `Sırtın öte yüzünde gemiler Haliç'in sularına indiriliyor. Zincirin gerisine, savunmanın yumuşak karnına.` },
    { key: `sabah`, at: 1.0, title: `04:00 — Sabah`, text: `Savunmacılar Haliç'e bakıyor: içeride yaklaşık otuz Osmanlı gemisi. Zincir hâlâ orada; artık bir işe yaramıyor.` },
  ],
} as const;

/* ══════════════════ PERDE 5 — Elli dördüncü gün ══════════════════ */

export const OMENS = {
  eclipse: `22 Mayıs: ay tutulması. Şehirde kehanet dolaşıyor — ay küçüldüğünde şehir düşer diye.`,
  storm: `Ertesi günlerde fırtına, sis ve Ayasofya'nın kubbesi üzerinde görüldüğü söylenen kızıl bir ışık. Kaynaklar kaydediyor; muhtemelen alacakaranlık optiği. O gece kimse öyle düşünmedi.`,
} as const;

export const ASSAULT = {
  date: `29 Mayıs 1453`,
  waves: `Sabaha karşı saldırı başlıyor. Üç dalga. İlk ikisi kırılıyor.`,
  giustiniani: `Savunmanın komutanı Giovanni Giustiniani vuruluyor: Cenevizli, kuşatma savaşı uzmanı, Ocak'ta 700 adamıyla gelmiş adam. Yaralı halde gemisine taşınıyor; adamları komutanlarının gittiğini görüyor. Moral çöküyor.`,
  kerkoporta: `Kerkoporta — küçük bir yan kapı. Dukas'a göre açık unutulmuş, Osmanlı askerleri içeri sızmış, burçlara sancak dikmiş.`,
  constantine: `İmparator XI. Konstantin son görüldüğünde surlara doğru gidiyordu. Cesedi hiç bulunamadı. Bu boşluk yüzyıllarca efsane üretti.`,
  entry: `Öğleden sonra sultan şehre giriyor ve Ayasofya'ya gidiyor. Yirmi bir yaşında. Beş yıldır bu kapıyı düşünüyordu — Manisa'dan beri.`,
  kerkoportaMyth: `Kerkoporta anlatısı büyük ölçüde tek kaynağa (Dukas) dayanıyor ve tarihçiler arasında tartışmalı. Bazıları gerçek bir ihmal, bazıları düşüşü açıklamak için sonradan üretilmiş bir motif olarak görür. Aşağıdaki Kaynak Karşılaştırıcı tam da bu yüzden var: aynı an, dört kaleme göre dört farklı düşüyor.`,
} as const;

export const DECISION = {
  pollKey: `fatih-son-karar`,
  setup: `27 Mayıs. Sen XI. Konstantin'sin. Elinde 7.000 adam var. Karşında 80.000. Batı'dan söz verilen donanma ufukta yok. Sıra sende. Ne yaparsın?`,
  truth: `Üçü de denendi ya da düşünüldü. Şehir yine düştü.`,
  truthSub: `Bazı hikâyelerde seçim sonucu değiştirmez — sadece nasıl hatırlanacağını. Yine de iki bin yıl sonra bile okurlar aynı sahnede bölünüyor. Senin durduğun yer nerede?`,
} as const;

export const DECISION_CHOICES = [
  {
    key: `bekle`,
    label: `Batı'dan yardım bekle`,
    sub: `Papalık ve İtalyan devletleri söz verdi — donanma gelene kadar dayan.`,
    reveal: `Denedi. 1439'da kiliseleri birleştirme kararına (Floransa) rağmen Batı ordusu gelmedi. Venedik ve Ceneviz kendi çıkarını korudu; söz verilen büyük donanma hiç ufukta belirmedi.`,
    verdict: `Beklediğin yardım yola bile çıkmadı.`,
  },
  {
    key: `harac`,
    label: `Haraç öner, şehri kurtar`,
    sub: `Anlaşma teklif et; vergi ve tavizle şehri ayakta tut.`,
    reveal: `Denendi. Sultan, teslim karşılığında imparatora Mora'da bir despotluk teklif etti; müzakere yolları açıktı. İmparator reddetti: kaynaklara göre şehri teslim etmeye yetkisi olmadığını, halkla birlikte kalacağını söyledi.`,
    verdict: `Teklif reddedildi — iki taraftan da.`,
  },
  {
    key: `savun`,
    label: `Sur başında savun`,
    sub: `Surda kal, sonuna kadar savaş.`,
    reveal: `Muhtemelen olan bu. XI. Konstantin son görüldüğünde surlara doğru gidiyordu; cesedi bulunamadı. İmparatorluk unvanını taşıyan biri değil, sur başındaki bir asker gibi kayboldu.`,
    verdict: `Hatırlanan seçim bu oldu — ama şehri kurtarmadı.`,
  },
];

/* ══════════════════ PERDE 6 — İkinci hayat ══════════════════ */

export const KAYSER = {
  title: `Kayser-i Rûm`,
  meaning: `Roma Kayzeri`,
  logic: `Mantığı soğuk ve basit: Konstantinopolis 330'dan beri Roma'nın başkentiydi. Başkenti kim tutuyorsa imparator odur — fetih hakkı.`,
  west: `Batı krallarının çoğu bu iddiayı reddetti.`,
  patriarch: `Ama Konstantinopolis Patrikhanesi tanıdı — çünkü sultan patrikhaneyi kendi eliyle yeniden kurdu; boşalan makama Gennadios II Skolarios'u atadı.`,
  bridge: `Augustus'un iki bin yıl önce kurduğu makamın — princeps, sonra imperator — son sahibi 1453'te bu surlarda öldü. Ve o surları aşan adam, boşalan koltuğa oturup kendine bir Roma unvanı seçti.`,
} as const;

export const SECOND_LIFE = [
  { key: `kuscu`, title: `Ali Kuşçu`, text: `Dönemin en büyük astronomlarından; Semerkand'dan İstanbul'a davet edildi.` },
  { key: `sahn`, title: `Sahn-ı Seman`, text: `1470'te tamamlandı. Sekiz büyük, sekiz küçük medrese, 216 öğrenci odası; teoloji, hukuk, tıp, astronomi, matematik. Öğrencilere ücretsiz barınma ve yemek. İstanbul'un ilk yükseköğretim kurumu.` },
  { key: `bellini`, title: `Gentile Bellini`, text: `Venedik'ten geldi (1479), sultanın portresini yaptı. Portrenin kemeri üzerinde bir Latince ibare: dünyanın fatihi. Bir Osmanlı padişahı, kendi yüzünü bir Venedik ressamına, Rönesans üslubunda yaptırıyor.` },
  { key: `kanunname`, title: `Fatih Kanunnâmesi`, text: `İdari, mali ve cezai düzenlemeler tek metinde. Fatih, ceza ve teşkilat hukukunu derleyen ilk Osmanlı padişahı sayılır — Kanuni'den yaklaşık bir asır önce.` },
];

export const NUMBERS = {
  land0: 880000,
  land1: 2214000,
  campaigns: 25,
  giovanni: `İtalyan Giovanni Maria, sultan için 4.706 dizelik Latince bir methiye yazdı. Aynı Avrupa hem "Türk korkusu" broşürleri bastırıyor hem de aynı adama epik şiir yazıyordu.`,
  cem: `1472'de bazı devlet adamları küçük oğlu Cem'i tahta geçirmek için komplo kurdu; komplo açığa çıktı. Erken yıllarında sosyal olarak tanınan adam giderek içine kapandı, şüpheci oldu, suikast önlemleri aldı.`,
  line: `Takıntı bir şeyler kurar. Aynı takıntı seni yalnızlaştırır.`,
} as const;

// Fatih'in Kütüphanesi — tıklanabilir raf. Her kitap: neden bu kitap? (2 cümle).
export const LIBRARY_BOOKS = [
  { key: `ilyada`, title: `İlyada`, author: `Homeros`, why: `Kaynaklara göre Homeros'u ezberden bilir, kendini destanın içindeki bir karakter olarak görürdü. Truva ziyareti bu kitaptan çıktı.` },
  { key: `cografya`, title: `Coğrafya`, author: `Batlamyus`, why: `Batlamyus'un dünya haritasını Yunancadan çevirtti ve kendi adının haritaya işlenmesini istedi. Bir şehir değil, bir dünya haritası istiyordu.` },
  { key: `anabasis`, title: `İskender'in Seferleri`, author: `Arrianos`, why: `İskender'in seferlerini anlatan temel kaynak. Fatih, İskender ve Sezar'la kıyaslanmayı arar; onların yürüdüğü yolu okurdu.` },
  { key: `oklid`, title: `Elementler (Geometri)`, author: `Öklid`, why: `Sur, top menzili, kızak eğimi — hepsi geometri. Sarayında matematik ve mühendislik başucu bilimiydi.` },
  { key: `almagest`, title: `Almagest (Astronomi)`, author: `Batlamyus`, why: `Ali Kuşçu'yu davet eden sultanın merakı gökyüzüne de uzanıyordu. Takvim, kıble ve kehanet aynı gökten okunurdu.` },
  { key: `filozoflar`, title: `Ünlü Filozofların Hayatları`, author: `Diogenes Laertios`, why: `Yunan felsefe geleneğinin toplu biyografisi. Sultan Yunan filozoflarını Manisa'daki sürgününden beri okuyordu.` },
  { key: `kuran`, title: `Kur'an-ı Kerim`, author: `—`, why: `Bir Osmanlı padişahının başucu metni. Aynı raf hem bunu hem İlyada'yı taşıyordu — çelişki değil, aynı merakın iki ucu.` },
  { key: `aristo`, title: `Organon (Mantık)`, author: `Aristoteles`, why: `Medrese eğitiminin ve dönemin akıl yürütme dilinin temeli. Kararların gerekçelendirildiği çerçeve buydu.` },
  { key: `tarih`, title: `Roma Tarihi`, author: `Livius / Yunan kaynakları`, why: `Kayser-i Rûm unvanını alan adam, Roma'nın kendi hikâyesini kaynağından okumak isterdi. İddia, tarih bilgisi üzerine kuruluydu.` },
  { key: `incil`, title: `Hristiyan İnancı Üzerine`, author: `Gennadios II`, why: `Atadığı patriğe Hristiyan inancını anlatan bir risale yazdırdı ve Türkçeye çevirtti. Fethettiği inancı da tanımak istiyordu.` },
  { key: `harita`, title: `Portolan Haritalar`, author: `—`, why: `Akdeniz ve Karadeniz kıyı haritaları. Donanma, Otranto ve sonraki seferler bu çizgilerin üstünde planlandı.` },
  { key: `iskendername`, title: `İskendernâme`, author: `Ahmedî`, why: `İskender'i bir İslam-Doğu kahramanı olarak yeniden anlatan Türkçe mesnevi. Batı'nın İskender'i ile Doğu'nun İskender'i aynı rafta.` },
];

/* ══════════════════ PERDE 6 — Kaynak Karşılaştırıcı (imza öğe) ══════════════════ */

export const FALL_COMPARE = {
  event: `Şehir nasıl düştü? — 29 Mayıs 1453, aynı an`,
  question: `Dördü de o gün oradaydı. Sekmelere dokun: aynı olay değişsin.`,
  bottom: `Dördü de oradaydı. Dördü de farklı şey anlatıyor. Tarih böyle bir şey — ve doğrulama tam olarak bu yüzden zor.`,
  sources: [
    {
      key: `kritovulos`,
      name: `Kritovulos`,
      role: `Sultanın kendi tarihçisi · Rum`,
      color: `gold` as const,
      text: `Düzenli bir ordunun kaçınılmaz zaferi; sultan bir hükümdar gibi tasvir edilir. Ama Kritovulos aynı zamanda Rum'dur: şehrin düşüşünü neredeyse bir ağıtla anlatır. Hem galibin tarihçisi hem yıkılanın çocuğu.`,
    },
    {
      key: `dukas`,
      name: `Dukas`,
      role: `Bizans · düşman kalem`,
      color: `crimson` as const,
      text: `Dramatik ve suçlayıcı. Düşüşü ihanete ve ilahi cezaya bağlar; açık unutulan Kerkoporta kapısı onun anlatısının merkezindedir. Suç, günah ve kader — olayın "neden"i onun için "nasıl"ından önemli.`,
    },
    {
      key: `barbaro`,
      name: `Nicolò Barbaro`,
      role: `Venedikli gemi doktoru · günlük`,
      color: `water` as const,
      text: `Kuşatma boyunca gün gün günlük tuttu: saatler, gemi sayıları, hangi burç ne zaman. En "ölçülü" kaynak — ama Venedikli gözüyle; Cenevizlileri suçlamaya, kendi tarafını aklamaya meyilli. Sayılar tarafsız değil, seçilmiştir.`,
    },
    {
      key: `tursun`,
      name: `Tursun Bey`,
      role: `Osmanlı · olayda hazır`,
      color: `marble` as const,
      text: `Sarayın perspektifinden, zaferi bir takdir-i ilahi olarak anlatır. Yine de sultanın harap şehri görünce duyduğu hüznü kaydeder — galip taraf bile yıkımı bir kayıp gibi yazabiliyor. Resmî anlatının içindeki insani çatlak.`,
    },
  ],
} as const;

/* ══════════════════ PERDE 7 — Hünkâr Çayırı + jüri ══════════════════ */

export const OTRANTO = {
  landing: `Temmuz 1480. Gedik Ahmed Paşa komutasındaki donanma İtalya'nın topuğuna çıkıyor.`,
  fell: `11 Ağustos 1480'de Otranto düşüyor. Bir Osmanlı ordusu İtalya toprağında.`,
  target: `Hedef Otranto değildi. Hedef Roma'ydı. Doğu Roma'yı almış olan adam, Batı Roma'yı da alarak iddiasını tamamlamak istiyordu.`,
  dateConflict: `Otranto'nun düşüş tarihi kaynaklarda 26 Temmuz ile 11 Ağustos 1480 arasında değişir. TDV ve Tansel'e göre: 26–28 Temmuz çıkarma, 11 Ağustos düşüş; Türkçe haber kaynaklarının çoğu ikisini karıştırır. Aynı Kaynak Karşılaştırıcı sorunu, altı yüz yıl sonra hâlâ iş başında.`,
} as const;

export const LAST_CAMPAIGN = {
  april: `Nisan 1481. Sultan yeni bir sefer için Üsküdar'dan doğuya çıkıyor. Nereye gittiğini kimse bilmiyordu — Rodos mu, İtalya mı, Memlükler mi? Sefer sır tutuluyordu; tarihçiler hâlâ bilmiyor.`,
  place: `Gebze yakınlarında, Hünkâr Çayırı denen yerde hastalanıyor. Gut hastası.`,
  death: `Kırk dokuz yaşında.`,
  aquila: `Ölüm haberi Avrupa'ya ulaşınca kutlamalar başladı, kiliselerde çanlar çaldı. Venedik'te haber şöyle ilan edildi: "La Grande Aquila è morta!" — Büyük Kartal öldü.`,
  aftermath: `Oğulları Bayezid ve Cem taht için savaştı. Gedik Ahmed Paşa 1 Haziran 1481'de Otranto'yu bırakıp Bayezid'e destek vermeye döndü; İtalya'daki ordu takviye alamadı, Otranto boşaltıldı. Roma hiç gelmedi.`,
} as const;

export const POISON = {
  pollKey: `fatih-zehir`,
  question: `Sence zehirlendi mi?`,
  heywood: `Tarihçi Colin Heywood'a göre zehirlendiğine dair ciddi dolaylı deliller var — muhtemelen büyük oğlu ve halefi Bayezid'in isteğiyle. Kanıtlanmadı. Kanıtlanamaz da.`,
  historiansVerdict: `Tarihçiler karar veremedi.`,
  discuss: `Sen ne düşünüyorsun? Aşağıdaki tartışma bölümünde yaz.`,
} as const;

export const POISON_EVIDENCE = [
  {
    key: `lehte`,
    stance: `lehte` as const,
    title: `Zehir lehine`,
    text: `Ölüm ani ve seferin başındaydı. Bir hekim değişimi ve zehirleme söylentisi dönemin kaynaklarında dolaşır. Ve motif açık: ölümü, halefi Bayezid'i doğrudan tahta yaklaştırdı. Heywood'un dolaylı delil dediği tam da bu örüntü.`,
  },
  {
    key: `aleyhte`,
    stance: `aleyhte` as const,
    title: `Hastalık lehine`,
    text: `Fatih'in kronik gut hastalığı ve son yıllarında kötüleşen sağlığı kayıtlı. Kırk dokuz yaşında, ağır bir seferin ilk gününde bir gut/organ krizi olağan dışı değil. Zehir iddialarının çoğu olaydan sonra, sebep aramak için üretilir.`,
  },
  {
    key: `belirsiz`,
    stance: `belirsiz` as const,
    title: `Belirsiz`,
    text: `Kaynaklar suskun ya da çelişkili; kesin bir otopsi, itiraf ya da belge yok. Heywood'un cümlesi burada duruyor: "Kanıtlanmadı, kanıtlanamaz da." Karar senin — ama emin olamayacağını bilerek.`,
  },
];

export const POISON_CHOICES = [
  { key: `zehir`, label: `Zehirlendi` },
  { key: `hastalik`, label: `Hastalıktan öldü` },
];

/* ══════════════════ Kapanış ══════════════════ */

export const CLOSE = {
  tomb: `Kendi mezarı İstanbul'da, Fatih Camii'nin yanında. Yaptırdığı külliyenin içinde. Aldığı şehrin ortasında.`,
  ring: `Otuz yaşındaki sultan, ölmüş bir kahramanın mezarı başında, tarihin devamını yazdığını söylüyordu.`,
} as const;

/* ══════════════════ Zaman çizelgesi + quiz ══════════════════ */

export const timeline = [
  { year: `1432`, title: `Doğum`, text: `Edirne'de Murad II'nin oğlu olarak dünyaya geldi. Küçük yaşta Manisa'ya sancağa gönderildi.` },
  { year: `1444`, title: `On iki yaşında tahtta`, text: `Babası tahtı bıraktı ve on iki yaşındaki oğlunu oturttu. Sonuç: haçlı seferi, bölünmüş saray, felaket.` },
  { year: `1446`, title: `İndirildi`, text: `Çandarlı Halil Paşa yeniçerileri ayaklandırdı; çocuk sultan tahttan indirildi, Manisa'ya gönderildi. On dört yaşında.` },
  { year: `1451`, title: `İkinci kez tahtta`, text: `Murad ölünce on dokuz yaşında ikinci kez tahta çıktı. Avrupa'nın tepkisi: rahatlama. "Aynı zararsız çocuk."` },
  { year: `1452`, title: `Boğazkesen`, text: `Boğaz'ın en dar noktasına dört buçuk ayda bir kale kurdu. Boğaz kapandı; şehrin gıdası kesildi. Kuşatmadan aylar önce.` },
  { year: `1453`, title: `Fetih`, text: `29 Mayıs. Elli dördüncü gün. Yirmi bir yaşında şehre girdi. Beş yıldır bu kapıyı düşünüyordu.` },
  { year: `1470`, title: `Sahn-ı Seman`, text: `Sekiz medrese, 216 oda, ücretsiz barınma. Yıkıcıdan kurucuya: İstanbul'un ilk yükseköğretim kurumu.` },
  { year: `1480`, title: `Otranto`, text: `Donanma İtalya'nın topuğuna çıktı, Otranto düştü. Hedef Otranto değil, Roma'ydı.` },
  { year: `1481`, title: `Hünkâr Çayırı`, text: `Nereye gittiği sır tutulan bir seferde, Gebze yakınında hastalanıp öldü. Kırk dokuz yaşında. Roma hiç gelmedi.` },
];

export const quizQs = [
  {
    text: `Perde 3'teki sayılara göre kuşatmayı esas ne belirledi?`,
    opts: [`Urban'ın topu tek başına surları yıktı`, `Top ile gece onarımı arasındaki yarış`, `Açlık; deniz kapalıydı`, `Merdivenli hücumlar`],
    a: 1,
    exp: `Top günde ancak 3–7 kez ateşlenebiliyordu (namlu ısınıp çatlıyordu); gündüz açılan gediği savunmacılar gece dolduruyordu. Kuşatma bir yarıştı ve haftalarca savunma kazandı — topu top bitirmedi.`,
  },
  {
    text: `Boğazkesen (Rumeli Hisarı) ne zaman ve neyi yaptı?`,
    opts: [`Kuşatma sırasında; moral verdi`, `1452'de; Boğaz'ı kapatıp şehrin gıdasını kesti`, `1453'te; surları dövdü`, `Fetihten sonra; şehri korudu`],
    a: 1,
    exp: `Kale 1452'de, dört buçuk ayda kuruldu ve Boğaz'ı kapattı. Karadeniz'den gelen buğday gemileri iki kalenin topu arasından geçmek zorunda kaldı; kuşatma fiilen aylar önce, bir binayla başladı.`,
  },
  {
    text: `22 Nisan 1453 gecesi Osmanlı gemileri Haliç'e nasıl girdi?`,
    opts: [`Zinciri kırarak`, `Karadan, Galata sırtından yaklaşık 1,5 km yürütülerek`, `Gizli bir tünelden`, `Şafakta baskınla`],
    a: 1,
    exp: `Zincir kırılamadığı için aşıldı: yağlanmış kütükler üzerinde, öküz ve insan gücüyle yaklaşık otuz gemi tek gecede tepeden aşırıldı. Zincir yerinde kaldı ama işlevi kalmadı.`,
  },
  {
    text: `Fatih'in aldığı "Kayser-i Rûm" unvanının mantığı neydi?`,
    opts: [`Halifelik iddiası`, `Başkenti tutan imparatordur — fetih hakkı`, `Bizans hanedanından soy iddiası`, `Papalığın onayı`],
    a: 1,
    exp: `Konstantinopolis 330'dan beri Roma'nın başkentiydi; başkenti tutan imparator sayılırdı. Batı çoğunlukla reddetti, ama sultanın yeniden kurduğu Patrikhane tanıdı. Augustus'un kurduğu makamın çizgisi buraya bağlanır.`,
  },
  {
    text: `Hünkâr Çayırı'ndaki ölümün sebebi kaynaklarda nasıl geçer?`,
    opts: [`Kesin: savaşta öldü`, `Kesin: zehirlendi`, `Belirsiz: gut/hastalık kayıtlı, zehir iddiası kanıtlanmamış`, `Kesin: yaşlılık`],
    a: 2,
    exp: `Fatih gut hastasıydı ve 49 yaşında bir seferin başında öldü. Heywood zehirlenmeye dair dolaylı deliller olduğunu söyler ama "kanıtlanamaz" da ekler. Sıfat değil, sayı: kesinlik yok, ihtimaller var.`,
  },
];
