// Augustus makalesinin TÜM verisi. Düz modül ('use client' YOK) → sunucu ve
// istemci aynı diziyi kullanır. Caesar okuru kahraman yaptı; Augustus okuru
// KANDIRILAN yapar — her veri parçası "dediği" ile "olan" arasındaki boşluğu
// gösterir. Tez bir hile, o yüzden çatlaklar gizlenmez.

/* ══════════════════ PERDE 1 — Ankara duvarı: dediği / olan ══════════════════ */

export const ANKARA = {
  monument: 'Monumentum Ancyranum',
  where: 'Ankara · Ulus · Hacı Bayram Camii’nin yanındaki duvar',
  what: 'Res Gestae Divi Augusti — "Tanrısal Augustus’un Yaptıkları"',
  note: 'Augustus ölmeden önce yazdı; mezarının önüne bronz sütunlara kazınmasını ve imparatorluğun her yerinde kopyalanmasını emretti. Bugün metnin dünyadaki en eksiksiz kopyası Roma’da değil, Ankara’da. Epigrafi tarihçileri ona "yazıtların kraliçesi" der.',
  keyLine: 'Nüfuz bakımından herkesin üstündeydim. Ama resmî yetki bakımından, görevde bana meslektaş olanlardan fazlasına sahip değildim.',
  keyLineLatin: 'Auctoritate omnibus praestiti, potestatis autem nihilo amplius habui quam ceteri qui mihi quoque in magistratu conlegae fuerunt.',
  keyLineVerdict: 'Bu cümle teknik olarak doğrudur. Ve tarihte yazılmış en büyük yalanlardan biridir. İkisi aynı anda. Bu adamın bütün hikâyesi bu cümlenin içinde.',
} as const;

// "Dediği" (Augustus’un anlatısı, altın) ↔ "Olan" (gerçek, kan-kırmızısı).
export const SAID_VS_REAL: { said: string; real: string }[] = [
  {
    said: 'Cumhuriyet’i kendi denetimimden Senato’nun ve Roma halkının yetkisine devrettim.',
    real: 'Yetkileri "devretti", ama 25’ten fazla lejyon şahsen ona yeminliydi; Senato’nun eyaletlerinde 1, belki 2 lejyon vardı. Ordu kimin elindeyse devlet onundur.',
  },
  {
    said: 'Nüfuz bakımından herkesin üstündeydim; ama resmî yetkim meslektaşlarımdan fazla değildi.',
    real: 'Auctoritas (nüfuz) ölçülemez, oylanamaz, iptal edilemez, mahkemeye taşınamaz. En tehlikeli güç, adı olmayan güçtür.',
  },
  {
    said: 'Devleti kral ya da diktatör olarak değil, princeps — "birinci vatandaş" — olarak yönettim.',
    real: 'Tribün dokunulmazlığı + bütün valilerin üstünde imperium + Pontifex Maximus + Pater Patriae. Hepsi Cumhuriyet’in eski makamları — ama hepsi tek bir vücutta, aynı anda.',
  },
  {
    said: 'Bana sunulan diktatörlüğü kabul etmedim.',
    real: 'MÖ 22’de reddederken dizlerinin üstüne çöküp togasını yırttı — bir sahne. Yetkiyi reddetmedi; sadece adını reddetti. Diktatör olmadan diktatörün gücüne sahip oldu.',
  },
  {
    said: 'Tapınakları onardım, oyunlar verdim, halka tahıl ve para dağıttım — cömertliğimle.',
    real: 'Cömertliğin kaynağı Mısır’ın hazinesiydi; onu, İskender’e taç takıp Ptolemaios hanedanını bitirerek ele geçirmişti. Cömertlik, fethin makyajıdır.',
  },
];

/* ══════════════════ PERDE 1 — Ölüm listesi ══════════════════ */

export const DEATH_LIST = [
  { name: 'Julius Caesar', how: '23 bıçak', age: 55, violent: true },
  { name: 'Cicero', how: 'Kellesi forumda sergilendi', age: 63, violent: true },
  { name: 'Brutus', how: 'İntihar', age: 43, violent: true },
  { name: 'Cassius', how: 'İntihar', age: 42, violent: true },
  { name: 'Marcus Antonius', how: 'İntihar', age: 53, violent: true },
  { name: 'Kleopatra', how: 'İntihar', age: 39, violent: true },
  { name: 'Octavius (Augustus)', how: 'Yatağında, uykusunda', age: 75, violent: false },
];

