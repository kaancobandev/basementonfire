// Sezar makalesinin TÜM verisi. Düz modül ('use client' YOK) → hem sunucu
// (page.tsx / JSON-LD) hem istemci (widgets) aynı diziyi kullanabilir.
//
// KURAL: her tartışmalı sayının yanında kaynağı ve güvenilirliği yazar.
// Bu makale antik rakamları "veri" gibi kullanmaz; onları KARŞILAŞTIRIR.
// Caesar kendi propagandasını yazdı, Plutarkhos 150 yıl sonra yazdı,
// Nicolaus 23 değil 35 yara saydı. Çatlaklar gizlenmiyor — gösteriliyor.

/* ══════════════════ PERDE 1 — Fidye kaydırıcısı ══════════════════ */

export const RANSOM = {
  asked: 20, // korsanların istediği (Plutarkhos, Caesar 2)
  demanded: 50, // Caesar'ın "bu kadar ederim" dediği
  days: 38, // esaret süresi (Plutarkhos)
  min: 5,
  max: 100,
  // 1 Attika talenti ≈ 26 kg gümüş. 50 talent ≈ 1.300 kg gümüş
  // ≈ 300.000 denarius ≈ 1,2 milyon sesterce.
  kgPerTalent: 26,
  denariiPerTalent: 6000,
  // Bir lejyonerin yıllık maaşı ~225 denarius (Caesar döneminde 900 sesterce).
  legionaryYearDenarii: 225,
} as const;

/** Okurun seçtiği fidyeye verilen tepki — hepsi aynı yere çıkar. */
export function ransomVerdict(t: number): { tone: 'low' | 'mid' | 'high' | 'caesar'; text: string } {
  if (t >= RANSOM.demanded) {
    return { tone: 'caesar', text: 'Caesar da tam olarak bunu düşündü. Korsanlara kendi fidyesini yükseltti.' };
  }
  if (t >= 30) return { tone: 'high', text: 'Yüksek bir rakam. Yine de Caesar’ın kendine biçtiği değerin altında.' };
  if (t >= RANSOM.asked) return { tone: 'mid', text: 'Korsanların istediği kadar. Caesar bunu bir hakaret saydı.' };
  return { tone: 'low', text: 'Caesar’a sorsan: kendini bu kadar ucuza satmak, ölmekten beterdi.' };
}

/* ══════════════════ PERDE 2 — Üçlü denge ══════════════════ */

export type TriumvirKey = 'caesar' | 'pompeius' | 'crassus';

export const TRIUMVIRS: { key: TriumvirKey; name: string; title: string; has: string; lacks: string; note: string }[] = [
  {
    key: 'crassus',
    name: 'Crassus',
    title: 'Roma’nın en zengin adamı',
    has: 'Para',
    lacks: 'Saygınlık',
    note: 'Serveti Plutarkhos’a göre 7.100 talent, Plinius’a göre 200 milyon sesterce. Yanan evleri yok pahasına satın alıp Roma’nın büyük bölümünü mülk edindi.',
  },
  {
    key: 'pompeius',
    name: 'Pompeius',
    title: 'Roma’nın en ünlü generali',
    has: 'Şöhret',
    lacks: 'Senato’da destek',
    note: '“Magnus” (Büyük) lakabını yirmili yaşlarında aldı; kaynaklar lakabı Sulla’nın mı verdiği, kendisinin mi benimsediği konusunda ayrışır.',
  },
  {
    key: 'caesar',
    name: 'Caesar',
    title: 'Borç içinde bir aday',
    has: 'İkisini aynı masaya oturtabilme',
    lacks: 'Her şey',
    note: 'Kamu görevine başlamadan önce 1.300 talent borcu olduğu söylenir (Plutarkhos). Crassus 830 talentine kefil oldu.',
  },
];

export type Bond = {
  a: TriumvirKey;
  b: TriumvirKey;
  label: string;
  breaks: { year: number; how: string };
};

// Dünyayı bir arada tutan iki ip. Perde 4'te ikisi de kopar.
export const BONDS: Bond[] = [
  {
    a: 'caesar',
    b: 'pompeius',
    label: 'Evlilik',
    breaks: {
      year: -54,
      how: 'Julia doğum sırasında öldü. Bebek de birkaç gün sonra gitti. Caesar kızını, Pompeius’la arasındaki tek insani bağı kaybetti.',
    },
  },
  {
    a: 'caesar',
    b: 'crassus',
    label: 'Servet',
    breaks: {
      year: -53,
      how: 'Crassus Carrhae’de Partlara yakalandı; ordusu imha edildi, kendisi öldürüldü. Üçlü’yü ayakta tutan para gitti.',
    },
  },
  {
    a: 'pompeius',
    b: 'crassus',
    label: 'Ortaklık',
    breaks: {
      year: -53,
      how: 'Aralarındaki tek şey zaten Caesar’dı.',
    },
  },
];

export const JULIA = {
  marriedYear: -59,
  juliaAge: 17,
  pompeiusAge: 47,
  pompeiusOlderThanCaesar: 6,
  note: 'Tamamen soğuk bir siyasi işlemdi. Sonra ikisi birbirine gerçekten bağlandı; Roma, Pompeius’un artık savaşa gitmek istemediğini dedikodu yaptı.',
} as const;

/* ══════════════════ PERDE 3 — Galya: bedel haritası ══════════════════ */

export type GaulYear = {
  year: number;
  title: string;
  text: string;
  /** Haritada o yıl "Roma"ya geçen bölgeler (şematik SVG bölge anahtarları). */
  regions: string[];
  /** O yılın BELGELENMİŞ rakamı (varsa) — uydurma yok. */
  figure?: { value: string; label: string; source: string };
  /** Bu yılın tonu: sefer mi, katliam mı, yenilgi mi? */
  tone: 'sefer' | 'katliam' | 'yenilgi' | 'zafer';
};

