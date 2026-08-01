/**
 * BİRİNCİL KATEGORİ — makalenin durduğu RAF. Her makalenin TAM BİR tanesi olur.
 *
 * KURAL (2026-08-01): raflar birbirinin içine giremez. Bir başlık başka bir
 * başlığın alt kümesiyse kategori OLAMAZ, topic olur. "Osmanlı" Tarih'in
 * içindedir → topic. "İmparatorlar" Tarih'in içindedir → topic. Fatih'in
 * kategorisi bu yüzden tartışmasız `Tarih`.
 *
 * İkinci doğrulama: bir makale iki rafa birden sığıyorsa o iki raf kardeş
 * değil, iç içedir → biri topic olmalı.
 *
 * 6 → 9 (2026-08-01). Eski `Kültür` bir raf değil ARTIK KUTUSU olmuştu:
 * içinde ekonomi + kaligrafi + sanat akımları vardı, üçünün ortak konusu yok.
 * Kaldırıldı; yerine Sanat ve Ekonomi geldi. Aynı sıkışma iki yerde daha
 * vardı: `dunya` (gezegen oluşumu) Fizik'te, `tibbi`/`bagirsak` Biyoloji'de.
 *
 * BÖLME KURALI: bir kategori diğerlerinin ortalamasının ~3 katına çıkınca ya da
 * içindeki bir topic tek başına kategori büyüklüğüne ulaşınca bölünür. Yılda
 * bir-iki kez yapılan bilinçli bir iş — makale başına verilen bir karar DEĞİL.
 * Bir topic ne kadar büyürse büyüsün kategoriye TERFİ ETMEZ; kendi URL'ini alır
 * ama rafının altında kalır.
 *
 * ⚠ Buraya kategori eklersen şu dört yer birlikte güncellenir. Dördü de
 * `Record<ArticleCategory, …>` ya da `ArticleCategory[]` olduğu için **`tsc`
 * hepsini yakalar** — unutursan derleme durur, sessiz hata olmaz:
 *   1. app/components/ArticleIndex.tsx → SIRA + RENK + `--ink-*`
 *      ⚠ `--ink-*` CSS'i tsc'nin GÖREMEDİĞİ tek parça: İKİ TEMA için renk
 *        ekle ve AA'yı ÖLÇ (mevcut taban: açık 5.18 / koyu 6.55).
 *   2. lib/landing.ts             → CATEGORY_ORDER
 *   3. app/okuma-listesi/page.tsx → CATEGORY_EMOJI
 *   4. lib/badges.ts              → BADGES + CATEGORY_BADGE_KEYS
 */
export type ArticleCategory =
  | 'Fizik' | 'Astronomi' | 'Kimya' | 'Biyoloji' | 'Tıp'
  | 'Teknoloji' | 'Tarih' | 'Sanat' | 'Ekonomi';

/**
 * KONULAR — kategoriden farklı olarak ÇOKLU. Fatih hem 'Osmanlı' hem
 * 'İmparatorluklar' hem 'İstanbul'dur; kategorisi ise yalnızca `Tarih`.
 *
 * NİYE `string[]` DEĞİL DE TİP BİRLEŞİMİ: serbest string olsaydı 'Osmanlı' ile
 * 'Osmanli' sessizce İKİ AYRI hayalet konu olurdu ve 300. makalede bunu
 * toparlamak imkânsızlaşırdı. Burada `tsc` bilinmeyen konuyu REDDEDER; yeni
 * konu eklemek bilinçli, tek satırlık bir iştir.
 *
 * ⚠ İKİ KURAL:
 *  1. Bir konu EN AZ İKİ makalede geçmeli. Tek makalede geçen konu ilgililik
 *     hesabına hiçbir şey katmaz, yalnızca listeyi şişirir. Yeni bir konuyu
 *     ekleyeceksen ya ikinci bir makaleye de ver ya da hiç ekleme.
 *  2. Konular URL ÜRETMEZ. Etiket sayfalarında bunun bedelini ölçtük: on etiket
 *     sayfasının her biri 1034 kelimeyle birbirinin kopyasıydı ve haritanın
 *     %17'sini yiyordu. Bir konu ancak yeterince makale toplayınca kendi
 *     sayfasını hak eder (hashtag tarafındaki `HASHTAG_MIN_GONDERI` deseni).
 */
