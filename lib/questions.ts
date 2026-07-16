// Her makalenin CEVAPLADIĞI soru — TEK KAYNAK (registry).
//
// Neden ayrı dosya: aynı soru iki yerde birden lazım ve ikisi ayrışırsa marka
// kendi kendiyle çelişir:
//   1. Ana sayfa landing'i (lib/landing.ts → HERO_DECK, WALL)
//   2. Paylaşım kartı  (lib/og.tsx → articleOgFor → og:image alt satırı)
// Önce ikisi de kendi kopyasını taşıyordu (ör. fatih'in sorusu HEM landing.ts'te
// HEM app/articles/fatih/opengraph-image.tsx'te birebir yazılıydı) → sessiz
// ayrışma riski. Artık tek yerden okunuyor.
//
// ══ YAZIM KURALI (standing rule — lib/landing.ts'ten taşındı, aynı kural) ══
// Soru makalenin İÇİNDEN çıkar, pazarlama için UYDURULMAZ.
// Test: makale o soruyu gerçekten cevaplıyor mu? Cevaplamıyorsa clickbait'tir,
// kullanılmaz. Sitenin kendi kuralı: SIFAT DEĞİL, SAYI.
//
// Pratik biçim sınırı: soru OG kartında 42px'te basılıyor (lib/og.tsx:53)
// → en fazla ~60 karakter. Uzunsa kart iki satıra taşar ve sıkışır.
//
// Not: string'ler BACKTICK — içindeki düz kesme (') kaçış istemez.
// (`Roma 476'da çöktüyse...` tek tırnakla yazılsaydı derleme kırılırdı.)