// Şematik bölge anahtarları (coğrafi hassasiyet iddiası yok):
// gu = güney (Provincia), or = orta, ku = kuzey (Belgae), ba = batı (Armorika),
// do = doğu (Ren boyu), me = merkez (Arverni/Alesia).
export const GAUL_YEARS: GaulYear[] = [
  {
    year: -58,
    title: 'Helvetii ve Ariovistus',
    text: 'Caesar, göç eden Helvetii’yi durdurmakla işe başladı; ardından Germen kralı Ariovistus’u Galya’dan sürdü. Sefer, bir savunma savaşı olarak sunuldu.',
    regions: ['gu', 'do'],
    tone: 'sefer',
    figure: {
      value: '368.000',
      label: 'Caesar’a göre göç eden Helvetii; savaştan sonra dönen 110.000',
      source: 'Caesar, BG 1.29 — tabletlerden okuduğunu söyler; modern tarihçiler rakamı şüpheyle karşılar',
    },
  },
  {
    year: -57,
    title: 'Belgae ve Nervii',
    text: 'Kuzey kabileleri Roma’ya karşı birleşti. Sabis’te (Sambre) Nervii, Caesar’ın ordusunu neredeyse dağıtıyordu; Caesar bizzat ön hatta girdi.',
    regions: ['ku'],
    tone: 'sefer',
  },
  {
    year: -56,
    title: 'Veneti: bir ders',
    text: 'Atlantik kıyısındaki Veneti donanmasıyla yenildi. Caesar, teslim olan kabilenin bütün senatosunu idam ettirdi ve geri kalan herkesi köle olarak sattırdı — kendi ifadesiyle, “örnek olsun diye”.',
    regions: ['ba'],
    tone: 'katliam',
    figure: {
      value: 'Bütün senato idam, halk köle',
      label: 'Veneti’ye verilen ceza',
      source: 'Caesar, BG 3.16 — cezayı kendisi yazar',
    },
  },
  {
    year: -55,
    title: 'Usipetes, Tencteri ve Ren',
    text: 'Ateşkes görüşmesine gelen Germen elçileri alıkonuldu; lidersiz kampa saldırıldı; kaçan kadın ve çocukların peşine süvari gönderildi. Bunu düşman propagandası söylemiyor — bizzat Caesar yazıyor. Aynı yıl Ren’e köprü kuruldu.',
    regions: ['do'],
    tone: 'katliam',
    figure: {
      value: '430.000',
      label: 'Caesar’ın verdiği düşman toplamı',
      source: 'Caesar, BG 4.15 — modern tarihçiler neredeyse oybirliğiyle imkânsız bulur; Cato, Senato’da Caesar’ın Germenlere teslim edilmesini önerdi',
    },
  },
  {
    year: -54,
    title: 'Britannia ve Eburonlar’ın pususu',
    text: 'İkinci Britanya seferi bir şey getirmedi. Kışın Ambiorix’in Eburonları, Sabinus ve Cotta’nın bir buçuk lejyonunu pusuya düşürüp yok etti. Caesar’ın Galya’daki en ağır kaybı.',
    regions: ['ku'],
    tone: 'yenilgi',
  },
  {
    year: -53,
    title: 'Eburonlar: “soyu ve adı”',
    text: 'Misilleme, bir kabileyi cezalandırmak değil, ortadan kaldırmaktı. Caesar, Eburonların “soyunun ve adının” silinmesini hedef olarak yazar ve komşu halkları toprağı yağmalamaya davet eder.',
    regions: ['ku', 'do'],
    tone: 'katliam',
    figure: {
      value: 'stirps ac nomen',
      label: '“Soyu ve adı” silinsin — niyetin kendi kalemiyle beyanı',
      source: 'Caesar, BG 6.34 — soykırım tartışmasının en güçlü metinsel dayanağı',
    },
  },
  {
    year: -52,
    title: 'Avaricum, Gergovia, Alesia',
    text: 'Galya sonunda birleşti. Caesar Avaricum’u alıp içindekileri kılıçtan geçirdi, Gergovia’da yenildi, sonra Alesia’da imkânsızı yaptı. Bu yıl, savaşın da Galya’nın da kaderiydi.',
    regions: ['me', 'or'],
    tone: 'zafer',
    figure: {
      value: '40.000’den 800',
      label: 'Avaricum’da katledilenler: Caesar’a göre 40.000 kişiden yalnızca 800’ü kurtuldu',
      source: 'Caesar, BG 7.28 — kendi rakamı',
    },
  },
  {
    year: -51,
    title: 'Uxellodunum: eller',
    text: 'Son direnişçiler teslim olunca Caesar hayatlarını bağışladı — ama silah tutmuş herkesin ellerini kestirdi ve serbest bıraktı. Amaç öldürmek değil, canlı bir uyarı üretmekti.',
    regions: ['gu', 'me'],
    tone: 'katliam',
    figure: {
      value: 'Eller kesildi',
      label: 'Direnenlerin elleri kesilip salıverildi',
      source: 'Hirtius, BG 8.44 — Caesar’ın subayının yazdığı 8. kitap',
    },
  },
  {
    year: -50,
    title: 'Sessizlik',
    text: 'Galya diye bir yer kalmamıştı. Roma vardı.',
    regions: ['gu', 'or', 'ku', 'ba', 'do', 'me'],
    tone: 'zafer',
  },
];

/** Sekiz yılın bedeli. ÜÇ kaynak, ÜÇ farklı rakam — makale bunları uzlaştırmaz, yan yana koyar. */
export const GAUL_TOLL = [
  {
    key: 'velleius',
    who: 'Velleius Paterculus',
    when: 'MS ~30',
    dead: '400.000+',
    enslaved: '“daha da fazlası”',
    note: 'Caesar’a sempatiyle yazan, en erken kaynak. Ölü sayısını 1 milyon değil, 400 binin üstünde verir.',
  },
  {
    key: 'plutarkhos',
    who: 'Plutarkhos',
    when: 'MS ~110',
    dead: '1.000.000',
    enslaved: '1.000.000',
    note: 'En ünlü rakam. Plutarkhos, Caesar’ın karşısına çıkan 3 milyon kişiden bir milyonunu öldürüp bir milyonunu esir ettiğini yazar. Kaynağını vermez.',
  },
  {
    key: 'appianos',
    who: 'Appianos',
    when: 'MS ~160',
    dead: '1.000.000',
    enslaved: '1.000.000',
    note: 'Aynı ölü/esir rakamı, ama savaşılan toplam 3 değil 4 milyon, kabile sayısı 300 değil 400. Antik gelenek kendi içinde bile tutmuyor.',
  },
] as const;

export const GAUL_MODERN_NOTE =
  'Modern tarihçiler bu rakamların hiçbirini sayım verisi saymaz (David Henige’in ünlü makalesi tam da bu sayıları söker). Ama “rakam şişkin” demek “katliam yok” demek değildir: Kurt Raaflaub ve Adrian Goldsworthy gibi tarihçiler de seferin olağanüstü acımasız olduğunu, sayısını bilmediğimiz kadar insanın öldürüldüğünü ve köleleştirildiğini söyler. Dürüst formül şu: ölçek büyüktü, sayı bilinmiyor.';

export const GAUL_THIRD_MYTH =
  '“Galya nüfusunun üçte biri öldü, üçte biri köle oldu” cümlesi bir çıkarım hatasıdır: Plutarkhos’un 3 milyonu Galya’nın nüfusu değil, Caesar’ın karşısına çıkan insan kitlesidir. Galya’nın gerçek nüfusu için modern tahminler 5 ile 10 milyon arasında oynar — yani belirsizlik hem payda hem paydadadır.';

/* ══════════════════ PERDE 3 — Ren köprüsü ══════════════════ */

export const RHINE = {
  days: 10,
  daysNote: 'Caesar’ın cümlesi tam olarak şudur: kereste toplanmaya başlandıktan on gün sonra bütün iş bitmiş ve ordu karşıya geçirilmişti (BG 4.18). Yani 10 gün, malzeme tedarikini de içerir.',
  daysAcross: 18,
  legions: 'Bilinmiyor — Caesar köprünün uzunluğunu, genişliğini, yerini hiç yazmaz.',
  principle:
    'Kazık çiftleri dik değil, eğik çakılıyordu: biri akıntı yönünde, karşısındaki akıntıya karşı. Aradaki kirişler bir kama gibi kilitleniyordu. Caesar’ın kendi övüncü: “suyun kuvveti ne kadar şiddetlenirse, bağ o kadar sıkılaşırdı.”',
  fate: 'söktü',
  fateNote:
    'YAYGIN HATA: “Caesar köprüyü yaktı” denir. Hiçbir antik kaynak bunu söylemez. Caesar “rescidit” yazar — kesip söktü. Fark önemlidir: yakmak geri dönüşü olmayan bir panik imasıdır; sökmek ise “ne zaman istersem yenisini kurarım” demektir.',
  second: 'MÖ 53’te ikinci bir köprü kurdu — bu sefer köprü başında dört katlı bir kule ve 12 kohortluk garnizon bıraktı.',
  purpose:
    'Caesar gemiyle geçmeyi “kendisinin ve Roma halkının onuruna yakışır” bulmadığını açıkça yazar. Harekât hiçbir muharebe üretmedi. Askerî değil, mesajdı.',
} as const;

/* ══════════════════ PERDE 3 — Alesia ══════════════════ */

export const ALESIA = {
  year: -52,
  innerMiles: 11,
  innerKm: 16.3,
  outerMiles: 14,
  outerKm: 20.7,
  innerLabel: 'İç hat (kaleye bakan)',
  outerLabel: 'Dış hat (kurtarma ordusuna bakan)',
  castella: 23, // iç hat üzerindeki tahkimli tabya sayısı (BG 7.69)
  inside: 80000,
  insideNote: 'Caesar’ın verdiği seçme piyade sayısı (BG 7.71). Kentin sahibi Mandubii sivilleri bu sayıya dahil değil.',
  relief: 250000,
  reliefCav: 8000,
  reliefNote:
    'Caesar 250.000 piyade + 8.000 süvari der (BG 7.76). Modern tarihçiler bunu lojistik olarak savunulamaz bulur; yaygın tahmin 50.000–100.000 arası. Plutarkhos ise daha da abartır: içeride 170.000, dışarıda 300.000.',
  romans: '~40.000–60.000',
  romansNote:
    'Caesar Alesia’da kendi asker sayısını HİÇ vermez — bu bilinçli bir anlatı tercihi sayılır (az sayıyla çoğu yenme etkisi). Rakam modern rekonstrüksiyondur.',
  terms: 'Caesar “circumvallatio/contravallatio” terimlerini hiç kullanmaz; bunlar erken-modern istihkâm literatüründen gelir ve popüler kaynaklarda sık sık ters kullanılır. Güvenli olan: iç hat 11 mil, dış hat 14 mil.',
} as const;

