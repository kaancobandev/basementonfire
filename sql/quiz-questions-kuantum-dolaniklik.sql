-- "Kuantum Dolanıklık: Mesaj Göndermeyen Bağ" makalesinin quiz soruları.
--
-- Sorular KODA DEĞİL bu tabloya yazılır: ArticleQuiz bileşeni prop almaz,
-- slug'ı usePathname()'den türetip quiz_questions'tan okur. Böylece doğru
-- cevap yayınlanan HTML'de yer almaz.
--
-- ⚠ Doğru cevap indeksleri BİLEREK dağıtıldı (1,3,0,2,3,1).
--   Yeni soru yazınca `node scripts/quiz-siklari-dagit.mjs` ile kontrol et.
--
-- Idempotent: makalenin soruları zaten varsa hiçbir şey yazmaz.

insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  (
    'Dolanık iki parçacıktan birini ölçtüğünüzde uzaktaki arkadaşınıza mesaj gönderebilir misiniz?',
    '["Evet, ama yalnızca ışık hızında","Hayır — arkadaşınızın kendi verisinde göreceği hiçbir şey sizin ne yaptığınıza göre değişmez","Evet, ışıktan hızlı bile gönderebilirsiniz","Yalnızca iki parçacık 1 metreden yakınsa"]'::jsonb,
    1,
    'Buna mesajlaşamama teoremi deniyor. Siz de arkadaşınız da kendi tarafınızda rastgele sonuçlar görürsünüz; uyumu ancak sonradan telefonla konuşup listelerinizi yan yana koyunca fark edersiniz. O telefon da ışık hızını aşamaz. Caltech’ten Thomas Vidick’in özeti: iletişim olmadan korelasyon olabilir.',
    'kuantum-dolaniklik'
  ),
  (
    'Bell’in “Bertlmann’ın çorapları” mecazını kurmasının amacı neydi?',
    '["Dolanıklığın aslında çok basit olduğunu göstermek","Kuantum kuramının yanlış olduğunu kanıtlamak","Çorapların kuantum davrandığını göstermek","Okurun sezgisini önce kurup sonra deneyle yıkmak"]'::jsonb,
    3,
    'Bell mecazı savunmak için değil yıkmak için kurar. Çoraplar “cevap baştan belliydi” resmidir ve rahatlatıcıdır. Sonra Bell aynı mecazı genişletir — “peki ya çorapları 0, 45 ve 90 derecede yıkarsak?” — ve bu genişletmeden, cevapların önceden yazılı olduğu her modelin dışına çıkamayacağı bir sayısal sınır çıkarır.',
    'kuantum-dolaniklik'
  ),
  (
    'Mermin’in iki kutulu düzeneğinde, düğmeler farklı konumdayken gerçek deneyde ölçülen uyum oranı, talimat listesiyle karşılaştırıldığında nasıldır?',
    '["Daha DÜŞÜK: %25, oysa hiçbir talimat listesi %33,3’ün altına inemez","Daha yüksek: talimat listesinin ulaşamayacağı kadar çok uyum çıkar","Tamamen aynı, fark yalnızca istatistikseldir","Rastgele değişir, sabit bir değeri yoktur"]'::jsonb,
    0,
    'Bu, konunun en çok yapılan yön hatası. Dolanıklığı “korelasyon çok yüksek” diye anlatmak yarı yanlış: bu düzenekte uyum tavanı aşmaz, tabanın altına düşer. Sebebi neredeyse çocukça — üç düğme konumuna iki renk dağıtırsanız en az ikisi aynı olmak zorunda, bu da %33,3’lük bir taban doğuruyor. Doğru genel ifade her zaman aynı: hiçbir önceden anlaşmanın üretebileceği aralığın dışında.',
    'kuantum-dolaniklik'
  ),
  (
    'Kuantum ışınlama gerçekten yapılıyor. Peki neden ışık hızını aşmıyor?',
    '["Parçacıklar çok yavaş hareket ettiği için","Henüz teknoloji yeterince gelişmediği için","İşlem tamamlanabilmek için klasik kanaldan iki bit gönderilmesi zorunlu olduğu için","Aslında aşıyor, ama çok kısa mesafelerde"]'::jsonb,
    2,
    '1993’teki kurucu makalenin başlığı şartı zaten söylüyor: işlem HEM klasik HEM kuantum kanalı gerektiriyor. Ayrıca madde taşınmaz, yalnızca DURUM aktarılır ve orijinal durum kaynakta yok olur. Star Trek’teki ışınlayıcı bu değildir.',
    'kuantum-dolaniklik'
  ),
  (
    'Leibniz’in “önceden kurulmuş uyum” fikri (birbirine dokunmadan aynı anı gösteren iki saat) fizik diline çevrilince neye denk gelir?',
    '["Kuantum dolanıklığın ta kendisine","Mesajlaşamama teoremine","Süperpozisyona","Yerel gizli değişken modeline — yani deneyin elediği açıklamaya"]'::jsonb,
    3,
    'Kaynakta yazılmış talimat, yalnız yerel okuma. İronisi de bu: Einstein’ın kuantum kuramından istediği çözüm buydu ve Leibniz onu 250 yıl önce vermişti — deney ikisini birden eledi. Not: hiçbir filozof kuantum fiziğini önceden bilmedi; katkıları öngörü değil, doğru soruyu sormak.',
    'kuantum-dolaniklik'
  ),
  (
    '“Her şey birbirine dolanık, bu yüzden evrenle bağlantılıyız” iddiası neden yanlış?',
    '["Doğrudur, dolanıklık gerçekten evrensel bir bağdır","Bağın gücü bölüşülür, dekoherans ağı sürekli parçalar ve bağ üzerinden veri geçmez","Dolanıklık yalnızca laboratuvarda oluşur, doğada hiç görülmez","Çünkü dolanıklık yalnızca ışık parçacıkları arasında olur"]'::jsonb,
    1,
    'Üç ayrı sebeple çöküyor. Ve dikkat: “dolanıklık yalnızca laboratuvarda oluşur” demek de yanlış olurdu — dekoheransın kendisi kendiliğinden oluşan dolanıklıktır. Laboratuvarda hazırlanması gereken şey dolanıklık değil, İŞE YARAR dolanıklık. Zaten her şeyin çevresiyle dolanık olması, hiçbir şeyde kullanılabilir kuantumluk kalmamasının sebebi.',
    'kuantum-dolaniklik'
  )
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'kuantum-dolaniklik');