/* ══════════════════ PERDE 2 — İsim anahtarı ══════════════════ */

export const NAME_SWITCH = {
  plain: { name: 'Gaius Octavius', title: 'Velitrae’li bir kasaba çocuğu', crowd: 'kayıtsız', crowdText: 'Kim bu? Sarraf torunu, hasta bir delikanlı. Kalabalık omuz silker.' },
  caesar: { name: 'Gaius Julius Caesar', title: 'Tanrısal Caesar’ın oğlu', crowd: 'coşku', crowdText: 'CAESAR! Her gazinin, her yoksulun, her Caesar sevdalısının kalbindeki açık hesap bir anda kabarır.' },
  note: '"Octavianus" ismini biz uydurduk — modern tarihçiler karışmasın diye. Kendisi o ismi hayatında bir kez bile kullanmadı. Ordusu yoktu, parası yoktu, itibarı yoktu. Bir İSMİ vardı — ve sermayesi buydu.',
} as const;

/* ══════════════════ PERDE 2 — TOLLENDUM cinası ══════════════════ */

export const TOLLENDUM = {
  latin: 'Laudandum adulescentem, ornandum, tollendum.',
  gloss: 'Genç adam övülmeli, onurlandırılmalı, tollendum.',
  word: 'tollendum',
  meanings: [
    { key: 'up', label: 'yüceltilmeli', sub: 'kaldırılmalı — yukarı, göklere', color: 'gold' as const },
    { key: 'out', label: 'ortadan kaldırılmalı', sub: 'defedilmeli — yoldan çekilmeli', color: 'crimson' as const },
  ],
  reveal: 'Cicero, Roma’nın en zeki adamı, herkesin duyacağı bir yerde açık açık şunu söyledi: bu çocuğu şişireceğiz, sonra ondan kurtulacağız. Espri güzeldi; Roma güldü. Octavianus da duydu.',
  payoff: 'MÖ 43 Aralık: İkinci Triumvirlik kuruldu ve bir proscriptio listesi hazırlandı. Antonius’un tek şartı vardı — Cicero. Octavianus iki gün direndi, sonra imzaladı. Cicero’nun kellesi ve Philippica’ları yazan elleri forumdaki kürsüye çivilendi. Esprisi doğruydu; sadece özneyi yanlış seçmişti.',
} as const;

/* ══════════════════ PERDE 2 — Proscriptio listesi ══════════════════ */

export const PROSCRIPTIO = {
  senators: 300,
  knights: 2000,
  total: 2300,
  resisted: 'Octavianus iki gün direndi.',
  finalName: 'Marcus Tullius Cicero',
  caption: 'Adı listede olan herkes yasal olarak öldürülebilirdi ve malı öldürene kalırdı. İnsanlar komşularını, oğullar babalarını, köleler efendilerini ihbar etti.',
  contrast: 'Caesar bunu YAPMAMIŞTI — herkesi affetmişti, ve onu öldüren şey de tam olarak buydu. Evlatlık oğlu dersini almıştı: merhamet öldürür.',
  // Deterministik Roma-adı havuzları (liste "bitmiyormuş" hissi için; gerçek 2.300 isim değil).
  praenomina: ['Gaius', 'Lucius', 'Marcus', 'Publius', 'Quintus', 'Titus', 'Aulus', 'Gnaeus', 'Servius', 'Tiberius', 'Manius', 'Sextus', 'Decimus', 'Spurius'],
  nomina: ['Cornelius', 'Julius', 'Claudius', 'Aemilius', 'Fabius', 'Valerius', 'Sempronius', 'Licinius', 'Junius', 'Tullius', 'Domitius', 'Calpurnius', 'Antonius', 'Servilius', 'Fulvius', 'Cassius', 'Terentius', 'Octavius', 'Marcius', 'Porcius', 'Sulpicius', 'Vipsanius'],
  cognomina: ['Rufus', 'Maximus', 'Longus', 'Cinna', 'Bibulus', 'Ahenobarbus', 'Crassus', 'Brutus', 'Cotta', 'Gracchus', 'Cato', 'Scaevola', 'Barbatus', 'Nepos', 'Varus', 'Flaccus', 'Cethegus', 'Dolabella', 'Balbus', 'Naso', 'Galba', 'Pulcher', 'Metellus', 'Lepidus'],
} as const;

