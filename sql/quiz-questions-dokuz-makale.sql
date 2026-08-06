-- ============================================================
-- DOKUZ MAKALE İÇİN EK QUIZ SORULARI
-- ============================================================
-- Bu dokuz makalenin quiz_questions'ta yalnızca 3'er sorusu vardı (ilk tohumdan
-- kalma), diğer makalelerde 7-12 soru varken. Gövdelerinde çıkarılacak bir soru
-- dizisi de yoktu — hiç mini quiz'leri olmamıştı. Sorular makalelerin kendi
-- metninden yazıldı; her biri sayfada açıkça anlatılan bir noktayı ölçüyor.
--
-- Doğru cevap konumları A/B/C/D'ye dağıtıldı. Site genelinde doğru cevabın %81
-- oranında B çıkması sorunu bir kez düzeltilmişti; aynı sapmayı yeniden
-- üretmemek için burada baştan dengeli yazıldı.
--
-- GÜVENLİ: `where not exists` ile korunuyor, tekrar çalıştırılabilir; mevcut
-- satırlara dokunmaz.
-- ============================================================

insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select v.question, v.options::jsonb, v.correct_index, v.explanation, v.article_slug
from (values

-- ── arcade ──────────────────────────────────────────────
('William Higinbotham "Tennis for Two"yu neden yaptı?',
 '["Bir askeri simülasyon siparişi almıştı","Brookhaven laboratuvarının ziyaretçi gününü canlandırmak için","Bir üniversite dersinde göstermek için","Bir yarışmaya katılmak için"]', 1,
 'Oyun ticari bir ürün olarak değil, laboratuvarın açık gününü eğlenceli kılmak için bir analog bilgisayarla osiloskop ekranına kuruldu.', 'arcade'),

('Sektörü asıl başlatan 1972 tarihli oyun ve firması hangisidir?',
 '["Atari''nin Pong''u","Taito''nun Space Invaders''ı","Nintendo''nun Donkey Kong''u","Sega''nın Frogger''ı"]', 0,
 '1971''de Computer Space ilk jetonlu oyun oldu, ama sektörü ticari olarak ayağa kaldıran 1972''de Atari''nin Pong''u oldu.', 'arcade'),

('1978 tarihli Space Invaders hangi kültürü başlattı?',
 '["Çok oyunculu ağ oyunlarını","Ev konsolu pazarını","Açık dünya tasarımını","Yüksek skor kültürünü ve arcade çılgınlığını"]', 3,
 'Taito''nun istilacıları, salonlarda skor tablosuna isim yazdırma alışkanlığını yerleştirdi.', 'arcade'),

('Pac-Man''de köşelerdeki büyük "güç hapını" yemek ne yapar?',
 '["Ekstra can verir","Hayaletleri maviye çevirir ve bir süre yenebilir hâle getirir","Labirenti yeniden düzenler","Hızı kalıcı olarak artırır"]', 1,
 'Avlanan avcıya dönüşür: kısa bir süre boyunca hayaletlerden kaçmak yerine onları kovalarsın.', 'arcade'),

('1991''de çıkan Street Fighter II hangi türün çılgınlığını başlattı?',
 '["Yarış oyunları","Platform oyunları","Dövüş oyunları","Bulmaca oyunları"]', 2,
 'Altın çağın salonlarını dolduran isimlerden biri olarak dövüş oyunu türünü patlattı.', 'arcade'),

-- ── ayna-noronlari ──────────────────────────────────────
('Ayna nöronları hangi hayvanda ve beynin hangi bölgesinde bulundu?',
 '["Makak maymununda, premotor korteksteki F5 bölgesinde","Farede, hipokampüste","İnsanda, görme korteksinde","Şempanzede, beyincikte"]', 0,
 'Parma''daki laboratuvarda makak maymununun premotor korteksine (F5) takılı elektrotlar, hem yaparken hem izlerken ateşleyen hücreleri gösterdi.', 'ayna-noronlari'),

('Keşif ne zaman ve nerede yapıldı?',
 '["1960''larda Cambridge''de","1970''lerde Moskova''da","2000''lerde Tokyo''da","1990''ların başında Parma''da"]', 3,
 'İtalya''nın Parma kentindeki laboratuvarda, üzüm tanesine uzanan maymun üzerinde yapılan kayıtlarla ortaya çıktı.', 'ayna-noronlari'),

('Keşfi yapan ekibin başındaki isim kimdir?',
 '["Giacomo Rizzolatti","Antonio Damasio","Oliver Sacks","Eric Kandel"]', 0,
 'Rizzolatti; Gallese, Fogassi, Fadiga ve di Pellegrino ile birlikte çalıştı.', 'ayna-noronlari'),

('Birinin bardağı kavradığını izlerken beyninde ne olur?',
 '["Yalnızca görme korteksi çalışır","Hiçbir motor etkinlik olmaz","«Bardağı kavra» motor programının bir kopyası, kol kımıldamadan sessizce çalışır","Kas kasılması refleks olarak başlar"]', 2,
 'Bir eylemi gözlemlemek, o eylemi yapmakla ilgili motor devreyi kısmen etkinleştirir; beyin dışarıdaki hareketi kendi eylem sözlüğüne çevirir.', 'ayna-noronlari'),

('Ayna nöronunu "sıradan" bir motor nörondan ayıran şey nedir?',
 '["Yalnızca uykuda çalışması","Eylemin failinin kim olduğuyla ilgilenmemesi","Yalnızca insanlarda bulunması","Ateşlemesinin çok yavaş olması"]', 1,
 'Aynı hücre, eylemi sen yaptığında da başkasının yaptığını izlediğinde de ateşler — "yapmak" ile "görmek" arasındaki sınırı umursamaz.', 'ayna-noronlari'),

-- ── black-hole ──────────────────────────────────────────
('Bir kara delik nasıl oluşur?',
 '["İki gezegenin çarpışmasıyla","Bir süpernovanın gazının soğumasıyla","Dev bir yıldızın yakıtı bitip kendi içine çökmesiyle","Evrenin genişlemesiyle kendiliğinden"]', 2,
 'Çöküş durdurulamaz bir noktaya geldiğinde kara delik doğar.', 'black-hole'),

('"Olay ufku" (event horizon) nedir?',
 '["Kara deliğin merkezindeki sonsuz yoğunluk noktası","Etrafında dönen gaz ve toz bulutu","Kara deliğin görünen yüzeyi","Geçen hiçbir şeyin, ışık dahil, geri dönemediği sınır"]', 3,
 'Bu sınırın ötesine geçen hiçbir şey evrenin geri kalanına dönemez.', 'black-hole'),

('Kara deliğin merkezindeki "tekillik" için makalede ne söyleniyor?',
 '["Sonsuz yoğunluk noktasıdır ve bildiğimiz fizik yasaları orada işlemez","Boş bir küredir","Sıradan bir yıldız çekirdeğidir","Işığın yavaşladığı bir bölgedir"]', 0,
 'Tekillikte bilinen fizik yasaları geçerliliğini yitirir.', 'black-hole'),

('Kara deliklerin sonu ne olacak?',
 '["Sonsuza kadar aynı kalacaklar","Patlayıp yeni yıldızlar oluşturacaklar","Hawking''e göre çok yavaş radyasyon yayarak buharlaşacaklar","Birleşip tek bir kara delik olacaklar"]', 2,
 'Trilyonlarca yıl sonra yıldızlar söndüğünde evrende yalnızca kara delikler kalacak; onlar da yavaşça buharlaşacak.', 'black-hole'),

('Makaleye göre kara deliğin "en cüretkâr teorik akrabası" nedir?',
 '["Nötron yıldızı","Solucan deliği (Einstein–Rosen köprüsü)","Beyaz cüce","Kuazar"]', 1,
 'Uzayda iki uzak noktayı birbirine bağlayan bir kestirme yol vaat eder.', 'black-hole'),

-- ── carthage ────────────────────────────────────────────
('Kartaca''nın dairesel askeri limanı kaç savaş gemisi barındırabiliyordu?',
 '["50","120","220","400"]', 2,
 'Ortasındaki adada gemilerin bakım ve onarım için kızaklarla çekildiği tersane bulunuyordu.', 'carthage'),

('Kartaca''nın iki limanı nasıl konumlanmıştı?',
 '["İkisi de şehrin dışındaydı","Öndeki dikdörtgen ticari liman, arkasındaki dairesel askeri limanı düşman gözünden gizliyordu","Yan yana, ikisi de açıktı","Tek liman iki bölmeye ayrılmıştı"]', 1,
 'Ticari liman tüccar gemilerine hizmet verirken, arkasındaki dairesel askeri liman gizli kalıyordu.', 'carthage'),

('Birinci Pön Savaşı nasıl başladı?',
 '["Kartaca Roma''ya savaş ilan ederek","Roma''nın planlı imparatorluk seferiyle","Bir deniz kazası yüzünden","Sicilya''daki yerel bir krizin kontrolden çıkmasıyla"]', 3,
 '"Mamertinler" adlı paralı asker grubunun Messana''yı ele geçirmesi, önce Kartaca''dan sonra Roma''dan yardım istenmesiyle zincirleme bir savaşa dönüştü.', 'carthage'),

('Askeri limanın ortasındaki adada ne bulunuyordu?',
 '["Tapınak","Amiralin gözetleme kulesi ve tersane","Hapishane","Tahıl ambarı"]', 1,
 'Ada hem komuta noktası hem de gemilerin kızaklarla çekildiği bakım alanıydı.', 'carthage'),

('Kartaca limanlarının en şaşırtıcı özelliği neydi?',
 '["Doğal bir koy değil, anakara oyularak yapılmış yapay bir kompleks olmaları","Tamamen ahşaptan yapılmış olmaları","Yalnızca yazın kullanılabilmeleri","Roma tarafından inşa edilmiş olmaları"]', 0,
 'Yüz binlerce metreküp toprak çıkarılarak tarihin en etkileyici yapay liman komplekslerinden biri kuruldu.', 'carthage'),

-- ── einstein-rosen ──────────────────────────────────────
('"Solucan deliği" adını kim koydu?',
 '["Albert Einstein","Karl Schwarzschild","John Archibald Wheeler","Kip Thorne"]', 2,
 'Wheeler adı 1957''de koydu; 1962''de Robert Fuller ile birlikte klasik köprünün ışık bile geçemeden çöktüğünü gösterdi.', 'einstein-rosen'),

('Einstein''ın denklemlerinin ilk tam çözümünü kim, hangi koşulda buldu?',
 '["Karl Schwarzschild, 1916''da Birinci Dünya Savaşı cephesindeyken","Nathan Rosen, bir laboratuvarda","Stephen Hawking, 1970''lerde","Edwin Hubble, bir gözlemevinde"]', 0,
 'Köprünün matematiği bu çözümden çıktı.', 'einstein-rosen'),

('Morris ve Thorne 1988''de bir solucan deliğinin açık tutulabilmesi için neyin gerektiğini tarif etti?',
 '["Çok güçlü bir manyetik alan","Sürekli enerji pompalanması","Egzotik madde","Çok büyük bir kütle"]', 2,
 'Aynı makale, geçilebilir bir solucan deliğinin zaman makinesi sorununu da açtı.', 'einstein-rosen'),

('Hawking''in "kronoloji koruma varsayımı" ne öne sürer?',
 '["Zaman yolculuğu serbesttir","Fizik yasaları, zaman döngüsü kuracak her düzeneği daha kurulmadan bozuyor olabilir","Geçmişe yalnızca bilgi gönderilebilir","Solucan delikleri hiç var olamaz"]', 1,
 'Yani evren, nedensellik çelişkilerini kendi kurallarıyla engelliyor olabilir.', 'einstein-rosen'),

('Makalede geçen "ER = EPR" fikri kime aittir?',
 '["Einstein ve Rosen","Morris ve Thorne","Wheeler ve Fuller","Maldacena ve Susskind"]', 3,
 '2013 tarihli "Cool horizons for entangled black holes" çalışmasıyla, solucan deliği geometrisi ile kuantum dolanıklığı arasında bir bağ önerildi.', 'einstein-rosen'),

-- ── ekonomi ─────────────────────────────────────────────
('Makaledeki tanıma göre faiz nedir?',
 '["Devletin aldığı bir vergi","Paranın kirası — borçlu için maliyet, yatırımcı için gelir","Bankaların kâr payı","Enflasyonun başka bir adı"]', 1,
 'Para "bedava" değildir: kullanmanın bir bedeli, beklemenin bir getirisi vardır.', 'ekonomi'),

('Nominal faiz ile reel faiz arasındaki fark nedir?',
 '["İkisi aynı şeydir","Nominal faiz yalnızca devlet tahvillerinde kullanılır","Nominal ilan edilen ham orandır; reel, satın alma gücündeki gerçek değişimi gösterir","Reel faiz her zaman daha yüksektir"]', 2,
 'Asıl önemli olan reel faizdir: alım gücünü gerçekten artıran ya da eriten odur.', 'ekonomi'),

('"Negatif faiz" ne anlama gelir?',
 '["Bankanın müşteriye para vermesi","Faizin sıfır olması","Kredi verilmemesi","Paranın bankada durdukça değer kaybetmesi"]', 3,
 'Genelde enflasyonun faiz oranından yüksek olduğu durumlarda birikim reel olarak erir.', 'ekonomi'),

('Emtia (commodity) nasıl ikiye ayrılır?',
 '["Sert emtialar (madenler, enerji) ve yumuşak emtialar (tarım ürünleri)","Yerli ve ithal","Ucuz ve pahalı","Dayanıklı ve dayanıksız"]', 0,
 'Altın, gümüş, petrol, doğalgaz sert; buğday, kahve gibi tarım ürünleri yumuşak emtia sayılır.', 'ekonomi'),

('Merkez bankasının belirlediği "politika faizi" ekonomide ne işe yarar?',
 '["Yalnızca konut kredilerini etkiler","Ekonomideki tüm faizlerin çapasıdır","Döviz kurunu sabitler","Vergi oranlarını belirler"]', 1,
 'Diğer faizler bu orana göre konumlanır.', 'ekonomi'),

-- ── greece ──────────────────────────────────────────────
('Olimpiyat''ların ilk ve en prestijli dalı olan "stadion" neydi?',
 '["Yaklaşık 192 metrelik pistte koşu","Disk atma","Uzun atlama","Cirit atma"]', 0,
 'Pistin uzunluğu, "stadyum" kelimesinin de kaynağıdır.', 'greece'),

('Pankration hangi kurallarla yapılırdı?',
 '["Yalnızca ayakta dövüşülürdü","Sadece tekme serbestti","Isırma ve göz çıkarma dışında her şey serbestti","Temas yasaktı"]', 2,
 'Güreş ile boksun karışımı, tam temaslı bir dövüş sporuydu.', 'greece'),

('Delphi kehanet merkezi hangi tanrıya adanmıştı?',
 '["Zeus","Apollon","Athena","Hermes"]', 1,
 'Güneş, müzik ve kehanet tanrısı Apollon''un en ünlü kült merkeziydi.', 'greece'),

('Sparta''nın özellikle sevdiği tanrı hangisiydi?',
 '["Dionysos","Hermes","Poseidon","Ares"]', 3,
 'Savaşın ve şiddetin tanrısı, askerî bir toplum için doğal bir seçimdi.', 'greece'),

('Büyük İskender Anadolu''ya geçtikten sonraki ilk büyük zaferini nerede kazandı?',
 '["Granikos Nehri''nde","Issos''ta","Gaugamela''da","Thermopylai''de"]', 0,
 'Aristoteles''in öğrencisi olarak yetişen İskender, Pers kuvvetlerini burada bozguna uğrattı.', 'greece'),

-- ── tibbi ───────────────────────────────────────────────
('2009''da Japon araştırmacılar insan bedeniyle ilgili neyi gösterdi?',
 '["Beden gözle görülemeyecek kadar zayıf bir ışık yayıyor","Beden gece ısı kaybetmiyor","Beden manyetik alan üretmiyor","Beden ses dalgası yayıyor"]', 0,
 'Ultra hassas kameralarla, ışık geçirmeyen bir odada beş gönüllü izlenerek ölçüldü.', 'tibbi'),

('Trepanasyon kafataslarında bulunan hangi ayrıntı şaşırtıcıdır?',
 '["Deliklerin hep aynı boyutta olması","Deliklerin kenarlarında kemiğin yeniden büyümüş olması","Deliklerin metal aletle açılmış olması","Deliklerin ölümden sonra açılmış olması"]', 1,
 'Kemik yenilenmesi, hastaların önemli bir kısmının işlemi atlatıp yıllarca yaşadığını gösterir.', 'tibbi'),

('Adı bilinen ilk hekim kimdir?',
 '["Hipokrat","Galen","İbn Sina","İmhotep"]', 3,
 'MÖ 2600 civarında yaşadı, Kral Djoser''in baş danışmanıydı ve tarihin ilk piramitlerinden birini tasarladı.', 'tibbi'),

('İmhotep''in şifa verme ünü ölümünden sonra nereye vardı?',
 '["Unutuldu","Hem Mısırlılar hem Yunanlar onu tanrı mertebesine yükseltti","Yalnızca Yunanlar onu andı","Adı yasaklandı"]', 1,
 'Bir hekimin tanrılaştırılması, tıbbın antik dünyadaki konumunu da gösterir.', 'tibbi'),

('Penisilinin keşfinden bu yana kaç hayat kurtardığı tahmin ediliyor?',
 '["Yaklaşık 1 milyon","Yaklaşık 20 milyon","200 milyondan fazla","Tam olarak bilinmiyor, tahmin yapılmamıştır"]', 2,
 'İlk gerçek antibiyotik sayılır ve modern tıbbın dönüm noktalarındandır.', 'tibbi'),

-- ── turkler ─────────────────────────────────────────────
('Göktürklerin kullandığı runik alfabenin özelliği neydi?',
 '["Yalnızca sağdan sola yazılırdı","Çinceden alınmıştı","38 harfliydi ve iki yönde de yazılabiliyordu","Yalnızca rakamlardan oluşuyordu"]', 2,
 'Proto-Türk yazısından geliştirilen özgün bir sistemdi.', 'turkler'),

('Göktürk yazıtları nerede bulunur?',
 '["Moğolistan''daki Orhun Vadisi''nde","Kırım''da","Horasan''da","Kaşgar''da"]', 0,
 'Taşlara kazınan metinler, Türk dilinin en eski uzun yazılı kaynaklarındandır.', 'turkler'),

('İslam öncesi Türklerde Tengri neyi temsil ederdi?',
 '["Yeraltı dünyasını","Savaş tanrısını","Bereket tanrıçasını","Sonsuz mavi göğü kişileştiren evrenin efendisini"]', 3,
 'Tengricilik inancında şamanlar (kam), bu dünya ile ruhlar âlemi arasındaki aracılardı.', 'turkler'),

('Atilla''nın Roma karşısındaki konumu için makalede ne söyleniyor?',
 '["Yalnızca Batı Roma''ya saldırdı","Hem Doğu hem Batı Roma''yı vergi ödemeye mecbur etti","Roma ile hiç savaşmadı","Roma''ya vergi ödedi"]', 1,
 'Konstantinopolis''i iki kez kuşattı; Hunları bir korku hikâyesi değil bir devlet olarak anlatan ayrı bir makale de var.', 'turkler'),

('Büyük Türk devletlerinin ekonomik gücü ağırlıkla neye dayanıyordu?',
 '["Ticaret yollarını denetlemeye","Deniz aşırı sömürgelere","Madencilik tekeline","Tarımsal ihracata"]', 0,
 'Ticaret yollarının denetimi, çağların en güçlü ekonomik kaldıraçlarından biriydi.', 'turkler')

) as v(question, options, correct_index, explanation, article_slug)
where not exists (
  select 1 from public.quiz_questions q
  where q.article_slug = v.article_slug and q.question = v.question
);

-- Kontrol: makale başına soru sayısı ve doğru cevap dağılımı
-- select article_slug, count(*) from public.quiz_questions where article_slug is not null group by 1 order by 2;
-- select correct_index, count(*) from public.quiz_questions group by 1 order by 1;