/** Alesia sahneleri — pinlenmiş bölüm bunları sırayla açar. Sıra = "aa" anının kendisi. */
export const ALESIA_STAGES = [
  {
    key: 'kale',
    title: 'Kale',
    text: 'Vercingetorix, kaybettiği bir süvari muharebesinden sonra Alesia tepesine çekildi. Yanında 80.000 savaşçı vardı. Caesar’ın işi basit görünüyordu: bekle, açlık halletsin.',
  },
  {
    key: 'ic',
    title: 'İç hat: 11 mil',
    text: 'Caesar kalenin çevresine bir sur ördü. Hendekler, kuleler, 23 tabya; toprağa gömülü sivri kütükler (cippi), konik çukurlardaki kazıklar (lilia), demir kancalı tuzaklar (stimuli). Askerler tuzaklara isim takmıştı — “zambaklar”, “mahmuzlar”. Vercingetorix artık kutudaydı.',
  },
  {
    key: 'ufuk',
    title: 'Ufukta toz',
    text: 'Sonra haber geldi: bütün Galya, Vercingetorix’i kurtarmak için toplanıyordu. Bir ordu geliyordu — ve Caesar’ın adamlarından kat kat fazlaydı. Normal bir general geri çekilirdi.',
  },
  {
    key: 'dis',
    title: 'Dış hat: 14 mil',
    text: 'Caesar geri çekilmedi. Birinci surun etrafına, dışa dönük İKİNCİ bir sur inşa etti. Aynı anda hem kuşatan hem kuşatılan taraf oldu: içeride 80.000, dışarıda on binlerce, ortada iki duvar arasına sıkışmış Caesar.',
  },
  {
    key: 'kriz',
    title: 'Mont Réa',
    text: 'Vercassivellaunus, 60.000 seçme adamla kuzeybatıdaki zayıf noktayı buldu — arazi yüzünden Roma kampının sırtın altında kaldığı yeri. Hat çöküyordu. Caesar kırmızı pelerinini giyip bizzat göründü ve süvarisini düşmanın arkasından soktu.',
  },
  {
    key: 'teslim',
    title: 'Teslim',
    text: 'Kurtarma ordusu dağıldı. Ertesi gün Vercingetorix teslim oldu. Caesar onu zincirledi ve altı yıl canlı tuttu — öldürmek için değil, Roma’daki zafer alayında sokaklarda sürüklemek için.',
  },
] as const;

export const VERCINGETORIX_NOTE =
  'Vercingetorix’in en iyi zırhını kuşanıp atıyla Caesar’ın etrafında bir tur attığı sahne yalnızca Plutarkhos’ta vardır. Caesar’ın kendi metni (BG 7.89) şaşırtıcı derecede kurudur: silahlar atılır, lider teslim edilir, hepsi bu. Cassius Dio ise bambaşka bir sahne anlatır — sessizce diz çöküp yalvaran bir adam. Nerede tutulduğunu ve nasıl öldürüldüğünü hiçbir antik kaynak yazmaz; “Tullianum’da boğuldu” cümlesi Roma âdetinden yapılmış bir çıkarımdır.';

/* ══════════════════ PERDE 4 — Rubicon ══════════════════ */

export const RUBICON = {
  pollKey: 'sezar-rubicon',
  year: -49,
  legion: 'Legio XIII',
  troops: '~5.000 piyade + 300 atlı',
  quoteLatin: 'IACTA ALEA EST',
  quoteGreek: 'ἀνερρίφθω κύβος',
  quoteNote:
    'Suetonius’un elyazmalarında söz “iacta alea est” sırasıyla geçer; bugün ünlü olan “alea iacta est” dizilişi sonraki bir düzenlemedir. Plutarkhos ise sözü Yunanca verir — Menandros’tan gelen eski bir atasözü — ve bu bir EMİR kipidir: “zar atılsın.” Adam dünyayı ateşe verirken bile edebiyat alıntısı yapıyordu.',
  dignitas:
    'Caesar sebebini tek kelimeyle açıkladı: dignitas. Bunu “onur” diye çevirirsek yanlış anlarız. Dignitas, bir Romalının hayatı boyunca biriktirdiği her şeyin toplamıydı — başarıları, mevkileri, adının ağırlığı; kimliğin kendisi. Caesar kendi İç Savaş’ında dignitas’ını hayatından üstün tuttuğunu yazar.',
  bothSides:
    'Ve şunu net söyleyelim: karşı taraf da aynı adamdı. Pompeius da tam olarak aynı mantıkla savaştı. Cumhuriyet, iki adamın da geri adım atamayacağı bir sistem üretmişti.',
} as const;

export type RubiconChoice = {
  key: string;
  label: string;
  sub: string;
  headline: string;
  screens: string[];
  verdict: string;
};

export const RUBICON_CHOICES: RubiconChoice[] = [
  {
    key: 'dagit',
    label: 'Orduyu dağıt',
    sub: 'Yasaya uy. Tek başına Roma’ya dön.',
    headline: 'Yasaya uydun.',
    screens: [
      'Ordunu dağıttığın an valiliğinin dokunulmazlığı biter.',
      'Roma’ya vardığında düşmanların seni Galya’da yaptıklarından yargılar. Cato yeminle söz vermişti: seni mahkemeye verecek.',
      'En iyi ihtimalle sürgün. Servetine el konur, adın silinir, yirmi yılın hiç yaşanmamış olur.',
      'Bu, bir Romalı için ölümden beterdi. Adı vardı: dignitas’ın ölümü.',
    ],
    verdict: 'Hayatta kalırdın. Caesar olmazdın.',
  },
  {
    key: 'gec',
    label: 'Rubicon’u geç',
    sub: 'Ordunla ilerle. Vatana ihanet.',
    headline: 'Sınırı geçtin.',
    screens: [
      'Rubicon önemsiz bir deredir; üzerinden atlayabilirsin. Ama yasal olarak bir çizgidir: bir general ordusuyla o dereyi geçemez.',
      'Geçersen artık general değil, düşmansın. Roma’ya karşı savaş.',
      'Dört yıl iç savaş. Pharsalus, Mısır, Afrika, Munda. On binlerce Romalı, birbirini.',
      'Ve sonunda Cumhuriyet — kurtarmaya çalıştığın ya da yıkmaya çalıştığın şey — geri gelmemek üzere gider.',
    ],
    verdict: 'Caesar olurdun. Ve on beş yıl sonra bıçaklanırdın.',
  },
];

export const RUBICON_TRUTH = 'O geçti.';

/* ══════════════════ PERDE 4 — Pharsalus ══════════════════ */

export const PHARSALUS = {
  year: -48,
  date: '9 Ağustos MÖ 48',
  caesarInfantry: 22000,
  pompeiusInfantry: 45000,
  caesarCav: 1000,
  pompeiusCav: 7000,
  fourthLine: 6, // kohort
  fourthLineNote: 'Caesar üçüncü hattan çektiği 6 kohortla süvarinin karşısına gizli bir DÖRDÜNCÜ HAT (quarta acies) kurdu — bunu kendi Bellum Civile’sinde (3.89–94) anlatır.',
  faceOrder:
    '“Yüze nişan alın” emri Caesar’ın kendi metninde YOKTUR. Emri de, gerekçesini de Plutarkhos aktarır (Caesar 45) — ve gerekçeyi Caesar’ın kendi sözü olarak verir: karşıdaki süvari Roma’nın en zengin ailelerinin genç oğullarıydı; ölmekten değil, çirkinleşmekten korkuyorlardı.',
  quote: 'Lidersiz bir orduyla savaşmaya gidiyorum ki sonra ordusuz bir liderle savaşabileyim.',
  quoteSource: 'Suetonius, Divus Iulius 34 — İspanya’ya, Pompeius’un ordusunun üzerine yürürken',
} as const;