/* ══════════════════ PERDE 4 — Propaganda çevirici ══════════════════ */

export const PROPAGANDA = {
  frames: [
    {
      key: 'civil',
      label: 'İç savaş',
      color: 'crimson' as const,
      headline: 'Roma’ya karşı Roma',
      lines: [
        'Batı’da bir Romalı konsül, Doğu’da bir başka Romalı konsül.',
        'İkisi de lejyonlara, Senato’ya, aynı tanrılara sahip.',
        'Bu, elli yıldır süren kardeş kavgasının bir turu daha. Kimse gelmez.',
      ],
    },
    {
      key: 'foreign',
      label: 'Yabancı tehdit',
      color: 'gold' as const,
      headline: 'Roma’ya karşı bir kraliçe',
      lines: [
        'Doğulu, büyücü, ahlaksız bir kraliçe iyi bir Romalı’yı büyülemiş.',
        'Antonius kurban; kurtarılmalı. Düşman O KADIN.',
        'Bu bir iç savaş değil — Roma’nın yabancı bir tehdide karşı savunması. Herkes gelir.',
      ],
    },
  ],
  same: 'Aynı savaş. Aynı Antonius. Aynı Actium. Değişen tek şey: hangi çerçeveden bakıldığı.',
  will: 'Octavianus, Vesta rahibelerinin kasasından Antonius’un vasiyetini zorla aldı (kutsal alan ihlali) ve Senato’da okudu: Antonius, Caesarion’u Caesar’ın gerçek oğlu tanıyor, Roma topraklarını Kleopatra’nın çocuklarına dağıtıyor ve İskenderiye’ye gömülmek istiyordu. Son madde Roma’yı çıldırttı. Vasiyet gerçek miydi, sahte miydi — fark etmedi. Roma savaşı istedi.',
  actium: 'MÖ 31, Actium. Agrippa kazandı. (Tabii ki Agrippa kazandı.)',
} as const;

/* ══════════════════ PERDE 4 — İskender’in mezarı: Caesar / Augustus ══════════════════ */

export const ALEXANDER = {
  caesar: {
    who: 'Julius Caesar · ~MÖ 69',
    what: 'İskender’in bir heykelinin önünde durdu ve AĞLADI — çünkü geç kalmıştı, çünkü İskender onun yaşındayken dünyayı fethetmişti, çünkü kendini yetersiz hissediyordu.',
    verb: 'ağladı',
  },
  augustus: {
    who: 'Augustus · MÖ 30',
    what: 'İskender’in lahdini açtırdı, baktı, altın bir taç koydu, çiçek serpti. Ptolemaios’ların mezarlarını görmek ister misiniz diye soranlara: "Ben bir kral görmeye geldim, ceset görmeye değil."',
    verb: 'taç taktı',
  },
  punch: 'Caesar İskender OLMAK istiyordu. Augustus, İskender’e taç TAKAN adamdı.',
  dioNote: 'Cassius Dio, Augustus’un dokunurken kazara İskender’in burnunu kırdığını yazar. Muhtemelen dedikodu — ama muhteşem bir dedikodu.',
} as const;

export const CAESARION = {
  age: 17,
  who: 'Kleopatra’nın Julius Caesar’dan olan oğlu — yani Caesar’ın tek biyolojik oğlu. Octavianus’un bütün iktidarı "Caesar’ın oğlu" olmasına dayanıyordu; ama o evlatlıktı, kâğıt üstündeydi. Ortada gerçek bir Caesar oğlu vardı ve o Octavianus değildi.',
  pun: '"Çok Caesar olması iyi değildir." — danışman Areios Didymos, Homeros’a nazire yaparak ("çok kral olması iyi değildir").',
  cold: 'Cicero’nun kelime oyunu bir adamı öldürmüştü. Areios’un kelime oyunu bir hanedanı bitirdi. Bu hikâyede espriler siler.',
} as const;

/* ══════════════════ PERDE 5 — SAHTE SEÇİM (Rubicon’un tersi) ══════════════════ */

