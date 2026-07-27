// Kanuni makalesinin TÜM metin + sayı kaynağı (client değil → JSON-LD'den de okunabilir).
//
// TEZ: Kanunu yazan adamın kendi kanununa yenilmesi. Batı "Muhteşem" dedi (gördüğü:
// taç), Doğu "Kanunî" dedi (gördüğü: nizam). İkisi de eksik — o, kurduğu makinenin
// hem mimarı hem malzemesiydi.
//
// KURAL (seri geneli): SIFAT DEĞİL, SAYI. Bir cümle "muhteşem/dâhi/zalim" diyorsa
// ya sayıya çevrilir ya silinir. Kaynaklar çelişiyorsa çelişki GÖSTERİLİR, tek
// rakam doğruymuş gibi satılmaz (bkz. MOHAC.dispute, ZIGETVAR.hiddenNote).

/* ────────────────────────── Perde 0 · Zigetvar ────────────────────────── */

export const ZIGETVAR = {
  place: 'Zigetvar',
  date: '6/7 Eylül 1566 gecesi',
  age: 71,
  campaign: 13, // şahsen çıktığı sefer sayısı
  hiddenDays: 42,
  hiddenNote:
    'Sürenin kendisi kaynaklarda değişiyor: yaygın anlatı 42 gün der, kimi kaynak daha kısa verir. Değişmeyen şey olayın kendisi: ölüm, yeni padişah orduya ulaşana kadar saklandı.',
  burial: '28 Kasım 1566',
  burialPlace: 'Süleymaniye',
  opening:
    'Macaristan’da bir kale kuşatması. Çadırda yetmiş bir yaşında bir adam ölüyor. Ordu bunu bilmiyor.',
  mechanics: [
    'Ceset tahnit edildi, iç organları çadırın kurulduğu yere gömüldü.',
    'Padişahın tahtırevanı yola devam etti; perdeleri kapalı.',
    'Divan toplandı, arzlar okundu, hükümler yazıldı.',
    'Ve her hükmün altına aynı tuğra basıldı.',
  ],
  punch:
    'Bu adam öldükten sonra bile kanunu işletiyordu. Peki yaşarken ne yaptı?',
} as const;

/* ─────────────────────── Perde 1 · İki isim + taç ─────────────────────── */

export const NAMES = {
  accession: '30 Eylül 1520',
  born: '6 Kasım 1494',
  bornPlace: 'Trabzon',
  reign: '45 yıl 11 ay 8 gün',
  west: 'Muhteşem',
  east: 'Kanunî',
  westLine:
    'Batı ona "Magnificent" dedi. Gördüğü şey ihtişamdı: elçi kabulleri, altın, ordu mevcudu, gelir.',
  eastLine:
    'Doğu ona "Kanunî" dedi. Gördüğü şey nizamdı: kanunnâme, tahrir defteri, kadı sicili.',
  punch:
    'Aynı adam. İki ayrı ad. Ve iki ad da aynı şeyi anlatıyor — biri süsünü, öteki mekanizmasını.',
} as const;

export const CROWN = {
  year: 1532,
  maker: 'Luigi Caorlini',
  city: 'Venedik',
  buyer: 'İbrahim Paşa',
  tiers: 4,
  popeTiers: 3,
  layers: [
    { n: 1, label: 'Birinci taç', text: 'Bir taç: sıradan bir kral.' },
    { n: 2, label: 'İkinci taç', text: 'İki taç: Şarlken’in imparatorluk iddiası.' },
    { n: 3, label: 'Üçüncü taç', text: 'Üç taç: Papa’nın tiarası. Hristiyan dünyasının tepe noktası.' },
    { n: 4, label: 'Dördüncü taç', text: 'Dördüncü taç: hepsinden bir fazla. Sayıyla üstünlük iddiası.' },
  ],
  reveal:
    'Bu obje bir savaş miğferi değil. Venedik’te, kuyumcu Luigi Caorlini’ye, İbrahim Paşa’nın siparişiyle yapıldı. Üstünde hilal taşıyan bir sorguç var, içinde dört taç. Papa’nın tiarası üç katlıydı; bu dört.',
  never:
    'Kaynaklar Süleyman’ın onu muhtemelen hiç takmadığını söylüyor. Miğfer, mücevherli eyer ve tahtla birlikte, Batılı elçilerin yanından geçirildiği bir masada sergilendi. Amaç savaşmak değil, Avrupa’da gravürü basılsın diye görülmekti.',
  punch:
    'Sayfanın başında hayran hayran izlediğin taç bir propaganda rekvizitiydi. Ve siparişi veren adam dört yıl sonra boğdurulacak.',
} as const;

