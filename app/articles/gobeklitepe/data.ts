// Göbeklitepe makalesinin TÜM verisi — çok-ajanlı araştırma turundan (DAI/Tepe
// Telegrams, UNESCO, Banning 2011, Dietrich vd., Smithsonian) doğrulandı. Bir
// değeri değiştirirken kaynağını da güncelle.

export const GOBEKLI_BCE = 9600; // en eski tabaka (Kat III); radyokarbon MÖ 9745–9300

/* ─────────────── Derin zaman kaydırıcısı: kilometre taşları ─────────────── */

export type Milestone = { label: string; yearBCE: number; icon: string; note: string };

// yearBCE: MÖ pozitif, MS negatif. Tarihler en yaygın kabul gören değerler.
export const MILESTONES: Milestone[] = [
  { label: 'Buzul Çağı biter', yearBCE: 9700, icon: '❄️', note: 'Younger Dryas sona erer, Holosen başlar. İklim ısınır — ve birkaç kuşak sonra Göbeklitepe yükselir.' },
  { label: 'Göbeklitepe', yearBCE: 9600, icon: '🗿', note: 'En eski taş çemberler. Avcı-toplayıcılar, tarımdan bile önce, onlarca tonluk T-pilarları dikiyor.' },
  { label: 'Tarım başlar', yearBCE: 8800, icon: '🌾', note: 'Bereketli Hilal’de buğday evcilleştirilir — Göbeklitepe’den yaklaşık sekiz yüzyıl SONRA. Yani tapınak, tarladan eskidir.' },
  { label: 'Jericho kulesi', yearBCE: 8000, icon: '🧱', note: 'Bilinen en eski kent suru ve kulesi. İnsanlar artık kalıcı, savunmalı yerleşimler kuruyor.' },
  { label: 'Çatalhöyük', yearBCE: 7400, icon: '🏘️', note: 'Anadolu’da binlerce kişilik, kapıları çatıda olan yığma bir kasaba. Göbeklitepe çoktan terk edilmişti.' },
  { label: 'Çömlek yayılır', yearBCE: 7000, icon: '🏺', note: 'Pişmiş toprak kaplar Yakın Doğu’ya yayılır. Göbeklitepe halkı çömleği hiç görmedi — onlarınki “Çanak Çömleksiz Neolitik”.' },
  { label: 'İlk şehir: Uruk', yearBCE: 4000, icon: '🏙️', note: 'Mezopotamya’da dünyanın ilk gerçek kenti. Göbeklitepe’den beri 5.600 yıl geçmiş.' },
  { label: 'Tekerlek', yearBCE: 3500, icon: '🛞', note: 'İlk çömlekçi çarkı ve tekerlekli araçlar. Pilarları taşıyanların ne tekerleği ne yük hayvanı vardı.' },
  { label: 'Yazı icat edilir', yearBCE: 3200, icon: '✍️', note: 'Sümer’de çivi yazısı. Tarih burada başlar — Göbeklitepe’den 6.400 yıl sonra.' },
  { label: 'Stonehenge', yearBCE: 3000, icon: '🪨', note: 'İlk toprak çember. Göbeklitepe ondan yaklaşık 6.600 yıl daha eskidir.' },
  { label: 'Giza piramitleri', yearBCE: 2560, icon: '🔺', note: 'Keops piramidi. Göbeklitepe ile piramitler arası, piramitlerle bugün arasından DAHA UZUN.' },
  { label: 'Kolezyum', yearBCE: -80, icon: '🏟️', note: 'Roma açılışını yapar. Göbeklitepe o gün bile 9.600 yıllıktı — bize antik gelen her şey, ona göre yeni.' },
];

/* ─────────────── "Henüz icat edilmemişti" ─────────────── */

export const NOT_YET = [
  { label: 'Tarım ve köyler', icon: '🌾', after: '≈800 yıl sonra', note: 'Onu yapanların ne evcil bitkisi ne hayvanı vardı; hepsi yabaniydi.' },
  { label: 'Çömlek', icon: '🏺', after: '≈2.600 yıl sonra', note: 'Pişmiş toprak kap yok. Dönemin adı bile “Çanak Çömleksiz Neolitik”.' },
  { label: 'Metal', icon: '⚒️', after: '≈6.300 yıl sonra', note: 'Bakır bile yok. Taşı yalnızca taş aletlerle yonttular.' },
  { label: 'Tekerlek', icon: '🛞', after: '≈6.100 yıl sonra', note: 'Ne tekerlek ne yük hayvanı. Devasa taşları insan gücü ve kaldıraçla taşıdılar.' },
  { label: 'Yazı', icon: '✍️', after: '≈6.400 yıl sonra', note: 'Tek bir yazılı sözcük yok. Bize ne demek istediklerini yalnızca taştaki hayvanlar anlatıyor.' },
  { label: 'Şehirler', icon: '🏙️', after: '≈5.600 yıl sonra', note: 'İlk kentten çok önce. Belki de birlikte inşa etme ihtiyacı, kenti mümkün kılan şeydi.' },
];