export const RESTORE = {
  pollKey: 'augustus-restore',
  year: -27,
  setup: 'MÖ 27, 13 Ocak. Sen bir senatörsün. Otuz altı yaşındaki Octavianus ayağa kalktı ve her şeyi — bütün yetkilerini, eyaletlerini, ordularını — Senato’ya geri verdi. "Cumhuriyet yeniden kuruldu," dedi. Salon dondu. Sıra sende. Ne yaparsın?',
  truth: 'Fark etmezdi.',
  truthSub: 'Rubicon’da seçim gerçekti ve dünyayı değiştirdi. Burada seçim tiyatro. Augustus’un altında yaşamak tam olarak buydu: seçebiliyormuş gibi hissettiğin, ama sonucu önceden yazılmış bir sahne.',
} as const;

export const RESTORE_CHOICES = [
  {
    key: 'kabul',
    label: 'Kabul et — Cumhuriyet dönsün',
    sub: 'Teklifini kabul et, çekilmesine izin ver.',
    headline: 'Onu evine yolladın.',
    screens: [
      'Octavianus çekildi. Peki sonra?',
      'Bütün rakipleri ölmüştü; geriye onun sistemi ve onun lejyonları kaldı.',
      'Ordu maaşını ondan alıyordu, toprağını ondan bekliyordu. Senato boşluğu dolduramazdı.',
      'Sonuç: yeni bir güç yarışı, yeni bir Antonius, yeni bir Philippi. Elli yıllık iç savaş, kaldığı yerden.',
    ],
    verdict: 'Barışı öldürdün — ve o zaten geri gelirdi.',
  },
  {
    key: 'yalvar',
    label: 'Yalvar — geri alsın',
    sub: 'Gitmemesi için yalvar, ısrar et.',
    headline: 'Kalması için yalvardın.',
    screens: [
      'Sen ve bütün Senato yalvardınız. O reddetti. Israr ettiniz.',
      'O "isteksizce" kabul etti — ama sadece bir kısmını, sadece geçici olarak, sadece devlet için.',
      'Sana yeni bir isim verdirtti: Augustus. O güne kadar yalnız tapınaklar için kullanılan bir kelime.',
      'Reddediş sahneydi; ısrar senaryonun parçasıydı. Sen repliğini okudun.',
    ],
    verdict: 'Tam da yapmanı istediği şeyi yaptın. Oldu.',
  },
];

/* ══════════════════ PERDE 5 — GÜCÜN ANATOMİSİ ══════════════════ */

// İki state: 'anayasal' (her şey Senato/halka bağlı, cumhuriyet gibi) →
// 'gercek' (her yetki hattı tek düğüme akar, lejyonlar belirir).
export type PowerNode = { key: string; label: string; x: number; y: number; kind: 'augustus' | 'organ' | 'province' };

export const POWER_NODES: PowerNode[] = [
  { key: 'augustus', label: 'Augustus', x: 160, y: 150, kind: 'augustus' },
  { key: 'senato', label: 'Senato', x: 60, y: 45, kind: 'organ' },
  { key: 'konsul', label: 'Konsüller', x: 160, y: 30, kind: 'organ' },
  { key: 'meclis', label: 'Meclisler', x: 260, y: 45, kind: 'organ' },
  { key: 'sen-eyalet', label: 'Senato eyaletleri', x: 55, y: 255, kind: 'province' },
  { key: 'aug-eyalet', label: 'Sınır eyaletleri', x: 265, y: 255, kind: 'province' },
];

// Anayasal görünüm: yetki yukarıdan (Senato/konsül/meclis) akar, Augustus sadece bir düğüm.
export const POWER_EDGES_CONST: [string, string][] = [
  ['senato', 'konsul'], ['konsul', 'meclis'], ['senato', 'meclis'],
  ['konsul', 'augustus'], ['senato', 'sen-eyalet'], ['konsul', 'aug-eyalet'],
  ['meclis', 'augustus'],
];

// Gerçek: her hat Augustus’a akar; organlar ona bağlı.
export const POWER_EDGES_REAL: [string, string][] = [
  ['augustus', 'senato'], ['augustus', 'konsul'], ['augustus', 'meclis'],
  ['augustus', 'sen-eyalet'], ['augustus', 'aug-eyalet'],
];

export const POWER_LEGIONS = {
  'sen-eyalet': { count: '1', sub: 'belki 2', color: 'marble' as const },
  'aug-eyalet': { count: '25+', sub: 'hepsi ona yeminli', color: 'crimson' as const },
} as const;

