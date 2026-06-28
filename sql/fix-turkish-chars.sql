-- ============================================================================
-- Basements — Bilgi Kartları + Günün Sorusu içeriğindeki eksik Türkçe
-- karakterleri (ı/ş/ğ/ü/ö/ç/İ) düzeltir. CANLI veriyi günceller.
-- Supabase SQL Editor'da BİR KEZ çalıştır. Idempotent: tekrar çalıştırmak
-- güvenli (eşleşme eski ASCII metne göre yapılır; düzeltildikten sonra no-op).
-- ============================================================================

-- ---- did_you_know (Bilgi Kartları) ----
update public.did_you_know set
  title = 'Mitokondri bir zamanlar bağımsız bir bakteriydi',
  body  = 'Hücrelerimize enerji üreten mitokondri, milyarlarca yıl önce serbest yaşayan bir bakteriydi. Başka bir hücre onu yuttu ama sindirmedi; ikisi ortak yaşamaya başladı. Bugün hâlâ kendi DNA''sını taşır.'
where title = 'Mitokondrin bir zamanlar bagimsiz bir bakteriydi';

update public.did_you_know set
  title = 'Dünyadaki en kalabalık biyolojik varlık bir virüstür',
  body  = 'Bakteriyofajlar bakterileri enfekte eden virüslerdir ve gezegendeki en kalabalık biyolojik varlıktır; sayıları 10^31 tahmin edilir. Okyanusta her saniye bakterilerin büyük kısmını öldürürler.'
where title = 'Dunyadaki en kalabalik biyolojik varlik bir virustur';

update public.did_you_know set
  title = 'Bir ambulansın sireni aslında hiç değişmez',
  body  = 'Ambulans yaklaşırken tiz, uzaklaşırken pes duyarsın; ama sirenin gerçek frekansı sabittir. Değişen şey ses dalgalarının sana ulaşma biçimidir. Buna Doppler etkisi denir.'
where title = 'Bir ambulansin sireni aslinda hic degismez';

update public.did_you_know set
  title = 'Evrenin genişlediğini bir renk kayması ele verdi',
  body  = 'Uzak galaksilerin ışığı kırmızıya kayar; yani bizden uzaklaşırlar. Edwin Hubble 1929''da bunu fark etti ve evrenin genişlediğini gösterdi. Bu da Doppler etkisinin ışıktaki hâlidir.'
where title = 'Evrenin genisledigini bir renk kaymasi ele verdi';

update public.did_you_know set
  title = 'Hat sanatını göz kararından matematiğe İbn Mukle taşıdı',
  body  = 'İslam hattını ölçülü bir sisteme oturtan kişi İbn Mukle''dir: harfleri bir noktanın katlarıyla oranlayarak güzelliği matematiğe bağladı.'
where title = 'Hat sanatini goz kararindan matematige Ibn Mukle tasidi';

-- ---- quiz_questions (Günün Sorusu havuzu) ----
update public.quiz_questions set
  question    = 'Bir ambulans yanınızdan geçerken aslında değişen nedir?',
  options     = '["Sirenin gerçek frekansı","Sesin size ulaşma biçimi (duyduğunuz frekans)","Havanın sıcaklığı","Sirenin ses düzeyi"]'::jsonb,
  explanation = 'Kaynağın gerçek frekansı sabittir; hareket, dalgaların size ulaşma biçimini değiştirir. Buna Doppler etkisi denir.'
where question = 'Bir ambulans yaninizdan gecerken aslinda degisen nedir?';

update public.quiz_questions set
  question    = 'Işıkta "maviye kayma" ne anlama gelir?',
  options     = '["Kaynak bizden uzaklaşıyor","Kaynak bize yaklaşıyor (dalga boyu kısalır)","Kaynak duruyor","Kaynak ısınıyor"]'::jsonb,
  explanation = 'Maviye kayma kaynağın yaklaştığını, kırmızıya kayma uzaklaştığını gösterir.'
where question = 'Isikta "maviye kayma" ne anlama gelir?';

