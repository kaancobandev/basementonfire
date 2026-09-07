-- "Zihnini Yükleyebilir misin?" makalesinin quiz soruları.
--
-- Sorular KODA DEĞİL bu tabloya yazılır: ArticleQuiz bileşeni prop almaz,
-- slug'ı usePathname()'den türetip quiz_questions'tan okur. Böylece doğru
-- cevap yayınlanan HTML'de yer almaz.
--
-- ⚠ Doğru cevap indeksleri BİLEREK dağıtıldı (2,0,3,1,3,0). Bir dönem
--   doğru cevabın %81'i B çıkmıştı; yeni soru yazınca
--   `node scripts/quiz-siklari-dagit.mjs` ile dağılımı yine de kontrol et.
--
-- Idempotent: makalenin soruları zaten varsa hiçbir şey yazmaz.

insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  (
    'Matrix filminde insanların zihnine tam olarak ne oluyor?',
    '["Zihinleri bilgisayara yükleniyor ve bedenleri imha ediliyor","Bilinçleri makinelerin ortak ağına kopyalanıyor","Beyinleri kendi kafataslarında kalıyor; makineler yalnızca duyusal girdi besliyor","Beyinleri çıkarılıp yapay bir gövdeye naklediliyor"]'::jsonb,
    2,
    'Matrix bir zihin yükleme filmi değil. İnsanların biyolojik beyinleri kapsüllerde, kendi kafataslarında durur — bu bir “fanustaki beyin” senaryosudur, yani yüklemenin tersi. Bağlanmak ile aktarılmak apayrı iki iddiadır: birincisi bugün kısmen yapılıyor, ikincisi hiçbir ölçekte yapılmadı.',
    'zihin-yukleme'
  ),
  (
    '“Beyni bilgisayara aktarmak” sorusunun içindeki üç sorudan hangisi ölçümle çözülemez?',
    '["Çalışan kopyanın “ben” olup olmadığı","Beynin bağlantı haritasının çıkarılıp çıkarılamayacağı","Haritanın bir bilgisayarda çalıştırılıp çalıştırılamayacağı","Gereken hesaplama gücünün ne kadar olduğu"]'::jsonb,
    0,
    'Haritalama bir mühendislik, çalıştırma bir bilim sorusudur; ikisi de ölçülür. Kimlik sorusu ise deneyle çözülemez ve bu bir yorum değil, alanın kendi kararı: 2008 tarihli kanonik yol haritası en üstteki üç seviyeyi — toplumsal rol, öznel deneyim ve kişisel kimlik — incelemeyi açıkça reddeder, çünkü bunlar “işlevsel hale getirilemez”.',
    'zihin-yukleme'
  ),
  (
    '302 nöronlu solucanda 23.433 nöron çifti tek tek uyarılıp ölçüldüğünde ne bulundu?',
    '["Bağlantı haritası sinyal yayılımını kusursuz öngördü","Solucanın konnektomunun eksik çıkarıldığı anlaşıldı","Nöronların yarısının hiç sinyal iletmediği görüldü","Sinyal yayılımı, anatomiden yapılan tahminlerden saptı"]'::jsonb,
    3,
    'Konnektom bir kablolama şemasıdır: içinde hiçbir kablonun direnci, hiçbir çipin modeli, ortamdaki hiçbir kimyasal yazmaz. Nöronlar birbirine yalnız “kablolarla” değil, elektron mikroskobunda görünmeyen kimyasallarla da konuşuyor. Bu bir tahmin değil, 2023’te Nature’da yayımlanan bir ölçüm.',
    'zihin-yukleme'
  ),
  (
    '2024’te haritalanan bir milimetreküp insan korteksi (1,4 petabayt), bütün beynin yaklaşık ne kadarına denk geliyor?',
    '["Yüzde biri","Milyonda biri","Binde biri","Yüz binde biri"]'::jsonb,
    1,
    'İçinde ~57.000 hücre ve ~150 milyon sinaps bulunan, hacmi bir milimetreküpe denk gelen o doku dilimi bütün beynin yaklaşık milyonda biri. Asıl haber mutlak sayı değil eğim: yeniden oluşturulan nöron başına maliyet 16.500 dolardan ~100 dolara indi.',
    'zihin-yukleme'
  ),
  (
    '312 sinirbilimciye sorulduğunda, bir insan beyninin emülasyonu için verilen medyan yıl tahmini ne çıktı?',
    '["2045","2060","2080","2125"]'::jsonb,
    3,
    'Aynı ankette solucan için medyan 2045, fare için 2065 çıktı. Yani Kurzweil’ın meşhur “2045”inde alan solucanı bekliyor, insanı değil. Anketin yazarları beyin koruma sektöründen — ama sonuç fonlayanı pohpohlamadığı için çıkar beyanı burada güveni artırıyor.',
    'zihin-yukleme'
  ),
  (
    'Beyinde nöronlardan on kat fazla glia hücresi olduğu iddiası için doğru olan hangisi?',
    '["Yanlış: oran yaklaşık 1:1, ama nöron sayısının kendisi de hâlâ kesin bilinmiyor","Doğru: ölçümlerle defalarca doğrulandı","Yanlış: glia hücresi diye ayrı bir hücre tipi yok","Doğru, ama yalnızca korteks için geçerli"]'::jsonb,
    0,
    'Ölçüm ~86,1 milyar nöron ve ~84,6 milyar nöron-dışı hücre veriyor, yani oran 1:1 civarı. Ama kuruntuyu düzelten sayının kendisi de denetlenmemiş: o ölçüm dört erkek bedenden yapıldı, istatistiksel aralık 73–99 milyar. Dürüst cümle şu: 10:1 oranı kesinlikle yanlış, nöron sayısı ise hâlâ bilinmiyor.',
    'zihin-yukleme'
  )
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'zihin-yukleme');