export const POWER_POWERS = [
  { title: 'Tribunicia potestas', text: 'Halk tribünlerinin yetkisi: veto hakkı ve dokunulmazlık. Vücuduna dokunan kutsal yasayı çiğnemiş sayılır. Yani Caesar’ı öldüren yöntem, ona karşı yasadışı hâle geldi.' },
  { title: 'Imperium proconsulare maius', text: 'Bütün valilerin üstünde emir yetkisi — ama bir "makam" değil, bir üst-yetki.' },
  { title: 'Pontifex Maximus', text: 'En yüksek dinî makam (Lepidus ölünce). Ömür boyu, iptal edilemez.' },
  { title: 'Pater Patriae', text: '"Vatanın Babası". Bir unvan değil, bir duygu — devletin şahsileşmesi.' },
];

export const POWER_CONCLUSION = 'Hiçbiri kraliyet unvanı değil. Hepsi Cumhuriyet’in mevcut, meşru, eski makamları. O sadece hepsini aynı anda, tek bir vücutta topladı. Roma bir daha asla cumhuriyet olmadı — ve kimse tam ne zaman bittiğini söyleyemedi, çünkü hiç bitmedi. Sadece içi boşaldı.';

/* ══════════════════ PERDE 5 — Janus / mermer ══════════════════ */

export const JANUS = {
  before: 2, // Augustus'tan önceki 700 yılda 2 kez kapandı
  augustus: 3, // Augustus 3 kez kapattı
  note: 'Janus Tapınağı’nın kapıları yalnızca Roma’nın hiçbir yerde savaşmadığı zaman kapatılırdı. Augustus’tan önceki 700 yılda iki kez kapanmıştı. Augustus üç kez kapattı.',
  marble: '"Tuğladan bir şehir buldum, mermerden bir şehir bıraktım." (Roma’daki espri: mermeri koyan Agrippa’ydı.)',
  month: 'Senato, takvimdeki bir ayın adını onun onuruna değiştirdi. O ay hâlâ takviminizde: Ağustos. Telefonunuzda Julius ve Augustus iki bin yıldır yan yana duruyor.',
} as const;

/* ══════════════════ PERDE 6 — Vâris ağacı ══════════════════ */

export type Heir = { key: string; name: string; rel: string; year: number; age: number | null; fate: string };

// Sıra = ölüm sırası; okur ilerledikçe teker teker söner. Sonda Tiberius yanık kalır.
export const HEIRS: Heir[] = [
  { key: 'marcellus', name: 'Marcellus', rel: 'yeğeni ve damadı', year: -23, age: 19, fate: 'Vâris seçildi. Hastalandı, öldü.' },
  { key: 'agrippa', name: 'Agrippa', rel: 'en yakın dostu, sağ kolu, damadı', year: -12, age: null, fate: 'Elli yıllık ortağı. Bütün zaferleri onundu. Öldü.' },
  { key: 'drusus', name: 'Drusus', rel: 'üvey oğlu, sevdiği tek üvey evladı', year: -9, age: 29, fate: 'Attan düştü. Öldü.' },
  { key: 'lucius', name: 'Lucius Caesar', rel: 'torunu ve evlatlık oğlu', year: 2, age: 19, fate: 'Yolda hastalandı. Öldü.' },
  { key: 'gaius', name: 'Gaius Caesar', rel: 'torunu, evlatlık oğlu, gözdesi', year: 4, age: 23, fate: 'Yaralandı, iyileşmedi. Öldü.' },
];

export const HEIR_SURVIVOR: Heir = {
  key: 'tiberius', name: 'Tiberius', rel: 'üvey oğlu — istemediği adam', year: 4, age: null,
  fate: 'Geriye kalan tek kişi. Karanlık, asosyal, kırgın — ve işi İSTEMEYEN biri.',
};

export const HEIR_PAYOFF = {
  adoptionLine: '"Bunu devletin acı zorunluluğu için yapıyorum." — Augustus, Tiberius’u evlat edinirken. Bir babanın söyleyebileceği en soğuk cümlelerden biri.',
  tacitus: 'Tacitus daha da acımasız: Augustus, Tiberius’u belki de kasten seçti — çünkü Tiberius’un kötülüğü kendi anısını parlatacaktı.',
  livia: 'Arka planda cevabı olmayan bir soru: her vârisin ölümü Livia’nın oğlunu tahta bir adım yaklaştırdı. Kanıt yok — ama Tacitus imalı, Cassius Dio daha da imalı, ve tesadüf biraz fazla düzenli. (Zehir söylentisi kanıtlanmamıştır; Robert Graves romanlaştırdı, tarihçilerin çoğu inanmaz.)',
} as const;

