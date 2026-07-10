// Radyoaktivite makalesinin TÜM sayısal verisi tek yerde (düz modül — hem sunucu
// hem istemci import eder). Sayılar araştırma/doğrulama turundan geçti; her
// sabitin yanında kaynağı var. Bir sayıyı değiştirirken kaynağı da güncelle.

export const YEAR_S = 3.1557e7; // Julian yılı (saniye)

/* ─────────────── Yarılanma süresi simülatörü: izotoplar ─────────────── */

export type Isotope = {
  key: string;
  name: string;       // "Karbon-14"
  symbol: string;     // "¹⁴C"
  halfLife: string;   // okunabilir
  halfLifeS: number;  // saniye
  color: string;
  blurb: string;      // neden bu izotop ilginç
};

// Kaynak: NNDC/BNL Chart of Nuclides; C-14 için Godwin 1962 → 5.700 ± 30 yıl
// (Libby'nin ilk 5.568 yılı hâlâ "konvansiyonel radyokarbon yaşı"nda kullanılır).
export const ISOTOPES: Isotope[] = [
  {
    key: 'tc99m', name: 'Teknesyum-99m', symbol: '⁹⁹ᵐTc',
    halfLife: '6,01 saat', halfLifeS: 6.0067 * 3600, color: '#22d3ee',
    blurb: 'Tıbbi görüntülemenin iş atı. Görevini yapıp neredeyse hemen kaybolur — hastada iz bırakmaz.',
  },
  {
    key: 'c14', name: 'Karbon-14', symbol: '¹⁴C',
    halfLife: '5.700 yıl', halfLifeS: 5700 * YEAR_S, color: '#a3e635',
    blurb: 'Arkeolojinin saati. Ötzi\'nin yaşını, ölmüş bir adamın hücrelerindeki karbonun ne kadar tükendiğine bakarak biliyoruz.',
  },
  {
    key: 'ra226', name: 'Radyum-226', symbol: '²²⁶Ra',
    halfLife: '1.600 yıl', halfLifeS: 1600 * YEAR_S, color: '#fbbf24',
    blurb: 'Curie\'nin defterlerine bulaşan izotop. Defterler bugün yaşayan hiç kimsenin göremeyeceği kadar uzun süre tehlikeli kalacak.',
  },
  {
    key: 'u238', name: 'Uranyum-238', symbol: '²³⁸U',
    halfLife: '4,468 milyar yıl', halfLifeS: 4.468e9 * YEAR_S, color: '#c084fc',
    blurb: 'Dünya\'nın yaşıyla aynı mertebede. Kabuktaki bir atom 4,5 milyar yıldır orada — ve önümüzdeki saniyede bozunma şansı hâlâ dünküyle aynı.',
  },
];

export const GRID_COLS = 40;
export const GRID_ROWS = 25;
export const GRID_N = GRID_COLS * GRID_ROWS; // 1.000 nokta

/* ──────────────────────── Nüfuz etme kutusu ──────────────────────── */

export type BarrierKey = 'kagit' | 'aluminyum' | 'kursun';

export type Barrier = {
  key: BarrierKey;
  label: string;
  spec: string;      // kalınlık
  icon: string;
  // geçirgenlik: 0 = hepsi durur, 1 = hepsi geçer
  pass: { alpha: number; beta: number; gamma: number };
};

// Geçirgenlikler tipik enerjiler için (α ≈ 5 MeV, β ≈ 1 MeV, γ ≈ 1 MeV).
// Kurşunun 1 MeV foton için yarı-kalınlığı ≈ 0,9 cm → 5 cm ≈ 2^-5,5 ≈ %2,2.
// Kaynak: NIST XCOM zayıflama katsayıları; IAEA radyasyon koruma temelleri.
export const BARRIERS: Barrier[] = [
  { key: 'kagit', label: 'Kâğıt', spec: '1 yaprak (~0,1 mm)', icon: '📄', pass: { alpha: 0, beta: 0.95, gamma: 0.995 } },
  { key: 'aluminyum', label: 'Alüminyum', spec: '3 mm folyo/levha', icon: '🧴', pass: { alpha: 0, beta: 0.02, gamma: 0.90 } },
  { key: 'kursun', label: 'Kurşun', spec: '5 cm blok', icon: '🧱', pass: { alpha: 0, beta: 0, gamma: 0.022 } },
];

