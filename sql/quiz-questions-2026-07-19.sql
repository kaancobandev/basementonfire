-- ════════════════════════════════════════════════════════════════════════
--  MAKALE SONU QUIZ SORULARI — 2026-07-19
--  27 makale x 3 soru = 81 soru. Supabase SQL Editor'de BİR KEZ çalıştır.
--  Idempotent: bir makalenin sorusu zaten varsa o makale ATLANIR.
--  Zaten sorusu olan 5 makale (doppler, endosimbiyoz, dogal-secilim,
--  bakteriyofaj, kaligrafi) bu dosyada YOK — dokunulmaz.
-- ════════════════════════════════════════════════════════════════════════

-- ── black-hole ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Bir kara deliğe ayaklarınız önde düşerseniz neden "spagetti" gibi uzarsınız?', '["Ayaklarınıza etki eden çekim kuvveti başınıza etki edenden çok daha güçlü olduğu için","Olay ufkundaki radyasyon vücudu erittiği için","Toplanma diskinin milyonlarca derecelik sıcaklığı bedeni gerdiği için","Kara delik çok hızlı döndüğü ve sizi savurduğu için"]'::jsonb, 0, 'Sizi uzatan şey çekimin şiddeti değil, vücudunuzun iki ucu arasındaki çekim FARKI. Aynı fark Ay ile Dünya arasında da var; orada okyanusları gerdiği için ona gelgit kuvveti diyoruz.', 'black-hole'),
  ('Makaledeki "Yoğunluk Deneyi"ne göre, Dünya''yı bir kara deliğe dönüştürmek için hangi boyuta sıkıştırmak gerekir?', '["Yaklaşık 1.000 km çapında bir küreye","Bir futbol sahası büyüklüğüne","Yaklaşık 3 cm çapında, bir bilye boyutuna","Bir ev büyüklüğünde bir kütleye"]'::jsonb, 2, 'Kara delik olmak kütleyle değil, o kütlenin ne kadar küçük hacme tıkıştırıldığıyla ilgili. Dünya''nın kütlesi aynı kalır, sadece 12.742 km''lik çapı bilye boyutuna iner.', 'black-hole'),
  ('Güneşimiz aniden aynı kütlede bir kara deliğe dönüşseydi Dünya''ya ne olurdu?', '["Anında içine çekilir, birkaç dakikada yutulurdu","Spagettileşerek uzun bir şerit hâline gelirdi","Yörüngesi hızla daralır ve spiral çizerek düşerdi","Yörüngesinde dönmeye devam eder, sadece karanlıkta kalırdık"]'::jsonb, 3, 'Çekim kuvvetini belirleyen kütledir, cismin karanlık olması değil; kütle değişmediği için yörünge de değişmez. Kara delikleri "elektrikli süpürge" gibi gösteren filmler bu yüzden yanıltıcı.', 'black-hole')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'black-hole');

-- ── turkler ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Makaledeki fotoğrafta gördüğünüz Çin Seddi, aslında kime karşı örülmüştü?', '["Hunlara (Xiongnu) karşı, MÖ 3. yüzyılda","Moğollara karşı, 16. yüzyılda Ming döneminde","Göktürklere karşı, 6. yüzyılda","Selçuklulara karşı, 11. yüzyılda"]'::jsonb, 1, 'Turistlerin gezdiği taş sur Ming yapımıdır. Hunlara karşı çekilen Qin–Han surları çok daha eskidir ve çoğu yerde sadece toprak yığınından ibarettir.', 'turkler'),
  ('Fatih, 1453''te Konstantinopolis''i aldıktan sonra unvanlarına "Kayser-i Rûm"u ekledi. Bu unvan neye dayanıyordu?', '["Bizans ordusunun teslim şartlarına","Papa''nın tanıdığı bir hükümdarlık sıfatına","Türk kağanlık geleneğindeki eski bir sana","Roma imparatorluk unvanına, yani Sezar''ın adına"]'::jsonb, 3, '"Kayser" doğrudan Caesar''dan gelir. Roma''da bıçaklanan bir adamın aile adı, on beş asır sonra bir Osmanlı padişahının resmî unvanı hâline gelmişti.', 'turkler'),
  ('"Türk" kelimesini ilk kez resmî devlet adı olarak taşıyan siyasi yapı hangisiydi?', '["Göktürk Kağanlığı","Hun İmparatorluğu","Büyük Selçuklu Devleti","Osmanlı İmparatorluğu"]'::jsonb, 0, '552''de kurulan Göktürkler bu adı devletin kendi adı yaptı. Aynı dönemin Orhun Yazıtları da Türkçenin bilinen en eski yazılı anıtlarıdır.', 'turkler')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'turkler');

-- ── rome ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('12 Levha Kanunu Roma hukukuna asıl olarak ne getirdi?', '["Roma''da o güne kadar hiç var olmayan, tamamen yeni bir kurallar bütünü","Plebleri patriciilerle her alanda tam eşit vatandaş yapan bir reform","O güne dek sözlü uygulanan örf ve adetlerin yazıya dökülüp herkesin görebileceği bir meydana asılması","Senato üye sayısının 100''den 300''e çıkarılması"]'::jsonb, 2, 'Kanunun gücü içeriğinin yeniliğinden değil, görünür olmasından geliyordu: kural artık soyluların hafızasında değil, taştaydı. Eşitlik yine de sınırlıydı — XI. Levha plebler ile patriciilerin evlenmesini hâlâ yasaklıyordu.', 'rome'),
  ('Roma''nın simgesi Kapitol Kurdu heykelinde, kurdu emen ikiz bebek figürleri için makale ne söylüyor?', '["Heykele çok sonradan, 15. yüzyılda eklendiler","Kurtla birlikte tek parça hâlinde döküldüler","Etrüsk ustalarının imzasını taşıyorlar","2007''deki radyokarbon testi antik olduklarını kanıtladı"]'::jsonb, 0, 'Romulus ve Remus figürleri Rönesans döneminde eklendi. Kurdun kendisi de tartışmalı: uzun süre Etrüsk işi sanıldı, ancak 2007''deki radyokarbon tarihlemesi Orta Çağ''ı işaret etti.', 'rome'),
  ('Tusculum portresini Caesar''ın diğer büstlerinden ayıran şey nedir?', '["Diktatörlük yıllarında altın kaplanmış olması","Onu sağken görmüş biri tarafından yapılmış, bilinen tek çağdaş büst olması","Ölümünün hemen ardından Forum''a dikilmiş olması","Augustus''un sipariş ettiği ilk resmî portre olması"]'::jsonb, 1, 'Bu yüzden filmlerdeki muzaffer çeneyi değil, çökük yanaklı ve yorgun bir adamı gösterir. Sonraki büstlerin çoğu Caesar''ı hiç görmemiş heykeltıraşların idealleştirmesidir — aynı mesafe Maccari''nin 1900 yıl sonra hayal ettiği Senato freskinde de vardır.', 'rome')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'rome');