export const NAME_SOURCES = [
  {
    name: 'Venedik balyosu',
    role: 'rakip devletin İstanbul’daki gözlemcisi',
    color: 'cobalt',
    text:
      'Balyos raporları (relazioni) Venedik senatosuna okunmak için yazılırdı: kaç asker, ne kadar gelir, hangi vezir kimin adamı. Bu kalem hükümdarın adaletiyle değil kapasitesiyle ilgilenir — bir rakibin envanteridir. "Muhteşem" sıfatı bu bakışın çocuğudur.',
  },
  {
    name: 'Osmanlı kâtibi',
    role: 'sarayın kendi kalemi',
    color: 'gold',
    text:
      'Saray tarihçisi ve münşeat kalemi başka bir şey ölçer: nizam. Padişah burada fetih makinesi değil, düzenin teminatıdır. Övgü gerçek bir inancın ifadesidir ama aynı zamanda meslektir — bu kalem maaşını saraydan alır.',
  },
  {
    name: 'Habsburg broşürü',
    role: 'düşman matbaası',
    color: 'coral',
    text:
      'Avrupa matbaalarından çıkan "Türk tehlikesi" broşürleri korku satar; korku para ve asker toplar. Buradaki Süleyman ne adildir ne muhteşem — bir doğa olayıdır. Üç kalem de aynı adamı anlatıyor ve üçü de kendi işini yapıyor.',
  },
] as const;

/* ───────────────────── Perde 2 · Kanun makinesi ───────────────────── */

export const KANUN = {
  intro:
    '"Kanunî" romantik bir övgü değil, teknik bir tanım. Osmanlı hukukunda iki kaynak yan yana çalışır: şeriat (değişmez, ilahî) ve kanun (padişahın örfî düzenlemesi — vergi, ceza, arazi, ticaret).',
  ebussuud:
    'Bu ikisinin birbirine sürtünmeden dönmesini sağlayan adam Şeyhülislam Ebussuud Efendi’dir. İşi, örfî kanunu şer’î çerçeveye oturtmaktı — yani makinenin dişlilerini birbirine geçirmek.',
  principle:
    'Kanunnâmenin ünlü ilkesi şudur: memur ya da halktan, zengin ya da fakir, şehirli ya da köylü — suç işlendiğinde kanun karşısında fark yoktur.',
  twist:
    'Ve bu makine gerçekten çalışıyordu. Makalenin geri kalanındaki trajedinin sebebi tam olarak bu: bozuk bir düzen değil, işleyen bir düzen.',
} as const;

// Not: dava tipleri Osmanlı ceza kanunnâmelerinin GENEL mantığını yansıtır
// (para cezası ağırlıklı, "cürm ü cinayet" tarifeleri). Belirli bir davanın
// birebir metni değildir — widget bunu açıkça söyler (CASES_NOTE).
export const CASES = [
  {
    id: 'tarla',
    title: 'Komşunun sınır taşını gece kaydıran adam',
    setup:
      'Köylü, komşusunun tarlasına birkaç adım girecek şekilde sınır taşını yerinden oynatmış. Şikâyet kadıya gelmiş. Sen kadısın.',
    opts: [
      { key: 'el', label: 'Ağır bedenî ceza ver' },
      { key: 'para', label: 'Taşı yerine koydur + para cezası kes' },
      { key: 'yok', label: 'Zarar küçük, davayı düşür' },
    ],
    answer: 'para',
    reveal:
      'Kanunnâme mantığı: zarar giderilir, üstüne suçlunun hâline göre değişen bir "cürm" (para cezası) kesilir. Osmanlı ceza sistemi filmlerdeki gibi kesip biçen değil, büyük ölçüde TARİFELİ bir para cezası düzenidir — ve ceza, kişinin ödeme gücüne göre kademelidir.',
  },
  {
    id: 'vergi',
    title: 'Fazla vergi toplayan sipahi',
    setup:
      'Tımar sahibi sipahi, defterde yazılı olandan fazlasını almış. Köylü doğrudan İstanbul’a şikâyet yollamış. Sen kadısın.',
    opts: [
      { key: 'sipahi', label: 'Sipahi devletin adamı, şikâyeti reddet' },
      { key: 'iade', label: 'Fazlayı iade ettir, kaydı deftere göre uygula' },
      { key: 'orta', label: 'Aradaki farkı ikiye böl, uzlaştır' },
    ],
    answer: 'iade',
    reveal:
      'Sistemin bel kemiği tahrir defteridir: her köyün ne ödeyeceği önceden yazılıdır. Sipahinin yetkisi defterle sınırlıdır; fazlası kanunsuzdur. Reayanın doğrudan merkeze şikâyet hakkı, sistemin kendi kendini denetleme mekanizmasıdır — ve gerçekten kullanılmıştır.',
  },
  {
    id: 'kadi',
    title: 'Rüşvet aldığı iddia edilen kadı',
    setup:
      'Bu kez sanık, hüküm veren adamın kendisi. Bir kadının davayı para karşılığı çevirdiği iddia ediliyor.',
    opts: [
      { key: 'dokunma', label: 'Kadıya dokunulmaz, iddia düşer' },
      { key: 'ayni', label: 'Herkesle aynı usul: yargılanır' },
      { key: 'sessiz', label: 'Sessizce başka yere tayin edilir' },
    ],
    answer: 'ayni',
    reveal:
      'Kanunnâmenin ilkesi burada sınanır: "memur ya da halktan" ayrımı yoktur. Kâğıt üzerinde görevli de yargılanır — teftiş ve şikâyet yolları vardır. Uygulamada her zaman böyle işlemedi; ama kuralın kendisi bu ayrımı tanımıyordu.',
  },
] as const;