export const RAY_INFO = {
  alpha: { range: 'havada ~4 cm', mass: '2 proton + 2 nötron', note: 'Deriniz durdurur. Ama yutulursa acımasız: Litvinenko\'yu öldüren polonyum-210 bir alfa yayıcısıydı.' },
  beta: { range: 'havada ~3 m', mass: 'bir elektron (ya da pozitron)', note: 'Birkaç milimetre alüminyum ya da kalın bir kitap keser.' },
  gamma: { range: 'havada yüzlerce metre', mass: 'kütlesiz foton', note: 'Kütlesi olmadığı için maddenin arasından süzülür. Kurşun, kalın beton, birkaç metre su gerekir.' },
} as const;

/* ─────────────────────── Vücut radyoaktivitesi ─────────────────────── */

// Kilogram başına bozunma/saniye (Bq/kg), 70 kg referans insandan türetildi.
//  K-40 : vücut potasyumu ≈ 2 g/kg × %0,0117 K-40 → ≈ 4.300 Bq / 70 kg
//  C-14 : vücut karbonu ≈ %18 × 0,226 Bq/g(karbon)  → ≈ 2.850 Bq / 70 kg
//  Rb-87 + eser (Po-210, Pb-210, H-3, Be-7) → ≈ 650 Bq / 70 kg
// Kaynak: ICRP Yayın 23 "Referans İnsan"; UNSCEAR 2000 Ek B.
export const BODY = {
  k40: 62,   // Bq/kg
  c14: 41,   // Bq/kg
  other: 9,  // Bq/kg  (Rb-87 ≈ 8,6 + eser)
  get total() { return this.k40 + this.c14 + this.other; }, // 112 Bq/kg
};

export const DEFAULT_WEIGHT = 70;

/* ───────────────────────── Doz kıyaslama ───────────────────────── */

export type DoseItem = {
  key: string;
  label: string;
  sv: number;       // sievert
  icon: string;
  note: string;
  tone: 'calm' | 'mid' | 'hot';
};

// Etkin doz (effective dose), sievert. Kaynaklar: UNSCEAR 2008; ICRP 103;
// RadiologyInfo.org (RSNA/ACR); EPA; UNSCEAR 2008 Ek D (Çernobil).
export const DOSES: DoseItem[] = [
  { key: 'muz', label: '1 muz', sv: 1e-7, icon: '🍌', tone: 'calm', note: '"Muz eşdeğer dozu" — resmî bir birim değil, bir anlatım hilesi.' },
  { key: 'dis', label: 'Diş röntgeni', sv: 5e-6, icon: '🦷', tone: 'calm', note: 'Tek ağız içi film.' },
  { key: 'gogus', label: 'Göğüs röntgeni', sv: 2e-5, icon: '🫁', tone: 'calm', note: 'Tek PA film.' },
  { key: 'ucus', label: 'Transatlantik uçuş', sv: 4e-5, icon: '✈️', tone: 'calm', note: '~10 saat, 11 km irtifa. Kozmik ışınlar.' },
  { key: 'mamografi', label: 'Mamografi', sv: 4e-4, icon: '🩻', tone: 'mid', note: 'İki yönlü çekim.' },
  { key: 'fon', label: 'Yıllık doğal fon', sv: 2.4e-3, icon: '🌍', tone: 'mid', note: 'Dünya ortalaması (UNSCEAR). Radon bunun yarısı.' },
  { key: 'bt', label: 'Göğüs BT taraması', sv: 7e-3, icon: '🏥', tone: 'mid', note: 'Yaklaşık 3 yıllık doğal fona eşdeğer.' },
  { key: 'limit', label: 'Radyasyon çalışanı yıllık limiti', sv: 2e-2, icon: '⚠️', tone: 'mid', note: 'ICRP: 5 yılda ortalama 20 mSv/yıl.' },
  { key: 'likidator', label: 'Çernobil temizlik işçisi', sv: 1e-1, icon: '☢️', tone: 'hot', note: '1986–87 likidatörlerinin ortalama kayıtlı dozu. Bazıları çok daha fazlasını aldı.' },
  { key: 'ars', label: 'Akut radyasyon sendromu eşiği', sv: 1, icon: '🤢', tone: 'hot', note: 'Kısa sürede tüm vücuda. Bulantı, kan hücrelerinde düşüş.' },
  { key: 'ld50', label: 'Tedavisiz ölümcül doz (LD50)', sv: 4.5, icon: '💀', tone: 'hot', note: '60 gün içinde iki kişiden biri. Çernobil itfaiyecileri 2–16 Sv aldı.' },
];

