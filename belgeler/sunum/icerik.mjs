// BTM sunumu — İÇERİK. Tüm rakamlar belgeler/ ve koddan doğrulandı (30.07.2026).
// Slayt tipleri: cover · bullets · stat · table · quadrant · timeline · closing

export const TR = {
  dil: 'tr',
  altbilgi: 'Basementonfire · BTM Başvuru Sunumu',
  slaytlar: [
    { tip: 'cover',
      rozet: 'Teknopark İstanbul BTM · Ön Kuluçka',
      baslik: ['Türkçe bilgi,', 'okunmak yerine', 'deneyimlensin.'],
      vurgu: 2,
      alt: 'Basementonfire; Türkçe bilim ve tarih okurunun, anlatılanı okuyup da deneyememe sorununu, her makaleyi tarayıcıda çalışan bir simülasyona dönüştürerek çözer.',
      meta: [['ÜRÜN', 'basementonfire.com · yayında'], ['KURUCU', 'Kaan Çoban'],
             ['AŞAMA', 'Çalışan ürün, şirketleşme öncesi'], ['TARİH', 'Temmuz 2026']] },

    { tip: 'bullets', etiket: 'PROBLEM', baslik: 'Okuyucu, izleyici konumunda.',
      alt: 'Türkçe bilim ve tarih içeriği iki biçimde var: uzun bir metin ya da bir video.',
      maddeler: [
        ['Denenemiyor', 'Okuyucu bir değişkeni değiştiremiyor, sonucu kendi göremiyor.'],
        ['Doğrulanamıyor', 'Kaynak gösterimi istisna; çelişen kaynaklar okura hiç ulaşmıyor.'],
        ['Ölçülemiyor', 'Ne kadarının anlaşıldığını ne yazar biliyor ne okur.'],
      ],
      not: 'Öğrenmenin kalıcılığını belirleyen şey tam olarak denemektir.' },

    { tip: 'bullets', etiket: 'ÇÖZÜM', baslik: 'Her makalenin mekanizması çalışıyor.',
      alt: 'Anlatılan şey metinde kalmıyor; tarayıcıda çalışan bir simülasyona dönüşüyor. Kurulum yok, eklenti yok, güçlü cihaz gerekmiyor.',
      maddeler: [
        ['{MAKALE} uzun makale', '{KONU} konu başlığında, tamamı Türkçe.'],
        ['Ücretsiz ve üyeliksiz', 'Okumak için hesap açmak gerekmiyor.'],
        ['Her makalede kaynakça', 'Kaynaklar çelişiyorsa iki sürüm yan yana konuyor.'],
      ] },

    { tip: 'stat', etiket: 'SOMUT ÖRNEK', baslik: 'Radyoaktivite: kendi sayını gör.',
      sayi: '7.840', sayiAlt: 'saniyede parçalanan atom çekirdeği · 70 kg için',
      govde: 'Okuyucu kilosunu giriyor, ekranda canlı bir sayaç dönüyor. Kaydırıcı oynadıkça sayı değişiyor. Okuyucu «radyoaktivite her yerdedir» cümlesini okumuyor — kendi vücudundaki sayıyı görüyor.',
      not: '{MAKALE} makalenin her birinde bunun gibi bir modül var: kuşatma simülasyonu, çift yarık deneyi, momentum çarpışması, mol hesaplayıcı.' },

    { tip: 'table', etiket: 'AR-GE · 1', baslik: 'Tahmin etmez, ölçer.',
      alt: 'Bir fizik simülasyonunu ucuz bir telefonda akıcı çalıştırmak, içerik üretmekten zor bir problem. Sektör standardı cihaz modeline göre kalite listesi tutmaktır. Basementonfire bunun yerine cihazın kendi kare süresini ölçer.',
      basliklar: ['Eşik', 'Değer', 'Ne olur'],
      satirlar: [
        ['Isınma penceresi', 'ilk 60 kare', 'Sayılmaz — hidrasyon ve görsel çözme her cihazda yavaştır'],
        ['Aykırı değer', '> 200 ms', 'Atılır — çizim maliyeti değil (sekme kısıtlaması, çöp toplama)'],
        ['Ölçüm penceresi', '90 kare', 'Ortalama bu pencerede alınır'],
        ['Birinci kademe', '> 26 ms', 'Piksel oranı düşürülür'],
        ['İkinci kademe', '> 30 ms', 'Animasyon son karesinde dondurulur'],
      ],
      not: 'Karar, cihaz modeli listesiyle değil o cihazın kendi ölçümüyle veriliyor. Katman bağımsız bir modül; ayrıca lisanslanabilir.' },

    { tip: 'bullets', etiket: 'AR-GE · 2', baslik: 'Belirsizlik neredeydi?',
      alt: 'Ar-Ge, bilinen bir tekniği uygulamak değil; teknik belirsizliği sistematik denemeyle çözmektir. İki eşik değeri masa başında değil, ölçerek bulundu.',
      maddeler: [
        ['Isınma penceresi', 'İlk sürümde yoktu. Ölçüm mount anında başlayınca hidrasyon ve görsel çözme kareleri sayılıyordu — sağlam telefonlar da haksız yere kısıtlanıyordu. Test bunu yakaladı.'],
        ['Aykırı değer eleme', '200 ms üzeri kareler çizim maliyeti değil; sekme kısıtlaması ya da çöp toplama. Ortalamayı kirletiyorlardı.'],
        ['Doğrulama', 'Bekçi saf bir fonksiyon olarak yazıldı; tarayıcı açmadan, sentetik zaman damgalarıyla yedi senaryoda test edildi.'],
      ] },

    { tip: 'bullets', etiket: 'AR-GE · 3', baslik: 'Oyun motorundaki çözüm neden yetmiyor?',
      alt: 'Dinamik çözünürlük ölçekleme oyunlarda var. Ama oyun farklı bir problem.',
      maddeler: [
        ['Oyunda', 'Kullanıcı kurulum yapmış, ayarlar menüsü var, donanım hedefi belli, kalite kaydırıcısını kendisi çekebiliyor.'],
        ['Makalede', 'Okuyucu bir kez geliyor, hiçbir şey ayarlamıyor, takılırsa geri dönmüyor. Çözüm otomatik, anlık ve ikinci şansı olmayan bir çözüm olmak zorunda.'],
        ['Son kademe farkı', 'Kalite düşürmekle kalınmaz; animasyon son karesinde dondurulur. Bozulma değil, kasıtlı görünen bir son durum. Oyunda donmuş kare başarısızlıktır, makalede kabul edilebilir bir bitiştir.'],
      ] },

    { tip: 'quadrant', etiket: 'REKABET', baslik: 'Kimse üç ekseni birden tutmuyor.',
      alt: 'Anlatı, etkileşim ve yerli Türkçe üretim. Alternatifler bunlardan en fazla ikisini sağlıyor.',
      basliklar: ['', 'Anlatı', 'Etkileşim', 'Yerli Türkçe', 'Ölçüm'],
      satirlar: [
        ['Vikipedi · Evrim Ağacı', '✓', '—', '✓', '—'],
        ['YouTube eğitim kanalları', '✓', '—', '✓', '—'],
        ['PhET (Colorado Üniv.)', '—', '✓', 'çeviri', '—'],
        ['Khan Academy Türkçe', '✓', 'kısmen', 'çeviri', '✓'],
        ['Basementonfire', '✓', '✓', '✓', '✓'],
      ],
      not: 'Savunma hattı: rakiplerin buraya gelmesi için ya doğruluk denetimi kurması ya da sıfırdan etkileşimli anlatım altyapısı yazması gerekiyor. İkisi de tek bir özellik değil, birikimli iş.' },

    { tip: 'bullets', etiket: 'ÜRÜN', baslik: 'Bugün yayında olanlar.',
      maddeler: [
        ['İçerik', '{MAKALE} uzun makale, {KONU} konu başlığı, 94 quiz sorusu. Her makalede çalışan bir simülasyon ve kaynakça.'],
        ['Ölçüm katmanı', 'Okuma ilerlemesi, makale sonu quiz, karar noktası oyları. Kişiselleştirilmiş öğrenme yolunun temeli.'],
        ['Kullanıcı üretimi', 'Okuyucular yalıtılmış bir çerçevede kendi JavaScript kodlarını çalıştırarak interaktif makale yazabiliyor.'],
        ['Uyum', 'KVKK ve GDPR uyumlu: çerezsiz ziyaretçi sayacı, ham IP saklamayan ölçüm, veri indirme ve hesap silme.'],
      ] },

    { tip: 'bullets', etiket: 'TEKNOLOJİ', baslik: 'Yığın ve mimari.',
      maddeler: [
        ['Ön yüz', 'Next.js 15 App Router, React 19, TypeScript. Statik üretim ve ISR ile sunulan makaleler.'],
        ['Görselleştirme', 'WebGL — ogl (hafif sahneler) ve three.js (IBL gereken sahneler). Ortak performans katmanı ikisini de yönetiyor.'],
        ['Veri', 'Supabase PostgreSQL, satır düzeyi güvenlik. Netlify üzerinde kenar önbelleği.'],
        ['Ölçüm', 'Çerezsiz, günlük dönen tuzlanmış hash ile anonim ziyaretçi sayımı.'],
      ] },

    { tip: 'table', etiket: 'MEVCUT DURUM', baslik: 'Kanıt.',
      basliklar: ['', ''],
      satirlar: [
        ['Yayındaki makale', '{MAKALE}, {KONU} konu başlığında'],
        ['Kod tabanı', "64.000+ satır TypeScript · 370+ commit · ~890 dosya"],
        ['Zaman çizelgesi', "Alan adı 2024 · aktif geliştirme Eylül 2025 · mevcut kod tabanı Haziran 2026'dan beri"],
        ['Ekip', '1 kişi'],
        ['Dış sermaye', 'Yok — bugüne kadar tamamı özkaynak'],
        ['Arama görünürlüğü', 'Bu ay açıldı; son 10 günde gösterim 0 → günde ~15'],
        ['Pazarlama harcaması', 'Bugüne kadar sıfır'],
      ] },

    { tip: 'table', etiket: 'PAZAR', baslik: 'Dört kanal, farklı hız ve büyüklük.',
      basliklar: ['Segment', 'Karar hızı', 'Bütçe', 'Not'],
      satirlar: [
        ['Dershane zincirleri', 'En hızlı', 'Küçük–orta', 'Tek kişi karar veriyor. İlk fatura buradan bekleniyor'],
        ['Yayınevleri', 'Yavaş', 'En büyük etki', 'Dağıtımları çözülmüş, bu içeriği kendileri üretemiyor'],
        ['TÜBİTAK popüler bilim yayınları', 'Orta', 'Proje bütçesi', 'Sipariş içerik; referans değeri yüksek'],
        ['Kurumsal eğitim', 'Yavaş', 'En büyük', 'Motor konudan bağımsız. Uzun vade'],
      ],
      not: 'Devlet okulu hedeflenmiyor: dijital içerik alım kararı okul müdüründe değil, MEB düzeyinde.' },

    { tip: 'bullets', etiket: 'İŞ MODELİ', baslik: 'Gelir okuyucudan değil, kurumdan.',
      alt: 'Ücretsiz katman pazarlama gideri değil, ürünün kendisidir. Kurumsal müşteri satın almadan önce ürünün tamamını çalışır hâlde görüyor.',
      maddeler: [
        ['Kurum lisansı — birincil', 'Dershane zincirlerine ve yayınevlerine yıllık lisans. Kuruma özel araçlar henüz yazılmadı; ihtiyaç süren görüşmelerde belirlenecek.'],
        ['Sipariş içerik', 'Bir kurumun kendi konusunu aynı formatta üretmek. Her sipariş motora kalıcı bir modül kazandırıyor.'],
        ['Motor lisansı — uzun vade', 'Uyarlanabilir render katmanının başka yayıncılara lisanslanması.'],
      ] },

    { tip: 'table', etiket: 'YAYINEVİ MODELİ', baslik: 'Sıra önemli.',
      alt: 'Bir yayınevi klasik bir eseri interaktif hâle getirmek istediğinde üç kurgu mümkün. En cazip görünen, en son yapılabilecek olan.',
      basliklar: ['', 'Model', 'Emeği kim harcıyor', 'Ne zaman'],
      satirlar: [
        ['A', 'Proje işi — tek kitabın interaktif sürümü', 'Basementonfire', 'Şimdi'],
        ['B', 'Araç lisansı — yazım aracı kiralanır', 'Yayınevi', 'Sonra'],
        ['C', 'Platform/abonelik — katalog erişimi', 'Karma', 'En son'],
      ],
      not: 'C için yayınevi kitle, kullanıcı katalog ister — klasik soğuk başlangıç. A ile başlamak döngüyü kırar. B ölçeklenmeyi sağlar, çünkü yalıtılmış yazım aracı zaten var.' },

    { tip: 'table', etiket: 'GİDER', baslik: 'İki katman.',
      alt: 'Ürünü ayakta tutmanın maliyeti ile bu hızda geliştirmeye devam etmenin maliyeti farklı şeylerdir.',
      basliklar: ['Katman', 'Aylık', 'Yıllık'],
      satirlar: [
        ['Altyapı — Supabase, Netlify, e-posta, alan adı', '1.508 ₺', '18.104 ₺'],
        ['Geliştirme araçları — kesilebilir', '6.537 ₺', '78.440 ₺'],
        ['Toplam', '8.045 ₺', '96.544 ₺'],
      ],
      not: 'Geliştirme araçlarına ayrılan bütçe, tek kişiyle bir ekip çıktısı almanın karşılığı: iki ayda 370+ commit, 64.000+ satır.' },

    { tip: 'table', etiket: 'BAŞABAŞ', baslik: 'Kaç müşteri gerekiyor?',
      alt: 'Fiyat henüz belirlenmedi — ilk kurum görüşmeleri bu hafta başladı. Aritmetik şöyle:',
      basliklar: ['Yıllık sözleşme', 'Altyapı için', 'Tam hız için'],
      satirlar: [
        ['10.000 ₺', '2 müşteri', '10 müşteri'],
        ['20.000 ₺', '1 müşteri', '5 müşteri'],
        ['50.000 ₺', '1 müşteri', '2 müşteri'],
      ],
      not: 'Birinci yıl hedefi altyapı başabaşı; geliştirme araçları dahil tam başabaş ikinci yılın hedefi.' },

    { tip: 'bullets', etiket: 'İLERLEME', baslik: 'Ticarileşme başladı.',
      maddeler: [
        ['10 kuruma ulaşıldı', '5 dershane zinciri · 2 eğitim yayıncısı · 3 klasik yayınevi. Dönüşler bekleniyor.'],
        ['Satış değil, keşif', 'Sorulan tek soru: «Derste böyle bir materyali kullanmak isteseniz sizi bugün ne durduruyor?» Modüller o cevap duyulmadan yazılmayacak.'],
        ['Ölçüm altyapısı kuruldu', 'Analitik, dönüşüm takibi ve arama reklamı kampanyası çalışıyor. Hangi konuların gerçekten arandığı ölçülmeye başlandı.'],
      ] },

    { tip: 'table', etiket: 'FİKRİ MÜLKİYET', baslik: 'Marka başvurusu yapıldı.',
      basliklar: ['', ''],
      satirlar: [
        ['Başvuru numarası', '2026/098481'],
        ['Başvuru tarihi', '30 Temmuz 2026'],
        ['Tür', 'Kelime markası — adı her yazı tipinde korur'],
        ['Sınıflar', '9 (yazılım) · 41 (eğitim, yayıncılık) · 42 (yazılım hizmetleri, lisanslama)'],
        ['Telif', 'Kod ve içerik telif kapsamında; 370+ commit’lik tarihli git geçmişi eser sahipliğinin kanıtı'],
        ['Patent', 'Uyarlanabilir render yöntemi için patentlenebilirlik araştırması planda'],
      ] },

    { tip: 'timeline', etiket: 'YOL HARİTASI', baslik: 'Birinci yıl.',
      adimlar: [
        ['0–6 ay', 'Kurum görüşmelerinden çıkan ihtiyaca göre kuruma özel modüller. 3 pilot kurum. İlk işe alım.'],
        ['6–12 ay', 'Pilotlardan 2’sinin ücretli lisansa dönmesi. 2 tamamlanmış sipariş içerik projesi.'],
        ['12+ ay', 'Motor lisansının ayrı bir ürün olarak paketlenmesi. İçerik hacminin ekiple büyütülmesi.'],
      ],
      not: 'Altı ay sonra ölçülebilecek üç şey: pilot sayısı, ücretli dönüşüm sayısı, tamamlanmış sipariş içerik sayısı.' },

    { tip: 'bullets', etiket: 'EKİP VE RİSK', baslik: 'En büyük risk, girişimin tek kişiye bağımlı olması.',
      alt: 'Bu risk saklanmıyor; birinci yılın ilk hedefi onu kapatmaktır.',
      maddeler: [
        ['Bugün', 'Kod, içerik, tasarım ve satış tek kişide. Ürün bu koşulda dış sermaye olmadan yayına çıktı.'],
        ['Birinci yıl', 'İçerik ya da satış tarafında bir kişi. BTM’den ilk beklenti bu.'],
        ['Sonrası', 'Motor ve içerik üretiminin ayrı yürüyebilmesi için küçük bir çekirdek ekip.'],
      ] },

    { tip: 'bullets', etiket: 'TALEP', baslik: 'BTM’den beklenenler.',
      maddeler: [
        ['Ar-Ge personeli istihdamını mümkün kılan yapı', 'Proje bugün tek kişiye bağımlı; en büyük riski bu.'],
        ['Akademik hakemlik bağlantısı', 'İçeriğin bilimsel denetimi hem kaliteyi hem kurumsal satışı güçlendiriyor.'],
        ['İlk kurumsal müşteriye erişim', 'Eğitim kurumları ve yayıncılarla temas ağı.'],
      ] },

    { tip: 'closing', baslik: 'Ürün çalışıyor. Eksik olan, onu bir şirkete dönüştürecek yapı.',
      alt: 'Anlatılan örneği kendiniz çalıştırabilirsiniz:',
      link: 'basementonfire.com/articles/radyoaktivite',
      meta: [['SİTE', 'basementonfire.com'], ['E-POSTA', 'info@basementonfire.com'],
             ['KURUCU', 'Kaan Çoban'], ['MARKA', 'TÜRKPATENT 2026/098481']] },
  ],
};