export const POMPEIUS_END = {
  killer: 'Lucius Septimius — Pompeius’un eski subayı',
  killerNote: 'Appianos katilin adını Septimius değil “Sempronius” verir; kaynaklar burada da çelişir.',
  scene:
    'Cinayet küçük bir kayıkta işlendi. Septimius arkadan kılıçla vurdu; centurio Salvius ve komutan Achillas hançerlerini sapladı. Pompeius togasını yüzüne çekip sessizce öldü. Karısı Cornelia her şeyi gemiden izledi.',
  caesarReaction:
    'Caesar’a kesik baş ve mühür yüzüğü sunuldu. Kaynaklar bir ayrımı korur: Caesar başı görünce dehşetle yüzünü çevirdi — ağlaması yüzüğü aldığında geldi.',
  theodotus:
    'Fikri veren danışman Theodotus yıllar sonra bulunup öldürüldü. Kimin öldürdüğü konusunda kaynaklar ayrışır: Brutus mu, Cassius mu?',
} as const;

/* ══════════════════ PERDE 5 — Clementia + reformlar ══════════════════ */

export const CLEMENTIA = {
  policy:
    'Caesar’ın merhameti bir ruh hali değil, ilan edilmiş bir politikaydı; kendi sözleriyle “yeni bir fetih yöntemi”. Sulla kazandığında forumda ölüm listeleri asmıştı. Caesar hiç proscriptio ilan etmedi.',
  pardoned: [
    { name: 'Marcus Brutus', how: 'Pharsalus’ta karşı safta savaştı. Caesar askerlerine özellikle onu sağ yakalamalarını emretti.' },
    { name: 'Cassius Longinus', how: 'Pompeius’un donanma komutanıydı, Caesar’ın gemilerine saldırdı. Affedildi, sonra praetor yapıldı.' },
    { name: 'Cicero', how: 'Pharsalus’tan sonra aylarca bekletildi, sonra bağışlandı.' },
    { name: 'Quintus Ligarius', how: 'Afrika’da Pompeiusçulara komuta etti. Cicero’nun savunmasını dinleyen Caesar duygulandı ve beraat ettirdi.' },
    { name: 'Marcus Marcellus', how: 'Senato’nun toplu ricası üzerine affedildi. Cicero bunun üzerine Pro Marcello’yu söyledi.' },
  ],
  trap:
    'Birini affetmek için önce onu öldürebilecek konumda olmanız gerekir. Merhamet, gücün en saf gösterisidir — çünkü kararın tamamen size ait olduğunu ilan eder. Caesar bir senatörü affettiğinde ona şunu söylemiş oluyordu: yaşıyorsun çünkü ben izin verdim.',
  cicero: {
    public: 'Cicero, Pro Marcello’da Caesar’ın merhametini alenen göklere çıkardı.',
    private:
      'Ama özel mektuplarında aynı merhameti “insidiosa clementia” — sinsi, tuzaklı merhamet — diye niteledi (Ad Atticum 8.16.2). Başka bir mektupta Caesar’ın doğuştan merhametli olmadığını, merhameti popüler bulduğu için sürdürdüğünü aktarır (Att. 10.4.8).',
    warning:
      'Dolaşımdaki “Cicero, bu adamın merhameti zulümden daha korkutucu dedi” alıntısı bu haliyle hiçbir antik metinde YOKTUR. Gerçek olan, alıntıdan daha iyi: Cicero aynı merhameti alenen övüp gizlice “sinsi” diye adlandırıyordu.',
  },
  dignitasDeath:
    'Affedilmek bir Romalı aristokrat için katlanılabilir bir şey değildi: bağışlanan adam her sabah hayatını bir başkasının keyfine borçlu olduğunu hatırlıyordu. Bu, dignitas’ın ölümüydü — Caesar’ın Rubicon’u geçmesine sebep olan şeyin tam olarak aynısı. (Not: bu yorum modern akademide standarttır ama tartışmasız değil; David Konstan gibi isimler kaynakların bunu yeterince desteklemediğini savunur.)',
} as const;

export const REFORMS = [
  {
    icon: '📅',
    title: 'Takvim',
    text: 'Rahipler siyasi çıkar için ay ekleyip çıkarıyordu; takvim mevsimlerden yaklaşık iki ay sapmıştı. Caesar İskenderiyeli gökbilimci Sosigenes’i getirtti ve güneş yılına dayalı yeni bir takvim yaptırdı. Düzeltmek için MÖ 46’yı 445 gün yaptı — tarihin en uzun yılı. Bu takvim, küçük bir düzeltmeyle hâlâ duvarınızda asılı.',
  },
  {
    icon: '🏛️',
    title: 'Vatandaşlık',
    text: 'Po’nun kuzeyindeki Galyalılara tam Roma vatandaşlığı verdi. Senato’yu 900 kişiye çıkardı ve içine taşralıları, askerleri, azatlı oğullarını soktu. Roma seçkinleri bundan nefret etti; “Senato’ya giden yolu soran Galyalı” hicivleri dolaştı. Ve bu politika, imparatorluğun yüzyıllarca ayakta kalmasının sebeplerinden biri oldu.',
  },
  {
    icon: '💰',
    title: 'Borç',
    text: 'Ekonomi çökmüştü. Caesar borçları tamamen silmedi (radikal tabanı bunu istiyordu), ama ödenmiş faizleri anaparadan düşürdü ve mülk değerlemesini savaş öncesine sabitledi. Suetonius bununla borcun yaklaşık dörtte birinin silindiğini yazar. Herkes kısmen memnun oldu; yani kimse memnun olmadı; yani muhtemelen doğru karardı.',
  },
  {
    icon: '🌾',
    title: 'Gaziler',
    text: '80.000 vatandaşı denizaşırı kolonilere yerleştirdi — Roma’nın bir zamanlar yerle bir ettiği iki şehri, Korint’i ve Kartaca’yı yeniden kurarak. (Kartaca’nın fiilen iskânı onun ölümünden sonraya sarktı.)',
  },
];

export const PLANS = [
  'Fucinus gölünü boşaltmak',
  'Pomptine bataklıklarını kurutmak',
  'Korint kıstağını kanalla kesmek (2.000 yıl sonra kesildi)',
  'Roma medeni hukukunu derleyip kodlamak',
  'Roma’nın ilk halka açık kütüphanesini kurmak — görev Varro’ya verildi',
  'Partlara sefer düzenlemek',
];

export const PLANS_SOURCE = 'Suetonius, Divus Iulius 44. (Popüler listelerde geçen “Tiber’in yatağını değiştirmek” maddesi Suetonius’ta yoktur.)';

/* ══════════════════ PERDE 5 — Taç ══════════════════ */

export const LUPERCALIA = {
  date: '15 Şubat MÖ 44',
  title: 'dictator perpetuo',
  titleNote:
    'Roma’da diktatörlük yasal bir makamdı — ama altı ayla sınırlıydı. Acil durum freniydi; bütün mantığı geçici olmasındaydı. “Ömür boyu diktatör” ifadesi, kelimenin kendisini yok ediyordu. Ve rex — kral — 450 yıldır küfürdü.',
  // Kaç kez sunuldu? Kaynaklar birbirini tutmuyor. "Üç kez" rakamı ANTİK DEĞİL.
  sources: [
    { who: 'Cicero (Philippica 2.85)', when: 'Olaydan ~7 ay sonra — TEK GÖRGÜ TANIĞI', says: 'Sayı vermez. Ama tekrarlılık bildiren kip kullanır: “Sen diademi koyup duruyordun, halk iniltiyle; o reddediyordu, alkışlarla.” Ve suçlar: “Diademi yerden almadın — evden getirdin.”' },
    { who: 'Plutarkhos (Caesar 61)', when: 'MS ~110', says: 'İKİ kez. İlk sunuşta önceden ayarlanmış cılız bir alkış; Caesar reddedince herkes alkışladı. İkincisinde yine aynı.' },
    { who: 'Suetonius (Iul. 79)', when: 'MS ~121', says: '“saepius” — birkaç kez, tekrar tekrar. Sayı yok.' },
    { who: 'Cassius Dio (44.11)', when: 'MS ~230', says: 'TEK sunum. Ve Antonius diademi Caesar’ın başına bağlar.' },
    { who: 'Şamlı Nikolaos (21)', when: 'MÖ ~14 — en erken', says: 'Bambaşka bir sahne: taç önce ayaklarının dibine bırakılır, sonra komplocu Cassius diademi Caesar’ın kucağına koyar, sonra Antonius başına koyar; Caesar tacı kapıp kalabalığa fırlatır.' },
  ],
  threeTimesMyth:
    '“Antonius tacı üç kez sundu” cümlesi hiçbir antik kaynakta yoktur. Üç rakamı Shakespeare’den gelir (Julius Caesar, I.ii — Casca’nın anlattığı sahne). İki bin yıldır tarih diye okuduğumuz şeyin bir kısmı, aslında bir oyun.',
  refusal:
    'Kesin olan: Caesar reddetti, kalabalık coştu, diadem Capitolium’a gönderildi. “Roma’nın tek kralı Jüpiter’dir” sözü ise yalnızca Cassius Dio’da geçer.',
  fasti:
    'Ve Caesar reddi resmî devlet takvimine (fasti) yazdırdı. Bu, sahnenin bir anket olarak kullanıldığının en somut kanıtıdır: cevap “hayır”dı. Ama Caesar’ı mahveden şey cevap değil, sorunun sorulmuş olmasıydı.',
} as const;