-- ── greece ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Sparta''nın simgesi hâline gelmiş miğferli hoplit büstü hakkında makalede ne söyleniyor?', '["Leonidas''ın Termopilai''ye gitmeden önce kendi yaptırdığı portresidir","Sparta''da bulunmuş, kaidesinde Leonidas''ın adı yazılı bir mezar anıtıdır","Leonidas''ın ölümünden sonra minnet borcuyla Atinalıların yaptırdığı bir anıttır","Kime ait olduğu bilinmiyor; \"Leonidas\" adı 1925 kazı ekibinin taktığı bir lakaptan ibaret"]'::jsonb, 3, 'Büstün kimliğine dair hiçbir yazıt ya da kanıt yok. Bir kazı ekibinin verdiği takma ad, yüzyıl içinde ders kitaplarına "gerçek" gibi yerleşti.', 'greece'),
  ('Artemision Bronzu''nun Zeus mu yoksa Poseidon mu olduğu neden hâlâ tartışılıyor?', '["Heykel deniz altında o kadar aşınmış ki yüz hatları tamamen kaybolmuş","Fırlatmaya hazırlandığı nesne elinde kalmamış: yıldırımsa Zeus, üç dişli mızraksa Poseidon","Heykelin üzerindeki yazıt iki tanrının adını birden taşıyor","Antik kaynaklar heykelin iki tanrıya birden adandığını yazıyor"]'::jsonb, 1, 'Antik heykellerde kimlik çoğu zaman elde tutulan simgeden okunur; o simge kaybolunca tanrının adı da askıda kalır. Çoğunluk Zeus diyor ama kesinleşmiş değil.', 'greece'),
  ('İssus Savaşı''nı gösteren ünlü mozaik hakkında makalede belirtilen ayrıntı nedir?', '["Savaşa katılan bir askerin anlatımıyla, olaydan hemen sonra yapılmıştır","İskender''in kendi sarayı için ısmarladığı resmî bir zafer portresidir","Olaydan yaklaşık iki yüzyıl sonra Pompeii''de yapılmıştır; kayıp bir Hellenistik tabloyu kopyaladığı düşünülür","Bizans döneminde, eski bir madeni paradaki sahne büyütülerek üretilmiştir"]'::jsonb, 2, 'Yani mozaik olayın görgü tanığı değil, bir kopyanın kopyası. Antik görsellerin çoğu böyle: bize ulaşan şey orijinal değil, sonraki çağların yeniden üretimi.', 'greece')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'greece');

-- ── carthage ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Kartaca''nın 220 savaş gemisi barındıran ünlü dairesel askeri limanı nasıl ortaya çıktı?', '["Anakaranın kalbi oyulup yüz binlerce metreküp toprak çıkarılarak, tamamen insan eliyle","Doğal bir koyun ağzı taş setlerle daraltılarak","Bir depremde çöken arazinin deniz suyuyla dolmasıyla","Bir nehir ağzının derinleştirilip genişletilmesiyle"]'::jsonb, 0, 'Liman doğal bir oluşum değil, dönemin en iddialı mühendislik projelerinden biriydi. Dairesel havuzun ortasındaki adada tersane ve amiralin gözetleme kulesi vardı; ticari liman ise onu düşman gözünden gizliyordu.', 'carthage'),
  ('Hannibal''ın Alpler''i aşırdığı 37 filin akıbeti ne oldu?', '["Cannae''de Roma ordusunun merkezini yararak savaşın kaderini belirlediler","Alp geçidinde uçurumdan düşerek telef oldular","Neredeyse tamamı Kuzey İtalya''nın ilk kışına dayanamayıp öldü","Romalılar tarafından ele geçirilip kendi ordularında kullanıldı"]'::jsonb, 2, 'Filler askeri bir üstünlükten çok psikolojik şok silahıydı; Trebia''da Roma süvarisini dağıtmaları neredeyse tek başarılarıydı. Geriye yalnızca Hannibal''ın binek fili Surus kaldı.', 'carthage'),
  ('Makaleye göre Roma''yı Üçüncü Pön Savaşı''na iten asıl sebep neydi?', '["Kartaca''nın gizlice yeni bir savaş filosu inşa etmesi","Hannibal''ın İtalya''ya ikinci bir sefer hazırlığı","Kartaca''nın Sicilya''ya yeniden asker çıkarması","Kartaca''nın ticaret ve tarımla şaşırtıcı hızda zenginleşmesi"]'::jsonb, 3, 'İkinci Pön Savaşı Kartaca''yı askeri olarak çökertmişti; şehri hedef haline getiren şey barış zamanındaki ekonomik dirilişiydi. Cato''nun her konuşmasını "Carthago delenda est" ile bitirmesinin arkasında bu rekabet korkusu vardı.', 'carthage')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'carthage');