export const EN = {
  dil: 'en',
  altbilgi: 'Basementonfire · BTM Application Deck',
  slaytlar: [
    { tip: 'cover',
      rozet: 'Teknopark İstanbul BTM · Pre-incubation',
      baslik: ['Knowledge in Turkish,', 'run rather than', 'read.'],
      vurgu: 2,
      alt: 'Basementonfire solves the Turkish science and history reader’s inability to try what they read, by turning every article into a simulation that runs in the browser, with sources cited.',
      meta: [['PRODUCT', 'basementonfire.com · live'], ['FOUNDER', 'Kaan Çoban'],
             ['STAGE', 'Working product, pre-incorporation'], ['DATE', 'July 2026']] },

    { tip: 'bullets', etiket: 'PROBLEM', baslik: 'The reader is a spectator.',
      alt: 'Turkish science and history content exists in two forms: a wall of text, or a video.',
      maddeler: [
        ['Nothing to try', 'The reader cannot change a variable or see the result themselves.'],
        ['Nothing to verify', 'Citations are the exception; conflicting sources never reach the reader.'],
        ['Nothing measured', 'Neither the writer nor the reader knows how much was understood.'],
      ],
      not: 'Trying something is precisely what makes it stick.' },

    { tip: 'bullets', etiket: 'SOLUTION', baslik: 'Every article runs its own mechanism.',
      alt: 'What the article explains does not stay in the text; it becomes a simulation running in the browser. No install, no plugin, no powerful device required.',
      maddeler: [
        ['{MAKALE} long-form articles', 'Across {KONU} subject areas, all in Turkish.'],
        ['Free, no account', 'Reading requires no sign-up.'],
        ['A bibliography in every article', 'Where sources conflict, both versions are shown side by side.'],
      ] },

    { tip: 'stat', etiket: 'CONCRETE EXAMPLE', baslik: 'Radioactivity: see your own number.',
      sayi: '7,840', sayiAlt: 'nuclei decaying per second · for 70 kg',
      govde: 'The reader enters their weight and a live counter starts. Move the slider and the number changes. The reader does not read the sentence “radioactivity is everywhere” — they see the number inside their own body.',
      not: 'Each of the {MAKALE} articles carries a module like this: a siege simulation, the double-slit experiment, momentum collision, a mole calculator.' },

    { tip: 'table', etiket: 'R&D · 1', baslik: 'It measures rather than predicts.',
      alt: 'Running a physics simulation smoothly on a cheap phone is harder than producing the content. The industry standard is a quality list keyed to device models. Basementonfire measures the device’s own frame time instead.',
      basliklar: ['Threshold', 'Value', 'Effect'],
      satirlar: [
        ['Warm-up window', 'first 60 frames', 'Discarded — hydration and image decoding are slow on every device'],
        ['Outlier', '> 200 ms', 'Discarded — not draw cost (tab throttling, garbage collection)'],
        ['Measurement window', '90 frames', 'The average is taken over this window'],
        ['First stage', '> 26 ms', 'Pixel ratio is lowered'],
        ['Second stage', '> 30 ms', 'Animation freezes on its last frame'],
      ],
      not: 'The decision comes from that device’s own measurement, not a model lookup table. The layer is an independent module and can be licensed separately.' },

    { tip: 'bullets', etiket: 'R&D · 2', baslik: 'Where was the uncertainty?',
      alt: 'R&D is not applying a known technique; it is resolving technical uncertainty through systematic investigation. Both threshold values came from measurement, not from a desk.',
      maddeler: [
        ['The warm-up window', 'It did not exist in the first version. Measurement started at mount, so hydration and decoding frames were counted — capable phones were being throttled unfairly. Testing caught it.'],
        ['Outlier rejection', 'Frames above 200 ms are not draw cost; they are tab throttling or garbage collection. They were polluting the average.'],
        ['Verification', 'The guard is a pure function, tested without a browser across seven scenarios using synthetic timestamps.'],
      ] },

    { tip: 'bullets', etiket: 'R&D · 3', baslik: 'Why the game-engine solution is not enough.',
      alt: 'Dynamic resolution scaling exists in games. But a game is a different problem.',
      maddeler: [
        ['In a game', 'The user has installed it, there is a settings menu, the hardware target is known, and they can move the quality slider themselves.'],
        ['In an article', 'The reader arrives once, configures nothing, and does not come back if it stutters. The solution has to be automatic, immediate, and get no second chance.'],
        ['The final stage', 'Quality is not merely lowered; the animation is frozen on its last frame. Not a failure state but a deliberate-looking one. In a game a frozen frame is failure; in an article it is an acceptable ending.'],
      ] },

    { tip: 'quadrant', etiket: 'COMPETITION', baslik: 'Nobody holds all three axes.',
      alt: 'Narrative, interaction, and content written natively in Turkish. Alternatives deliver at most two.',
      basliklar: ['', 'Narrative', 'Interaction', 'Native Turkish', 'Measurement'],
      satirlar: [
        ['Wikipedia · Evrim Ağacı', '✓', '—', '✓', '—'],
        ['Educational YouTube', '✓', '—', '✓', '—'],
        ['PhET (Univ. of Colorado)', '—', '✓', 'translated', '—'],
        ['Khan Academy Turkish', '✓', 'partial', 'translated', '✓'],
        ['Basementonfire', '✓', '✓', '✓', '✓'],
      ],
      not: 'Defensibility: to reach this quadrant a competitor must either build source verification or write an interactive narrative layer from scratch. Neither is a single feature; both are accumulated work.' },

    { tip: 'bullets', etiket: 'PRODUCT', baslik: 'What is live today.',
      maddeler: [
        ['Content', '{MAKALE} long-form articles, {KONU} subject areas, 94 quiz questions. A working simulation and a bibliography in each.'],
        ['Measurement layer', 'Reading progress, end-of-article quizzes, decision-point polls. The basis for a personalised learning path.'],
        ['User-generated', 'Readers can write interactive articles by running their own JavaScript inside a sandboxed frame.'],
        ['Compliance', 'Built for KVKK and GDPR: cookieless visitor counting, no raw IP stored, data export and account deletion.'],
      ] },

    { tip: 'bullets', etiket: 'TECHNOLOGY', baslik: 'Stack and architecture.',
      maddeler: [
        ['Frontend', 'Next.js 15 App Router, React 19, TypeScript. Articles served statically and through ISR.'],
        ['Visualisation', 'WebGL — ogl for light scenes, three.js where image-based lighting is needed. One performance layer governs both.'],
        ['Data', 'Supabase PostgreSQL with row-level security. Edge caching on Netlify.'],
        ['Measurement', 'Cookieless anonymous counting via a daily-rotating salted hash.'],
      ] },

    { tip: 'table', etiket: 'CURRENT STATE', baslik: 'Evidence.',
      basliklar: ['', ''],
      satirlar: [
        ['Articles live', '{MAKALE}, across {KONU} subject areas'],
        ['Codebase', '64,000+ lines of TypeScript · 370+ commits · ~890 files'],
        ['Timeline', 'Domain 2024 · active development from September 2025 · current codebase since June 2026'],
        ['Team', '1 person'],
        ['Outside capital', 'None — self-funded to date'],
        ['Search visibility', 'Opened this month; impressions went from 0 to ~15/day over the last 10 days'],
        ['Marketing spend', 'Zero to date'],
      ] },

    { tip: 'table', etiket: 'MARKET', baslik: 'Four channels, different speed and size.',
      basliklar: ['Segment', 'Decision speed', 'Budget', 'Note'],
      satirlar: [
        ['Tutoring-centre chains', 'Fastest', 'Small–medium', 'One person decides. First invoice expected here'],
        ['Publishers', 'Slow', 'Largest impact', 'Distribution solved; they cannot produce this themselves'],
        ['TÜBİTAK popular science press', 'Medium', 'Project budget', 'Commissioned content; high reference value'],
        ['Corporate training', 'Slow', 'Largest', 'The engine is subject-agnostic. Long term'],
      ],
      not: 'State schools are not targeted: the purchasing decision for digital content sits with the ministry, not the school.' },

    { tip: 'bullets', etiket: 'BUSINESS MODEL', baslik: 'Revenue comes from institutions, not readers.',
      alt: 'The free tier is not a marketing cost; it is the product. An institutional buyer sees the whole thing working before purchasing.',
      maddeler: [
        ['Institutional licence — primary', 'Annual licences to tutoring chains and publishers. Institution-specific tooling is not built yet; the requirement will come from the conversations now underway.'],
        ['Commissioned content', 'Producing an institution’s own subject in the same format. Each commission leaves a permanent module in the engine.'],
        ['Engine licence — long term', 'Licensing the adaptive render layer to other publishers.'],
      ] },

    { tip: 'table', etiket: 'PUBLISHER MODEL', baslik: 'Sequence matters.',
      alt: 'When a publisher wants a classic work made interactive, three structures are possible. The most attractive one is the last one that can be built.',
      basliklar: ['', 'Model', 'Who does the work', 'When'],
      satirlar: [
        ['A', 'Project work — interactive edition of one book', 'Basementonfire', 'Now'],
        ['B', 'Tool licence — the authoring tool is rented', 'The publisher', 'Next'],
        ['C', 'Platform/subscription — catalogue access', 'Mixed', 'Last'],
      ],
      not: 'C needs an audience to attract publishers and a catalogue to attract an audience — a cold-start loop. A breaks it; B is what makes the model scale, since the sandboxed authoring tool already exists.' },

    { tip: 'table', etiket: 'COSTS', baslik: 'Two tiers.',
      alt: 'What it costs to keep the product alive and what it costs to keep building at this pace are different numbers.',
      basliklar: ['Tier', 'Monthly', 'Annual'],
      satirlar: [
        ['Infrastructure — Supabase, Netlify, email, domain', '₺1,508', '₺18,104'],
        ['Development tooling — can be cut', '₺6,537', '₺78,440'],
        ['Total', '₺8,045', '₺96,544'],
      ],
      not: 'The tooling budget is what buys a team’s output from one person: 370+ commits and 64,000+ lines in two months.' },

    { tip: 'table', etiket: 'BREAK-EVEN', baslik: 'How many customers?',
      alt: 'Pricing is not set yet — the first institutional conversations began this week. The arithmetic:',
      basliklar: ['Annual contract', 'For infrastructure', 'For full pace'],
      satirlar: [
        ['₺10,000', '2 customers', '10 customers'],
        ['₺20,000', '1 customer', '5 customers'],
        ['₺50,000', '1 customer', '2 customers'],
      ],
      not: 'Year one targets infrastructure break-even; full break-even including tooling is the year-two target.' },

    { tip: 'bullets', etiket: 'TRACTION', baslik: 'Commercialisation has started.',
      maddeler: [
        ['10 institutions contacted', '5 tutoring chains · 2 education publishers · 3 classics publishers. Replies pending.'],
        ['Discovery, not selling', 'One question asked: “If you wanted to use material like this in class, what stops you today?” No module gets written before that answer.'],
        ['Measurement stack live', 'Analytics, conversion tracking and a search campaign are running. Which subjects are actually searched for is now being measured.'],
      ] },

    { tip: 'table', etiket: 'INTELLECTUAL PROPERTY', baslik: 'Trademark filed.',
      basliklar: ['', ''],
      satirlar: [
        ['Application number', '2026/098481'],
        ['Filing date', '30 July 2026'],
        ['Type', 'Word mark — protects the name in any typeface'],
        ['Classes', '9 (software) · 41 (education, publishing) · 42 (software services, licensing)'],
        ['Copyright', 'Code and content are covered; a dated history of 370+ commits evidences authorship'],
        ['Patent', 'A patentability search for the adaptive render method is planned'],
      ] },

    { tip: 'timeline', etiket: 'ROADMAP', baslik: 'Year one.',
      adimlar: [
        ['0–6 months', 'Institution-specific modules built from what the conversations reveal. 3 pilot institutions. First hire.'],
        ['6–12 months', '2 pilots converted to paid licences. 2 completed commissioned-content projects.'],
        ['12+ months', 'Packaging the engine licence as a separate product. Growing content volume with a team.'],
      ],
      not: 'Three things measurable in six months: pilot count, paid conversions, completed commissions.' },

    { tip: 'bullets', etiket: 'TEAM AND RISK', baslik: 'The biggest risk is that I am one person.',
      alt: 'The risk is not hidden; closing it is the first goal of year one.',
      maddeler: [
        ['Today', 'Code, content, design and sales sit with one person. The product reached launch under that constraint without outside capital.'],
        ['Year one', 'One person on content or sales. This is the first thing expected from BTM.'],
        ['After', 'A small core team so engine work and content production can run in parallel.'],
      ] },

    { tip: 'bullets', etiket: 'THE ASK', baslik: 'What the venture needs from BTM.',
      maddeler: [
        ['A structure that makes an R&D hire possible', 'The project depends on one person today; that is its largest risk.'],
        ['Academic review connections', 'Scientific review of the content strengthens both quality and institutional sales.'],
        ['Access to a first institutional customer', 'A contact network among education institutions and publishers.'],
      ] },

    { tip: 'closing', baslik: 'The product works. What is missing is the structure to turn it into a company.',
      alt: 'You can run the example yourself:',
      link: 'basementonfire.com/articles/radyoaktivite',
      meta: [['SITE', 'basementonfire.com'], ['EMAIL', 'info@basementonfire.com'],
             ['FOUNDER', 'Kaan Çoban'], ['TRADEMARK', 'TÜRKPATENT 2026/098481']] },
  ],
};