export const DOSE_MIN_SV = 1e-7;
export const DOSE_MAX_SV = 1e1;
export const BANANA_SV = 1e-7;

/* ──────────────────────── Geiger sayacı ──────────────────────── */

export type Scene = { key: string; label: string; icon: string; cpm: number; blurb: string; ore?: boolean };

// CPM değerleri TEMSİLÎDİR: gerçek okuma dedektör tüpüne, hacmine ve verimine bağlıdır.
// Büyüklük mertebeleri tipik bir Geiger–Müller tüpünden (SBM-20) alındı.
export const SCENES: Scene[] = [
  { key: 'fon', label: 'Doğal fon', icon: '🌤️', cpm: 25, blurb: 'Şu an, bu odada. Kozmik ışınlar + topraktaki uranyum, toryum, potasyum.' },
  { key: 'granit', label: 'Granit tezgâh', icon: '🪨', cpm: 60, blurb: 'Granit uranyum ve toryum içerir. Mutfağınız fon radyasyonunun iki katı.' },
  { key: 'ucak', label: 'Uçak, 11 km', icon: '✈️', cpm: 120, blurb: 'Atmosferin koruması inceldi. Uçuş ekibi, mesleki ışınlanan bir grup sayılır.' },
  { key: 'cam', label: 'Uranyum camı', icon: '🥃', cpm: 300, blurb: '1930\'ların "vazelin camı" — uranyumla sarıya boyanmış, morötesinde parlar.' },
  { key: 'kadran', label: 'Radyumlu saat kadranı', icon: '⌚', cpm: 2500, blurb: 'Parlayan kızların fırçayla boyadığı kadran. Yüz yıl sonra hâlâ ışıyor.' },
  { key: 'cevher', label: 'Uranyum cevheri', icon: '☢️', cpm: 18000, blurb: 'Uraninit. Yaklaştıkça tıklar ayrışmayı bırakıp çığlığa dönüşür.', ore: true },
];

export const GEIGER_BG_CPM = 25;

/* ─────────────── Bozunma zinciri: U-238 → Pb-206 ─────────────── */

export type ChainStep = {
  from: string; fromSym: string;
  to: string; toSym: string;
  mode: 'alpha' | 'beta';
  halfLife: string;
  halfLifeS: number;
  note?: string;
};

// Uranyum serisi (4n+2). Dallanan basamaklarda ana (>%99,9) kol alındı.
// 8 alfa + 6 beta: A 238→206 (8×4), Z 92→82 (−16 alfa +6 beta). Kaynak: NNDC.
export const CHAIN: ChainStep[] = [
  { from: 'Uranyum-238', fromSym: '²³⁸U', to: 'Toryum-234', toSym: '²³⁴Th', mode: 'alpha', halfLife: '4,468 milyar yıl', halfLifeS: 4.468e9 * YEAR_S, note: 'Zincirin darboğazı. Her şey bu yavaş adımın hızında akar.' },
  { from: 'Toryum-234', fromSym: '²³⁴Th', to: 'Protaktinyum-234m', toSym: '²³⁴ᵐPa', mode: 'beta', halfLife: '24,1 gün', halfLifeS: 24.1 * 86400 },
  { from: 'Protaktinyum-234m', fromSym: '²³⁴ᵐPa', to: 'Uranyum-234', toSym: '²³⁴U', mode: 'beta', halfLife: '1,16 dakika', halfLifeS: 69.5 },
  { from: 'Uranyum-234', fromSym: '²³⁴U', to: 'Toryum-230', toSym: '²³⁰Th', mode: 'alpha', halfLife: '245.500 yıl', halfLifeS: 2.455e5 * YEAR_S },
  { from: 'Toryum-230', fromSym: '²³⁰Th', to: 'Radyum-226', toSym: '²²⁶Ra', mode: 'alpha', halfLife: '75.400 yıl', halfLifeS: 7.54e4 * YEAR_S },
  { from: 'Radyum-226', fromSym: '²²⁶Ra', to: 'Radon-222', toSym: '²²²Rn', mode: 'alpha', halfLife: '1.600 yıl', halfLifeS: 1600 * YEAR_S, note: 'Curie\'nin defterlerindeki izotop. Kemiğe, kalsiyum sanılarak yerleşir.' },
  { from: 'Radon-222', fromSym: '²²²Rn', to: 'Polonyum-218', toSym: '²¹⁸Po', mode: 'alpha', halfLife: '3,82 gün', halfLifeS: 3.8232 * 86400, note: 'Bir SOY GAZ. Kayadan sızar, bodrumunuzda birikir. Sigaradan sonra akciğer kanserinin ikinci nedeni (sigara içmeyenlerde birinci).' },
  { from: 'Polonyum-218', fromSym: '²¹⁸Po', to: 'Kurşun-214', toSym: '²¹⁴Pb', mode: 'alpha', halfLife: '3,10 dakika', halfLifeS: 186 },
  { from: 'Kurşun-214', fromSym: '²¹⁴Pb', to: 'Bizmut-214', toSym: '²¹⁴Bi', mode: 'beta', halfLife: '26,9 dakika', halfLifeS: 1614 },
  { from: 'Bizmut-214', fromSym: '²¹⁴Bi', to: 'Polonyum-214', toSym: '²¹⁴Po', mode: 'beta', halfLife: '19,9 dakika', halfLifeS: 1194, note: 'Küçük bir alfa dalı da var (%0,02) — zincirler tam olarak tek şerit değildir.' },
  { from: 'Polonyum-214', fromSym: '²¹⁴Po', to: 'Kurşun-210', toSym: '²¹⁰Pb', mode: 'alpha', halfLife: '164 mikrosaniye', halfLifeS: 1.64e-4, note: 'Zincirin en aceleci adımı. U-238\'in yanında yaklaşık 10²¹ kat — milyar kere milyar kat — daha hızlı.' },
  { from: 'Kurşun-210', fromSym: '²¹⁰Pb', to: 'Bizmut-210', toSym: '²¹⁰Bi', mode: 'beta', halfLife: '22,2 yıl', halfLifeS: 22.2 * YEAR_S },
  { from: 'Bizmut-210', fromSym: '²¹⁰Bi', to: 'Polonyum-210', toSym: '²¹⁰Po', mode: 'beta', halfLife: '5,01 gün', halfLifeS: 5.012 * 86400 },
  { from: 'Polonyum-210', fromSym: '²¹⁰Po', to: 'Kurşun-206', toSym: '²⁰⁶Pb', mode: 'alpha', halfLife: '138,4 gün', halfLifeS: 138.376 * 86400, note: 'Litvinenko\'nun çayındaki izotop. Sonunda kararlı kurşun: zincir burada durur.' },
];