export type ArticleTopic =
  // — Tarih —
  | 'Antik Çağ' | 'Roma' | 'Yunan' | 'Akdeniz' | 'İmparatorluklar' | 'Liderlik'
  | 'Savaş' | 'Kuşatma' | 'Türk Tarihi' | 'Osmanlı' | 'İstanbul'
  // — Fizik / Astronomi —
  | 'Görelilik' | 'Kuantum' | 'Parçacıklar' | 'Atom' | 'Dalgalar' | 'Işık'
  | 'Kütleçekim' | 'Hareket' | 'Enerji' | 'Zaman' | 'Evren'
  // — Yaşam bilimleri —
  | 'Evrim' | 'Canlılar' | 'Mikroorganizmalar' | 'Beyin' | 'Sinir Sistemi'
  | 'Beden' | 'Tıp Tarihi'
  // — Kesişen —
  | 'Bilim Tarihi' | 'Felsefe' | 'Başlangıç Rehberi' | 'Bilgisayar'
  | 'Tasarım' | 'Sanat Tarihi';

export type ArticleMeta = {
  slug: string;
  title: string;
  emoji: string;
  desc: string;
  /** Rafı — TEK. Bkz. ArticleCategory. */
  category: ArticleCategory;
  /** Konuları — ÇOKLU. ZORUNLU: yeni makale konusuz derlenmez. */
  topics: ArticleTopic[];
};