/* ══════════════════ PERDE 6 — Julia ══════════════════ */

export const JULIA = {
  law: 'Lex Julia: zinayı suç hâline getirdi (o güne kadar aile meselesiydi), evlenmeyeni cezalandırdı, çocuksuzu mirastan mahrum etti. Augustus, Roma’yı yasayla yeniden aile kurmaya zorladı.',
  marriages: [
    { to: 'Marcellus', note: 'kuzeni. İki yıl sonra öldü.' },
    { to: 'Agrippa', note: 'babasının en yakın dostu, kendisinden 25 yaş büyük. Beş çocuk. Sonra Agrippa öldü.' },
    { to: 'Tiberius', note: 'üvey kardeşi. Tiberius mutlu evliliğini bitirmek zorunda kaldı; karısını sokakta görüp ağladığı rivayet edilir. Birbirlerinden nefret ettiler.' },
  ],
  fall: 'MÖ 2’de Augustus, kendi kızını, kendi yazdığı zina yasasıyla — halka açık, isim isim — suçladı. Julia, Pandateria adasına sürüldü: şarap yasak, erkek yüzü yasak, ziyaretçi yasak. Babası onu bir daha hiç görmedi. Augustus öldükten sonra Tiberius nafakasını kesti; Julia açlıktan öldü.',
  wound: 'Kızına ve iki torununa "üç yaram" derdi. Bir keresinde: "Keşke hiç evlenmemiş ve çocuksuz ölmüş olsaydım."',
  question: 'Suçlama gerçek miydi? Bilinmiyor. Julia’nın "sevgilileri" denen adamların hemen hepsi tahtta hak iddia edebilecek ailelerdendi — yani muhtemelen bir zina davası değil, bir darbe temizliğiydi. Adam bütün imparatorluğa aile değerlerini dayattı ve o yasanın ilk büyük kurbanı kendi kızı oldu.',
} as const;

/* ══════════════════ PERDE 6 — Üç boşluk (Teutoburg) ══════════════════ */

export const TEUTOBURG = {
  year: 9,
  legions: [17, 18, 19],
  dead: '15.000–20.000',
  betrayer: 'Arminius — Germen reisinin oğlu, Roma’da rehin büyütülmüş, vatandaş yapılmış, şövalye rütbesi verilmiş, Roma ordusunda subay. Latince konuşuyordu. Varus ona kardeş gibi güveniyordu.',
  scene: 'Üç gün sürdü: yağmur, çamur, daralan patikalar, dört yandan ok. XVII., XVIII. ve XIX. lejyonlar yok edildi. Varus kılıcının üstüne atladı; ele geçen subaylar Germen sunaklarında kurban edildi.',
  cry: 'Quintili Vare, legiones redde!',
  cryTr: 'Quinctilius Varus, lejyonlarımı geri ver!',
  grief: 'Suetonius’a göre Augustus aylarca sakalını ve saçını kesmedi, kapılara kafasını vurdu, geceleri sarayda bağırarak dolaştı. Genişlemeyi o gün durdurdu; Roma bir daha kalıcı olarak Ren’in ötesine geçmedi.',
  vanish: 'Roma’da lejyon numaraları geri dönüştürülürdü; bir lejyon yok olsa numarası yeniden kullanılırdı. XVII, XVIII ve XIX bir daha asla kullanılmadı — imparatorluğun sonuna kadar boş kaldı. Bazı anıtlar taştan olmaz. Bazıları boşluktan olur.',
} as const;

/* ══════════════════ PERDE 7 — Ölüm + alkış ══════════════════ */