export const CASES_NOTE =
  'Bu üç dava, Osmanlı ceza kanunnâmelerinin genel mantığını (tarifeli para cezası + defter esası + görevlinin de sorumlu olması) yansıtacak biçimde sadeleştirilmiştir; tek bir sicil kaydının birebir metni değildir.';

export const KANUN_PUNCH =
  'Şimdi aklında tut: bu makineyi kuran adam, birazdan onu kendi sofrasına çevirecek.';

/* ───────────────────────── Perde 3 · Mohaç ───────────────────────── */

export const MOHAC = {
  date: '29 Ağustos 1526',
  departure: '23 Nisan 1526',
  marchDays: 128,
  battleHours: 2,
  intro:
    'Bir krallık, öğleden sonra başlayıp akşam olmadan biten bir muharebede tarihten siliniyor.',
  dispute:
    'Sayılar kaynaklarda çelişir: Osmanlı ordusu için 50.000–60.000, Macar tarafı için 25.000–30.000 (müttefiklerle 45.000–50.000), top sayısı için 160 ile 300 arasında rakamlar verilir. Bu makale tek bir rakamı doğruymuş gibi sunmuyor — aralığı gösteriyor.',
  tactics: [
    'Üç hatlı düzen: önde hafif süvari, ortada tımarlı sipahi, arkada toplar ve yeniçeri.',
    'Hafif süvari temas edince geri çekilir — kaçış değil, davet.',
    'Kanatlar kontrollü açılır; ağır süvari içeri akar.',
    'Top hattı ve yeniçeri tüfeği, toplanmış süvariyi kapalı bir alanda karşılar.',
  ],
  king:
    'Macar kralı II. Lajos muharebede öldü; kaçarken bir dere geçidinde boğulduğu anlatılır.',
  punch:
    'Yüz yirmi sekiz gün yürüdüler. Muharebe iki saat sürdü. Bu makalenin asıl konusu o iki saat değil — o yüz yirmi sekiz gün.',
} as const;

