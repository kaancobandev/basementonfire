'use client';

// "Sanat Akımları" makalesine ÖZEL interaktifler + akım veritabanı + veri.
// Genel şablon: @/app/components/article/ArticleBlocks
import { useMemo, useState } from 'react';

export { refs } from './refs';

const ROSE = '#e11d48';

/* ════════════ ÇAĞ (dönem) tanımları ════════════ */
export const ERAS: { k: string; label: string; col: string }[] = [
  { k: 'ron', label: 'Rönesans', col: '#d97706' },
  { k: 'bar', label: 'Barok–Rokoko', col: '#b45309' },
  { k: 'dev', label: 'Devrim Çağı', col: '#dc2626' },
  { k: 'mod', label: 'Modernizm', col: '#e11d48' },
  { k: 'ava', label: 'Avangard', col: '#c026d3' },
  { k: 'son', label: 'Savaş Sonrası', col: '#7c3aed' },
  { k: 'cag', label: 'Çağdaş', col: '#2563eb' },
  { k: 'bat', label: 'Batı-dışı', col: '#0891b2' },
  { k: 'tur', label: 'Türkiye', col: '#059669' },
];
const eraOf = (k: string) => ERAS.find((e) => e.k === k) || ERAS[0];

/* ════════════ AKIM VERİTABANI (~60) ════════════ */
type M = { n: string; y: number; era: string; r: string; who: string; why: string };
export const MOVEMENTS: M[] = [
  { n: 'Bizans', y: 500, era: 'ron', r: 'Diğer', who: 'İkona ustaları (Ravenna, Konstantinopolis)', why: 'İkona teolojisi: figür bir temsil değil, öteye açılan bir “pencere”dir; perspektif kasıtla reddedilir.' },
  { n: 'Gotik', y: 1140, era: 'ron', r: 'Fransa', who: 'Başrahip Suger (Saint-Denis)', why: 'Işık teolojisi + sivri kemer/uçan payanda teknolojisi: duvar incelir, yerine vitray girer.' },
  { n: 'Erken Rönesans', y: 1400, era: 'ron', r: 'İtalya', who: 'Brunelleschi, Donatello, Masaccio, Alberti, Botticelli', why: 'Medici bankacılık serveti + hümanizm + lineer perspektif. Resim artık matematiksel bir uzam; sanatçı zanaatkârdan entelektüele terfi eder.' },
  { n: 'Yüksek Rönesans', y: 1490, era: 'ron', r: 'İtalya', who: 'Leonardo, Michelangelo, Raffaello, Bramante', why: 'Papalık (II. Julius) Roma’yı iktidar propagandası olarak yeniden inşa eder. 1527 Roma Yağması güveni kırar, dönemi bitirir.' },
  { n: 'Venedik Okulu', y: 1450, era: 'ron', r: 'İtalya', who: 'Bellini, Giorgione, Tiziano, Tintoretto, Veronese', why: 'Deniz ticareti + nemli iklim (fresk çalışmaz → tuval+yağlıboya). Colorito (renk), Floransa’nın disegno’suna (çizgi) karşı; fırça darbesi görünür kalır.' },
  { n: 'Kuzey Rönesans', y: 1420, era: 'ron', r: 'Hollanda', who: 'Van Eyck, Dürer, Holbein, Bosch, Bruegel', why: 'Yağlıboyanın olgunlaşması (şeffaf katman, mikro detay) + Gutenberg matbaası/gravür. İtalya idealize eder, Kuzey kaydeder.' },
  { n: 'Maniyerizm', y: 1520, era: 'ron', r: 'İtalya', who: 'Pontormo, Parmigianino, Bronzino, El Greco', why: 'Yüksek Rönesans “mükemmelliği” tamamlamıştı; sonraki kuşağa taklitten başka yol kalmadı. Uzun figür, sıkışık mekân, asitli renk, kasıtlı huzursuzluk.' },
  { n: 'Roma Baroğu (Katolik)', y: 1600, era: 'bar', r: 'İtalya', who: 'Caravaggio, Bernini, Borromini, Artemisia Gentileschi', why: 'Karşı-Reform: Trento Konsili sanatın halkı duygusal ikna etmesini ister. Sert ışık-gölge (tenebrizm), teatrallik, diyagonal hareket.' },
  { n: 'İspanyol Baroğu', y: 1600, era: 'bar', r: 'İspanya', who: 'Velázquez, Zurbarán, Ribera, Murillo', why: 'Habsburg sarayı + Katolik mistisizm + imparatorluğun gümüşle şişip çöküşü. Las Meninas: resmin kendi üzerine düşünmesi.' },
  { n: 'Flandre Baroğu', y: 1600, era: 'bar', r: 'Hollanda', who: 'Rubens, Van Dyck, Jordaens', why: 'İspanyol yönetimindeki Katolik Güney; kilise + saray ihracatı. Rubens aynı zamanda diplomat; atölye bir üretim hattı.' },
  { n: 'Hollanda Altın Çağı', y: 1600, era: 'bar', r: 'Hollanda', who: 'Rembrandt, Vermeer, Hals, Ruisdael, Leyster', why: 'Sanat tarihinin en net “ekonomi belirler” vakası: Protestan ikonoklazm en büyük müşteriyi (kilise) siler → açık sanat piyasası + tür uzmanlaşması (manzara, natürmort, iç mekân).' },
  { n: 'Fransız Klasisizmi', y: 1648, era: 'bar', r: 'Fransa', who: 'Poussin, Claude Lorrain, Le Brun', why: 'Mutlak monarşi düzen ister. Académie royale (1648): tür hiyerarşisi (tarih resmi en üstte), çizim renkten üstün. 250 yıl hem standart hem isyan hedefi.' },
  { n: 'Rokoko', y: 1720, era: 'bar', r: 'Fransa', who: 'Watteau, Boucher, Fragonard, Tiepolo, Vigée Le Brun', why: 'XIV. Louis ölünce (1715) aristokrasi Versailles’tan Paris konaklarına döner. Salon kültürü, kadın hamiliği (Pompadour), mahrem ölçek. Devrimde “ahlaksız aristokrasi” damgası.' },
  { n: 'Neoklasizm', y: 1750, era: 'dev', r: 'Fransa', who: 'David, Ingres, Canova, Kauffman; kuram Winckelmann', why: 'Pompeii/Herculaneum kazıları + Winckelmann (“asil sadelik”) + Aydınlanma erdemi. David’in Horatiuslar’ı Devrim’in görsel programını beş yıl önceden yazar; sonra Napolyon propagandası.' },
  { n: 'Romantizm', y: 1780, era: 'dev', r: 'Almanya', who: 'Friedrich, Turner, Constable, Delacroix, Goya', why: 'Aklın evrenselliğine ve neoklasik ölçüye tepki: birey, tutku, doğa, yüce, millet. Goya modern savaş resmini icat eder — kahraman yok, kurban var.' },
  { n: 'Realizm', y: 1840, era: 'dev', r: 'Fransa', who: 'Courbet, Millet, Daumier', why: '1848 Devrimi + fotoğraf (1839): benzerlik üretmek artık makinenin işi. Courbet köylüyü tarih resmi ölçeğinde çizer (hiyerarşi ihlali) ve kendi “Realizm Pavyonu”nu kurar.' },
  { n: 'Barbizon Okulu', y: 1830, era: 'dev', r: 'Fransa', who: 'Rousseau, Corot, Millet', why: 'Tren + taşınabilir malzeme → açık havada (plein air) resmin ilk sistematik pratiği; izlenimciliğin doğrudan hazırlayıcısı.' },
  { n: 'Pre-Rafaelitler', y: 1848, era: 'dev', r: 'İngiltere', who: 'Rossetti, Millais, Hunt; Ruskin, Morris', why: 'Akademinin Raffaello sonrası kalıplarına isyan + sanayi kentine karşı Ortaçağ nostaljisi. Morris ve Arts & Crafts üzerinden Art Nouveau’ya ve modern tasarıma bağlanır.' },
  { n: 'Gezginler (Peredvizhniki)', y: 1870, era: 'dev', r: 'Rusya', who: 'Repin, Kramskoy, Surikov, Levitan', why: 'Akademiden toplu istifa (1863) + halkçılık (narodnik) + serfliğin kaldırılması. Sergileri taşraya “gezdirdiler”. Sovyet Sosyalist Gerçekçiliğinin resmî atası.' },
  { n: 'Hudson River Okulu', y: 1825, era: 'dev', r: 'ABD', who: 'Thomas Cole, Frederic Church', why: 'Genç cumhuriyetin manzara üzerinden kimlik kurması (“Manifest Destiny”). Sonra Homer ve Eakins ile gözleme dayalı sert realizm.' },
  { n: 'İzlenimcilik', y: 1874, era: 'mod', r: 'Fransa', who: 'Monet, Renoir, Degas, Pissarro, Morisot, Cassatt; öncü Manet', why: 'Dört sebep üst üste: kurumsal ret (1863 Reddedilenler) + tüpte hazır boya + Haussmann’ın modern şehri + fotoğraf/Japonizm. Renk artık ışığın fonksiyonu; konu görme eyleminin kendisi.' },
  { n: 'Post-İzlenimcilik', y: 1885, era: 'mod', r: 'Fransa', who: 'Cézanne, Van Gogh, Gauguin, Seurat', why: 'İzlenimciliği “çok yüzeysel” bulan dört yol: yapı (Cézanne → Kübizm), duygu (Van Gogh → Ekspresyonizm), sembol (Gauguin → Fovizm), bilim (Seurat, puantilizm).' },
  { n: 'Sembolizm', y: 1886, era: 'mod', r: 'Fransa', who: 'Moreau, Redon, Puvis, Khnopff, Munch', why: 'Pozitivizme/materyalizme tepki; fin de siècle çöküş duygusu. Rüya, mit, ölüm, cinsellik — Freud’la aynı yıllarda aynı bilinçdışını farklı yoldan bulur. Sürrealizmin atası.' },
  { n: 'Nabiler (Les Nabis)', y: 1888, era: 'mod', r: 'Fransa', who: 'Sérusier, Bonnard, Vuillard, Denis', why: 'Maurice Denis’nin 1890 tanımı ilk formalist manifesto: bir resim, her şeyden önce belli bir düzende bir araya gelmiş renklerle kaplı düz bir yüzeydir.' },
  { n: 'Art Nouveau', y: 1890, era: 'mod', r: 'Diğer', who: 'Horta, Guimard, Mucha, Klimt (Sezession), Gaudí, Mackintosh', why: 'Ucuz seri nesneye tepki + total sanat (Gesamtkunstwerk) + yeni malzeme (dökme demir, cam). Organik çizgi. Yan ürünü: afiş ve grafik tasarım özerkleşir. Ülke ülke: Jugendstil, Sezession, Modernisme…' },
  { n: 'Fovizm', y: 1905, era: 'ava', r: 'Fransa', who: 'Matisse, Derain, Vlaminck', why: 'Van Gogh/Gauguin’in renk özgürlüğü + Cézanne’ın yapısı. Eleştirmen “vahşi hayvanlar” der, ad yapışır. Renk artık nesneyi tarif etmez; kendi başına ifadedir.' },
  { n: 'Die Brücke', y: 1905, era: 'ava', r: 'Almanya', who: 'Kirchner, Heckel, Schmidt-Rottluff, Nolde', why: 'Alman Ekspresyonizmi (Dresden): burjuva ahlakına isyan, Nietzsche, etnografya müzeleri, kent nevrozu. Dürer’in tahta baskı geleneğinin sert dirilişi.' },
  { n: 'Der Blaue Reiter', y: 1911, era: 'ava', r: 'Almanya', who: 'Kandinsky, Marc, Macke, Münter, Klee', why: 'Münih: teosofi ve maneviyat, müzikle analoji (Schönberg). Kandinsky’nin “Sanatta Ruhsallık Üzerine” (1911) ve ilk tam soyut resimleri.' },
  { n: 'Kübizm', y: 1907, era: 'ava', r: 'Fransa', who: 'Picasso, Braque, Gris, Léger; kuram Apollinaire', why: 'Cézanne + Afrika maskeleri (sömürge yağmasının sonucu) + eşzamanlılık iklimi. Kolaj/papier collé (1912) ile gerçek nesne resmin içine girer — Dada, Pop ve çağdaş sanata giden ana yol.' },
  { n: 'Fütürizm', y: 1909, era: 'ava', r: 'İtalya', who: 'Marinetti, Boccioni, Balla, Severini', why: 'Manifesto Le Figaro’nun 1. sayfasında (Paris) — medya üzerinden kurulan ilk pazarlama-avangardı. Hız, makine. Karanlık taraf: militarizmi yüceltir, Marinetti faşizmi destekler.' },
  { n: 'Süprematizm', y: 1915, era: 'ava', r: 'Rusya', who: 'Kazimir Maleviç', why: '0,10 sergisi (Petrograd): Siyah Kare, ikonanın asıldığı “kırmızı köşe”ye asıldı — yeni ikona, nesnesiz duyum. Batı resminde temsilin sıfır noktası.' },
  { n: 'Konstrüktivizm', y: 1919, era: 'ava', r: 'Rusya', who: 'Tatlin, Rodçenko, Lissitzky, Popova, Stepanova', why: '1917 Ekim Devrimi: soru artık “nasıl resim” değil, “sanatçı yeni toplumda ne üretir”. Cevap: afiş, tekstil, mimarlık, fotomontaj. 1932’de tasfiye edildi.' },
  { n: 'Dada', y: 1916, era: 'ava', r: 'İsviçre', who: 'Ball, Tzara, Arp; Berlin: Höch, Heartfield; NY: Duchamp, Man Ray', why: 'I. Dünya Savaşı: aklın ve “uygarlığın” 17 milyon ölü üretmesi. Anti-sanat, rastlantı + Duchamp’ın hazır-nesnesi (Çeşme, 1917): “Bu neden sanat, kim karar veriyor?”' },
  { n: 'De Stijl / Neoplastisizm', y: 1917, era: 'ava', r: 'Hollanda', who: 'Mondrian, Van Doesburg, Rietveld', why: 'Tarafsız Hollanda; savaşın kaosuna karşı evrensel uyum. Yatay-dikey + üç ana renk. Van Doesburg diagonal kullanınca Mondrian gruptan ayrıldı.' },
  { n: 'Bauhaus', y: 1919, era: 'ava', r: 'Almanya', who: 'Gropius, Mies; Klee, Kandinsky, Albers, Moholy-Nagy', why: 'Sanat–zanaat–sanayi ayrımını kaldıran sosyal program; modern tasarım eğitiminin şablonu. 1933’te Nazi baskısıyla kapandı, kadro ABD’ye göçtü — Avrupa’nın kaybı, Amerika’nın kazancı.' },
  { n: 'Yeni Nesnellik', y: 1920, era: 'ava', r: 'Almanya', who: 'Dix, Grosz, Beckmann, Schad', why: 'Weimar Cumhuriyeti: enflasyon, sakat gaziler, kabare, şiddet. Ekspresyonizmin duygusal patlamasına karşı soğuk, cerrahi, acımasız bakış.' },
  { n: 'Sürrealizm', y: 1924, era: 'ava', r: 'Fransa', who: 'Breton, Ernst, Miró, Dalí, Magritte, Carrington, Oppenheim', why: 'Dada’nın yıkımından sonra bir program + Freud’un bilinçdışı kuramı. Otomatik yazı, rüya. İki kanat: otomatist (Miró) ve veristik (Dalí). Savaşta NY’e kaçış Soyut Dışavurumculuğu besler.' },
  { n: 'Art Deco', y: 1925, era: 'ava', r: 'Fransa', who: '1925 Paris Sergisi; Chrysler Binası', why: 'Art Nouveau’nun organik çizgisinin makineleşmiş, geometrikleşmiş, lükse dönmüş hali. Mısır (Tutankamon) + Aztek + makine estetiği.' },
  { n: 'Meksika Muralizmi', y: 1920, era: 'ava', r: 'Lat. Amerika', who: 'Rivera, Orozco, Siqueiros', why: 'Meksika Devrimi sonrası: okuma-yazma oranı düşük ülkede kamu duvarı = medya, devlet politikası. Siqueiros’un endüstriyel teknikleri genç Pollock’a geçer.' },
  { n: 'Harlem Rönesansı', y: 1920, era: 'ava', r: 'ABD', who: 'Aaron Douglas, Augusta Savage; sonra Lawrence, Bearden', why: 'Büyük Göç + Locke’un “The New Negro” (1925). Afrika biçim dili + modernist form + kentli siyah deneyimi.' },
  { n: 'Sosyalist Gerçekçilik', y: 1934, era: 'ava', r: 'Rusya', who: 'Devlet doktrini (I. Sovyet Yazarlar Kongresi)', why: 'Tek izinli üslup: iyimser, anlatısal, “halka anlaşılır”. Bağımsız avangard tasfiye edildi.' },
  { n: 'Soyut Dışavurumculuk', y: 1943, era: 'son', r: 'ABD', who: 'Pollock, De Kooning, Rothko, Newman, Krasner, Mitchell', why: 'Sürrealist otomatizm + sürgün Avrupalılar + WPA kuşağı + Soğuk Savaş (MoMA turneleri, CIA bağlantılı fonlar). Amerikan sanatı ilk kez ithal değil, ihraç eder.' },
  { n: 'Art Informel / Taşizm', y: 1945, era: 'son', r: 'Fransa', who: 'Fautrier, Wols, Dubuffet (Art Brut), Hartung', why: 'Avrupa’nın jestçi soyut cevabı; Dubuffet akıl hastalarının ve çocukların sanatına (Art Brut) yönelir.' },
  { n: 'CoBrA', y: 1948, era: 'son', r: 'Hollanda', who: 'Asger Jorn, Karel Appel, Constant', why: 'Kopenhag/Brüksel/Amsterdam: savaş sonrası içgüdüsel, çocuk resmine ve halk sanatına dayalı spontane ifade.' },
  { n: 'Gutai', y: 1954, era: 'son', r: 'Japonya', who: 'Yoshihara, Shiraga, Tanaka', why: 'Yıkılmış ve işgal edilmiş Japonya’da sıfırdan. Buyruk: “daha önce yapılmamış olanı yap.” Beden-malzeme temaslı performatif resim — Batı’daki performanstan önce.' },
  { n: 'Neo-Concreto', y: 1959, era: 'son', r: 'Lat. Amerika', who: 'Lygia Clark, Hélio Oiticica, Lygia Pape', why: 'Rio: rasyonel somut sanatın soğukluğuna karşı beden, katılım, duyu. İzleyici yapıtı eline alır, giyer, içine girer.' },
  { n: 'Neo-Dada', y: 1954, era: 'son', r: 'ABD', who: 'Rauschenberg (Combines), Jasper Johns, John Cage', why: 'Soyut Dışavurumculuğun kahramanca öznelliğine karşı: gündelik nesne, ironi, mesafe.' },
  { n: 'Pop Art', y: 1956, era: 'son', r: 'İngiltere', who: 'Hamilton, Paolozzi (Londra); sonra Warhol, Lichtenstein, Oldenburg (NY)', why: 'İngiltere önce geldi (Independent Group). Kitle tüketimi, reklam, süpermarket, ünlü kültürü. Yüksek/alçak ayrımını çökertir; Warhol elin izini ve imzayı kasten siler.' },
  { n: 'Minimalizm', y: 1960, era: 'son', r: 'ABD', who: 'Judd, Stella, Andre, Flavin, LeWitt, Agnes Martin', why: 'Yanılsamanın ve metaforun reddi: “gördüğün şey gördüğün şeydir.” Endüstriyel malzeme, izleyicinin mekândaki bedeni. Fried’ın “teatrallik” itirazı enstalasyonun doğum belgesi.' },
  { n: 'Nouveau Réalisme', y: 1960, era: 'son', r: 'Fransa', who: 'Restany + Yves Klein, Arman, Tinguely, Christo', why: 'Avrupa’nın Pop’a paralel ama daha maddeci ve ritüel cevabı.' },
  { n: 'Fluxus', y: 1962, era: 'son', r: 'ABD', who: 'Maciunas, Yoko Ono, Nam June Paik, Beuys', why: 'Cage’in rastlantı ve sessizlik dersleri. Yapıt yerine talimat, olay, mizah. Video sanatı (Paik) buradan doğar.' },
  { n: 'Arte Povera', y: 1967, era: 'son', r: 'İtalya', who: 'Celant + Merz, Kounellis, Pistoletto, Boetti', why: 'Torino: tüketim toplumuna ve Amerikan minimalizminin cilalı endüstriyelliğine reddiye. Toprak, gazete, canlı hayvan, neon — “fakir malzeme” bir direnç konumu.' },
  { n: 'Mono-ha', y: 1968, era: 'son', r: 'Japonya', who: 'Lee Ufan, Sekine, Suga', why: 'Taş, çelik levha, cam — yapmadan, sadece yerleştirerek ilişki kurmak. Arte Povera ile doğrudan temas olmadan şaşırtıcı bir eşzamanlılık.' },
  { n: 'Kavramsal Sanat', y: 1965, era: 'cag', r: 'ABD', who: 'LeWitt, Kosuth, Weiner, On Kawara, Art & Language', why: 'Nesne = meta. Nesneyi kaldırırsan piyasa ne satar? Fikir icradan önce gelir. 1968, Vietnam, feminizm iklimi. Lippard: “sanat nesnesinin maddesizleşmesi.”' },
  { n: 'Land Art', y: 1968, era: 'cag', r: 'ABD', who: 'Smithson (Spiral Jetty), Heizer, De Maria, Nancy Holt', why: 'Galeriden ve piyasadan fiziksel kaçış + yükselen ekolojik bilinç + Amerikan çölünün ölçeği.' },
  { n: 'Performans / Beden Sanatı', y: 1970, era: 'cag', r: 'Diğer', who: 'Abramović, Acconci, Burden, Mendieta, Viyana Aksiyonizmi', why: 'Beden: satılamayan ve sansürlenmesi zor tek malzeme; kimlik siyasetinin yükselişi.' },
  { n: 'Feminist Sanat', y: 1971, era: 'cag', r: 'ABD', who: 'Judy Chicago (Dinner Party), Barbara Kruger, Guerrilla Girls; Nochlin', why: 'Linda Nochlin’in “Neden hiç büyük kadın sanatçı olmadı?” (1971) denemesi tartışmayı yetenekten kuruma kaydırır.' },
  { n: 'Kurum Eleştirisi', y: 1970, era: 'cag', r: 'Diğer', who: 'Hans Haacke, Daniel Buren, Andrea Fraser', why: 'Müzenin ve galerinin kendisini yapıtın konusu yapmak. Haacke’nin 1971 Guggenheim sergisi bir emlak ağını sergilediği için iptal edildi.' },
  { n: 'Neo-Ekspresyonizm', y: 1978, era: 'cag', r: 'Almanya', who: 'Baselitz, Kiefer (Almanya); Chia, Clemente (İtalya); Basquiat, Haring (ABD)', why: 'Kavramsalcılığın maddesizliğinden sonra resmin, elin ve duygunun dönüşü — ve bunu çok isteyen 1980’ler piyasası (Reagan/Thatcher, sanat fuarları).' },
  { n: 'Graffiti / Sokak Sanatı', y: 1975, era: 'cag', r: 'ABD', who: 'TAKI 183, Basquiat (SAMO), Haring; sonra Banksy, JR', why: 'Kamusal alanın izinsiz kullanımı; hip-hop kültürünün dört ayağından biri; kentsel eşitsizlik.' },
  { n: 'Pictures Generation', y: 1977, era: 'cag', r: 'ABD', who: 'Cindy Sherman, Richard Prince, Sherrie Levine, Kruger', why: 'Baudrillard’ın simülasyonu + medya imgesinin doygunluğu. Temellük (appropriation): “orijinallik” ve “yazar” kavramları sorgulanır.' },
  { n: 'YBA', y: 1988, era: 'cag', r: 'İngiltere', who: 'Hirst (Freeze), Emin, Whiteread, Lucas; Saatchi', why: 'Thatcher sonrası Londra: medya-dostu şok, girişimci sanatçı figürü, koleksiyoner desteği.' },
  { n: 'Çin Çağdaş Sanatı', y: 1989, era: 'cag', r: 'Çin', who: 'Fang Lijun, Yue Minjun (Alaycı Gerçekçilik); Wang Guangyi (Politik Pop); Ai Weiwei', why: 'Kültür Devrimi sonrası açılma; ideolojik imgenin (Mao) ticari imgeyle (Coca-Cola) çarpışması. 1989 Tiananmen gölgesinde.' },
  { n: 'İlişkisel Estetik', y: 1998, era: 'cag', r: 'Fransa', who: 'Bourriaud; Tiravanija, Gillick, Parreno', why: 'Yapıt bir nesne değil, bir toplumsal karşılaşmadır (galeride yemek pişirmek gibi).' },
  { n: 'Superflat', y: 2000, era: 'cag', r: 'Japonya', who: 'Takashi Murakami; Yayoi Kusama’nın yeniden keşfi', why: 'Otaku kültürü; ticari ile sanatsal arasındaki ayrımın bilinçli silinmesi.' },
  { n: 'Post-internet & Yapay Zekâ', y: 2015, era: 'cag', r: 'Diğer', who: 'Hito Steyerl, Cory Arcangel; NFT (2021); üretken YZ (2022–)', why: 'Net art → post-internet → NFT patlaması/çöküşü → üretken yapay zekâ. Yeni soru, Duchamp’ın sorusunun aynısı: yazarlık kimde?' },
  { n: 'Ukiyo-e', y: 1650, era: 'bat', r: 'Japonya', who: 'Utamaro, Hokusai, Hiroshige', why: 'Edo’nun şehirli tüccar sınıfı için ucuz tahta baskı. 1854’te Japonya açılınca Avrupa’yı (Japonizm) derinden sarsar.' },
  { n: 'Edebiyatçı Resmi (Wenrenhua)', y: 1100, era: 'bat', r: 'Çin', who: 'Su Shi, Ni Zan', why: 'Amatör-bilgin ideali: fırça = karakter. Para için çalışan meslek ressamına karşı bir duruş.' },
  { n: 'Osmanlı Nakkaşhanesi', y: 1550, era: 'bat', r: 'Türkiye', who: 'Nakkaş Osman, Matrakçı Nasuh, Levni', why: 'Tarih tasviri ve topografya; Lale Devri’nde Levni ile bireysel figüre açılım.' },
  { n: 'Fars & Babür Minyatürü', y: 1450, era: 'bat', r: 'Diğer', who: 'Behzad (Herat/Tebriz); Ekber atölyesi (Hindistan)', why: 'Perspektifsiz, çok katmanlı derinlik; Babür’de Fars + Hint + Avrupa gravürü sentezi.' },
  { n: 'Bengal Okulu', y: 1900, era: 'bat', r: 'Diğer', who: 'Abanindranath Tagore', why: 'Swadeshi milliyetçiliği: sömürge akademisine karşı yerli estetik arayışı.' },
  { n: 'Ife & Benin Bronzları', y: 1300, era: 'bat', r: 'Diğer', who: 'Ife/Benin dökümcüleri (Nijerya)', why: 'Bronz portre başları. 1897 İngiliz yağması; Avrupa modernizmini biçimlendiren ve bugün restitüsyonu tartışılan nesneler.' },
  { n: 'Asker Ressamlar', y: 1870, era: 'tur', r: 'Türkiye', who: 'Şeker Ahmed Paşa, Süleyman Seyyid, Osman Hamdi Bey', why: 'Mühendishane kökenli teknik resim eğitimi. Osman Hamdi hem ressam hem arkeolog: Sanayi-i Nefise Mektebi’ni kurar (1882) — akademinin başlangıcı.' },
  { n: '1914 (Çallı) Kuşağı', y: 1914, era: 'tur', r: 'Türkiye', who: 'İbrahim Çallı, Nazmi Ziya, Feyhaman Duran, Mihri Müşfik', why: 'Paris’te eğitim, savaş çıkınca dönüş. Geç izlenimcilik: Türkiye’de ilk “modern” ışık ve fırça.' },
  { n: 'Müstakiller & D Grubu', y: 1929, era: 'tur', r: 'Türkiye', who: 'Zeki Kocamemi, Hale Asaf; Nurullah Berk, Abidin Dino, Zeki Faik İzer', why: 'Cumhuriyet kurumlarıyla eşzamanlı. Kübizm/konstrüktif form; izlenimciliği “gevşek” bularak reddettiler. D Grubu adını kurulan dördüncü grup olduğu için alır.' },
  { n: 'Yeniler & Onlar Grubu', y: 1941, era: 'tur', r: 'Türkiye', who: 'Nuri İyem, Avni Arbaş; Bedri Rahmi öğrencileri', why: 'Savaş yılları toplumsal gerçekçiliği (liman emekçileri) + Anadolu halk sanatı (yazma, kilim, çini) ile modern form.' },
  { n: 'Türk Soyut Kuşağı', y: 1955, era: 'tur', r: 'Türkiye', who: 'Fahrelnissa Zeid, Nejad Devrim, Sabri Berkel, Adnan Çoker', why: 'Paris’teki Art Informel ortamı + hat ve minyatürün soyut potansiyeli.' },
  { n: 'Türkiye Çağdaş', y: 1987, era: 'tur', r: 'Türkiye', who: 'Kutluğ Ataman, Sarkis, Gülsün Karamustafa, Ayşe Erkmen, Halil Altındere', why: 'Kavramsal sanat, video, göç ve bellek. İstanbul Bienali (1987) Türkiye sahnesini küresel ağa bağlar.' },
];