/* ══════════════════ PERDE 6 — İdus ══════════════════ */

export const OMENS = [
  {
    icon: '🔮',
    title: 'Spurinna',
    text: 'Kâhin, Caesar’ı Mart’ın İdus’unu geçmeyecek bir tehlikeye karşı uyarmıştı. 15 Mart sabahı Caesar onu görünce şaka yaptı: “İdus geldi.” Spurinna cevap verdi: “Evet. Ama geçmedi.”',
  },
  {
    icon: '🌙',
    title: 'Calpurnia',
    text: 'Karısı o gece kâbus gördü. Sabah gitmemesi için yalvardı. Caesar önce kabul etti.',
  },
  {
    icon: '🤝',
    title: 'Decimus Brutus',
    text: 'Sonra bir senatör geldi ve onu ikna etti: bir kadının rüyası yüzünden Senato ertelenir miydi? O senatörün adı Decimus Brutus’tu — Caesar’ın en yakın subaylarından biri, vasiyetinde ikinci derece varis, doğacak çocuğuna vasi. Komplonun içindeydi.',
  },
  {
    icon: '📜',
    title: 'Artemidorus',
    text: 'Yolda Knidoslu bir Yunan, komplonun bütün detaylarını yazdığı bir ruloyu Caesar’a tutuşturdu ve “hemen, kendin oku” diye ısrar etti. Caesar okuyamadı; kalabalık eline onlarca dilekçe tutuşturuyordu. Rulo, açılmamış hâlde, öldüğünde hâlâ elindeydi.',
  },
];

export const IDES = {
  place:
    'Senato o gün Forum’da değil, Pompeius Tiyatrosu’na bağlı kuryada toplanıyordu. Yani Caesar, on altı yıl önce kızıyla evlendirdiği, sonra uğruna dünyayı savaşa soktuğu, sonra bir sepette başını gördüğü adamın — Pompeius’un — kendi heykelinin dibinde öldü.',
  signal: 'Tillius Cimber, sürgündeki kardeşi için dilekçe verme bahanesiyle yaklaştı ve Caesar’ın togasını iki omzundan çekti. İşaret buydu.',
  firstBlow:
    'İlk vuran Casca oldu. Beceriksizce. Caesar döndü ve kolunu yakaladı — kaynaklara göre elindeki yazı kalemiyle (stylus) Casca’nın kolunu deldi.',
  wounds: 23,
  woundsNote:
    'Suetonius, Plutarkhos ve Appianos 23 yara der. Ama kronolojik olarak EN ERKEN tam anlatım — Şamlı Nikolaos — 35 yara yazar. Sağlam bir uzlaşı yok.',
  autopsy:
    'Hekim Antistius cesedi inceledi (tarihe geçen ilk otopsi raporu) ve şunu buldu: 23 yaradan yalnızca biri ölümcüldü. İkincisi. Göğse. Diğer yirmi ikisi Caesar’ı öldürmedi.',
  herd:
    'Bu bir suikast değil, bir sürü davranışıydı. Herkesin bıçağını sokması gerekiyordu, çünkü hepsi ortak olmalıydı, çünkü hiçbiri tek başına sorumlu olmak istemiyordu. Kalabalıkta birbirlerini de yaraladılar: Marcus Brutus elinden yaralandı.',
  lastWords:
    '“Et tu, Brute?” demedi. O Shakespeare’in. Suetonius, Caesar’ın hiçbir şey söylemeden öldüğünü yazar; bazılarının Yunanca “καὶ σύ, τέκνον” (sen de mi, evladım?) dediğini aktardığını ekler — ama kendisi buna inanmaz. Cassius Dio da sessiz ölüm versiyonunu en doğru anlatım sayar.',
  plutarch:
    'Plutarkhos ise şunu yazar: Caesar direniyordu, bıçakları savuşturuyordu, dövüşüyordu. Sonra Brutus’u gördü. Ve dövüşmeyi bıraktı; togasını başının üstüne çekti. (Düzgün düşmek için eteklerini topladığı ayrıntısı Plutarkhos’a değil, Suetonius’a aittir — ölürken bile pozisyonunun nasıl görüneceğini düşünüyordu.)',
} as const;

/* ══════════════════ PERDE 6 — 23 yara ══════════════════ */

export type Debt = 'affedildi' | 'odullendirildi' | 'ikisi-de' | 'hicbiri' | 'bilinmiyor';

export const DEBT_META: Record<Debt, { label: string; short: string; color: string }> = {
  'ikisi-de': { label: 'Önce affedildi, sonra terfi ettirildi', short: 'Af + terfi', color: '#e11d48' },
  affedildi: { label: 'Caesar’a karşı savaştı — Caesar onu affetti', short: 'Affedildi', color: '#f472b6' },
  odullendirildi: { label: 'Caesar’ın kendi adamıydı — makam, valilik, konsüllük aldı', short: 'Ödüllendirildi', color: '#d9a441' },
  hicbiri: { label: 'Ne af ne ödül aldı', short: 'Borcu yok', color: '#6ba8c9' },
  bilinmiyor: { label: 'Caesar’la ilişkisine dair hiçbir kayıt yok', short: 'Bilinmiyor', color: '#6b6169' },
};

export type Mark = {
  id: number;
  /** Silüet üzerindeki konum (viewBox 0 0 200 440). Yaraların GERÇEK yeri bilinmiyor;
   *  konumlar temsilîdir. Kaynakta yeri geçen birkaç darbe `sourced` ile işaretli. */
  x: number;
  y: number;
  kind: 'komplocu' | 'olumcul' | 'isimsiz';
  name?: string;
  who?: string;
  debt?: Debt;
  detail?: string;
  fate?: string;
  /** Bu darbenin yeri/sahibi antik kaynakta geçiyor mu? */
  sourced?: string;
};