// Tüm /articles makalelerinin TEK kaynağı (registry). discover, ilgili-konular,
// rastgele keşfet ve okuma listesi buradan beslenir. Sıra discover ile aynı tutuldu
// (görünüm değişmesin); ilgili-konular kategoriye göre filtreler, sıradan bağımsız.
export const ARTICLES: ArticleMeta[] = [
  { slug: 'black-hole', title: 'Kara Delikler', emoji: '🕳️', desc: 'Evrenin en gizemli yapıları', category: 'Astronomi', topics: ['Görelilik', 'Kütleçekim', 'Evren'] },
  { slug: 'turkler', title: 'Türklerin Tarihi', emoji: '🏹', desc: "Orta Asya'dan Anadolu'ya", category: 'Tarih', topics: ['Türk Tarihi', 'İmparatorluklar', 'Savaş'] },
  { slug: 'rome', title: 'Roma İmparatorluğu', emoji: '🏛️', desc: 'Bin yıllık medeniyet', category: 'Tarih', topics: ['Antik Çağ', 'Roma', 'İmparatorluklar', 'Akdeniz'] },
  { slug: 'greece', title: 'Antik Yunan', emoji: '⚡', desc: 'Demokrasinin beşiği', category: 'Tarih', topics: ['Antik Çağ', 'Yunan', 'Felsefe', 'Akdeniz'] },
  { slug: 'carthage', title: 'Kartaca', emoji: '⚓', desc: "Akdeniz'in efendileri", category: 'Tarih', topics: ['Antik Çağ', 'Roma', 'Savaş', 'Akdeniz', 'Kuşatma'] },
  { slug: 'ekonomi', title: 'Ekonominin Dili', emoji: '📈', desc: 'Faiz, parite, borsa — interaktif sözlük', category: 'Ekonomi', topics: ['Başlangıç Rehberi'] },
  { slug: 'einstein-rosen', title: 'Einstein–Rosen Köprüsü', emoji: '🌀', desc: 'İnteraktif solucan deliği rehberi', category: 'Astronomi', topics: ['Görelilik', 'Kütleçekim', 'Evren', 'Zaman'] },
  { slug: 'arcade', title: 'Arcade', emoji: '🕹️', desc: 'Oyun salonu tarihi + oynanabilir klasikler', category: 'Teknoloji', topics: ['Bilgisayar', 'Tasarım'] },
  // 15 → 25 (2026-07-16): makalede 25 olgu var; 25 <article>, 25 "Kaynak ·" atfı ve
  // gövdedeki "yirmi beş olgu" ile doğrulandı. Bkz. app/articles/tibbi/page.tsx.
  { slug: 'tibbi', title: '25 Tuhaf Tıbbi Olgu', emoji: '🧬', desc: 'Doğrulanmış akıl almaz tıp gerçekleri', category: 'Tıp', topics: ['Beden', 'Tıp Tarihi', 'Bilim Tarihi'] },
  { slug: 'internet', title: 'İnternet Nasıl Çalışır?', emoji: '🌐', desc: 'OSI, TCP/IP, DNS, paketler — diyagramlarla', category: 'Teknoloji', topics: ['Bilgisayar', 'Başlangıç Rehberi'] },
  { slug: 'pirus', title: 'Kral Pirus', emoji: '🐘', desc: 'Filler, Pirus zaferi ve destansı savaşlar', category: 'Tarih', topics: ['Antik Çağ', 'Yunan', 'Roma', 'Savaş', 'Liderlik'] },
  { slug: 'takyon', title: 'Takyonlar', emoji: '⚡', desc: 'Işıktan hızlı parçacıklar — benzetmelerle', category: 'Fizik', topics: ['Görelilik', 'Parçacıklar', 'Zaman'] },
  { slug: 'tardigrad', title: 'Tardigradlar (Su Ayıları)', emoji: '🐻', desc: 'Yok edilemez minik canavar + mini 2B oyun', category: 'Biyoloji', topics: ['Canlılar', 'Evrim'] },
  { slug: 'bagirsak', title: 'Bağırsaklar — İkinci Beyin', emoji: '🧠', desc: 'Kararlarımızı ve ruh halimizi yöneten ikinci beyin', category: 'Tıp', topics: ['Beden', 'Beyin', 'Sinir Sistemi', 'Mikroorganizmalar'] },
  { slug: 'bakteriyofaj', title: 'Bakteriyofajlar', emoji: '🦠', desc: 'Bakteri yiyen virüsler: faj terapisi, CRISPR ve antibiyotik krizine umut', category: 'Tıp', topics: ['Mikroorganizmalar', 'Evrim', 'Tıp Tarihi', 'Beden'] },
  { slug: 'endosimbiyoz', title: 'Endosimbiyoz', emoji: '🧬', desc: 'İki hücrenin birleşip karmaşık yaşamı yarattığı an: mitokondri, Margulis, nitroplast', category: 'Biyoloji', topics: ['Evrim', 'Mikroorganizmalar', 'Bilim Tarihi'] },
  { slug: 'kaligrafi', title: 'Kaligrafi', emoji: '✒️', desc: 'Güzel yazının sanatı: hat, Doğu Asya ve Batı gelenekleri, araçlar ve başlangıç rehberi', category: 'Sanat', topics: ['Sanat Tarihi', 'Tasarım'] },
  { slug: 'doppler', title: 'Doppler Etkisi', emoji: '📡', desc: 'Hareketin sesi ve ışığı nasıl değiştirdiği: kırmızıya kayma, radar, evrenin genişlemesi — interaktif', category: 'Fizik', topics: ['Dalgalar', 'Işık', 'Evren'] },
  { slug: 'dogal-secilim', title: 'Doğal Seçilim', emoji: '🐦', desc: "Darwin'in büyük fikri: çeşitlilik, kalıtım ve uyum — kamuflaj simülasyonu ve gerçek örneklerle interaktif", category: 'Biyoloji', topics: ['Evrim', 'Canlılar', 'Bilim Tarihi'] },
  { slug: 'dunya', title: 'Dünya', emoji: '🌍', desc: "Gezegenimizin doğum hikâyesi: güneş bulutsusundan demir çekirdeğe, dev çarpışmadan Ay'a — interaktif iç yapı modeliyle", category: 'Astronomi', topics: ['Evren', 'Kütleçekim'] },
  { slug: 'newton', title: 'Isaac Newton', emoji: '🍎', desc: "Hareket yasaları, kütleçekim, kalkülüs ve optik — F=ma oyun alanı, ters-kare simülasyonu ve dolandırılma hikâyesiyle interaktif", category: 'Fizik', topics: ['Kütleçekim', 'Hareket', 'Bilim Tarihi'] },
  { slug: 'bilgisayar', title: 'Bilgisayar Nasıl Çalışır?', emoji: '💻', desc: "CPU, GPU, RAM, SSD, anakart, LCD, mikrofon ve hoparlör — bol benzetme ve interaktif araçlarla (ikili sayı, komut döngüsü, RGB piksel) tüm parçaların rehberi", category: 'Teknoloji', topics: ['Bilgisayar', 'Başlangıç Rehberi'] },
  { slug: 'cift-yarik', title: 'Çift Yarık Deneyi', emoji: '⚛️', desc: "Kuantumun tek gerçek gizemi: dalga-parçacık ikiliği, tek elektronların girişimi, gözlemin etkisi — interaktif çift yarık simülatörü, dalga havuzu ve de Broglie hesaplayıcısıyla, arka planda hareket eden elektronlarla", category: 'Fizik', topics: ['Kuantum', 'Dalgalar', 'Işık', 'Parçacıklar', 'Atom'] },
  { slug: 'kuantum-olumsuzlugu', title: 'Kuantum Ölümsüzlüğü', emoji: '♾️', desc: "Kendi ölümünü neden hiç deneyimlemeyebilirsin? Süperpozisyon, Çok Dünyalı Yorum ve kuantum intiharı — ve fikrin Adam Fawer'ın Mobius romanına kaçmış hâli; interaktif dallanma simülatörü ve dönen Möbius şeridiyle", category: 'Fizik', topics: ['Kuantum', 'Felsefe', 'Zaman'] },
  { slug: 'mol', title: 'Kimyada Mol Kavramı', emoji: '⚗️', desc: "Kimyanın en temel kavramı gündelik örneklerle: 1 mol = 6,022 × 10²³ tane. Molar kütle, dönüşüm haritası, molarite ve stokiyometri — interaktif mol hesaplayıcı, Avogadro ölçeği ve periyodik tablodan molar kütle aracıyla", category: 'Kimya', topics: ['Atom', 'Başlangıç Rehberi'] },
  { slug: 'fizik-101', title: 'Sıfırdan Fizik', emoji: '🚀', desc: "Fizik hiç bilmeyenler için sıfırdan: kütle, kuvvet, Newton (F=ma), ivme, hız, momentum, enerji, sürtünme — gündelik örnekler ve bolca interaktif deneyle (kuvvet laboratuvarı, çarpışma simülatörü, enerji rampası). Açık temalı", category: 'Fizik', topics: ['Hareket', 'Kütleçekim', 'Enerji', 'Başlangıç Rehberi'] },
  { slug: 'sanat-akimlari', title: 'Sanat Akımları', emoji: '🎨', desc: "Rönesans'tan yapay zekâya 60'tan fazla akım: hangi akım, nerede, kim, neden? Beş 'motor' çerçevesi + aranıp filtrelenebilen interaktif akım kâşifi. Batı-dışı gelenekler ve Türkiye dahil", category: 'Sanat', topics: ['Sanat Tarihi', 'Tasarım'] },
  { slug: 'radyoaktivite', title: 'Radyoaktivite', emoji: '☢️', desc: "Kararsız bir çekirdeğin kendiliğinden bozunması: yarılanma süresi, alfa-beta-gama, bozunma zinciri, doz ve radon. Becquerel'in kazasından Curie'nin defterlerine, Oklo'nun doğal reaktöründen kemiklerinizdeki potasyum-40'a — yıldız yarılanma simülatörü, sürüklenebilir nüfuz kutusu, sesli Geiger sayacı ve 'sen ne kadar radyoaktifsin?' hesaplayıcısıyla interaktif", category: 'Fizik', topics: ['Atom', 'Parçacıklar', 'Enerji', 'Bilim Tarihi'] },
  { slug: 'ayna-noronlari', title: 'Ayna Nöronları', emoji: '🪞', desc: "Sen bir şeyi yaptığında da başkasının yaptığını izlediğinde de ateşlenen nöronlar: Parma'daki kazara keşiften empati/otizm hype'ına, Hickok ve Heyes'in ciddi geri tepkisine — sinirsel aynalamanın çekişmeli hikâyesi. three.js 3B ayna-nöron ağı + 'nöronu ateşle', eylem-vs-gözlem ve bulaşma demolarıyla interaktif", category: 'Biyoloji', topics: ['Beyin', 'Sinir Sistemi', 'Bilim Tarihi'] },
  { slug: 'sezar', title: 'Julius Caesar', emoji: '🗡️', desc: "Kendisini öldürenleri affeden adam: korsanlara fidyesini az bulan çocuktan Galya'daki bir milyon ölüye, Rubicon'dan Alesia'nın çift suruna, herkesi affeden diktatörden 23 bıçağa. Merhametin neden bir silah — ve neden bir ölüm fermanı — olduğunun hikâyesi. Rubicon karar noktası (sen ne yapardın?), Alesia çift sur sahnesi, 23 yara diyagramı ve Caesar → Kaiser → Çar isim ağacıyla interaktif", category: 'Tarih', topics: ['Antik Çağ', 'Roma', 'İmparatorluklar', 'Liderlik', 'Savaş'] },
  { slug: 'augustus', title: 'Augustus', emoji: '🏛️', desc: "Tacı reddederek kral olan adam. Caesar tacı istediği için öldürüldü; Augustus istemiyormuş gibi yaparak her şeyi aldı ve yatağında öldü. Ankara'daki duvardaki zarif yalandan (Res Gestae) Cicero'nun kelime oyununa, sahte teslimden gücün gizli anatomisine, sönen vârislerden Teutoburg'un üç boş lejyon numarasına. Res Gestae 'dediği/olan', TOLLENDUM cinası, sahte seçim (Rubicon'un tersi), gücün anatomisi diyagramı ve 'alkışla' tuzağıyla interaktif — Caesar serisinin 2. parçası", category: 'Tarih', topics: ['Antik Çağ', 'Roma', 'İmparatorluklar', 'Liderlik'] },
  { slug: 'kanuni', title: 'Kanuni Sultan Süleyman', emoji: '⚖️', desc: "Kanunu yazan adamın kendi kanununa yenilmesi. Batı ona Muhteşem dedi, Doğu Kanunî — ikisi de aynı adamı anlatıyor: biri süsünü, öteki mekanizmasını. Venedik'te sipariş edilen dört taçlı miğferden 42 gün boyunca ölü bir adamın adına basılan tuğraya. 128 gün yürüyüp 2 saatte biten Mohaç, 140 gün yürüyüp 19 gün süren Viyana. Makbul'den Maktul'e giden bir gece, otağdaki üç kilitli kapı ve Fatih Kanunnâmesi'nden gelen madde. Dört taçlı 3B miğfer hero, Mohaç savaş simülasyonu, 'sen kadısın' dava modülü, sefer takvimi, mühür tuzağı ve Kaynak Karşılaştırıcı ile interaktif — Caesar serisinin 4. parçası", category: 'Tarih', topics: ['Türk Tarihi', 'Osmanlı', 'İmparatorluklar', 'Liderlik', 'Savaş', 'İstanbul'] },
  { slug: 'fatih', title: 'Fatih Sultan Mehmed', emoji: '🏰', desc: "Bir fikrin ele geçirdiği bir vaka olarak — kahraman ya da canavar değil, takıntılı. 12 yaşında tahta çıkarılıp indirilen, 21'inde Konstantinopolis'i alan, 49'unda Roma'ya yürürken çayırda ölen adam. Truva'daki mezardan Boğazkesen'e, Urban'ın topundan gemilerin bir gecede karadan yürütülmesine, Kerkoporta'dan Kayser-i Rûm unvanına ve Hünkâr Çayırı'ndaki zehir şüphesine. Kural: sıfat değil, sayı. Bölünmüş saray terazisi, oynanabilir kuşatma simülasyonu (surları sen de düşüremezsin), 'sen XI. Konstantin'sin' karar noktası, dört kronikçiyi yan yana koyan Kaynak Karşılaştırıcı ve zehir jürisiyle interaktif", category: 'Tarih', topics: ['Türk Tarihi', 'Osmanlı', 'İmparatorluklar', 'Liderlik', 'Savaş', 'İstanbul', 'Kuşatma'] },
];