update public.quiz_questions set
  question    = 'Evrenin genişlediği fikri hangi gözlemden doğdu?',
  options     = '["Ayın evrelerinden","Uzak galaksilerin kırmızıya kaymasından (Hubble, 1929)","Güneş lekelerinden","Meteor yağmurlarından"]'::jsonb,
  explanation = 'Hubble uzak galaksilerin ışığının kırmızıya kaydığını ölçerek evrenin genişlediğini gösterdi.'
where question = 'Evrenin genisledigi fikri hangi gozlemden dogdu?';

update public.quiz_questions set
  question    = 'Hücrelerimizdeki mitokondrinin kökeni nedir?',
  options     = '["Çekirdeğin bir parçası","Bir zamanlar serbest yaşayan bir bakteri","Bir virüs","Cansız bir kristal"]'::jsonb,
  explanation = 'Endosimbiyotik kurama göre mitokondri, yutulup sindirilmeyen bir bakteriden gelir.'
where question = 'Hucrelerimizdeki mitokondrinin kokeni nedir?';

update public.quiz_questions set
  question    = 'Endosimbiyotik kuramı kanıtlarıyla kabul ettiren bilim insanı kimdir?',
  options     = '["Charles Darwin","Lynn Margulis","Gregor Mendel","Louis Pasteur"]'::jsonb,
  explanation = 'Lynn Margulis 1960''larda kuramı kanıtlarla savunup bilim dünyasına kabul ettirdi.'
where question = 'Endosimbiyotik kurami kanitlariyla kabul ettiren bilim insani kimdir?';

update public.quiz_questions set
  question    = 'Bakteriyofaj nedir?',
  options     = '["İnsanı enfekte eden bir bakteri","Bakterileri enfekte eden bir virüs","Bir antibiyotik türü","Bir mantar"]'::jsonb,
  explanation = 'Faj, bakteri yiyen (enfekte eden) bir virüstür.'
where question = 'Bakteriyofaj nedir?';

update public.quiz_questions set
  question    = 'Litik döngünün sonunda bakteriye ne olur?',
  options     = '["Sağlıklı kalır","Lizin enzimiyle patlar ve yüzlerce faj saçılır","Daha hızlı çoğalır","Antibiyotiğe dönüşür"]'::jsonb,
  explanation = 'Litik döngüde konak hücre parçalanır (lizis) ve yeni fajlar saçılır.'
where question = 'Litik dongunun sonunda bakteriye ne olur?';

update public.quiz_questions set
  question    = '"Kaligrafi" kelimesi hangi köklerden gelir?',
  options     = '["Latince calidus + grafia","Yunanca kallos (güzellik) + graphein (yazmak)","Arapça hat + hüsn","Çince shu + fa"]'::jsonb,
  explanation = 'Kaligrafi = kallos (güzellik) + graphein (yazmak).'
where question = '"Kaligrafi" kelimesi hangi koklerden gelir?';

update public.quiz_questions set
  question    = 'İslam hattını ölçülü bir matematiksel sisteme oturtan kişi kimdir?',
  options     = '["Yakut el-Mustasimi","İbn Mukle","Şeyh Hamdullah","Hafız Osman"]'::jsonb,
  explanation = 'İbn Mukle harfleri bir noktanın katlarıyla oranlayan ölçülü hat sistemini kurdu.'
where question = 'Islam hattini olculu bir matematiksel sisteme oturtan kisi kimdir?';

update public.quiz_questions set
  question    = 'Mitokondrinin bakteriyel kökenine aşağıdakilerden hangisi KANIT DEĞİLDİR?',
  options     = '["Kendi halkasal DNA''sı","70S bakteriyel ribozomları","Çekirdekte kromozomlara paketlenmiş DNA''sı","Çift zarı"]'::jsonb,
  explanation = 'Mitokondrinin DNA''sı halkasaldır ve çekirdekten bağımsızdır; kromozomlara paketli değildir.'
where question = 'Mitokondrinin bakteriyel kokenine asagidakilerden hangisi KANIT DEGILDIR?';