// Savaş simülasyonunun karar ağacı (sim-mohac.tsx okur).
export const MOHAC_SIM = {
  pollKeyless: true,
  intro:
    'Sen Macar tarafındasın. Ağır zırhlı süvariye sahipsin ve bu, Avrupa’nın en iyi vuruş gücü. Karşındaki ordu üç hat hâlinde duruyor.',
  steps: [
    {
      id: 1,
      clock: '15:00',
      title: 'Karşı hattın önünde hafif süvari belirdi.',
      opts: [
        { key: 'sarj', label: 'Şarj et', out: 'Ağır süvari ilerliyor. Hafif süvari temas eder etmez geri çekiliyor.', trap: true },
        { key: 'bekle', label: 'Bekle, düzeni koru', out: 'Beklersen ne olur? Karşı taraf top hattını kurmayı bitirir. Zaman onların lehine akıyor.', trap: false },
        { key: 'kesif', label: 'Keşif kolu yolla', out: 'Keşif geri geliyor: "Arkada toplar var, sayısını göremedik." Bu bilgi karar değiştirmiyor — çünkü beklemek de kaybettiriyor.', trap: false },
      ],
    },
    {
      id: 2,
      clock: '15:40',
      title: 'Karşı hattın ortası açılıyor gibi görünüyor.',
      opts: [
        { key: 'peşine', label: 'Peşinden git, gedikten dal', out: 'Gedik bir davetti. İçeri girdikçe kanatlar arkanda kapanıyor.', trap: true },
        { key: 'dur', label: 'Dur, hattı topla', out: 'Durursan ağır süvari hızını kaybeder — ve hızını kaybetmiş ağır süvari, tüfek karşısında sadece hedef.', trap: false },
        { key: 'kanat', label: 'Kanattan dolan', out: 'Kanattan dolanmak için zaman lazım. Elinde olmayan tek şey o.', trap: false },
      ],
    },
    {
      id: 3,
      clock: '16:20',
      title: 'Toplar konuştu. Arkasından tüfek sesleri.',
      opts: [
        { key: 'ikinci', label: 'İkinci dalgayı sür', out: 'İkinci dalga birincinin üstüne biniyor. Kalabalık, top için hedefi büyütmekten başka bir işe yaramıyor.', trap: true },
        { key: 'geri', label: 'Geri çekil', out: 'Geri çekilmek düzenli yapılırsa mümkündü. Ama ağır süvari geri dönerken en savunmasız hâlindedir.', trap: false },
        { key: 'kral', label: 'Kralı sahadan çıkar', out: 'Doğru refleks — ama geç. Kral sahadan çıkarken bir dere geçidinde boğuldu.', trap: false },
      ],
    },
  ],
  verdict: 'Hangi kapıdan girdiysen aynı yere çıktın.',
  verdictSub:
    'Bu bir bilmece değil. Muharebe, top hattı zincirlenip yeniçeri arkasına yerleştiğinde çoktan kararlaştırılmıştı. Senin seçimlerin sadece ne kadar süreceğini değiştirdi.',
} as const;

/* ──────────────────── Perde 4 · Viyana ve takvim ──────────────────── */

export const CAMPAIGNS = [
  {
    key: 'belgrad',
    label: 'Belgrad',
    year: 1521,
    km: 900,
    departure: 'Mayıs 1521',
    arrival: 'Temmuz 1521',
    result: 'alındı',
    note: 'Yakın hedef. Yürüyüş kısa, kuşatma penceresi geniş.',
  },
  {
    key: 'mohac',
    label: 'Mohaç',
    year: 1526,
    km: 1300,
    departure: '23 Nisan 1526',
    arrival: '29 Ağustos 1526',
    result: 'kazanıldı',
    note: '128 gün yürüyüş, 2 saat muharebe.',
  },
  {
    key: 'viyana',
    label: 'Viyana',
    year: 1529,
    km: 1700,
    departure: '10 Mayıs 1529',
    arrival: '27 Eylül 1529',
    result: 'alınamadı',
    note: '140 gün yürüyüş. Kuşatma 16 Ekim’de kaldırıldı: 19 gün.',
  },
  {
    key: 'zigetvar',
    label: 'Zigetvar',
    year: 1566,
    km: 1450,
    departure: 'Mayıs 1566',
    arrival: 'Ağustos 1566',
    result: 'kale alındı, padişah öldü',
    note: 'Yetmiş bir yaşında, yine yolda.',
  },
] as const;

export const VIYANA = {
  intro:
    'Ders kitabı Viyana’yı "alınamadı" diye geçer ve sebebini cesarette arar. Sayılar başka bir şey söylüyor.',
  departure: '10 Mayıs 1529',
  arrival: '27 Eylül 1529',
  lifted: '16 Ekim 1529',
  marchDays: 140,
  siegeDays: 19,
  seasonEnd: 'Ekim ortası',
  why:
    'Sefer mevsimi bahar yağmurları bitince açılır (yollar çamurken ağır top geçmez, otlar bitmeden hayvan yem bulamaz) ve ekim ortasında kapanır. Bu iki tarih arasındaki her gün yürüyüşe harcanır. Viyana bu takvimin sınırında duruyordu.',
  punch:
    'İmparatorluğun sınırını cesaret çizmedi. Takvim çizdi.',
  echo:
    'Aynı hesap 1565’te Malta’yı, 1566’da Zigetvar’ı açıklar. Ve Perde 0’daki ölümü de: o adam yolda öldü, çünkü hep yoldaydı.',
} as const;

/* ─────────────────── Perde 5 · Makbul → Maktul ─────────────────── */