// 23 işaret = 23 yara (Suetonius/Plutarkhos/Appianos).
// 20’si adı bilinen komplocuları, 1’i Antistius’un ölümcül bulduğu yarayı,
// 2’si adı hiç yazılmamış onlarca kişiyi temsil eder.
export const MARKS: Mark[] = [
  {
    id: 1, x: 118, y: 96, kind: 'komplocu',
    name: 'Publius Servilius Casca', who: 'İlk bıçağı vuran adam; MÖ 43 için halk tribünlüğü bekliyordu',
    debt: 'odullendirildi',
    detail: 'Caesar rejiminin adamıydı; kariyerini ona borçluydu. Kişisel bir af kaydı yok.',
    fate: 'Philippi’den sonra muhtemelen intihar, MÖ 42',
    sourced: 'İLK VURUŞ — kaynakların üzerinde anlaştığı TEK atıf. Suetonius “Casca’lardan biri” der, Plutarkhos boyundan sığ bir yara olduğunu söyler, Nicolaus sol omuzdan der. Sahibi kesin, yeri değil.',
  },
  {
    id: 2, x: 100, y: 150, kind: 'olumcul',
    sourced: 'ÖLÜMCÜL YARA. Hekim Antistius, 23 yaradan yalnızca ikincisinin — göğse gelenin — öldürücü olduğunu bildirdi. Kimin vurduğunu hiçbir antik kaynak yazmaz. Caesar’ı öldüren bıçak, sahipsiz.',
  },
  {
    id: 3, x: 82, y: 118, kind: 'komplocu',
    name: 'Marcus Junius Brutus', who: 'MÖ 44 praetor urbanus; komplonun ahlaki yüzü',
    debt: 'ikisi-de',
    detail: 'Pharsalus’ta Pompeius safında savaştı; Caesar askerlerine özellikle onu SAĞ yakalamalarını emretti. Affedildikten sonra Galya valisi, sonra praetor yapıldı, MÖ 41 konsüllüğüne aday gösterildi. Önce hayatını, sonra kariyerini ona borçluydu.',
    fate: 'Philippi’den sonra intihar, MÖ 42',
  },
  {
    id: 4, x: 130, y: 128, kind: 'komplocu',
    name: 'Gaius Cassius Longinus', who: 'MÖ 44 praetor peregrinus; komplonun asıl örgütleyicisi',
    debt: 'ikisi-de',
    detail: 'İç savaşta Pompeius’un donanma komutanıydı; Caesar’ın gemilerine saldırdı. Teslim oldu, affedildi, legatus yapıldı, praetor atandı, Suriye valiliği vaat edildi. Borçlu — ama kırgın: daha genç olan Brutus’un daha itibarlı makamı almasına içerledi.',
    fate: 'Philippi’de, Caesar’ı öldürdüğü aynı hançerle intihar, MÖ 42',
  },
  {
    id: 5, x: 92, y: 186, kind: 'komplocu',
    name: 'Decimus Junius Brutus Albinus', who: 'Caesar’ı o sabah Senato’ya gitmeye ikna eden adam',
    debt: 'odullendirildi',
    detail: 'Tezin en kuvvetli kanıtı. Galya’da Caesar’ın donanma komutanı, Massilia kuşatmasının lideri, Cisalpina valisi, MÖ 42 için konsül adayı. VE Caesar’ın vasiyetinde ikinci derece varis — doğacak çocuğuna vasi tayin edilmişti.',
    fate: 'Mutina’dan kaçarken bir Galyalı reis tarafından öldürüldü, MÖ 43',
  },
  {
    id: 6, x: 114, y: 172, kind: 'komplocu',
    name: 'Gaius Trebonius', who: 'MÖ 45 consul suffectus; cinayet anında Antonius’u kapıda tutan adam',
    debt: 'odullendirildi',
    detail: 'Kariyerinin her basamağı Caesar’ın elinden çıktı: Galya’da legatus, Massilia kuşatması, praetor urbanus, Hispania valisi, konsül. (Antonius’u kapıda oyalayanın Trebonius mu Decimus mu olduğu konusunda kaynaklar çelişir.)',
    fate: 'Smyrna’da işkenceyle öldürüldü ve başı kesildi, MÖ 43 — suikastçıların ilk öleni',
  },
  {
    id: 7, x: 74, y: 152, kind: 'komplocu',
    name: 'Lucius Tillius Cimber', who: 'Togayı çeken adam — saldırının işareti',
    debt: 'odullendirildi',
    detail: 'Caesar yanlısıydı; ondan praetorluk ve Bithynia-Pontus valiliği aldı. Caesar’a yaklaşma bahanesi, sürgündeki kardeşinin affıydı — yani hâlâ ondan bir şey isteyecek konumdaydı.',
    fate: 'Philippi seferi sırasında kayıtlardan siliniyor',
  },
  {
    id: 8, x: 138, y: 160, kind: 'komplocu',
    name: 'Gaius Servilius Casca', who: 'Casca’nın kardeşi',
    debt: 'odullendirildi',
    detail: 'Ağabeyi heyecandan Yunanca “kardeş, yardım et!” diye bağırınca o da saplandı. Appianos onu açıkça “Caesar’ın dostları” arasında sayar; hangi ödülü aldığına dair somut kayıt yok.',
    fate: 'Bilinmiyor — kaynaklardan sessizce kayboluyor',
  },
  {
    id: 9, x: 64, y: 196, kind: 'komplocu',
    name: 'Servius Sulpicius Galba', who: 'Caesar’ın Galya’daki legatus’u; imparator Galba’nın büyük dedesi',
    debt: 'odullendirildi',
    detail: 'Caesar’ın emrinde 12. Lejyon’u yönetti, praetor oldu. Ama MÖ 49 konsüllük adaylığında Caesar’ın desteğini yetersiz buldu ve seçimi kaybetti. Kırgınlığın kaynağı bu.',
    fate: 'Proskripsiyon dalgasında öldürüldü, MÖ 43',
  },
  {
    id: 10, x: 126, y: 208, kind: 'komplocu',
    name: 'Lucius Minucius Basilus', who: 'Caesar’ın Galya’daki subayı, MÖ 45 praetoru',
    debt: 'odullendirildi',
    detail: '“Ödüllendirildi ama yeterince değil” vakasının ders kitabı örneği: praetorluğundan sonra Caesar ona valilik vermedi, yerine PARA verdi. Bu aşağılanma onu komploya itti.',
    fate: 'Sakat bıraktığı kölelerinin elinde öldü, MÖ 43',
  },
  {
    id: 11, x: 106, y: 232, kind: 'komplocu',
    name: 'Quintus Ligarius', who: 'Afrika’da Pompeius safında savaşmış eski düşman',
    debt: 'affedildi',
    detail: 'Hayatını doğrudan Caesar’ın merhametine borçluydu: Thapsus’tan sonra esir düştü, Cicero’nun ünlü Pro Ligario savunmasını dinleyen Caesar duygulandı ve beraat ettirdi. Plutarkhos, Caesar’ın elindeki kâğıtları düşürdüğünü yazar.',
    fate: 'Muhtemelen MÖ 43 proskripsiyonlarında öldürüldü',
  },
  {
    id: 12, x: 84, y: 258, kind: 'komplocu',
    name: 'Lucius Pontius Aquila', who: 'MÖ 45 tribunus plebis',
    debt: 'hicbiri',
    detail: 'TEZİN NET İSTİSNASI. Caesar’ın zafer alayı önünden geçerken ayağa kalkmayı reddetti. Caesar alay etti: “Hadi Aquila, cumhuriyeti benden geri al, tribün!” — ve günlerce her vaadine “tabii Pontius Aquila izin verirse” diye ekledi. Üstelik mülkleri müsadere edildi. Ne af, ne ödül: alenen aşağılanma.',
    fate: 'Mutina’da, Decimus Brutus’un legatus’u olarak çarpışırken öldü, MÖ 43',
  },
  {
    id: 13, x: 122, y: 250, kind: 'komplocu',
    name: 'Pacuvius Antistius Labeo', who: 'Hukukçu ve senatör; Decimus Brutus’u komploya kazandıran adamlardan',
    debt: 'bilinmiyor',
    detail: 'Caesar’dan af ya da makam aldığına dair kayıt yok. Motifi ideolojik görünüyor — ama bu bir “yokluk kanıtı”, kesin değil.',
    fate: 'Philippi’den sonra çadırında kendi mezarını kazdırıp kölesine kendini öldürttü, MÖ 42',
  },
  {
    id: 14, x: 70, y: 276, kind: 'komplocu',
    name: 'Gaius Cassius Parmensis', who: 'Şair ve tragedya yazarı; hayatta kalan SON suikastçı',
    debt: 'bilinmiyor',
    detail: 'Caesar’la kişisel ilişkisine dair kayıt yok. Bıçak vurup vurmadığı, hatta o gün salonda olup olmadığı bile tartışmalı.',
    fate: 'Actium’dan sonra Atina’da öldürüldü, MÖ 30 — cinayetten ON DÖRT yıl sonra',
  },
  {
    id: 15, x: 134, y: 284, kind: 'komplocu',
    name: 'Turullius', who: 'Suikast sonrası Cassius’un donanma komutanı',
    debt: 'bilinmiyor',
    detail: 'Caesar’la önceki ilişkisi hakkında hiçbir kayıt yok. Ön adı bile kesin değil: kaynaklar Decimus ile Publius arasında oynuyor.',
    fate: 'Kos’ta, Asklepios’un kutsal koruluğunu donanma için kestiği gerekçesiyle idam edildi, MÖ 31/30',
  },
  {
    id: 16, x: 96, y: 300, kind: 'komplocu',
    name: 'Bucilianus', who: 'Appianos’a göre Caesar’ı kürek kemikleri arasından vuran adam',
    debt: 'bilinmiyor',
    detail: 'Appianos dışında neredeyse hiç iz bırakmamış. Bıçak vurduğu açıkça söylenen az sayıdaki isimden biri olması ilginçtir — ama kim olduğunu bilmiyoruz.',
    fate: 'Bilinmiyor',
  },
  {
    id: 17, x: 112, y: 318, kind: 'komplocu',
    name: 'Caecilius', who: 'Bucilianus’un kardeşi',
    debt: 'bilinmiyor',
    detail: 'Sadece Appianos’un listesinde bir isim olarak geçer. Caesar’la ilişkisi, makamı, geçmişi — hiçbiri bilinmiyor.',
    fate: 'Bilinmiyor',
  },
  {
    id: 18, x: 78, y: 330, kind: 'komplocu',
    name: 'Rubrius Ruga', who: 'Appianos’un listesindeki senatör',
    debt: 'bilinmiyor',
    detail: 'Nicolaus’un anlatımında Minucius’un savurduğu bıçağın yanlışlıkla uyluğuna saplandığı kişi büyük olasılıkla odur — yani suikast sırasında dost ateşiyle yaralandı.',
    fate: 'Bilinmiyor',
  },
  {
    id: 19, x: 128, y: 340, kind: 'komplocu',
    name: 'Marcus Spurius', who: 'Appianos’un listesindeki senatör',
    debt: 'bilinmiyor',
    detail: '“Adı bilinen ama hakkında hiçbir şey bilinmeyen” komplocu tipinin ta kendisi. Kariyeri, motifi, sonu — hiçbiri kayıtlı değil.',
    fate: 'Bilinmiyor',
  },
  {
    id: 20, x: 90, y: 356, kind: 'komplocu',
    name: 'Sextius Naso', who: 'Appianos’un listesindeki senatör',
    debt: 'bilinmiyor',
    detail: 'Tek kaynak Appianos. Ön adı “Publius” modern prosopografi listelerinden gelir ve kesin değildir.',
    fate: 'Bilinmiyor',
  },
  {
    id: 21, x: 116, y: 372, kind: 'komplocu',
    name: 'Petronius', who: 'Komploya katılan senatör',
    debt: 'bilinmiyor',
    detail: 'Suikastteki rolü neredeyse tek bir cümleye dayanır: Antonius, Ephesos’ta tapınağa sığınanların hepsini bağışlarken onu hariç tuttu.',
    fate: 'Ephesos’ta Antonius tarafından öldürüldü, muhtemelen MÖ 41',
  },
  {
    id: 22, x: 100, y: 214, kind: 'isimsiz',
    detail:
      'Suetonius komplocu sayısını “altmıştan fazla” verir; Şamlı Nikolaos “seksenden fazla kişinin payı vardığını söylerler” der. Antik kaynaklardan bize ulaşan isim sayısı yaklaşık 20’dir. Yani komplocuların üçte ikisinin adı hiçbir zaman yazılmadı.',
  },
  {
    id: 23, x: 106, y: 268, kind: 'isimsiz',
    detail:
      'Bu adamlar da bıçak sapladı, o salondaydılar, tarihin en ünlü cinayetini işlediler — ve iki bin yıl sonra onları bir isimle bile anamıyoruz. Cumhuriyet’i kurtardıklarına inanıyorlardı.',
  },
];