-- ── ekonomi ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Türkiye''deki transfer yöntemlerinden "havale" tam olarak neyi tanımlar?', '["Farklı bankalar arasında yapılan Türk Lirası transferi","Aynı bankanın iki farklı hesabı arasındaki para transferi","Yurt dışına döviz gönderimi için kullanılan sistem","Merkez bankasının işlettiği anlık ödeme altyapısı"]'::jsonb, 1, 'Havale banka içi kaldığı için genelde anında ve ücretsizdir; farklı bankalar arası TL transferi ise EFT, onun 7/24 saniyeler süren hâli ise FAST''tir.', 'ekonomi'),
  ('Bir ekonominin "üst üste iki çeyrek küçülmesi" tanımının resesyon için statüsü nedir?', '["Dünya genelinde bağlayıcı olan resmî tanımdır","Yalnızca enflasyon yüksekken geçerli sayılan bir ölçüttür","Merkez bankalarının faiz kararını otomatik tetikleyen kuraldır","Yaygın ve pratik bir kabuldür; resmî kararlar daha çok göstergeye bakar"]'::jsonb, 3, 'ABD''de NBER gibi kurumlar istihdam, gelir ve üretimi birlikte değerlendirir. Yani iki çeyrek kuralı hızlı bir kestirme, kesin bir sınır değil.', 'ekonomi'),
  ('Fiyatların genel olarak düştüğü deflasyon neden tehlikeli sayılır?', '["İnsanlar \"daha da ucuzlar\" diye harcamayı erteler, ekonomi yavaşlar","Para biriminin yabancı paralar karşısında resmen değer kaybetmesine yol açar","İthalatı pahalılaştırıp dış borç yükünü büyütür","Bankaların likit varlıklarını nakde çevirmesini imkânsız kılar"]'::jsonb, 0, 'Ucuzlama kulağa iyi gelse de ertelenen harcama talebi kurutur; bu yüzden merkez bankaları sıfır enflasyonu değil, düşük ama pozitif bir enflasyonu hedefler.', 'ekonomi')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'ekonomi');

-- ── einstein-rosen ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Einstein ve Rosen 1935''te bu "köprü"yü aslında ne için ortaya attı?', '["Yıldızlararası seyahat için bir kestirme yol tasarlamak","Kara deliklerin nasıl buharlaştığını açıklamak","Elektron gibi parçacıkları geometrik olarak modellemek","Evrenin genişlediğini kanıtlamak"]'::jsonb, 2, 'Amaç geçit değil, parçacıkları uzay-zaman geometrisiyle açıklamaktı. "Solucan deliği" adı bile 22 yıl sonra, 1957''de John Wheeler''dan geldi.', 'einstein-rosen'),
  ('Klasik (Schwarzschild) solucan deliğinden neden geçilemez?', '["Boğaz, ışık bile karşıya varamadan çöker","Girişini bir olay ufku tamamen kapatır","İçindeki basınç canlıyı ezer ama madde geçebilir","Öbür ucu her zaman aynı noktaya açılır"]'::jsonb, 0, 'Fuller ve Wheeler 1962''de bunu matematiksel olarak gösterdi: çöküş o kadar hızlıdır ki içeri giren gezgin karşı tarafa değil tekilliğe çarpar.', 'einstein-rosen'),
  ('Makaleye göre bir solucan deliği teoride nasıl zaman makinesine dönüşebilir?', '["Boğaz yarıçapı sürekli büyütülerek","İki ağzından biri ışık hızına yakın hareket ettirilerek","İçine negatif kütleli bir parçacık atılarak","İki ağzı birbirine değecek kadar yaklaştırılarak"]'::jsonb, 1, 'Hareket eden ağızda zaman daha yavaş akar, böylece iki ağız arasında zaman farkı birikir (Morris, Thorne ve Yurtsever, 1988). Hawking ise doğanın buna "kronoloji koruma" ile izin vermeyebileceğini savundu.', 'einstein-rosen')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'einstein-rosen');

-- ── arcade ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('1958''de yapılan Tennis for Two hangi ekranda oynanıyordu?', '["Siyah beyaz bir televizyon tüpünde","Bir radar ekranında","Delikli kart yazıcısının çıktısında","5 inçlik bir osiloskop ekranında"]'::jsonb, 3, 'William Higinbotham, Brookhaven Ulusal Laboratuvarı''nın ziyaretçi gününü canlandırmak için bir analog bilgisayarı laboratuvar osiloskobuna bağladı. Bu gösteri Pong''dan tam 14 yıl önceydi.', 'arcade'),
  ('1981 tarihli Donkey Kong''da, sonradan Mario diye tanınacak karakterin o zamanki adı neydi?', '["Luigi","Jumpman","Pauline","Popeye"]'::jsonb, 1, 'Shigeru Miyamoto''nun oyununda karakterin tek yeteneği zıplamaktı, adı da buradan geliyordu. Donkey Kong aynı zamanda platform türünün doğduğu yer sayılır.', 'arcade'),
  ('Makaleye göre ilk ticari jetonlu (coin-op) video oyunu hangisidir?', '["Pong (1972)","Space Invaders (1978)","Computer Space (1971)","Spacewar! (1962)"]'::jsonb, 2, 'Jetonlu makineye giren ilk oyun Computer Space''ti; sektörü asıl patlatan Pong ise bir yıl sonra geldi. Spacewar! ise ticari değil, MIT''de PDP-1 üzerinde çalışan bir kampüs efsanesiydi.', 'arcade')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'arcade');

-- ── internet ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Switch (anahtar) ile router (yönlendirici) arasındaki temel fark nedir?', '["Switch kablosuz bağlantı sağlar, router kablolu bağlantı sağlar","Switch aynı yerel ağdaki cihazları MAC adresine göre bağlar; router farklı ağları IP adresine göre birbirine bağlar","Switch veriyi ağdaki herkese yollar; router sadece doğru porta yollar","Switch trafiği şifreler; router şifresiz iletir"]'::jsonb, 1, 'Switch OSI''nin 2. katmanında (MAC), router 3. katmanında (IP) çalışır. Veriyi ayrım yapmadan herkese yollayan cihaz ise 1. katmandaki hub''dır — bu yüzden verimsizdir.', 'internet'),
  ('Tarayıcının ürettiği veri, ağ katmanlarında aşağı doğru inerken ne olur?', '["Her katmanda biraz daha sıkıştırılıp küçültülür","Her katmanda yeniden şifrelenir, en altta tek bir şifreli blok kalır","Yedeklenmek için ikiye bölünüp iki ayrı yoldan gönderilir","Her katman kendi başlığını ekler; veri sırasıyla segment, paket ve çerçeve hâline gelir"]'::jsonb, 3, 'Buna kapsülleme (encapsulation) denir: TCP port ve sıra numarasını, IP kaynak/hedef adresini, Ethernet ise MAC bilgisini ekler. Fiziksel katmanda hepsi 0 ve 1 dizisine dönüşür.', 'internet'),
  ('DSL''de telefon görüşmesi ile internet, aynı bakır hat üzerinden nasıl aynı anda yürüyebiliyor?', '["İkisi farklı frekans aralıklarını kullandığı için","Modem konuşmayı kısa süre bekletip aralarda veri gönderdiği için","Telefon hattının içinde ayrıca ince bir fiber tel bulunduğu için","Ses de veri de aynı paketlerin içine sığdırıldığı için"]'::jsonb, 0, 'Konuşma düşük, veri yüksek frekansı kullanır; bu yüzden çakışmazlar. DSL''in zayıf yanı başka: santrale olan mesafe arttıkça hız düşer.', 'internet')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'internet');