export const IBRAHIM = {
  date: '14/15 Mart 1536 gecesi',
  since: 1523,
  years: 13,
  intro:
    'Pargalı İbrahim. 1523’ten beri vezir-i âzam. Padişahın çocukluk arkadaşı; kaynaklara göre sarayda aynı odada kaldıkları olurdu. Sultanın kız kardeşiyle evlendi. Ve Perde 1’deki tacın siparişini o verdi.',
  night:
    'Bir gece sarayda, padişahın has odasına yakın bir yerde boğduruldu. Sabah devletin ikinci adamı yoktu.',
  name:
    'Lakabı "Makbul"dü — beğenilen, kabul gören. Sonra "Maktul" oldu — öldürülen. İki kelime arasındaki fark tek harf.',
  ferman: {
    kicker: 'FERMAN · 1536',
    body: 'Vezir-i âzam İbrahim Paşa hakkında verilen hüküm mucibince amel oluna.',
    button: 'Mührü bas',
  },
  trapReveal:
    'Tebrikler. En yakın arkadaşını öldürdün.',
  trapBody:
    'Dikkat et: bunun için hiçbir kanuna ihtiyacın olmadı. Ne mahkeme kuruldu, ne şahit dinlendi, ne bir cürm tarifesine bakıldı. Perde 2’de kurduğun o titiz makine burada hiç çalışmadı — çünkü makineyi kuran sensin ve makine senin üstüne kapanmıyor.',
  trapPunch:
    'Bu makalenin adı "Kanunî". Soru şu: kanun onun için de geçerli miydi?',
  unknown:
    'İdamın sebebi kaynaklarda net değildir. Rakip vezirlerin etkisi, İran seferinde aldığı kararlar, kendisine kullandırılan "Serasker Sultan" unvanının yarattığı rahatsızlık — hepsi öne sürülür, hiçbiri kesin değildir. Bilmediğimizi söylemek, uydurmaktan iyidir.',
} as const;

/* ────────────────────── Perde 6 · Çadır ────────────────────── */

export const MUSTAFA = {
  date: '6 Ekim 1553',
  place: 'Ereğli yakınlarındaki ordugâh',
  pollKey: 'kanuni-cadir',
  intro:
    'Sefer yolunda, ordunun ortasında. Şehzade Mustafa — kaynakların hemen hepsinin "askerin sevdiği" dediği isim — babasının otağına çağrılıyor.',
  setup:
    'Sen Mustafa’sın. Babanın ordusu etrafında. Otağa çağrıldın. Yanında kendi adamların var. Ne yaparsın?',
  truth: 'Girdi.',
  truthSub:
    'İçeride dilsizler vardı. Ordu dışarıda bekliyordu ve haber yayıldığında ordugâhta ciddi bir huzursuzluk çıktı.',
  after:
    'Hâkim anlatı, Hürrem Sultan ve vezir-i âzam Rüstem Paşa’nın tertibini anlatır; bu anlatı Osmanlı kaynaklarının çoğunda vardır. Ama tek anlatı değildir: modern çalışmalar (ör. Zahit Atçıl) Venedik arşivlerini kullanarak olayı saray içi bir kadın-vezir entrikasından çok, ordu–ulema–bürokrasi arasındaki bir güç çekişmesi olarak okur.',
  punch:
    'Üç kapı da aynı yere çıkıyor. Bu bir bilmece değil — durumun kendisi buydu.',
} as const;

export const MUSTAFA_CHOICES = [
  {
    key: 'gir',
    label: 'Otağa gir',
    sub: 'Çağrıya uy. Baban ve padişahın.',
    reveal:
      'Gerçekte yaptığı şey bu. Çağrıya uymamak zaten suçlamanın kendisini doğrulardı; uymak ise içeri girmek demekti.',
    verdict: 'Kapı kapandı.',
  },
  {
    key: 'donme',
    label: 'Girme, sancağına dön',
    sub: 'Otağa yaklaşma, adamlarınla geri çekil.',
    reveal:
      'Girmemek, tam olarak suçlandığın şeyin ispatı sayılırdı: padişahın çağrısına uymayan şehzade, isyan eden şehzadedir. Bu kapı seni suçlamadan kurtarmıyor, suçlamayı tamamlıyor.',
    verdict: 'Suçlamayı sen imzaladın.',
  },
  {
    key: 'adam',
    label: 'Adamlarınla gir',
    sub: 'Silahlı maiyetinle otağa yürü.',
    reveal:
      'Padişahın otağına silahlı maiyetle girmek, hukukun her yorumunda aynı şeydi. Kendini korumak için yaptığın hareket, öldürülmen için gereken gerekçeyi üretiyor.',
    verdict: 'Gerekçeyi sen verdin.',
  },
] as const;