export const DEATHBED = {
  where: 'MS 14, 19 Ağustos, Nola — babasının öldüğü oda.',
  mirror: 'Son gününde bir ayna istedi, saçını taratmayı ve çökmüş yanaklarını düzeltmeyi emretti. Sonra arkadaşlarını çağırıp sordu:',
  question: 'Rolümü hayat oyununda iyi oynadım mı sizce?',
  closing: 'Acta est fabula, plaudite.',
  closingTr: 'Oyun bitti. Alkışlayın.',
  closingNote: 'Roma komedilerinde oyun bitince aktörlerin seyirciye söylediği kapanış repliği. Elli yıl "ben sıradan bir vatandaşım, yetkim yok, sadece nüfuzum var" diyen adam, ölmeden birkaç saat önce açıkça "bu bir oyundu" dedi. Tarihte hiç kimse kendi hilesini bu kadar zarif bir cümleyle itiraf etmedi.',
  livia: '"Livia, evliliğimizi unutma. Hoşça kal." — 51 yıllık eşine, son kelimeleri.',
  divus: 'Bir ay sonra Senato onu tanrı ilan etti: Divus Augustus. Bir senatör ruhunun göğe yükseldiğini gördüğüne yemin etti. (Livia ona büyük bir para ödedi. Bu da kayıtlarda.)',
} as const;

export const APPLAUSE = {
  button: 'Alkışla',
  result: '2.000 yıldır değişmeyen durum.',
  reveal: 'Az önce, tam bu saniyede, Augustus’un elli yıl boyunca inşa ettiği şeyin — rızayla verilen alkışın — son halkası oldun. Bir buton gördün ve bastın. Yazının tezini kendi elinle kanıtladın.',
  today: 'Bugün dünyada, "ben sadece sıradan bir vatandaşım, sadece hizmet ediyorum" diyerek her şeyi elinde tutan kaç kişi var? Hepsi aynı oyunu oynuyor. Sadece Augustus daha iyi oynadı — ve tek fark, o bunu itiraf edecek kadar dürüsttü.',
} as const;

/* ══════════════════ PERDE 7 — İki cümle ══════════════════ */

export const TWO_LINES = {
  caesar: { name: 'Julius Caesar', latin: 'Alea iacta est.', tr: 'Zar atıldı.', who: 'bir kumarbazın cümlesi', end: 'Riski seven, hızı seven adam. Beş yıl sonra bir salonun zemininde, kendi affettiği adamların bıçakları altında öldü.' },
  augustus: { name: 'Augustus', latin: 'Acta est fabula, plaudite.', tr: 'Oyun bitti, alkışlayın.', who: 'bir aktörün cümlesi', end: 'Elli yıl bekledi, oynadı, reddetti, ısrar ettirdi. Yatağında, uykusunda, yetmiş beş yaşında öldü ve tanrı ilan edildi.' },
  legacy: 'Roma tacı isteyen adamı öldürdü; istemiyormuş gibi yapan adama tanrılık verdi ve iki yüzyıl barış içinde yaşadı. Caesar bir unvan oldu — Kaiser, Çar, Kayser-i Rûm. Augustus bir ay oldu — Ağustos. Biri hükmetmenin adı, diğeri senenin en sıcak ayı.',
  system: 'Ama asıl mesele: Augustus’un kurduğu sistem — princeps fikri, hiçbir şeyin resmen değişmediği ama her şeyin değiştiği düzen — Roma’yı 400 yıl daha, Doğu’da 1400 yıl daha yaşattı. 1453’te Konstantinopolis’in surlarında ölen son imparator, Augustus’un kurduğu makamın son sahibiydi. Ve o surları aşan adam kendine bir unvan seçti: Kayser-i Rûm.',
} as const;

/* ══════════════════ Zaman çizelgesi + quiz ══════════════════ */