export const QUESTIONS: Record<string, string> = {
  /* ══════════ Ana sayfa destesinde olanlar (lib/landing.ts HERO_DECK) ══════════ */
  fatih: `Bir fikir bir insanı ne kadar ele geçirebilir?`,
  radyoaktivite: `Sen ne kadar radyoaktifsin?`,
  bagirsak: `Kararlarını gerçekten beynin mi veriyor?`,
  internet: `Bu sayfa sana nasıl ulaştı?`,
  newton: `Ay neden Dünya'ya düşmüyor?`,
  sezar: `Seni öldürecek adamları affeder miydin?`,
  tardigrad: `Uzayın boşluğunda hayatta kalan bir hayvan var. Nasıl?`,
  'cift-yarik': `Elektron, ona baktığını nereden biliyor?`,

  /* ══════════ Soru duvarında olanlar (lib/landing.ts WALL) ══════════ */
  'black-hole': `Bir kara deliğe düşsen ne hissederdin?`,
  mol: `Bir bardak suda kaç tane su var?`,
  pirus: `Kazandığın bir savaş seni nasıl bitirir?`,
  'dogal-secilim': `Bir avcı kadar iyi görebiliyor musun?`,
  bilgisayar: `Şu an baktığın ekranda tam olarak ne oluyor?`,
  'sanat-akimlari': `Bir akım neden doğar, neden ölür?`,

  /* ══════════ 2026-07-16'da eklendi — kendi OG kartı olmayan 14 makale ══════════
   * Her biri makalenin TAMAMI okunarak çıkarıldı; hiçbiri uydurulmadı.
   * Yorumlardaki kanıt = makalenin o soruyu cevapladığı yer. Soruyu değiştirirsen
   * kanıtı da yeniden doğrula, yoksa kural sessizce çiğnenir.
   */

  // KANIT content.ts:6 — «1958'de fizikçi William Higinbotham ... bir analog
  // bilgisayarı 5 inçlik bir osiloskop ekranına bağlayıp "Tennis for Two"yu yaptı».
  // Zincir aynı satırda kapanıyor: 1971 Computer Space → 1972 Pong → 1978 Space Invaders.
  // İkinci tekil şahıs kullanılmadı: makale soy bağını bilinçli hedge'liyor
  // («Çoğu kişi onu "video oyunlarının dedesi" sayar») — "senin oynadığın oyunlar
  // bundan doğdu" demek o hedge'i ezerdi.
  arcade: `Bir laboratuvar aleti oyun salonunu nasıl doğurdu?`,

  // KANIT content.ts:174 — «Birinin bardağı kavradığını gördüğünde, senin "bardağı
  // kavra" programının bir kopyası sessizce çalışır — kolun kımıldamadan.»
  // "sessizce" makalenin kendi kelimesi.
  // ⚠ Bilinçli olarak EMPATİ demiyor: makale hype'ı reddediyor (content.ts:247
  // «Empati ile ayna nöron etkinliği arasındaki bağ, meta-analizlerde zayıf çıkıyor»).
  // Soru makalenin TARTIŞMASIZ çekirdeğine dayanıyor (:247 «buna kimse itiraz etmiyor»)
  // → tartışma nasıl sonuçlanırsa sonuçlansın soru geçerli kalır.
  'ayna-noronlari': `Birini izlerken beynin sessizce ne yapıyor?`,

  // KANIT BakteriyofajClient.tsx:182 — makalenin AÇILIŞ cümlesi: «Şu an okuduğunuz
  // cümleyi bitirene kadar, dünya okyanuslarında yaklaşık 10²³ kez bir virüs bir
  // bakteriye saldırıp onu öldürdü.»
  // Tedavi vaadi YOK (faj terapisi makalede hâlâ "son çare" kapsamında) — saf ölçek sorusu.
  bakteriyofaj: `Bu cümleyi okurken kaç bakteri öldü?`,

  // KANIT CarthageClient.tsx:76 bölüm başlığı «Barıştaki Başarıları Yüzünden Yok
  // Edildiler» + :80 «Üçüncü Pön Savaşı'nı tetikleyen şey askeri bir tehdit değil,
  // Roma'nın ekonomik rekabetten duyduğu korku ve kıskançlıktı.» "ölüm fermanı"
  // makalenin kendi ifadesi (:113).
  // ⚠ Apolitik: edilgen, fail yok — ne Roma haklı ne Kartaca mağdur.
  // ⚠ pirus ile çakışmıyor: pirus `kazan-…seni…-ir?` iskeletinde, bu vecize kipinde.
  carthage: `Fazla zenginleşmek neden ölüm fermanı olur?`,

  // KANIT DopplerClient.tsx:258 — «Sirenin frekansı hiç değişmedi — senin konumun
  // değişti.» Aynı cevap :227 (hero), :146 (simülasyon altyazısı), :32 (quiz S1).
  // Cevap "sen"sin → cift-yarik'in "Elektron, ona baktığını nereden biliyor?"
  // kalıbıyla aynı türden çelişki.
  // ⚠ REDDEDİLEN aday: "Bir ambulans sireni evrenin genişlediğini nasıl kanıtladı?"
  // — makale sirenin genişlemeyi KANITLADIĞINI söylemiyor, aynı İLKENİN geçerli
  // olduğunu söylüyor. Cazip ama yalan olurdu.
  doppler: `Ambulans sireni değişmiyorsa, sesi kim değiştiriyor?`,

  // KANIT content.ts:6 — «…ışığın bile karşıya geçmesine fırsat kalmadan kapanır»
  // (Fuller & Wheeler 1962); cevap aynı satırda: «Yine de değersiz değiller.
  // Solucan delikleri, fizikçilerin uzay, zaman ve kütleçekimin sınırlarını test
  // ettiği güçlü düşünce deneyleridir.»
  // ⚠ VARLIK İDDİASI TAŞIMIYOR: makale açıkça «bilmiyoruz, ve şimdiye dek hiç
  // gözlemlenmedi» diyor; bölüm başlığı «İçinden geçebilir misin? (Kısa cevap: hayır)».
  // ⚠ black-hole'dan ayrı: o deneyimsel ("düşsen ne hissederdin"), bu kavramsal.
  'einstein-rosen': `Işık bile geçemeyen bir tünel ne işe yarar?`,

  // KANIT content.ts:6 — SWIFT maddesi, makalenin tek "Önemli ayrıntı:" etiketi:
  // «SWIFT parayı kendisi taşımaz; bankalara "şu parayı şuraya gönder" mesajını
  // standart formatta iletir.» İkinci kanıt content.ts:8 mini test: «SWIFT temelde
  // ne yapar?» Cevap beklentiyi ters yüz ediyor: para geçmiyor, MESAJ geçiyor.
  // ⚠ Makale bir SÖZLÜK (5 bölüm, ~30 terim) — tezi yok, o yüzden soru zorunlu
  // olarak Bölüm 03'ü temsil ediyor. Bilinçli taviz.
  // ⚠ REDDEDİLENLER: "10.000 lira 10 yılda kaça çıkar?" → yatırım tavsiyesi iması.
  // "Bankadaki paran neden eriyor?" → Türkiye bağlamında politik okunur + enflasyondan
  // korunma vaadi ima eder. İkisi de metinde cevaplı ama ikisi de kullanılamaz.
  ekonomi: `Gönderdiğin para sınırı nasıl geçiyor?`,

  // KANIT EndosimbiyozClient.tsx:303 — makalenin kendi blockquote'u: «Senin hücrenin
  // çekirdeği bir arkeden, enerji santralin ise bir bakteriden geliyor. Sen,
  // kelimenin tam anlamıyla, iki ayrı yaşam alanının birleşmesinden doğan bir
  // kimerasın.» + :13 «"iki organizma" demek anlamsızdır — onlar tek bir hücre olmuştur.»
  // ⚠ bagirsak ile çakışmıyor: o "kim karar veriyor?" (etki), bu "sen nesin?" (kimlik).
  // ⚠ REDDEDİLEN: "Karmaşık yaşam neden sadece bir kez doğdu?" — makale olguyu
  // söylüyor (:333) ama nedenini CEVAPLAMIYOR, spekülasyon bırakıyor → clickbait olurdu.
  endosimbiyoz: `Sen tek bir canlı mısın, yoksa iki mi?`,

  // KANIT GreeceClient.tsx:34-36 — İskender zaman çizelgesi: «MÖ 334 · Granikos ·
  // Anadolu'ya geçen İskender…» → «MÖ 331 · Gaugamela · Son büyük meydan savaşında
  // Pers İmparatorluğu'nu çökertti.» = 3 yıl. Sayı iki BASILI tarihin farkı.
  // ⚠ "Bir imparatorluk kaç yılda çöker?" biçimi REDDEDİLDİ: kart başlığı "Antik
  // Yunan" olduğu için okur YUNAN'ın çöküşü sanır (cevap Pers). Ayrıca rome'un
  // 476/1453 sorusuyla aynı "çöküş" ekseninde eko yapardı.
  // ⚠ Makalenin kendi manşeti "Demokrasinin beşiği" KULLANILAMADI: metinde Atina
  // demokrasisini anlatan tek cümle yok (tek "kanıt" :42'deki kaynaksız çubuk
  // `{label:'Demokrasi', athens:95}`). Kural gereği uydurulamaz.
  greece: `İskender bir imparatorluğu kaç yılda yıktı?`,

  // KANIT KaligrafiClient.tsx:17 — İbn Mukle: «yazıyı "göz kararı"ndan çıkarıp
  // orana oturttu: her harf, kalemin ürettiği baklava biçimli noktaya ve hayalî bir
  // daireye göre ölçülür.» Batı geleneğinde de sayıyla karşılanıyor (:398 «italik/
  // gotik ~45°, foundational ~30°»). "göz kararı" makalenin kendi ifadesi.
  // ⚠ "Güzel yazı" bir SIFAT → soru ona yaslanmıyor, ÖLÇÜYE yaslanıyor.
  // ⚠ Dinî hüküm/iddia yok.
  kaligrafi: `Harflerin ölçüsüne gözün mü karar verir?`,

  // KANIT RomeClient.tsx:372 — «bu tarih geleneksel olarak Batı Roma'nın sonu kabul
  // edilir. Ancak Doğu Roma (Bizans) İmparatorluğu … bin yıl daha yaşadı ve nihayet
  // MS 1453'te İstanbul'un fethiyle tarihe karıştı.» Olgu kutusu (:379) iki tarihi
  // de basıyor. Sıfır sıfat, iki sayı — kuralın harfi.
  // ⚠ fatih ile TARİH temas ediyor (1453) ama SORU çakışmıyor; kart başlığı "Roma
  // İmparatorluğu" olduğu için gerilim lehte çalışıyor (okur 1453'ü fetihle eşler,
  // Roma'yla eşlemez — kanca tam olarak bu). fatih'inki "obsesyon" ekseninde KALMALI.
  rome: `Roma 476'da çöktüyse 1453'te ne düştü?`,

  // KANIT TakyonClient.tsx:17 — «Duvar yeterince uzaksa gölge ışıktan hızlı hareket
  // edebilir — çünkü gölge bir "şey" değil, ışığın yokluğudur.» + :208 «tam ışık hızı
  // için sonsuz enerji gerekir. İşte bariyer bu.» + :347 asıl çözüm: «Takyonlar
  // tehlikelidir çünkü gerçek bilgi taşırlar. Gölge ve lazer beneği taşımaz.»
  // ⚠ TAKYONDAN SÖZ BİLE ETMİYOR — bilerek. Makale takyonların var olmadığını
  // söylüyor (:419 «Kısa cevap: Bildiğimiz kadarıyla hayır»), o yüzden "takyonla
  // geçmişe mesaj gönderebilir misin?" tipi her soru YALAN olurdu.
  // Cevap hem evet (gölge gerçekten aşar) hem hayır (sen aşamazsın) — aradaki fark
  // makalenin ana fikri.
  takyon: `Gölgen ışıktan hızlı gidebilir, sen neden gidemezsin?`,

  // KANIT content.ts:6 — vaka 23: «Ortalama bir yetişkinde kabaca 30 trilyon insan
  // hücresi ve 38 trilyon bakteri hücresi bulunuyor — yani sayıca neredeyse yarınız
  // bakteri.» (Sender, Fuchs & Milo 2016, Cell/PLOS Biology). Makale eski "10 kat"
  // rakamını da açıkça düzeltiyor → sayıyla, sıfatsız cevap.
  // ⚠ Makale bir LİSTE (25 bağımsız vaka) — hiçbir soru 25'ini birden açamaz;
  // bu dürüstçe TEK VAKANIN kancası, tez değil.
  // ⚠ ETİK ELEME: greyfurt-ilaç etkileşimi (ilaç kullanan okurda kaygı + tedavi
  // iması), plasebo (yanlış okunmaya açık), beyin ameliyatı (gereksiz kaygı) —
  // üçü de metinde cevaplı ama üçü de kullanılamaz. Mikrobiyom sağlıklı normal
  // biyoloji: korku üretmiyor, teşhis ima etmiyor.
  tibbi: `Kaç hücren gerçekten sana ait?`,

  // KANIT TurklerClient.tsx:34 Hafif Süvari «Kısa yay, hafif zırh, yüksek hız —
  // kovalayan düşmanı tuzağa düşür» + :33 Turan Taktiği «Sahte çekilme, çevirme
  // harekâtı, imha» + :31 Atlı Okçu «geriye dönük ok atma». Üçü birlikte cevaplıyor:
  // sahte çekilme → kovalarsın → hız farkı açığa çeker → geriye atış + çevirme.
  // ⚠ APOLİTİK — bu makale sitenin en hassas konusu. Millet adı, sıfat, hüküm YOK;
  // saf taktik mekanizması. Okuru KOVALAYAN (kandırılan) tarafa oturtuyor →
  // Sezar/Fatih serisinin yerleşik "okuru kandırılan yap" deseniyle aynı hat.
  // ⚠ REDDEDİLENLER: "4.000 yıl / 40+ devlet / 3 kıta" (hero :142) propaganda okunur;
  // km² düşüşü (9.000.000 → 783.356) çarpıcı ama makale mekanizmasını AÇIKLAMIYOR
  // → uydurma olurdu; Kayser-i Rûm (:206) zaten sezar/fatih'in kancası.
  // ⚠ SSR TUZAĞI: kanıtın tamamı `activeTab === 'war'` bloğunda (:287), varsayılan
  // sekme 'language' (:63) → savaş kartları SSR HTML'ine GİRMİYOR. Okur için sorun
  // değil (bir tık) ama crawler soruyu cevaplayan metni görmez. Ayrı iş.
  turkler: `Kaçan bir ordu seni nereye götürür?`,
};

/** Makalenin cevapladığı soru; kürate edilmemişse null (kart alt satırı desc'e düşer). */
export const questionFor = (slug: string): string | null => QUESTIONS[slug] ?? null;