/* ─────────────── Perde 7 · Kardeş katli maddesi ─────────────── */

export const BAYEZID = {
  date: '25 Eylül 1561',
  place: 'Kazvin',
  text:
    'İkinci oğul Bayezid, kardeşiyle giriştiği taht mücadelesini kaybedince İran’a, Şah Tahmasp’ın yanına kaçtı. Uzun bir pazarlığın sonunda oğullarıyla birlikte idam edildi.',
} as const;

export const KARDES = {
  pollKey: 'kanuni-kardes-katli',
  intro:
    'İki oğul gitti. Dayanak, Osmanlı hukukunun en çok tartışılan maddesiydi: nizam-ı âlem için kardeş katli.',
  link:
    'Ve o madde bu makalede ilk kez karşımıza çıkmıyor: Fatih Kanunnâmesi’nde geçer. Yani kuralı yazan, bu serinin bir önceki adamıydı.',
  question: 'Peki Fatih o maddeyi gerçekten yazdı mı?',
  bottom:
    'Dördü de aynı metne bakıyor ve dört ayrı şey görüyor. Bu makale hangisinin doğru olduğunu söylemiyor — çünkü mesele henüz kapanmadı.',
  choices: [
    { key: 'fatih', label: 'Evet, Fatih’in kaleminden çıktı' },
    { key: 'sonradan', label: 'Hayır, sonradan eklendi' },
  ],
  proofPunch: 'Kuralı yazan öldü. Kural çalışmaya devam etti.',
} as const;

export const KARDES_SOURCES = [
  {
    name: 'Kanunnâme metni',
    role: 'belgenin kendisi',
    color: 'gold',
    text:
      'Fatih Kanunnâmesi olarak bilinen metin, devlet teşkilatını ve protokolü düzenler; içinde "nizam-ı âlem" gerekçesiyle kardeş katline izin veren bir hüküm bulunur. Sorun şu: metnin bize ulaşan nüshaları Fatih döneminden değil, sonraki yüzyıllardan.',
  },
  {
    name: 'Otantik diyen görüş',
    role: 'maddeyi Fatih’e bağlayanlar',
    color: 'cobalt',
    text:
      'Bu görüşe göre madde, Fatih’in merkeziyetçi devlet inşasıyla birebir uyumludur: taht kavgalarının imparatorluğu iki kez bölmüş olması ortadadır ve Fatih bunu bizzat yaşamıştır. Kural, yaşanmış bir felaketin cevabıdır.',
  },
  {
    name: 'Sonradan eklendi diyen görüş',
    role: 'enterpolasyon tezi',
    color: 'coral',
    text:
      'Karşı görüş, elimizdeki nüshaların geç tarihli olmasına dayanır: bir hükümdarın yaptığını meşrulaştırmak için, kuralın kurucu ataya geriye dönük yazılmış olması mümkündür. Kanun bazen sebep değil, sonradan yazılmış bir mazerettir.',
  },
  {
    name: 'Uygulama tarihi',
    role: 'kural mı önce, pratik mi',
    color: 'marble',
    text:
      'Üçüncü bir bakış, tartışmanın kendisini kaydırır: kardeş katli pratiği Fatih’ten önce de vardır. O hâlde madde bir icat değil, var olan bir uygulamanın yazıya geçirilmesidir. Bu doğruysa soru "kim yazdı" değil, "yazılı hâle gelmesi neyi değiştirdi" olur.',
  },
] as const;

/* ─────────────── Perde 8 · Süleymaniye + final ─────────────── */

export const SULEYMANIYE = {
  years: '1550–1557',
  architect: 'Mimar Sinan',
  text:
    'Aynı yıllarda kanun bir de taşa yazılıyor. Mimar Sinan’ın Süleymaniye’si sadece bir cami değil: medreseleri, darüşşifası, imareti, hamamı ve çarşısıyla bir külliye — yani işleyen bir kamu düzeninin binaya dönüşmüş hâli.',
  punch:
    'Adam düzeni kâğıda yazdı, sonra taşa kazıdı. Geriye tek soru kaldı: düzen onu da kapsıyor muydu?',
} as const;