/* ─────────────── T-pilar kâşifi: tıklama noktaları ─────────────── */

export type Hotspot = { id: string; label: string; x: number; y: number; desc: string };

// SVG viewBox 200×300 üzerindeki koordinatlar (widgets.tsx PillarExplorer ile eşleşir).
export const PILLAR_HOTSPOTS: Hotspot[] = [
  { id: 'kafa', label: 'Yüzsüz baş', x: 100, y: 52, desc: 'T’nin yatay üst plakası bir baş ve omuzdur — ama yüzü yok. Göz, ağız, ifade yok. Dünyanın en eski anıtsal insan figürleri kasıtlı olarak kimliksiz bırakıldı; belki atalar, belki aşkın varlıklar. (Schmidt; DAI)' },
  { id: 'kol', label: 'Kollar', x: 62, y: 138, desc: 'Piların dar yan yüzlerinde, dirsekten kırılıp öne dönen kabartma kollar. Taşın aslında bir gövde olduğunu ilk ele veren ayrıntı budur. (DAI)' },
  { id: 'eller', label: 'Eller', x: 100, y: 156, desc: 'Karnın üstünde neredeyse birleşen iki el; parmaklar tek tek işlenmiş. Bu dev soyut taşta insan eli detayı, figürün bilinçli olarak insansı yapıldığını kanıtlar. (Tepe Telegrams)' },
  { id: 'kemer', label: 'Kemer & toka', x: 100, y: 202, desc: 'Belde büyük, tokalı bir kabartma kemer. Kemerin yeri, T-başının neden “kafa” okunduğunu doğrular: baş yukarıda, bel ortada. (Wikipedia; DAI)' },
  { id: 'pestamal', label: 'Tilki-postu peştamal', x: 100, y: 226, desc: 'Kemerden bir tilki-derisi peştamal sarkar (Pilar 31). Aynı tilki hem duvarda bir hayvan hem burada bir giysidir — ikonografinin kendi içinde tutarlı bir dili var. (Schmidt)' },
  { id: 'hayvan', label: 'Hayvan kabartması', x: 150, y: 118, desc: 'Gövdede alçak kabartma bir hayvan — tilki, yılan, akrep ya da yaban domuzu. Betimlenenlerin çoğu tehlikeli/yırtıcı hayvanlardır, av hayvanı değil: bu bir menü değil, bir semboller sistemi. (Peters & Schmidt 2004)' },
];

/* ─────────────── Çevre haritası ─────────────── */

export type Enclosure = { id: string; cx: number; cy: number; r: number; diameter: string; pillars: string; dominant: string; note: string };

// SVG viewBox 240×240. Baskın hayvan eşlemesi DAI’den KESİN: A=yılan, B=tilki, C=domuz, D=kuşlar.
export const ENCLOSURES: Enclosure[] = [
  { id: 'D', cx: 92, cy: 96, r: 42, diameter: '~20', pillars: '~12', dominant: '🕊️ Kuşlar', note: 'En iyi korunan çember. En uzun pilarlar (~5,5 m) ve ünlü Akbaba Taşı (Pilar 43) burada. Turna ve akbaba baskın; merkezî ikiz pilarlarda tilki, kol, el ve peştamal en net görülür.' },
  { id: 'C', cx: 170, cy: 148, r: 38, diameter: '~30', pillars: '~14', dominant: '🐗 Yaban domuzu', note: 'İç içe duvarlarıyla en geniş çember. Neredeyse bir “domuz çevresi”: yaban domuzu hem kabartma hem heykel olarak baskın. Tek bir hayvana bu yoğunlaşma, her çemberin bir topluluğun amblemini taşıdığı fikrini besliyor.' },
  { id: 'B', cx: 178, cy: 56, r: 24, diameter: '~15', pillars: '~8', dominant: '🦊 Tilki', note: 'Tilkinin baskın olduğu çember. Merkezî pilarların dibinde tilki kabartmaları öne çıkar. Tilki hem burada hem D’de en sık işlenen memelilerden.' },
  { id: 'A', cx: 62, cy: 182, r: 26, diameter: '~15', pillars: '~8', dominant: '🐍 Yılan', note: 'Yılanın baskın olduğu çember — sitenin en sık hayvanı. Kimi pilarda onlarca yılan bir arada, örgü/sürü halinde. Yılanın av değeri yok; anlamı koruma ya da dönüşüm olabilir.' },
];

/* ─────────────── Keşif zaman çizelgesi (yatay) ─────────────── */