-- ── sezar ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Korsanlar genç Caesar için yirmi talent fidye isteyince ne oldu?', '["Fidyeyi düşürmeleri için pazarlık etti","Kaçmak için gemiden atladı","Sessizce kabul edip beklemeye başladı","Az bulup elli istemelerini söyledi"]'::jsonb, 3, 'Yirmi talenti kendisi için hakaret saydı. Serbest kalınca da söylediğini yaptı ve gülüp geçtikleri tehdidini yerine getirdi.', 'sezar'),
  ('Caesar''ın İskender karşısında ağladığı meşhur sahne için makale ne diyor?', '["Suetonius ve Plutarkhos''un anlattığı, aslında birbirinden farklı iki hikâyedir","Caesar''ın kendi yazdığı raporda ayrıntısıyla geçer","Yalnızca 19. yüzyılda uydurulmuş bir efsanedir","Dört antik kaynağın tamamı aynı ayrıntılarla aktarır"]'::jsonb, 0, 'Suetonius sahneyi Gades''te bir heykel önünde ve Caesar kvestörken anlatır; Plutarkhos ise bir kitap okurken ve yıllar sonra. İki bin yıldır tek sahne sandığımız şey iki ayrı anlatı.', 'sezar'),
  ('“Alea iacta est” (zar atıldı) sözü hakkında makalenin verdiği ayrıntı nedir?', '["Caesar bu sözü hiç söylememiş, Shakespeare uydurmuştur","Rubicon''u geçtikten günler sonra Senato''ya yazmıştır","Muhtemelen Latince değil Yunanca söylenmiş, komedya şairi Menandros''tan alıntıdır","Sözü söyleyen Caesar değil, ordusunun komutanlarından biridir"]'::jsonb, 2, 'Adam dünyayı ateşe verirken bile edebiyat referansı yapıyordu. Latince biçim, sonraki aktarımların yerleştirdiği hâldir.', 'sezar')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'sezar');

-- ── augustus ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Augustus''un kendi hayatını anlattığı Res Gestae metninin dünyadaki en eksiksiz kopyası nerededir?', '["Roma''daki Augustus Forumu''nda","Atina''daki Agora müzesinde","İskenderiye Kütüphanesi kalıntılarında","Ankara''da, Ulus''ta bir tapınağın duvarında"]'::jsonb, 3, 'Metnin Roma''daki aslı kayıp; bugün elimizdeki en tam hâli Ankara''daki Augustus Tapınağı''nın duvarlarında duruyor.', 'augustus'),
  ('MÖ 27''de Octavianus Senato''ya girip bütün yetkilerini geri verince ne oldu?', '["Senato teklifi kabul etti ve Cumhuriyet gerçekten yeniden kuruldu","Senatörler onu hain ilan edip sürgüne gönderdi","Senatörler paniğe kapılıp kalması için yalvardı; ona Augustus adı verildi","Ordu ayaklandı ve yetkileri zorla geri aldırdı"]'::jsonb, 2, 'Yetkiyi bırakmak, onu geri istetmenin en zarif yoluydu. Karşılığında aldığı ad, o güne dek yalnız tapınaklar için kullanılan bir kelimeydi.', 'augustus'),
  ('Üçlü yönetimin üçüncü adamı Lepidus''un sonu ne oldu?', '["Öldürülmedi; unvanları alınıp ev hapsine gönderildi ve unutuldu","Bir deniz savaşında yenilip idam edildi","Mısır''a kaçıp orada kral oldu","Augustus''un ortağı olarak ölene dek yönetimde kaldı"]'::jsonb, 0, 'Çok Augustusçu bir çözüm: adamı öldürmek onu şehit yapardı, yaşatıp hiçliğe çevirmek ise 24 yıl boyunca unutturdu.', 'augustus')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'augustus');

-- ── fatih ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Fatih''in ilk saltanatı (1444) nasıl sonuçlandı?', '["Konstantinopolis''i ilk kuşatmasıyla taçlandı","Kardeşiyle taht kavgasına girip Manisa''ya sürüldü","Haçlı ordusunu Varna''da yenerek tahtı sağlamlaştırdı","Halil Paşa yeniçerileri ayaklandırıp babasını geri çağırdı, çocuk tahttan indirildi"]'::jsonb, 3, 'On iki yaşındaki sultan tahttan indirildi. Aynı Halil Paşa, 1453''te fetihten yalnızca üç gün sonra idam edilecekti.', 'fatih'),
  ('Rumeli Hisarı''na (Boğazkesen) neden bu kadar stratejik önem atfedilir?', '["Kuşatma topları buradan şehre atış yapabiliyordu","Şehrin surlarını denizden kuşatmayı mümkün kılıyordu","Karşı kıyıdaki Anadolu Hisarı ile birlikte Karadeniz''den gelen gıda gemilerini iki ateş hattı arasına alıyordu","Osmanlı donanmasının kışlık limanı olarak kullanılıyordu"]'::jsonb, 2, 'Şehrin gıdası Karadeniz''den geliyordu. Kuşatma, ilk taş surlara atılmadan aylar önce, bir kaleyle başlamıştı.', 'fatih'),
  ('Makaleye göre Konstantinopolis surlarını 1123 yıl boyunca aşılmaz kılan hesabı bozan şey neydi?', '["Barut ve top: eski surların matematiği artık geçerli değildi","Şehirdeki nüfusun azalması","Bizans ordusunun dağılması","Deniz surlarının depremde yıkılması"]'::jsonb, 0, 'Üç katmanlı savunma merdivenle aşılamaz, deniz açık olduğu için açlıkla da düşürülemezdi. Denklemi değiştiren teknolojiydi.', 'fatih')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'fatih');