export const FINALE = {
  kicker: 'SONUNA KADAR OKUYANIN ÖDÜLÜ — VE TUZAĞI',
  title: 'Sefer devam etmeli. Tek eksik imza.',
  body: 'Zigetvar önlerindeyiz. Ordu yürüyor, divan toplandı, hüküm yazıldı. Altında bir tuğra olması gerekiyor.',
  button: 'Mührü bas — sefer devam etsin',
  result: 'Mühür basıldı. Sefer devam ediyor.',
  reveal:
    'Bunu kırk iki gün boyunca ölü bir adamın adına yaptılar. Sen de az önce ölü bir adamın imzasını attın. Ve işledi.',
  today:
    'Çünkü kanun, onu yazan adam öldükten sonra da çalışır. Asıl mesele buydu. Batı ona "Muhteşem" dedi: gördüğü şey taçtı. Doğu "Kanunî" dedi: gördüğü şey nizamdı. İkisi de eksikti — o, kurduğu makinenin hem mimarı hem malzemesiydi.',
  shareText:
    'Bir imparatorluğu 42 gün boyunca ölü bir adam yönetti. Kanuni Sultan Süleyman, kurduğu düzenin hem mimarı hem malzemesiydi.',
} as const;

/* ─────────────────────── Tuğra (final + sözlük) ─────────────────────── */

export const TUGRA_PARTS = [
  { key: 'sere', label: 'Sere', text: 'Gövde: padişahın ve babasının adının yazıldığı ana bölüm.' },
  { key: 'beyze', label: 'Beyze', text: 'Soldaki iki yumurta biçimli kavis. Dıştaki büyük, içteki küçük.' },
  { key: 'tug', label: 'Tuğ', text: 'Yukarı uzanan üç dikey elif. Tuğranın en tanınan parçası.' },
  { key: 'zulfe', label: 'Zülfe', text: 'Tuğların tepesinden sola savrulan ince kıvrımlar.' },
  { key: 'kol', label: 'Kol (hançer)', text: 'Sağa uzanan uzun kuyruk.' },
] as const;

/* ──────────────────────────── Sayılar ──────────────────────────── */

export const NUMBERS = {
  reignYears: 46,
  campaigns: 13,
  ageAtDeath: 71,
  hiddenDays: 42,
  mohacHours: 2,
  viennaMarchDays: 140,
  viennaSiegeDays: 19,
} as const;

/* ─────────────────────── Zaman çizelgesi ─────────────────────── */

export const timeline = [
  { year: '1494', title: 'Trabzon', text: '6 Kasım: şehzade Süleyman doğdu.' },
  { year: '1520', title: 'Cülus', text: '30 Eylül: yirmi beş yaşında tahta çıktı. Saltanatı 45 yıl 11 ay 8 gün sürecek — Osmanlı’nın en uzunu.' },
  { year: '1521–22', title: 'Belgrad ve Rodos', text: 'İki kilit hedef alındı. Tuna yolu ve Doğu Akdeniz aynı anda açıldı.' },
  { year: '1526', title: 'Mohaç', text: '23 Nisan’da yola çıkıldı, 29 Ağustos’ta muharebe oldu: 128 gün yürüyüş, yaklaşık 2 saat çarpışma.' },
  { year: '1529', title: 'Viyana', text: '10 Mayıs’ta çıkıldı, 27 Eylül’de varıldı, 16 Ekim’de kuşatma kaldırıldı. 140 gün yürüyüş, 19 gün kuşatma.' },
  { year: '1532', title: 'Dört taçlı miğfer', text: 'İbrahim Paşa’nın siparişiyle Venedik’te yapıldı. Papa’nın tiarası üç katlıydı; bu dört.' },
  { year: '1536', title: 'Makbul → Maktul', text: '14/15 Mart gecesi: on üç yıllık vezir-i âzam İbrahim Paşa boğduruldu.' },
  { year: '1550–57', title: 'Süleymaniye', text: 'Mimar Sinan külliyeyi tamamladı: kanun taşa yazıldı.' },
  { year: '1553', title: 'Otağ', text: '6 Ekim: Şehzade Mustafa, babasının otağında öldürüldü.' },
  { year: '1561', title: 'Kazvin', text: '25 Eylül: İran’a sığınan Şehzade Bayezid, oğullarıyla birlikte idam edildi.' },
  { year: '1566', title: 'Zigetvar', text: '6/7 Eylül gecesi padişah öldü. Ölüm gizlendi, ordu yürümeye devam etti.' },
] as const;

/* ──────────────────────────── Quiz ──────────────────────────── */