export const WOUNDS_DISCLAIMER =
  'Bu diyagram yaraları saymak için değil, masadaki adamları saymak için. Hangi bıçağın kimden geldiği BİLİNMİYOR: antik kaynakların üzerinde anlaştığı tek atıf ilk vuruştur (Casca). İşaretlerin konumu da temsilîdir. Bilinen şey şu: kim oldukları ve Caesar’a ne borçlu oldukları.';

export const WOUNDS_PAYOFF =
  'Geçmişi belgelenebilen on bir adamın onu ya hayatını ya kariyerini Caesar’a borçluydu. Komployu ikna eden adam, Caesar’ın vasiyetinde adı geçen adamdı. Dokuzu hakkındaysa hiçbir şey bilmiyoruz — ve kırk kadarının adını bile.';

/* ══════════════════ PERDE 7 — Sonrası + isim ağacı ══════════════════ */

export const AFTERMATH = [
  {
    icon: '🔥',
    title: 'Antonius',
    text: 'Cenazede Caesar’ın kanlı togasını halka gösterdi. Vasiyet okundu: Caesar her Roma vatandaşına 300 sesterce, Tiber kıyısındaki özel bahçelerini de halka park olarak bırakmıştı. Kalabalık çıldırdı ve suikastçıların evlerini yakmaya gitti.',
  },
  {
    icon: '👑',
    title: 'Octavianus',
    text: 'Caesar’ın 18 yaşındaki mirasçısı ortaya çıktı. Dikkat: “üvey torun” değil — kız kardeşinin torunuydu (great-nephew) ve vasiyetle evlat edinilmişti. Kimse onu ciddiye almadı. Ciddiye almayanların hepsi öldü.',
  },
  {
    icon: '🗡️',
    title: 'Cicero',
    text: 'Antonius’a karşı Philippica’ları yazdı. Antonius’un adamları onu yakaladı; kellesi ve elleri Rostra’da sergilendi. Antonius’un karısı Fulvia, Cicero’nun dilini saç iğnesiyle deldi.',
  },
  {
    icon: '⚔️',
    title: 'Philippi',
    text: 'MÖ 42’de Brutus ve Cassius yenildi; ikisi de intihar etti. Cassius, Caesar’ı öldürdüğü aynı hançerle.',
  },
];

export const SUETONIUS_THREE_YEARS =
  'Suetonius şunu yazar: suikastçılardan hiçbiri üç yıldan fazla yaşamadı, hiçbiri doğal ölümle ölmedi, çoğu Caesar’ı öldürdükleri hançerle intihar etti. Cümle muhteşem — ve olgusal olarak yanlış. Cassius Parmensis on dört yıl daha yaşadı; Velleius onu “katillerin sonuncusu” diye anar. Suetonius’un tablosu, gerçekten hızla ölen bir çekirdekten yapılmış ahlaki bir genellemedir: ilahi adalet şeması. Ama çekirdek gerçek: Trebonius MÖ 43, Decimus MÖ 43, Cassius ve Brutus MÖ 42.';

export type NameNode = {
  key: string;
  word: string;
  where: string;
  text: string;
  until?: string;
  caveat?: string;
};

export const NAME_TREE: NameNode[] = [
  {
    key: 'caesar',
    word: 'Caesar',
    where: 'Roma, MÖ 100',
    text: 'Başlangıçta bir unvan değil, bir aile lakabıydı (cognomen) — gens Iulia’nın bir kolunun adı. Caesar’ın kendisi hiçbir zaman “imparator” olmadı; Roma’da öyle bir makam yoktu. Resmî konumu ömür boyu diktatörlüktü.',
  },
  {
    key: 'augustus',
    word: 'Caesar → unvan',
    where: 'Roma, MÖ 44 sonrası',
    text: 'Vasiyetle evlat edinilen mirasçısı adı miras aldı. Sonra ondan sonraki her imparator aldı. MS 68-69 kriz yılında ad artık iktidarın kendisiydi: aile adı, unvana dönüşmüştü. Diocletianus’un Tetrarşi’sinde (MS 293) “Caesar” resmen yardımcı imparator unvanı oldu.',
  },
  {
    key: 'kaiser',
    word: 'Kaiser',
    where: 'Almanca',
    text: 'Germenlerin Latinceden aldığı en erken kelimelerden biri. Klasik Latincede Caesar “KAI-sar” diye okunuyordu — Kaiser, o telaffuzun canlı kanıtı.',
    until: 'Son Kaiser: II. Wilhelm, 1918’de tahttan indirildi.',
  },
  {
    key: 'tsar',
    word: 'Tsar / Çar',
    where: 'Slavca → Türkçe',
    text: 'Aynı ad, büyük olasılıkla Gotça aracılığıyla Slav dillerine geçti ve kısalarak “tsar” oldu. Türkçeye “çar” olarak girdi.',
    until: 'Son Rus Çarı: II. Nikolay, Mart 1917’de tahttan çekildi. (Dünyanın son çarı ise Bulgar II. Simeon’dur.)',
  },
  {
    key: 'kayser',
    word: 'Kayser-i Rûm',
    where: 'Konstantiniyye, 1453',
    text: 'Fatih Sultan Mehmed, şehri aldıktan sonra Roma’nın varisi olduğunu açıkça iddia etti: Ortodoks patrikliğini yeniden kurdu, Rum tebaayı çatısı altına aldı, hizmetindeki Rum tarihçiler ondan “basileus” (imparator) diye söz etti.',
    caveat:
      'Dürüst olalım: “Fatih kendini Kayser-i Rûm ilan etti” cümlesi siyasi iddianın varlığını doğru yansıtır, ama unvanın resmî ve sürekli kullanımı birincil belgelerle sanıldığından zayıf desteklenir. Bazı araştırmacılar unvanın Osmanlı kançılaryasına ancak Kanuni döneminde girdiğini savunur. Sık gösterilen “imparator” madalyaları ise Osmanlı sikkesi değil, İtalyan yapımıdır.',
  },
];