-- ── pirus ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('“Pirus zaferi” deyimi neyi anlatır?', '["Hiç kayıp verilmeden kazanılan kusursuz bir zaferi","Savaş alanında kazanılıp masada kaybedilen bir zaferi","Kazanana o kadar pahalıya mal olan bir zaferi ki bir tane daha kaldıramaz","Düşmanın kendi hatasıyla kaybettiği bir savaşı"]'::jsonb, 2, 'Pirus Romalıları yendi ama en iyi askerlerini ve komutanlarını kaybetti; Roma kayıplarını yenileyebiliyordu, o yenileyemiyordu.', 'pirus'),
  ('Danışmanı Kineas''ın Pirus''a sorduğu ve fetih planını çökerten soru neydi?', '["“Peki ya sonra?”","“Bu savaşın parasını kim ödeyecek?”","“Ordunun kaç askeri var?”","“Tanrılar bundan ne der?”"]'::jsonb, 0, 'Kineas her fetihten sonra aynı soruyu sordu; zincirin sonunda dinlenip keyif sürmek vardı — yani zaten yapılabilecek olan şey.', 'pirus'),
  ('Pirus nasıl öldü?', '["Roma lejyonlarıyla girdiği son meydan savaşında","Sicilya''da Kartacalılara esir düşerek","Kendi komutanları tarafından zehirlenerek","Argos''ta bir gece çarpışmasında, damdan atılan bir kiremitle"]'::jsonb, 3, 'Onlarca orduyu bozguna uğratan komutanı, oğlunu korumaya çalışan yaşlı bir kadının attığı kiremit sersemletti ve yerde öldürüldü.', 'pirus')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'pirus');

-- ── newton ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Newton''ın en verimli düşünce döneminin ortaya çıkma sebebi neydi?', '["Kraliyet tarafından araştırma için görevlendirilmesi","Avrupa turuna çıkıp diğer bilim insanlarıyla çalışması","Royal Society''nin ona kurduğu laboratuvar","1665-66''da vebanın Cambridge''i kapatması üzerine köyüne dönmesi"]'::jsonb, 3, 'Salgın yüzünden eve kapandığı 18 ayda, henüz 23 yaşındayken kalkülüs, optik ve kütleçekim üzerine çalıştı.', 'newton'),
  ('Newton''ın birinci yasası (eylemsizlik) gündelik hayatta neyi açıklar?', '["Otobüs frene basınca öne savrulmanızı","Suyun 100 derecede kaynamasını","Mıknatısın demiri çekmesini","Gökyüzünün mavi görünmesini"]'::jsonb, 0, 'Cisimler hâllerini değiştirmeye direnir: siz hareket hâlindeyken otobüs yavaşlar, bedeniniz hızını korumak ister.', 'newton'),
  ('Newton ikinci yasayı aslında hangi daha genel biçimde yazmıştı?', '["Kuvvet, kütle bölü ivmeye eşittir","Kuvvet, hız ile mesafenin çarpımıdır","Kuvvet, enerjinin karesine eşittir","Kuvvet, momentumun zamanla değişim hızıdır"]'::jsonb, 3, 'F = m·a bu genel ifadenin kütle sabitken aldığı hâldir. Roket gibi kütlesi değişen sistemlerde momentumlu biçim gerekir.', 'newton')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'newton');

-- ── cift-yarik ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Çift yarık deneyinde girişim deseni ne zaman kaybolur?', '["Işık kaynağı çok parlak olduğunda","Yarıklar birbirine çok yakın olduğunda","Parçacığın hangi yarıktan geçtiği ölçüldüğünde","Deney karanlıkta yapıldığında"]'::jsonb, 2, 'Ölçüm eylemi sonucu değiştirir: hangi yoldan gittiğini bildiğiniz anda desen yerini iki basit yığına bırakır.', 'cift-yarik'),
  ('Elektronlar teker teker, aralarında asla ikinci bir elektron olmayacak kadar yavaş gönderildiğinde ne görülür?', '["Ekranda yine girişim deseni birikir","Arkada iki basit yığın oluşur","Elektronlar ekrana hiç ulaşmaz","Desen yalnızca ilk birkaç elektronda görülür"]'::jsonb, 0, 'Girişecek bir arkadaşı olmayan tek parçacık, deseni tek başına kurar. Feynman kuantum fiziğinin tek gerçek gizemi derken bunu kastediyordu.', 'cift-yarik'),
  ('Maddenin de dalga gibi davrandığı deneysel olarak nasıl gösterildi?', '["Prizmayla ışığın renklere ayrılmasıyla","Fotoğraf plakasının kararmasıyla","Suda oluşan dalgaların ölçülmesiyle","Elektronların bir nikel kristalinde kırınıma uğramasıyla"]'::jsonb, 3, 'De Broglie''nin madde dalgası fikri böyle doğrulandı. Günlük nesnelerde bunu görmeyiz çünkü momentumları büyük olduğu için dalga boyları akıl almaz derecede küçüktür.', 'cift-yarik')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'cift-yarik');

-- ── fizik-101 ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Kütle ile ağırlık arasındaki fark nedir?', '["İkisi aynı şeydir, sadece birimleri farklıdır","Kütle yalnızca sıvılar için, ağırlık katılar için kullanılır","Ağırlık değişmez; kütle gezegene göre değişir","Kütle nerede olursan ol değişmez; ağırlık çekim kuvvetidir ve gezegene göre değişir"]'::jsonb, 3, 'Ay''da kütlen aynı kalır ama daha az çekildiğin için ağırlığın azalır. Birimleri de farklıdır: kilogram ve newton.', 'fizik-101'),
  ('Uzayda “ağırlıksız” olmak neyi değiştirmez?', '["Bir cismi itmenin zorluğunu","Terazide okunan değeri","Yere düşme hissini","Ayakta durabilmeyi"]'::jsonb, 0, 'Ağırlığın sıfıra inse de kütlen aynı kalır; kütle eylemsizliği belirlediği için uzayda da ağır bir cismi hızlandırmak zordur.', 'fizik-101'),
  ('1 newton''luk kuvvet ne kadardır?', '["1 kilogramı saniyede 10 metre hızlandıran kuvvet","Bir insanın kaldırabileceği en büyük kuvvet","1 kilogramlık kütleye 1 m/s² ivme veren kuvvet; kabaca orta boy bir elmanın ağırlığı","Bir metrelik mesafede yapılan iş"]'::jsonb, 2, 'Tanım doğrudan F = m·a''dan gelir. Elma benzetmesi büyüklüğü sezmeyi kolaylaştırır.', 'fizik-101')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'fizik-101');