/* ──────────────────────── Zaman çizelgesi ──────────────────────── */

export const timeline = [
  { year: '1896', title: 'Bulutlu bir Paris günü', text: 'Henri Becquerel uranyum tuzunu güneşe çıkaramaz, çekmeceye tıkar. Günler sonra banyo ettiği plakada tuzun izi vardır — hiçbir dış enerji kaynağı olmadan.' },
  { year: '1898', title: 'Bir isim doğar', text: 'Marie Curie bu davranışa "radyoaktivite" der. Aynı yıl kocasıyla polonyum ve radyumu bulur. Sonra bu isimle yaşayıp bu isimle ölür.' },
  { year: '1928', title: 'Bir mekanizma değil, bir kumar', text: 'George Gamow — ve bağımsız olarak Gurney ile Condon — alfa bozunmasını kuantum tünellemesiyle açıklar. Parçacık aşamayacağı duvardan bir olasılıkla sızıyordur.' },
  { year: '1934', title: 'Yapay radyoaktivite', text: 'Irène ve Frédéric Joliot-Curie kararlı bir elementi bombardımanla radyoaktif hâle getirir. Artık radyoaktivite sadece bulunmuyor, üretiliyordur.' },
  { year: '1942', title: '"İlk" reaktör', text: 'Fermi\'nin ekibi Chicago\'da bir squash sahasının altında zincirleme tepkimeyi başlatır. Dünya\'nın onları 1,7 milyar yıl geçtiğini henüz kimse bilmiyor.' },
  { year: '1949', title: 'Ayarı bozulmayan saat', text: 'Willard Libby karbon-14\'ü bir tarihleme yöntemine çevirir. Ölüm anında karbon alımı durur; geri kalanı sessizce sayar.' },
  { year: '1963', title: 'Atmosferdeki tepe', text: 'Atmosferik bomba denemeleri karbon-14 seviyesini neredeyse iki katına çıkarmıştı. Test yasağıyla seviye düşmeye başlar — biyolojiye kazara bir hediye bırakarak.' },
  { year: '1972', title: 'Gabon\'daki reaktör', text: 'Oklo cevherinde uranyum-235 eksik çıkar. Çalınmamıştır: 1,7 milyar yıl önce o kaya damarlarında doğal bir fisyon reaktörü kendiliğinden çalışmıştır.' },
  { year: '1977', title: 'Radyoaktif bir kalp', text: 'Voyager 1 fırlatılır. İçinde bir plütonyum-238 parçası vardır ve sabırla, hiçbir şeye aldırmadan bozunur. Sonda hâlâ bizimle konuşuyor.' },
  { year: '2005', title: 'Beyin kaç yaşında?', text: 'İsveçli araştırmacılar bomba tepesini kullanarak hücrelerin doğum yılını okur. Nükleer silah denemeleri, insan beyninin kendini yenileyip yenilemediğini anlamamıza yardım etti.' },
];