/* ════════════ İNTERAKTİF 1: Akım Kâşifi (ara / filtrele) ════════════ */

export function MovementExplorer() {
  const [q, setQ] = useState('');
  const [era, setEra] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const regions = useMemo(() => Array.from(new Set(MOVEMENTS.map((m) => m.r))), []);
  const list = useMemo(() => {
    const ql = q.toLocaleLowerCase('tr');
    return MOVEMENTS
      .filter((m) => (!era || m.era === era) && (!region || m.r === region) && (!ql || (m.n + ' ' + m.who + ' ' + m.why).toLocaleLowerCase('tr').includes(ql)))
      .sort((a, b) => a.y - b.y);
  }, [q, era, region]);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:p-5">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Ara… (akım, sanatçı, sebep — örn. Freud, Paris, kolaj)" className="w-full rounded-full border border-white/15 bg-black/30 px-5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-rose-400/60" aria-label="Akım ara" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="mr-1 self-center text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">Dönem:</span>
        {ERAS.map((e) => (
          <button key={e.k} onClick={() => setEra(era === e.k ? null : e.k)} className="rounded-full px-2.5 py-1 text-xs font-semibold transition" style={era === e.k ? { background: e.col, color: '#0b0410' } : { background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}>{e.label}</button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="mr-1 self-center text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">Bölge:</span>
        {regions.map((r) => (
          <button key={r} onClick={() => setRegion(region === r ? null : r)} className="rounded-full px-2.5 py-1 text-xs font-semibold transition" style={region === r ? { background: ROSE, color: '#fff' } : { background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}>{r}</button>
        ))}
        {(era || region || q) && <button onClick={() => { setEra(null); setRegion(null); setQ(''); }} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-slate-400 hover:bg-white/10">temizle ✕</button>}
      </div>
      <div className="mt-3 text-xs text-slate-500">{list.length} akım · yıla göre sıralı</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {list.map((m) => {
          const e = eraOf(m.era);
          return (
            <details key={m.n} className="group rounded-xl border border-white/10 bg-white/[0.03] p-4" style={{ borderLeft: '3px solid ' + e.col }}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
                <div>
                  <div className="font-bold text-white">{m.n}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{m.r} · <span style={{ color: e.col }}>{e.label}</span></div>
                </div>
                <span className="shrink-0 rounded-md px-2 py-0.5 font-mono text-[0.7rem] font-bold" style={{ background: e.col + '22', color: e.col }}>{m.y < 1000 ? m.y : m.y}</span>
              </summary>
              <div className="mt-2 text-xs leading-relaxed text-slate-400"><span className="font-semibold text-slate-300">Kim:</span> {m.who}</div>
              <div className="mt-1.5 text-sm leading-relaxed text-slate-300"><span className="font-semibold text-rose-300">Neden çıktı? </span>{m.why}</div>
            </details>
          );
        })}
        {list.length === 0 && <p className="text-sm text-slate-400">Eşleşen akım yok — filtreyi değiştir.</p>}
      </div>
    </div>
  );
}

/* ════════════ İNTERAKTİF 2: Beş Motor ════════════ */

const MOTORS: { icon: string; title: string; text: string; ex: string }[] = [
  { icon: '💰', title: 'Hamilik (para) el değiştirir', text: 'Kilise → saray → burjuva → tüccar pazarı → devlet → küresel koleksiyoner. Kim ödüyorsa konu onun.', ex: 'Örnek: Hollanda Altın Çağı (kilise gidince açık piyasa), Rönesans (Medici).' },
  { icon: '🔧', title: 'Teknoloji değişir', text: 'Yağlıboya, lineer perspektif, tüpte hazır boya, fotoğraf, matbaa, film, internet, üretken yapay zekâ.', ex: 'Örnek: İzlenimcilik (tüpte boya), Kuzey Rönesans (matbaa).' },
  { icon: '⚔️', title: 'Siyasi kırılma olur', text: '1527, 1789, 1848, 1871, 1914, 1917, 1933, 1945, 1968, 1989 — her sarsıntı yeni bir görsel dil ister.', ex: 'Örnek: Realizm (1848), Konstrüktivizm (1917).' },
  { icon: '🚪', title: 'Kurum reddeder', text: 'Akademi, Salon, müze, piyasa reddeder; reddedilenler kendi platformunu kurar. Modern sanatın doğum sahneleri hep bir “ret” sahnesidir.', ex: 'Örnek: İzlenimcilik (1863 Reddedilenler), Courbet (Realizm Pavyonu).' },
  { icon: '🧠', title: 'Paradigma kayar', text: 'Hümanizm, Aydınlanma, pozitivizm, Darwin, Freud, görelilik, Marksizm, yapısöküm.', ex: 'Örnek: Sürrealizm (Freud), Sembolizm (pozitivizme tepki).' },
];
export function FiveMotors() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MOTORS.map((m, i) => (
        <button key={m.title} onClick={() => setOpen(open === i ? null : i)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur transition hover:border-rose-400/40">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-xl">{m.icon}</span>
            <h4 className="font-bold text-white">{i + 1}. {m.title}</h4>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{m.text}</p>
          {open === i && <p className="mt-2 rounded-lg bg-black/30 p-2 text-xs text-rose-200">{m.ex}</p>}
        </button>
      ))}
      <div className="rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] p-4 backdrop-blur sm:col-span-2">
        <p className="m-0 text-sm leading-relaxed text-slate-200"><strong className="text-rose-300">Merkez nerede?</strong> Para, matbaa ve göçmen nerede toplanıyorsa merkez orasıdır: <span className="font-semibold text-white">Floransa → Roma → Amsterdam → Paris → New York → hiçbir yer (ağ).</span> Neredeyse hiçbir akım tek bir motorla çıkmaz; her biri en az ikisinin kesişimindedir.</p>
      </div>
    </div>
  );
}

/* ════════════ VERİ: zaman çizelgesi · şaşırtıcı hikâyeler · quiz ════════════ */

export const timeline = [
  { year: '1400', title: 'Erken Rönesans', text: 'Floransa: Medici parası + perspektif. Resim matematiksel uzam olur.' },
  { year: '1600', title: 'Barok', text: 'Roma’dan Amsterdam’a dört farklı Barok; her biri bir mezhep haritasıdır.' },
  { year: '1789', title: 'Devrim çağı', text: 'Neoklasizm ve Romantizm: aynı çağın ikizleri — akıl ve devlet vs. duygu ve birey.' },
  { year: '1874', title: 'İzlenimcilik', text: 'Tüpte boya + kurumsal ret + modern şehir. Modernizmin kapısı açılır.' },
  { year: '1907', title: 'Kübizm', text: 'Temsilin 400 yıllık temeli terk edilir; kolajla gerçek nesne resme girer.' },
  { year: '1917', title: 'Devrim & Duchamp', text: 'Rusya’da sanat üretime döner; New York’ta pisuar “Çeşme” olur — soru değişir.' },
  { year: '1937', title: 'Totaliter kesinti', text: '“Yozlaşmış Sanat” sergisi + Sosyalist Gerçekçilik; sanatçılar ABD’ye göçer.' },
  { year: '1943', title: 'New York yükselir', text: 'Soyut Dışavurumculuk: merkez Paris’ten New York’a geçer — bir göç dalgasıyla.' },
  { year: '1960', title: 'Pop & Minimalizm', text: 'Yüksek/alçak ayrımı çöker; nesne ile fikir çatışır.' },
  { year: '1968', title: 'Maddesizleşme', text: 'Kavramsal, arazi, beden, feminist sanat: nesne = meta, öyleyse nesneyi kaldır.' },
  { year: '1987', title: 'Küresel ağ', text: 'İstanbul Bienali ve biyenal sistemi; merkez–çevre şeması çözülür.' },
  { year: '2022', title: 'Yapay zekâ', text: 'Üretken YZ görüntüsü Duchamp’ın sorusunu yineler: yazarlık kimde?' },
];

export const quizQs = [
  { text: "Belgeye göre bir akım tipik olarak neyle doğar?", opts: ['Tek bir dâhinin farklı resim yapma isteğiyle', 'Beş “motor”dan (para, teknoloji, siyaset, kurum reddi, paradigma) en az ikisinin kesişiminde', 'Sadece yeni bir boya icat edilince', 'Devlet emriyle'], a: 1, exp: "Hiçbir akım tek motorla çıkmaz; genelde para, teknoloji, siyaset, kurum reddi ve paradigma kaymasından birkaçı üst üste biner." },
  { text: "Hollanda Altın Çağı neden “ekonomi belirler”in en net örneğidir?", opts: ['Devlet ressamlara maaş bağladığı için', 'Protestan ikonoklazm en büyük müşteriyi (kilise) silince açık piyasa ve tür uzmanlaşması doğduğu için', 'Yeni bir boya icat edildiği için', 'Kral resim sevdiği için'], a: 1, exp: "Kilise duvarı gidince sanatçı sipariş beklemeyip üretip sattı; manzara, natürmort, iç mekân gibi türler bu piyasadan doğdu." },
  { text: "Duchamp’ın 1917’de pisuarı “Çeşme” adıyla sergiye göndermesi hangi soruyu değiştirdi?", opts: ['“Bu ne kadar pahalı?”', '“Bu iyi mi?” yerine “Bu neden sanat sayılıyor, kim karar veriyor?”', '“Bu nasıl yapıldı?”', 'Hiçbirini'], a: 1, exp: "Hazır-nesne, kavramsal sanatın, enstalasyonun ve kurum eleştirisinin başlangıcıdır." },
  { text: "Sanatın merkezinin Paris’ten New York’a geçmesinin asıl mekanizması neydi?", opts: ['Amerikalıların daha yetenekli olması', 'Totaliter rejimlerden kaçan Avrupalı sanatçıların ABD’ye kitlesel göçü', 'Yeni bir müze açılması', 'Reklamın icadı'], a: 1, exp: "Estetik bir zafer değil, bir göç dalgası: Mondrian, Ernst, Breton, Gropius, Mies, Albers… “Avrupa’nın kaybı, Amerika’nın kazancı.”" },
  { text: "Fütürizm neden “ilk pazarlama-avangardı” sayılır?", opts: ['İlk soyut resmi yaptığı için', 'Manifestosunu bir gazetenin (Le Figaro) birinci sayfasında yayımladığı için', 'En çok tablo sattığı için', 'İnterneti kullandığı için'], a: 1, exp: "Fütürizm kendini medya üzerinden kurdu; aynı zamanda militarizmi yücelterek avangardın siyaseten nötr olmadığını da gösterdi." },
  { text: "Linda Nochlin’in 1971 denemesi tartışmayı nereye kaydırdı?", opts: ['Yetenekten kuruma (eğitim, akademi, erişim)', 'Renkten çizgiye', 'Resimden heykele', 'Avrupa’dan Amerika’ya'], a: 0, exp: "“Neden hiç büyük kadın sanatçı olmadı?” sorusu, eksikliğin yetenekte değil kurumsal engellerde olduğunu gösterdi." },
];