-- ── takyon ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Takyon nedir?', '["Laboratuvarda 1960''larda gözlenmiş bir parçacık","Işık hızında giden kütlesiz bir parçacık","Kanıtı olmayan, hep ışıktan hızlı olduğu varsayılan farazi bir parçacık","Kara deliklerden yayılan bir radyasyon türü"]'::jsonb, 2, 'Sıradan madde ışık hızına asla ulaşamaz, foton hep ışık hızındadır; takyon ise varsayımsaldır ve ışık hızına yavaşlayamaz.', 'takyon'),
  ('Bir gölge ya da lazer beneği neden ışıktan hızlı “hareket” edebilir?', '["Gölge ışıktan daha hafif olduğu için","Gölge aslında ışıktan hızlı gitmez, bu bir yanılsamadır ve hiçbir şekilde ölçülemez","Karanlığın hızı ölçülemediği için","Gölge madde ya da bilgi taşımadığı, sadece ışığın yokluğu olduğu için"]'::jsonb, 3, 'Kural bilgi ve madde taşıyan şeyler için geçerlidir. Duvarda kayan gölge bir desendir, taşıyıcı değil.', 'takyon'),
  ('Çok uzak galaksilerin bizden ışıktan hızlı uzaklaşması kuralı nasıl bozmaz?', '["Galaksiler uzayın içinde değil, uzayın kendisi genişlediği için uzaklaşıyor","Bu galaksiler aslında takyondan yapılmıştır","Ölçümler o kadar uzakta güvenilir değildir","Işık o mesafede yavaşladığı için"]'::jsonb, 0, 'Genişleyen şey aradaki uzayın kendisi. Galaksiler uzayın İÇİNDE ışıktan hızlı gitmiyor, dolayısıyla görelilik ihlal edilmiyor.', 'takyon')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'takyon');

-- ── kuantum-olumsuzlugu ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Schrödinger kedisi deneyini ortaya atarken Schrödinger''in amacı neydi?', '["Kuantum kuramının doğruluğunu kanıtlamak","Ölçüm cihazlarının hassasiyetini artırmak","Kedilerin kuantum durumlarını incelemek","Kuramın bu kadar saçma bir sonuç vermesinin bir tuhaflığa işaret ettiğini göstermek"]'::jsonb, 3, 'Deney bir savunma değil, itirazdı. Ama yüz yıl sonra tuhaflık hâlâ yerinde duruyor: ölçmediğimizde dünya gerçekten bulanık mı?', 'kuantum-olumsuzlugu'),
  ('“Kuantum ölümsüzlüğü” fikri neyi öne sürer?', '["İnsanın kuantum teknolojisiyle sonsuza dek yaşayabileceğini","Ölümün kuantum düzeyinde geri alınabileceğini","Her ölümcül anda öldüğün dallarda bunu fark edecek bir “sen” kalmadığını, bilincin hayatta kaldığın dalda devam ettiğini","Bilincin ölümden sonra başka bir evrene taşındığının kanıtlandığını"]'::jsonb, 2, 'Dışarıdan bakan sizi ölmüş görür; içeriden asla ölmezsiniz. Makale bunun kanıtlanmış bir teori değil, tartışmalı bir düşünce deneyi olduğunu vurguluyor.', 'kuantum-olumsuzlugu'),
  ('Kopenhag yorumuna göre gözlem ne yapar?', '["Dalga fonksiyonunu çökertir: sayısız ihtimalden yalnızca biri gerçek olur","Parçacığı ikiye böler","Zamanın akışını yavaşlatır","Parçacığın kütlesini artırır"]'::jsonb, 0, 'Havada dönen yazı-tura gibi: ölçümden önce ikisinin ihtimali birlikte vardır, ölçüm anında biri gerçekleşir ve diğeri silinir.', 'kuantum-olumsuzlugu')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'kuantum-olumsuzlugu');

-- ── mol ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Kimyada “mol” neye yarar?', '["Sıvıların hacmini ölçmeye","Atomların büyüklüğünü ölçmeye","Sıcaklığı hesaplamaya","Tartılabilen gram ile sayılabilen tanecik arasında çeviri yapmaya"]'::jsonb, 3, 'Kimyager atomları tek tek sayamaz ama tartabilir. Mol, iki dünya arasındaki çevirmendir.', 'mol'),
  ('1 mol kaç tanedir?', '["1 milyon","Maddeye göre değişir","602 milyar","6,022 × 10²³"]'::jsonb, 3, 'Avogadro sayısı artık deneyle ölçülen değil, üzerinde anlaşılmış sabit bir sayıdır — tıpkı düzinenin 12 olması gibi.', 'mol'),
  ('Makaledeki “çuval” benzetmesi mol mantığını nasıl anlatır?', '["Birkaç taneyi sayıp tartarsın, sonra bütün çuvalı tartıp basit bir bölmeyle tane sayısını bulursun","Çuvalın hacmini ölçüp yoğunluğa bölersin","Taneleri renklerine göre ayırırsın","Çuvalı ısıtıp buharlaşan kısmı ölçersin"]'::jsonb, 0, 'Saymadan sayma yöntemi budur; kimya da atomlarla tam olarak bunu yapar.', 'mol')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'mol');

-- ── radyoaktivite ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Alfa ışıması hakkında hangisi doğrudur?', '["Kurşun levhaları bile kolayca geçer","Deri onu durdurur; ama yutulursa son derece tehlikelidir","Yalnızca uzay boşluğunda oluşur","Canlı dokuya hiçbir etkisi yoktur"]'::jsonb, 1, 'Litvinenko''yu öldüren polonyum-210 bir alfa yayıcısıydı. Dışarıda zararsız sayılan şey, içeri girdiğinde acımasız olabiliyor.', 'radyoaktivite'),
  ('Karbon-14 arkeolojide neden kullanılır?', '["Kemikleri sertleştirdiği için","Hızlı bozunup iz bırakmadığı için","Bir canlının ölümünden sonra karbonunun ne kadar tükendiğine bakılarak yaş hesaplanabildiği için","Toprakta hiç bulunmadığı için"]'::jsonb, 2, 'Ötzi''nin yaşını böyle biliyoruz: ölçülen şey kalan karbon-14 miktarı, yani geçen zamanın kendisi.', 'radyoaktivite'),
  ('Bir uranyum-238 atomunun 4,5 milyar yıldır bozunmamış olması, bozunma şansı için ne anlama gelir?', '["Bozunma şansı her geçen yıl azalır","Bozunma şansı zamanla artar, yakında bozunur","Yaşlandığı için artık bozunamaz","Önümüzdeki saniyede bozunma şansı hâlâ dünküyle aynıdır"]'::jsonb, 3, 'Radyoaktif bozunmanın hafızası yoktur: atom “yaşlanmaz”, her an aynı olasılıkla bozunur. Yarı ömür bir kalabalık istatistiğidir.', 'radyoaktivite')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'radyoaktivite');