/* ──────────────────────────── Mini test ──────────────────────────── */

export const quizQs = [
  {
    text: '"Yarılanma süresi 1.600 yıl" ne demek?',
    opts: ['Her atom 1.600 yıl yaşar', 'Atomların yarısı 1.600 yılda bozunur; kalanın şansı hiç değişmez', 'Bozunma 1.600 yılda tamamen durur', 'Atom 1.600 yıl sonra yarı boyuta iner'],
    a: 1,
    exp: 'Atomların hafızası yok. Ayakta kalan atomun önümüzdeki 1.600 yılda bozunma şansı hâlâ tam olarak yüzde elli — yorulmaz, yaşlanmaz.',
  },
  {
    text: 'Bir alfa yayıcısı ne zaman gerçekten tehlikelidir?',
    opts: ['Elinizde tuttuğunuzda', 'Yanından geçtiğinizde', 'Yuttuğunuzda ya da soluduğunuzda', 'Hiçbir zaman, kâğıt durdurur'],
    a: 2,
    exp: 'Alfa dışarıda zararsız (kâğıt, deri durdurur), içeride acımasız. Litvinenko polonyum-210\'u bir bardak çayla içti.',
  },
  {
    text: 'Vücudunuzda şu an saniyede kaç atom çekirdeği parçalanıyor?',
    opts: ['Sıfır — insan radyoaktif değildir', 'Birkaç tane', 'Yaklaşık 7.000–8.000', 'Milyarlarca'],
    a: 2,
    exp: 'Büyük kısmı potasyum-40, gerisi ağırlıkla karbon-14. Onları ayıklamanın imkânı yok: kimyasal olarak normal potasyum ve karbonla tıpatıp aynılar.',
  },
  {
    text: 'Yarılanma süresini hızlandırmak için ne yapabilirsiniz?',
    opts: ['Isıtmak', 'Basınç uygulamak', 'Kimyasal tepkimeye sokmak', 'Hiçbiri — değiştirilemez'],
    a: 3,
    exp: 'Bozunma çekirdeğin içinde olur; sıcaklık, basınç ve kimya elektronları ilgilendirir. Radyoaktif atık probleminin can sıkıcılığı tam olarak bu: onu ikna edemezsiniz.',
  },
  {
    text: 'Gama ışınını durdurmak için ne gerekir?',
    opts: ['Bir yaprak kâğıt', 'Bir alüminyum folyo', 'Kurşun, kalın beton ya da birkaç metre su', 'Hiçbir şey durduramaz'],
    a: 2,
    exp: 'Gama kütlesiz bir fotondur, maddenin arasından süzülür. Çernobil\'de kurşunun helikopterlerden dökülme sebebi buydu.',
  },
  {
    text: 'Oklo (Gabon) neden şaşırtıcıydı?',
    opts: ['Orada uranyum bulunmadı', 'Doğal bir nükleer reaktör 1,7 milyar yıl önce kendiliğinden çalışmıştı', 'Uranyum yapay olarak üretilmişti', 'Bir meteor çarpmıştı'],
    a: 1,
    exp: 'Yeraltı suyu moderatör görevi gördü; reaktör ısınınca su buharlaştı, tepkime yavaşladı, kaya soğuyunca su geri geldi. Kendi kendini düzenleyen bir sistem, yüz binlerce yıl.',
  },
  {
    text: 'Fazladan bir muz yemek vücudunuzun radyoaktivitesini kalıcı olarak artırır mı?',
    opts: ['Evet, potasyum birikir', 'Hayır — vücut potasyum seviyesini sabit tutar, fazlası idrarla gider', 'Evet ama sadece bir gün', 'Muz radyoaktif değildir'],
    a: 1,
    exp: 'Muz eşdeğer dozu, gerçek bir birikimden çok bir pedagoji numarasıdır: "radyasyon" kelimesinin kendi başına bir felaket ilanı olmadığını anlatır.',
  },
];