// `as const` YOK: ArticleQuiz'in QuizQuestion tipi mutable `string[]` bekliyor,
// readonly tuple ona atanamaz (tsc TS2322). Fatih/Augustus da böyle.
export const quizQs = [
  {
    text: 'Kanuni’nin Viyana seferinde (1529) yürüyüş kaç gün, kuşatma kaç gün sürdü?',
    opts: ['140 gün yürüyüş, 19 gün kuşatma', '19 gün yürüyüş, 140 gün kuşatma', 'İkisi de yaklaşık 80 gün', '60 gün yürüyüş, 90 gün kuşatma'],
    a: 0,
    exp: '10 Mayıs’ta İstanbul’dan çıkıldı, 27 Eylül’de Viyana önlerine varıldı, 16 Ekim’de kuşatma kaldırıldı. Seferin neredeyse tamamı yoldu.',
  },
  {
    text: 'Mohaç Muharebesi yaklaşık ne kadar sürdü?',
    opts: ['İki saat', 'İki gün', 'İki hafta', 'İki ay'],
    a: 0,
    exp: '29 Ağustos 1526. Ordunun oraya varması 128 gün sürdü; muharebe yaklaşık iki saatte bitti.',
  },
  {
    text: 'Dört taçlı Venedik miğferini kim sipariş etti ve kaç taçlıydı?',
    opts: ['İbrahim Paşa · dört taç', 'Süleyman’ın kendisi · üç taç', 'Papa’nın elçisi · beş taç', 'Sokollu Mehmed Paşa · iki taç'],
    a: 0,
    exp: '1532’de İbrahim Paşa’nın siparişiyle Venedik’te yapıldı. Papa’nın tiarası üç katlıydı; miğferde dört taç vardı — sayıyla üstünlük iddiası.',
  },
  {
    text: '"Kanunî" sıfatı ne anlama gelir?',
    opts: [
      'Şeriatın yanında işleyen örfî hukuku (kanun) düzenlemesi',
      'Şeriatı kaldırıp yerine laik kanun koyması',
      'Avrupa kanunlarını tercüme ettirmesi',
      'Kanunları bizzat kendi eliyle yazması'],
    a: 0,
    exp: 'Osmanlı’da şeriat ve kanun yan yana çalışır. Kanunî, örfî hukuku düzenleyip şer’î çerçeveye oturtan taraftır; bu uyumu kuran isim Şeyhülislam Ebussuud Efendi’dir.',
  },
  {
    text: 'Şehzade Mustafa otağa girmeseydi ne olurdu?',
    opts: [
      'Çağrıya uymamak, suçlandığı isyanın ispatı sayılırdı',
      'Kanunen serbest kalırdı',
      'Sancağına döner ve mesele kapanırdı',
      'Divan onu yargılamak zorunda kalırdı'],
    a: 0,
    exp: 'Üç kapı da aynı yere çıkıyordu: girmek de girmemek de silahlı girmek de. Makalenin ifadesiyle bu bir bilmece değil, durumun kendisiydi.',
  },
  {
    text: 'Kardeş katli maddesiyle ilgili tartışma nedir?',
    opts: [
      'Maddenin Fatih’e ait olup olmadığı: nüshalar geç tarihli',
      'Maddenin hiç var olmadığı',
      'Maddenin Kanuni tarafından yazıldığı',
      'Maddenin yalnız Avrupa kaynaklarında geçtiği'],
    a: 0,
    exp: 'Metin Fatih Kanunnâmesi olarak bilinir ama elimizdeki nüshalar sonraki yüzyıllardan. Otantik diyen de var, sonradan eklendiğini savunan da; üçüncü bir görüş uygulamanın zaten Fatih’ten önce var olduğunu söyler.',
  },
  {
    text: 'Kanuni öldükten sonra ne oldu?',
    opts: [
      'Ölümü ordudan gizlendi, hükümler onun tuğrasıyla çıkmaya devam etti',
      'Ordu hemen İstanbul’a döndü',
      'Sefer o gece iptal edildi',
      'Yeni padişah ertesi sabah orduya katıldı'],
    a: 0,
    exp: 'Vezir-i âzam Sokollu Mehmed Paşa ölümü sakladı; ceset tahnit edildi, tahtırevan yola devam etti, divan toplandı ve aynı tuğra basılmaya devam etti.',
  },
  {
    text: 'Bu makalenin merkez iddiası nedir?',
    opts: [
      'Kanunu yazan adam kendi kanununun dışında kaldı; makine ona işlemedi',
      'Kanuni Osmanlı’nın en zalim padişahıydı',
      'Osmanlı hukuku tamamen keyfîydi',
      'Batı kaynakları Doğu kaynaklarından daha güvenilirdir'],
    a: 0,
    exp: 'Makale ne övgü ne yergi: işleyen bir düzenin, onu kuran adamın üstüne kapanmadığını gösteriyor. Sıfat değil, sayı.',
  },
];