export const timeline = [
  { year: '1963', title: 'Mezarlık sanıldı', text: 'İstanbul–Chicago yüzey araştırması alanı kaydeder ama önemini kaçırır. Peter Benedict tepedeki taşları iki küçük mezarlık sanır — ve höyük yıllarca unutulur.' },
  { year: '1994', title: 'Klaus Schmidt fark eder', text: 'Alman arkeolog Klaus Schmidt eski kaydı yeniden okur, tepeye çıkar ve toprağın altından çıkan T-pilarları görür. “Ya buradan hemen gidersin, ya da hayatının geri kalanını burada geçirirsin.” Kalır.' },
  { year: '1995', title: 'Kazı başlar', text: 'Şanlıurfa Müzesi ve Alman Arkeoloji Enstitüsü sistematik kazıya başlar. Kısa süre sonra ilk anıtsal çember ortaya çıkar.' },
  { year: '2010', title: 'Taştan bir dünya', text: 'Akbaba Taşı, totem direği, yüzsüz devler. Alan “Taş Devri hayvanat bahçesi”ne değil, sembolik bir dünyaya benziyor.' },
  { year: '2014', title: 'Schmidt’i kaybederiz', text: 'Kazıyı 18 yıl yöneten Klaus Schmidt bir kalp kriziyle ölür. Sorduğu soruların çoğu hâlâ toprağın altında.' },
  { year: '2017', title: 'Kafatası kültü', text: 'İşlenmiş insan kafatası parçaları bulunur: çakmaktaşıyla açılmış oluklar, kasıtlı bir delik. Kafatasları süslenip asılıyordu — Neolitik’te yeni bir kült türü.' },
  { year: '2018', title: 'Dünya Mirası', text: 'UNESCO Göbeklitepe’yi Dünya Mirası Listesi’ne alır. Artık tüm insanlığın ortak mirası.' },
  { year: '2023', title: 'Renk geri gelir', text: 'Çevre D’de kırmızı, siyah ve beyaz pigment taşıyan boyalı bir yaban domuzu heykeli çıkar — bilinen en eski boyalı Neolitik heykel. Taş dünya renksiz değilmiş.' },
];

/* ─────────────── Mini test ─────────────── */

export const quizQs = [
  {
    text: 'Göbeklitepe kabaca ne kadar eski?',
    opts: ['~2.500 yıl', '~5.000 yıl', '~11.600 yıl', '~50.000 yıl'],
    a: 2,
    exp: 'En eski tabaka yaklaşık MÖ 9600 — günümüzden ~11.600 yıl önce. Stonehenge’den ~6.600, Giza piramitlerinden ~7.000 yıl daha eski.',
  },
  {
    text: 'Göbeklitepe’yi kimler inşa etti?',
    opts: ['Mısırlı mimarlar', 'Avcı-toplayıcılar', 'İlk şehir devletleri', 'Bilinmiyor / uzaylılar'],
    a: 1,
    exp: 'Kalıntılardaki tüm hayvanlar yabani: ne evcil bitki ne hayvan. Onu tarım, çömlek, yazı ve metalden ÖNCE yaşayan avcı-toplayıcılar yaptı.',
  },
  {
    text: 'Bir T-pilar aslında neyi temsil ediyor?',
    opts: ['Bir ağaç', 'Yüzsüz, stilize bir insan', 'Bir hayvan', 'Bir güneş saati'],
    a: 1,
    exp: 'Kollar, karında birleşen eller, kemer ve tilki-postu peştamal: pilarlar soyut, yüzsüz insan/varlık figürleridir. T-başı baştır.',
  },
  {
    text: 'Göbeklitepe ile tarım arasındaki ilişki nedir?',
    opts: ['Tarımdan çok sonra yapıldı', 'Tarımla aynı anda', 'Tarımdan ÖNCE yapıldı', 'Tarımla ilgisi yok'],
    a: 2,
    exp: 'Çemberler, buğdayın evcilleştirilmesinden yaklaşık sekiz yüzyıl önce dikildi. Schmidt’in ünlü tezi: belki de önce tapınak geldi, tarımı o tetikledi.',
  },
  {
    text: 'Çevre D’deki ünlü “Akbaba Taşı”nın (Pilar 43) ana akım yorumu nedir?',
    opts: ['Bir kuyruklu yıldız çarpması takvimi', 'Cenaze / ölüm kültü sembolizmi', 'Bir yıldız haritası', 'Bir av sahnesi'],
    a: 1,
    exp: 'Akbaba + başsız insan figürü, Yakın Doğu’da bilinen bir ölü gömme temasıdır. “Kuyruklu yıldız takvimi” iddiası (Sweatman 2017) ana akım tarafından reddedildi.',
  },
  {
    text: 'Alanın ne kadarı kazıldı?',
    opts: ['Neredeyse tamamı', '~%50', '~%10', 'Hiç kazılmadı'],
    a: 2,
    exp: 'Yalnızca ~%10. Jeofizik taramalar toprak altında ~16 çember daha, toplam ~200 pilar olduğunu gösteriyor. En büyük buluntular hâlâ gömülü olabilir.',
  },
];
