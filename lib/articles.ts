export type ArticleCategory = 'Fizik' | 'Kimya' | 'Tarih' | 'Biyoloji' | 'Teknoloji' | 'Kültür';

export type ArticleMeta = {
  slug: string;
  title: string;
  emoji: string;
  desc: string;
  category: ArticleCategory;
};

// Tüm /articles makalelerinin TEK kaynağı (registry). discover, ilgili-konular,
// rastgele keşfet ve okuma listesi buradan beslenir. Sıra discover ile aynı tutuldu
// (görünüm değişmesin); ilgili-konular kategoriye göre filtreler, sıradan bağımsız.
export const ARTICLES: ArticleMeta[] = [
  { slug: 'black-hole', title: 'Kara Delikler', emoji: '🕳️', desc: 'Evrenin en gizemli yapıları', category: 'Fizik' },
  { slug: 'turkler', title: 'Türklerin Tarihi', emoji: '🏹', desc: "Orta Asya'dan Anadolu'ya", category: 'Tarih' },
  { slug: 'rome', title: 'Roma İmparatorluğu', emoji: '🏛️', desc: 'Bin yıllık medeniyet', category: 'Tarih' },
  { slug: 'greece', title: 'Antik Yunan', emoji: '⚡', desc: 'Demokrasinin beşiği', category: 'Tarih' },
  { slug: 'carthage', title: 'Kartaca', emoji: '⚓', desc: "Akdeniz'in efendileri", category: 'Tarih' },
  { slug: 'ekonomi', title: 'Ekonominin Dili', emoji: '📈', desc: 'Faiz, parite, borsa — interaktif sözlük', category: 'Kültür' },
  { slug: 'einstein-rosen', title: 'Einstein–Rosen Köprüsü', emoji: '🌀', desc: 'İnteraktif solucan deliği rehberi', category: 'Fizik' },
  { slug: 'arcade', title: 'Arcade', emoji: '🕹️', desc: 'Oyun salonu tarihi + oynanabilir klasikler', category: 'Teknoloji' },
  { slug: 'tibbi', title: '15 Tuhaf Tıbbi Olgu', emoji: '🧬', desc: 'Doğrulanmış akıl almaz tıp gerçekleri', category: 'Biyoloji' },
  { slug: 'internet', title: 'İnternet Nasıl Çalışır?', emoji: '🌐', desc: 'OSI, TCP/IP, DNS, paketler — diyagramlarla', category: 'Teknoloji' },
  { slug: 'pirus', title: 'Kral Pirus', emoji: '🐘', desc: 'Filler, Pirus zaferi ve destansı savaşlar', category: 'Tarih' },
  { slug: 'takyon', title: 'Takyonlar', emoji: '⚡', desc: 'Işıktan hızlı parçacıklar — benzetmelerle', category: 'Fizik' },
  { slug: 'tardigrad', title: 'Tardigradlar (Su Ayıları)', emoji: '🐻', desc: 'Yok edilemez minik canavar + mini 2B oyun', category: 'Biyoloji' },
  { slug: 'bagirsak', title: 'Bağırsaklar — İkinci Beyin', emoji: '🧠', desc: 'Kararlarımızı ve ruh halimizi yöneten ikinci beyin', category: 'Biyoloji' },
  { slug: 'bakteriyofaj', title: 'Bakteriyofajlar', emoji: '🦠', desc: 'Bakteri yiyen virüsler: faj terapisi, CRISPR ve antibiyotik krizine umut', category: 'Biyoloji' },
  { slug: 'endosimbiyoz', title: 'Endosimbiyoz', emoji: '🧬', desc: 'İki hücrenin birleşip karmaşık yaşamı yarattığı an: mitokondri, Margulis, nitroplast', category: 'Biyoloji' },
  { slug: 'kaligrafi', title: 'Kaligrafi', emoji: '✒️', desc: 'Güzel yazının sanatı: hat, Doğu Asya ve Batı gelenekleri, araçlar ve başlangıç rehberi', category: 'Kültür' },
  { slug: 'doppler', title: 'Doppler Etkisi', emoji: '📡', desc: 'Hareketin sesi ve ışığı nasıl değiştirdiği: kırmızıya kayma, radar, evrenin genişlemesi — interaktif', category: 'Fizik' },
  { slug: 'dogal-secilim', title: 'Doğal Seçilim', emoji: '🐦', desc: "Darwin'in büyük fikri: çeşitlilik, kalıtım ve uyum — kamuflaj simülasyonu ve gerçek örneklerle interaktif", category: 'Biyoloji' },
  { slug: 'dunya', title: 'Dünya', emoji: '🌍', desc: "Gezegenimizin doğum hikâyesi: güneş bulutsusundan demir çekirdeğe, dev çarpışmadan Ay'a — interaktif iç yapı modeliyle", category: 'Fizik' },
  { slug: 'newton', title: 'Isaac Newton', emoji: '🍎', desc: "Hareket yasaları, kütleçekim, kalkülüs ve optik — F=ma oyun alanı, ters-kare simülasyonu ve dolandırılma hikâyesiyle interaktif", category: 'Fizik' },
  { slug: 'bilgisayar', title: 'Bilgisayar Nasıl Çalışır?', emoji: '💻', desc: "CPU, GPU, RAM, SSD, anakart, LCD, mikrofon ve hoparlör — bol benzetme ve interaktif araçlarla (ikili sayı, komut döngüsü, RGB piksel) tüm parçaların rehberi", category: 'Teknoloji' },
  { slug: 'cift-yarik', title: 'Çift Yarık Deneyi', emoji: '⚛️', desc: "Kuantumun tek gerçek gizemi: dalga-parçacık ikiliği, tek elektronların girişimi, gözlemin etkisi — interaktif çift yarık simülatörü, dalga havuzu ve de Broglie hesaplayıcısıyla, arka planda hareket eden elektronlarla", category: 'Fizik' },
  { slug: 'kuantum-olumsuzlugu', title: 'Kuantum Ölümsüzlüğü', emoji: '♾️', desc: "Kendi ölümünü neden hiç deneyimlemeyebilirsin? Süperpozisyon, Çok Dünyalı Yorum ve kuantum intiharı — ve fikrin Adam Fawer'ın Mobius romanına kaçmış hâli; interaktif dallanma simülatörü ve dönen Möbius şeridiyle", category: 'Fizik' },
  { slug: 'mol', title: 'Kimyada Mol Kavramı', emoji: '⚗️', desc: "Kimyanın en temel kavramı gündelik örneklerle: 1 mol = 6,022 × 10²³ tane. Molar kütle, dönüşüm haritası, molarite ve stokiyometri — interaktif mol hesaplayıcı, Avogadro ölçeği ve periyodik tablodan molar kütle aracıyla", category: 'Kimya' },
  { slug: 'fizik-101', title: 'Sıfırdan Fizik', emoji: '🚀', desc: "Fizik hiç bilmeyenler için sıfırdan: kütle, kuvvet, Newton (F=ma), ivme, hız, momentum, enerji, sürtünme — gündelik örnekler ve bolca interaktif deneyle (kuvvet laboratuvarı, çarpışma simülatörü, enerji rampası). Açık temalı", category: 'Fizik' },
];

export const ARTICLE_MAP: Record<string, ArticleMeta> = Object.fromEntries(ARTICLES.map(a => [a.slug, a]));

export function isArticleSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(ARTICLE_MAP, slug);
}

// İlgili konular: aynı kategoriden başla, sonra diğerleriyle doldur (deterministik;
// SSR/hydration tutarlı kalsın diye random YOK — "rastgele keşfet" ayrı /rastgele rotası).
export function relatedArticles(slug: string, n = 4): ArticleMeta[] {
  const rest = ARTICLES.filter(a => a.slug !== slug);
  const self = ARTICLE_MAP[slug];
  if (!self) return rest.slice(0, n);
  const sameCat = rest.filter(a => a.category === self.category);
  const others = rest.filter(a => a.category !== self.category);
  return [...sameCat, ...others].slice(0, n);
}