-- ── dunya ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Dünya''nın iç çekirdeği bu kadar sıcak olmasına rağmen neden katıdır?', '["Sıcaklığı aslında düşüktür","Üzerindeki muazzam basınç atomları kenetlediği için sıvı hâle geçemez","Demir yerine kayadan oluştuğu için","Sürekli soğuduğu için"]'::jsonb, 1, 'Atmosferin yaklaşık 3,5 milyon katı basınç altında demir, normalde eriyeceği sıcaklıkta bile katı kalır.', 'dunya'),
  ('Altın ve platin gibi “demir-sever” değerli metaller neden hâlâ yerkabuğunda bulunabiliyor?', '["Çekirdeğe hiçbir zaman çekilmedikleri için","Volkanlar onları yukarı taşıdığı için","Çekirdek oluştuktan sonra Dünya''ya çarpan asteroit yağmuruyla geldikleri ve artık inemedikleri için","Kabuğun içinde kendiliğinden oluştukları için"]'::jsonb, 2, 'Teoride hepsinin çekirdeğe gömülmesi gerekirdi. Bugün çıkardığımız altın, geç gelen bir bombardımanın mantoda ve kabukta sıkışıp kalan mirası.', 'dunya'),
  ('İç gezegenlerin kayalık, dış gezegenlerin gaz devi olmasının sebebi nedir?', '["Güneş''e yakın sıcak bölgede uçucuların buharlaşması, uzaktaki soğuk bölgede gaz ve buzun bol kalması","Güneş''in manyetik alanının ağır elementleri dışarı itmesi","İç gezegenlerin daha sonra oluşması","Dış gezegenlerin başka bir yıldızdan gelmesi"]'::jsonb, 0, 'Gezegenler, Güneş oluştuktan sonra artan kütlenin yüzde birinden azından yapıldı; hangi maddenin nerede yoğunlaştığını sıcaklık belirledi.', 'dunya')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'dunya');

-- ── tardigrad ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Tardigradlar “tun” denen kuru hâle geçtiğinde ne olur?', '["Suyunun %95''inden fazlasını kaybedip toz topağına döner ve onlarca yıl bekleyebilir","Kabuk salgılayıp yumurtaya dönüşür","Vücut sıcaklığını yükseltip donmayı önler","İkiye bölünüp çoğalır"]'::jsonb, 0, 'Tek bir su damlası onu geri getirebiliyor. Bazı kayıtlarda bu bekleme 30 yılı aşıyor.', 'tardigrad'),
  ('Tardigradları uzay boşluğunda hayatta kalan ilk hayvan yapan deney neydi?', '["NASA''nın Ay yüzeyine bıraktığı numuneler","Avrupa Uzay Ajansı''nın onları doğrudan uzay boşluğuna çıkarması; 10 gün sonra Dünya''da canlandılar","Uluslararası Uzay İstasyonu''nda bir yıl tutulmaları","Mars''a gönderilen bir sonda"]'::jsonb, 1, 'Havasızlığa ve basınçsızlığa on gün dayandılar. Bunu başaran ilk hayvan oldular.', 'tardigrad'),
  ('Tardigradın yüksek radyasyona dayanmasını sağlayan mekanizma nedir?', '["Kalın bir dış kabuk","Radyasyonu yansıtan metalik pullar","DNA''yı saran Dsup proteini ve serbest radikalleri etkisizleştiren pigmentler","Radyasyonu enerjiye çeviren bir organel"]'::jsonb, 2, 'Bir insanı öldüren dozun yaklaşık bin katına dayanıyorlar; sır kalkanda değil, DNA''yı fiziksel olarak sarıp korumakta.', 'tardigrad')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'tardigrad');

-- ── bagirsak ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Bağırsak ile beyin arasındaki vagus siniri trafiği hangi yönde ağır basar?', '["Yaklaşık %90''ı bağırsaktan beyne doğrudur","Yaklaşık %90''ı beyinden bağırsağa doğrudur","İki yön tam olarak eşittir","Trafik yalnızca yemek sırasında oluşur"]'::jsonb, 0, 'Yani beyin bu sohbette çoğunlukla dinleyen taraf. Aşağıya emir de yollar, ama akışın ana yönü yukarıdır.', 'bagirsak'),
  ('Vücuttaki serotoninin yaklaşık %90''ı nerede üretilir?', '["Beyinde","Bağırsakta","Karaciğerde","Böbrek üstü bezinde"]'::jsonb, 1, 'Bu serotonin doğrudan beyne geçmez; etkisini vagus siniri üzerinden ruh hâli, iştah ve sindirim üzerinde gösterir.', 'bagirsak'),
  ('Lif neden bağırsak sağlığının merkezinde sayılır?', '["Mideyi doldurup iştahı kestiği için","Bağırsak duvarını mekanik olarak temizlediği için","Dost mikropların baş yakıtı olduğu, onların da karşılığında sağlıklı yağ asitleri ürettiği için","Suyu emip sindirimi yavaşlattığı için"]'::jsonb, 2, 'Beslediğiniz şey aslında mikroplarınız. Çeşitli beslenme ise mikrobiyomu çeşitlendirir; çeşitlilik dayanıklılık demektir.', 'bagirsak')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'bagirsak');