export const ARTICLE_MAP: Record<string, ArticleMeta> = Object.fromEntries(ARTICLES.map(a => [a.slug, a]));

export function isArticleSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(ARTICLE_MAP, slug);
}

/** Ortak konu başına 2, aynı raf için 1. Konu, kategoriden AĞIR basar. */
export const ORTAK_KONU_PUANI = 2;
export const AYNI_KATEGORI_PUANI = 1;

export function relatednessScore(a: ArticleMeta, b: ArticleMeta): number {
  const ortak = a.topics.filter(t => b.topics.includes(t)).length;
  return ortak * ORTAK_KONU_PUANI + (a.category === b.category ? AYNI_KATEGORI_PUANI : 0);
}

/**
 * İlgili konular — ORTAK KONU SAYISINA GÖRE PUANLANIR (2026-08-01).
 *
 * ÖNCEDEN: "aynı kategoriden başla, kayıt sırasına göre ilk n'i al". Bu, 33
 * makalede bile ÖLÇÜLEBİLİR ŞEKİLDE BOZUKTU — fatih, kanuni, sezar ve augustus
 * DÖRDÜ DE aynı listeyi (turkler, rome, greece, carthage) alıyordu ve birbirini
 * hiç göstermiyordu. Oysa bu dördü bilerek kurulmuş bir seri. Sebep: kategori
 * eşitliği 9 makalelik "Tarih" rafının içinde hiçbir ayrım yapmıyordu.
 *
 * Yeni davranış makale sayısıyla İYİLEŞİR (daha çok makale = daha çok ortak
 * konu sinyali), eskisi ise kötüleşiyordu.
 *
 * Deterministik: skor eşitliğinde kayıt sırası bozulmaz (kararlı sıralama) —
 * SSR ile istemci aynı listeyi üretsin diye random YOK. "Rastgele keşfet" ayrı
 * bir rota (/rastgele).
 */
export function relatedArticles(slug: string, n = 4): ArticleMeta[] {
  const self = ARTICLE_MAP[slug];
  const rest = ARTICLES.filter(a => a.slug !== slug);
  if (!self) return rest.slice(0, n);
  return rest
    .map((a, i) => ({ a, i, puan: relatednessScore(self, a) }))
    // PUANI SIFIR OLANI GÖSTERME. Eskiden kutu ne olursa olsun 4 kartla
    // doluyordu; kaligrafi'nin altında "Kara Delikler" çıkıyordu. Başlık
    // "İlgili Konular" — hiçbir ortak yanı olmayanı koymak okura yalan söylemek.
    // Kutu 4'ten az kartla da düzgün görünür, hiç ilgili yoksa bileşen kendini
    // gizler (RelatedArticles: `if (!related.length) return null`).
    .filter(x => x.puan > 0)
    // Array.prototype.sort kararlıdır ama `i`yi AÇIKÇA yazıyoruz: sıralamanın
    // kayıt sırasına düştüğü belli olsun, motorun garantisine bel bağlamayalım.
    .sort((x, y) => y.puan - x.puan || x.i - y.i)
    .slice(0, n)
    .map(x => x.a);
}