export const NAME_PAYOFF =
  'Bir adamın soyadı; iki bin yıl boyunca, üç kıtada, birbirini tanımayan onlarca dilde, tek bir anlama geldi: hükmeden. Onu öldürdüler. Adını, sildikleri şeye çevirdiler.';

export const NAME_EXTRA =
  'Aynı adın izini bugün de taşıyorsunuz: Temmuz (July) Caesar’ın, Ağustos (August) Augustus’un adını taşır. Ve Kayseri şehrinin adı da aynı kökten gelir.';

/* ══════════════════ Zaman çizelgesi + quiz ══════════════════ */

export const timeline = [
  { year: 'MÖ ~75', title: 'Korsanlar', text: 'Genç bir Romalı, korsanların istediği fidyeyi az bulup yükseltir. Serbest kalınca döner ve hepsini çarmıha gerdirir — ama acı çekmesinler diye önce boğazlarını kestirir.' },
  { year: 'MÖ 81', title: 'Sulla’ya hayır', text: 'Roma’nın en güçlü adamı, on sekiz yaşındaki bir çocuğa karısını boşamasını emreder. Çocuk reddeder ve kaçar. Sulla affederken uyarır: “Bu çocukta bir sürü Marius var.”' },
  { year: 'MÖ 63', title: 'Pontifex Maximus', text: 'Batmış hâldeyken Roma’nın en yüksek dinî makamına aday olur. Seçim sabahı annesine: “Bugün beni ya pontifex maximus olarak görürsün ya da sürgünde.” Kazanır.' },
  { year: 'MÖ 60', title: 'Üçlü', text: 'Crassus’un parası, Pompeius’un şöhreti, Caesar’ın masayı kurabilmesi. Senato’nun haberi bile olmaz.' },
  { year: 'MÖ 58–50', title: 'Galya', text: 'Sekiz yıl. Geri döndüğünde Galya diye bir yer kalmamıştır. Ve Caesar bu savaşın raporunu kendisi yazar — üçüncü tekil şahısla.' },
  { year: 'MÖ 52', title: 'Alesia', text: 'Aynı anda hem kuşatan hem kuşatılan olur: iç hat 11 mil, dış hat 14 mil. Kazanmanın matematiksel yolu yoktur. Kazanır.' },
  { year: 'MÖ 49', title: 'Rubicon', text: 'Tek lejyonla, Cumhuriyet’in emrindeki yüz binlere karşı, bir dereyi geçer. “Zar atıldı.”' },
  { year: 'MÖ 48', title: 'Pharsalus', text: 'Bir orduyu değil, bir kuşağın kibrini yener: mızrakları genç soyluların yüzlerine doğrultturur. Pompeius Mısır’a kaçar ve bir sepetin içinde geri döner.' },
  { year: 'MÖ 46–44', title: 'Herkesi affeden adam', text: 'Kazanır ve kimseyi öldürmez. Takvimi düzeltir, Senato’yu 900’e çıkarır, gazileri yerleştirir. Sonra “ömür boyu diktatör” olur.' },
  { year: 'MÖ 44', title: 'Mart’ın İdus’u', text: '23 bıçak. Yalnızca ikincisi öldürücü. Bıçakları tutan ellerin çoğu, onun affettiği ya da terfi ettirdiği ellerdi.' },
  { year: 'MÖ 42–27', title: 'Suikastın başarısızlığı', text: 'Brutus ve Cassius intihar eder. Cumhuriyet geri gelmez. Caesar’ın evlatlık oğlu Augustus adını alıp ilk imparator olur.' },
  { year: '1453', title: 'Kayser-i Rûm', text: 'Bir aile adı, Kaiser ve Çar olarak Avrupa’da yürümeye devam eder. Ve Konstantiniyye’yi alan padişah, Roma’nın varisi olduğunu ilan eder.' },
];

export const quizQs = [
  {
    text: 'Alesia’da Caesar aynı anda hem kuşatan hem kuşatılan taraf oldu. Bunu nasıl başardı?',
    opts: ['Tepeyi ele geçirip yükseklik avantajı aldı', 'İki ayrı sur inşa etti: biri içe, biri dışa dönük', 'Nehri saptırıp kaleyi susuz bıraktı', 'Ordusunu ikiye bölüp iki cephede savaştı'],
    a: 1,
    exp: 'İç hat 11 Roma mili (~16 km), dış hat 14 mil (~21 km). İçeride 80.000 Galyalı, dışarıda bir kurtarma ordusu, ortada iki duvar arasına sıkışmış Caesar.',
  },
  {
    text: 'Caesar’ın cesedindeki 23 yaradan kaçı ölümcüldü?',
    opts: ['Hepsi', 'Yaklaşık yarısı', 'Yalnızca biri', 'Hiçbiri — kan kaybından öldü'],
    a: 2,
    exp: 'Hekim Antistius (tarihe geçen ilk otopsi raporu) yalnızca ikinci yaranın — göğse gelenin — öldürücü olduğunu bildirdi. Bu, cinayetin bir suikasttan çok bir sürü davranışı olduğunu gösterir: herkesin bıçağını sokması gerekiyordu.',
  },
  {
    text: 'Caesar iç savaşı kazandıktan sonra düşmanlarına ne yaptı?',
    opts: ['Sulla gibi ölüm listeleri astı', 'Hepsini sürgüne yolladı', 'Affetti — bazılarını terfi bile ettirdi', 'Servetlerine el koyup serbest bıraktı'],
    a: 2,
    exp: 'Ve bu bir tuzaktı. Birini affetmek için önce onu öldürebilecek konumda olmanız gerekir. Caesar herkesi affederek Roma’nın tüm seçkinlerini kendisine borçlu hâle getirdi — ve borçlu olmak, eşit olmamaktır.',
  },
  {
    text: '“Et tu, Brute?” sözü nereden geliyor?',
    opts: ['Suetonius’tan', 'Plutarkhos’tan', 'Caesar’ın kendi metninden', 'Shakespeare’den'],
    a: 3,
    exp: 'Suetonius, Caesar’ın hiçbir şey söylemeden öldüğünü yazar. Yunanca “sen de mi, evladım?” sözünü yalnızca başkalarının aktardığı bir rivayet olarak kaydeder — ve kendisi buna inanmaz.',
  },
  {
    text: 'Suikastçılar Caesar’ı öldürdükten sonra Cumhuriyet’e ne oldu?',
    opts: ['Yeniden kuruldu ve 200 yıl daha yaşadı', 'Kısa bir kaosun ardından Senato yönetimi geri aldı', 'Bir daha geri gelmedi; Caesar’ın evlatlık oğlu ilk imparator oldu', 'Roma ikiye bölündü'],
    a: 2,
    exp: 'Suikastçıların bir sonraki adım için planı yoktu. On üç yıl daha iç savaş sürdü; Actium’da kazanan Octavianus, “Augustus” adını alıp Roma’nın ilk imparatoru oldu.',
  },
];