-- ── ayna-noronlari ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Ayna nöronları nasıl keşfedildi?', '["İnsan gönüllülerde MR taramasıyla","Parma''da bir makak maymununun premotor korteksindeki hücrelerin, maymun izlerken de ateşlenmesiyle","Fare deneylerinde ilaç testleri sırasında","Bilgisayar simülasyonlarıyla öngörülerek"]'::jsonb, 1, 'Hücrenin maymun üzüme uzanırken ateşlenmesi beklenendi; asıl sürpriz, maymun yalnızca izlerken de aynı hücrenin ateşlenmesiydi.', 'ayna-noronlari'),
  ('Ayna nöronunun temel mantığı nedir?', '["Bir eylemi gözlemlemek, o eylemi yapmakla ilgili motor devreyi kısmen etkinleştirir","Beyin gördüğü her şeyi hafızaya kaydeder","Duygular kaslara doğrudan aktarılır","Görme merkezi hareket merkezini bastırır"]'::jsonb, 0, 'Kol kımıldamadan, eylemin bir kopyası sessizce çalışır. Beyin dışarıdaki hareketi kendi eylem sözlüğüne çevirir.', 'ayna-noronlari'),
  ('Bu keşif neden devrimci sayıldı?', '["Beynin yeni bir bölgesini ortaya çıkardığı için","Beynin kendi eylemi ile başkasının eylemi arasındaki sınırı umursamadığını gösterdiği için","Maymunların konuşabildiğini kanıtladığı için","Motor korteksin görme işlevi olduğunu gösterdiği için"]'::jsonb, 1, 'Beynin başkalarını nasıl anladığına dair bir ipucuydu: anlamak, bir ölçüde içeride yeniden yapmak olabilir.', 'ayna-noronlari')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'ayna-noronlari');

-- ── tibbi ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Cerrahlar hasta tamamen uyanıkken beyin ameliyatı yapabiliyor. Bunun sebebi nedir?', '["Beyin ameliyatlarında güçlü lokal anestezi kullanılması","Beynin kendi içinde ağrı reseptörü taşımaması","Ameliyatın çok hızlı bitmesi","Hastanın hipnoz altında olması"]'::jsonb, 1, 'Vücudun ağrı merkezi kendi ağrısını hissetmez. Hasta uyanık olduğu için cerrah konuşma ve hareket merkezlerine zarar vermeden ilerleyebilir.', 'tibbi'),
  ('Penisilin nasıl keşfedildi?', '["Küf mantarları üzerinde planlanmış bir araştırma programıyla","Fleming tatilden döndüğünde küflenmiş bir Petri kabında, küfün çevresindeki bakterilerin eridiğini fark etmesiyle","Bir hastaya yanlış ilaç verilmesiyle","Antik bir reçetenin yeniden denenmesiyle"]'::jsonb, 1, 'Modern tıbbın en büyük dönüm noktalarından biri, temizlenmemiş bir cam kaptan çıktı.', 'tibbi'),
  ('Greyfurt bazı ilaçlarla neden birlikte alınmamalı?', '["İlaçların tadını bozduğu için","Mide asidini artırdığı için","Bağırsaktaki CYP3A4 enzimini bloke ettiği ve bu enzim onlarca ilacı parçalamakla görevli olduğu için","İlaçların emilimini tamamen durdurduğu için"]'::jsonb, 2, 'Enzim bloke olunca ilaç vücutta beklenenden fazla birikir; yani sorun etkisizlik değil, doz aşımı riskidir.', 'tibbi')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'tibbi');

-- ── bilgisayar ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Bir bilgisayar en temelde neye dayanır?', '["Milyarlarca minik elektrik anahtarının açık/kapalı (1 ve 0) hâlde çok hızlı işbirliği yapmasına","Manyetik disklerin dönmesine","Ekrandaki piksellerin yenilenmesine","İnternet bağlantısının hızına"]'::jsonb, 0, 'CPU, RAM, GPU gibi parçaların hepsi bu basit anahtar mantığının üst üste yığılmasıyla ortaya çıkar.', 'bilgisayar'),
  ('İşlemcinin saat hızı olan 3 GHz ne anlama gelir?', '["3 milyar bayt bellek","Saniyede yaklaşık 3 milyar adım","3 milyar transistör","Saniyede 3 milyar piksel"]'::jsonb, 1, 'Ritmi sistem kristali verir. Çok çekirdekli işlemcilerde bu adımlar aynı anda birden fazla hatta atılır.', 'bilgisayar'),
  ('Makaledeki benzetmeye göre CPU nasıl bir ofistir?', '["Çok sayıda çalışanı olan, herkesin aynı basit işi yaptığı bir ofis","Çalışanı olmayan, tamamen otomatik bir ofis","Çok zeki ama az sayıda çalışanı olan, karmaşık problemleri sırayla çözen bir ofis","Yalnızca veri saklayan bir arşiv"]'::jsonb, 2, 'Bu yüzden CPU karmaşık ve sıralı işlerde güçlüdür; aynı anda binlerce basit işlem gerektiren görevlerde ise GPU öne çıkar.', 'bilgisayar')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'bilgisayar');

-- ── sanat-akimlari ──
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('“İzlenimcilik” adı nereden geliyor?', '["Sanatçıların kendi seçtiği bir manifestodan","Eleştirmen Louis Leroy''un Monet''nin İzlenim, Gün Doğumu tablosuyla alay etmesinden","Bir müzenin sergi başlığından","Bir sanat okulunun adından"]'::jsonb, 1, 'Alay için takılan adı grup gururla sahiplendi. Sanat tarihinde birkaç akımın adı benzer şekilde hakaretten doğmuştur.', 'sanat-akimlari'),
  ('Duchamp''ın 1917''de pisuarı “Çeşme” adıyla sergiye göndermesi hangi soruyu değiştirdi?', '["“Bu iyi mi?” sorusunu “Bu neden sanat, kim karar veriyor?” sorusuna","“Bu pahalı mı?” sorusunu “Bu satılır mı?” sorusuna","“Bu eski mi?” sorusunu “Bu modern mi?” sorusuna","Hiçbir soruyu; eser görmezden gelindi"]'::jsonb, 0, 'Tartışma nesnenin güzelliğinden kurumun yetkisine kaydı: sanatı sanat yapan şey neydi, eser mi yoksa onu sergileyen çerçeve mi?', 'sanat-akimlari'),
  ('Sanat merkezinin Paris''ten New York''a geçmesinin sebebi makalede nasıl açıklanıyor?', '["Amerikan resminin estetik üstünlüğüyle","Paris''teki müzelerin kapanmasıyla","Totaliter rejimlerden kaçan sanatçıların göç dalgasıyla","Yeni boya tekniklerinin Amerika''da bulunmasıyla"]'::jsonb, 2, 'Avrupa''nın kaybı Amerika''nın kazancı oldu. Akımlar estetik yarıştan çok para, teknoloji, siyaset ve kurumların kesişiminde yer değiştirir.', 'sanat-akimlari')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'sanat-akimlari');

-- DOĞRULAMA: makale başına soru sayısı
--   select article_slug, count(*) from public.quiz_questions
--    where article_slug is not null group by 1 order by 1;