export const timeline = [
  { year: 'MÖ 63', title: 'Hasta çocuk', text: 'Velitrae’de, asilzade olmayan bir ailede Gaius Octavius doğdu. Ömrü boyunca hasta olacaktı — ve odadaki herkesten uzun yaşayacaktı.' },
  { year: 'MÖ 44', title: 'İki haber', text: 'Apollonia’da bir haber: Caesar öldürüldü. Sonra ikincisi: seni evlat edindi. 18 yaşındaki çocuk kabul etti ve kendine "Caesar" demeye başladı.' },
  { year: 'MÖ 43', title: 'Liste', text: 'İkinci Triumvirlik + proscriptio. 2.300 isim. En sonunda: Cicero — bir zamanlar "bu çocuğu şişirip atarız" diyen adam.' },
  { year: 'MÖ 42', title: 'Philippi', text: 'Agrippa savaşı kazandı, Octavianus çadırında hastaydı. Ve ne olmadığını kabul etme dehasını gösterdi.' },
  { year: 'MÖ 31', title: 'Actium', text: 'Savaşı Antonius’a değil, Kleopatra’ya açtı — modern siyasetin doğum belgesi. Agrippa kazandı.' },
  { year: 'MÖ 27', title: 'Sahte teslim', text: 'Her şeyi Senato’ya "geri verdi", onlar da yalvarıp geri aldırdı. Yeni bir isim: Augustus. Cumhuriyet’i yıkmadı — içine yerleşti.' },
  { year: 'MÖ 2', title: 'Kendi yasası', text: 'Zinayı suç yapan yasayı kendi kızı Julia’ya uyguladı; onu bir adaya sürdü ve bir daha görmedi.' },
  { year: 'MS 9', title: 'Üç boşluk', text: 'Teutoburg’da üç lejyon yok oldu. XVII, XVIII, XIX numaraları bir daha asla kullanılmadı.' },
  { year: 'MS 14', title: 'Perde', text: '"Oyun bitti, alkışlayın." Yatağında, uykusunda öldü. Bir ay sonra tanrı ilan edildi.' },
  { year: '1453', title: 'Son sahip', text: 'Augustus’un kurduğu makamın son sahibi Konstantinopolis surlarında öldü. Ve şehri alan padişah kendine "Kayser-i Rûm" dedi.' },
];

export const quizQs = [
  {
    text: 'Augustus MÖ 27’de Senato’ya girip "her şeyi geri veriyorum" dedi. Bu neydi?',
    opts: ['Gerçek bir emeklilik', 'Bir sahne — yetkiyi başka adlarla geri aldı', 'Cumhuriyet’in gerçek dönüşü', 'Bir zayıflık anı'],
    a: 1,
    exp: 'Yetkileri gerçekten bıraktı, ama Senato yalvarınca "isteksizce" geri aldı — sadece bir kısmını, geçici olarak, devlet için. Reddediş senaryonun parçasıydı. Cumhuriyet’i yıkmadı, içine yerleşti.',
  },
  {
    text: 'Augustus’un gücü resmen neye dayanıyordu?',
    opts: ['Kral unvanına', 'Ömür boyu diktatörlüğe', 'Cumhuriyet’in eski makamlarının tek vücutta toplanmasına', 'Senato’nun onu imparator seçmesine'],
    a: 2,
    exp: 'Tribün dokunulmazlığı + prokonsül imperium’u + Pontifex Maximus + Pater Patriae. Hiçbiri kraliyet unvanı değil; hepsi eski, meşru makamlar. O sadece hepsini aynı anda topladı. En tehlikeli güç, adı olmayan güçtür.',
  },
  {
    text: 'Teutoburg’dan sonra XVII, XVIII ve XIX lejyon numaralarına ne oldu?',
    opts: ['Yeniden kuruldular', 'Başka lejyonlara verildi', 'Bir daha asla kullanılmadı', 'İsimleri değiştirildi'],
    a: 2,
    exp: 'Roma lejyon numaralarını geri dönüştürürdü, ama bu üçü imparatorluğun sonuna kadar boş kaldı. Bazı anıtlar boşluktan yapılır.',
  },
  {
    text: 'Augustus’un ölüm döşeğindeki son "resmî" sözü neydi?',
    opts: ['"Zar atıldı"', '"Roma’yı mermerden bıraktım"', '"Oyun bitti, alkışlayın"', '"Lejyonlarımı geri ver"'],
    a: 2,
    exp: '"Acta est fabula, plaudite" — Roma komedilerinin kapanış repliği. Elli yıl "sıradan bir vatandaşım" diyen adam, ölmeden önce açıkça "bu bir oyundu" dedi. "Zar atıldı" ise Caesar’ın cümlesiydi — biri kumarbaz, biri aktör.',
  },
  {
    text: 'Caesar ile Augustus arasındaki temel fark neydi?',
    opts: ['Augustus daha iyi bir generaldi', 'Caesar tacı istedi ve öldürüldü; Augustus istemiyormuş gibi yapıp her şeyi aldı', 'Augustus Cumhuriyet’i gerçekten geri getirdi', 'Caesar daha uzun yaşadı'],
    a: 1,
    exp: 'Caesar tacı istediği için 23 bıçak yedi. Augustus tacı iterek her şeyi aldı, iki yüzyıl barış kurdu ve tanrı ilan edildi. Fark, "Zar atıldı" ile "Oyun bitti, alkışlayın" arasındaki fark.',
  },
];
